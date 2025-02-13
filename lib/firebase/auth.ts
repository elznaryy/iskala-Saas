import { auth, db } from './config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserData } from '@/types/subscription';

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  companyName: string,
  phoneNumber: string
) => {
  try {
    // Create the user in Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    if (user) {
      // Create the user document with the new structure
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        name: fullName,
        plan: 'free',
        basicInfo: {
          name: fullName,
          email: email,
          companyName,
          phoneNumber,
        },
        subscription: {
          planId: '1', // Free plan ID
          status: 'active'
        }
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Initialize usage data
      await setDoc(doc(db, 'usage', user.uid), {
        aiEmailCount: 0,
        lastResetDate: serverTimestamp()
      });

      return user;
    }
  } catch (error) {
    console.error('Error in signUp:', error);
    throw error;
  }
};

export async function signIn(email: string, password: string) {
  try {
    console.log('Starting Firebase authentication...')
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log('Authentication successful:', userCredential.user.uid)
    
    // Get and set the auth token
    const token = await userCredential.user.getIdToken()
    document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Strict`
    
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    console.error('Authentication error:', error)
    return { user: null, error }
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error }
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Refresh token on auth state change
      const token = await user.getIdToken(true)
      document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Strict`
    }
    callback(user)
  })
}
