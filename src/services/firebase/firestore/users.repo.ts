import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '@/src/shared/types';

// ─── Collection ───
const usersRef = collection(db, 'users');

// ─── Subscriptions ───

/**
 * Subscribe tất cả users (cho admin quản lý)
 */
export const subscribeUsers = (
  callback: (users: User[]) => void
): Unsubscribe => {
  return onSnapshot(usersRef, (snapshot) => {
    const users: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
    callback(users);
  });
};

// ─── CRUD ───

/**
 * Lấy user theo Auth UID (dùng UID làm document ID)
 */
export const getUserByAuthId = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
};

/**
 * Tạo user mới (document ID = Auth UID)
 */
export const addUser = async (uid: string, data: Omit<User, 'id'>): Promise<void> => {
  await setDoc(doc(db, 'users', uid), data);
};

/**
 * Cập nhật thông tin user
 */
export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  const { id: _id, ...updateData } = data as User;
  await updateDoc(doc(db, 'users', uid), updateData);
};

/**
 * Xóa user khỏi Firestore (không xóa Firebase Auth account)
 */
export const deleteUser = async (uid: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', uid));
};
