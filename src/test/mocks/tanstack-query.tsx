import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Create a test QueryClient with disabled retries and 0 gc/stale time
 * to make tests deterministic and fast.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component for rendering components that use TanStack Query.
 *
 * Usage:
 * ```tsx
 * const queryClient = createTestQueryClient();
 * render(<MyComponent />, { wrapper: ({ children }) => <TestQueryWrapper client={queryClient}>{children}</TestQueryWrapper> });
 * ```
 */
export function TestQueryWrapper({
  children,
  client,
}: {
  children: React.ReactNode;
  client?: QueryClient;
}) {
  const queryClient = client ?? createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
