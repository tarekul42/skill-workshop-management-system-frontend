"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional callback when "Try Again" is clicked */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Localized error boundary that catches rendering errors in a single
 * widget/widget subtree without unmounting the entire page.
 *
 * Usage:
 *   <ErrorBoundary fallback={<CardErrorPlaceholder />}>
 *     <AdminDashboardStats />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <div className="bg-destructive/10 text-destructive mb-3 flex size-10 items-center justify-center rounded-full">
            <AlertTriangle className="size-5" />
          </div>
          <p className="text-destructive text-sm font-medium">Something went wrong</p>
          <p className="text-muted-foreground mt-1 text-xs">This section failed to load.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={this.handleReset}>
            <RefreshCcw className="mr-1.5 size-3.5" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
