import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

type ErrorBoundaryProps = {
  children: ReactNode;
  /** 에러 발생 시 대체 UI. 지정하지 않으면 기본 ErrorFallback 사용 */
  fallback?: ReactNode;
  /** 에러 복구 시 호출될 콜백 — ErrorBoundary 에러 상태 초기화 + 추가 정리 수행 */
  onReset: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // v1: 콘솔 로깅만. v2에서 Sentry/Crashlytics 연동 예정
    console.error('[ErrorBoundary]', error.message, errorInfo.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
