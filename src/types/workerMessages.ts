/**
 * Type-Safe Messaging Protocol for Quantum Worker & Electron/Web Architecture
 * Includes Error Recovery, Heartbeat, and Auto-Restart Lifecycle Types
 */

import { DifficultyHeatmapMatrix } from './shadowAnalysisTypes';

export interface SchoolWeekDay {
  id: number;
  name: string;
  active: boolean;
  periods: number;
}

export interface LessonTime {
  start: string;
  end: string;
}

export interface SchoolSettings {
  weekDays: SchoolWeekDay[];
  lessonTimes: LessonTime[];
}

export interface CourseCard {
  id: string;
  teachers: string[];
  classes: string[];
  rooms?: string[];
  subject: string;
  span?: number;
  hours?: number;
  format?: string;
  failCount?: number;
  isLocked?: boolean;
  d?: number;
  p?: number;
  fromBoard?: boolean;
}

export type SchedulesMap = Record<string, string[][]>;

export interface ConstraintsMap {
  teachers: Record<string, string[]>;
  classes: Record<string, string[]>;
  subjects: Record<string, string[]>;
  rooms: Record<string, string[]>;
}

export interface DistributionParams {
  unplacedCourses: CourseCard[];
  schoolSettings: SchoolSettings;
  schedules: SchedulesMap;
  classSchedules: SchedulesMap;
  roomSchedules: SchedulesMap;
  lockedCells: Record<string, boolean>;
  constraints: ConstraintsMap;
  coreCount?: number;
  heuristicHeatmap?: DifficultyHeatmapMatrix | null;
  options?: {
    maxRetriesPerWorker?: number;
    watchdogTimeoutMs?: number;
    maxIterations?: number;
    temperature?: number;
    seedBonus?: number;
  };
}

export interface DistributionResult {
  schedules: SchedulesMap;
  classSchedules: SchedulesMap;
  roomSchedules: SchedulesMap;
  unplacedCourses: CourseCard[];
  iter: number;
  durationMs?: number;
  workerIndex?: number;
  score?: number;
}

export type WorkerCoreStatus = 'idle' | 'running' | 'recovering' | 'stalled' | 'failed' | 'completed';

export interface CoreProgressState {
  progress: number;
  phase: string;
  iter?: number;
  unplaced?: number;
  workerIndex: number;
  timestamp: number;
  status: WorkerCoreStatus;
  retryCount: number;
  errorMessage?: string;
}

export interface DistributionState {
  isRunning: boolean;
  progress: number;
  phase: string;
  totalCores?: number;
  activeCoresCount?: number;
  recoveryCount?: number;
}

export interface WorkerRecoveryInfo {
  workerIndex: number;
  retryCount: number;
  maxRetries: number;
  reason: string;
  timestamp: number;
}

// ----------------------------------------------------
// INBOUND MESSAGES (Main Thread -> Worker)
// ----------------------------------------------------

export enum WorkerInboundType {
  START = 'START_DISTRIBUTION',
  STOP = 'STOP_DISTRIBUTION',
  PING = 'PING',
  CLEANUP = 'CLEANUP'
}

export interface StartDistributionMessage {
  type: WorkerInboundType.START | 'start';
  payload: {
    unplacedCourses: CourseCard[];
    schoolSettings: SchoolSettings;
    schedules: SchedulesMap;
    classSchedules: SchedulesMap;
    roomSchedules: SchedulesMap;
    lockedCells: Record<string, boolean>;
    constraints: ConstraintsMap;
    workerIndex: number;
    totalWorkers?: number;
    heuristicHeatmap?: DifficultyHeatmapMatrix | null;
    options?: {
      maxIterations?: number;
      temperature?: number;
      progressThrottleMs?: number;
      seedBonus?: number;
    };
  };
}

export interface StopDistributionMessage {
  type: WorkerInboundType.STOP | 'stop';
}

export interface PingMessage {
  type: WorkerInboundType.PING | 'ping';
  timestamp: number;
}

export interface CleanupMessage {
  type: WorkerInboundType.CLEANUP | 'cleanup';
}

export type WorkerInboundMessage = 
  | StartDistributionMessage 
  | StopDistributionMessage 
  | PingMessage
  | CleanupMessage;

// ----------------------------------------------------
// OUTBOUND MESSAGES (Worker -> Main Thread)
// ----------------------------------------------------

export enum WorkerOutboundType {
  PROGRESS = 'PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
  PONG = 'PONG',
  METRICS = 'METRICS',
  UNCAUGHT_EXCEPTION = 'UNCAUGHT_EXCEPTION'
}

export interface ProgressMessage {
  type: WorkerOutboundType.PROGRESS | 'progress';
  progress: number;
  phase: string;
  workerIndex?: number;
  iter?: number;
  unplaced?: number;
  stats?: {
    temperature?: number;
    bestCost?: number;
    currentCost?: number;
    memoryMb?: number;
  };
}

export interface DoneMessage {
  type: WorkerOutboundType.DONE | 'done';
  payload: DistributionResult;
}

export interface ErrorMessage {
  type: WorkerOutboundType.ERROR | 'error' | WorkerOutboundType.UNCAUGHT_EXCEPTION;
  message: string;
  code?: string;
  workerIndex?: number;
  stack?: string;
  isFatal?: boolean;
  canRetry?: boolean;
}

export interface PongMessage {
  type: WorkerOutboundType.PONG | 'pong';
  workerIndex?: number;
  timestamp: number;
  uptimeMs?: number;
}

export type WorkerOutboundMessage = 
  | ProgressMessage 
  | DoneMessage 
  | ErrorMessage 
  | PongMessage;
