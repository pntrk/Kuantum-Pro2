/**
 * Duty Rotation Utilities
 * Provides continuous annual rotation calculation for teachers across duty locations
 * based on academic week indexing so that rotation is continuous throughout the entire school year.
 */

/**
 * Checks whether a given date is an official national holiday, MEB school break, or custom user-defined holiday in Turkey.
 */
export function isOfficialHoliday(
  dateInput: Date | string, 
  userHolidays: string[] = [],
  excludedHolidays: string[] = []
): boolean {
  if (!dateInput) return false;
  const d = parseDateLocal(dateInput);
  if (isNaN(d.getTime())) return false;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const isoDate = `${y}-${m}-${day}`;
  const monthDay = `${m}-${day}`;

  // 0. Check explicitly excluded / removed holidays by user (overrides national & MEB holidays)
  if (excludedHolidays && Array.isArray(excludedHolidays) && excludedHolidays.includes(isoDate)) {
    return false;
  }

  // 1. Check explicitly saved user custom holidays
  if (userHolidays && Array.isArray(userHolidays) && userHolidays.includes(isoDate)) {
    return true;
  }

  // 2. Fixed Turkish national holidays (every year)
  const fixedNationalHolidays = [
    '01-01', // Yılbaşı
    '04-23', // 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı
    '05-01', // 1 Mayıs Emek ve Dayanışma Günü
    '05-19', // 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı
    '07-15', // 15 Temmuz Demokrasi ve Milli Birlik Günü
    '08-30', // 30 Ağustos Zafer Bayramı
    '10-29', // 29 Ekim Cumhuriyet Bayramı
  ];

  if (fixedNationalHolidays.includes(monthDay)) {
    return true;
  }

  // 3. Known MEB semester breaks, mid-term breaks, and religious holidays (2024-2027)
  const variableHolidays = [
    // 2024
    '2024-10-29',
    '2024-11-11', '2024-11-12', '2024-11-13', '2024-11-14', '2024-11-15',
    // 2025
    '2025-01-20', '2025-01-21', '2025-01-22', '2025-01-23', '2025-01-24',
    '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31',
    '2025-03-30', '2025-03-31', '2025-04-01',
    '2025-03-31', '2025-04-01', '2025-04-02', '2025-04-03', '2025-04-04',
    '2025-06-06', '2025-06-07', '2025-06-08', '2025-06-09',
    '2025-11-10', '2025-11-11', '2025-11-12', '2025-11-13', '2025-11-14',
    // 2026
    '2026-01-19', '2026-01-20', '2026-01-21', '2026-01-22', '2026-01-23',
    '2026-01-26', '2026-01-27', '2026-01-28', '2026-01-29', '2026-01-30',
    '2026-03-20', '2026-03-21', '2026-03-22',
    '2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10',
    '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30',
    '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13',
    // 2027
    '2027-01-25', '2027-01-26', '2027-01-27', '2027-01-28', '2027-01-29',
    '2027-02-01', '2027-02-02', '2027-02-03', '2027-02-04', '2027-02-05',
    '2027-03-09', '2027-03-10', '2027-03-11',
    '2027-04-12', '2027-04-13', '2027-04-14', '2027-04-15', '2027-04-16',
    '2027-05-16', '2027-05-17', '2027-05-18', '2027-05-19',
  ];

  return variableHolidays.includes(isoDate);
}

