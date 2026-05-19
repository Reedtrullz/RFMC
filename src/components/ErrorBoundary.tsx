import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    } else {
      console.error('[ErrorBoundary]', error.message);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex h-full min-h-[200px] items-center justify-center bg-black p-8">
          <div className="text-center">
            <div className="mb-2 font-cdu text-lg font-bold text-cdu-red">SYSTEM ERROR</div>
            <div className="font-cdu text-xs text-cdu-text/60">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </div>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 rounded border border-cdu-red/40 bg-cdu-red/10 px-4 py-2 font-cdu text-xs text-cdu-red hover:bg-cdu-red/20"
            >
              RETRY
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
