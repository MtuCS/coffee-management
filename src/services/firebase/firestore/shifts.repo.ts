import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  Unsubscribe,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Shift, ShiftType } from '@/src/shared/types';
import {
  getCurrentShiftDef,
  toDateKey,
  buildShiftTimes,
  SHIFT_DEFINITIONS,
  type ShiftDefinition,
} from '@/src/shared/utils/date';

// ─── Collection ───
const shiftsRef = collection(db, 'shifts');

// ─── Helpers ───

const fromFirestoreShift = (id: string, data: Record<string, unknown>): Shift => ({
  id,
  shiftType: (data.shiftType as ShiftType) ?? 'MORNING',
  shiftName: (data.shiftName as string) ?? '',
  date: (data.date as string) ?? '',
  startTime: (data.startTime as Timestamp)?.toDate?.() ?? new Date(),
  endTime: (data.endTime as Timestamp)?.toDate?.() ?? new Date(),
  totalRevenue: (data.totalRevenue as number) ?? 0,
});

// ─── Auto-resolve Current Shift ───

/**
 * Lấy hoặc tạo shift cho ca hiện tại (dựa trên giờ hệ thống).
 * Mỗi ngày chỉ có tối đa 3 shift (MORNING / AFTERNOON / EVENING).
 * Nếu chưa tồn tại → tự tạo mới trong Firestore.
 * Trả về null nếu ngoài giờ phục vụ (trước 6h sáng).
 */
export const getOrCreateCurrentShift = async (): Promise<Shift | null> => {
  const now = new Date();
  const def = getCurrentShiftDef(now);
  if (!def) return null;

  const dateKey = toDateKey(now);

  // Tìm shift đã tồn tại cho ngày + loại ca này
  const q = query(
    shiftsRef,
    where('date', '==', dateKey),
    where('shiftType', '==', def.type)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return fromFirestoreShift(docSnap.id, docSnap.data());
  }

  // Chưa có → tạo mới
  const times = buildShiftTimes(dateKey, def);
  const newShift = {
    shiftType: def.type,
    shiftName: def.name,
    date: dateKey,
    startTime: Timestamp.fromDate(times.start),
    endTime: Timestamp.fromDate(times.end),
    totalRevenue: 0,
  };
  const docRef = await addDoc(shiftsRef, newShift);
  return {
    id: docRef.id,
    shiftType: def.type,
    shiftName: def.name,
    date: dateKey,
    startTime: times.start,
    endTime: times.end,
    totalRevenue: 0,
  };
};

// ─── Subscriptions ───

/**
 * Subscribe ca hiện tại (theo ngày + shiftType)
 */
export const subscribeCurrentShift = (
  callback: (shift: Shift | null) => void
): Unsubscribe => {
  const now = new Date();
  const def = getCurrentShiftDef(now);
  if (!def) {
    callback(null);
    return () => {};
  }

  const dateKey = toDateKey(now);
  const q = query(
    shiftsRef,
    where('date', '==', dateKey),
    where('shiftType', '==', def.type)
  );
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      const docSnap = snapshot.docs[0];
      callback(fromFirestoreShift(docSnap.id, docSnap.data()));
    }
  }, (error: FirestoreError) => {
    console.error('[subscribeCurrentShift] Error:', error.message);
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
  }, (error: FirestoreError) => {
    console.error('[subscribeShifts] Error:', error.message);
  });
};
