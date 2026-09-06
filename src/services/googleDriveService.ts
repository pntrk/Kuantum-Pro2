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

// In-memory caching for OAuth access token (as required by Google Workspace integration rules)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

/**
 * Initialize auth state listener.
 * Clears cached token upon sign-out.
 */
export const initDriveAuth = (
  onAuthChange: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthChange(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged in to Firebase but needs fresh token or popup
        onAuthChange(user, null);
      }
    } else {
      cachedAccessToken = null;
      onAuthChange(null, null);
    }
  });
};

/**
 * Sign in with Google Popup and obtain access token with drive.file scope
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Google Drive erişim belirteci alınamadı.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
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
    cachedAccessToken = null;
  } catch (error) {
    console.error('Google Sign Out Hatası:', error);
    throw error;
  }
};

/**
 * Get currently cached access token
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
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
      if (res.status === 401) {
        cachedAccessToken = null;
        throw new Error('Google oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }
      throw new Error(`Drive dosya arama hatası (${res.status})`);
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
      if (res.status === 401) {
        cachedAccessToken = null;
        throw new Error('Google oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }
      throw new Error(`Drive dosya indirme hatası (${res.status})`);
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
      // Direct media PATCH
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

      if (!res.ok) {
        if (res.status === 401) {
          cachedAccessToken = null;
          throw new Error('Google oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
        throw new Error(`Drive güncelleme hatası (${res.status})`);
      }

      const updated = await res.json();
      return {
        id: updated.id || existingFileId,
        name: updated.name || 'kuantum_pro_program.json',
        modifiedTime: new Date().toISOString()
      };
    } else {
      // Multipart upload for new file creation
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadata = {
        name: 'kuantum_pro_program.json',
        mimeType: 'application/json',
        description: 'Kuantum Pro2 Ders Dağıtım ve Nöbet Programı Otomatik Yedek Dosyası'
      };

      const multipartBody = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        payload +
        closeDelimiter;

      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartBody
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          cachedAccessToken = null;
          throw new Error('Google oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
        throw new Error(`Drive yeni dosya yükleme hatası (${res.status})`);
      }

      const created = await res.json();
      return {
        id: created.id,
        name: created.name || 'kuantum_pro_program.json',
        modifiedTime: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('uploadDriveBackupFile hatası:', error);
    throw error;
  }
};
