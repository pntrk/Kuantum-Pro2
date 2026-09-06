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
