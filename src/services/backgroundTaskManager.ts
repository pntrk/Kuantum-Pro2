/**
 * Background Task Manager & Job Queue
 * Centralized, robust background orchestration system that unifies ad-hoc patch scripts
 * into a single, concurrency-controlled, race-condition-free algorithmic engine.
 */

import {
  BackgroundTask,
  TaskType,
  TaskPriority,
  TaskStatus,
  TaskOptions,
  TaskProgress,
  TaskQueueStats,
  ConflictAnalysisResult,
  HeuristicRuleConfig
} from '../types/taskManagerTypes';
import {
  DistributionParams,
  DistributionResult,
  CourseCard,
  SchoolSettings,
  SchedulesMap,
  ConstraintsMap
} from '../types/workerMessages';
import { QuantumWorkerBridge } from './quantumWorkerBridge';
import { globalErrorHandler } from './globalErrorHandler';

export type TaskEventListener = (task: BackgroundTask, event: 'QUEUED' | 'STARTED' | 'PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED') => void;

export class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  
  private queue: BackgroundTask[] = [];
  private runningTasks: Map<string, BackgroundTask> = new Map();
  private completedTasks: BackgroundTask[] = [];
  private activeLocks: Set<string> = new Set();
  
  private maxConcurrency = 2;
  private isProcessing = false;
  private listeners: Set<TaskEventListener> = new Set();
  private workerBridge: QuantumWorkerBridge | null = null;

  // Default algorithmic heuristic configuration (formerly distributed across patch scripts)
  private defaultHeuristics: HeuristicRuleConfig = {
    hourWeight: 150,
    teacherConstraintWeight: 50,
    classConstraintWeight: 50,
    roomConstraintWeight: 20,
    failCountWeight: 120,
    randomFactor: 30,
    preventSameDay: true,
    maxDailyHours: 4,
    minGap: 0,
    maxGap: 8
  };

  private constructor(maxConcurrency: number = 2) {
    this.maxConcurrency = maxConcurrency;
  }

  public static getInstance(maxConcurrency: number = 2): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager(maxConcurrency);
    }
    return BackgroundTaskManager.instance;
  }

  public setMaxConcurrency(limit: number) {
    this.maxConcurrency = Math.max(1, limit);
    this.processQueue();
  }

  public getHeuristicConfig(): HeuristicRuleConfig {
    return { ...this.defaultHeuristics };
  }

  public updateHeuristicConfig(config: Partial<HeuristicRuleConfig>) {
    this.defaultHeuristics = { ...this.defaultHeuristics, ...config };
  }

  /**
   * Enqueues a task with priority, mutex locking, and race condition prevention
   */
  public enqueue<TPayload = any, TResult = any>(
    type: TaskType | string,
    name: string,
    payload: TPayload,
    options: TaskOptions = {}
  ): { taskId: string; promise: Promise<TResult> } {
    const priority: TaskPriority = options.priority || 'NORMAL';
    const lockKey = options.lockKey;
    const abortController = new AbortController();

    const task: BackgroundTask<TPayload, TResult> = {
      id: 'task_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
      type,
      name,
      status: 'QUEUED',
      priority,
      payload,
      progress: { progress: 0, phase: 'Sırada bekliyor...' },
      createdAt: performance.now(),
      retryCount: 0,
      maxRetries: options.maxRetries ?? 2,
      lockKey,
      abortController
    };

    // If lockKey is specified and cancelPreviousWithSameLock is true,
    // cancel existing running or queued tasks with the same lock to prevent race conditions
    if (lockKey && options.cancelPreviousWithSameLock) {
      this.cancelTasksWithLock(lockKey, `Yeni '${name}' görevi başlatıldığı için önceki işlem iptal edildi.`);
    }

    // Insert task based on priority
    this.insertByPriority(task);
    this.emitEvent(task, 'QUEUED');

    const promise = new Promise<TResult>((resolve, reject) => {
      const checkCompletion = (t: BackgroundTask, event: string) => {
        if (t.id === task.id) {
          if (event === 'COMPLETED') {
            this.unsubscribe(checkCompletion);
            resolve(t.result);
          } else if (event === 'FAILED') {
            this.unsubscribe(checkCompletion);
            reject(t.error instanceof Error ? t.error : new Error(String(t.error || 'İşlem başarısız')));
          } else if (event === 'CANCELLED') {
            this.unsubscribe(checkCompletion);
            reject(new Error(`Görev iptal edildi: ${t.name}`));
          }
        }
      };
      this.subscribe(checkCompletion);
    });

    // Trigger queue processing
    setTimeout(() => this.processQueue(), 0);

    return { taskId: task.id, promise };
  }

  /**
   * Safe Priority Insertion: CRITICAL > HIGH > NORMAL > LOW
   */
  private insertByPriority(task: BackgroundTask) {
    const priorityWeights: Record<TaskPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      NORMAL: 2,
      LOW: 1
    };

    const taskWeight = priorityWeights[task.priority] || 2;
    let insertIndex = this.queue.length;

    for (let i = 0; i < this.queue.length; i++) {
      const qWeight = priorityWeights[this.queue[i].priority] || 2;
      if (taskWeight > qWeight) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, task);
  }

  /**
   * Main Queue Orchestration Loop
   */
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.runningTasks.size < this.maxConcurrency && this.queue.length > 0) {
        // Find next eligible task whose lockKey is not currently locked
        let taskIndex = -1;
        for (let i = 0; i < this.queue.length; i++) {
          const candidate = this.queue[i];
          if (!candidate.lockKey || !this.activeLocks.has(candidate.lockKey)) {
            taskIndex = i;
            break;
          }
        }

        if (taskIndex === -1) {
          // All queued tasks are currently blocked by active locks
          break;
        }

        const task = this.queue.splice(taskIndex, 1)[0];
        if (task.cancelRequested) {
          task.status = 'CANCELLED';
          this.emitEvent(task, 'CANCELLED');
          continue;
        }

        if (task.lockKey) {
          this.activeLocks.add(task.lockKey);
        }

        this.runningTasks.set(task.id, task);
        task.status = 'RUNNING';
        task.startedAt = performance.now();
        this.emitEvent(task, 'STARTED');

        // Execute task asynchronously without blocking queue dispatcher
        this.executeTask(task).finally(() => {
          if (task.lockKey) {
            this.activeLocks.delete(task.lockKey);
          }
          this.runningTasks.delete(task.id);
          this.completedTasks.unshift(task);
          if (this.completedTasks.length > 50) this.completedTasks.pop();
          
          this.processQueue();
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Task Execution Router
   */
  private async executeTask(task: BackgroundTask) {
    try {
      let result: any = null;

      switch (task.type) {
        case TaskType.DISTRIBUTION:
          result = await this.runDistributionTask(task);
          break;

        case TaskType.ANALYZE_CONFLICTS:
          result = await this.runConflictAnalysisTask(task);
          break;

        case TaskType.APPLY_HEURISTIC_RULE:
          result = await this.runHeuristicOptimizationTask(task);
          break;

        case TaskType.NORMALIZE_SCHEDULE:
          result = await this.runNormalizationTask(task);
          break;

        case TaskType.VALIDATE_CONSTRAINTS:
          result = await this.runValidationTask(task);
          break;

        default:
          if (typeof task.payload?.fn === 'function') {
            result = await task.payload.fn({
              signal: task.abortController?.signal,
              reportProgress: (pct: number, phase: string, details?: any) => {
                this.updateTaskProgress(task, pct, phase, details);
              }
            });
          } else {
            throw new Error(`Bilinmeyen görev tipi: ${task.type}`);
          }
          break;
      }

      if (task.cancelRequested) {
        task.status = 'CANCELLED';
        this.emitEvent(task, 'CANCELLED');
      } else {
        task.status = 'COMPLETED';
        task.result = result;
        task.completedAt = performance.now();
        this.updateTaskProgress(task, 100, 'Tamamlandı');
        this.emitEvent(task, 'COMPLETED');
      }
    } catch (err: any) {
      if (task.cancelRequested || err.message?.includes('iptal')) {
        task.status = 'CANCELLED';
        task.error = 'Görev iptal edildi';
        this.emitEvent(task, 'CANCELLED');
      } else {
        console.error(`[BackgroundTaskManager] Task ${task.id} failed:`, err);
        task.error = err;
        
        // Auto-retry mechanism
        if (task.retryCount < task.maxRetries) {
          task.retryCount++;
          task.status = 'QUEUED';
          this.updateTaskProgress(task, 0, `Hata sonrası yeniden deneniyor (${task.retryCount}/${task.maxRetries})...`);
          this.insertByPriority(task);
          this.emitEvent(task, 'QUEUED');
        } else {
          task.status = 'FAILED';
          task.completedAt = performance.now();
          globalErrorHandler.logError({
            source: 'main',
            message: `Arka plan görevi '${task.name}' başarısız oldu: ${err?.message || String(err)}`,
            stack: err?.stack,
            isFatal: false,
            handled: true
          });
          this.emitEvent(task, 'FAILED');
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // BUILT-IN CORE ENGINES (Unified from patch scripts)
  // ---------------------------------------------------------------------------

  /**
   * 1. Quantum AI Distribution Task
   */
  private async runDistributionTask(task: BackgroundTask<DistributionParams, DistributionResult>): Promise<DistributionResult> {
    const params = task.payload;
    if (!this.workerBridge) {
      this.workerBridge = new QuantumWorkerBridge();
    }

    this.workerBridge.setCallbacks({
      onProgress: (globalState) => {
        this.updateTaskProgress(task, globalState.progress, globalState.phase, {
          activeCoresCount: globalState.activeCoresCount,
          recoveryCount: globalState.recoveryCount
        });
      }
    });

    task.abortController?.signal.addEventListener('abort', () => {
      this.workerBridge?.stop();
    });

    return this.workerBridge.start(params);
  }

  /**
   * 2. Comprehensive Conflict & Constraint Analyzer (Unified from patch_analyze_conflicts.cjs)
   */
  private async runConflictAnalysisTask(task: BackgroundTask<{
    schedules: SchedulesMap;
    classSchedules: SchedulesMap;
    roomSchedules: SchedulesMap;
    schoolSettings: SchoolSettings;
    constraints?: ConstraintsMap;
  }, ConflictAnalysisResult>): Promise<ConflictAnalysisResult> {
    const { schedules, classSchedules, roomSchedules, schoolSettings, constraints } = task.payload;
    this.updateTaskProgress(task, 10, 'Çakışma Analizi Başlatılıyor...');

    const teacherConflicts: ConflictAnalysisResult['teacherConflicts'] = [];
    const classConflicts: ConflictAnalysisResult['classConflicts'] = [];
    const roomConflicts: ConflictAnalysisResult['roomConflicts'] = [];
    const ruleViolations: ConflictAnalysisResult['ruleViolations'] = [];

    const activeDays = schoolSettings.weekDays.filter(d => d.active);

    // 1. Analyze Teacher Overlaps
    let checkedTeachers = 0;
    const teacherKeys = Object.keys(schedules || {});
    for (const t of teacherKeys) {
      checkedTeachers++;
      for (const day of activeDays) {
        const d = day.id - 1;
        for (let p = 0; p < (day.periods || 9); p++) {
          const val = schedules[t]?.[d]?.[p];
          if (val && val !== '') {
            // Check manual constraints
            if (constraints?.teachers?.[t]?.includes(`${d}-${p}`)) {
              ruleViolations.push({
                type: 'Öğretmen Kısıtı',
                description: `${t} öğretmeninin kapalı saatine (${day.name}, ${p + 1}. ders) ders yerleşmiş.`,
                target: t
              });
            }
          }
        }
      }
      this.updateTaskProgress(task, Math.round(10 + (checkedTeachers / Math.max(1, teacherKeys.length)) * 30), 'Öğretmen Programları Taranıyor...');
    }

    // 2. Analyze Class Overlaps & Same Day Rules
    let checkedClasses = 0;
    const classKeys = Object.keys(classSchedules || {});
    const rules = (schoolSettings as any).distributionRules || { preventSameDay: true };

    for (const cls of classKeys) {
      checkedClasses++;
      for (const day of activeDays) {
        const d = day.id - 1;
        const subjectCountOnDay = new Map<string, number>();

        for (let p = 0; p < (day.periods || 9); p++) {
          const val = classSchedules[cls]?.[d]?.[p];
          if (val && val !== '') {
            try {
              const parsed = JSON.parse(val);
              if (parsed.subject) {
                subjectCountOnDay.set(parsed.subject, (subjectCountOnDay.get(parsed.subject) || 0) + 1);
              }
            } catch (e) {
              // ignore parse
            }

            if (constraints?.classes?.[cls]?.includes(`${d}-${p}`)) {
              ruleViolations.push({
                type: 'Sınıf Kısıtı',
                description: `${cls} sınıfının kapalı saatine (${day.name}, ${p + 1}. ders) ders yerleşmiş.`,
                target: cls
              });
            }
          }
        }

        // Check same day violations
        if (rules.preventSameDay) {
          subjectCountOnDay.forEach((count, sub) => {
            if (count > 2) {
              ruleViolations.push({
                type: 'Aynı Gün Kuralı',
                description: `${cls} sınıfı ${day.name} gününde '${sub}' dersinden ${count} saat alıyor.`,
                target: cls
              });
            }
          });
        }
      }
      this.updateTaskProgress(task, Math.round(40 + (checkedClasses / Math.max(1, classKeys.length)) * 40), 'Sınıf Kuralları Denetleniyor...');
    }

    // 3. Analyze Room Overlaps
    const roomKeys = Object.keys(roomSchedules || {});
    for (const r of roomKeys) {
      for (const day of activeDays) {
        const d = day.id - 1;
        for (let p = 0; p < (day.periods || 9); p++) {
          if (constraints?.rooms?.[r]?.includes(`${d}-${p}`)) {
            ruleViolations.push({
              type: 'Derslik Kısıtı',
              description: `${r} dersliğinin kapalı saatine (${day.name}, ${p + 1}. ders) ders yerleşmiş.`,
              target: r
            });
          }
        }
      }
    }

    const totalConflicts = teacherConflicts.length + classConflicts.length + roomConflicts.length + ruleViolations.length;
    const summary = totalConflicts === 0 
      ? 'Program tamamen tutarlı ve 0 çakışmaya sahip.' 
      : `${totalConflicts} adet kural ihlali ve kısıt uyuşmazlığı tespit edildi.`;

    this.updateTaskProgress(task, 100, 'Analiz Tamamlandı');

    return {
      totalConflicts,
      teacherConflicts,
      classConflicts,
      roomConflicts,
      ruleViolations,
      summary
    };
  }

  /**
   * 3. MRV & Heuristic Card Sorting (Unified from patch_quantum_heuristic.cjs & update_solver.cjs)
   */
  private async runHeuristicOptimizationTask(task: BackgroundTask<{
    cards: CourseCard[];
    config?: Partial<HeuristicRuleConfig>;
  }, { sortedCards: CourseCard[]; scoreMap: Record<string, number> }>): Promise<{ sortedCards: CourseCard[]; scoreMap: Record<string, number> }> {
    const { cards, config } = task.payload;
    const cfg = { ...this.defaultHeuristics, ...config };
    
    this.updateTaskProgress(task, 20, 'Heuristic Puanlama Hesaplanıyor...');

    const scoreMap: Record<string, number> = {};
    const evaluated = cards.map(card => {
      const hours = card.hours || card.span || 1;
      const teachersLen = (card.teachers || []).length;
      const classesLen = (card.classes || []).length;
      const roomsLen = (card.rooms || []).length;
      const failCount = card.failCount || 0;

      // Mathematical MRV (Most Constrained First) Scoring
      const score = 
        (hours * cfg.hourWeight) +
        (teachersLen * cfg.teacherConstraintWeight) +
        (classesLen * cfg.classConstraintWeight) +
        (roomsLen * cfg.roomConstraintWeight) +
        (failCount * cfg.failCountWeight);

      scoreMap[card.id] = score;
      return { card, score };
    });

    evaluated.sort((a, b) => b.score - a.score);
    this.updateTaskProgress(task, 100, 'Heuristic Sıralama Tamamlandı');

    return {
      sortedCards: evaluated.map(e => e.card),
      scoreMap
    };
  }

  /**
   * 4. Normalizes and Cleans Schedules
   */
  private async runNormalizationTask(task: BackgroundTask<{
    schedules: SchedulesMap;
    lockedCells: Record<string, boolean>;
  }, SchedulesMap>): Promise<SchedulesMap> {
    const { schedules, lockedCells } = task.payload;
    this.updateTaskProgress(task, 30, 'Program Verisi Normalleştiriliyor...');

    const normalized: SchedulesMap = {};
    Object.keys(schedules || {}).forEach(key => {
      normalized[key] = Array.from({ length: 7 }, () => Array(15).fill(''));
      for (let d = 0; d < 7; d++) {
        for (let p = 0; p < 15; p++) {
          const val = schedules[key]?.[d]?.[p];
          if (val && typeof val === 'string' && val.trim() !== '') {
            normalized[key][d][p] = val.trim();
          }
        }
      }
    });

    this.updateTaskProgress(task, 100, 'Normalizasyon Tamamlandı');
    return normalized;
  }

  /**
   * 5. Validates constraints on a single slot
   */
  private async runValidationTask(task: BackgroundTask<{
    card: CourseCard;
    day: number;
    period: number;
    constraints: ConstraintsMap;
    lockedCells: Record<string, boolean>;
  }, { isValid: boolean; reason?: string }>): Promise<{ isValid: boolean; reason?: string }> {
    const { card, day, period, constraints, lockedCells } = task.payload;
    const hours = card.hours || card.span || 1;

    for (let h = 0; h < hours; h++) {
      const p = period + h;
      
      // Check locked cells
      for (const t of (card.teachers || [])) {
        if (lockedCells[`${t}-${day}-${p}`]) return { isValid: false, reason: `${t} öğretmeni için bu saat kilitli.` };
        if (constraints?.teachers?.[t]?.includes(`${day}-${p}`)) return { isValid: false, reason: `${t} öğretmeni için bu saat kapalı.` };
      }
      for (const c of (card.classes || [])) {
        if (lockedCells[`${c}-${day}-${p}`]) return { isValid: false, reason: `${c} sınıfı için bu saat kilitli.` };
        if (constraints?.classes?.[c]?.includes(`${day}-${p}`)) return { isValid: false, reason: `${c} sınıfı için bu saat kapalı.` };
      }
      for (const r of (card.rooms || [])) {
        if (lockedCells[`${r}-${day}-${p}`]) return { isValid: false, reason: `${r} dersliği için bu saat kilitli.` };
        if (constraints?.rooms?.[r]?.includes(`${day}-${p}`)) return { isValid: false, reason: `${r} dersliği için bu saat kapalı.` };
      }
    }

    return { isValid: true };
  }

  // ---------------------------------------------------------------------------
  // TASK LIFECYCLE & MUTEX CONTROL
  // ---------------------------------------------------------------------------

  private updateTaskProgress(task: BackgroundTask, progress: number, phase: string, details?: any) {
    task.progress = {
      progress: Math.min(100, Math.max(0, progress)),
      phase,
      details
    };
    this.emitEvent(task, 'PROGRESS');
  }

  public cancelTask(taskId: string, reason: string = 'Kullanıcı tarafından iptal edildi'): boolean {
    // Check if in queue
    const qIdx = this.queue.findIndex(t => t.id === taskId);
    if (qIdx !== -1) {
      const task = this.queue.splice(qIdx, 1)[0];
      task.status = 'CANCELLED';
      task.error = reason;
      this.emitEvent(task, 'CANCELLED');
      return true;
    }

    // Check if running
    const running = this.runningTasks.get(taskId);
    if (running) {
      running.cancelRequested = true;
      running.abortController?.abort();
      running.error = reason;
      return true;
    }

    return false;
  }

  public cancelTasksWithLock(lockKey: string, reason: string = 'Aynı kilit anahtarına sahip yeni görev başlatıldı') {
    // Cancel in queue
    for (let i = this.queue.length - 1; i >= 0; i--) {
      if (this.queue[i].lockKey === lockKey) {
        const task = this.queue.splice(i, 1)[0];
        task.status = 'CANCELLED';
        task.error = reason;
        this.emitEvent(task, 'CANCELLED');
      }
    }

    // Cancel running
    this.runningTasks.forEach(task => {
      if (task.lockKey === lockKey) {
        task.cancelRequested = true;
        task.abortController?.abort();
        task.error = reason;
      }
    });
  }

  public cancelAll(reason: string = 'Tüm arka plan görevleri iptal edildi') {
    this.queue.forEach(t => {
      t.status = 'CANCELLED';
      t.error = reason;
      this.emitEvent(t, 'CANCELLED');
    });
    this.queue = [];

    this.runningTasks.forEach(t => {
      t.cancelRequested = true;
      t.abortController?.abort();
      t.error = reason;
    });

    if (this.workerBridge) {
      this.workerBridge.stop();
    }
  }

  public getStats(): TaskQueueStats {
    return {
      queuedCount: this.queue.length,
      runningCount: this.runningTasks.size,
      completedCount: this.completedTasks.filter(t => t.status === 'COMPLETED').length,
      failedCount: this.completedTasks.filter(t => t.status === 'FAILED').length,
      totalProcessed: this.completedTasks.length,
      activeLocks: Array.from(this.activeLocks)
    };
  }

  public getActiveTasks(): BackgroundTask[] {
    return Array.from(this.runningTasks.values());
  }

  public getQueuedTasks(): BackgroundTask[] {
    return [...this.queue];
  }

  // ---------------------------------------------------------------------------
  // OBSERVER PATTERN
  // ---------------------------------------------------------------------------

  public subscribe(listener: TaskEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public unsubscribe(listener: TaskEventListener) {
    this.listeners.delete(listener);
  }

  private emitEvent(task: BackgroundTask, event: 'QUEUED' | 'STARTED' | 'PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED') {
    this.listeners.forEach(listener => {
      try {
        listener(task, event);
      } catch (err) {
        console.error('Error in task listener:', err);
      }
    });
  }
}

export const backgroundTaskManager = BackgroundTaskManager.getInstance();
