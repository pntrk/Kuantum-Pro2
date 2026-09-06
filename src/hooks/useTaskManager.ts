/**
 * React Hook for Background Task Manager & Algorithm Engine
 * Provides reactive task status, queue monitoring, and race-condition-free dispatching.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  backgroundTaskManager, 
  BackgroundTaskManager 
} from '../services/backgroundTaskManager';
import { 
  BackgroundTask, 
  TaskType, 
  TaskOptions, 
  TaskQueueStats,
  ConflictAnalysisResult
} from '../types/taskManagerTypes';
import { 
  DistributionParams, 
  DistributionResult, 
  CourseCard, 
  SchedulesMap, 
  SchoolSettings, 
  ConstraintsMap 
} from '../types/workerMessages';

export function useTaskManager() {
  const [activeTasks, setActiveTasks] = useState<BackgroundTask[]>([]);
  const [queuedTasks, setQueuedTasks] = useState<BackgroundTask[]>([]);
  const [stats, setStats] = useState<TaskQueueStats>(backgroundTaskManager.getStats());
  const managerRef = useRef<BackgroundTaskManager>(backgroundTaskManager);

  const refreshState = useCallback(() => {
    setActiveTasks(managerRef.current.getActiveTasks());
    setQueuedTasks(managerRef.current.getQueuedTasks());
    setStats(managerRef.current.getStats());
  }, []);

  useEffect(() => {
    const unsubscribe = managerRef.current.subscribe(() => {
      refreshState();
    });

    refreshState();
    return () => {
      unsubscribe();
    };
  }, [refreshState]);

  /**
   * Enqueues a heavy Quantum Distribution task with mutual exclusion lock
   */
  const dispatchDistribution = useCallback((
    params: DistributionParams, 
    options?: TaskOptions
  ): Promise<DistributionResult> => {
    const taskOpts: TaskOptions = {
      priority: 'HIGH',
      lockKey: 'SCHEDULE_OPTIMIZATION_MUTEX',
      cancelPreviousWithSameLock: true,
      maxRetries: 1,
      ...options
    };

    const { promise } = managerRef.current.enqueue<DistributionParams, DistributionResult>(
      TaskType.DISTRIBUTION,
      `Kuantum Dağıtım (${params.coreCount || 4} Çekirdek)`,
      params,
      taskOpts
    );

    return promise;
  }, []);

  /**
   * Enqueues a non-blocking Conflict & Constraint Analysis
   */
  const dispatchConflictAnalysis = useCallback((
    payload: {
      schedules: SchedulesMap;
      classSchedules: SchedulesMap;
      roomSchedules: SchedulesMap;
      schoolSettings: SchoolSettings;
      constraints?: ConstraintsMap;
    },
    options?: TaskOptions
  ): Promise<ConflictAnalysisResult> => {
    const taskOpts: TaskOptions = {
      priority: 'NORMAL',
      lockKey: 'SCHEDULE_ANALYSIS_LOCK',
      cancelPreviousWithSameLock: true,
      ...options
    };

    const { promise } = managerRef.current.enqueue(
      TaskType.ANALYZE_CONFLICTS,
      'Ders Programı Çakışma & Kural Analizi',
      payload,
      taskOpts
    );

    return promise;
  }, []);

  /**
   * Evaluates MRV and heuristic sorting for cards
   */
  const dispatchHeuristicSort = useCallback((
    cards: CourseCard[]
  ): Promise<{ sortedCards: CourseCard[]; scoreMap: Record<string, number> }> => {
    const { promise } = managerRef.current.enqueue(
      TaskType.APPLY_HEURISTIC_RULE,
      'MRV & Kısıt Ağırlıklı Kart Sıralama',
      { cards },
      { priority: 'LOW' }
    );

    return promise;
  }, []);

  /**
   * Cancels a specific task by ID
   */
  const cancelTask = useCallback((taskId: string, reason?: string) => {
    return managerRef.current.cancelTask(taskId, reason);
  }, []);

  /**
   * Cancels all running and queued tasks
   */
  const cancelAllTasks = useCallback((reason?: string) => {
    managerRef.current.cancelAll(reason);
  }, []);

  return {
    activeTasks,
    queuedTasks,
    stats,
    dispatchDistribution,
    dispatchConflictAnalysis,
    dispatchHeuristicSort,
    cancelTask,
    cancelAllTasks,
    manager: managerRef.current
  };
}
