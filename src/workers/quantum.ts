/**
 * Quantum Distribution Web Worker (quantum.ts)
 * Offloads 100% of Bitmask, Kempe Chain, Tabu Search, Micro-Ruin & Recreate,
 * and Predictive MRV / Heuristic Difficulty Heatmap calculations from the React Main Thread.
 */

import { 
  WorkerInboundMessage, 
  WorkerInboundType, 
  WorkerOutboundType,
  StartDistributionMessage,
  DistributionResult,
  CourseCard,
  SchedulesMap
} from '../types/workerMessages';
import { DifficultyHeatmapMatrix, CardHeatmap } from '../types/shadowAnalysisTypes';

let shouldStop = false;
let currentWorkerIndex = 0;
let isCurrentlySolving = false;
const workerStartTime = performance.now();

// Global Worker Error Listeners to prevent silent thread death
self.addEventListener('error', (event: ErrorEvent) => {
  try {
    self.postMessage({
      type: WorkerOutboundType.UNCAUGHT_EXCEPTION,
      message: event.message || 'Worker Uncaught Exception',
      stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      workerIndex: currentWorkerIndex,
      isFatal: true,
      canRetry: true
    });
  } catch (postErr) {
    console.error('[Worker Global Error]', event);
  }
});

self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  try {
    const reason = event.reason;
    self.postMessage({
      type: WorkerOutboundType.UNCAUGHT_EXCEPTION,
      message: (reason && reason.message) ? reason.message : String(reason),
      stack: (reason && reason.stack) ? reason.stack : undefined,
      workerIndex: currentWorkerIndex,
      isFatal: false,
      canRetry: true
    });
  } catch (postErr) {
    console.error('[Worker Global Unhandled Rejection]', event);
  }
});

self.addEventListener('messageerror', (event: MessageEvent) => {
  try {
    self.postMessage({
      type: WorkerOutboundType.ERROR,
      message: 'Worker received non-deserializable message payload (MessageError)',
      workerIndex: currentWorkerIndex,
      isFatal: true,
      canRetry: true
    });
  } catch (e) {
    console.error('[Worker MessageError]', event);
  }
});

/**
 * Throttled Progress Emitter to avoid overwhelming the postMessage channel & UI thread
 */
class WorkerProgressReporter {
  private lastEmitTime = 0;
  private lastProgress = -1;
  private throttleMs: number;

  constructor(throttleMs: number = 80) {
    this.throttleMs = throttleMs;
  }

  public setThrottle(ms: number) {
    this.throttleMs = ms;
  }

  public report(
    progress: number, 
    phase: string, 
    iter?: number, 
    unplaced?: number, 
    stats?: { temperature?: number; bestCost?: number },
    force: boolean = false
  ) {
    const now = performance.now();
    const progressChanged = Math.abs(progress - this.lastProgress) >= 1;
    
    if (force || progressChanged || (now - this.lastEmitTime >= this.throttleMs)) {
      this.lastEmitTime = now;
      this.lastProgress = progress;

      self.postMessage({
        type: WorkerOutboundType.PROGRESS,
        progress,
        phase,
        workerIndex: currentWorkerIndex,
        iter,
        unplaced,
        stats
      });
    }
  }
}

const progressReporter = new WorkerProgressReporter(80);

const parseCellData = (valStr: any) => {
  if (!valStr || typeof valStr !== 'string') return null;
  try {
    const parsed = JSON.parse(valStr);
    return {
      ...parsed,
      id: parsed.id || 'id_' + Math.random().toString(36).substring(2, 9),
      teachers: Array.isArray(parsed.teachers) ? parsed.teachers : (parsed.teacher ? [parsed.teacher] : []),
      classes: Array.isArray(parsed.classes) ? parsed.classes : (parsed.cls ? [parsed.cls] : []),
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      subject: parsed.subject || "",
      span: parsed.span || 1
    };
  } catch (err) {
    return null;
  }
};

/**
 * Core Quantum Optimization Engine with Memory Leak Guards
 */
