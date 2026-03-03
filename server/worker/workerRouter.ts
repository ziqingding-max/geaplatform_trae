/**
 * Worker Portal Router
 *
 * Aggregates all worker-related routers.
 */

import { workerRouter } from "./workerTrpc";
import { workerAuthRouter } from "./routers/workerAuthRouter";
import { workerProfileRouter } from "./routers/workerProfileRouter";
import { workerOnboardingRouter } from "./routers/workerOnboardingRouter";
import { workerInvoicesRouter } from "./routers/workerInvoicesRouter";
import { workerMilestonesRouter } from "./routers/workerMilestonesRouter";
import { workerDashboardRouter } from "./routers/workerDashboardRouter";
import { workerNotificationsRouter } from "./routers/workerNotificationsRouter";

export const appWorkerRouter = workerRouter({
  auth: workerAuthRouter,
  profile: workerProfileRouter,
  onboarding: workerOnboardingRouter,
  invoices: workerInvoicesRouter,
  milestones: workerMilestonesRouter,
  dashboard: workerDashboardRouter,
  notifications: workerNotificationsRouter,
});

export type AppWorkerRouter = typeof appWorkerRouter;
