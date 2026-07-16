import { Component, type ReactNode } from "react";
import { reportAppError } from "@/lib/productAnalytics";

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    void reportAppError(error, { source: `boundary:${info.componentStack?.split("\n")[1]?.trim() ?? "root"}` });
  }

  handleReload = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground">
            We hit an unexpected error and our team has been notified. Please reload to continue.
          </p>
          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-lg gradient-bg text-primary-foreground font-semibold"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;