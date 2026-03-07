import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'monospace', padding: '2rem',
          background: '#fff', color: '#111',
        }}>
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠ Render Error</h2>
            <pre style={{
              background: '#f1f5f9', padding: '1rem', borderRadius: '8px',
              fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap',
            }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
