import { CourseCard, SchoolSettings, SchedulesMap, ConstraintsMap } from './workerMessages';

export interface CardHeatmap {
  cardId: string;
  subject: string;
  teachers: string[];
  classes: string[];
  rooms?: string[];
  hours: number;
  validSlotsCount: number;
  validSlotPositions: { dayIndex: number; periodIndex: number; slotKey: string }[];
  competingCards: { cardId: string; subject: string; conflictResource: string; overlapScore: number }[];
  heuristicWeight: number; // Difficulty score (0 - 1000+)
  difficultyLevel: 'low' | 'medium' | 'high' | 'extreme' | 'dead_end';
  isDeadEnd: boolean;
  deadEndReason?: string;
  riskCategory?: 'dead_end' | 'critical_bottleneck' | 'high_contention' | 'moderate' | 'optimal';
  riskScore?: number; // 0 - 100
  riskDetails?: string;
  suggestedAction?: string;
}

export interface SlotLoadInfo {
  dayIndex: number;
  periodIndex: number;
  slotKey: string;
  busyTeachers: number;
  totalTeachers: number;
  busyClasses: number;
  totalClasses: number;
  closedTeachers: number;
  loadPercentage: number; // 0 - 100 % (School wide busy rate)
  contendersCount: number; // How many unplaced cards compete for this slot
  contentionPercentage: number; // 0 - 100 %
  combinedIntensity: number; // 0 - 100 %
  isPeakHour?: boolean;
  isQuietHour?: boolean;
}

export interface DeadEndWarning {
  cardId: string;
  teachers: string[];
  classes: string[];
  subject: string;
  hours: number;
  warningMessage: string;
  details: string;
  affectedResources: string[];
}

export interface DifficultyHeatmapMatrix {
  timestamp: number;
  totalCardsAnalyzed: number;
  cards: Record<string, CardHeatmap>;
  gridContentionMap: Record<string, { totalContenders: number; contendingCardIds: string[]; loadPressure: number }>;
  schoolSlotLoads?: Record<string, SlotLoadInfo>;
  peakLoadSlots?: { dayIndex: number; periodIndex: number; dayName: string; periodLabel: string; loadPercentage: number; message: string }[];
  quietLoadSlots?: { dayIndex: number; periodIndex: number; dayName: string; periodLabel: string; loadPercentage: number; message: string }[];
  deadEnds: DeadEndWarning[];
  maxContentionSlot: { dayIndex: number; periodIndex: number; contentionScore: number; slotKey: string } | null;
}

export interface BottleneckItem {
  type: 'teacher' | 'class' | 'room' | 'subject';
  name: string;
  riskScore: number; // 0 - 100
  message: string;
  freeHours: number;
  requiredHours: number;
  utilizationRate: number; // percentage
}

export interface ImpossibleAllocation {
  cardId: string;
  reason: string;
  teachers: string[];
  classes: string[];
  subject: string;
  hours: number;
}

export interface RecommendedCardPriority {
  id: string;
  subject: string;
  teachers: string[];
  classes: string[];
  hours: number;
  priorityScore: number;
  difficultyRank: number;
  heuristicWeight?: number;
  reason: string;
}

export interface SuggestedFix {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  target?: string;
  actionableType?: 'open_constraint' | 'unlock_cell' | 'split_block' | 'reassign';
}

export interface ShadowPredictiveStats {
  totalLessons: number;
  placedLessons: number;
  unplacedLessons: number;
  totalTeacherCapacityHours: number;
  totalClassRequiredHours: number;
  teacherLoadBalanceScore: number; // 0 - 100
  windowGapsEstimate: number;
  computationTimeMs: number;
  simulatedPlacementRate: number; // 0 - 100 %
  deadlockRisk: number; // 0 - 100 %
}

export interface ShadowAnalysisResult {
  jobId: string;
  timestamp: number;
  feasibilityScore: number; // 0 - 100
  solvabilityStatus: 'optimal' | 'feasible' | 'tight' | 'critical' | 'impossible';
  bottlenecks: BottleneckItem[];
  impossibleAllocations: ImpossibleAllocation[];
  recommendedPlacementOrder: RecommendedCardPriority[];
  suggestedFixes: SuggestedFix[];
  predictiveStats: ShadowPredictiveStats;
  heatmap: DifficultyHeatmapMatrix;
  deadEndWarnings: DeadEndWarning[];
  isDeepRun?: boolean;
}

export interface ShadowWorkerPayload {
  constraints: ConstraintsMap;
  lockedCells: Record<string, boolean>;
  schoolSettings: SchoolSettings;
  schedules: SchedulesMap;
  classSchedules: SchedulesMap;
  roomSchedules: SchedulesMap;
  unplacedCourses: CourseCard[];
  teachers: string[];
  classes: string[];
  subjects: string[];
  rooms: string[];
  isDeepRun?: boolean;
}

export type ShadowWorkerInbound = 
  | { type: 'ANALYZE_SHADOW'; jobId: string; payload: ShadowWorkerPayload }
  | { type: 'FORCE_DEEP_RUN'; jobId: string; payload: ShadowWorkerPayload }
  | { type: 'ABORT'; jobId?: string };

export type ShadowWorkerOutbound =
  | { type: 'SHADOW_ANALYSIS_RESULT'; jobId: string; result: ShadowAnalysisResult }
  | { type: 'SHADOW_DEAD_END_WARNING'; jobId: string; warnings: DeadEndWarning[] }
  | { type: 'SHADOW_ANALYSIS_ABORTED'; jobId: string }
  | { type: 'SHADOW_ANALYSIS_ERROR'; jobId: string; error: string };
