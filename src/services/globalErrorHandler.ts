/**
 * Global Resilience & Error Recovery Service
 * Monitors Main UI thread, Electron IPC, and unhandled rejections to prevent white-screens.
 */

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  source: 'worker' | 'main' | 'electron' | 'network' | 'render';
  message: string;
  stack?: string;
  isFatal: boolean;
  handled: boolean;
}

export type ErrorListener = (error: SystemErrorLog) => void;

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private logs: SystemErrorLog[] = [];
  private listeners: Set<ErrorListener> = new Set();
  private isInitialized = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Capture uncaught JavaScript errors
    window.addEventListener('error', (event: ErrorEvent) => {
      // Ignore benign resize observer or vite websocket errors
      if (
        event.message?.includes('ResizeObserver') || 
        event.message?.includes('vite') ||
        event.message?.includes('websocket')
      ) {
        return;
      }

      this.logError({
        source: 'main',
        message: event.message || 'Bilinmeyen Arayüz Hatası',
        stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
        isFatal: false,
        handled: true
      });
    });

    // Capture unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = (reason && reason.message) ? reason.message : String(reason);

      if (message.includes('vite') || message.includes('cancelled')) return;

      this.logError({
        source: 'main',
        message: `Yakalanmamış Promise Hatası: ${message}`,
        stack: reason?.stack,
        isFatal: false,
        handled: true
      });
    });
  }

  public logError(raw: Omit<SystemErrorLog, 'id' | 'timestamp'>): SystemErrorLog {
    const errorLog: SystemErrorLog = {
      id: 'err_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      ...raw
    };

    // Keep memory clean (max 50 recent error logs)
    if (this.logs.length >= 50) {
      this.logs.shift();
    }
    this.logs.push(errorLog);

    console.warn(`[System Resilience] [${errorLog.source.toUpperCase()}]`, errorLog.message, errorLog.stack || '');

    this.listeners.forEach(listener => {
      try {
        listener(errorLog);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });

    return errorLog;
  }

  public subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getLogs(): SystemErrorLog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }
}

export const globalErrorHandler = GlobalErrorHandler.getInstance();
