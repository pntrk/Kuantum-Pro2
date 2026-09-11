/**
 * Duty Rotation Utilities
 * Provides continuous annual rotation calculation for teachers across duty locations
 * based on academic week indexing so that rotation is continuous throughout the entire school year.
 */

export function getDefaultAcademicYearStart(refDate: Date = new Date()): string {
  const m = refDate.getMonth(); // 0-11
  const y = m >= 7 ? refDate.getFullYear() : refDate.getFullYear() - 1; // August (7) or later is new academic year
  return `${y}-09-01`;
}

/**
 * Returns the 0-indexed academic week number for any given date
 * relative to the academic year start date.
 */
export function getAcademicWeekIndex(date: Date, anchorStartDateStr?: string): number {
  let anchor: Date;
  if (anchorStartDateStr) {
    anchor = new Date(anchorStartDateStr);
    if (isNaN(anchor.getTime())) {
      anchor = new Date(getDefaultAcademicYearStart(date));
    }
  } else {
    anchor = new Date(getDefaultAcademicYearStart(date));
  }

  // Normalize both dates to Monday 00:00:00
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const mon = new Date(d.getFullYear(), d.getMonth(), diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  };

  const targetMon = getMonday(date);
  const anchorMon = getMonday(anchor);

  const diffMs = targetMon.getTime() - anchorMon.getTime();
  const weekDiff = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  
  // Modulo calculation that handles positive indices gracefully
  return weekDiff >= 0 ? weekDiff : (weekDiff % 52 + 52) % 52;
}

/**
 * Returns shifted teacher assignments for all duty locations on a given weekday
 * using the continuous annual academic week index.
 */
export function getShiftedTeachersForDay({
  dutyLocations,
  dutyAssignments,
  weekDayId,
  weekIndex,
  rotateTeachers,
  isPrincipal
}: {
  dutyLocations: string[];
  dutyAssignments: Record<string, string[]>;
  weekDayId: number;
  weekIndex: number;
  rotateTeachers: boolean;
  isPrincipal: (name: string) => boolean;
}): string[][] {
  if (!dutyLocations || dutyLocations.length === 0) return [];

  const baseTeachers = dutyLocations.map(loc => {
    const key = `${loc}_${weekDayId}`;
    return (dutyAssignments[key] || []).filter(t => !isPrincipal(t));
  });

  if (!rotateTeachers || dutyLocations.length <= 1) {
    return baseTeachers;
  }

  // Shift amount based on the annual academic week index
  const shiftAmount = weekIndex % dutyLocations.length;
  if (shiftAmount === 0) {
    return baseTeachers;
  }

  return [
    ...baseTeachers.slice(-shiftAmount),
    ...baseTeachers.slice(0, -shiftAmount)
  ];
}

/**
 * Returns shifted teachers for a single specific location on a given day
 */
export function getShiftedTeachersForLocation({
  targetLocation,
  dutyLocations,
  dutyAssignments,
  weekDayId,
  weekIndex,
  rotateTeachers,
  isPrincipal
}: {
  targetLocation: string;
  dutyLocations: string[];
  dutyAssignments: Record<string, string[]>;
  weekDayId: number;
  weekIndex: number;
  rotateTeachers: boolean;
  isPrincipal: (name: string) => boolean;
}): string[] {
  const locIndex = dutyLocations.indexOf(targetLocation);
  if (locIndex === -1) return [];

  const allShifted = getShiftedTeachersForDay({
    dutyLocations,
    dutyAssignments,
    weekDayId,
    weekIndex,
    rotateTeachers,
    isPrincipal
  });

  return allShifted[locIndex] || [];
}

/**
 * Resolves the duty administrator (Assistant Principal) for a specific date.
 * Guarantees that the weekly schedule configured by the user (adminSchedule) is strictly honored,
 * preventing any day-sequence corruption (such as Monday admin being assigned to Tuesday).
 * 
 * When rotateAdmins is true, rotation advances on a per-academic-week basis anchored
 * strictly to academicYearStartDate. Within any given week, the schedule remains strictly
 * ordered (Monday through Friday) without arbitrary day-of-month shifting.
 */
export function getAdminForDutyDate({
  date,
  weekDayId,
  adminSchedule,
  eligibleDutyAdmins = [],
  activeDays = [],
  rotateAdmins = false,
  academicYearStartDate,
  isPrincipal,
  isHoliday = false,
  isWeekend = false
}: {
  date: Date;
  weekDayId: number; // 1: Pazartesi, 2: Salı, ..., 7: Pazar
  adminSchedule: Record<string | number, string>;
  eligibleDutyAdmins?: string[];
  activeDays?: Array<{ id: number; name: string }>;
  rotateAdmins?: boolean;
  academicYearStartDate?: string;
  isPrincipal?: (name: string) => boolean;
  isHoliday?: boolean;
  isWeekend?: boolean;
}): string | null {
  if (isHoliday) return null;

  const principalCheck = isPrincipal || (() => false);

  const cleanAdmin = (name: string | undefined): string | null => {
    if (!name) return null;
    const trimmed = name.trim();
    if (!trimmed || principalCheck(trimmed)) return null;
    return trimmed;
  };

  // If weekend
  if (isWeekend) {
    const weekendScheduled = adminSchedule[weekDayId];
    return cleanAdmin(weekendScheduled);
  }

  // Active days sequence (usually Monday(1) to Friday(5))
  const sortedActiveDays = activeDays && activeDays.length > 0
    ? [...activeDays].sort((a, b) => a.id - b.id)
    : [
        { id: 1, name: 'Pazartesi' },
        { id: 2, name: 'Salı' },
        { id: 3, name: 'Çarşamba' },
        { id: 4, name: 'Perşembe' },
        { id: 5, name: 'Cuma' }
      ];

  const currentDayPos = sortedActiveDays.findIndex(d => d.id === weekDayId);

  // BASELINE: Admin explicitly assigned to this weekday in weekly schedule
  const directScheduled = cleanAdmin(adminSchedule[weekDayId]);

  // If no rotation requested: STRICTLY PRESERVE WEEKLY SCHEDULE
  if (!rotateAdmins) {
    if (directScheduled) return directScheduled;

    // Fallback if not configured for this specific day in adminSchedule
    if (eligibleDutyAdmins.length > 0 && currentDayPos !== -1) {
      const fallback = eligibleDutyAdmins[currentDayPos % eligibleDutyAdmins.length];
      return cleanAdmin(fallback);
    }
    return null;
  }

  // ROTATION MODE: Continuous weekly rotation based on academic year start
  const academicWeekIdx = getAcademicWeekIndex(date, academicYearStartDate);

  // Build the baseline ordered pool from weekly schedule active days
  const baseWeekAdmins = sortedActiveDays
    .map(d => cleanAdmin(adminSchedule[d.id]))
    .filter((a): a is string => Boolean(a));

  const adminPool = baseWeekAdmins.length > 0 
    ? baseWeekAdmins 
    : eligibleDutyAdmins.filter(a => !principalCheck(a));

  if (adminPool.length === 0) return directScheduled;

  if (currentDayPos !== -1) {
    // Shift whole week by week index (anchored to academicYearStartDate)
    const shift = academicWeekIdx % adminPool.length;
    const shiftedIdx = (currentDayPos + shift) % adminPool.length;
    return adminPool[shiftedIdx] || directScheduled;
  }

  return directScheduled;
}
