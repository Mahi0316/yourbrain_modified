import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  error: any | null;
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("🔥 Error Boundary Caught:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-lg w-full text-center bg-white shadow-lg rounded-xl p-8 border">
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Something went wrong
            </h2>

            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Check the console for more details.
            </p>

            {this.state.error && (
              <pre className="text-left text-sm bg-gray-100 rounded p-3 mb-4 overflow-auto max-h-40">
                {String(this.state.error)}
              </pre>
            )}

            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
