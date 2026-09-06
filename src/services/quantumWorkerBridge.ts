/**
 * QuantumWorkerBridge - Type-Safe, Self-Healing Multi-Core Worker Orchestrator
 * Features:
 *  - Automatic Worker Crash Recovery & Restart (up to N retries per core)
 *  - Background Heartbeat & Watchdog (detects deadlocks and stalls)
 *  - requestAnimationFrame UI Throttling (prevents UI freezing & lag)
 *  - Graceful Degradation & Memory Leak Protection
 */

import {
  WorkerInboundType,
  WorkerOutboundType,
  WorkerOutboundMessage,
  StartDistributionMessage,
  DistributionResult,
  CoreProgressState,
  DistributionState,
  WorkerCoreStatus,
  WorkerRecoveryInfo,
  CourseCard,
  SchoolSettings,
  SchedulesMap,
  ConstraintsMap,
  DistributionParams
} from '../types/workerMessages';
import { globalErrorHandler } from './globalErrorHandler';
export type { DistributionParams };

export interface QuantumBridgeCallbacks {
  onProgress?: (globalState: DistributionState, coreStates: CoreProgressState[]) => void;
  onDone?: (result: DistributionResult) => void;
  onError?: (error: Error) => void;
  onStop?: (bestResult: DistributionResult | null) => void;
  onWorkerRecovering?: (info: WorkerRecoveryInfo) => void;
}

interface ManagedWorkerSlot {
  index: number;
  instance: Worker | null;
  status: WorkerCoreStatus;
  retryCount: number;
  lastHeartbeat: number;
  lastProgressTimestamp: number;
  lastProgress: number;
}

export class QuantumWorkerBridge {
  private slots: ManagedWorkerSlot[] = [];
  private isRunning = false;
  private isCancelled = false;
  private coreStates: CoreProgressState[] = [];
  private callbacks: QuantumBridgeCallbacks = {};
  
  // Stored parameters for auto-restart payloads
  private currentParams: DistributionParams | null = null;
  private maxRetriesPerWorker = 3;
  private watchdogTimeoutMs = 12000; // 12 seconds without progress or pong
  private watchdogIntervalId: any = null;
  
  // requestAnimationFrame Batching State
  private rafId: number | null = null;
  private isRafPending = false;
  private latestGlobalState: DistributionState = { isRunning: false, progress: 0, phase: '' };
  
  // Results & aggregation
  private bestResult: DistributionResult | null = null;
  private bestUnplacedCount = Infinity;
  private totalCores = 1;
  private activeResolvers: {
    resolve?: (res: DistributionResult) => void;
    reject?: (err: Error) => void;
  } = {};

