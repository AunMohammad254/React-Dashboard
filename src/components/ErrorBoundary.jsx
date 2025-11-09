import * as React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    // Optionally log to an external service here
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback
      if (Fallback) {
        return <Fallback error={this.state.error} />
      }
      return (
        <div role="alert" className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm">
          Something went wrong while rendering.
        </div>
      )
    }
    return this.props.children
  }
}

export { ErrorBoundary }