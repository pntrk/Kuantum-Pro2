/**
 * Shadow Analysis Web Worker (Continuous Predictive Analysis & Deep Heatmap Engine)
 * 
 * Runs silently in the background during user idle time.
 * Scans all slots on the board for every unplaced course card.
 * Generates Probability & Difficulty Heatmap Matrix (valid slots, conflict/competition potential).
 * Calculates heuristicWeight difficulty scores and performs immediate Dead-End Detection.
 * Fully supports cooperative job cancellation / abort when state changes rapidly.
 */

import {
  ShadowWorkerInbound,
  ShadowWorkerPayload,
  ShadowAnalysisResult,
  CardHeatmap,
  DeadEndWarning,
  DifficultyHeatmapMatrix,
  BottleneckItem,
  ImpossibleAllocation,
  RecommendedCardPriority,
  SuggestedFix,
  ShadowPredictiveStats
} from '../types/shadowAnalysisTypes';

let activeJobId: string | null = null;

/**
 * Worker message listener
 */
self.addEventListener('message', (event: MessageEvent<ShadowWorkerInbound>) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'ABORT') {
    if (activeJobId && (!data.jobId || data.jobId === activeJobId)) {
      const oldJob = activeJobId;
      activeJobId = null;
      self.postMessage({ type: 'SHADOW_ANALYSIS_ABORTED', jobId: oldJob });
    }
    return;
  }

  if (data.type === 'ANALYZE_SHADOW' || data.type === 'FORCE_DEEP_RUN') {
    const jobId = data.jobId;
    activeJobId = jobId;
    const isDeep = data.type === 'FORCE_DEEP_RUN' || !!data.payload.isDeepRun;

    // Run predictive analysis
    try {
      const result = runShadowAnalysis(jobId, data.payload, isDeep);
      // Only post result if this job has not been aborted / superseded
      if (result && activeJobId === jobId) {
        // If dead ends were detected, we can also dispatch an immediate dead-end signal
        if (result.deadEndWarnings && result.deadEndWarnings.length > 0) {
          self.postMessage({
            type: 'SHADOW_DEAD_END_WARNING',
            jobId,
            warnings: result.deadEndWarnings
          });
        }

        self.postMessage({
          type: 'SHADOW_ANALYSIS_RESULT',
          jobId,
          result
        });
      }
    } catch (err: any) {
      if (activeJobId === jobId) {
        self.postMessage({
          type: 'SHADOW_ANALYSIS_ERROR',
          jobId,
          error: err?.message || 'Shadow analysis failed'
        });
      }
    }
  }
});