  constructor(callbacks?: QuantumBridgeCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public setCallbacks(callbacks: QuantumBridgeCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Spawns worker pool, attaches resilience monitors and initiates solving
   */
  public async start(params: DistributionParams): Promise<DistributionResult> {
    this.terminate(); // Clean up existing workers if any
    
    this.isRunning = true;
    this.isCancelled = false;
    this.bestResult = null;
    this.bestUnplacedCount = Infinity;
    this.currentParams = params;
    this.maxRetriesPerWorker = params.options?.maxRetriesPerWorker ?? 3;
    this.watchdogTimeoutMs = params.options?.watchdogTimeoutMs ?? 12000;

    const coreCount = Math.max(1, params.coreCount || (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4) || 4);
    this.totalCores = coreCount;

    // Initialize core states and worker slots
    this.slots = Array.from({ length: coreCount }, (_, i) => ({
      index: i,
      instance: null,
      status: 'idle',
      retryCount: 0,
      lastHeartbeat: performance.now(),
      lastProgressTimestamp: performance.now(),
      lastProgress: 0
    }));

    this.coreStates = Array.from({ length: coreCount }, (_, i) => ({
      progress: 0,
      phase: 'Hazırlanıyor...',
      workerIndex: i,
      timestamp: performance.now(),
      status: 'idle',
      retryCount: 0
    }));

    this.latestGlobalState = {
      isRunning: true,
      progress: 0,
      phase: `Kuantum AI Motoru (${coreCount} Çekirdek) Başlatılıyor...`,
      totalCores: coreCount,
      activeCoresCount: coreCount,
      recoveryCount: 0
    };
    
    this.scheduleRafFlush();

    return new Promise<DistributionResult>((resolve, reject) => {
      this.activeResolvers = { resolve, reject };

      for (let i = 0; i < coreCount; i++) {
        this.spawnWorkerSlot(i);
      }

      this.startWatchdog();
    });
  }

  /**
   * Spawns a single managed worker slot
   */
  private spawnWorkerSlot(workerIndex: number) {
    const slot = this.slots[workerIndex];
    if (!slot || !this.currentParams || !this.isRunning) return;

    try {
      // Terminate prior instance if exists
      if (slot.instance) {
        try {
          slot.instance.terminate();
        } catch (e) {
          // ignore
        }
        slot.instance = null;
      }

      // Instantiate Web Worker
      const worker = new Worker(
        new URL('../workers/quantum.ts', import.meta.url), 
        { type: 'module' }
      );

      slot.instance = worker;
      slot.status = 'running';
      slot.lastHeartbeat = performance.now();
      slot.lastProgressTimestamp = performance.now();

      this.coreStates[workerIndex] = {
        ...this.coreStates[workerIndex],
        status: 'running',
        phase: slot.retryCount > 0 
          ? `Yeniden Başlatıldı (Deneme ${slot.retryCount}/${this.maxRetriesPerWorker})...` 
          : 'AI Optimizasyon Başlatılıyor...',
        timestamp: performance.now(),
        retryCount: slot.retryCount
      };

      worker.onmessage = (e: MessageEvent<WorkerOutboundMessage | any>) => {
        this.handleWorkerMessage(e.data, workerIndex);
      };

      worker.onerror = (err) => {
        console.error(`[QuantumBridge] Worker #${workerIndex} Uncaught Error:`, err);
        globalErrorHandler.logError({
          source: 'worker',
          message: `Worker #${workerIndex} çöktü: ${err.message || 'Bilinmeyen Hata'}`,
          isFatal: true,
          handled: true
        });
        this.recoverWorkerSlot(workerIndex, err.message || 'Bilinmeyen Çalışma Zamanı Hatası');
      };

      worker.onmessageerror = (err) => {
        console.error(`[QuantumBridge] Worker #${workerIndex} Message Deserialization Error:`, err);
        this.recoverWorkerSlot(workerIndex, 'Mesaj seri hale getirme hatası (Serialization Error)');
      };

      // Post typed start message with seed variation on retries
      const message: StartDistributionMessage = {
        type: WorkerInboundType.START,
        payload: {
          unplacedCourses: this.currentParams.unplacedCourses,
          schoolSettings: this.currentParams.schoolSettings,
          schedules: this.currentParams.schedules,
          classSchedules: this.currentParams.classSchedules,
          roomSchedules: this.currentParams.roomSchedules,
          lockedCells: this.currentParams.lockedCells,
          constraints: this.currentParams.constraints,
          workerIndex,
          totalWorkers: this.totalCores,
          heuristicHeatmap: this.currentParams.heuristicHeatmap || null,
          options: {
            ...this.currentParams.options,
            seedBonus: slot.retryCount * 7
          }
        }
      };

      worker.postMessage(message);
      this.scheduleRafFlush();
    } catch (createErr: any) {
      console.error(`[QuantumBridge] Failed to instantiate worker #${workerIndex}:`, createErr);
      this.recoverWorkerSlot(workerIndex, createErr.message || 'Worker oluşturulamadı');
    }
  }

  /**
   * Resilient Auto-Restart Mechanism for individual worker crash / stall
   */
  private recoverWorkerSlot(workerIndex: number, reason: string) {
    if (!this.isRunning || this.isCancelled) return;

    const slot = this.slots[workerIndex];
    if (!slot) return;

    slot.retryCount++;
    const maxRetries = this.maxRetriesPerWorker;

    if (slot.retryCount <= maxRetries) {
      slot.status = 'recovering';
      console.warn(`[QuantumBridge] Auto-recovering Worker #${workerIndex} (Attempt ${slot.retryCount}/${maxRetries}) - Reason: ${reason}`);

      const recoveryInfo: WorkerRecoveryInfo = {
        workerIndex,
        retryCount: slot.retryCount,
        maxRetries,
        reason,
        timestamp: Date.now()
      };

      this.callbacks.onWorkerRecovering?.(recoveryInfo);

      this.coreStates[workerIndex] = {
        ...this.coreStates[workerIndex],
        status: 'recovering',
        phase: `Hata Sonrası Otomatik Yeniden Başlatılıyor (${slot.retryCount}/${maxRetries})...`,
        timestamp: performance.now(),
        errorMessage: reason
      };

      // Count total recoveries in global state
      const totalRecoveries = this.slots.reduce((acc, s) => acc + s.retryCount, 0);
      this.latestGlobalState = {
        ...this.latestGlobalState,
        recoveryCount: totalRecoveries
      };
      this.scheduleRafFlush();

      // Spawn fresh worker with minor backoff delay
      setTimeout(() => {
        if (this.isRunning && !this.isCancelled) {
          this.spawnWorkerSlot(workerIndex);
        }
      }, 150);
    } else {
      // Max retries exceeded for this specific worker
      slot.status = 'failed';
      console.error(`[QuantumBridge] Worker #${workerIndex} reached maximum retry threshold (${maxRetries}). Marking slot as failed.`);

      this.coreStates[workerIndex] = {
        ...this.coreStates[workerIndex],
        status: 'failed',
        phase: `Devre Dışı (Maksimum Deneme Aşıldı)`,
        timestamp: performance.now(),
        errorMessage: reason
      };

      this.checkGlobalCompletion();
    }
  }

  /**
   * Periodic Watchdog to detect thread hangs / deadlocks
   */
  private startWatchdog() {
    this.stopWatchdog();
    this.watchdogIntervalId = setInterval(() => {
      if (!this.isRunning || this.isCancelled) return;

      const now = performance.now();

      this.slots.forEach(slot => {
        if (slot.status === 'running' && slot.instance) {
          const timeSinceLastProgress = now - slot.lastProgressTimestamp;
          const timeSinceLastHeartbeat = now - slot.lastHeartbeat;

          // If the worker has been completely silent for longer than watchdog timeout
          if (timeSinceLastProgress > this.watchdogTimeoutMs && timeSinceLastHeartbeat > this.watchdogTimeoutMs) {
            console.warn(`[QuantumBridge Watchdog] Worker #${slot.index} stalled for ${(timeSinceLastProgress / 1000).toFixed(1)}s. Triggering recovery.`);
            this.recoverWorkerSlot(slot.index, `Çekirdek yanıt vermeyi durdurdu (Zaman aşımı > ${this.watchdogTimeoutMs / 1000}s)`);
          } else {
            // Send soft heartbeat ping
            try {
              slot.instance.postMessage({
                type: WorkerInboundType.PING,
                timestamp: Date.now()
              });
            } catch (e) {
              // Ignore post error
            }
          }
        }
      });
    }, 3000);
  }

  private stopWatchdog() {
    if (this.watchdogIntervalId) {
      clearInterval(this.watchdogIntervalId);
      this.watchdogIntervalId = null;
    }
  }

  /**
   * Request graceful stop from all workers
   */
  public stop() {
    if (!this.isRunning) return;
    this.isCancelled = true;
    this.stopWatchdog();
    
    this.latestGlobalState = {
      ...this.latestGlobalState,
      phase: 'İptal Ediliyor, En İyi Sonuç Hazırlanıyor...'
    };
    this.scheduleRafFlush();

    this.slots.forEach(slot => {
      if (slot.instance) {
        try {
          slot.instance.postMessage({ type: WorkerInboundType.STOP });
        } catch (err) {
          // Ignored
        }
      }
    });
  }

  /**
   * Forcefully terminate all background workers & clear timers
   */
  public terminate() {
    this.stopWatchdog();
    this.cancelRaf();
    
    this.slots.forEach(slot => {
      if (slot.instance) {
        try {
          slot.instance.terminate();
        } catch (e) {
          // Ignored
        }
        slot.instance = null;
      }
    });
    this.slots = [];
    this.isRunning = false;
  }

  /**
   * Processes outbound messages from workers
   */
  private handleWorkerMessage(data: WorkerOutboundMessage | any, workerIndex: number) {
    if (!data || !this.isRunning) return;

    const slot = this.slots[workerIndex];
    if (slot) {
      slot.lastHeartbeat = performance.now();
    }

    const messageType = data.type;

    if (messageType === WorkerOutboundType.PONG || messageType === 'pong') {
      // Heartbeat acknowledged
      return;
    }

    if (messageType === WorkerOutboundType.PROGRESS || messageType === 'progress') {
      if (slot) {
        slot.lastProgressTimestamp = performance.now();
        slot.lastProgress = data.progress;
      }

      // Update core state
      if (this.coreStates[workerIndex]) {
        this.coreStates[workerIndex] = {
          progress: data.progress,
          phase: data.phase,
          iter: data.iter,
          unplaced: data.unplaced,
          workerIndex,
          timestamp: performance.now(),
          status: 'running',
          retryCount: slot?.retryCount || 0
        };
      }

      // Compute aggregated progress across active/completed slots
      const validCores = this.coreStates.filter(c => c.status !== 'failed');
      const avgProgress = validCores.length > 0
        ? Math.round(validCores.reduce((acc, c) => acc + c.progress, 0) / validCores.length)
        : 0;

      // Active cores count
      const activeCount = this.slots.filter(s => s.status === 'running' || s.status === 'recovering').length;
      const leadPhase = this.coreStates.find(c => c.status === 'running')?.phase || 'İşleniyor...';

      this.latestGlobalState = {
        isRunning: true,
        progress: avgProgress,
        phase: `${leadPhase} (${activeCount} Çekirdek Aktif)`,
        totalCores: this.totalCores,
        activeCoresCount: activeCount,
        recoveryCount: this.slots.reduce((acc, s) => acc + s.retryCount, 0)
      };

      // Batch UI updates with requestAnimationFrame
      this.scheduleRafFlush();
    } 
    else if (messageType === WorkerOutboundType.DONE || messageType === 'done') {
      const result: DistributionResult = data.payload;
      const unplacedCount = result.unplacedCourses ? result.unplacedCourses.length : Infinity;

      if (slot) {
        slot.status = 'completed';
      }
      if (this.coreStates[workerIndex]) {
        this.coreStates[workerIndex].status = 'completed';
        this.coreStates[workerIndex].progress = 100;
        this.coreStates[workerIndex].phase = 'Tamamlandı';
      }

      // Perfect solution found (0 unplaced) -> Fast-exit immediately!
      if (unplacedCount === 0) {
        this.bestResult = result;
        this.finish();
        return;
      }

      // Track best partial result
      if (unplacedCount < this.bestUnplacedCount) {
        this.bestUnplacedCount = unplacedCount;
        this.bestResult = result;
      }

      this.checkGlobalCompletion();
    } 
    else if (
      messageType === WorkerOutboundType.ERROR || 
      messageType === 'error' ||
      messageType === WorkerOutboundType.UNCAUGHT_EXCEPTION
    ) {
      console.warn(`[QuantumBridge] Worker #${workerIndex} reported runtime issue:`, data.message);
      
      if (data.canRetry !== false) {
        this.recoverWorkerSlot(workerIndex, data.message || 'Worker hatası');
      } else {
        if (slot) slot.status = 'failed';
        this.checkGlobalCompletion();
      }
    }
  }

  private checkGlobalCompletion() {
    const allDoneOrFailed = this.slots.every(s => s.status === 'completed' || s.status === 'failed');
    if (allDoneOrFailed) {
      this.finish();
    }
  }

  private finish() {
    const resolve = this.activeResolvers.resolve;
    const reject = this.activeResolvers.reject;
    
    this.terminate();

    this.latestGlobalState = {
      isRunning: false,
      progress: 100,
      phase: this.isCancelled ? 'İptal Edildi' : 'Tamamlandı',
      totalCores: this.totalCores,
      activeCoresCount: 0
    };
    this.flushUiUpdates();

    if (this.bestResult) {
      this.callbacks.onDone?.(this.bestResult);
      if (this.isCancelled) {
        this.callbacks.onStop?.(this.bestResult);
      }
      resolve?.(this.bestResult);
    } else {
      const err = new Error('Hiçbir çekirdek geçerli bir dağıtım sonucu üretemedi.');
      this.callbacks.onError?.(err);
      reject?.(err);
    }
  }

  /**
   * requestAnimationFrame Batched Dispatcher
   * Coalesces high-frequency updates to standard 60fps display refresh cycles
   */
  private scheduleRafFlush() {
    if (this.isRafPending) return;
    this.isRafPending = true;

    if (typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(() => {
        this.flushUiUpdates();
      });
    } else {
      setTimeout(() => {
        this.flushUiUpdates();
      }, 16);
    }
  }

  private flushUiUpdates() {
    this.isRafPending = false;
    this.rafId = null;
    if (this.callbacks.onProgress) {
      try {
        this.callbacks.onProgress(
          { ...this.latestGlobalState },
          [...this.coreStates]
        );
      } catch (err) {
        console.error('Error during RAF UI flush:', err);
      }
    }
  }

  private cancelRaf() {
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRafPending = false;
  }
}
