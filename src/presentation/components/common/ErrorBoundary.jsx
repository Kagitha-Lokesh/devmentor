import React from 'react';
import { container } from '../../../infrastructure/di/container';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.logger = container.resolve('ILogger');
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.logger.fatal('ErrorBoundary caught a rendering crash', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-red-950/15 rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <div className="h-16 w-16 bg-red-950/40 border border-red-800 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertOctagon className="h-8 w-8" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Something went wrong</h1>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                An unexpected application error has crashed this screen. Our engineering logs have been notified.
              </p>

              {this.state.error && (
                <pre className="text-[10px] text-left bg-slate-950 border border-slate-850 p-4 rounded-lg text-red-300 overflow-x-auto max-h-36 mb-6 font-mono">
                  <code>
                    {this.state.error.name}: {this.state.error.message}
                  </code>
                </pre>
              )}

              <div className="flex gap-4">
                <button
                  onClick={this.handleReset}
                  className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Session
                </button>
                <a
                  href="/"
                  className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
