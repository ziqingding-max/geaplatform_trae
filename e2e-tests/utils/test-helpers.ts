import { appRouter } from "../server/routers";
import type { TrpcContext, PortalContext } from "../server/_core/context";

// 创建管理员测试上下文
export function createAdminCaller() {
  const user = {
    id: 1,
    openId: "test-admin",
    email: "admin@test.com",
    name: "Test Admin",
    loginMethod: "manus" as const,
    role: "admin" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {}, cookie: () => {} } as unknown as TrpcContext["res"],
  };

  return appRouter.createCaller(ctx);
}

// 创建门户用户测试上下文
export function createPortalCaller(portalUser = null) {
  const cookies: Record<string, string> = {};
  const ctx: PortalContext = {
    portalUser,
    req: { protocol: "https", headers: {} } as PortalContext["req"],
    res: {
      clearCookie: () => {},
      cookie: (name: string, value: string) => { cookies[name] = value; },
    } as unknown as PortalContext["res"],
  };

  return appRouter.createCaller(ctx);
}

// 创建特定角色的测试上下文
export function createRoleCaller(role: string) {
  const user = {
    id: Math.floor(Math.random() * 1000),
    openId: `test-${role}`,
    email: `${role}@test.com`,
    name: `Test ${role}`,
    loginMethod: "manus" as const,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {}, cookie: () => {} } as unknown as TrpcContext["res"],
  };

  return appRouter.createCaller(ctx);
}