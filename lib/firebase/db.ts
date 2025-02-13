import { db } from './config';
import { doc, getDoc } from 'firebase/firestore';
import { UserData } from '@/types/user';

export async function getUserData(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log('No Firestore document found for user:', userId);
      return { 
        data: null, 
        error: 'User document not found' 
      };
    }

    const data = userSnap.data();
    if (!data.basicInfo || !data.plan) {
      console.log('Incomplete user data for:', userId);
      return {
        data: null,
        error: 'Incomplete user data'
      };
    }

    const userData = {
      uid: userSnap.id,
      ...data
    } as UserData;

    return { data: userData, error: null };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { 
      data: null, 
      error: 'Failed to fetch user data' 
    };
  }
}
