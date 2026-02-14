import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/src/shared/types';

/**
 * Đăng nhập bằng email/password
 */
export const loginWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

/**
 * Đăng xuất
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Lấy thông tin User từ Firestore dựa vào Auth UID
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
};

/**
 * Subscribe auth state changes
 * Callback nhận User profile (từ Firestore) hoặc null khi logout
 */
export const subscribeToAuthState = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      callback(profile);
    } else {
      callback(null);
    }
  });
};
