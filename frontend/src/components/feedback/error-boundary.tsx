import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return <ErrorFallback error={this.state.error!} resetErrorBoundary={this.handleReset} />;
    }

    return this.props.children;
  }
}

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary, className }) => {
  return (
    <div className={cn("p-6 rounded-xl border border-rose-200 bg-rose-50 flex flex-col items-center justify-center text-center", className)}>
      <AlertTriangle className="w-10 h-10 text-rose-500 mb-4" />
      <h3 className="text-lg font-semibold text-rose-900 mb-2">Something went wrong</h3>
      <p className="text-sm text-rose-700 max-w-md mb-6">{error.message}</p>
      
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <RefreshCcw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
};
