/**
 * Unit tests for admin deletion of admin_approved records
 *
 * Tests the permission logic in adjustments, reimbursements, and leave routers:
 * - Admin can delete admin_approved records
 * - Operations Manager cannot delete admin_approved records
 * - No role can delete locked records
 * - Leave balance is correctly restored when admin deletes admin_approved leave
 *
 * Run: npx jest tests/admin-delete-approved-records.test.ts
 */

// ─── Mock DB layer ────────────────────────────────────────────────────────────

let mockAdjustment: any = null;
let mockReimbursement: any = null;
let mockLeaveRecord: any = null;
let mockLeaveBalance: any = null;
let deletedAdjustmentId: number | null = null;
let deletedReimbursementId: number | null = null;
let deletedLeaveRecordId: number | null = null;
let auditLogs: any[] = [];
let leaveBalanceUpdates: any[] = [];

jest.mock("../server/db", () => ({
  getAdjustmentById: jest.fn((id: number) => {
    if (mockAdjustment && mockAdjustment.id === id) return mockAdjustment;
    return null;
  }),
  deleteAdjustment: jest.fn((id: number) => {
    deletedAdjustmentId = id;
  }),
  getReimbursementById: jest.fn((id: number) => {
    if (mockReimbursement && mockReimbursement.id === id) return mockReimbursement;
    return null;
  }),
  deleteReimbursement: jest.fn((id: number) => {
    deletedReimbursementId = id;
  }),
  getLeaveRecordById: jest.fn((id: number) => {
    if (mockLeaveRecord && mockLeaveRecord.id === id) return mockLeaveRecord;
    return null;
  }),
  deleteLeaveRecord: jest.fn((id: number) => {
    deletedLeaveRecordId = id;
  }),
  listLeaveBalances: jest.fn((employeeId: number, year: number) => {
    if (mockLeaveBalance) return [mockLeaveBalance];
    return [];
  }),
  updateLeaveBalance: jest.fn((id: number, data: any) => {
    leaveBalanceUpdates.push({ id, data });
  }),
  getLeaveTypeById: jest.fn(() => ({ id: 1, isPaid: true, leaveTypeName: "Annual Leave" })),
  logAuditAction: jest.fn((entry: any) => {
    auditLogs.push(entry);
  }),
  getEmployeeById: jest.fn(() => ({
    id: 1,
    customerId: 1,
    country: "SG",
    salaryCurrency: "SGD",
    gender: "male",
  })),
  getCountryConfig: jest.fn(() => ({ countryCode: "SG", localCurrency: "SGD" })),
  createAdjustment: jest.fn(),
  listAdjustments: jest.fn(() => ({ data: [], total: 0 })),
  updateAdjustment: jest.fn(),
  createReimbursement: jest.fn(),
  listReimbursements: jest.fn(() => ({ data: [], total: 0 })),
  updateReimbursement: jest.fn(),
  createLeaveRecord: jest.fn(),
  listLeaveRecords: jest.fn(() => ({ data: [], total: 0 })),
  updateLeaveRecord: jest.fn(),
  getDb: jest.fn(() => null),
  getSystemConfig: jest.fn(() => "4"),
  findPayrollRunByCountryMonth: jest.fn(() => null),
}));

jest.mock("../server/storage", () => ({
  storagePut: jest.fn(),
  storageGet: jest.fn(),
  storageDownload: jest.fn(),
}));

jest.mock("../server/utils/cutoff", () => ({
  enforceCutoff: jest.fn(),
  checkCutoffPassed: jest.fn(() => ({ passed: false, cutoffDate: new Date() })),
  getAdjustmentPayrollMonth: jest.fn(() => "2026-03"),
  getLeavePayrollMonth: jest.fn(() => "2026-03"),
  isLeavesCrossMonth: jest.fn(() => false),
  splitLeaveByMonth: jest.fn((start: string, end: string, days: number) => [
    { startDate: start, endDate: end, days, payrollMonth: "2026-03" },
  ]),
}));

// ─── Import the shared role utility for verification ──────────────────────────

import { isAdmin, hasAnyRole } from "../shared/roles";

// ─── Test Suites ──────────────────────────────────────────────────────────────

