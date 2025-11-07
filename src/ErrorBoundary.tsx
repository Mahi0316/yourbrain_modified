// src/ErrorBoundary.tsx
import React from "react";

type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // log to console or send to logging backend
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg text-center bg-white shadow-md rounded p-6">
            <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
            <p className="mb-4">An unexpected error occurred. Check the console for details.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded border">
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
