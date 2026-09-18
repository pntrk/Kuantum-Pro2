import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut as fbSignOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App lazily and safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Enforce browser-local persistence so user session survives tab closing and reloads
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence warning:', err);
});

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory caching for OAuth access token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

const TOKEN_STORAGE_KEY = 'kuantum_google_drive_token';
const TOKEN_EXPIRY_KEY = 'kuantum_google_drive_token_expiry';
const USER_EMAIL_KEY = 'kuantum_google_drive_user_email';
const USER_CACHE_KEY = 'kuantum_google_drive_user_cache';

type AuthListener = (user: User | null, token: string | null) => void;
const listeners = new Set<AuthListener>();

export const notifyAuthListeners = (user: User | null, token: string | null) => {
  listeners.forEach(fn => {
    try {
      fn(user, token);
    } catch (e) {
      console.warn('Auth listener execution error:', e);
    }
  });
};

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export interface GoogleDriveApiError extends Error {
  status?: number;
  code?: string | number;
  rawMessage?: string;
  isApiDisabled?: boolean;
  isScopeInsufficient?: boolean;
  isTokenExpired?: boolean;
  helpLink?: string;
}

/**
 * Check if the stored access token is still valid (not expired)
 */
export const isTokenValid = (): boolean => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!token) return false;
    if (!expiry) return true;
    const expiryTime = Number(expiry);
    // Consider token valid if at least 90 seconds remain before expiration
    return Date.now() < (expiryTime - 90 * 1000);
  } catch {
    return false;
  }
};

/**
 * Retrieve stored token from memory or localStorage (verifying expiration)
 */
export const getStoredAccessToken = (onlyIfValid = false): string | null => {
  if (onlyIfValid && !isTokenValid()) return null;
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      cachedAccessToken = stored;
      return stored;
    }
  } catch (e) {
    // localStorage might be restricted in some contexts
  }
  return null;
};

/**
 * Persist access token in memory and localStorage with proactive refresh schedule
 */
export const saveAccessToken = (token: string, expiresInSeconds: number = 3600) => {
  cachedAccessToken = token;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    const expiryTimestamp = Date.now() + Math.max(300, expiresInSeconds) * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTimestamp));
  } catch (e) {
    // ignore
  }
  scheduleTokenRefresh(expiresInSeconds);
};

/**
 * Clear stored token
 */
export const clearStoredAccessToken = () => {
  cachedAccessToken = null;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (e) {
    // ignore
  }
};

// Auto-refresh timer reference
let refreshTimer: any = null;

/**
 * Schedule token refresh prior to expiration (e.g. 5 minutes before)
 */
export const scheduleTokenRefresh = (expiresInSeconds: number = 3600) => {
  if (refreshTimer) clearTimeout(refreshTimer);
  // Schedule 5 minutes (300s) before expiry, minimum 30 seconds
  const delayMs = Math.max(30000, (expiresInSeconds - 300) * 1000);
  refreshTimer = setTimeout(async () => {
    if (auth.currentUser || localStorage.getItem(USER_EMAIL_KEY)) {
      console.log('Otomatik arka plan token yenilemesi tetiklendi...');
      const newToken = await ensureValidAccessToken(false);
      if (newToken) {
        scheduleTokenRefresh(3600);
      }
    }
  }, delayMs);
};

// Google Identity Services (GIS) Token Client for silent background renewal
let gisTokenClient: any = null;
let isRefreshingSilent = false;

declare global {
  interface Window {
    google?: any;
  }
}

export const initGisTokenClient = () => {
  if (gisTokenClient) return gisTokenClient;
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    try {
      gisTokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: () => {} // Overridden dynamically per request
      });
      return gisTokenClient;
    } catch (e) {
      console.warn('GIS TokenClient başlatma uyarısı:', e);
    }
  }
  return null;
};

/**
 * Attempt to refresh token completely silently in the background using GIS
 * without opening any popup or requiring user clicks.
 */
export const refreshAccessTokenSilently = async (): Promise<string | null> => {
  if (isRefreshingSilent) return null;
  const email = auth.currentUser?.email || localStorage.getItem(USER_EMAIL_KEY);
  if (!email) return null;

  isRefreshingSilent = true;
  try {
    const client = initGisTokenClient();
    if (client) {
      const tokenPromise = new Promise<string | null>((resolve) => {
        const timer = setTimeout(() => resolve(null), 5000); // 5s timeout
        client.callback = (resp: any) => {
          clearTimeout(timer);
          if (resp?.access_token) {
            const expiresIn = resp.expires_in ? Number(resp.expires_in) : 3600;
            saveAccessToken(resp.access_token, expiresIn);
            if (auth.currentUser) {
              notifyAuthListeners(auth.currentUser, resp.access_token);
            }
            resolve(resp.access_token);
          } else {
            resolve(null);
          }
        };
        try {
          // prompt: '' enables silent renewal without opening an account picker or dialog
          client.requestAccessToken({ prompt: '', hint: email });
        } catch (err) {
          clearTimeout(timer);
          resolve(null);
        }
      });

      const token = await tokenPromise;
      if (token) return token;
    }
  } catch (err) {
    console.warn('Sessiz GIS yenileme denemesi:', err);
  } finally {
    isRefreshingSilent = false;
  }
  return null;
};

