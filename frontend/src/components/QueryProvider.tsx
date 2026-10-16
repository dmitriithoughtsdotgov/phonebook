"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { isUnauthorized } from "@/lib/queries";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One client per browser tab; created lazily so it is not shared between server requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data prefetched on the server is fresh on arrival, so it is not refetched right away.
            staleTime: 30_000,
            // An expired session will not fix itself by retrying.
            retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Rendered only in development (npm run dev). */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
