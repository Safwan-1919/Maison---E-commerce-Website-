"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    </SessionProvider>
  );
}