/**
 * Ensure a valid access token exists. Refreshes silently if expired.
 * Only falls back to seamless popup if allowInteractive is true.
 */
export const ensureValidAccessToken = async (allowInteractive = false): Promise<string | null> => {
  // 1. If currently stored token is still valid, return it immediately
  if (isTokenValid()) {
    const token = getStoredAccessToken();
    if (token) return token;
  }

  // 2. Try silent background refresh first if user is recognized
  if (auth.currentUser || localStorage.getItem(USER_EMAIL_KEY)) {
    try {
      const silentToken = await refreshAccessTokenSilently();
      if (silentToken) return silentToken;
    } catch (e) {
      // ignore
    }
  }

  // 3. Fallback to interactive popup without prompt: 'select_account'
  if (allowInteractive && (auth.currentUser || localStorage.getItem(USER_EMAIL_KEY))) {
    try {
      const { accessToken } = await signInWithGoogle(false, false);
      return accessToken;
    } catch (e) {
      console.warn('Etkileşimli token yenileme hatası:', e);
    }
  }

  return getStoredAccessToken();
};

// Listen to focus and visibility change to automatically renew stale tokens
if (typeof window !== 'undefined') {
  const handleWakeup = () => {
    if (auth.currentUser || localStorage.getItem(USER_EMAIL_KEY)) {
      if (!isTokenValid()) {
        ensureValidAccessToken(false).catch(() => {});
      }
    }
  };
  window.addEventListener('focus', handleWakeup);
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleWakeup();
      }
    });
  }
}

/**
 * Parse Google Drive API error responses with actionable guidance
 */
export const parseGoogleDriveError = async (res: Response): Promise<GoogleDriveApiError> => {
  let errData: any = null;
  try {
    errData = await res.json();
  } catch (e) {
    // response was not JSON
  }

  const status = res.status;
  const rawMessage = errData?.error?.message || errData?.message || `HTTP ${status}`;
  const rawReason = errData?.error?.errors?.[0]?.reason || errData?.error?.status || '';

  // 1. Check if Google Drive API is disabled in the Google Cloud project
  const isApiDisabled = 
    rawReason === 'accessNotConfigured' || 
    rawReason === 'SERVICE_DISABLED' ||
    rawMessage.toLowerCase().includes('has not been used in project') ||
    rawMessage.toLowerCase().includes('disabled');

  // 2. Token expired or invalid
  const isTokenExpired = 
    status === 401 || 
    rawReason === 'authError' || 
    rawMessage.toLowerCase().includes('invalid credentials');

  // 3. Insufficient scope / permission denied
  const isScopeInsufficient = 
    status === 403 && 
    (rawReason === 'insufficientPermissions' || 
     rawMessage.toLowerCase().includes('insufficient') || 
     rawMessage.toLowerCase().includes('not granted'));

  let userFriendlyMessage = rawMessage;
  let helpLink: string | undefined = undefined;

  if (isApiDisabled) {
    userFriendlyMessage = 'Google Drive API projenizde henüz etkinleştirilmemiş.';
    helpLink = `https://console.cloud.google.com/apis/library/drive.googleapis.com?project=${firebaseConfig.projectId || 'gen-lang-client-0413349668'}`;
  } else if (isTokenExpired) {
    userFriendlyMessage = 'Google Drive oturum süreniz doldu. Yenileniyor...';
  } else if (isScopeInsufficient) {
    userFriendlyMessage = 'Google Drive dosya erişim izni verilmedi. Giriş yaparken izin penceresindeki kutucuğu onaylayın.';
  }

  const err: GoogleDriveApiError = new Error(userFriendlyMessage);
  err.status = status;
  err.code = rawReason || status;
  err.rawMessage = rawMessage;
  err.isApiDisabled = isApiDisabled;
  err.isScopeInsufficient = isScopeInsufficient;
  err.isTokenExpired = isTokenExpired;
  err.helpLink = helpLink;
  return err;
};

/**
 * Initialize auth state listener.
 * Automatically restores and renews tokens seamlessly.
 */
export const initDriveAuth = (
  onAuthChange: (user: User | null, token: string | null) => void
) => {
  listeners.add(onAuthChange);

  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (user.email) {
        try {
          localStorage.setItem(USER_EMAIL_KEY, user.email);
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid
          }));
        } catch {}
      }

      let token = getStoredAccessToken();
      // If token is missing or expired, attempt silent background refresh
      if (!isTokenValid()) {
        const freshToken = await ensureValidAccessToken(false);
        if (freshToken) token = freshToken;
      }

      onAuthChange(user, token);
    } else {
      onAuthChange(null, null);
    }
  });

  return () => {
    listeners.delete(onAuthChange);
    unsubscribe();
  };
};

/**
 * Sign in with Google Popup.
 * IMPORTANT: By default, does NOT force account selection if already signed in,
 * and sets login_hint to prevent repeated "select account" prompts.
 */