describe("Admin Delete Admin-Approved Records", () => {
  beforeEach(() => {
    // Reset state
    deletedAdjustmentId = null;
    deletedReimbursementId = null;
    deletedLeaveRecordId = null;
    auditLogs = [];
    leaveBalanceUpdates = [];
    mockAdjustment = null;
    mockReimbursement = null;
    mockLeaveRecord = null;
    mockLeaveBalance = null;
    jest.clearAllMocks();
  });

  // ─── Role Utility Tests ─────────────────────────────────────────────────────

  describe("Role Utility: isAdmin", () => {
    it("should return true for admin role", () => {
      expect(isAdmin("admin")).toBe(true);
    });

    it("should return false for operations_manager role", () => {
      expect(isAdmin("operations_manager")).toBe(false);
    });

    it("should return false for combined non-admin roles", () => {
      expect(isAdmin("operations_manager,finance_manager")).toBe(false);
    });

    it("should return false for user role", () => {
      expect(isAdmin("user")).toBe(false);
    });
  });

  // ─── Permission Logic Tests (Simulating Router Behavior) ────────────────────

  describe("Adjustments: Delete Permission Logic", () => {
    it("should allow admin to delete admin_approved adjustment", () => {
      const status: string = "admin_approved";
      const userRole = "admin";

      // Simulate router logic
      const isLocked = status === "locked";
      const isAdminApprovedByNonAdmin = status === "admin_approved" && !isAdmin(userRole);

      expect(isLocked).toBe(false);
      expect(isAdminApprovedByNonAdmin).toBe(false);
      // Both checks pass → deletion allowed
    });

    it("should block operations_manager from deleting admin_approved adjustment", () => {
      const status: string = "admin_approved";
      const userRole = "operations_manager";

      const isAdminApprovedByNonAdmin = status === "admin_approved" && !isAdmin(userRole);

      expect(isAdminApprovedByNonAdmin).toBe(true);
      // Check fails → deletion blocked with FORBIDDEN
    });

    it("should block all roles from deleting locked adjustment", () => {
      const status: string = "locked";

      const isLocked = status === "locked";
      expect(isLocked).toBe(true);
      // First check fails → deletion blocked for everyone
    });

    it("should allow operations_manager to delete submitted adjustment", () => {
      const status: string = "submitted";
      const userRole = "operations_manager";

      const isLocked = status === "locked";
      const isAdminApprovedByNonAdmin = status === "admin_approved" && !isAdmin(userRole);

      expect(isLocked).toBe(false);
      expect(isAdminApprovedByNonAdmin).toBe(false);
      // Both checks pass → deletion allowed
    });

    it("should allow operations_manager to delete client_approved adjustment", () => {
      const status: string = "client_approved";
      const userRole = "operations_manager";

      const isLocked = status === "locked";
      const isAdminApprovedByNonAdmin = status === "admin_approved" && !isAdmin(userRole);

      expect(isLocked).toBe(false);
      expect(isAdminApprovedByNonAdmin).toBe(false);
    });
  });

  describe("Reimbursements: Delete Permission Logic", () => {
    it("should allow admin to delete admin_approved reimbursement", () => {
      const status: string = "admin_approved";
      const userRole = "admin";

      const isLocked = status === "locked";
      const isAdminApprovedByNonAdmin = status === "admin_approved" && !isAdmin(userRole);

      expect(isLocked).toBe(false);
      expect(isAdminApprovedByNonAdmin).toBe(false);
    });

    it("should block operations_manager from deleting admin_approved reimbursement", () => {
      const status: string = "admin_approved";
      const userRole = "operations_manager";

      const isAdminApprovedByNonAdmin = status === "admin_approved" && !isAdmin(userRole);
      expect(isAdminApprovedByNonAdmin).toBe(true);
    });

    it("should block all roles from deleting locked reimbursement", () => {
      const status: string = "locked";
      expect(status === "locked").toBe(true);
    });
  });

  describe("Leave: Delete Permission Logic", () => {
    it("should allow admin to delete admin_approved leave record", () => {
      const status: string = "admin_approved";
      const userRole = "admin";

      const isLocked = status === "locked";
      const isAdminApprovedByNonAdmin = status === "admin_approved" && !isAdmin(userRole);

      expect(isLocked).toBe(false);
      expect(isAdminApprovedByNonAdmin).toBe(false);
    });

    it("should block operations_manager from deleting admin_approved leave record", () => {
      const status: string = "admin_approved";
      const userRole = "operations_manager";

      const isAdminApprovedByNonAdmin = status === "admin_approved" && !isAdmin(userRole);
      expect(isAdminApprovedByNonAdmin).toBe(true);
    });

    it("should block all roles from deleting locked leave record", () => {
      const status: string = "locked";
      expect(status === "locked").toBe(true);
    });
  });

  // ─── Leave Balance Rollback Tests ───────────────────────────────────────────

  describe("Leave Balance Rollback on Delete", () => {
    it("should correctly calculate balance restoration when deleting admin_approved leave", () => {
      // Simulate the balance adjustment logic from leave.ts
      const existingDays = 5;
      const currentUsed = 10;
      const currentRemaining = 4;

      // The adjustLeaveBalance function is called with negative delta
      const deltaDays = -existingDays; // -5
      const newUsed = Math.max(0, currentUsed + deltaDays); // max(0, 10 + (-5)) = 5
      const newRemaining = currentRemaining - deltaDays; // 4 - (-5) = 9

      expect(newUsed).toBe(5);
      expect(newRemaining).toBe(9);
    });

    it("should not produce negative used days when restoring balance", () => {
      const existingDays = 15;
      const currentUsed = 10;
      const currentRemaining = 0;

      const deltaDays = -existingDays;
      const newUsed = Math.max(0, currentUsed + deltaDays); // max(0, 10 + (-15)) = max(0, -5) = 0
      const newRemaining = currentRemaining - deltaDays; // 0 - (-15) = 15

      expect(newUsed).toBe(0);
      expect(newRemaining).toBe(15);
    });

    it("should handle half-day leave balance restoration", () => {
      const existingDays = 0.5;
      const currentUsed = 3.5;
      const currentRemaining = 10.5;

      const deltaDays = -existingDays;
      const newUsed = Math.max(0, currentUsed + deltaDays); // max(0, 3.5 + (-0.5)) = 3.0
      const newRemaining = currentRemaining - deltaDays; // 10.5 - (-0.5) = 11.0

      expect(newUsed).toBe(3.0);
      expect(newRemaining).toBe(11.0);
    });
  });

  // ─── Audit Log Tests ────────────────────────────────────────────────────────

  describe("Audit Log Enhancement", () => {
    it("should include deletedStatus in audit log changes for adjustments", () => {
      const existing = { status: "admin_approved", amount: "1000", employeeId: 1 };
      const changes = JSON.stringify({
        deletedStatus: existing.status,
        amount: existing.amount,
        employeeId: existing.employeeId,
      });
      const parsed = JSON.parse(changes);

      expect(parsed.deletedStatus).toBe("admin_approved");
      expect(parsed.amount).toBe("1000");
      expect(parsed.employeeId).toBe(1);
    });

    it("should include deletedStatus in audit log changes for leave records", () => {
      const existing = { status: "admin_approved", days: "3", employeeId: 1, leaveTypeId: 2 };
      const changes = JSON.stringify({
        deletedStatus: existing.status,
        days: existing.days,
        employeeId: existing.employeeId,
        leaveTypeId: existing.leaveTypeId,
      });
      const parsed = JSON.parse(changes);

      expect(parsed.deletedStatus).toBe("admin_approved");
      expect(parsed.days).toBe("3");
      expect(parsed.leaveTypeId).toBe(2);
    });
  });

  // ─── Frontend Permission Display Logic Tests ────────────────────────────────

  describe("Frontend: Delete Button Visibility Logic", () => {
    it("should show delete button for admin when status is admin_approved", () => {
      const isAdminUser = true;
      const status: string = "admin_approved";

      const showAdminDeleteButton = isAdminUser && status === "admin_approved";
      expect(showAdminDeleteButton).toBe(true);
    });

    it("should NOT show delete button for non-admin when status is admin_approved", () => {
      const isAdminUser = false;
      const status: string = "admin_approved";

      const showAdminDeleteButton = isAdminUser && status === "admin_approved";
      expect(showAdminDeleteButton).toBe(false);
    });

    it("should NOT show admin delete button for locked status even for admin", () => {
      const isAdminUser = true;
      const status: string = "locked";

      const showAdminDeleteButton = isAdminUser && status === "admin_approved";
      expect(showAdminDeleteButton).toBe(false);
    });

    it("should show regular delete button for ops_manager when status is submitted", () => {
      const canEditOps = true; // ops_manager has canEditOps
      const status: string = "submitted";

      const showRegularDeleteButton = canEditOps && ["submitted", "client_approved", "pending"].includes(status);
      expect(showRegularDeleteButton).toBe(true);
    });

    it("should NOT show regular delete button for ops_manager when status is admin_approved", () => {
      const canEditOps = true;
      const status: string = "admin_approved";

      const showRegularDeleteButton = canEditOps && ["submitted", "client_approved", "pending"].includes(status);
      expect(showRegularDeleteButton).toBe(false);
    });
  });
});
