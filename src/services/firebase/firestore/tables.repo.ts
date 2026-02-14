import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  where,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Area, Table } from '@/src/shared/types';

// ─── Collections ───
const areasRef = collection(db, 'areas');
const tablesRef = collection(db, 'tables');

// ─── Areas ───

export const subscribeAreas = (
  callback: (areas: Area[]) => void
): Unsubscribe => {
  const q = query(areasRef, orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const areas: Area[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Area[];
    callback(areas);
  });
};

export const addArea = async (name: string): Promise<string> => {
  const docRef = await addDoc(areasRef, { name });
  return docRef.id;
};

export const updateArea = async (id: string, name: string): Promise<void> => {
  await updateDoc(doc(db, 'areas', id), { name });
};

export const deleteArea = async (id: string): Promise<void> => {
  // Delete area and optionally handle orphan tables
  await deleteDoc(doc(db, 'areas', id));
};

// ─── Tables ───

export const subscribeTables = (
  callback: (tables: Table[]) => void
): Unsubscribe => {
  const q = query(tablesRef, orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const tables: Table[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Table[];
    callback(tables);
  });
};

export const addTable = async (data: Omit<Table, 'id'>): Promise<string> => {
  const docRef = await addDoc(tablesRef, data);
  return docRef.id;
};

export const updateTable = async (id: string, data: Partial<Table>): Promise<void> => {
  const { id: _id, ...updateData } = data as Table;
  await updateDoc(doc(db, 'tables', id), updateData);
};

export const deleteTable = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'tables', id));
};

/**
 * Cập nhật areaId cho tất cả tables thuộc area cũ sang area mới
 */
export const updateTablesArea = async (oldAreaId: string, newAreaId: string): Promise<void> => {
  const q = query(tablesRef, where('areaId', '==', oldAreaId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { areaId: newAreaId });
  });
  await batch.commit();
};
