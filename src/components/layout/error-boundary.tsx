"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (reset: () => void, error: Error) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Root error boundary — catches render-time exceptions anywhere in the
 * client tree so a single broken component doesn't tear down the whole
 * application. Mounted inside `app/layout.tsx` wrapping all providers.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the stack to the dev console; in production we keep this
    // minimal to avoid leaking stack traces.
    console.error("[RootErrorBoundary] client-side exception:", error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(this.reset, error);
    }

    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-6 py-16 text-center"
      >
        <div className="rounded-full border border-ds-border bg-ds-surface px-4 py-2 text-xs font-medium uppercase tracking-wide text-ds-text-muted">
          Something went wrong
        </div>
        <h1 className="text-xl font-semibold text-ds-text">
          A client-side error occurred
        </h1>
        <p className="text-sm text-ds-text-muted">
          The page you were viewing couldn&apos;t finish loading. Try reloading
          or returning to the homepage.
        </p>
        {process.env.NODE_ENV !== "production" ? (
          <pre className="max-h-40 w-full overflow-auto rounded-lg border border-ds-border bg-ds-surface-muted p-3 text-start text-xs text-ds-text-muted">
            {error.message}
          </pre>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={this.reset}
            className="rounded-full bg-ds-primary px-4 py-2 text-sm font-semibold text-ds-text-on-primary hover:bg-ds-primary-hover"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-ds-border bg-ds-surface px-4 py-2 text-sm font-semibold text-ds-text hover:bg-ds-surface-muted"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}
