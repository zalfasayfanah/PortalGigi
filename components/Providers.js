"use client";

import { AuthProvider } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <RouteGuard>{children}</RouteGuard>
    </AuthProvider>
  );
}
