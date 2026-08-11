import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level render-error safety net. Without this, any uncaught exception in the render
 * tree (a bad API response shape, a null-ref in a page component, etc.) unmounts the
 * entire React tree and leaves the visitor looking at a blank white page with no way
 * back — the worst possible failure mode for a client-facing site. This catches it and
 * shows a real recovery screen instead. Does not catch errors in event handlers, async
 * code, or SSR — those are handled at their own call sites (see authFetch, form handlers).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-2xl font-bold text-navy">Something went wrong</h1>
          <p className="mt-3 max-w-md text-slate">
            We've hit an unexpected error. Please refresh the page — if the problem
            continues, contact us and we'll sort it out.
          </p>
          <a
            href="/"
            className="mt-6 flex min-h-[44px] items-center rounded bg-accent-blue px-5 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Back to home
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