async function runQuantumDistribution(payload: StartDistributionMessage['payload']) {
  if (isCurrentlySolving) {
    // Reset state if another job was active
    shouldStop = true;
    await new Promise(r => setTimeout(r, 20));
  }
  
  isCurrentlySolving = true;
  shouldStop = false;

  const {
    unplacedCourses,
    schoolSettings,
    schedules,
    classSchedules,
    roomSchedules,
    lockedCells = {},
    constraints = { teachers: {}, classes: {}, subjects: {}, rooms: {} },
    workerIndex = 0,
    heuristicHeatmap,
    options
  } = payload;

  currentWorkerIndex = workerIndex;
  if (options?.progressThrottleMs) {
    progressReporter.setThrottle(options.progressThrottleMs);
  }

  if (!unplacedCourses || !Array.isArray(unplacedCourses) || unplacedCourses.length === 0) {
    isCurrentlySolving = false;
    self.postMessage({ 
      type: WorkerOutboundType.ERROR, 
      message: 'Dağıtılacak kart havuzda yok veya veri yapısı geçersiz.',
      workerIndex: currentWorkerIndex,
      isFatal: false,
      canRetry: false
    });
    return;
  }

  if (!schoolSettings || !Array.isArray(schoolSettings.weekDays)) {
    isCurrentlySolving = false;
    self.postMessage({ 
      type: WorkerOutboundType.ERROR, 
      message: 'Okul ayarları eksik veya geçersiz.',
      workerIndex: currentWorkerIndex,
      isFatal: true,
      canRetry: false
    });
    return;
  }

  progressReporter.report(0, 'Kuantum AI Motoru (Tabu Search/Bitmask) Başlatılıyor...', 0, unplacedCourses.length, undefined, true);
  
  // Yield briefly to let initial message hit main thread
  await new Promise(r => setTimeout(r, 16));
  if (shouldStop) {
    isCurrentlySolving = false;
    return;
  }

  const activeDays = schoolSettings.weekDays.filter(d => d.active);
  if (activeDays.length === 0) {
    isCurrentlySolving = false;
    self.postMessage({ 
      type: WorkerOutboundType.ERROR, 
      message: 'Aktif gün bulunamadı. Lütfen okul ayarlarını kontrol edin.',
      workerIndex: currentWorkerIndex,
      isFatal: true,
      canRetry: false
    });
    return;
  }
  
  // Entity compilation
  const T_map: Record<string, number> = {}; let T_count = 0; const T_rev: string[] = [];
  const C_map: Record<string, number> = {}; let C_count = 0; const C_rev: string[] = [];
  const R_map: Record<string, number> = {}; let R_count = 0; const R_rev: string[] = [];
  
  const getT = (t: string) => { if (T_map[t] === undefined) { T_map[t] = T_count++; T_rev.push(t); } return T_map[t]; };
  const getC = (c: string) => { if (C_map[c] === undefined) { C_map[c] = C_count++; C_rev.push(c); } return C_map[c]; };
  const getR = (r: string) => { if (R_map[r] === undefined) { R_map[r] = R_count++; R_rev.push(r); } return R_map[r]; };
  
  const boardCards = new Map<string, any>();

  // Unified helper function to scan any schedule map (teachers, classes, rooms) and collect board cards
  const scanScheduleForBoardCards = (targetScheduleMap?: SchedulesMap) => {
    if (!targetScheduleMap) return;

    Object.keys(targetScheduleMap).forEach(key => {
      const scheduleGrid = targetScheduleMap[key];
      if (!scheduleGrid) return;

      for (let d = 0; d < 7; d++) {
        const dayRow = scheduleGrid[d];
        if (!dayRow) continue;

        for (let p = 0; p < 15; p++) {
          const val = dayRow[p];
          if (val && typeof val === 'string' && val.trim() !== '') {
            const cData = parseCellData(val);
            if (cData) {
              // Calculate contiguous span for this card in the current entity's row
              let hours = 0;
              while (p + hours < 15 && dayRow[p + hours] === val) {
                hours++;
              }
              if (hours === 0) hours = cData.span || 1;

              // Unique ID format prevents overwriting split/disconnected blocks sharing the same base ID
              const uniqueBlockId = `${cData.id}_${d}_${p}`;

              if (!boardCards.has(uniqueBlockId)) {
                let isLocked = false;
                for (let i = 0; i < hours; i++) {
                  const checkPeriod = p + i;
                  if (cData.teachers && Array.isArray(cData.teachers)) {
                    cData.teachers.forEach((t: string) => {
                      if (lockedCells[`${t}-${d}-${checkPeriod}`]) isLocked = true;
                    });
                  }
                  if (cData.classes && Array.isArray(cData.classes)) {
                    cData.classes.forEach((c: string) => {
                      if (lockedCells[`${c}-${d}-${checkPeriod}`]) isLocked = true;
                    });
                  }
                  if (cData.rooms && Array.isArray(cData.rooms)) {
                    cData.rooms.forEach((r: string) => {
                      if (lockedCells[`${r}-${d}-${checkPeriod}`]) isLocked = true;
                    });
                  }
                }

                boardCards.set(uniqueBlockId, {
                  ...cData,
                  id: uniqueBlockId,
                  originalId: cData.id,
                  teachers: cData.teachers || [],
                  classes: cData.classes || [],
                  rooms: cData.rooms || [],
                  subject: cData.subject || '',
                  hours: hours,
                  d: d,
                  p: p,
                  isLocked: isLocked,
                  fromBoard: true
                });
              }

              // Advance p over the contiguous block in this row
              if (hours > 1) {
                p += hours - 1;
              }
            }
          }
        }
      }
    });
  };

  // Sequentially scan teacher schedules, class schedules, and room schedules
  scanScheduleForBoardCards(schedules);
  scanScheduleForBoardCards(classSchedules);
  scanScheduleForBoardCards(roomSchedules);

  const solverCards: any[] = [];
  unplacedCourses.forEach(c => solverCards.push({ ...c, isLocked: false, d: -1, p: -1, fromBoard: false }));
  boardCards.forEach(c => solverCards.push(c));

  const S_map: Record<string, number> = {}; let S_count = 0;
  const getS = (s: string) => {
    if (!s) return -1;
    if (S_map[s] === undefined) S_map[s] = S_count++;
    return S_map[s];
  };

  // Build fast card heatmap lookup map
  const heatmapCardsMap = new Map<string, CardHeatmap>();
  const heatmapBySignature = new Map<string, CardHeatmap>();

  if (heuristicHeatmap?.cards) {
    Object.values(heuristicHeatmap.cards).forEach((hc: CardHeatmap) => {
      if (hc.cardId) {
        heatmapCardsMap.set(String(hc.cardId), hc);
      }
      // Signature fallback: subject|teachers|classes|hours
      const sig = `${hc.subject || ''}|${(hc.teachers || []).sort().join(',')}|${(hc.classes || []).sort().join(',')}|${hc.hours || 1}`;
      heatmapBySignature.set(sig, hc);
    });
  }

  solverCards.forEach(c => {
    c.mappedTeachers = (c.teachers || []).map(getT);
    c.mappedClasses = (c.classes || []).map(getC);
    c.mappedRooms = (c.rooms || []).map(getR);
    c.mappedSubject = getS(c.subject);

    // Attach precomputed Heuristic Heatmap weight & metadata
    const baseId = c.originalId || c.id;
    const sig = `${c.subject || ''}|${(c.teachers || []).sort().join(',')}|${(c.classes || []).sort().join(',')}|${c.hours || 1}`;
    const heatmapEntry = heatmapCardsMap.get(String(c.id)) || heatmapCardsMap.get(String(baseId)) || heatmapBySignature.get(sig);

    if (heatmapEntry) {
      c.heuristicWeight = Number(heatmapEntry.heuristicWeight) || 0;
      c.validSlotsCount = heatmapEntry.validSlotsCount ?? 10;
      c.isDeadEnd = !!heatmapEntry.isDeadEnd;
      c.difficultyLevel = heatmapEntry.difficultyLevel || 'medium';
    } else {
      // Dynamic fallback heuristic score: prioritize larger blocks and heavily constrained resources
      const hours = c.hours || 1;
      const teacherCount = (c.mappedTeachers || []).length;
      const classCount = (c.mappedClasses || []).length;
      c.heuristicWeight = (hours * 250) + (teacherCount * 120) + (classCount * 120);
      c.validSlotsCount = 10;
      c.isDeadEnd = false;
      c.difficultyLevel = hours >= 3 ? 'high' : 'medium';
    }
  });

  const state_T = new Int32Array(Math.max(1, T_count) * 7);
  const state_C = new Int32Array(Math.max(1, C_count) * 7);
  const state_R = new Int32Array(Math.max(1, R_count) * 7);
  
  const constraint_T = new Int32Array(Math.max(1, T_count) * 7);
  const constraint_C = new Int32Array(Math.max(1, C_count) * 7);
  const constraint_R = new Int32Array(Math.max(1, R_count) * 7);
  
  // Subject constraints bitmasks
  const subjectConstraintsMask = new Map<number, Int32Array>();
  if (constraints?.subjects) {
    Object.keys(constraints.subjects).forEach(subName => {
      const subId = getS(subName);
      if (subId !== -1) {
        const masks = new Int32Array(7);
        const dpList = constraints.subjects[subName] || [];
        dpList.forEach(dp => {
          const parts = dp.split('-');
          const d = Number(parts[0]);
          const p = Number(parts[1]);
          if (d >= 0 && d < 7 && p >= 0 && p < 15) {
            masks[d] |= (1 << p);
          }
        });
        subjectConstraintsMask.set(subId, masks);
      }
    });
  }

  // Populate manual constraints
  ['teachers', 'classes', 'rooms'].forEach(type => {
    const obj = (constraints as any)?.[type] || {};
    Object.keys(obj).forEach(k => {
      const id = type === 'teachers' ? T_map[k] : (type === 'classes' ? C_map[k] : R_map[k]);
      if (id !== undefined) {
        obj[k].forEach((dp: string) => {
          const parts = dp.split('-');
          const d = Number(parts[0]);
          const p = Number(parts[1]);
          if (type === 'teachers') constraint_T[id * 7 + d] |= (1 << p);
          if (type === 'classes') constraint_C[id * 7 + d] |= (1 << p);
          if (type === 'rooms') constraint_R[id * 7 + d] |= (1 << p);
        });
      }
    });
  });

  // Populate locked cells
  T_rev.forEach((t, id) => {
    for (let d = 0; d < 7; d++) {
      for (let p = 0; p < 15; p++) {
        if (lockedCells[`${t}-${d}-${p}`]) constraint_T[id * 7 + d] |= (1 << p);
      }
    }
  });
  C_rev.forEach((c, id) => {
    for (let d = 0; d < 7; d++) {
      for (let p = 0; p < 15; p++) {
        if (lockedCells[`${c}-${d}-${p}`]) constraint_C[id * 7 + d] |= (1 << p);
      }
    }
  });
  R_rev.forEach((r, id) => {
    for (let d = 0; d < 7; d++) {
      for (let p = 0; p < 15; p++) {
        if (lockedCells[`${r}-${d}-${p}`]) constraint_R[id * 7 + d] |= (1 << p);
      }
    }
  });

  const classSubjectCounts = Array.from({ length: Math.max(1, C_count) }, () => Array(7).fill(0).map(() => new Map<number, number>()));
  const addSubject = (c_id: number, d: number, sId: number) => {
    if (sId === -1) return;
    const map = classSubjectCounts[c_id]?.[d];
    if (map) map.set(sId, (map.get(sId) || 0) + 1);
  };

  const removeSubject = (c_id: number, d: number, sId: number) => {
    if (sId === -1) return;
    const map = classSubjectCounts[c_id]?.[d];
    const count = map ? (map.get(sId) || 0) : 0;
    if (count <= 1) {
      if (map) map.delete(sId);
    } else {
      if (map) map.set(sId, count - 1);
    }
  };

  const grid_T = Array.from({ length: Math.max(1, T_count) * 7 }, () => new Int32Array(15).fill(-1));
  const grid_C = Array.from({ length: Math.max(1, C_count) * 7 }, () => new Int32Array(15).fill(-1));
  const grid_R = Array.from({ length: Math.max(1, R_count) * 7 }, () => new Int32Array(15).fill(-1));
  
  const movableCards: any[] = [];
  const movableMap = new Map<number, any>();
  
  const unplacedList: number[] = [];
  const unplacedPos = new Map<number, number>();
  
  const addToUnplaced = (cardId: number) => {
    if (unplacedPos.has(cardId)) return;
    unplacedList.push(cardId);
    unplacedPos.set(cardId, unplacedList.length - 1);
  };
  
  const removeFromUnplaced = (cardId: number) => {
    const idx = unplacedPos.get(cardId);
    if (idx === undefined) return;
    const lastCardId = unplacedList[unplacedList.length - 1];
    unplacedList[idx] = lastCardId;
    unplacedPos.set(lastCardId, idx);
    unplacedList.pop();
    unplacedPos.delete(cardId);
  };

  solverCards.forEach((c, idx) => {
    c.mappedId = idx;
    if (c.isLocked) {
      const mask = ((1 << c.hours) - 1) << c.p;
      c.mappedTeachers.forEach((t: number) => { state_T[t * 7 + c.d] |= mask; for (let i = 0; i < c.hours; i++) grid_T[t * 7 + c.d][c.p + i] = c.mappedId; });
      c.mappedClasses.forEach((cl: number) => { state_C[cl * 7 + c.d] |= mask; for (let i = 0; i < c.hours; i++) grid_C[cl * 7 + c.d][c.p + i] = c.mappedId; addSubject(cl, c.d, c.mappedSubject); });
      c.mappedRooms.forEach((r: number) => { state_R[r * 7 + c.d] |= mask; for (let i = 0; i < c.hours; i++) grid_R[r * 7 + c.d][c.p + i] = c.mappedId; });
    } else {
      c.failCount = 0;
      movableCards.push(c);
      movableMap.set(c.mappedId, c);
      if (c.d !== -1) {
        const mask = ((1 << c.hours) - 1) << c.p;
        c.mappedTeachers.forEach((t: number) => { state_T[t * 7 + c.d] |= mask; for (let i = 0; i < c.hours; i++) grid_T[t * 7 + c.d][c.p + i] = c.mappedId; });
        c.mappedClasses.forEach((cl: number) => { state_C[cl * 7 + c.d] |= mask; for (let i = 0; i < c.hours; i++) grid_C[cl * 7 + c.d][c.p + i] = c.mappedId; addSubject(cl, c.d, c.mappedSubject); });
        c.mappedRooms.forEach((r: number) => { state_R[r * 7 + c.d] |= mask; for (let i = 0; i < c.hours; i++) grid_R[r * 7 + c.d][c.p + i] = c.mappedId; });
      } else {
        addToUnplaced(c.mappedId);
      }
    }
  });

  const place = (c: any, d: number, p: number) => {
    const mask = ((1 << c.hours) - 1) << p;
    c.mappedTeachers.forEach((t: number) => { state_T[t * 7 + d] |= mask; for (let i = 0; i < c.hours; i++) grid_T[t * 7 + d][p + i] = c.mappedId; });
    c.mappedClasses.forEach((cl: number) => { state_C[cl * 7 + d] |= mask; addSubject(cl, d, c.mappedSubject); for (let i = 0; i < c.hours; i++) grid_C[cl * 7 + d][p + i] = c.mappedId; });
    c.mappedRooms.forEach((r: number) => { state_R[r * 7 + d] |= mask; for (let i = 0; i < c.hours; i++) grid_R[r * 7 + d][p + i] = c.mappedId; });
    c.d = d;
    c.p = p;
    removeFromUnplaced(c.mappedId);
  };

  const remove = (c: any) => {
    if (c.d === -1) return;
    const mask = ((1 << c.hours) - 1) << c.p;
    c.mappedTeachers.forEach((t: number) => { state_T[t * 7 + c.d] &= ~mask; for (let i = 0; i < c.hours; i++) grid_T[t * 7 + c.d][c.p + i] = -1; });
    c.mappedClasses.forEach((cl: number) => { state_C[cl * 7 + c.d] &= ~mask; removeSubject(cl, c.d, c.mappedSubject); for (let i = 0; i < c.hours; i++) grid_C[cl * 7 + c.d][c.p + i] = -1; });
    c.mappedRooms.forEach((r: number) => { state_R[r * 7 + c.d] &= ~mask; for (let i = 0; i < c.hours; i++) grid_R[r * 7 + c.d][c.p + i] = -1; });
    c.d = -1;
    c.p = -1;
    addToUnplaced(c.mappedId);
  };

  const getConflicts = (c: any, d: number, p: number, forceHardOnly: boolean = false) => {
    const mask = ((1 << c.hours) - 1) << p;
    // Hard constraint: subject constraint mask (manual unavailability of subject on that day/period)
    const subMasks = subjectConstraintsMask.get(c.mappedSubject);
    if (subMasks && (subMasks[d] & mask) !== 0) return null;
    
    // Hard constraints: Teacher, Class, Room unavailable time masks (constraint_T, constraint_C, constraint_R)
    for (let i = 0; i < c.mappedTeachers.length; i++) {
      const t = c.mappedTeachers[i];
      if ((constraint_T[t * 7 + d] & mask) !== 0) return null;
    }
    for (let i = 0; i < c.mappedClasses.length; i++) {
      const cl = c.mappedClasses[i];
      if ((constraint_C[cl * 7 + d] & mask) !== 0) return null;
    }
    for (let i = 0; i < c.mappedRooms.length; i++) {
      const r = c.mappedRooms[i];
      if ((constraint_R[r * 7 + d] & mask) !== 0) return null;
    }
    
    // Fallback: check manual subject constraints as string keys just to be safe
    if (c.subject && constraints?.subjects?.[c.subject]) {
      for (let i = 0; i < c.hours; i++) {
         if (constraints.subjects[c.subject].includes(`${d}-${p + i}`)) return null;
      }
    }

    const conflicts: number[] = [];

    // Phase 1 Soft Constraints: Relax / ignore soft constraints if forceHardOnly is true OR failCount > 50
    const evaluateSoft = !forceHardOnly && (c.failCount || 0) <= 50;
    if (evaluateSoft) {
      const rules = (schoolSettings as any).distributionRules || { preventSameDay: true };
      
      for (let i = 0; i < c.mappedClasses.length; i++) {
        const cl = c.mappedClasses[i];
        let sameDayCards: number[] = [];
        for (let hr = 0; hr < 15; hr++) {
          const id = grid_C[cl * 7 + d][hr];
          if (id !== -1 && id !== c.mappedId && !sameDayCards.includes(id)) {
            const existingCard = movableMap.get(id);
            if (existingCard && existingCard.mappedSubject === c.mappedSubject) {
              sameDayCards.push(id);
            }
          }
        }
        
        if (sameDayCards.length > 0) {
          if (rules.preventSameDay) {
            sameDayCards.forEach(id => { if (!conflicts.includes(id)) conflicts.push(id); });
          } else {
            let totalHours = c.hours;
            sameDayCards.forEach(id => {
              const ex = movableMap.get(id);
              if (ex) totalHours += ex.hours;
            });
            if (rules.maxHoursActive && totalHours > rules.maxHours) {
              sameDayCards.forEach(id => { if (!conflicts.includes(id)) conflicts.push(id); });
            }
          }
        }
      }
    }

    // Hard constraints: Overlapping occupied time slots for Teacher, Class, Room
    for (let i = 0; i < c.mappedTeachers.length; i++) {
      const t = c.mappedTeachers[i];
      if ((state_T[t * 7 + d] & mask) !== 0) {
        for (let hr = 0; hr < c.hours; hr++) {
          const id = grid_T[t * 7 + d][p + hr];
          if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
        }
      }
    }
    for (let i = 0; i < c.mappedClasses.length; i++) {
      const cl = c.mappedClasses[i];
      if ((state_C[cl * 7 + d] & mask) !== 0) {
        for (let hr = 0; hr < c.hours; hr++) {
          const id = grid_C[cl * 7 + d][p + hr];
          if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
        }
      }
    }
    for (let i = 0; i < c.mappedRooms.length; i++) {
      const r = c.mappedRooms[i];
      if ((state_R[r * 7 + d] & mask) !== 0) {
        for (let hr = 0; hr < c.hours; hr++) {
          const id = grid_R[r * 7 + d][p + hr];
          if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
        }
      }
    }
    
    return conflicts;
  };

  const getHardConflicts = (c: any, d: number, p: number) => {
    return getConflicts(c, d, p, true);
  };

  // Soft Penalty Evaluation for a card at position (d, p)
  const calcCardSoftPenalty = (card: any, d: number, p: number): number => {
    if (d === -1 || p === -1) return 1000;
    let penalty = 0;
    const rules = (schoolSettings as any).distributionRules || { preventSameDay: true };

    if (card.mappedClasses && card.mappedClasses.length > 0 && card.mappedSubject !== -1) {
      for (let ci = 0; ci < card.mappedClasses.length; ci++) {
        const cl = card.mappedClasses[ci];
        const sameDayCards: any[] = [];
        const seenIds = new Set<number>();

        for (let hr = 0; hr < 15; hr++) {
          const id = grid_C[cl * 7 + d][hr];
          if (id !== -1 && id !== card.mappedId && !seenIds.has(id)) {
            seenIds.add(id);
            const otherCard = movableMap.get(id);
            if (otherCard && otherCard.mappedSubject === card.mappedSubject) {
              sameDayCards.push(otherCard);
            }
          }
        }

        if (sameDayCards.length > 0) {
          if (rules.preventSameDay) {
            penalty += 100 * sameDayCards.length;
          }

          let totalHours = card.hours;
          sameDayCards.forEach(oc => totalHours += oc.hours);

          if (rules.maxHoursActive && totalHours > rules.maxHours) {
            penalty += 50 * (totalHours - rules.maxHours);
          }

          if (rules.minGapActive || rules.maxGapActive) {
            sameDayCards.forEach(oc => {
              const gap = p > oc.p ? (p - (oc.p + oc.hours)) : (oc.p - (p + card.hours));
              if (rules.minGapActive && gap < rules.minGap) {
                penalty += 30 * (rules.minGap - gap);
              }
              if (rules.maxGapActive && gap > rules.maxGap) {
                penalty += 30 * (gap - rules.maxGap);
              }
            });
          }
        }
      }
    }

    return penalty;
  };

  const calcTotalSoftPenalty = (): number => {
    let total = 0;
    for (let i = 0; i < movableCards.length; i++) {
      const c = movableCards[i];
      if (c.d !== -1) {
        total += calcCardSoftPenalty(c, c.d, c.p);
      } else {
        total += 5000;
      }
    }
    return total;
  };

  let bestState: any = null;
  let minUnplacedCount = unplacedList.length;
  
  const saveBestState = () => {
    bestState = movableCards.map(c => ({ id: c.id, d: c.d, p: c.p }));
  };
  saveBestState();

  const tabuQueue: number[] = [];
  const tabuSet = new Set<number>();
  const maxTabuSize = Math.max(30, Math.floor(movableCards.length * 0.85));
  
  const getTabuKey = (c_id: number, d: number, p: number) => {
    return (c_id << 8) | (d << 4) | p;
  };
  
  const shuffleArray = (arr: any[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  };

  const shuffledDaysIndices = activeDays.map(day => day.id - 1);
  const bonus = (options?.seedBonus || 0) + (workerIndex || 0);
  for (let i = 0; i < bonus + 1; i++) shuffleArray(shuffledDaysIndices);

  const startsScratch = new Int32Array(16);
  const getShuffledStarts = (len: number) => {
    for (let i = 0; i < len; i++) startsScratch[i] = i;
    for (let i = len - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = startsScratch[i];
      startsScratch[i] = startsScratch[j];
      startsScratch[j] = temp;
    }
    return startsScratch;
  };

  // Fast bit popcount lookup table
  const POPCOUNT = new Uint8Array(65536);
  for (let i = 0; i < 65536; i++) {
    let cnt = 0;
    let n = i;
    while (n > 0) {
      cnt += (n & 1);
      n >>>= 1;
    }
    POPCOUNT[i] = cnt;
  }

  // Ultra-Fast Predictive Heuristic Card Selection (O(N)) using Precomputed Difficulty Heatmap
  const pickHardestCard = (): any => {
    if (unplacedList.length === 0) return null;
    if (unplacedList.length === 1) return movableMap.get(unplacedList[0]);

    let bestCard: any = null;
    let maxDifficultyScore = -Infinity;

    for (let i = 0; i < unplacedList.length; i++) {
      const cardId = unplacedList[i];
      const card = movableMap.get(cardId);
      if (!card) continue;

      // Base difficulty from shadow Heatmap (or precomputed heuristic weight)
      const baseWeight = card.heuristicWeight || ((card.hours || 1) * 250);
      const hoursBonus = (card.hours || 1) * 120;
      // Adaptive failure penalty so stuck cards get prioritized for ejection / Kempe swaps
      const failurePenalty = (card.failCount || 0) * 80;
      // Dead-end priority bonus (place dead-ends first before space fills up)
      const deadEndBonus = card.isDeadEnd ? 600 : 0;
      // Fewest valid slots bonus (if validSlotsCount is known)
      const slotBonus = card.validSlotsCount !== undefined ? Math.max(0, (20 - card.validSlotsCount) * 15) : 0;

      const totalScore = baseWeight + hoursBonus + failurePenalty + deadEndBonus + slotBonus;

      if (totalScore > maxDifficultyScore) {
        maxDifficultyScore = totalScore;
        bestCard = card;
      }
    }

    return bestCard || movableMap.get(unplacedList[0]);
  };

  // Kempe Chain / Ejection Chain (Takas Zinciri) - Resolves local conflicts without massive destruction
  const tryEjectionChain = (c: any): boolean => {
    shuffleArray(shuffledDaysIndices);

    for (let di = 0; di < shuffledDaysIndices.length; di++) {
      const d = shuffledDaysIndices[di];
      const maxPeriods = schoolSettings.weekDays[d]?.periods || 9;
      const maxStart = maxPeriods - c.hours;
      if (maxStart < 0) continue;

      const starts = getShuffledStarts(maxStart + 1);
      for (let pi = 0; pi <= maxStart; pi++) {
        const p = starts[pi];
        const tabuKey = getTabuKey(c.mappedId, d, p);
        if (tabuSet.has(tabuKey)) continue;

        const conflicts = getConflicts(c, d, p);
        if (conflicts === null) continue;

        // 1. Direct Zero-Conflict Placement
        if (conflicts.length === 0) {
          place(c, d, p);
          return true;
        }

        // 2. Ejection Chain / Kempe Swap (for 1 or 2 conflicting cards)
        if (conflicts.length <= 2) {
          const confCards = conflicts.map(id => movableMap.get(id)).filter(Boolean);
          if (confCards.length !== conflicts.length) continue;

          // Save previous positions for rollback
          const savedPositions = confCards.map(cc => ({ card: cc, origD: cc.d, origP: cc.p }));

          // Temporarily eject conflicting cards
          confCards.forEach(cc => remove(cc));
          place(c, d, p);

          const relocations: { card: any; d: number; p: number }[] = [];
          let allRelocated = true;

          for (let ci = 0; ci < confCards.length; ci++) {
            const ejectedCard = confCards[ci];
            let relocated = false;

            // Search for an alternative zero-conflict slot across all active days
            for (let d2i = 0; d2i < shuffledDaysIndices.length; d2i++) {
              const d2 = shuffledDaysIndices[d2i];
              const maxPeriods2 = schoolSettings.weekDays[d2]?.periods || 9;
              const maxStart2 = maxPeriods2 - ejectedCard.hours;
              if (maxStart2 < 0) continue;

              const starts2 = getShuffledStarts(maxStart2 + 1);
              for (let p2i = 0; p2i <= maxStart2; p2i++) {
                const p2 = starts2[p2i];
                // Avoid placing back in same spot if conflicting
                const conf2 = getConflicts(ejectedCard, d2, p2);
                if (conf2 !== null && conf2.length === 0) {
                  place(ejectedCard, d2, p2);
                  relocations.push({ card: ejectedCard, d: d2, p: p2 });
                  relocated = true;
                  break;
                }
              }
              if (relocated) break;
            }

            if (!relocated) {
              allRelocated = false;
              break;
            }
          }

          if (allRelocated) {
            // Ejection Chain succeeded! Both c and all ejected cards are placed in 0-conflict slots
            return true;
          } else {
            // Rollback: undo placed relocations, remove c, and restore conflicting cards to original slots
            relocations.forEach(r => remove(r.card));
            remove(c);
            savedPositions.forEach(sp => place(sp.card, sp.origD, sp.origP));
          }
        }
      }
    }

    return false;
  };

  // ==========================================
  // PHASE 0: PREDICTIVE FAST GREEDY SEEDING
  // Uses precomputed Heatmap heuristic weights to place the hardest cards
  // into zero-conflict slots in the first milliseconds.
  // ==========================================
  if (unplacedList.length > 0) {
    const unplacedToSeed = [...unplacedList];
    unplacedToSeed.sort((aId, bId) => {
      const cardA = movableMap.get(aId);
      const cardB = movableMap.get(bId);
      const weightA = (cardA?.heuristicWeight || 0) + (cardA?.isDeadEnd ? 600 : 0) + ((cardA?.hours || 1) * 150);
      const weightB = (cardB?.heuristicWeight || 0) + (cardB?.isDeadEnd ? 600 : 0) + ((cardB?.hours || 1) * 150);
      return weightB - weightA;
    });

    let seededCount = 0;
    for (let si = 0; si < unplacedToSeed.length; si++) {
      if (shouldStop) break;
      const cardId = unplacedToSeed[si];
      const c = movableMap.get(cardId);
      if (!c || c.d !== -1) continue;

      let bestD = -1;
      let bestP = -1;
      let bestSlotPenalty = Infinity;

      for (let di = 0; di < activeDays.length; di++) {
        const d = activeDays[di].id - 1;
        const maxPeriods = schoolSettings.weekDays[d]?.periods || 9;
        const maxStart = maxPeriods - c.hours;
        if (maxStart < 0) continue;

        for (let p = 0; p <= maxStart; p++) {
          const conflicts = getConflicts(c, d, p);
          if (conflicts !== null && conflicts.length === 0) {
            const softPenalty = calcCardSoftPenalty(c, d, p);
            // Compact packing score: prefer earlier periods & lower soft penalty
            const totalSlotScore = softPenalty * 20 + p;
            if (totalSlotScore < bestSlotPenalty) {
              bestSlotPenalty = totalSlotScore;
              bestD = d;
              bestP = p;
            }
          }
        }
      }

      if (bestD !== -1) {
        place(c, bestD, bestP);
        seededCount++;
      }
    }

    if (seededCount > 0) {
      saveBestState();
      minUnplacedCount = unplacedList.length;
      const initialPlacedPct = Math.floor(((movableCards.length - unplacedList.length) / movableCards.length) * 100);
      progressReporter.report(
        Math.min(95, initialPlacedPct),
        `Öngörülü Zorluk Haritası ile Hızlı Seeding: ${seededCount} zor kart ilk saniyede sıfır çakışmayla yerleştirildi! (Kalan: ${unplacedList.length})`,
        0,
        unplacedList.length,
        undefined,
        true
      );
    }
  }

  const startTime = performance.now();
  let iter = 0;
  let lastImprovement = 0;
  let ruinStreak = 0;
  let T = 300.0;
  const COOLING_RATE = 0.9999;
  const MIN_TEMP = 0.1;
  const maxIterations = options?.maxIterations || 100000;

  // Main Solver Loop with Safe Yielding
  while (unplacedList.length > 0 && iter < maxIterations) {
    if (shouldStop) break;
    iter++;
    
    if (iter % 1000 === 0) {
      T = Math.max(MIN_TEMP, T * COOLING_RATE);
    }
       
    if (iter % 800 === 0) {
      const pct = Math.min(99, Math.floor(((movableCards.length - unplacedList.length) / movableCards.length) * 100));
      progressReporter.report(
        pct, 
        `AI Optimizasyon İşleniyor... (${iter} iter) T:${T.toFixed(1)} Kalan: ${unplacedList.length}`,
        iter,
        unplacedList.length,
        { temperature: T }
      );
      
      // Yield to event loop to allow incoming STOP or PING messages
      await new Promise(res => setTimeout(res, 0));
    }
       
    // Pick the most constrained card using strict MRV and Degree Heuristic
    const c = pickHardestCard();
    if (!c) continue;
       
    // Try Kempe Chain / Ejection Chain (Takas Zinciri) first
    const chainSuccess = tryEjectionChain(c);

    if (chainSuccess) {
      if (unplacedList.length < minUnplacedCount) {
        minUnplacedCount = unplacedList.length;
        saveBestState();
        lastImprovement = iter;
        ruinStreak = 0;
      }
    } else {
      // Fallback: Best Min-Conflict Heuristic with Tabu Search
      shuffleArray(shuffledDaysIndices);
         
      let chosenD = -1;
      let chosenP = -1;
      let chosenConflicts: number[] | null = null;
      let minConflictScore = 999999;
         
      for (let di = 0; di < shuffledDaysIndices.length; di++) {
        const d = shuffledDaysIndices[di];
        const maxPeriods = schoolSettings.weekDays[d]?.periods || 9;
        const maxStart = maxPeriods - c.hours;
        if (maxStart < 0) continue;
             
        const starts = getShuffledStarts(maxStart + 1);
        for (let pi = 0; pi <= maxStart; pi++) {
          const p = starts[pi];
          const tabuKey = getTabuKey(c.mappedId, d, p);
          const isTabu = tabuSet.has(tabuKey);
                 
          const conflicts = getConflicts(c, d, p);
          if (conflicts === null) continue;
          if (isTabu && conflicts.length > 0) continue;
                 
          let score = 0;
          for (let ci = 0; ci < conflicts.length; ci++) {
            const confCard = movableMap.get(conflicts[ci]);
            score += confCard ? (confCard.hours * 10 + confCard.failCount * 2) : 10;
          }
                 
          score += (c.hours * 4);
          if (score < minConflictScore) {
            minConflictScore = score;
            chosenD = d;
            chosenP = p;
            chosenConflicts = conflicts;
          }
        }
      }
         
      if (chosenD !== -1 && chosenConflicts !== null) {
        for (let ci = 0; ci < chosenConflicts.length; ci++) {
          const confCard = movableMap.get(chosenConflicts[ci]);
          if (confCard) {
            confCard.failCount++;
            remove(confCard);
            const tKey = getTabuKey(confCard.mappedId, confCard.d, confCard.p);
            tabuQueue.push(tKey);
            tabuSet.add(tKey);
            if (tabuQueue.length > maxTabuSize) {
              const oldKey = tabuQueue.shift()!;
              tabuSet.delete(oldKey);
            }
          }
        }
             
        place(c, chosenD, chosenP);
             
        if (unplacedList.length < minUnplacedCount) {
          minUnplacedCount = unplacedList.length;
          saveBestState();
          lastImprovement = iter;
          ruinStreak = 0;
        }
      } else {
        c.failCount++;
      }
    }
       
    // Micro-Ruin Phase on Stagnation (Constrained strictly to 5% - 10% of placed cards)
    if (iter - lastImprovement > 3000) {
      ruinStreak++;
      lastImprovement = iter;

      const placedCards = movableCards.filter(cc => cc.d !== -1);
      if (placedCards.length > 0) {
        // Collect teachers and classes of remaining unplaced cards to target correlated problem nodes
        const unplacedArr = unplacedList.map(id => movableMap.get(id)).filter(Boolean);
        const unplacedTeachers = new Set<number>();
        const unplacedClasses = new Set<number>();
        unplacedArr.forEach(uc => {
          uc.mappedTeachers?.forEach((t: number) => unplacedTeachers.add(t));
          uc.mappedClasses?.forEach((cl: number) => unplacedClasses.add(cl));
        });

        // Sort placed cards so that those sharing teachers/classes or having high failCount are prioritized for ejection
        const sortedForRuin = [...placedCards].sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          a.mappedTeachers?.forEach((t: number) => { if (unplacedTeachers.has(t)) scoreA += 10; });
          a.mappedClasses?.forEach((cl: number) => { if (unplacedClasses.has(cl)) scoreA += 10; });
          b.mappedTeachers?.forEach((t: number) => { if (unplacedTeachers.has(t)) scoreB += 10; });
          b.mappedClasses?.forEach((cl: number) => { if (unplacedClasses.has(cl)) scoreB += 10; });
          scoreA += (a.failCount || 0) * 2;
          scoreB += (b.failCount || 0) * 2;
          return scoreB - scoreA;
        });

        // Micro-Ruin fraction strictly capped between 5% and 10%
        const microFraction = 0.05 + 0.01 * (ruinStreak % 6);
        const ruinCount = Math.min(placedCards.length, Math.max(1, Math.floor(placedCards.length * microFraction)));

        const focusedCount = Math.floor(ruinCount * 0.8);
        const randomCount = ruinCount - focusedCount;

        const toRuinSet = new Set<any>();
        for (let i = 0; i < Math.min(sortedForRuin.length, focusedCount); i++) {
          toRuinSet.add(sortedForRuin[i]);
        }
        const remaining = sortedForRuin.slice(focusedCount);
        shuffleArray(remaining);
        for (let i = 0; i < Math.min(remaining.length, randomCount); i++) {
          toRuinSet.add(remaining[i]);
        }

        toRuinSet.forEach(cc => {
          remove(cc);
          cc.failCount = Math.max(0, (cc.failCount || 0) - 2);
        });
      }

      tabuQueue.length = 0;
      tabuSet.clear();
    }
  }

  // ==========================================
  // PHASE 2: REPAIR & SOFT CONSTRAINT OPTIMIZATION
  // Simulated Annealing + Hill Climbing Loop
  // Eliminates soft rule violations (preventSameDay, maxHours, gaps) while maintaining 100% hard feasibility.
  // ==========================================
  if (bestState && unplacedList.length > minUnplacedCount) {
    // Restore best placement from Phase 1
    movableCards.forEach(c => { if (c.d !== -1) remove(c); });
    const bestMap = new Map<string, any>();
    bestState.forEach((s: any) => bestMap.set(s.id, s));
    movableCards.forEach(c => {
      const s = bestMap.get(c.id);
      if (s && s.d !== -1) {
        const hc = getHardConflicts(c, s.d, s.p);
        if (hc !== null && hc.length === 0) {
          place(c, s.d, s.p);
        }
      }
    });
  }

  let currentSoftPenalty = calcTotalSoftPenalty();
  let bestRepairPenalty = currentSoftPenalty;
  let bestRepairState = movableCards.map(c => ({ id: c.id, d: c.d, p: c.p }));

  if (currentSoftPenalty > 0 && !shouldStop && unplacedList.length === 0) {
    progressReporter.report(
      98,
      `Phase 2: Kural Onarımı Başlatılıyor... Ceza Puanı: ${currentSoftPenalty}`,
      iter,
      unplacedList.length,
      { bestCost: currentSoftPenalty },
      true
    );

    const maxRepairIter = Math.min(10000, movableCards.length * 60);
    let repairIter = 0;
    let T_sa = 60.0;
    const coolingRate = 0.9993;

    const placedCards = movableCards.filter(c => c.d !== -1);

    while (repairIter < maxRepairIter && bestRepairPenalty > 0 && !shouldStop) {
      repairIter++;
      T_sa = Math.max(0.01, T_sa * coolingRate);

      if (repairIter % 250 === 0) {
        progressReporter.report(
          98,
          `Phase 2: Kural İyileştirme (${repairIter}/${maxRepairIter}) - Kalan Ceza: ${bestRepairPenalty}`,
          iter + repairIter,
          unplacedList.length,
          { temperature: T_sa, bestCost: bestRepairPenalty }
        );
        await new Promise(res => setTimeout(res, 0));
      }

      // 1. Identify violating cards or pick a placed card
      const violatingCards = placedCards.filter(c => calcCardSoftPenalty(c, c.d, c.p) > 0);
      const cardA = (violatingCards.length > 0 && Math.random() < 0.85)
        ? violatingCards[Math.floor(Math.random() * violatingCards.length)]
        : placedCards[Math.floor(Math.random() * placedCards.length)];

      if (!cardA || cardA.d === -1) continue;

      const origD_A = cardA.d;
      const origP_A = cardA.p;

      // Strategy 1: Move cardA to an alternative zero-hard-conflict slot (55% probability)
      if (Math.random() < 0.55) {
        const targetD = activeDays[Math.floor(Math.random() * activeDays.length)].id - 1;
        const maxPeriods = schoolSettings.weekDays[targetD]?.periods || 9;
        const maxStart = maxPeriods - cardA.hours;
        if (maxStart >= 0) {
          const targetP = Math.floor(Math.random() * (maxStart + 1));
          if (targetD !== origD_A || targetP !== origP_A) {
            remove(cardA);
            const hardConf = getHardConflicts(cardA, targetD, targetP);
            if (hardConf !== null && hardConf.length === 0) {
              place(cardA, targetD, targetP);
              const newPenalty = calcTotalSoftPenalty();
              const delta = newPenalty - currentSoftPenalty;

              if (delta < 0 || (T_sa > 0.05 && Math.random() < Math.exp(-delta / T_sa))) {
                currentSoftPenalty = newPenalty;
                if (currentSoftPenalty < bestRepairPenalty) {
                  bestRepairPenalty = currentSoftPenalty;
                  bestRepairState = movableCards.map(c => ({ id: c.id, d: c.d, p: c.p }));
                  if (bestRepairPenalty === 0) break; // All soft constraints completely satisfied!
                }
              } else {
                // Revert move
                remove(cardA);
                place(cardA, origD_A, origP_A);
              }
            } else {
              // Revert
              place(cardA, origD_A, origP_A);
            }
          }
        }
      } 
      // Strategy 2: Pairwise 2-Card Swap between compatible cards (45% probability)
      else {
        const candidates = placedCards.filter(c => c.mappedId !== cardA.mappedId && c.d !== -1 && c.hours === cardA.hours);
        if (candidates.length > 0) {
          const cardB = candidates[Math.floor(Math.random() * candidates.length)];
          const origD_B = cardB.d;
          const origP_B = cardB.p;

          if (origD_A !== origD_B || origP_A !== origP_B) {
            remove(cardA);
            remove(cardB);

            const hardConfA = getHardConflicts(cardA, origD_B, origP_B);
            const hardConfB = (hardConfA !== null && hardConfA.length === 0) ? getHardConflicts(cardB, origD_A, origP_A) : null;

            if (hardConfA !== null && hardConfA.length === 0 && hardConfB !== null && hardConfB.length === 0) {
              place(cardA, origD_B, origP_B);
              place(cardB, origD_A, origP_A);

              const newPenalty = calcTotalSoftPenalty();
              const delta = newPenalty - currentSoftPenalty;

              if (delta < 0 || (T_sa > 0.05 && Math.random() < Math.exp(-delta / T_sa))) {
                currentSoftPenalty = newPenalty;
                if (currentSoftPenalty < bestRepairPenalty) {
                  bestRepairPenalty = currentSoftPenalty;
                  bestRepairState = movableCards.map(c => ({ id: c.id, d: c.d, p: c.p }));
                  if (bestRepairPenalty === 0) break; // All soft constraints satisfied!
                }
              } else {
                // Revert swap
                remove(cardA);
                remove(cardB);
                place(cardA, origD_A, origP_A);
                place(cardB, origD_B, origP_B);
              }
            } else {
              // Revert
              place(cardA, origD_A, origP_A);
              place(cardB, origD_B, origP_B);
            }
          }
        }
      }
    }

    // Apply best repaired configuration
    if (bestRepairState && bestRepairPenalty < currentSoftPenalty) {
      movableCards.forEach(c => { if (c.d !== -1) remove(c); });
      const repairMap = new Map<string, any>();
      bestRepairState.forEach(s => repairMap.set(s.id, s));
      movableCards.forEach(c => {
        const s = repairMap.get(c.id);
        if (s && s.d !== -1) {
          const hc = getHardConflicts(c, s.d, s.p);
          if (hc !== null && hc.length === 0) {
            place(c, s.d, s.p);
          }
        }
      });
    }

    saveBestState();
  }

  // Construct final result structures
  const out_T: SchedulesMap = JSON.parse(JSON.stringify(schedules || {}));
  const out_C: SchedulesMap = JSON.parse(JSON.stringify(classSchedules || {}));
  const out_R: SchedulesMap = JSON.parse(JSON.stringify(roomSchedules || {}));
  const outPool: CourseCard[] = [];

  const applyToOut = (targetMap: SchedulesMap, keys: string[], card: any, cardStr: string) => {
    if (!keys || !Array.isArray(keys)) return;
    keys.forEach(k => {
      if (!targetMap[k]) targetMap[k] = Array.from({ length: 7 }).map(() => Array(15).fill(''));
      for (let i = 0; i < card.hours; i++) {
        if (card.p + i < 15) {
          targetMap[k][card.d][card.p + i] = cardStr;
        }
      }
    });
  };

  // Clear non-locked cells
  Object.keys(out_T).forEach(t => {
    for (let d = 0; d < 7; d++) {
      for (let p = 0; p < 15; p++) {
        if (out_T[t]?.[d]?.[p] && out_T[t][d][p] !== '' && !lockedCells[`${t}-${d}-${p}`]) {
          out_T[t][d][p] = '';
        }
      }
    }
  });
  Object.keys(out_C).forEach(c => {
    for (let d = 0; d < 7; d++) {
      for (let p = 0; p < 15; p++) {
        if (out_C[c]?.[d]?.[p] && out_C[c][d][p] !== '' && !lockedCells[`${c}-${d}-${p}`]) {
          out_C[c][d][p] = '';
        }
      }
    }
  });
  Object.keys(out_R).forEach(r => {
    for (let d = 0; d < 7; d++) {
      for (let p = 0; p < 15; p++) {
        if (out_R[r]?.[d]?.[p] && out_R[r][d][p] !== '' && !lockedCells[`${r}-${d}-${p}`]) {
          out_R[r][d][p] = '';
        }
      }
    }
  });

  // Explicit Original Card Data Reference Map for 100% Data Integrity
  const rawOriginalCardMap = new Map<string, any>();
  unplacedCourses.forEach(c => {
    if (c && c.id) rawOriginalCardMap.set(String(c.id), c);
  });
  boardCards.forEach(c => {
    if (c && c.id) rawOriginalCardMap.set(String(c.id), c);
    if (c && c.originalId) rawOriginalCardMap.set(String(c.originalId), c);
  });

  if (bestState) {
    const finalMap = new Map<string, any>();
    bestState.forEach((s: any) => finalMap.set(s.id, s));
    
    solverCards.forEach(c => {
      const f = finalMap.get(c.id);
      const originalRaw = rawOriginalCardMap.get(String(c.id)) || rawOriginalCardMap.get(String(c.originalId)) || c;

      if (f && f.d !== -1) {
        c.d = f.d;
        c.p = f.p;

        // Strip internal solver fields, preserve all original UI metadata (color, bg, textColor, isElective, groups, branch, etc.)
        const {
          mappedTeachers,
          mappedClasses,
          mappedRooms,
          mappedSubject,
          fromBoard,
          isLocked,
          originalId,
          d,
          p,
          hours,
          span,
          failCount,
          heuristicWeight,
          validSlotsCount,
          isDeadEnd,
          difficultyLevel,
          mappedId,
          ...cleanMeta
        } = { ...originalRaw, ...c };

        const cardDataStr = JSON.stringify({
          ...cleanMeta,
          id: originalId || originalRaw.id || c.id,
          teachers: c.teachers || originalRaw.teachers || [],
          classes: c.classes || originalRaw.classes || [],
          rooms: c.rooms || originalRaw.rooms || [],
          subject: c.subject || originalRaw.subject || '',
          span: c.hours || span || originalRaw.span || 1
        });

        applyToOut(out_T, c.teachers, c, cardDataStr);
        applyToOut(out_C, c.classes, c, cardDataStr);
        applyToOut(out_R, c.rooms, c, cardDataStr);
      } else {
        const {
          mappedTeachers,
          mappedClasses,
          mappedRooms,
          mappedSubject,
          fromBoard,
          isLocked,
          originalId,
          d,
          p,
          failCount,
          heuristicWeight,
          validSlotsCount,
          isDeadEnd,
          difficultyLevel,
          mappedId,
          ...cleanPoolCard
        } = { ...originalRaw, ...c };

        outPool.push({
          ...cleanPoolCard,
          id: originalId || originalRaw.id || c.id,
          span: c.hours || cleanPoolCard.span || originalRaw.span || 1,
          failCount: 0
        });
      }
    });

    const resultPayload: DistributionResult = {
      schedules: out_T,
      classSchedules: out_C,
      roomSchedules: out_R,
      unplacedCourses: outPool,
      iter: iter,
      durationMs: performance.now() - startTime,
      workerIndex: currentWorkerIndex
    };

    progressReporter.report(100, 'Tamamlandı', iter, outPool.length, undefined, true);

    self.postMessage({
      type: WorkerOutboundType.DONE,
      payload: resultPayload
    });
  } else {
    self.postMessage({
      type: WorkerOutboundType.ERROR,
      message: 'Dağıtım çözümü üretilemedi.',
      workerIndex: currentWorkerIndex,
      isFatal: true,
      canRetry: true
    });
  }

  // Explicit Memory Reclamation
  tabuQueue.length = 0;
  tabuSet.clear();
  movableCards.length = 0;
  movableMap.clear();
  unplacedList.length = 0;
  unplacedPos.clear();
  boardCards.clear();
  isCurrentlySolving = false;
}

