import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="mesh-bg" />
        <div className="relative z-10 glass rounded-3xl p-10 max-w-md w-full text-center border border-red-500/20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-[--text-secondary] text-sm mb-2">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <p className="text-xs text-[--text-secondary]/50 mb-6">
            The error has been logged. Please try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary glow-blue mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