function runShadowAnalysis(
  jobId: string, 
  payload: ShadowWorkerPayload,
  isDeep: boolean
): ShadowAnalysisResult | null {
  const startTime = performance.now();
  const {
    constraints = { teachers: {}, classes: {}, subjects: {}, rooms: {} },
    lockedCells = {},
    schoolSettings,
    schedules = {},
    classSchedules = {},
    roomSchedules = {},
    unplacedCourses = [],
    teachers = [],
    classes = [],
    subjects = [],
    rooms = []
  } = payload;

  const weekDays = schoolSettings?.weekDays || [];
  const totalActiveDays = weekDays.filter(d => d.active).length || 5;
  const totalSchoolSlots = weekDays.reduce((sum, d) => sum + (d.active ? (d.periods || 8) : 0), 0);

  // Check abort
  if (activeJobId !== jobId) return null;

  // 1. Capacity & Demand Analysis for Teachers
  const teacherStats: Record<string, { totalClosed: number; totalPlaced: number; totalUnplaced: number; requiredTotal: number }> = {};
  
  teachers.forEach(t => {
    const closedCount = (constraints.teachers?.[t] || []).length;
    let placedCount = 0;
    const tSched = schedules[t];
    if (Array.isArray(tSched)) {
      tSched.forEach(day => {
        if (Array.isArray(day)) {
          day.forEach(cell => {
            if (cell && cell !== '') placedCount++;
          });
        }
      });
    }
    teacherStats[t] = {
      totalClosed: closedCount,
      totalPlaced: placedCount,
      totalUnplaced: 0,
      requiredTotal: placedCount
    };
  });

  // Calculate required hours per class
  const classStats: Record<string, { totalClosed: number; totalPlaced: number; totalUnplaced: number; requiredTotal: number }> = {};
  classes.forEach(c => {
    const closedCount = (constraints.classes?.[c] || []).length;
    let placedCount = 0;
    const cSched = classSchedules[c];
    if (Array.isArray(cSched)) {
      cSched.forEach(day => {
        if (Array.isArray(day)) {
          day.forEach(cell => {
            if (cell && cell !== '') placedCount++;
          });
        }
      });
    }
    classStats[c] = {
      totalClosed: closedCount,
      totalPlaced: placedCount,
      totalUnplaced: 0,
      requiredTotal: placedCount
    };
  });

  unplacedCourses.forEach(card => {
    const hours = card.hours || 1;
    (card.teachers || []).forEach(t => {
      if (!teacherStats[t]) {
        teacherStats[t] = { totalClosed: 0, totalPlaced: 0, totalUnplaced: 0, requiredTotal: 0 };
      }
      teacherStats[t].totalUnplaced += hours;
      teacherStats[t].requiredTotal += hours;
    });

    (card.classes || []).forEach(c => {
      if (!classStats[c]) {
        classStats[c] = { totalClosed: 0, totalPlaced: 0, totalUnplaced: 0, requiredTotal: 0 };
      }
      classStats[c].totalUnplaced += hours;
      classStats[c].requiredTotal += hours;
    });
  });

  if (activeJobId !== jobId) return null;

  // 2. Identify Capacity Bottlenecks
  const bottlenecks: BottleneckItem[] = [];
  const impossibleAllocations: ImpossibleAllocation[] = [];
  const deadEndWarnings: DeadEndWarning[] = [];
  const suggestedFixes: SuggestedFix[] = [];

  // Teacher bottlenecks
  Object.entries(teacherStats).forEach(([teacher, stats]) => {
    const availableSlots = totalSchoolSlots - stats.totalClosed;
    const netHeadroom = availableSlots - stats.requiredTotal;
    const utilRate = availableSlots > 0 ? Math.round((stats.requiredTotal / availableSlots) * 100) : 100;

    if (netHeadroom < 0) {
      bottlenecks.push({
        type: 'teacher',
        name: teacher,
        riskScore: 100,
        message: `${Math.abs(netHeadroom)} saat kapasite yetersizliği var! (Kullanılabilir: ${availableSlots}s, Gereken: ${stats.requiredTotal}s)`,
        freeHours: availableSlots,
        requiredHours: stats.requiredTotal,
        utilizationRate: utilRate
      });
      suggestedFixes.push({
        title: `${teacher} Kapasite Aşımı`,
        description: `${teacher} öğretmenine toplam ${stats.requiredTotal} saat ders atanmış ancak kapalı saatler düşüldüğünde sadece ${availableSlots} saat açık alanı var. Kapalı saatleri azaltın veya ders yükünü paylaştırın.`,
        severity: 'critical',
        target: teacher,
        actionableType: 'open_constraint'
      });
    } else if (utilRate >= 90) {
      const risk = Math.min(95, 70 + (utilRate - 90) * 2.5);
      bottlenecks.push({
        type: 'teacher',
        name: teacher,
        riskScore: Math.round(risk),
        message: `Kapasite doluluğu %${utilRate}. Boşluk payı sadece ${netHeadroom} saat.`,
        freeHours: availableSlots,
        requiredHours: stats.requiredTotal,
        utilizationRate: utilRate
      });
    }
  });

  // Class bottlenecks
  Object.entries(classStats).forEach(([className, stats]) => {
    const availableSlots = totalSchoolSlots - stats.totalClosed;
    const netHeadroom = availableSlots - stats.requiredTotal;
    const utilRate = availableSlots > 0 ? Math.round((stats.requiredTotal / availableSlots) * 100) : 100;

    if (netHeadroom < 0) {
      bottlenecks.push({
        type: 'class',
        name: className,
        riskScore: 100,
        message: `${Math.abs(netHeadroom)} saat sınıf haftalık ders fazlası var!`,
        freeHours: availableSlots,
        requiredHours: stats.requiredTotal,
        utilizationRate: utilRate
      });
      suggestedFixes.push({
        title: `${className} Müfredat / Saat Uyuşmazlığı`,
        description: `${className} sınıfına tanımlı haftalık ders toplamı (${stats.requiredTotal}s), sınıfın açık haftalık saatini (${availableSlots}s) aşıyor.`,
        severity: 'critical',
        target: className,
        actionableType: 'open_constraint'
      });
    } else if (utilRate >= 95 && stats.totalClosed > 0) {
      bottlenecks.push({
        type: 'class',
        name: className,
        riskScore: 85,
        message: `Sınıf programı %${utilRate} dolu. Kapalı saatler yerleşimi zorlaştırıyor.`,
        freeHours: availableSlots,
        requiredHours: stats.requiredTotal,
        utilizationRate: utilRate
      });
    }
  });

  if (activeJobId !== jobId) return null;

  // 3. Complete Board Scan: Probability & Difficulty Heatmap Matrix
  // Scan all days and periods for each card to find valid slots and contention
  const cardHeatmaps: Record<string, CardHeatmap> = {};
  const cardValidSlotMap: Map<string, Set<string>> = new Map();
  const gridContentionMap: Record<string, { totalContenders: number; contendingCardIds: string[]; loadPressure: number }> = {};
  const schoolSlotLoads: Record<string, import('../types/shadowAnalysisTypes').SlotLoadInfo> = {};

  // Initialize grid contention map & school slot loads
  weekDays.forEach((day, dIdx) => {
    if (!day.active) return;
    const periods = day.periods || 8;
    for (let pIdx = 0; pIdx < periods; pIdx++) {
      const slotKey = `${dIdx}-${pIdx}`;
      gridContentionMap[slotKey] = {
        totalContenders: 0,
        contendingCardIds: [],
        loadPressure: 0
      };

      let busyT = 0;
      let closedT = 0;
      teachers.forEach(t => {
        const val = schedules[t]?.[dIdx]?.[pIdx];
        if (val && val !== '') busyT++;
        if (constraints.teachers?.[t]?.includes(slotKey)) closedT++;
      });

      let busyC = 0;
      classes.forEach(c => {
        const val = classSchedules[c]?.[dIdx]?.[pIdx];
        if (val && val !== '') busyC++;
      });

      const totalT = Math.max(1, teachers.length);
      const totalC = Math.max(1, classes.length);
      const loadPercentage = Math.min(100, Math.round(((busyT + busyC) / (totalT + totalC)) * 100));

      schoolSlotLoads[slotKey] = {
        dayIndex: dIdx,
        periodIndex: pIdx,
        slotKey,
        busyTeachers: busyT,
        totalTeachers: totalT,
        busyClasses: busyC,
        totalClasses: totalC,
        closedTeachers: closedT,
        loadPercentage,
        contendersCount: 0,
        contentionPercentage: 0,
        combinedIntensity: loadPercentage
      };
    }
  });

  // Step 3a: Identify valid slots for each unplaced card and detect deep conflicts
  unplacedCourses.forEach(card => {
    const hours = card.hours || 1;
    const validSlotPositions: { dayIndex: number; periodIndex: number; slotKey: string }[] = [];
    const validKeySet = new Set<string>();

    // Check teacher intersection specifically for multi-teacher cards
    let multiTeacherConflict = false;
    let multiTeacherDetail = '';
    if ((card.teachers || []).length > 1) {
      // Find open slots for each teacher
      const teacherSlotsSets = card.teachers.map(t => {
        const set = new Set<string>();
        weekDays.forEach((day, dIdx) => {
          if (!day.active) return;
          const dayPeriods = day.periods || 8;
          for (let pIdx = 0; pIdx < dayPeriods; pIdx++) {
            const key = `${dIdx}-${pIdx}`;
            const isClosed = constraints.teachers?.[t]?.includes(key);
            const isLocked = lockedCells[`${t}-${key}`];
            const isBusy = schedules[t]?.[dIdx]?.[pIdx] && schedules[t]?.[dIdx]?.[pIdx] !== '';
            if (!isClosed && !isLocked && !isBusy) {
              set.add(key);
            }
          }
        });
        return set;
      });

      // Intersect all teacher open slots
      const commonSlots = Array.from(teacherSlotsSets[0] || []).filter(slot => 
        teacherSlotsSets.every(s => s.has(slot))
      );

      if (commonSlots.length === 0) {
        multiTeacherConflict = true;
        multiTeacherDetail = `Öğretmenler arası saat uyuşmazlığı: ${card.teachers.join(' ve ')} öğretmenlerinin haftalık açık/müsait saatleri hiçbir zaman kesişmiyor (%100 Tıkanma).`;
      }
    }

    weekDays.forEach((day, dIdx) => {
      if (!day.active) return;
      const dayPeriods = day.periods || 8;

      for (let pIdx = 0; pIdx <= dayPeriods - hours; pIdx++) {
        let isSlotValid = true;

        for (let h = 0; h < hours; h++) {
          const curP = pIdx + h;
          const keyTime = `${dIdx}-${curP}`;

          // Check locked cells
          if (card.teachers?.some(t => lockedCells[`${t}-${keyTime}`])) { isSlotValid = false; break; }
          if (card.classes?.some(c => lockedCells[`${c}-${keyTime}`])) { isSlotValid = false; break; }
          if (card.rooms?.some(r => lockedCells[`${r}-${keyTime}`])) { isSlotValid = false; break; }

          // Check constraints (closed hours)
          if (card.teachers?.some(t => constraints.teachers?.[t]?.includes(keyTime))) { isSlotValid = false; break; }
          if (card.classes?.some(c => constraints.classes?.[c]?.includes(keyTime))) { isSlotValid = false; break; }
          if (card.rooms?.some(r => constraints.rooms?.[r]?.includes(keyTime))) { isSlotValid = false; break; }
          if (card.subject && constraints.subjects?.[card.subject]?.includes(keyTime)) { isSlotValid = false; break; }

          // Check current schedule occupancy
          if (card.teachers?.some(t => {
            const val = schedules[t]?.[dIdx]?.[curP];
            return val && val !== '';
          })) { isSlotValid = false; break; }

          if (card.classes?.some(c => {
            const val = classSchedules[c]?.[dIdx]?.[curP];
            return val && val !== '';
          })) { isSlotValid = false; break; }

          if (card.rooms?.some(r => {
            const val = roomSchedules[r]?.[dIdx]?.[curP];
            return val && val !== '';
          })) { isSlotValid = false; break; }
        }

        if (isSlotValid) {
          const slotKey = `${dIdx}-${pIdx}`;
          validSlotPositions.push({ dayIndex: dIdx, periodIndex: pIdx, slotKey });
          
          // Mark all block hours in validKeySet & contention map
          for (let h = 0; h < hours; h++) {
            const blockSlotKey = `${dIdx}-${pIdx + h}`;
            validKeySet.add(blockSlotKey);

            if (gridContentionMap[blockSlotKey]) {
              gridContentionMap[blockSlotKey].totalContenders++;
              if (!gridContentionMap[blockSlotKey].contendingCardIds.includes(card.id)) {
                gridContentionMap[blockSlotKey].contendingCardIds.push(card.id);
              }
            }
          }
        }
      }
    });

    cardValidSlotMap.set(card.id, validKeySet);

    let deadEndReasonText: string | undefined = undefined;
    let riskDetailsText: string | undefined = undefined;
    let suggestedActionText: string | undefined = undefined;

    if (validSlotPositions.length === 0) {
      if (multiTeacherConflict) {
        deadEndReasonText = multiTeacherDetail;
        riskDetailsText = `${card.teachers.join(', ')} öğretmenlerinin kısıtlı günleri/saatleri birbirini tamamen kapatıyor.`;
        suggestedActionText = `Öğretmen kısıtlamalarını eşzamanlı müsait olacak şekilde açın.`;
      } else {
        const teacherNames = (card.teachers || []).join(', ') || 'Öğretmen';
        const classNames = (card.classes || []).join(', ') || 'Sınıf';
        deadEndReasonText = `${teacherNames} öğretmeninin ${classNames} ${card.subject} dersi için tahtada boş uygun slot kalmadı (%100 Tıkanma)!`;
        riskDetailsText = `Dersin ${hours} saatlik blok ihtiyacı ve tanımlı kısıtlamalar mevcut tahta doluluğuyla uyuşmuyor.`;
        suggestedActionText = `İlgili öğretmen veya sınıfın kapalı saatlerini veya kilitli derslerini esnetin.`;
      }
    } else if (validSlotPositions.length <= 2) {
      riskDetailsText = `Haftada sadece ${validSlotPositions.length} adet uygun slot kaldı. Erken yerleştirilmezse dağıtım tıkanabilir.`;
      suggestedActionText = `Bu karta öncelik verin veya alternatif saatleri açık tutun.`;
    }

    // Initial placeholder for card heatmap
    cardHeatmaps[card.id] = {
      cardId: card.id,
      subject: card.subject || 'Ders',
      teachers: card.teachers || [],
      classes: card.classes || [],
      rooms: card.rooms || [],
      hours,
      validSlotsCount: validSlotPositions.length,
      validSlotPositions,
      competingCards: [],
      heuristicWeight: 0,
      difficultyLevel: 'low',
      isDeadEnd: validSlotPositions.length === 0,
      deadEndReason: deadEndReasonText,
      riskCategory: validSlotPositions.length === 0 ? 'dead_end' : validSlotPositions.length <= 2 ? 'critical_bottleneck' : 'optimal',
      riskScore: validSlotPositions.length === 0 ? 100 : validSlotPositions.length <= 2 ? 88 : 25,
      riskDetails: riskDetailsText,
      suggestedAction: suggestedActionText
    };
  });

  if (activeJobId !== jobId) return null;

  // Calculate load pressure per grid slot and update schoolSlotLoads
  const totalUnplacedCardCount = Math.max(1, unplacedCourses.length);
  let maxContentionScore = 0;
  let maxContentionSlot: { dayIndex: number; periodIndex: number; contentionScore: number; slotKey: string } | null = null;

  Object.entries(gridContentionMap).forEach(([slotKey, item]) => {
    const [dStr, pStr] = slotKey.split('-');
    const dIdx = parseInt(dStr, 10);
    const pIdx = parseInt(pStr, 10);
    
    item.loadPressure = Math.min(100, Math.round((item.totalContenders / totalUnplacedCardCount) * 100));

    if (schoolSlotLoads[slotKey]) {
      schoolSlotLoads[slotKey].contendersCount = item.totalContenders;
      schoolSlotLoads[slotKey].contentionPercentage = item.loadPressure;
      // Combined Intensity: 60% school busy rate + 40% unplaced contention
      schoolSlotLoads[slotKey].combinedIntensity = Math.min(100, Math.round(schoolSlotLoads[slotKey].loadPercentage * 0.6 + item.loadPressure * 0.4));
    }

    if (item.totalContenders > maxContentionScore) {
      maxContentionScore = item.totalContenders;
      maxContentionSlot = {
        dayIndex: dIdx,
        periodIndex: pIdx,
        contentionScore: item.totalContenders,
        slotKey
      };
    }
  });

  // Calculate Peak & Quiet slots
  const allSlotList = Object.values(schoolSlotLoads).sort((a, b) => b.combinedIntensity - a.combinedIntensity);
  const peakSlots = allSlotList.slice(0, 4).map(s => {
    const dayName = weekDays[s.dayIndex]?.name || `Gün ${s.dayIndex + 1}`;
    s.isPeakHour = true;
    return {
      dayIndex: s.dayIndex,
      periodIndex: s.periodIndex,
      dayName,
      periodLabel: `${s.periodIndex + 1}. Ders`,
      loadPercentage: s.combinedIntensity,
      message: `${dayName} ${s.periodIndex + 1}. Ders: %${s.combinedIntensity} Yoğunluk (${s.busyTeachers}/${s.totalTeachers} Öğretmen Derste, ${s.contendersCount} Havuz Talebi)`
    };
  });

  const quietSlots = allSlotList.slice(-4).reverse().map(s => {
    const dayName = weekDays[s.dayIndex]?.name || `Gün ${s.dayIndex + 1}`;
    s.isQuietHour = true;
    return {
      dayIndex: s.dayIndex,
      periodIndex: s.periodIndex,
      dayName,
      periodLabel: `${s.periodIndex + 1}. Ders`,
      loadPercentage: s.combinedIntensity,
      message: `${dayName} ${s.periodIndex + 1}. Ders: %${s.combinedIntensity} Yoğunluk (${s.totalTeachers - s.busyTeachers} Öğretmen Boşta)`
    };
  });

  // Step 3b: Conflict Potential & Cross-Card Competition Matrix
  unplacedCourses.forEach(cardA => {
    const heatmapA = cardHeatmaps[cardA.id];
    if (!heatmapA) return;

    const validSlotsA = cardValidSlotMap.get(cardA.id) || new Set<string>();
    const competingList: { cardId: string; subject: string; conflictResource: string; overlapScore: number }[] = [];

    unplacedCourses.forEach(cardB => {
      if (cardA.id === cardB.id) return;

      const validSlotsB = cardValidSlotMap.get(cardB.id) || new Set<string>();
      
      // Check shared resources
      const sharedTeachers = (cardA.teachers || []).filter(t => (cardB.teachers || []).includes(t));
      const sharedClasses = (cardA.classes || []).filter(c => (cardB.classes || []).includes(c));
      const sharedRooms = (cardA.rooms || []).filter(r => (cardB.rooms || []).includes(r));

      // Calculate slot domain overlap
      let sharedSlotCount = 0;
      validSlotsA.forEach(slot => {
        if (validSlotsB.has(slot)) sharedSlotCount++;
      });

      if (sharedTeachers.length > 0 || sharedClasses.length > 0 || sharedRooms.length > 0 || (sharedSlotCount > 0 && heatmapA.validSlotsCount <= 6)) {
        let conflictReason = '';
        let resourceMultiplier = 1;
        if (sharedTeachers.length > 0) {
          conflictReason += `Öğretmen: ${sharedTeachers.join(', ')}; `;
          resourceMultiplier += 2;
        }
        if (sharedClasses.length > 0) {
          conflictReason += `Sınıf: ${sharedClasses.join(', ')}; `;
          resourceMultiplier += 2;
        }
        if (sharedRooms.length > 0) {
          conflictReason += `Derslik: ${sharedRooms.join(', ')}; `;
          resourceMultiplier += 1.5;
        }
        if (!conflictReason) {
          conflictReason = `Zaman dilimi çakışması (${sharedSlotCount} ortak slot)`;
        }

        const overlapScore = Math.round((sharedSlotCount * resourceMultiplier) + (10 - Math.min(10, heatmapA.validSlotsCount)));
        
        competingList.push({
          cardId: cardB.id,
          subject: cardB.subject || 'Ders',
          conflictResource: conflictReason.trim(),
          overlapScore
        });
      }
    });

    // Sort competitors by overlap score
    competingList.sort((a, b) => b.overlapScore - a.overlapScore);
    heatmapA.competingCards = competingList.slice(0, 5); // Keep top 5 biggest competitors

    // Step 3c: Calculate Heuristic Weight (Difficulty Score)
    const validCount = heatmapA.validSlotsCount;
    const hours = heatmapA.hours;

    if (validCount === 0) {
      // Dead-end detected!
      heatmapA.heuristicWeight = 9999;
      heatmapA.difficultyLevel = 'dead_end';
      heatmapA.isDeadEnd = true;

      const teacherNames = (cardA.teachers || []).join(', ') || 'Öğretmen';
      const classNames = (cardA.classes || []).join(', ') || 'Sınıf';
      const warnMsg = `Uyarı: ${teacherNames} öğretmeninin ${classNames} ${cardA.subject} dersi için boş yer kalmadı!`;

      deadEndWarnings.push({
        cardId: cardA.id,
        teachers: cardA.teachers || [],
        classes: cardA.classes || [],
        subject: cardA.subject || 'Ders',
        hours,
        warningMessage: warnMsg,
        details: `Bu ders (${hours} saat) için tanımlanan öğretmenler, sınıflar ve kapalı saatler sebebiyle tahtada yerleşebileceği hiçbir boş slot kalmamıştır.`,
        affectedResources: [...(cardA.teachers || []), ...(cardA.classes || []), ...(cardA.rooms || [])]
      });

      impossibleAllocations.push({
        cardId: cardA.id,
        reason: warnMsg,
        teachers: cardA.teachers || [],
        classes: cardA.classes || [],
        subject: cardA.subject || '',
        hours
      });

      suggestedFixes.push({
        title: `${cardA.subject} Çözümsüzlük (Dead-End)`,
        description: warnMsg + ` Lütfen ${teacherNames} veya ${classNames} üzerindeki kapalı saat kısıtlamalarını esnetin.`,
        severity: 'critical',
        target: cardA.subject,
        actionableType: 'open_constraint'
      });
    } else {
      // Non-zero heuristic calculation
      const baseBlockWeight = hours * 35;
      const scarcityWeight = Math.round((totalSchoolSlots / Math.max(1, validCount)) * 45);
      const multiResourceWeight = ((cardA.teachers?.length || 1) > 1 ? 55 : 0) +
                                  ((cardA.classes?.length || 1) > 1 ? 45 : 0) +
                                  ((cardA.rooms?.length || 0) > 0 ? 35 : 0);
      
      const totalCompetitionPressure = competingList.reduce((acc, c) => acc + c.overlapScore, 0);
      const competitionWeight = Math.min(150, Math.round(totalCompetitionPressure / Math.max(1, validCount)));

      const totalCalculatedScore = baseBlockWeight + scarcityWeight + multiResourceWeight + competitionWeight;
      heatmapA.heuristicWeight = totalCalculatedScore;

      if (validCount <= 2) {
        heatmapA.difficultyLevel = 'extreme';
      } else if (validCount <= 5 || totalCalculatedScore > 350) {
        heatmapA.difficultyLevel = 'high';
      } else if (validCount <= 12 || totalCalculatedScore > 180) {
        heatmapA.difficultyLevel = 'medium';
      } else {
        heatmapA.difficultyLevel = 'low';
      }
    }
  });

  if (activeJobId !== jobId) return null;

  // 4. Construct Recommended Placement Order
  const cardPriorityList: RecommendedCardPriority[] = unplacedCourses.map((card, idx) => {
    const hm = cardHeatmaps[card.id];
    const score = hm ? hm.heuristicWeight : 50;
    const reasonText = hm?.isDeadEnd 
      ? '0 uygun zaman dilimi (Dead-End)' 
      : `${hm?.validSlotsCount || 0} uygun slot, ${hm?.competingCards?.length || 0} rakip kart`;

    return {
      id: card.id,
      subject: card.subject || 'Ders',
      teachers: card.teachers || [],
      classes: card.classes || [],
      hours: card.hours || 1,
      priorityScore: score,
      difficultyRank: 0,
      heuristicWeight: score,
      reason: reasonText
    };
  });

  // Sort cards strictly by heuristicWeight descending
  cardPriorityList.sort((a, b) => b.priorityScore - a.priorityScore);
  cardPriorityList.forEach((c, idx) => {
    c.difficultyRank = idx + 1;
  });

  // Sort bottlenecks by risk
  bottlenecks.sort((a, b) => b.riskScore - a.riskScore);

  // 5. Shadow Simulation (Monte Carlo Multi-Pass)
  const simPasses = isDeep ? 80 : 35;
  let successfulSims = 0;
  let totalSimPlaced = 0;

  for (let s = 0; s < simPasses; s++) {
    if (activeJobId !== jobId) return null;
    
    const occT: Record<string, Set<string>> = {};
    const occC: Record<string, Set<string>> = {};
    
    teachers.forEach(t => {
      occT[t] = new Set<string>();
      (constraints.teachers?.[t] || []).forEach(k => occT[t].add(k));
      schedules[t]?.forEach((day, d) => {
        day?.forEach((val, p) => {
          if (val && val !== '') occT[t].add(`${d}-${p}`);
        });
      });
    });

    classes.forEach(c => {
      occC[c] = new Set<string>();
      (constraints.classes?.[c] || []).forEach(k => occC[c].add(k));
      classSchedules[c]?.forEach((day, d) => {
        day?.forEach((val, p) => {
          if (val && val !== '') occC[c].add(`${d}-${p}`);
        });
      });
    });

    // Shuffle with weighted heuristic bias
    const simDeck = [...unplacedCourses].sort((a, b) => {
      const weightA = cardHeatmaps[a.id]?.heuristicWeight || 0;
      const weightB = cardHeatmaps[b.id]?.heuristicWeight || 0;
      return (weightB + Math.random() * 50) - (weightA + Math.random() * 50);
    });

    let placedInSim = 0;

    for (const card of simDeck) {
      const hours = card.hours || 1;
      let placed = false;

      const dayOrder = [...Array(weekDays.length).keys()].sort(() => Math.random() - 0.5);
      
      for (const dIdx of dayOrder) {
        if (!weekDays[dIdx]?.active) continue;
        const dayP = weekDays[dIdx].periods || 8;
        const pOrder = [...Array(Math.max(1, dayP - hours + 1)).keys()].sort(() => Math.random() - 0.5);

        for (const pIdx of pOrder) {
          let fit = true;
          for (let h = 0; h < hours; h++) {
            const key = `${dIdx}-${pIdx + h}`;
            if (card.teachers?.some(t => occT[t]?.has(key))) { fit = false; break; }
            if (card.classes?.some(c => occC[c]?.has(key))) { fit = false; break; }
          }

          if (fit) {
            for (let h = 0; h < hours; h++) {
              const key = `${dIdx}-${pIdx + h}`;
              card.teachers?.forEach(t => occT[t]?.add(key));
              card.classes?.forEach(c => occC[c]?.add(key));
            }
            placed = true;
            placedInSim++;
            break;
          }
        }
        if (placed) break;
      }
    }

    totalSimPlaced += placedInSim;
    if (placedInSim === unplacedCourses.length) {
      successfulSims++;
    }
  }

  if (activeJobId !== jobId) return null;

  // 6. Global Feasibility & Solvability Assessment
  const unplacedCount = unplacedCourses.length;
  const simAvgPlacedRate = unplacedCount > 0 
    ? Math.round((totalSimPlaced / (simPasses * unplacedCount)) * 100)
    : 100;
  const simSuccessRate = Math.round((successfulSims / simPasses) * 100);

  let feasibilityScore = 100;
  if (impossibleAllocations.length > 0 || deadEndWarnings.length > 0) {
    const deadEndPenalty = (impossibleAllocations.length + deadEndWarnings.length) * 12;
    feasibilityScore = Math.max(0, 45 - deadEndPenalty);
  } else if (bottlenecks.some(b => b.riskScore >= 95)) {
    feasibilityScore = Math.min(60, simAvgPlacedRate);
  } else if (bottlenecks.length > 3) {
    feasibilityScore = Math.min(75, simAvgPlacedRate);
  } else {
    feasibilityScore = Math.max(50, Math.min(100, Math.round(simAvgPlacedRate * 0.7 + simSuccessRate * 0.3)));
  }

  let solvabilityStatus: 'optimal' | 'feasible' | 'tight' | 'critical' | 'impossible' = 'optimal';
  if (impossibleAllocations.length > 0 || deadEndWarnings.length > 0 || bottlenecks.some(b => b.riskScore >= 100)) {
    solvabilityStatus = 'impossible';
  } else if (feasibilityScore < 50 || bottlenecks.some(b => b.riskScore >= 85)) {
    solvabilityStatus = 'critical';
  } else if (feasibilityScore < 75 || bottlenecks.length > 0) {
    solvabilityStatus = 'tight';
  } else if (feasibilityScore < 92) {
    solvabilityStatus = 'feasible';
  } else {
    solvabilityStatus = 'optimal';
  }

  // Teacher load variance
  let totalTeacherHours = 0;
  Object.values(teacherStats).forEach(s => totalTeacherHours += s.requiredTotal);
  const avgLoad = teachers.length > 0 ? totalTeacherHours / teachers.length : 0;
  let varianceSum = 0;
  teachers.forEach(t => {
    const load = teacherStats[t]?.requiredTotal || 0;
    varianceSum += Math.pow(load - avgLoad, 2);
  });
  const stdDev = teachers.length > 0 ? Math.sqrt(varianceSum / teachers.length) : 0;
  const balanceScore = Math.max(20, Math.round(100 - (stdDev * 3.5)));

  if (suggestedFixes.length === 0 && unplacedCourses.length > 0) {
    suggestedFixes.push({
      title: 'Tüm Kısıtlamalar Dengeli',
      description: 'Mevcut öğretmen ve sınıf açık saatleri ders dağıtımı için yeterli esnekliğe sahip. AI Kuantum Motorunu doğrudan çalıştırabilirsiniz.',
      severity: 'success'
    });
  }

  const durationMs = Math.round(performance.now() - startTime);

  const predictiveStats: ShadowPredictiveStats = {
    totalLessons: Object.values(teacherStats).reduce((a, b) => a + b.requiredTotal, 0),
    placedLessons: Object.values(teacherStats).reduce((a, b) => a + b.totalPlaced, 0),
    unplacedLessons: unplacedCourses.length,
    totalTeacherCapacityHours: teachers.length * totalSchoolSlots,
    totalClassRequiredHours: Object.values(classStats).reduce((a, b) => a + b.requiredTotal, 0),
    teacherLoadBalanceScore: balanceScore,
    windowGapsEstimate: Math.max(0, Math.round((100 - feasibilityScore) * 0.15)),
    computationTimeMs: durationMs,
    simulatedPlacementRate: simAvgPlacedRate,
    deadlockRisk: Math.max(0, 100 - simAvgPlacedRate)
  };

  const heatmapMatrix: DifficultyHeatmapMatrix = {
    timestamp: Date.now(),
    totalCardsAnalyzed: unplacedCourses.length,
    cards: cardHeatmaps,
    gridContentionMap,
    schoolSlotLoads,
    peakLoadSlots: peakSlots,
    quietLoadSlots: quietSlots,
    deadEnds: deadEndWarnings,
    maxContentionSlot
  };

  return {
    jobId,
    timestamp: Date.now(),
    feasibilityScore,
    solvabilityStatus,
    bottlenecks,
    impossibleAllocations,
    recommendedPlacementOrder: cardPriorityList,
    suggestedFixes,
    predictiveStats,
    heatmap: heatmapMatrix,
    deadEndWarnings,
    isDeepRun: isDeep
  };
}

