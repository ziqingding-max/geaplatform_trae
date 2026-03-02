import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();

  // Mock user for testing
  const mockUser = {
    id: 1,
    openId: "mock-openid",
    name: "Test Admin",
    email: "admin@example.com",
    role: "admin",
    language: "en",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    mustChangePassword: false,
    loginMethod: "mock"
  };

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: false // Disable actual query
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    // Mock logout behavior
    window.location.href = "/login";
  }, []);

  const state = useMemo(() => {
    // Force mock user
    const user = mockUser;
    
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(user)
    );
    return {
      user: user as any, // Cast to any to avoid strict type checks against the inferred type
      loading: false,
      error: null,
      isAuthenticated: true,
    };
  }, []);

  // Redirect logic disabled/modified
  useEffect(() => {
    // Since we are mocking auth, we don't need to redirect
    if (!redirectOnUnauthenticated) return;
  }, [redirectOnUnauthenticated]);

  return {
    ...state,
    refresh: () => {}, // Mock refresh
    logout,
  };
}
