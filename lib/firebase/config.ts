import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
const auth = getAuth(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app);

const setCookie = (name: string, value: string, expires?: string) => {
  if (typeof window !== 'undefined') {
    const cookieValue = `${name}=${value}; path=/; ${expires ? `expires=${expires};` : ''} SameSite=Lax`
    document.cookie = cookieValue
    // Also set a session cookie for API routes
    if (name === 'firebase-auth-token') {
      document.cookie = `__session=${value}; path=/; ${expires ? `expires=${expires};` : ''} SameSite=Lax`
    }
  }
}

const clearCookie = (name: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
    if (name === 'firebase-auth-token') {
      document.cookie = `__session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
    }
  }
}

let tokenRefreshInterval: NodeJS.Timeout | null = null;

// Set up auth persistence and token handling
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Clear any existing refresh interval
          if (tokenRefreshInterval) {
            clearInterval(tokenRefreshInterval)
          }

          // Get fresh token and set it
          const token = await user.getIdToken(true)
          setCookie('firebase-auth-token', token)
          
          // Set up token refresh
          tokenRefreshInterval = setInterval(async () => {
            try {
              if (auth.currentUser) {
                const newToken = await auth.currentUser.getIdToken(true)
                setCookie('firebase-auth-token', newToken)
              } else {
                clearInterval(tokenRefreshInterval!)
                tokenRefreshInterval = null
              }
            } catch (error) {
              console.error('Token refresh error:', error)
              clearInterval(tokenRefreshInterval!)
              tokenRefreshInterval = null
            }
          }, 10 * 60 * 1000) // Refresh every 10 minutes
        } catch (error) {
          console.error('Error setting auth token:', error)
        }
      } else {
        // Remove auth tokens when user is not authenticated
        clearCookie('firebase-auth-token')
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval)
          tokenRefreshInterval = null
        }
      }
    })
  })
  .catch((error) => {
    console.error('Auth persistence error:', error)
  });

export { app, auth, setCookie, clearCookie, realtimeDb, storage };