/**
 * Worker Message Router with strict TypeScript discriminator
 */
self.onmessage = function (e: MessageEvent<WorkerInboundMessage | any>) {
  try {
    const data = e.data;
    if (!data) return;

    // Handle Stop message
    if (data.type === WorkerInboundType.STOP || data.type === 'stop') {
      shouldStop = true;
      return;
    }

    // Handle Ping / Heartbeat message
    if (data.type === WorkerInboundType.PING || data.type === 'ping') {
      self.postMessage({
        type: WorkerOutboundType.PONG,
        workerIndex: currentWorkerIndex,
        timestamp: data.timestamp || Date.now(),
        uptimeMs: performance.now() - workerStartTime
      });
      return;
    }

    // Handle Cleanup message
    if (data.type === WorkerInboundType.CLEANUP || data.type === 'cleanup') {
      shouldStop = true;
      isCurrentlySolving = false;
      return;
    }

    // Handle Start message
    shouldStop = false;
    const payload = data.payload || data;

    runQuantumDistribution(payload).catch(err => {
      isCurrentlySolving = false;
      self.postMessage({
        type: WorkerOutboundType.ERROR,
        message: 'Worker İşlem Hatası: ' + (err?.message || String(err)),
        stack: err?.stack,
        workerIndex: currentWorkerIndex,
        isFatal: true,
        canRetry: true
      });
    });
  } catch (syncErr: any) {
    isCurrentlySolving = false;
    self.postMessage({
      type: WorkerOutboundType.UNCAUGHT_EXCEPTION,
      message: 'Worker Senkron Hatası: ' + (syncErr?.message || String(syncErr)),
      stack: syncErr?.stack,
      workerIndex: currentWorkerIndex,
      isFatal: true,
      canRetry: true
    });
  }
};
