/**
 * Format Date thành chuỗi ngắn
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format Date thành chuỗi giờ:phút
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format datetime đầy đủ
 */
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// ─── Shift Helpers ───

import type { ShiftType } from '@/src/shared/types';

export interface ShiftDefinition {
  type: ShiftType;
  name: string;
  startHour: number;
  endHour: number;
}

export const SHIFT_DEFINITIONS: ShiftDefinition[] = [
  { type: 'MORNING',   name: 'Ca Sáng',  startHour: 6,  endHour: 12 },
  { type: 'AFTERNOON', name: 'Ca Chiều',  startHour: 12, endHour: 18 },
  { type: 'EVENING',   name: 'Ca Tối',    startHour: 18, endHour: 24 },
];

/**
 * Xác định ca hiện tại dựa trên giờ hiện tại.
 * Ngoài giờ 6-24 → trả về null.
 */
export const getCurrentShiftDef = (now: Date = new Date()): ShiftDefinition | null => {
  const hour = now.getHours();
  return SHIFT_DEFINITIONS.find((s) => hour >= s.startHour && hour < s.endHour) || null;
};

/**
 * Tạo dateKey dạng 'YYYY-MM-DD' cho 1 ngày
 */
export const toDateKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Tạo Date cho startTime / endTime của 1 shift trong ngày cụ thể
 */
export const buildShiftTimes = (dateKey: string, def: ShiftDefinition): { start: Date; end: Date } => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return {
    start: new Date(y, m - 1, d, def.startHour, 0, 0),
    end:   new Date(y, m - 1, d, def.endHour, 0, 0),
  };
};
