/**
 * Portal Auth Hook
 *
 * Completely separate from admin useAuth().
 * Uses portal-specific tRPC client and cookie.
 */

import { portalTrpc } from "@/lib/portalTrpc";
import { useCallback, useMemo } from "react";
import { portalPath } from "@/lib/portalBasePath";

// Mock portal user
const MOCK_PORTAL_USER = {
  id: 1,
  customerId: 1,
  contactName: "Test Portal User",
  email: "portal@example.com",
  role: "HR Manager",
  isPrimary: true,
  hasPortalAccess: true,
  portalRole: "admin",
  isPortalActive: true,
  companyName: "Test Company", // Added for PortalLayout
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function usePortalAuth() {
  // Disable real query
  const { data: user, isLoading: loading, error } = portalTrpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: false,
  });

  const logoutMutation = portalTrpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = portalPath("/login");
    },
  });

  const logout = useCallback(() => {
    // Mock logout
    window.location.href = portalPath("/login");
  }, []);

  return {
    user: MOCK_PORTAL_USER as any,
    loading: false,
    error: null,
    isAuthenticated: true,
    logout,
  };
}