export const signInWithGoogle = async (
  forceConsent = false,
  forceSelectAccount = false
): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const email = auth.currentUser?.email || localStorage.getItem(USER_EMAIL_KEY);

    const customParams: Record<string, string> = {};

    if (forceConsent) {
      customParams.prompt = 'consent';
      customParams.access_type = 'offline';
    } else if (forceSelectAccount) {
      customParams.prompt = 'select_account';
    } else {
      // Seamless re-authentication without annoying account chooser
      if (email) {
        customParams.login_hint = email;
      }
    }

    provider.setCustomParameters(customParams);

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Google Drive erişim belirteci alınamadı. Lütfen açılır penceredeki izinleri onaylayın.');
    }

    if (result.user.email) {
      try {
        localStorage.setItem(USER_EMAIL_KEY, result.user.email);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          uid: result.user.uid
        }));
      } catch {}
    }

    saveAccessToken(credential.accessToken);
    notifyAuthListeners(result.user, credential.accessToken);

    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Sign In Hatası:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out and clear cached token and persistent cache
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    if (refreshTimer) clearTimeout(refreshTimer);
    await fbSignOut(auth);
    clearStoredAccessToken();
    try {
      localStorage.removeItem(USER_EMAIL_KEY);
      localStorage.removeItem(USER_CACHE_KEY);
    } catch {}
    notifyAuthListeners(null, null);
  } catch (error) {
    console.error('Google Sign Out Hatası:', error);
    throw error;
  }
};

/**
 * Get currently cached access token
 */
export const getDriveAccessToken = (): string | null => {
  return getStoredAccessToken();
};

/**
 * Wrapper for Google Drive API requests that automatically handles 401 token expiry
 * by seamlessly refreshing the token and retrying the request.
 */
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  token: string
): Promise<Response> => {
  let activeToken = token;
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${activeToken}`
    }
  });

  if (res.status === 401) {
    console.warn('Google Drive 401 aldı, otomatik arka plan yenilemesi deneniyor...');
    const freshToken = await ensureValidAccessToken(false);
    if (freshToken && freshToken !== activeToken) {
      activeToken = freshToken;
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${activeToken}`
        }
      });
    }
  }

  return res;
};

/**
 * Search for existing backup file in Google Drive (with auto-retry on 401)
 */
export const findDriveBackupFile = async (token: string): Promise<DriveFileInfo | null> => {
  try {
    const q = encodeURIComponent("name = 'kuantum_pro_program.json' and trashed = false");
    const res = await fetchWithRetry(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime,size)&spaces=drive`,
      {
        cache: 'no-store'
      },
      token
    );

    if (!res.ok) {
      throw await parseGoogleDriveError(res);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0] as DriveFileInfo;
    }
    return null;
  } catch (error) {
    console.error('findDriveBackupFile hatası:', error);
    throw error;
  }
};

/**
 * Download and parse backup JSON file from Google Drive (with auto-retry on 401)
 */
export const downloadDriveBackupFile = async (token: string, fileId: string): Promise<any> => {
  try {
    const res = await fetchWithRetry(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&t=${Date.now()}`,
      {
        cache: 'no-store'
      },
      token
    );

    if (!res.ok) {
      throw await parseGoogleDriveError(res);
    }

    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error('Google Drive üzerindeki yedek dosyası boş (0 bayt).');
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'string') {
        try {
          return JSON.parse(parsed);
        } catch {
          return parsed;
        }
      }
      return parsed;
    } catch (parseError) {
      console.error('Drive JSON parse error:', parseError);
      throw new Error('Google Drive üzerindeki yedek dosyası geçerli bir JSON verisi içermiyor.');
    }
  } catch (error) {
    console.error('downloadDriveBackupFile hatası:', error);
    throw error;
  }
};

/**
 * Upload or update backup file in Google Drive (with auto-retry on 401)
 */
export const uploadDriveBackupFile = async (
  token: string, 
  data: any, 
  existingFileId?: string | null
): Promise<DriveFileInfo> => {
  try {
    const payload = JSON.stringify(data, null, 2);
    const metadata = {
      name: 'kuantum_pro_program.json',
      mimeType: 'application/json',
      description: 'Kuantum Pro2 Ders Dağıtım ve Nöbet Programı Otomatik Yedek Dosyası'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      payload +
      close_delim;

    let requestUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let requestMethod = 'POST';

    if (existingFileId) {
      // Check if file exists first
      try {
        const checkRes = await fetchWithRetry(
          `https://www.googleapis.com/drive/v3/files/${existingFileId}?fields=id`,
          {},
          token
        );
        if (checkRes.ok) {
          requestUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
          requestMethod = 'PATCH';
        }
      } catch (e) {
        // ignore check error, defaults to POST
      }
    }

    const res = await fetchWithRetry(
      requestUrl,
      {
        method: requestMethod,
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      },
      token
    );

    if (!res.ok) {
      throw await parseGoogleDriveError(res);
    }

    const responseData = await res.json();

    return {
      id: responseData.id || existingFileId,
      name: responseData.name || 'kuantum_pro_program.json',
      modifiedTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('uploadDriveBackupFile hatası:', error);
    throw error;
  }
};
