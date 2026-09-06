import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  QuantumWorkerBridge, 
  DistributionParams 
} from '../services/quantumWorkerBridge';
import { 
  DistributionState, 
  CoreProgressState, 
  DistributionResult,
  WorkerRecoveryInfo
} from '../types/workerMessages';

export interface UseQuantumBridgeOptions {
  onWorkerRecovering?: (info: WorkerRecoveryInfo) => void;
  onError?: (err: Error) => void;
}

export function useQuantumBridge(options?: UseQuantumBridgeOptions) {
  const [distributeState, setDistributeState] = useState<DistributionState>({
    isRunning: false,
    progress: 0,
    phase: '',
    totalCores: 4,
    activeCoresCount: 4,
    recoveryCount: 0
  });

  const [coreStates, setCoreStates] = useState<CoreProgressState[]>([]);
  const [recoveries, setRecoveries] = useState<WorkerRecoveryInfo[]>([]);
  const bridgeRef = useRef<QuantumWorkerBridge | null>(null);

  useEffect(() => {
    const bridge = new QuantumWorkerBridge({
      onProgress: (globalState, cores) => {
        setDistributeState(globalState);
        setCoreStates(cores);
      },
      onWorkerRecovering: (info) => {
        setRecoveries(prev => [info, ...prev].slice(0, 10));
        options?.onWorkerRecovering?.(info);
      },
      onError: (err) => {
        options?.onError?.(err);
      }
    });
    bridgeRef.current = bridge;

    return () => {
      bridge.terminate();
    };
  }, [options]);

  const startDistribution = useCallback(async (params: DistributionParams): Promise<DistributionResult> => {
    if (!bridgeRef.current) {
      bridgeRef.current = new QuantumWorkerBridge({
        onProgress: (globalState, cores) => {
          setDistributeState(globalState);
          setCoreStates(cores);
        },
        onWorkerRecovering: (info) => {
          setRecoveries(prev => [info, ...prev].slice(0, 10));
          options?.onWorkerRecovering?.(info);
        },
        onError: (err) => {
          options?.onError?.(err);
        }
      });
    }

    setRecoveries([]);
    return bridgeRef.current.start(params);
  }, [options]);

  const stopDistribution = useCallback(() => {
    if (bridgeRef.current) {
      bridgeRef.current.stop();
    }
  }, []);

  const terminateDistribution = useCallback(() => {
    if (bridgeRef.current) {
      bridgeRef.current.terminate();
    }
    setDistributeState({
      isRunning: false,
      progress: 0,
      phase: '',
      activeCoresCount: 0
    });
  }, []);

  return {
    distributeState,
    coreStates,
    recoveries,
    setDistributeState,
    setCoreStates,
    startDistribution,
    stopDistribution,
    terminateDistribution,
    isWorkerSupported: typeof Worker !== 'undefined'
  };
}
