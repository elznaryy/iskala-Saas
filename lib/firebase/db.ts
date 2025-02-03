import { db } from './config';
import { doc, getDoc } from 'firebase/firestore';

export const getUserData = async (userId: string) => {
  try {
    console.log('Attempting to fetch user data for ID:', userId);
    
    if (!userId) {
      console.error('No userId provided');
      return { data: null, error: 'No userId provided' };
    }

    const userDocRef = doc(db, 'Users', userId);
    console.log('Attempting to access document:', userDocRef.path);

    try {
      const userDoc = await getDoc(userDocRef);
      console.log('Document access successful, exists:', userDoc.exists());
      
      if (!userDoc.exists()) {
        return { data: null, error: 'User document not found' };
      }

      const userData = userDoc.data();
      return { data: userData, error: null };

    } catch (accessError: any) {
      if (accessError.code === 'permission-denied') {
        console.error('Permission denied accessing user document. Please check Firestore rules.');
        return { 
          data: null, 
          error: 'Permission denied. Please check authentication.' 
        };
      }
      throw accessError; // Re-throw other errors
    }

  } catch (error: any) {
    console.error('Error fetching user data:', {
      error,
      code: error.code,
      message: error.message,
      path: `Users/${userId}`,
    });
    
    const errorMessage = error.code === 'permission-denied'
      ? 'Access denied. Please check authentication.'
      : `Error fetching user data: ${error.message}`;
    
    return { data: null, error: errorMessage };
  }
};
