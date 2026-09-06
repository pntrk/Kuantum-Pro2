import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  CloudCheck, 
  CloudUpload, 
  CloudDownload, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  LogOut, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Info,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogle, 
  signOutFromGoogle, 
  findDriveBackupFile, 
  downloadDriveBackupFile, 
  uploadDriveBackupFile, 
  DriveFileInfo,
  GoogleDriveApiError
} from '../services/googleDriveService';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  accessToken: string | null;
  onAuthSuccess: (user: User, token: string) => void;
  onAuthLogout: () => void;
  getCurrentAppData: () => any;
  onApplyCloudData: (cloudData: any) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  accessToken,
  onAuthSuccess,
  onAuthLogout,
  getCurrentAppData,
  onApplyCloudData,
  showToast
}) => {
  const [loading, setLoading] = useState(false);
  const [driveFileInfo, setDriveFileInfo] = useState<DriveFileInfo | null>(null);
  const [checkingDrive, setCheckingDrive] = useState(false);
  const [driveApiError, setDriveApiError] = useState<GoogleDriveApiError | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'upload' | 'download';
    title: string;
    description: string;
  } | null>(null);

  const [authError, setAuthError] = useState<{
    code?: string;
    message: string;
    details?: string;
    domain?: string;
  } | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);

  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('kuantum_drive_autosync') === 'true';
  });

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('kuantum_drive_last_sync');
  });

  // Check Drive for existing backup when opened & authenticated
  useEffect(() => {
    if (isOpen && accessToken) {
      checkDriveStatus(accessToken);
    }
  }, [isOpen, accessToken]);

  const checkDriveStatus = async (token: string) => {
    setCheckingDrive(true);
    setDriveApiError(null);
    try {
      const file = await findDriveBackupFile(token);
      setDriveFileInfo(file);
    } catch (err: any) {
      console.warn('Drive kontrol hatası:', err);
      setDriveApiError({
        name: err.name || 'DriveError',
        message: err.message || 'Google Drive kontrol edilemedi.',
        status: err.status,
        code: err.code,
        rawMessage: err.rawMessage,
        isApiDisabled: err.isApiDisabled,
        isScopeInsufficient: err.isScopeInsufficient,
        isTokenExpired: err.isTokenExpired,
        helpLink: err.helpLink
      });
    } finally {
      setCheckingDrive(false);
    }
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    localStorage.setItem('kuantum_drive_autosync', enabled ? 'true' : 'false');
    showToast(
      enabled 
        ? 'Otomatik Drive senkronizasyonu aktif edildi.' 
        : 'Otomatik senkronizasyon kapatıldı.'
    );
  };

  const handleSignIn = async () => {
    setAuthError(null);
    setDriveApiError(null);
    setLoading(true);
    try {
      const { user, accessToken: token } = await signInWithGoogle();
      onAuthSuccess(user, token);
      showToast(`Hoş geldiniz, ${user.displayName || user.email}! Google Drive bağlandı.`);
      await checkDriveStatus(token);
    } catch (error: any) {
      console.error('Login error:', error);
      const errCode = error?.code || '';
      let userMsg = error.message || 'Google ile giriş yapılamadı.';
      let details = '';
      const currentHost = window.location.hostname;

      if (errCode === 'auth/unauthorized-domain') {
        userMsg = 'Yetkisiz Alan Adı (Authorized Domain)';
        details = `Bu alan adı ("${currentHost}") Firebase projesinin yetkili alan adları listesinde henüz ekli değil. Google girişinin çalışması için bu adresin Firebase Konsolu'nda yetkilendirilmesi gerekir.`;
      } else if (errCode === 'auth/popup-blocked') {
        userMsg = 'Açılır Pencere Engellendi';
        details = 'Tarayıcınız Google giriş penceresini engelledi. Lütfen adres çubuğundaki kalkan veya açılır pencere simgesine tıklayarak izin verin.';
      } else if (errCode === 'auth/popup-closed-by-user') {
        userMsg = 'Giriş İptal Edildi';
        details = 'Google giriş penceresi işlem tamamlanmadan kapatıldı.';
      }

      setAuthError({
        code: errCode,
        message: userMsg,
        details,
        domain: currentHost
      });
      showToast(userMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutFromGoogle();
      onAuthLogout();
      setDriveFileInfo(null);
      setDriveApiError(null);
      showToast('Google oturumu kapatıldı.');
    } catch (error: any) {
      showToast('Çıkış yapılırken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Ensure an active token exists, prompting login seamlessly if needed
  const getOrRenewToken = async (): Promise<string | null> => {
    if (accessToken) return accessToken;
    try {
      showToast('Google Drive erişim izni doğrulanıyor...', 'info');
      const { user, accessToken: freshToken } = await signInWithGoogle();
      onAuthSuccess(user, freshToken);
      return freshToken;
    } catch (err: any) {
      setDriveApiError({
        name: 'AuthError',
        message: err.message || 'Google Drive erişim izni alınamadı.',
        isTokenExpired: true
      });
      showToast(err.message || 'Google oturumu doğrulanamadı.', 'warning');
      return null;
    }
  };

  // Perform Upload to Google Drive
  const executeUpload = async () => {
    setDriveApiError(null);
    setLoading(true);

    const token = await getOrRenewToken();
    if (!token) {
      setLoading(false);
      setConfirmModal(null);
      return;
    }

    try {
      const currentData = getCurrentAppData();
      const updatedMeta = await uploadDriveBackupFile(
        token, 
        currentData, 
        driveFileInfo?.id
      );

      setDriveFileInfo(updatedMeta);
      const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      localStorage.setItem('kuantum_drive_last_sync', nowStr);
      
      showToast('Program verileri ve nöbet planı Google Drive\'a başarıyla kaydedildi!');
      setConfirmModal(null);
    } catch (error: any) {
      console.error('Drive upload error:', error);
      setDriveApiError({
        name: error.name || 'UploadError',
        message: error.message || 'Drive\'a kaydetme başarısız oldu.',
        status: error.status,
        code: error.code,
        rawMessage: error.rawMessage,
        isApiDisabled: error.isApiDisabled,
        isScopeInsufficient: error.isScopeInsufficient,
        isTokenExpired: error.isTokenExpired,
        helpLink: error.helpLink
      });
      showToast(error.message || 'Drive\'a kaydetme başarısız oldu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Perform Download from Google Drive
  const executeDownload = async () => {
    setDriveApiError(null);
    setLoading(true);

    const token = await getOrRenewToken();
    if (!token) {
      setLoading(false);
      setConfirmModal(null);
      return;
    }

    if (!driveFileInfo?.id) {
      showToast('İndirilecek bir Drive yedek dosyası bulunamadı.', 'warning');
      setLoading(false);
      setConfirmModal(null);
      return;
    }

    try {
      const cloudData = await downloadDriveBackupFile(token, driveFileInfo.id);
      onApplyCloudData(cloudData);

      const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      localStorage.setItem('kuantum_drive_last_sync', nowStr);

      showToast('Google Drive\'daki veriler başarıyla cihazınıza yüklendi!');
      setConfirmModal(null);
      onClose();
    } catch (error: any) {
      console.error('Drive download error:', error);
      setDriveApiError({
        name: error.name || 'DownloadError',
        message: error.message || 'Drive\'dan veri çekme başarısız oldu.',
        status: error.status,
        code: error.code,
        rawMessage: error.rawMessage,
        isApiDisabled: error.isApiDisabled,
        isScopeInsufficient: error.isScopeInsufficient,
        isTokenExpired: error.isTokenExpired,
        helpLink: error.helpLink
      });
      showToast(error.message || 'Drive\'dan veri çekme başarısız oldu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden flex flex-col my-auto"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 border border-white/10">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Google Drive Senkronizasyonu
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Bilgisayar ve telefon arasında kesintisiz veri eşitleme
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Unauthenticated State */}
          {!currentUser ? (
            <div className="space-y-5">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Google Hesabınızı Bağlayın
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                    Ders programı ve nöbet listelerinizi kendi Google Drive alanınıza tek tıkla kaydedin. 
                    Telefondan açtığınızda kaldığınız yerden aynı verilerle devam edin.
                  </p>
                </div>

                {/* Official Google Sign-In Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed group touch-manipulation"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>{loading ? 'Giriş Yapılıyor...' : 'Google ile Giriş Yap'}</span>
                  </button>
                </div>

                {/* Auth Error Banner with Actionable Solution */}
                {authError && (
                  <div className="text-left bg-rose-50 border border-rose-200 rounded-xl p-3.5 sm:p-4 space-y-2.5 mt-3 shadow-xs">
                    <div className="flex items-start gap-2.5 text-rose-800">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-rose-900">{authError.message}</div>
                        <div className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">{authError.details}</div>
                      </div>
                    </div>

                    {authError.code === 'auth/unauthorized-domain' && (
                      <div className="bg-white/90 border border-rose-200 rounded-lg p-3 text-[11px] text-slate-700 space-y-2.5 mt-1">
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                          <span>🛠️ Çözüm (1 Dakika):</span>
                          <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            Firebase Yetkisi Gerekli
                          </span>
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          Google ve Firebase, güvenlik amacıyla canlıya aldığınız Vercel alan adının (<strong>{authError.domain}</strong>) sizin projenize ait olduğunu onaylamanızı ister:
                        </p>

                        <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-medium">Eklenecek Alan Adı:</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (authError.domain) {
                                  navigator.clipboard.writeText(authError.domain);
                                  setDomainCopied(true);
                                  setTimeout(() => setDomainCopied(false), 2000);
                                  showToast('Alan adı kopyalandı!');
                                }
                              }}
                              className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-300 transition-colors"
                            >
                              {domainCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                              <span>{domainCopied ? 'Kopyalandı!' : 'Kopyala'}</span>
                            </button>
                          </div>
                          <code className="block bg-white text-indigo-800 font-mono font-bold text-xs p-1.5 rounded border border-slate-200 select-all break-all">
                            {authError.domain}
                          </code>
                        </div>

                        <ol className="list-decimal list-inside space-y-1.5 font-medium text-slate-700 pl-0.5">
                          <li>
                            <a 
                              href="https://console.firebase.google.com/project/gen-lang-client-0413349668/authentication/settings" 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-indigo-600 hover:text-indigo-800 underline font-bold inline-flex items-center gap-1"
                            >
                              Firebase Konsolu &gt; Authentication &gt; Settings
                              <ExternalLink className="w-3 h-3 inline" />
                            </a> sayfasına gidin.
                          </li>
                          <li>
                            <strong>"Authorized domains" (Yetkili alan adları)</strong> sekmesindeki <strong>"Add domain" (Alan adı ekle)</strong> butonuna basın.
                          </li>
                          <li>
                            Yukarıda kopyaladığınız adresi (<code>{authError.domain}</code>) yapıştırıp <strong>Ekle</strong> butonuna tıklayın.
                          </li>
                        </ol>

                        <p className="text-[10px] text-slate-500 italic pt-0.5">
                          Ekledikten sonra sayfayı yenileyip tekrar Google ile Giriş Yapabilirsiniz.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">%100 Güvenli & Size Özel</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Verileriniz yalnızca kendi Google Drive hesabınızda saklanır, üçüncü taraf sunuculara gitmez.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Telefonda Anında Erişim</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Bilgisayarda hazırlayın, telefondan anında nöbet ve ders programınızı görüntüleyin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Authenticated State */
            <div className="space-y-4">
              {/* User Profile Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200/90 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || ''} 
                      className="w-10 h-10 rounded-full border-2 border-indigo-500/30 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                      <span>{currentUser.displayName || 'Google Kullanıcısı'}</span>
                      {accessToken ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Bağlandı &amp; Hazır
                        </span>
                      ) : (
                        <button
                          onClick={handleSignIn}
                          disabled={loading}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition-colors"
                          title="Drive erişim yetkisini yenilemek için tıklayın"
                        >
                          <span>Yetki Yenilenmeli</span>
                          <RefreshCw className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{currentUser.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!accessToken && (
                    <button
                      onClick={handleSignIn}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors touch-manipulation"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Yetkiyi Yenile</span>
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors touch-manipulation"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>

              {/* Drive API Diagnostic Banner */}
              {driveApiError && (
                <div className="bg-amber-50/95 border-2 border-amber-300 rounded-xl p-3.5 sm:p-4 text-left space-y-3 shadow-sm animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center justify-between gap-2 flex-wrap">
                        <span>
                          {driveApiError.isApiDisabled 
                            ? 'Google Cloud: Drive API Etkinleştirilmesi Gerekiyor'
                            : driveApiError.isScopeInsufficient
                              ? 'Google Drive Dosya İzni Verilmedi'
                              : driveApiError.isTokenExpired
                                ? 'Drive Oturum Süresi Doldu'
                                : 'Google Drive Bağlantı Uyarısı'}
                        </span>
                        {driveApiError.status && (
                          <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                            HTTP {driveApiError.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-amber-900 mt-1 leading-relaxed">
                        {driveApiError.isApiDisabled ? (
                          <>
                            Google ile giriş yaptınız ancak Google Cloud konsolunuzda (<strong>gen-lang-client-0413349668</strong>) <strong>Google Drive API</strong> henüz açık değil. Google, yedek dosyası oluşturabilmeniz için bu servisi 1 kez etkinleştirmenizi şart koşar.
                          </>
                        ) : driveApiError.isScopeInsufficient ? (
                          <>
                            Google giriş penceresinde Kuantum Pro'nun Google Drive dosyalarına erişmesine izin verilmedi. Lütfen aşağıdaki butona tıklayıp Drive izin kutucuğunu onaylayın.
                          </>
                        ) : (
                          driveApiError.message
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actionable Resolution Steps */}
                  {driveApiError.isApiDisabled && (
                    <div className="bg-white/95 border border-amber-300 rounded-lg p-3 text-[11px] space-y-2 text-slate-800">
                      <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                        <span>🛠️ Çözüm (Tek Tıkla 30 Saniye):</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200">
                          Google Cloud Console
                        </span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-700 font-medium">
                        <li>
                          Aşağıdaki <strong>"Google Drive API'yi Etkinleştir"</strong> butonuna tıklayarak doğrudan ayar sayfasını açın:
                        </li>
                        <li>
                          Sayfadaki mavi <strong>"ETKİNLEŞTİR" (ENABLE)</strong> butonuna basın.
                        </li>
                        <li>
                          Bu ekrana geri dönüp <strong>"Drive'a Şimdi Kaydet"</strong> butonuna tıklayarak yedeklemenizi tamamlayın!
                        </li>
                      </ol>
                      <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                        <a
                          href={driveApiError.helpLink || "https://console.cloud.google.com/apis/library/drive.googleapis.com?project=gen-lang-client-0413349668"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          <span>Google Drive API'yi Etkinleştir</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => accessToken && checkDriveStatus(accessToken)}
                          disabled={checkingDrive}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${checkingDrive ? 'animate-spin' : ''}`} />
                          <span>Tekrar Kontrol Et</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {driveApiError.isScopeInsufficient && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>İzinleri Yeniden İste &amp; Giriş Yap</span>
                      </button>
                    </div>
                  )}

                  {driveApiError.isTokenExpired && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Oturumu Yenile</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Drive File Status */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Drive Bulut Durumu
                    </span>
                  </div>
                  <button
                    onClick={() => accessToken && checkDriveStatus(accessToken)}
                    disabled={checkingDrive}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    title="Yenile"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingDrive ? 'animate-spin' : ''}`} />
                    <span>Kontrol Et</span>
                  </button>
                </div>

                {driveFileInfo ? (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-900 space-y-1">
                    <div className="font-semibold flex items-center justify-between">
                      <span className="truncate">📁 {driveFileInfo.name}</span>
                      <span className="text-[11px] text-emerald-700 font-mono">Hazır</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Son Kayıt:{' '}
                        {new Date(driveFileInfo.modifiedTime).toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                    Google Drive hesabınızda henüz kayıtlı bir Kuantum Pro2 yedeği bulunamadı. 
                    Aşağıdaki <strong>"Drive'a Şimdi Kaydet"</strong> butonuna basarak ilk yedeğinizi oluşturabilirsiniz.
                  </div>
                )}

                {lastSyncTime && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                    <span>Bu cihazda son işlem saati:</span>
                    <span className="font-semibold text-slate-700">{lastSyncTime}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Save to Drive */}
                <button
                  onClick={() => {
                    setConfirmModal({
                      type: 'upload',
                      title: "Google Drive'a Kaydet",
                      description: driveFileInfo
                        ? "Google Drive'daki mevcut yedek dosyasının üzerine güncel program ve nöbet verileriniz yazılacaktır. Devam etmek istiyor musunuz?"
                        : "Mevcut ders ve nöbet verileriniz Google Drive hesabınıza yeni bir dosya olarak kaydedilecektir."
                    });
                  }}
                  disabled={loading}
                  className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 touch-manipulation"
                >
                  <CloudUpload className="w-4 h-4 shrink-0" />
                  <span>Drive'a Şimdi Kaydet</span>
                </button>

                {/* Load from Drive */}
                <button
                  onClick={() => {
                    if (!driveFileInfo) {
                      showToast("Google Drive'da yüklenecek bir dosya bulunmuyor.", 'warning');
                      return;
                    }
                    setConfirmModal({
                      type: 'download',
                      title: "Google Drive'dan Yükle",
                      description: "DİKKAT: Google Drive'daki en son veriler indirilecek ve bu cihazdaki mevcut çalışma alanınızın üzerine yazılacaktır. Devam etmek istiyor musunuz?"
                    });
                  }}
                  disabled={loading || !driveFileInfo}
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 touch-manipulation"
                >
                  <CloudDownload className="w-4 h-4 shrink-0" />
                  <span>Drive'dan Şimdi Yükle</span>
                </button>
              </div>

              {/* Auto Sync Switch */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Otomatik Senkronizasyon
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Değişiklik yapıldığında arka planda Drive'a otomatik yedekler
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => handleToggleAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Multi-Device Instructions Guide */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs space-y-2 text-blue-900">
                <div className="font-bold flex items-center gap-2 text-blue-950">
                  <Laptop className="w-4 h-4 text-blue-700" />
                  <span>+</span>
                  <Smartphone className="w-4 h-4 text-blue-700" />
                  <span>Telefon ve Bilgisayarı Nasıl Eşitlersiniz?</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-800 leading-relaxed">
                  <li>
                    <strong>Bilgisayarda:</strong> Programı hazırladıktan sonra yukarıdaki <em>"Drive'a Şimdi Kaydet"</em> butonuna basın.
                  </li>
                  <li>
                    <strong>Telefonda:</strong> Vercel veya web bağlantınızı açıp aynı Google hesabınızla giriş yapın.
                  </li>
                  <li>
                    <strong>Telefonda:</strong> <em>"Drive'dan Şimdi Yükle"</em> butonuna basarak tüm verileri saniyeler içinde telefonunuza aktarın.
                  </li>
                </ol>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Google Drive API v3</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 active:bg-slate-400 font-bold text-slate-700 transition-colors"
          >
            Kapat
          </button>
        </div>

        {/* Mandatory User Confirmation Dialog for Destructive / Mutating Actions */}
        <AnimatePresence>
          {confirmModal && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center gap-3 text-amber-600">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {confirmModal.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">Onay Gerekiyor</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {confirmModal.description}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setConfirmModal(null)}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => {
                      if (confirmModal.type === 'upload') {
                        executeUpload();
                      } else {
                        executeDownload();
                      }
                    }}
                    disabled={loading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 ${
                      confirmModal.type === 'download' 
                        ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700' 
                        : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700'
                    }`}
                  >
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{confirmModal.type === 'download' ? 'İndir ve Uygula' : 'Drive\'a Yaz'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
