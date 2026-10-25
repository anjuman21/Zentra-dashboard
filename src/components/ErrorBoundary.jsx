import React from "react";

// Keeps one broken screen or overlay from blanking the whole app.
// `fallback` gets the error and a reset function; omit it to render nothing.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = () => this.setState({ error: null });
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Zentra: a screen failed to render", error, info?.componentStack);
    this.props.onError?.(error);
  }

  componentDidUpdate(prev) {
    // A new route (or overlay) gets a fresh try.
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.reset();
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return this.props.fallback ? this.props.fallback(error, this.reset) : null;
  }
}

export function ScreenError({ error, onRetry }) {
  return (
    <main className="content screen-error" role="alert">
      <div className="card screen-error__card">
        <h1 className="screen-error__title">Something went wrong on this screen</h1>
        <p className="screen-error__text">The rest of Zentra still works. Try again, or go back to Home.</p>
        <code className="screen-error__code">{String(error?.message || error)}</code>
        <div className="screen-error__actions">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => (window.location.hash = "#/")}>
            Go to Home
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
