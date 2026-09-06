/**
 * Background Task Manager & Job Queue Types
 * Prevents race conditions, handles concurrency, priority queues, and algorithmic data operations.
 */

import { 
  DistributionParams, 
  DistributionResult, 
  CourseCard, 
  SchoolSettings, 
  SchedulesMap, 
  ConstraintsMap 
} from './workerMessages';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type TaskStatus = 
  | 'QUEUED' 
  | 'RUNNING' 
  | 'PAUSED' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export enum TaskType {
  DISTRIBUTION = 'DISTRIBUTION',
  ANALYZE_CONFLICTS = 'ANALYZE_CONFLICTS',
  APPLY_HEURISTIC_RULE = 'APPLY_HEURISTIC_RULE',
  NORMALIZE_SCHEDULE = 'NORMALIZE_SCHEDULE',
  VALIDATE_CONSTRAINTS = 'VALIDATE_CONSTRAINTS',
  CUSTOM = 'CUSTOM'
}

export interface TaskProgress {
  progress: number;
  phase: string;
  stage?: string;
  processedItems?: number;
  totalItems?: number;
  details?: Record<string, any>;
}

export interface TaskOptions {
  priority?: TaskPriority;
  timeoutMs?: number;
  maxRetries?: number;
  lockKey?: string; // Mutex key to prevent race conditions on shared data
  cancelPreviousWithSameLock?: boolean; // Cancel older tasks holding the same lockKey
  debounceMs?: number;
}

export interface BackgroundTask<TPayload = any, TResult = any> {
  id: string;
  type: TaskType | string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  payload: TPayload;
  result?: TResult;
  error?: Error | string;
  progress: TaskProgress;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  maxRetries: number;
  lockKey?: string;
  abortController?: AbortController;
  cancelRequested?: boolean;
}

export interface ConflictAnalysisResult {
  totalConflicts: number;
  teacherConflicts: { teacher: string; day: number; period: number; lessons: string[] }[];
  classConflicts: { cls: string; day: number; period: number; lessons: string[] }[];
  roomConflicts: { room: string; day: number; period: number; lessons: string[] }[];
  ruleViolations: { type: string; description: string; target: string }[];
  summary: string;
}

export interface HeuristicRuleConfig {
  hourWeight: number;
  teacherConstraintWeight: number;
  classConstraintWeight: number;
  roomConstraintWeight: number;
  failCountWeight: number;
  randomFactor: number;
  preventSameDay: boolean;
  maxDailyHours?: number;
  minGap?: number;
  maxGap?: number;
}

export interface TaskQueueStats {
  queuedCount: number;
  runningCount: number;
  completedCount: number;
  failedCount: number;
  totalProcessed: number;
  activeLocks: string[];
}
