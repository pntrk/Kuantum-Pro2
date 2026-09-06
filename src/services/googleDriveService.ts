import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut as fbSignOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App lazily and safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory caching for OAuth access token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

const TOKEN_STORAGE_KEY = 'kuantum_google_drive_token';
const TOKEN_EXPIRY_KEY = 'kuantum_google_drive_token_expiry';

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
 * Retrieve stored token from memory or localStorage
 */
export const getStoredAccessToken = (): string | null => {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      cachedAccessToken = stored;
      return stored;
    }
  } catch (e) {
    // localStorage might be restricted in some iframe contexts
  }
  return null;
};

/**
 * Persist access token in memory and localStorage
 */
export const saveAccessToken = (token: string, expiresInSeconds: number = 3600) => {
  cachedAccessToken = token;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresInSeconds * 1000));
  } catch (e) {
    // ignore
  }
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
    clearStoredAccessToken();
    userFriendlyMessage = 'Google Drive oturum süreniz doldu. Lütfen tekrar bağlanın.';
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
 * Clears cached token upon sign-out.
 */
export const initDriveAuth = (
  onAuthChange: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = getStoredAccessToken();
      onAuthChange(user, token);
    } else {
      clearStoredAccessToken();
      onAuthChange(null, null);
    }
  });
};

/**
 * Sign in with Google Popup and obtain access token with drive.file scope.
 * When forceConsent is false, Google recognizes previously granted permission without prompting again.
 */
export const signInWithGoogle = async (forceConsent = false): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    if (forceConsent) {
      provider.setCustomParameters({
        prompt: 'consent',
        access_type: 'offline'
      });
    } else {
      provider.setCustomParameters({
        prompt: 'select_account'
      });
    }

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Google Drive erişim belirteci alınamadı. Lütfen açılır penceredeki izinleri onaylayın.');
    }

    saveAccessToken(credential.accessToken);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Sign In Hatası:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out and clear cached token
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await fbSignOut(auth);
    clearStoredAccessToken();
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
 * Search for existing backup file in Google Drive
 */
export const findDriveBackupFile = async (token: string): Promise<DriveFileInfo | null> => {
  try {
    const q = encodeURIComponent("name = 'kuantum_pro_program.json' and trashed = false");
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime,size)&spaces=drive`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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
 * Download and parse backup JSON file from Google Drive
 */
export const downloadDriveBackupFile = async (token: string, fileId: string): Promise<any> => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      throw await parseGoogleDriveError(res);
    }

    return await res.json();
  } catch (error) {
    console.error('downloadDriveBackupFile hatası:', error);
    throw error;
  }
};

/**
 * Upload or update backup file in Google Drive
 */
export const uploadDriveBackupFile = async (
  token: string, 
  data: any, 
  existingFileId?: string | null
): Promise<DriveFileInfo> => {
  try {
    const payload = JSON.stringify(data, null, 2);

    if (existingFileId) {
      // Direct media PATCH for existing file
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=UTF-8'
          },
          body: payload
        }
      );

      if (res.ok) {
        const updated = await res.json();
        return {
          id: updated.id || existingFileId,
          name: updated.name || 'kuantum_pro_program.json',
          modifiedTime: new Date().toISOString()
        };
      }

      // If file was deleted in Drive (404), fall through to create a new file
      if (res.status !== 404) {
        throw await parseGoogleDriveError(res);
      }
    }

    // Two-step creation for new file (Step 1: metadata, Step 2: media content)
    // This avoids multipart boundary bugs across different browser engines
    const metaRes = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
          name: 'kuantum_pro_program.json',
          mimeType: 'application/json',
          description: 'Kuantum Pro2 Ders Dağıtım ve Nöbet Programı Otomatik Yedek Dosyası'
        })
      }
    );

    if (!metaRes.ok) {
      throw await parseGoogleDriveError(metaRes);
    }

    const created = await metaRes.json();
    const newFileId = created.id;

    // Step 2: Upload content
    const mediaRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${newFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: payload
      }
    );

    if (!mediaRes.ok) {
      throw await parseGoogleDriveError(mediaRes);
    }

    return {
      id: newFileId,
      name: created.name || 'kuantum_pro_program.json',
      modifiedTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('uploadDriveBackupFile hatası:', error);
    throw error;
  }
};
