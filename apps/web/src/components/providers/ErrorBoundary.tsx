"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
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
    console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 m-4 border border-red-900/50 bg-red-950/20 rounded-lg max-w-lg mx-auto text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            {this.props.name ? `${this.props.name} crashed` : 'Something went wrong'}
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">
            {this.state.error?.message || "An unexpected rendering error occurred. The system has contained the failure."}
          </p>
          <button 
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium transition-colors border border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Attempt Recovery
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
