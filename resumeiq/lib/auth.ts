import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function getUserRole(uid: string): Promise<'admin' | 'teacher' | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role as 'admin' | 'teacher';
    }
    return null; // Fallback or not found
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

export async function isAdmin(uid: string): Promise<boolean> {
  const role = await getUserRole(uid);
  return role === 'admin';
}

export async function canManageUsers(uid: string): Promise<boolean> {
  return await isAdmin(uid);
}
