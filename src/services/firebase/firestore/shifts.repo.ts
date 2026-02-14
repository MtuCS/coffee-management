import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Shift } from '@/src/shared/types';

// ─── Collection ───
const shiftsRef = collection(db, 'shifts');

// ─── Helpers ───

const fromFirestoreShift = (id: string, data: Record<string, unknown>): Shift => ({
  id,
  opener: data.opener as string,
  startTime: (data.startTime as Timestamp)?.toDate?.() ?? new Date(),
  endTime: data.endTime ? (data.endTime as Timestamp)?.toDate?.() : null,
  totalRevenue: (data.totalRevenue as number) ?? 0,
  isOpen: (data.isOpen as boolean) ?? false,
});

// ─── Subscriptions ───

/**
 * Subscribe ca đang mở (chỉ có 1 ca mở tại 1 thời điểm)
 */
export const subscribeCurrentShift = (
  callback: (shift: Shift | null) => void
): Unsubscribe => {
  const q = query(shiftsRef, where('isOpen', '==', true), limit(1));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      const docSnap = snapshot.docs[0];
      callback(fromFirestoreShift(docSnap.id, docSnap.data()));
    }
  });
};

/**
 * Subscribe tất cả shifts (cho báo cáo)
 */
export const subscribeShifts = (
  callback: (shifts: Shift[]) => void
): Unsubscribe => {
  const q = query(shiftsRef, orderBy('startTime', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const shifts: Shift[] = snapshot.docs.map((docSnap) =>
      fromFirestoreShift(docSnap.id, docSnap.data())
    );
    callback(shifts);
  });
};

// ─── CRUD ───

export const openShift = async (openerName: string): Promise<string> => {
  const docRef = await addDoc(shiftsRef, {
    opener: openerName,
    startTime: Timestamp.now(),
    endTime: null,
    totalRevenue: 0,
    isOpen: true,
  });
  return docRef.id;
};

export const closeShift = async (shiftId: string): Promise<void> => {
  await updateDoc(doc(db, 'shifts', shiftId), {
    isOpen: false,
    endTime: Timestamp.now(),
  });
};

/**
 * Lấy lịch sử shifts đã đóng
 */
export const getShiftHistory = async (count: number = 20): Promise<Shift[]> => {
  const q = query(
    shiftsRef,
    where('isOpen', '==', false),
    orderBy('startTime', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) =>
    fromFirestoreShift(docSnap.id, docSnap.data())
  );
};
