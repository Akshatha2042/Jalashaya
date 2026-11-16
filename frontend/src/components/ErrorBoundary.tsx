import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('JALASHAYA Uncaught Application Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-6 text-white select-none">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Application Notice</h2>
              <p className="text-xs text-slate-300 mt-1">
                A view initialization error occurred. Click below to return to the Digital Twin command center.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2 rounded bg-slate-900/80 font-mono text-[11px] text-red-300 text-left overflow-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  window.location.hash = '#map';
                  window.location.reload();
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Digital Twin</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