export function parseDateLocal(dateOrStr: Date | string): Date {
  if (dateOrStr instanceof Date) {
    return new Date(dateOrStr.getFullYear(), dateOrStr.getMonth(), dateOrStr.getDate());
  }
  if (typeof dateOrStr === 'string') {
    const parts = dateOrStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    const d = new Date(dateOrStr);
    return isNaN(d.getTime()) ? new Date() : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  return new Date();
}

export function getDefaultAcademicYearStart(refDate: Date = new Date()): string {
  const m = refDate.getMonth(); // 0-11
  const y = m >= 7 ? refDate.getFullYear() : refDate.getFullYear() - 1; // August (7) or later is new academic year
  return `${y}-09-01`;
}

/**
 * Returns the 0-indexed academic week number for any given date
 * relative to the academic year start date.
 */
export function getAcademicWeekIndex(date: Date | string, anchorStartDateStr?: string): number {
  const targetDate = parseDateLocal(date);
  let anchorDate: Date;
  if (anchorStartDateStr) {
    anchorDate = parseDateLocal(anchorStartDateStr);
  } else {
    anchorDate = parseDateLocal(getDefaultAcademicYearStart(targetDate));
  }

  // Normalize both dates to Monday 00:00:00
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const mon = new Date(d.getFullYear(), d.getMonth(), diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  };

  const targetMon = getMonday(targetDate);
  const anchorMon = getMonday(anchorDate);

  const diffMs = targetMon.getTime() - anchorMon.getTime();
  const weekDiff = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  
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

  // Build ordered pool of UNIQUE vice principals (excluding principals)
  const uniqueAdmins: string[] = [];
  
  // 1. Add clean admins from adminSchedule in active day order
  sortedActiveDays.forEach(d => {
    const adm = cleanAdmin(adminSchedule[d.id]);
    if (adm && !uniqueAdmins.includes(adm)) {
      uniqueAdmins.push(adm);
    }
  });

  // 2. Append any eligible admins not already in uniqueAdmins
  eligibleDutyAdmins.forEach(adm => {
    const cleaned = cleanAdmin(adm);
    if (cleaned && !uniqueAdmins.includes(cleaned)) {
      uniqueAdmins.push(cleaned);
    }
  });

  if (uniqueAdmins.length === 0) return directScheduled;

  if (currentDayPos !== -1) {
    // Continuous active day index formula across academic weeks
    const totalActiveDayIdx = (academicWeekIdx * sortedActiveDays.length) + currentDayPos;
    const shiftedIdx = ((totalActiveDayIdx % uniqueAdmins.length) + uniqueAdmins.length) % uniqueAdmins.length;
    return uniqueAdmins[shiftedIdx] || directScheduled;
  }

  return directScheduled;
}

/**
 * Safely extracts class names, subject name, and combined lesson information from a schedule slot.
 * Handles JSON structures (classes array, cls, className, items for elective courses),
 * delimiter formats (9-A::Matematik, 9-A - Matematik), and optional cross-referencing with classSchedules.
 */
export function extractLessonClassAndSubject(
  rawSlot: any,
  teacher?: string,
  dayIdx?: number,
  pIdx?: number,
  classSchedules?: Record<string, any>
): { classes: string; subject: string; lessonInfo: string } {
  let classes = '';
  let subject = '';

  if (rawSlot) {
    if (typeof rawSlot === 'string') {
      try {
        const parsed = JSON.parse(rawSlot);
        const clsArr = Array.isArray(parsed.classes)
          ? parsed.classes
          : (parsed.cls ? [parsed.cls] : (parsed.className ? [parsed.className] : (parsed.class ? [parsed.class] : [])));
        classes = clsArr.filter(Boolean).map(String).join(', ');

        if (!classes && Array.isArray(parsed.items)) {
          const itemClasses = parsed.items.flatMap((it: any) => {
            if (!it) return [];
            if (Array.isArray(it.classes)) return it.classes;
            if (it.cls) return [it.cls];
            if (it.className) return [it.className];
            if (it.class) return [it.class];
            return [];
          });
          classes = [...new Set(itemClasses.filter(Boolean).map(String))].join(', ');
        }
        subject = parsed.subject || parsed.lesson || '';
      } catch {
        if (rawSlot.includes('::')) {
          const parts = rawSlot.split('::');
          classes = (parts[0] || '').trim();
          subject = (parts[1] || '').trim();
        } else if (rawSlot.includes(' - ')) {
          const parts = rawSlot.split(' - ');
          classes = (parts[0] || '').trim();
          subject = (parts[1] || '').trim();
        } else {
          subject = rawSlot.trim();
        }
      }
    } else if (typeof rawSlot === 'object') {
      const clsArr = Array.isArray(rawSlot.classes)
        ? rawSlot.classes
        : (rawSlot.cls ? [rawSlot.cls] : (rawSlot.className ? [rawSlot.className] : (rawSlot.class ? [rawSlot.class] : [])));
      classes = clsArr.filter(Boolean).map(String).join(', ');
      subject = rawSlot.subject || rawSlot.lesson || '';
    }
  }

  // Cross-reference fallback with classSchedules if classes couldn't be extracted from teacher's slot
  if (!classes && classSchedules && typeof dayIdx === 'number' && dayIdx >= 0 && typeof pIdx === 'number' && teacher) {
    const matchedClasses: string[] = [];
    Object.keys(classSchedules).forEach(clsName => {
      const cSlot = classSchedules[clsName]?.[dayIdx]?.[pIdx];
      if (cSlot) {
        if (typeof cSlot === 'string') {
          try {
            const cParsed = JSON.parse(cSlot);
            const tList = Array.isArray(cParsed.teachers)
              ? cParsed.teachers
              : (cParsed.teacher ? [cParsed.teacher] : []);
            if (tList.includes(teacher) || cParsed.teacher === teacher) {
              matchedClasses.push(clsName);
              if (!subject && cParsed.subject) subject = cParsed.subject;
            }
          } catch {
            if (cSlot.includes(teacher)) {
              matchedClasses.push(clsName);
            }
          }
        } else if (typeof cSlot === 'object') {
          const tList = Array.isArray(cSlot.teachers)
            ? cSlot.teachers
            : (cSlot.teacher ? [cSlot.teacher] : []);
          if (tList.includes(teacher) || cSlot.teacher === teacher) {
            matchedClasses.push(clsName);
            if (!subject && cSlot.subject) subject = cSlot.subject;
          }
        }
      }
    });
    if (matchedClasses.length > 0) {
      classes = [...new Set(matchedClasses)].join(', ');
    }
  }

  const lessonInfo = [classes, subject].filter(Boolean).join(' ').trim() || subject || classes || 'Ders';

  return { classes, subject, lessonInfo };
}
