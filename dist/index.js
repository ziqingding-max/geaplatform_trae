var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
var db_exports = {};
__export(db_exports, {
  applyCreditNote: () => applyCreditNote,
  batchCreateCustomerPricing: () => batchCreateCustomerPricing,
  createAdjustment: () => createAdjustment,
  createBillInvoiceAllocation: () => createBillInvoiceAllocation,
  createBillingEntity: () => createBillingEntity,
  createCountryConfig: () => createCountryConfig,
  createCustomer: () => createCustomer,
  createCustomerContact: () => createCustomerContact,
  createCustomerContract: () => createCustomerContract,
  createCustomerLeavePolicy: () => createCustomerLeavePolicy,
  createCustomerPricing: () => createCustomerPricing,
  createEmployee: () => createEmployee,
  createEmployeeContractRecord: () => createEmployeeContractRecord,
  createEmployeeDocument: () => createEmployeeDocument,
  createInvoice: () => createInvoice,
  createInvoiceItem: () => createInvoiceItem,
  createLeaveBalance: () => createLeaveBalance,
  createLeaveRecord: () => createLeaveRecord,
  createLeaveType: () => createLeaveType,
  createPayrollItem: () => createPayrollItem,
  createPayrollRun: () => createPayrollRun,
  createReimbursement: () => createReimbursement,
  createSalesActivity: () => createSalesActivity,
  createSalesLead: () => createSalesLead,
  createVendor: () => createVendor,
  createVendorBill: () => createVendorBill,
  createVendorBillItem: () => createVendorBillItem,
  deleteAdjustment: () => deleteAdjustment,
  deleteAllocationsByBill: () => deleteAllocationsByBill,
  deleteBillInvoiceAllocation: () => deleteBillInvoiceAllocation,
  deleteBillingEntity: () => deleteBillingEntity,
  deleteCountryConfig: () => deleteCountryConfig,
  deleteCustomerContact: () => deleteCustomerContact,
  deleteCustomerContract: () => deleteCustomerContract,
  deleteCustomerLeavePolicy: () => deleteCustomerLeavePolicy,
  deleteCustomerPricing: () => deleteCustomerPricing,
  deleteEmployeeContract: () => deleteEmployeeContract,
  deleteEmployeeDocument: () => deleteEmployeeDocument,
  deleteExchangeRate: () => deleteExchangeRate,
  deleteInvoice: () => deleteInvoice,
  deleteInvoiceItem: () => deleteInvoiceItem,
  deleteLeaveBalance: () => deleteLeaveBalance,
  deleteLeaveRecord: () => deleteLeaveRecord,
  deleteLeaveType: () => deleteLeaveType,
  deletePayrollItem: () => deletePayrollItem,
  deleteReimbursement: () => deleteReimbursement,
  deleteSalesActivity: () => deleteSalesActivity,
  deleteSalesLead: () => deleteSalesLead,
  deleteVendor: () => deleteVendor,
  deleteVendorBill: () => deleteVendorBill,
  deleteVendorBillItem: () => deleteVendorBillItem,
  findPayrollRunByCountryMonth: () => findPayrollRunByCountryMonth,
  getActiveEmployeesForPayroll: () => getActiveEmployeesForPayroll,
  getActiveLeaveRecordsForDate: () => getActiveLeaveRecordsForDate,
  getAdjustmentById: () => getAdjustmentById,
  getBillAllocatedTotal: () => getBillAllocatedTotal,
  getBillInvoiceAllocationById: () => getBillInvoiceAllocationById,
  getBillingEntityById: () => getBillingEntityById,
  getContractSignedEmployeesReadyForActivation: () => getContractSignedEmployeesReadyForActivation,
  getCountriesWithActiveEmployees: () => getCountriesWithActiveEmployees,
  getCountryConfig: () => getCountryConfig,
  getCreditNoteRemainingBalance: () => getCreditNoteRemainingBalance,
  getCustomerByEmail: () => getCustomerByEmail,
  getCustomerById: () => getCustomerById,
  getCustomerLeavePoliciesForCountry: () => getCustomerLeavePoliciesForCountry,
  getDashboardStats: () => getDashboardStats,
  getDb: () => getDb,
  getEmployeeById: () => getEmployeeById,
  getEmployeeCountByCountry: () => getEmployeeCountByCountry,
  getEmployeeCountByStatus: () => getEmployeeCountByStatus,
  getEmployeeDocumentById: () => getEmployeeDocumentById,
  getEmployeesForPayrollMonth: () => getEmployeesForPayrollMonth,
  getInvoiceById: () => getInvoiceById,
  getInvoiceCostAllocatedTotal: () => getInvoiceCostAllocatedTotal,
  getInvoiceProfitAnalysis: () => getInvoiceProfitAnalysis,
  getLeaveRecordById: () => getLeaveRecordById,
  getLeaveTypeById: () => getLeaveTypeById,
  getOnLeaveEmployeesWithExpiredLeave: () => getOnLeaveEmployeesWithExpiredLeave,
  getPayrollItemById: () => getPayrollItemById,
  getPayrollRunById: () => getPayrollRunById,
  getReimbursementById: () => getReimbursementById,
  getRelatedInvoices: () => getRelatedInvoices,
  getSalesLeadById: () => getSalesLeadById,
  getSubmittedAdjustmentsForPayroll: () => getSubmittedAdjustmentsForPayroll,
  getSubmittedUnpaidLeaveForPayroll: () => getSubmittedUnpaidLeaveForPayroll,
  getSystemConfig: () => getSystemConfig,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  getUserByInviteToken: () => getUserByInviteToken,
  getUserByResetToken: () => getUserByResetToken,
  getVendorBillById: () => getVendorBillById,
  getVendorById: () => getVendorById,
  getVendorProfitAnalysis: () => getVendorProfitAnalysis,
  hasDepositBeenProcessed: () => hasDepositBeenProcessed,
  initializeLeaveBalancesForEmployee: () => initializeLeaveBalancesForEmployee,
  listAdjustments: () => listAdjustments,
  listAllExchangeRates: () => listAllExchangeRates,
  listAllocationsByBill: () => listAllocationsByBill,
  listAllocationsByInvoice: () => listAllocationsByInvoice,
  listApplicationsForInvoice: () => listApplicationsForInvoice,
  listAuditLogs: () => listAuditLogs,
  listBillingEntities: () => listBillingEntities,
  listCountriesConfig: () => listCountriesConfig,
  listCreditNoteApplications: () => listCreditNoteApplications,
  listCustomerContacts: () => listCustomerContacts,
  listCustomerContracts: () => listCustomerContracts,
  listCustomerLeavePolicies: () => listCustomerLeavePolicies,
  listCustomerPricing: () => listCustomerPricing,
  listCustomers: () => listCustomers,
  listDetailedAllocationsByBill: () => listDetailedAllocationsByBill,
  listDetailedAllocationsByInvoice: () => listDetailedAllocationsByInvoice,
  listEmployeeContracts: () => listEmployeeContracts,
  listEmployeeDocuments: () => listEmployeeDocuments,
  listEmployees: () => listEmployees,
  listInvoiceItemsByInvoice: () => listInvoiceItemsByInvoice,
  listInvoices: () => listInvoices,
  listLeaveBalances: () => listLeaveBalances,
  listLeaveRecords: () => listLeaveRecords,
  listLeaveTypesByCountry: () => listLeaveTypesByCountry,
  listPayrollItemsByEmployee: () => listPayrollItemsByEmployee,
  listPayrollItemsByRun: () => listPayrollItemsByRun,
  listPayrollRuns: () => listPayrollRuns,
  listReimbursements: () => listReimbursements,
  listSalesActivities: () => listSalesActivities,
  listSalesLeads: () => listSalesLeads,
  listSystemConfigs: () => listSystemConfigs,
  listUsers: () => listUsers,
  listVendorBillItems: () => listVendorBillItems,
  listVendorBillItemsByBill: () => listVendorBillItemsByBill,
  listVendorBills: () => listVendorBills,
  listVendors: () => listVendors,
  lockSubmittedAdjustments: () => lockSubmittedAdjustments,
  lockSubmittedLeaveRecords: () => lockSubmittedLeaveRecords,
  logAuditAction: () => logAuditAction,
  recalcBillAllocation: () => recalcBillAllocation,
  recalcInvoiceCostAllocation: () => recalcInvoiceCostAllocation,
  setSystemConfig: () => setSystemConfig,
  syncLeaveBalancesOnPolicyUpdate: () => syncLeaveBalancesOnPolicyUpdate,
  updateAdjustment: () => updateAdjustment,
  updateBillInvoiceAllocation: () => updateBillInvoiceAllocation,
  updateBillingEntity: () => updateBillingEntity,
  updateCountryConfig: () => updateCountryConfig,
  updateCustomer: () => updateCustomer,
  updateCustomerContact: () => updateCustomerContact,
  updateCustomerContract: () => updateCustomerContract,
  updateCustomerLeavePolicy: () => updateCustomerLeavePolicy,
  updateCustomerPricing: () => updateCustomerPricing,
  updateEmployee: () => updateEmployee,
  updateEmployeeContract: () => updateEmployeeContract,
  updateInvoice: () => updateInvoice,
  updateInvoiceItem: () => updateInvoiceItem,
  updateLeaveBalance: () => updateLeaveBalance,
  updateLeaveRecord: () => updateLeaveRecord,
  updateLeaveType: () => updateLeaveType,
  updatePayrollItem: () => updatePayrollItem,
  updatePayrollRun: () => updatePayrollRun,
  updateReimbursement: () => updateReimbursement,
  updateSalesLead: () => updateSalesLead,
  updateUser: () => updateUser,
  updateVendor: () => updateVendor,
  updateVendorBill: () => updateVendorBill,
  updateVendorBillItem: () => updateVendorBillItem,
  upsertUser: () => upsertUser
});
async function getDb() {
  console.warn("[MockDB] getDb() called. Returning null as this is a mock environment.");
  return null;
}
async function upsertUser(user) {
  const existing = mockStore.users.find((u) => u.openId === user.openId);
  if (existing) {
    Object.assign(existing, user, { updatedAt: /* @__PURE__ */ new Date() });
  } else {
    mockStore.users.push({ ...user, id: nextId(mockStore.users), createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() });
  }
}
async function getUserById(id) {
  return mockStore.users.find((u) => u.id === id);
}
async function getUserByEmail(email) {
  return mockStore.users.find((u) => u.email === email);
}
async function getUserByInviteToken(token) {
  return mockStore.users.find((u) => u.inviteToken === token);
}
async function getUserByResetToken(token) {
  return mockStore.users.find((u) => u.resetToken === token);
}
async function listUsers() {
  return { data: mockStore.users, total: mockStore.users.length };
}
async function updateUser(id, data) {
  const u = mockStore.users.find((i) => i.id === id);
  if (u) Object.assign(u, data);
}
async function createCustomer(data) {
  const newItem = { ...data, id: nextId(mockStore.customers), createdAt: /* @__PURE__ */ new Date() };
  if (!newItem.clientCode) newItem.clientCode = `CUS-${newItem.id}`;
  mockStore.customers.push(newItem);
  return [{ insertId: newItem.id }];
}
async function getCustomerById(id) {
  return mockStore.customers.find((i) => i.id === id);
}
async function listCustomers() {
  return { data: mockStore.customers, total: mockStore.customers.length };
}
async function updateCustomer(id, data) {
  const i = mockStore.customers.find((x) => x.id === id);
  if (i) Object.assign(i, data);
}
async function getCustomerByEmail(email) {
  return mockStore.customers.find((c) => c.primaryContactEmail === email);
}
async function createEmployee(data) {
  const newItem = { ...data, id: nextId(mockStore.employees), createdAt: /* @__PURE__ */ new Date() };
  if (!newItem.employeeCode) newItem.employeeCode = `EMP-${newItem.id}`;
  mockStore.employees.push(newItem);
  return [{ insertId: newItem.id }];
}
async function getEmployeeById(id) {
  return mockStore.employees.find((i) => i.id === id);
}
async function listEmployees() {
  const data = mockStore.employees.map((e) => {
    const c = mockStore.customers.find((cust) => cust.id === e.customerId);
    return { ...e, customerName: c?.companyName, clientCode: c?.clientCode };
  });
  return { data, total: data.length };
}
async function updateEmployee(id, data) {
  const i = mockStore.employees.find((x) => x.id === id);
  if (i) Object.assign(i, data);
}
async function getEmployeeCountByStatus() {
  return [];
}
async function getEmployeeCountByCountry() {
  return [];
}
async function getActiveEmployeesForPayroll(countryCode) {
  return mockStore.employees.filter((e) => e.country === countryCode && e.status === "active");
}
async function listCountriesConfig() {
  return mockStore.countriesConfig;
}
async function getCountryConfig(code) {
  return mockStore.countriesConfig.find((c) => c.countryCode === code);
}
async function createCountryConfig(data) {
  mockStore.countriesConfig.push({ ...data, id: nextId(mockStore.countriesConfig) });
}
async function updateCountryConfig(id, data) {
  const i = mockStore.countriesConfig.find((x) => x.id === id);
  if (i) Object.assign(i, data);
}
async function deleteCountryConfig(id) {
  mockStore.countriesConfig = mockStore.countriesConfig.filter((x) => x.id !== id);
}
async function getDashboardStats() {
  return {
    totalCustomers: mockStore.customers.length,
    totalEmployees: mockStore.employees.length,
    activeEmployees: mockStore.employees.filter((e) => e.status === "active").length,
    pendingPayrolls: 0,
    pendingInvoices: 0,
    pendingAdjustments: 0,
    pendingLeaves: 0,
    newHiresThisMonth: 0,
    terminationsThisMonth: 0,
    newClientsThisMonth: 0
  };
}
async function getSystemConfig(key) {
  return mockStore.systemConfig.find((c) => c.configKey === key)?.configValue || null;
}
async function setSystemConfig(key, value) {
  const existing = mockStore.systemConfig.find((c) => c.configKey === key);
  if (existing) existing.configValue = value;
  else mockStore.systemConfig.push({ id: nextId(mockStore.systemConfig), configKey: key, configValue: value });
}
async function listSystemConfigs() {
  return mockStore.systemConfig;
}
async function logAuditAction(data) {
  mockStore.auditLogs.push({ ...data, id: nextId(mockStore.auditLogs), createdAt: /* @__PURE__ */ new Date() });
}
async function listAuditLogs() {
  return { data: mockStore.auditLogs, total: mockStore.auditLogs.length };
}
async function listCustomerPricing() {
  return [];
}
async function createCustomerPricing() {
}
async function updateCustomerPricing() {
}
async function deleteCustomerPricing() {
}
async function listCustomerContacts() {
  return [];
}
async function createCustomerContact() {
}
async function updateCustomerContact() {
}
async function deleteCustomerContact() {
}
async function listLeaveTypesByCountry() {
  return [];
}
async function createLeaveType() {
}
async function updateLeaveType() {
}
async function deleteLeaveType() {
}
async function getLeaveTypeById() {
}
async function createLeaveRecord() {
}
async function listLeaveRecords() {
  return { data: [], total: 0 };
}
async function updateLeaveRecord() {
}
async function getLeaveRecordById() {
}
async function deleteLeaveRecord() {
}
async function listLeaveBalances() {
  return [];
}
async function createLeaveBalance() {
}
async function updateLeaveBalance() {
}
async function deleteLeaveBalance() {
}
async function initializeLeaveBalancesForEmployee() {
  return { added: 0 };
}
async function listCustomerLeavePolicies() {
  return [];
}
async function createCustomerLeavePolicy() {
}
async function updateCustomerLeavePolicy() {
}
async function deleteCustomerLeavePolicy() {
}
async function syncLeaveBalancesOnPolicyUpdate() {
  return { updatedCount: 0, errorCount: 0 };
}
async function getCustomerLeavePoliciesForCountry() {
  return [];
}
async function createAdjustment() {
}
async function listAdjustments() {
  return { data: [], total: 0 };
}
async function getAdjustmentById() {
}
async function updateAdjustment() {
}
async function deleteAdjustment() {
}
async function getSubmittedAdjustmentsForPayroll() {
  return [];
}
async function lockSubmittedAdjustments() {
  return 0;
}
async function createPayrollRun() {
}
async function getPayrollRunById() {
}
async function listPayrollRuns() {
  return { data: [], total: 0 };
}
async function updatePayrollRun() {
}
async function findPayrollRunByCountryMonth() {
  return null;
}
async function createPayrollItem() {
}
async function listPayrollItemsByRun() {
  return [];
}
async function getPayrollItemById() {
}
async function updatePayrollItem() {
}
async function deletePayrollItem() {
}
async function listPayrollItemsByEmployee() {
  return [];
}
async function createInvoice() {
}
async function getInvoiceById() {
}
async function listInvoices() {
  return { data: [], total: 0 };
}
async function getRelatedInvoices() {
  return [];
}
async function updateInvoice() {
}
async function deleteInvoice() {
}
async function createInvoiceItem() {
}
async function listInvoiceItemsByInvoice() {
  return [];
}
async function updateInvoiceItem() {
}
async function deleteInvoiceItem() {
}
async function listCustomerContracts() {
  return [];
}
async function createCustomerContract() {
}
async function updateCustomerContract() {
}
async function deleteCustomerContract() {
}
async function batchCreateCustomerPricing() {
}
async function listEmployeeDocuments() {
  return [];
}
async function createEmployeeDocument() {
}
async function deleteEmployeeDocument() {
}
async function getEmployeeDocumentById() {
}
async function listBillingEntities() {
  return [];
}
async function getBillingEntityById() {
}
async function createBillingEntity() {
}
async function updateBillingEntity() {
}
async function deleteBillingEntity() {
}
async function listEmployeeContracts() {
  return [];
}
async function createEmployeeContractRecord() {
}
async function updateEmployeeContract() {
}
async function deleteEmployeeContract() {
}
async function listAllExchangeRates() {
  return { data: [], total: 0 };
}
async function deleteExchangeRate() {
}
async function getContractSignedEmployeesReadyForActivation() {
  return [];
}
async function getCountriesWithActiveEmployees() {
  return [];
}
async function getEmployeesForPayrollMonth() {
  return [];
}
async function lockSubmittedLeaveRecords() {
  return 0;
}
async function getActiveLeaveRecordsForDate() {
  return [];
}
async function getOnLeaveEmployeesWithExpiredLeave() {
  return [];
}
async function getSubmittedUnpaidLeaveForPayroll() {
  return [];
}
async function applyCreditNote() {
}
async function listCreditNoteApplications() {
  return [];
}
async function listApplicationsForInvoice() {
  return [];
}
async function getCreditNoteRemainingBalance() {
  return null;
}
async function hasDepositBeenProcessed() {
  return { processed: false };
}
async function createReimbursement() {
}
async function listReimbursements() {
  return { data: [], total: 0 };
}
async function getReimbursementById() {
}
async function updateReimbursement() {
}
async function deleteReimbursement() {
}
async function createVendor() {
}
async function getVendorById() {
}
async function listVendors() {
  return { data: [], total: 0 };
}
async function updateVendor() {
}
async function deleteVendor() {
}
async function createSalesLead() {
}
async function getSalesLeadById() {
}
async function listSalesLeads() {
  return { data: [], total: 0 };
}
async function updateSalesLead() {
}
async function deleteSalesLead() {
}
async function createVendorBill() {
}
async function getVendorBillById() {
}
async function listVendorBills() {
  return [];
}
async function updateVendorBill() {
}
async function deleteVendorBill() {
}
async function createVendorBillItem() {
}
async function listVendorBillItems() {
  return [];
}
async function updateVendorBillItem() {
}
async function deleteVendorBillItem() {
}
async function listVendorBillItemsByBill() {
  return [];
}
async function createBillInvoiceAllocation() {
}
async function getBillInvoiceAllocationById() {
}
async function listAllocationsByBill() {
  return [];
}
async function listAllocationsByInvoice() {
  return [];
}
async function updateBillInvoiceAllocation() {
}
async function deleteBillInvoiceAllocation() {
}
async function deleteAllocationsByBill() {
}
async function getBillAllocatedTotal() {
  return 0;
}
async function getInvoiceCostAllocatedTotal() {
  return 0;
}
async function recalcBillAllocation() {
}
async function recalcInvoiceCostAllocation() {
}
async function listDetailedAllocationsByBill() {
  return [];
}
async function listDetailedAllocationsByInvoice() {
  return [];
}
async function getInvoiceProfitAnalysis() {
  return null;
}
async function getVendorProfitAnalysis() {
  return null;
}
async function createSalesActivity() {
}
async function listSalesActivities() {
  return [];
}
async function deleteSalesActivity() {
}
var mockStore, nextId;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    mockStore = {
      users: [],
      customers: [],
      employees: [],
      countriesConfig: [],
      leaveTypes: [],
      leaveRecords: [],
      leaveBalances: [],
      adjustments: [],
      payrollRuns: [],
      payrollItems: [],
      invoices: [],
      invoiceItems: [],
      vendors: [],
      vendorBills: [],
      salesLeads: [],
      systemConfig: [],
      auditLogs: [],
      customerContacts: [],
      billingEntities: [],
      customerPricing: [],
      customerContracts: [],
      employeeContracts: [],
      employeeDocuments: [],
      exchangeRates: [],
      salesActivities: [],
      creditNoteApplications: [],
      reimbursements: [],
      billInvoiceAllocations: [],
      vendorBillItems: [],
      customerLeavePolicies: []
    };
    mockStore.countriesConfig.push({
      id: 1,
      countryCode: "SG",
      countryName: "Singapore",
      localCurrency: "SGD",
      payrollCycle: "monthly",
      isActive: true
    });
    mockStore.countriesConfig.push({
      id: 2,
      countryCode: "CN",
      countryName: "China",
      localCurrency: "CNY",
      payrollCycle: "monthly",
      isActive: true
    });
    mockStore.customers.push({
      id: 1,
      clientCode: "CUS-000001",
      companyName: "Demo Client Inc.",
      country: "SG",
      status: "active",
      createdAt: /* @__PURE__ */ new Date()
    });
    mockStore.employees.push({
      id: 1,
      employeeCode: "EMP-000001",
      customerId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      country: "SG",
      status: "active",
      baseSalary: "5000.00",
      salaryCurrency: "SGD",
      jobTitle: "Software Engineer",
      startDate: /* @__PURE__ */ new Date("2024-01-01"),
      createdAt: /* @__PURE__ */ new Date()
    });
    nextId = (collection) => collection.length > 0 ? Math.max(...collection.map((i) => i.id)) + 1 : 1;
  }
});

// shared/const.ts
var COOKIE_NAME, ONE_YEAR_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG, PORTAL_COOKIE_NAME, PORTAL_UNAUTHED_ERR_MSG, PORTAL_FORBIDDEN_ERR_MSG, PORTAL_JWT_EXPIRY, PORTAL_INVITE_EXPIRY_HOURS;
var init_const = __esm({
  "shared/const.ts"() {
    "use strict";
    COOKIE_NAME = "app_session_id";
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
    PORTAL_COOKIE_NAME = "portal_session";
    PORTAL_UNAUTHED_ERR_MSG = "Portal: Please login (20001)";
    PORTAL_FORBIDDEN_ERR_MSG = "Portal: Insufficient permissions (20002)";
    PORTAL_JWT_EXPIRY = "7d";
    PORTAL_INVITE_EXPIRY_HOURS = 72;
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      appId: process.env.VITE_APP_ID ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? ""
    };
  }
});

// server/_core/notification.ts
var notification_exports = {};
__export(notification_exports, {
  notifyOwner: () => notifyOwner
});
import { TRPCError } from "@trpc/server";
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}
var TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH, trimValue, isNonEmptyString, buildEndpointUrl, validatePayload;
var init_notification = __esm({
  "server/_core/notification.ts"() {
    "use strict";
    init_env();
    TITLE_MAX_LENGTH = 1200;
    CONTENT_MAX_LENGTH = 2e4;
    trimValue = (value) => value.trim();
    isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
    buildEndpointUrl = (baseUrl) => {
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      return new URL(
        "webdevtoken.v1.WebDevService/SendNotification",
        normalizedBase
      ).toString();
    };
    validatePayload = (input) => {
      if (!isNonEmptyString(input.title)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Notification title is required."
        });
      }
      if (!isNonEmptyString(input.content)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Notification content is required."
        });
      }
      const title = trimValue(input.title);
      const content = trimValue(input.content);
      if (title.length > TITLE_MAX_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
        });
      }
      if (content.length > CONTENT_MAX_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
        });
      }
      return { title, content };
    };
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adjustments: () => adjustments,
  aiProviderConfigs: () => aiProviderConfigs,
  aiTaskExecutions: () => aiTaskExecutions,
  aiTaskPolicies: () => aiTaskPolicies,
  auditLogs: () => auditLogs,
  billInvoiceAllocations: () => billInvoiceAllocations,
  billingEntities: () => billingEntities,
  countriesConfig: () => countriesConfig,
  creditNoteApplications: () => creditNoteApplications,
  customerContacts: () => customerContacts,
  customerContracts: () => customerContracts,
  customerLeavePolicies: () => customerLeavePolicies,
  customerPricing: () => customerPricing,
  customers: () => customers,
  employeeContracts: () => employeeContracts,
  employeeDocuments: () => employeeDocuments,
  employees: () => employees,
  exchangeRates: () => exchangeRates,
  invoiceItems: () => invoiceItems,
  invoices: () => invoices,
  knowledgeFeedbackEvents: () => knowledgeFeedbackEvents,
  knowledgeItems: () => knowledgeItems,
  knowledgeMarketingEvents: () => knowledgeMarketingEvents,
  knowledgeSources: () => knowledgeSources,
  leaveBalances: () => leaveBalances,
  leaveRecords: () => leaveRecords,
  leaveTypes: () => leaveTypes,
  onboardingInvites: () => onboardingInvites,
  payrollItems: () => payrollItems,
  payrollRuns: () => payrollRuns,
  publicHolidays: () => publicHolidays,
  reimbursements: () => reimbursements,
  salesActivities: () => salesActivities,
  salesLeads: () => salesLeads,
  systemConfig: () => systemConfig,
  systemSettings: () => systemSettings,
  users: () => users,
  vendorBillItems: () => vendorBillItems,
  vendorBills: () => vendorBills,
  vendors: () => vendors
});
import {
  int,
  varchar,
  text,
  timestamp,
  decimal,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  index,
  boolean,
  json,
  date
} from "drizzle-orm/mysql-core";
var users, countriesConfig, systemConfig, leaveTypes, publicHolidays, customers, customerContacts, customerPricing, customerContracts, customerLeavePolicies, employees, employeeContracts, leaveBalances, leaveRecords, adjustments, payrollRuns, payrollItems, invoices, invoiceItems, exchangeRates, auditLogs, systemSettings, employeeDocuments, billingEntities, creditNoteApplications, onboardingInvites, reimbursements, vendors, vendorBills, vendorBillItems, billInvoiceAllocations, salesLeads, salesActivities, knowledgeSources, knowledgeItems, knowledgeMarketingEvents, knowledgeFeedbackEvents, aiProviderConfigs, aiTaskPolicies, aiTaskExecutions;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable(
      "users",
      {
        id: int("id").autoincrement().primaryKey(),
        openId: varchar("openId", { length: 64 }).notNull().unique(),
        name: text("name"),
        email: varchar("email", { length: 320 }).unique(),
        passwordHash: varchar("passwordHash", { length: 255 }),
        loginMethod: varchar("loginMethod", { length: 64 }),
        role: varchar("role", { length: 200 }).default("user").notNull(),
        language: varchar("language", { length: 10 }).default("en").notNull(),
        isActive: boolean("isActive").default(true).notNull(),
        inviteToken: varchar("inviteToken", { length: 255 }),
        inviteExpiresAt: timestamp("inviteExpiresAt"),
        resetToken: varchar("resetToken", { length: 255 }),
        resetExpiresAt: timestamp("resetExpiresAt"),
        mustChangePassword: boolean("mustChangePassword").default(false).notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
        lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
      },
      (table) => ({
        emailIdx: index("email_idx").on(table.email),
        roleIdx: index("role_idx").on(table.role),
        inviteTokenIdx: index("invite_token_idx").on(table.inviteToken)
      })
    );
    countriesConfig = mysqlTable(
      "countries_config",
      {
        id: int("id").autoincrement().primaryKey(),
        countryCode: varchar("countryCode", { length: 3 }).notNull().unique(),
        // ISO 3166-1 alpha-2
        countryName: varchar("countryName", { length: 100 }).notNull(),
        localCurrency: varchar("localCurrency", { length: 3 }).notNull(),
        // ISO 4217
        payrollCycle: mysqlEnum("payrollCycle", ["monthly", "semi_monthly"]).default("monthly").notNull(),
        // payrollCutoffDay and payDayOfMonth moved to system_config (global settings)
        // Tax rates removed - not fixed values, handled per payroll run
        probationPeriodDays: int("probationPeriodDays").default(90),
        noticePeriodDays: int("noticePeriodDays").default(30),
        workingDaysPerWeek: int("workingDaysPerWeek").default(5),
        statutoryAnnualLeave: int("statutoryAnnualLeave").default(14),
        // Standard service rates per employee per month (base price before discounts)
        standardEorRate: decimal("standardEorRate", { precision: 15, scale: 2 }),
        standardVisaEorRate: decimal("standardVisaEorRate", { precision: 15, scale: 2 }),
        standardAorRate: decimal("standardAorRate", { precision: 15, scale: 2 }),
        // Visa EOR one-time setup fee (charged once per employee visa application)
        visaEorSetupFee: decimal("visaEorSetupFee", { precision: 15, scale: 2 }),
        standardRateCurrency: varchar("standardRateCurrency", { length: 3 }).default("USD"),
        // VAT configuration — some countries require VAT on employment cost remittances
        vatApplicable: boolean("vatApplicable").default(false).notNull(),
        vatRate: decimal("vatRate", { precision: 5, scale: 2 }).default("0"),
        // e.g. 6.00 = 6%
        // isActive is determined by whether service fees are configured
        // A country with any non-null service rate (EOR/AOR/Visa) is considered active
        isActive: boolean("isActive").default(false).notNull(),
        notes: text("notes"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        countryCodeIdx: uniqueIndex("country_code_idx").on(table.countryCode)
      })
    );
    systemConfig = mysqlTable(
      "system_config",
      {
        id: int("id").autoincrement().primaryKey(),
        configKey: varchar("configKey", { length: 100 }).notNull().unique(),
        configValue: text("configValue").notNull(),
        description: text("description"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        configKeyIdx: uniqueIndex("config_key_idx").on(table.configKey)
      })
    );
    leaveTypes = mysqlTable(
      "leave_types",
      {
        id: int("id").autoincrement().primaryKey(),
        countryCode: varchar("countryCode", { length: 3 }).notNull(),
        leaveTypeName: varchar("leaveTypeName", { length: 100 }).notNull(),
        // Annual, Sick, Unpaid, Maternity, Paternity, Bereavement, Marriage
        annualEntitlement: int("annualEntitlement").default(0),
        // Days per year
        isPaid: boolean("isPaid").default(true).notNull(),
        requiresApproval: boolean("requiresApproval").default(true).notNull(),
        description: text("description"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        countryCodeIdx: index("country_code_idx").on(table.countryCode)
      })
    );
    publicHolidays = mysqlTable(
      "public_holidays",
      {
        id: int("id").autoincrement().primaryKey(),
        countryCode: varchar("countryCode", { length: 3 }).notNull(),
        year: int("year").notNull(),
        // e.g. 2026
        holidayDate: date("holidayDate").notNull(),
        holidayName: varchar("holidayName", { length: 255 }).notNull(),
        localName: varchar("localName", { length: 255 }),
        // Name in local language
        isGlobal: boolean("isGlobal").default(true).notNull(),
        // true = nationwide
        source: varchar("source", { length: 50 }).default("nager_api"),
        // nager_api | manual
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        phCountryCodeIdx: index("ph_country_code_idx").on(table.countryCode),
        phYearIdx: index("ph_year_idx").on(table.year),
        phCountryYearIdx: index("ph_country_year_idx").on(table.countryCode, table.year)
      })
    );
    customers = mysqlTable(
      "customers",
      {
        id: int("id").autoincrement().primaryKey(),
        clientCode: varchar("clientCode", { length: 20 }).unique(),
        // Auto-generated: CUS-0001
        companyName: varchar("companyName", { length: 255 }).notNull(),
        legalEntityName: varchar("legalEntityName", { length: 255 }),
        registrationNumber: varchar("registrationNumber", { length: 100 }),
        industry: varchar("industry", { length: 100 }),
        address: text("address"),
        city: varchar("city", { length: 100 }),
        state: varchar("state", { length: 100 }),
        country: varchar("country", { length: 100 }).notNull(),
        postalCode: varchar("postalCode", { length: 20 }),
        primaryContactName: varchar("primaryContactName", { length: 255 }),
        primaryContactEmail: varchar("primaryContactEmail", { length: 320 }),
        primaryContactPhone: varchar("primaryContactPhone", { length: 20 }),
        paymentTermDays: int("paymentTermDays").default(30).notNull(),
        // Payment terms in days (Net 7/15/30 etc.)
        settlementCurrency: varchar("settlementCurrency", { length: 3 }).default("USD").notNull(),
        language: mysqlEnum("language", ["en", "zh"]).default("en").notNull(),
        // Invoice language preference
        billingEntityId: int("billingEntityId"),
        // Associated billing entity (1:1)
        depositMultiplier: int("depositMultiplier").default(2).notNull(),
        // Deposit = (baseSalary + estEmployerCost) × multiplier
        status: mysqlEnum("status", ["active", "suspended", "terminated"]).default("active").notNull(),
        notes: text("notes"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        companyNameIdx: index("company_name_idx").on(table.companyName),
        countryIdx: index("country_idx").on(table.country),
        statusIdx: index("status_idx").on(table.status)
      })
    );
    customerContacts = mysqlTable(
      "customer_contacts",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId").notNull(),
        contactName: varchar("contactName", { length: 255 }).notNull(),
        email: varchar("email", { length: 320 }).notNull(),
        phone: varchar("phone", { length: 20 }),
        role: varchar("role", { length: 100 }),
        // Business role (e.g. "HR Director")
        isPrimary: boolean("isPrimary").default(false).notNull(),
        hasPortalAccess: boolean("hasPortalAccess").default(false).notNull(),
        // ── Portal Authentication Fields ──
        passwordHash: varchar("passwordHash", { length: 255 }),
        // bcrypt hash
        portalRole: mysqlEnum("portalRole", ["admin", "hr_manager", "finance", "viewer"]).default("viewer"),
        inviteToken: varchar("inviteToken", { length: 255 }),
        inviteExpiresAt: timestamp("inviteExpiresAt"),
        resetToken: varchar("resetToken", { length: 255 }),
        resetExpiresAt: timestamp("resetExpiresAt"),
        isPortalActive: boolean("isPortalActive").default(false).notNull(),
        // true after invite accepted
        lastLoginAt: timestamp("lastLoginAt"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        customerIdIdx: index("cc_customer_id_idx").on(table.customerId),
        emailIdx: uniqueIndex("cc_email_idx").on(table.email),
        inviteTokenIdx: index("cc_invite_token_idx").on(table.inviteToken)
      })
    );
    customerPricing = mysqlTable(
      "customer_pricing",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId").notNull(),
        pricingType: mysqlEnum("pricingType", ["global_discount", "country_specific"]).notNull(),
        // For global_discount: discount percentage (e.g. 10 = 10% off standard price)
        globalDiscountPercent: decimal("globalDiscountPercent", { precision: 5, scale: 2 }),
        // For country_specific: fixed price per employee per month
        countryCode: varchar("countryCode", { length: 3 }),
        serviceType: mysqlEnum("serviceType", ["eor", "visa_eor", "aor"]),
        fixedPrice: decimal("fixedPrice", { precision: 15, scale: 2 }),
        currency: varchar("currency", { length: 3 }).default("USD"),
        effectiveFrom: date("effectiveFrom").notNull(),
        effectiveTo: date("effectiveTo"),
        isActive: boolean("isActive").default(true).notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        customerIdIdx: index("cp_customer_id_idx").on(table.customerId),
        countryCodeIdx: index("cp_country_code_idx").on(table.countryCode)
      })
    );
    customerContracts = mysqlTable(
      "customer_contracts",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId").notNull(),
        contractName: varchar("contractName", { length: 255 }).notNull(),
        contractType: varchar("contractType", { length: 100 }),
        fileUrl: text("fileUrl"),
        fileKey: varchar("fileKey", { length: 500 }),
        signedDate: date("signedDate"),
        effectiveDate: date("effectiveDate"),
        expiryDate: date("expiryDate"),
        status: mysqlEnum("status", ["draft", "signed", "expired", "terminated"]).default("draft").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        cctrCustomerIdIdx: index("cctr_customer_id_idx").on(table.customerId)
      })
    );
    customerLeavePolicies = mysqlTable(
      "customer_leave_policies",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId").notNull(),
        countryCode: varchar("countryCode", { length: 3 }).notNull(),
        leaveTypeId: int("leaveTypeId").notNull(),
        annualEntitlement: int("annualEntitlement").notNull(),
        // Days per year (must be >= statutory minimum)
        expiryRule: mysqlEnum("expiryRule", ["year_end", "anniversary", "no_expiry"]).default("year_end").notNull(),
        carryOverDays: int("carryOverDays").default(0).notNull(),
        // Max days that can carry over to next year (0 = no carry over)
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        clpCustomerIdIdx: index("clp_customer_id_idx").on(table.customerId),
        clpCountryIdx: index("clp_country_idx").on(table.countryCode),
        clpUniqueIdx: uniqueIndex("clp_unique_idx").on(table.customerId, table.countryCode, table.leaveTypeId)
      })
    );
    employees = mysqlTable(
      "employees",
      {
        id: int("id").autoincrement().primaryKey(),
        employeeCode: varchar("employeeCode", { length: 20 }).unique(),
        // Auto-generated: EMP-0001
        customerId: int("customerId").notNull(),
        // Personal info
        firstName: varchar("firstName", { length: 100 }).notNull(),
        lastName: varchar("lastName", { length: 100 }).notNull(),
        email: varchar("email", { length: 320 }).notNull(),
        phone: varchar("phone", { length: 20 }),
        dateOfBirth: date("dateOfBirth"),
        gender: mysqlEnum("gender", ["male", "female", "other", "prefer_not_to_say"]),
        nationality: varchar("nationality", { length: 100 }),
        idNumber: varchar("idNumber", { length: 100 }),
        idType: varchar("idType", { length: 50 }),
        // Address
        address: text("address"),
        city: varchar("city", { length: 100 }),
        state: varchar("state", { length: 100 }),
        country: varchar("country", { length: 100 }).notNull(),
        // Employment country
        postalCode: varchar("postalCode", { length: 20 }),
        // Employment details
        department: varchar("department", { length: 100 }),
        jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
        serviceType: mysqlEnum("serviceType", ["eor", "visa_eor", "aor"]).default("eor").notNull(),
        employmentType: mysqlEnum("employmentType", ["fixed_term", "long_term"]).default("long_term").notNull(),
        startDate: date("startDate").notNull(),
        endDate: date("endDate"),
        // Status: full lifecycle
        status: mysqlEnum("status", [
          "pending_review",
          "documents_incomplete",
          "onboarding",
          "contract_signed",
          "active",
          "on_leave",
          "offboarding",
          "terminated"
        ]).default("pending_review").notNull(),
        // Compensation
        baseSalary: decimal("baseSalary", { precision: 15, scale: 2 }).notNull(),
        salaryCurrency: varchar("salaryCurrency", { length: 3 }).default("USD").notNull(),
        estimatedEmployerCost: decimal("estimatedEmployerCost", { precision: 15, scale: 2 }).default("0"),
        // Pre-employment estimate for deposit calculation
        // Visa tracking
        requiresVisa: boolean("requiresVisa").default(false).notNull(),
        visaStatus: mysqlEnum("visaStatus", [
          "not_required",
          "pending_application",
          "application_submitted",
          "approved",
          "rejected",
          "expired"
        ]).default("not_required"),
        visaExpiryDate: date("visaExpiryDate"),
        visaNotes: text("visaNotes"),
        // Metadata
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        empCustomerIdIdx: index("emp_customer_id_idx").on(table.customerId),
        empEmailIdx: index("emp_email_idx").on(table.email),
        empStatusIdx: index("emp_status_idx").on(table.status),
        empCountryIdx: index("emp_country_idx").on(table.country),
        empServiceTypeIdx: index("emp_service_type_idx").on(table.serviceType)
      })
    );
    employeeContracts = mysqlTable(
      "employee_contracts",
      {
        id: int("id").autoincrement().primaryKey(),
        employeeId: int("employeeId").notNull(),
        contractType: varchar("contractType", { length: 100 }),
        fileUrl: text("fileUrl"),
        fileKey: varchar("fileKey", { length: 500 }),
        signedDate: date("signedDate"),
        effectiveDate: date("effectiveDate"),
        expiryDate: date("expiryDate"),
        status: mysqlEnum("status", ["draft", "signed", "expired", "terminated"]).default("draft").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        ecEmployeeIdIdx: index("ec_employee_id_idx").on(table.employeeId)
      })
    );
    leaveBalances = mysqlTable(
      "leave_balances",
      {
        id: int("id").autoincrement().primaryKey(),
        employeeId: int("employeeId").notNull(),
        leaveTypeId: int("leaveTypeId").notNull(),
        year: int("year").notNull(),
        totalEntitlement: int("totalEntitlement").notNull(),
        used: int("used").default(0).notNull(),
        remaining: int("remaining").notNull(),
        expiryDate: date("expiryDate"),
        // When this leave balance expires (null = no expiry, carries over)
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        lbEmployeeIdIdx: index("lb_employee_id_idx").on(table.employeeId),
        lbLeaveTypeIdIdx: index("lb_leave_type_id_idx").on(table.leaveTypeId),
        lbEmployeeLeaveYearIdx: uniqueIndex("lb_employee_leave_year_idx").on(table.employeeId, table.leaveTypeId, table.year)
      })
    );
    leaveRecords = mysqlTable(
      "leave_records",
      {
        id: int("id").autoincrement().primaryKey(),
        employeeId: int("employeeId").notNull(),
        leaveTypeId: int("leaveTypeId").notNull(),
        startDate: date("startDate").notNull(),
        endDate: date("endDate").notNull(),
        days: decimal("days", { precision: 4, scale: 1 }).notNull(),
        // Support half days
        // Status workflow: submitted → client_approved/client_rejected → admin_approved/admin_rejected → locked
        status: mysqlEnum("status", [
          "submitted",
          "client_approved",
          "client_rejected",
          "admin_approved",
          "admin_rejected",
          "locked"
        ]).default("submitted").notNull(),
        reason: text("reason"),
        submittedBy: int("submittedBy"),
        // User ID who created this
        // Approval tracking
        clientApprovedBy: int("clientApprovedBy"),
        // Portal contact ID who approved/rejected
        clientApprovedAt: timestamp("clientApprovedAt"),
        clientRejectionReason: text("clientRejectionReason"),
        adminApprovedBy: int("adminApprovedBy"),
        // Admin user ID who confirmed
        adminApprovedAt: timestamp("adminApprovedAt"),
        adminRejectionReason: text("adminRejectionReason"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        lrEmployeeIdIdx: index("lr_employee_id_idx").on(table.employeeId),
        lrStatusIdx: index("lr_status_idx").on(table.status),
        lrStartDateIdx: index("lr_start_date_idx").on(table.startDate)
      })
    );
    adjustments = mysqlTable(
      "adjustments",
      {
        id: int("id").autoincrement().primaryKey(),
        employeeId: int("employeeId").notNull(),
        customerId: int("customerId").notNull(),
        // Auto-filled from employee
        payrollRunId: int("payrollRunId"),
        // Linked to payroll when locked
        adjustmentType: mysqlEnum("adjustmentType", [
          "bonus",
          "allowance",
          "reimbursement",
          "deduction",
          "other"
        ]).notNull(),
        category: mysqlEnum("category", [
          "housing",
          "transport",
          "meals",
          "performance_bonus",
          "year_end_bonus",
          "overtime",
          "travel_reimbursement",
          "equipment_reimbursement",
          "absence_deduction",
          "other"
        ]),
        description: text("description"),
        amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
        currency: varchar("currency", { length: 3 }).default("USD").notNull(),
        // Auto-filled from employee's country
        // For reimbursements: receipt
        receiptFileUrl: text("receiptFileUrl"),
        receiptFileKey: varchar("receiptFileKey", { length: 500 }),
        // Status workflow: submitted → client_approved/client_rejected → admin_approved/admin_rejected → locked
        status: mysqlEnum("status", [
          "submitted",
          "client_approved",
          "client_rejected",
          "admin_approved",
          "admin_rejected",
          "locked"
        ]).default("submitted").notNull(),
        submittedBy: int("submittedBy"),
        // User ID who created this
        // Approval tracking
        clientApprovedBy: int("clientApprovedBy"),
        clientApprovedAt: timestamp("clientApprovedAt"),
        clientRejectionReason: text("clientRejectionReason"),
        adminApprovedBy: int("adminApprovedBy"),
        adminApprovedAt: timestamp("adminApprovedAt"),
        adminRejectionReason: text("adminRejectionReason"),
        // Target month
        effectiveMonth: date("effectiveMonth").notNull(),
        // Which payroll month this applies to (YYYY-MM-01)
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        adjEmployeeIdIdx: index("adj_employee_id_idx").on(table.employeeId),
        adjCustomerIdIdx: index("adj_customer_id_idx").on(table.customerId),
        adjStatusIdx: index("adj_status_idx").on(table.status),
        adjPayrollRunIdIdx: index("adj_payroll_run_id_idx").on(table.payrollRunId),
        adjEffectiveMonthIdx: index("adj_effective_month_idx").on(table.effectiveMonth)
      })
    );
    payrollRuns = mysqlTable(
      "payroll_runs",
      {
        id: int("id").autoincrement().primaryKey(),
        // Payroll runs are organized by country + period (not by customer)
        // All active employees in this country are included regardless of customer
        countryCode: varchar("countryCode", { length: 3 }).notNull(),
        payrollMonth: date("payrollMonth").notNull(),
        // First day of the month
        currency: varchar("currency", { length: 3 }).notNull(),
        // = country's legal currency
        status: mysqlEnum("status", [
          "draft",
          "pending_approval",
          "approved",
          "rejected"
        ]).default("draft").notNull(),
        totalGross: decimal("totalGross", { precision: 15, scale: 2 }).default("0"),
        totalDeductions: decimal("totalDeductions", { precision: 15, scale: 2 }).default("0"),
        totalNet: decimal("totalNet", { precision: 15, scale: 2 }).default("0"),
        totalEmployerCost: decimal("totalEmployerCost", { precision: 15, scale: 2 }).default("0"),
        // Cross-approval: operations manager submits, another ops manager approves
        submittedBy: int("submittedBy"),
        submittedAt: timestamp("submittedAt"),
        approvedBy: int("approvedBy"),
        approvedAt: timestamp("approvedAt"),
        rejectedBy: int("rejectedBy"),
        rejectedAt: timestamp("rejectedAt"),
        rejectionReason: text("rejectionReason"),
        notes: text("notes"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        prPayrollMonthIdx: index("pr_payroll_month_idx").on(table.payrollMonth),
        prStatusIdx: index("pr_status_idx").on(table.status),
        prCountryCodeIdx: index("pr_country_code_idx").on(table.countryCode),
        prCountryMonthIdx: uniqueIndex("pr_country_month_idx").on(table.countryCode, table.payrollMonth)
      })
    );
    payrollItems = mysqlTable(
      "payroll_items",
      {
        id: int("id").autoincrement().primaryKey(),
        payrollRunId: int("payrollRunId").notNull(),
        employeeId: int("employeeId").notNull(),
        baseSalary: decimal("baseSalary", { precision: 15, scale: 2 }).notNull(),
        bonus: decimal("bonus", { precision: 15, scale: 2 }).default("0"),
        allowances: decimal("allowances", { precision: 15, scale: 2 }).default("0"),
        reimbursements: decimal("reimbursements", { precision: 15, scale: 2 }).default("0"),
        deductions: decimal("deductions", { precision: 15, scale: 2 }).default("0"),
        taxDeduction: decimal("taxDeduction", { precision: 15, scale: 2 }).default("0"),
        socialSecurityDeduction: decimal("socialSecurityDeduction", { precision: 15, scale: 2 }).default("0"),
        unpaidLeaveDeduction: decimal("unpaidLeaveDeduction", { precision: 15, scale: 2 }).default("0"),
        unpaidLeaveDays: decimal("unpaidLeaveDays", { precision: 4, scale: 1 }).default("0"),
        gross: decimal("gross", { precision: 15, scale: 2 }).notNull(),
        net: decimal("net", { precision: 15, scale: 2 }).notNull(),
        employerSocialContribution: decimal("employerSocialContribution", { precision: 15, scale: 2 }).default("0"),
        totalEmploymentCost: decimal("totalEmploymentCost", { precision: 15, scale: 2 }).notNull(),
        // gross + employer contributions
        currency: varchar("currency", { length: 3 }).default("USD").notNull(),
        notes: text("notes"),
        // JSON breakdown of adjustments included
        adjustmentsBreakdown: json("adjustmentsBreakdown"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        piPayrollRunIdIdx: index("pi_payroll_run_id_idx").on(table.payrollRunId),
        piEmployeeIdIdx: index("pi_employee_id_idx").on(table.employeeId),
        piRunEmployeeIdx: uniqueIndex("pi_run_employee_idx").on(table.payrollRunId, table.employeeId)
      })
    );
    invoices = mysqlTable(
      "invoices",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId").notNull(),
        billingEntityId: int("billingEntityId"),
        // Which billing entity issues this invoice
        invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull().unique(),
        invoiceType: mysqlEnum("invoiceType", [
          "deposit",
          "monthly_eor",
          "monthly_visa_eor",
          "monthly_aor",
          "visa_service",
          "deposit_refund",
          "credit_note",
          "manual"
        ]).notNull(),
        invoiceMonth: date("invoiceMonth"),
        // For monthly invoices
        // Invoice aggregates from multiple country-based payroll runs for this customer
        // The link is: invoice -> invoiceItems -> employeeId -> payrollItems
        // No single payrollRunId since invoice spans multiple countries
        currency: varchar("currency", { length: 3 }).notNull(),
        exchangeRate: decimal("exchangeRate", { precision: 18, scale: 8 }).default("1"),
        exchangeRateWithMarkup: decimal("exchangeRateWithMarkup", { precision: 18, scale: 8 }).default("1"),
        subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
        serviceFeeTotal: decimal("serviceFeeTotal", { precision: 15, scale: 2 }).default("0"),
        tax: decimal("tax", { precision: 15, scale: 2 }).default("0"),
        // Total VAT across all countries
        total: decimal("total", { precision: 15, scale: 2 }).notNull(),
        // subtotal + serviceFeeTotal + tax
        status: mysqlEnum("status", [
          "draft",
          "pending_review",
          "sent",
          "paid",
          "overdue",
          "cancelled",
          "void",
          "applied"
        ]).default("draft").notNull(),
        dueDate: date("dueDate"),
        sentDate: timestamp("sentDate"),
        paidDate: timestamp("paidDate"),
        paidAmount: decimal("paidAmount", { precision: 15, scale: 2 }),
        // Credit note application tracking
        creditApplied: decimal("creditApplied", { precision: 15, scale: 2 }).default("0"),
        // Total credit applied to this invoice
        amountDue: decimal("amountDue", { precision: 15, scale: 2 }),
        // Adjusted amount due after credit (total - creditApplied)
        // Cost allocation tracking (denormalized for query performance)
        costAllocated: decimal("costAllocated", { precision: 15, scale: 2 }).default("0"),
        // Total vendor bill cost allocated to this invoice
        // Related credit note / refund
        relatedInvoiceId: int("relatedInvoiceId"),
        notes: text("notes"),
        internalNotes: text("internalNotes"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        invCustomerIdIdx: index("inv_customer_id_idx").on(table.customerId),
        invInvoiceNumberIdx: uniqueIndex("inv_invoice_number_idx").on(table.invoiceNumber),
        invStatusIdx: index("inv_status_idx").on(table.status),
        invInvoiceMonthIdx: index("inv_invoice_month_idx").on(table.invoiceMonth)
      })
    );
    invoiceItems = mysqlTable(
      "invoice_items",
      {
        id: int("id").autoincrement().primaryKey(),
        invoiceId: int("invoiceId").notNull(),
        employeeId: int("employeeId"),
        description: varchar("description", { length: 500 }).notNull(),
        quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
        unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
        amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
        itemType: mysqlEnum("itemType", [
          "eor_service_fee",
          "visa_eor_service_fee",
          "aor_service_fee",
          "employment_cost",
          "deposit",
          "equipment_procurement_fee",
          "onboarding_fee",
          "offboarding_fee",
          "admin_setup_fee",
          "contract_termination_fee",
          "payroll_processing_fee",
          "tax_filing_fee",
          "hr_advisory_fee",
          "legal_compliance_fee",
          "visa_immigration_fee",
          "relocation_fee",
          "benefits_admin_fee",
          "bank_transfer_fee",
          "consulting_fee",
          "management_consulting_fee"
        ]).notNull(),
        vatRate: decimal("vatRate", { precision: 5, scale: 2 }).default("0"),
        // Tax rate percentage (e.g. 10.00 = 10%)
        countryCode: varchar("countryCode", { length: 3 }),
        // Which country this line item relates to
        localCurrency: varchar("localCurrency", { length: 3 }),
        // Original currency before conversion
        localAmount: decimal("localAmount", { precision: 15, scale: 2 }),
        // Amount in local currency
        exchangeRate: decimal("exchangeRate", { precision: 18, scale: 8 }),
        // Rate used for conversion
        exchangeRateWithMarkup: decimal("exchangeRateWithMarkup", { precision: 18, scale: 8 }),
        // Rate with markup
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        iiInvoiceIdIdx: index("ii_invoice_id_idx").on(table.invoiceId),
        iiEmployeeIdIdx: index("ii_employee_id_idx").on(table.employeeId)
      })
    );
    exchangeRates = mysqlTable(
      "exchange_rates",
      {
        id: int("id").autoincrement().primaryKey(),
        fromCurrency: varchar("fromCurrency", { length: 3 }).notNull(),
        toCurrency: varchar("toCurrency", { length: 3 }).notNull(),
        rate: decimal("rate", { precision: 18, scale: 8 }).notNull(),
        rateWithMarkup: decimal("rateWithMarkup", { precision: 18, scale: 8 }).notNull(),
        // rate * (1 + markupPercentage)
        markupPercentage: decimal("markupPercentage", { precision: 5, scale: 2 }).default("5.00").notNull(),
        // e.g. 5.00 = 5%
        source: varchar("source", { length: 100 }),
        effectiveDate: date("effectiveDate").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        erCurrencyPairIdx: uniqueIndex("er_currency_pair_idx").on(
          table.fromCurrency,
          table.toCurrency,
          table.effectiveDate
        )
      })
    );
    auditLogs = mysqlTable(
      "audit_logs",
      {
        id: int("id").autoincrement().primaryKey(),
        userId: int("userId"),
        userName: varchar("userName", { length: 255 }),
        action: varchar("action", { length: 100 }).notNull(),
        entityType: varchar("entityType", { length: 100 }).notNull(),
        entityId: int("entityId"),
        changes: json("changes"),
        ipAddress: varchar("ipAddress", { length: 50 }),
        userAgent: text("userAgent"),
        createdAt: timestamp("createdAt").defaultNow().notNull()
      },
      (table) => ({
        alUserIdIdx: index("al_user_id_idx").on(table.userId),
        alEntityTypeIdx: index("al_entity_type_idx").on(table.entityType),
        alCreatedAtIdx: index("al_created_at_idx").on(table.createdAt)
      })
    );
    systemSettings = mysqlTable(
      "system_settings",
      {
        id: int("id").autoincrement().primaryKey(),
        key: varchar("key", { length: 100 }).notNull().unique(),
        value: text("value").notNull(),
        description: text("description"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        ssKeyIdx: uniqueIndex("ss_key_idx").on(table.key)
      })
    );
    employeeDocuments = mysqlTable(
      "employee_documents",
      {
        id: int("id").autoincrement().primaryKey(),
        employeeId: int("employeeId").notNull(),
        documentType: mysqlEnum("documentType", [
          "resume",
          "passport",
          "national_id",
          "work_permit",
          "visa",
          "contract",
          "education",
          "other"
        ]).notNull(),
        documentName: varchar("documentName", { length: 255 }).notNull(),
        fileUrl: text("fileUrl").notNull(),
        fileKey: varchar("fileKey", { length: 500 }).notNull(),
        mimeType: varchar("mimeType", { length: 100 }),
        fileSize: int("fileSize"),
        notes: text("notes"),
        uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        edEmployeeIdIdx: index("ed_employee_id_idx").on(table.employeeId),
        edDocTypeIdx: index("ed_doc_type_idx").on(table.documentType)
      })
    );
    billingEntities = mysqlTable(
      "billing_entities",
      {
        id: int("id").autoincrement().primaryKey(),
        entityName: varchar("entityName", { length: 255 }).notNull(),
        legalName: varchar("legalName", { length: 255 }).notNull(),
        registrationNumber: varchar("registrationNumber", { length: 100 }),
        taxId: varchar("taxId", { length: 100 }),
        country: varchar("country", { length: 100 }).notNull(),
        address: text("address"),
        city: varchar("city", { length: 100 }),
        state: varchar("state", { length: 100 }),
        postalCode: varchar("postalCode", { length: 20 }),
        bankDetails: text("bankDetails"),
        // Free-text bank info (multiline, admin-configured per country)
        currency: varchar("currency", { length: 3 }).default("USD").notNull(),
        contactEmail: varchar("contactEmail", { length: 320 }),
        contactPhone: varchar("contactPhone", { length: 20 }),
        isDefault: boolean("isDefault").default(false).notNull(),
        isActive: boolean("isActive").default(true).notNull(),
        // Finance Phase 2 fields
        logoUrl: text("logoUrl"),
        // S3 URL for entity logo
        logoFileKey: varchar("logoFileKey", { length: 500 }),
        // S3 key for logo file
        invoicePrefix: varchar("invoicePrefix", { length: 20 }),
        // e.g. "APAC-" for invoice numbering
        paymentTermDays: int("paymentTermDays").default(30).notNull(),
        // Payment terms in days
        invoiceSequence: int("invoiceSequence").default(0).notNull(),
        // Last used invoice sequence number
        notes: text("notes"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        beCountryIdx: index("be_country_idx").on(table.country),
        beActiveIdx: index("be_active_idx").on(table.isActive),
        beInvoicePrefixIdx: uniqueIndex("be_invoice_prefix_idx").on(table.invoicePrefix)
      })
    );
    creditNoteApplications = mysqlTable(
      "credit_note_applications",
      {
        id: int("id").autoincrement().primaryKey(),
        creditNoteId: int("creditNoteId").notNull(),
        // The credit_note invoice being applied
        appliedToInvoiceId: int("appliedToInvoiceId").notNull(),
        // The regular invoice receiving the credit
        appliedAmount: decimal("appliedAmount", { precision: 15, scale: 2 }).notNull(),
        // Positive value representing the credit applied
        notes: text("notes"),
        appliedAt: timestamp("appliedAt").defaultNow().notNull(),
        appliedBy: int("appliedBy"),
        // User who applied the credit
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        cnaCreditNoteIdx: index("cna_credit_note_idx").on(table.creditNoteId),
        cnaAppliedToIdx: index("cna_applied_to_idx").on(table.appliedToInvoiceId)
      })
    );
    onboardingInvites = mysqlTable(
      "onboarding_invites",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId").notNull(),
        employeeName: varchar("employeeName", { length: 200 }).notNull(),
        employeeEmail: varchar("employeeEmail", { length: 320 }).notNull(),
        token: varchar("token", { length: 64 }).notNull().unique(),
        status: mysqlEnum("status", [
          "pending",
          "completed",
          "expired",
          "cancelled"
        ]).default("pending").notNull(),
        employeeId: int("employeeId"),
        expiresAt: timestamp("expiresAt").notNull(),
        completedAt: timestamp("completedAt"),
        createdBy: int("createdBy"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        oiTokenIdx: uniqueIndex("oi_token_idx").on(table.token),
        oiCustomerIdIdx: index("oi_customer_id_idx").on(table.customerId),
        oiStatusIdx: index("oi_status_idx").on(table.status),
        oiEmailIdx: index("oi_email_idx").on(table.employeeEmail)
      })
    );
    reimbursements = mysqlTable(
      "reimbursements",
      {
        id: int("id").autoincrement().primaryKey(),
        employeeId: int("employeeId").notNull(),
        customerId: int("customerId").notNull(),
        // Auto-filled from employee
        payrollRunId: int("payrollRunId"),
        // Linked to payroll when locked
        category: mysqlEnum("category", [
          "travel",
          "equipment",
          "meals",
          "transportation",
          "medical",
          "education",
          "office_supplies",
          "communication",
          "other"
        ]).notNull(),
        description: text("description"),
        amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
        currency: varchar("currency", { length: 3 }).default("USD").notNull(),
        // Receipt / supporting document
        receiptFileUrl: text("receiptFileUrl"),
        receiptFileKey: varchar("receiptFileKey", { length: 500 }),
        // Status workflow: submitted → client_approved/client_rejected → admin_approved/admin_rejected → locked
        status: mysqlEnum("status", [
          "submitted",
          "client_approved",
          "client_rejected",
          "admin_approved",
          "admin_rejected",
          "locked"
        ]).default("submitted").notNull(),
        submittedBy: int("submittedBy"),
        // User/contact ID who created this
        // Approval tracking
        clientApprovedBy: int("clientApprovedBy"),
        clientApprovedAt: timestamp("clientApprovedAt"),
        clientRejectionReason: text("clientRejectionReason"),
        adminApprovedBy: int("adminApprovedBy"),
        adminApprovedAt: timestamp("adminApprovedAt"),
        adminRejectionReason: text("adminRejectionReason"),
        // Target month
        effectiveMonth: date("effectiveMonth").notNull(),
        // Which payroll month this applies to (YYYY-MM-01)
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        reimbEmployeeIdIdx: index("reimb_employee_id_idx").on(table.employeeId),
        reimbCustomerIdIdx: index("reimb_customer_id_idx").on(table.customerId),
        reimbStatusIdx: index("reimb_status_idx").on(table.status),
        reimbPayrollRunIdIdx: index("reimb_payroll_run_id_idx").on(table.payrollRunId),
        reimbEffectiveMonthIdx: index("reimb_effective_month_idx").on(table.effectiveMonth)
      })
    );
    vendors = mysqlTable(
      "vendors",
      {
        id: int("id").autoincrement().primaryKey(),
        vendorCode: varchar("vendorCode", { length: 20 }).unique(),
        // Auto-generated: VND-0001
        name: varchar("name", { length: 255 }).notNull(),
        legalName: varchar("legalName", { length: 255 }),
        contactName: varchar("contactName", { length: 255 }),
        contactEmail: varchar("contactEmail", { length: 320 }),
        contactPhone: varchar("contactPhone", { length: 50 }),
        country: varchar("country", { length: 100 }).notNull(),
        address: text("address"),
        city: varchar("city", { length: 100 }),
        state: varchar("state", { length: 100 }),
        postalCode: varchar("postalCode", { length: 20 }),
        serviceType: varchar("serviceType", { length: 100 }),
        // e.g. "Payroll Processing", "Legal", "IT"
        currency: varchar("currency", { length: 3 }).default("USD").notNull(),
        // Default payment currency
        bankDetails: text("bankDetails"),
        // Free-text bank info (multiline)
        taxId: varchar("taxId", { length: 100 }),
        paymentTermDays: int("paymentTermDays").default(30).notNull(),
        vendorType: mysqlEnum("vendorType", ["client_related", "operational"]).default("client_related").notNull(),
        status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
        notes: text("notes"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        vdrNameIdx: index("vdr_name_idx").on(table.name),
        vdrCountryIdx: index("vdr_country_idx").on(table.country),
        vdrStatusIdx: index("vdr_status_idx").on(table.status)
      })
    );
    vendorBills = mysqlTable(
      "vendor_bills",
      {
        id: int("id").autoincrement().primaryKey(),
        vendorId: int("vendorId").notNull(),
        billNumber: varchar("billNumber", { length: 100 }).notNull(),
        // Vendor's invoice/bill number
        billDate: date("billDate").notNull(),
        dueDate: date("dueDate"),
        paidDate: date("paidDate"),
        billMonth: date("billMonth"),
        // Which service month this bill covers (YYYY-MM-01)
        currency: varchar("currency", { length: 3 }).default("USD").notNull(),
        subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
        tax: decimal("tax", { precision: 15, scale: 2 }).default("0"),
        totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
        paidAmount: decimal("paidAmount", { precision: 15, scale: 2 }).default("0"),
        status: mysqlEnum("status", [
          "draft",
          "pending_approval",
          "approved",
          "paid",
          "partially_paid",
          "overdue",
          "cancelled",
          "void"
        ]).default("draft").notNull(),
        category: mysqlEnum("category", [
          "payroll_processing",
          "social_contributions",
          "tax_filing",
          "legal_compliance",
          "visa_immigration",
          "hr_advisory",
          "it_services",
          "office_rent",
          "insurance",
          "bank_charges",
          "consulting",
          "equipment",
          "travel",
          "marketing",
          "other"
        ]).default("other").notNull(),
        // Bill type: operational (regular service costs), deposit (vendor deposit/guarantee), deposit_refund
        billType: mysqlEnum("billType", [
          "operational",
          "deposit",
          "deposit_refund"
        ]).default("operational").notNull(),
        description: text("description"),
        internalNotes: text("internalNotes"),
        // File attachment (vendor's original invoice/receipt)
        receiptFileUrl: text("receiptFileUrl"),
        receiptFileKey: varchar("receiptFileKey", { length: 500 }),
        // Bank settlement fields (from POP - Proof of Payment)
        bankReference: varchar("bankReference", { length: 200 }),
        // Bank transaction reference number
        bankName: varchar("bankName", { length: 255 }),
        bankFee: decimal("bankFee", { precision: 15, scale: 2 }).default("0"),
        // Bank wire fee (USD)
        // Allocation tracking (denormalized for query performance)
        allocatedAmount: decimal("allocatedAmount", { precision: 15, scale: 2 }).default("0"),
        // Total USD allocated to invoices
        unallocatedAmount: decimal("unallocatedAmount", { precision: 15, scale: 2 }).default("0"),
        // totalAmount - allocatedAmount (operational cost)
        // Approval workflow
        submittedBy: int("submittedBy"),
        submittedAt: timestamp("submittedAt"),
        approvedBy: int("approvedBy"),
        approvedAt: timestamp("approvedAt"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        vbVendorIdIdx: index("vb_vendor_id_idx").on(table.vendorId),
        vbStatusIdx: index("vb_status_idx").on(table.status),
        vbBillDateIdx: index("vb_bill_date_idx").on(table.billDate),
        vbBillMonthIdx: index("vb_bill_month_idx").on(table.billMonth),
        vbCategoryIdx: index("vb_category_idx").on(table.category),
        vbBillNumberIdx: index("vb_bill_number_idx").on(table.billNumber)
      })
    );
    vendorBillItems = mysqlTable(
      "vendor_bill_items",
      {
        id: int("id").autoincrement().primaryKey(),
        vendorBillId: int("vendorBillId").notNull(),
        description: varchar("description", { length: 500 }).notNull(),
        quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
        unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
        amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
        // Cost allocation fields (optional — for linking expenses to revenue)
        relatedCustomerId: int("relatedCustomerId"),
        relatedEmployeeId: int("relatedEmployeeId"),
        relatedCountryCode: varchar("relatedCountryCode", { length: 3 }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        vbiVendorBillIdIdx: index("vbi_vendor_bill_id_idx").on(table.vendorBillId),
        vbiCustomerIdIdx: index("vbi_customer_id_idx").on(table.relatedCustomerId),
        vbiEmployeeIdIdx: index("vbi_employee_id_idx").on(table.relatedEmployeeId),
        vbiCountryCodeIdx: index("vbi_country_code_idx").on(table.relatedCountryCode)
      })
    );
    billInvoiceAllocations = mysqlTable(
      "bill_invoice_allocations",
      {
        id: int("id").autoincrement().primaryKey(),
        vendorBillId: int("vendorBillId").notNull(),
        // FK → vendor_bills.id
        vendorBillItemId: int("vendorBillItemId"),
        // FK → vendor_bill_items.id (optional, for item-level allocation)
        invoiceId: int("invoiceId").notNull(),
        // FK → invoices.id
        employeeId: int("employeeId").notNull(),
        // FK → employees.id (the bridge between bill and invoice)
        allocatedAmount: decimal("allocatedAmount", { precision: 15, scale: 2 }).notNull(),
        // USD amount allocated
        description: text("description"),
        // Optional note about this allocation
        allocatedBy: int("allocatedBy"),
        // User who created this allocation
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        biaVendorBillIdIdx: index("bia_vendor_bill_id_idx").on(table.vendorBillId),
        biaVendorBillItemIdIdx: index("bia_vendor_bill_item_id_idx").on(table.vendorBillItemId),
        biaInvoiceIdIdx: index("bia_invoice_id_idx").on(table.invoiceId),
        biaEmployeeIdIdx: index("bia_employee_id_idx").on(table.employeeId)
      })
    );
    salesLeads = mysqlTable(
      "sales_leads",
      {
        id: int("id").autoincrement().primaryKey(),
        companyName: varchar("companyName", { length: 255 }).notNull(),
        contactName: varchar("contactName", { length: 255 }),
        contactEmail: varchar("contactEmail", { length: 320 }),
        contactPhone: varchar("contactPhone", { length: 20 }),
        country: varchar("country", { length: 100 }),
        industry: varchar("industry", { length: 100 }),
        estimatedEmployees: int("estimatedEmployees"),
        // Expected number of employees to onboard
        estimatedRevenue: decimal("estimatedRevenue", { precision: 15, scale: 2 }),
        // Expected monthly revenue
        currency: varchar("currency", { length: 3 }).default("USD"),
        source: varchar("source", { length: 100 }),
        // Website, Referral, Cold Call, LinkedIn, Conference, etc.
        // Services the client intends to use (e.g. EOR, PEO, Payroll, etc.)
        intendedServices: text("intendedServices"),
        // Countries where employees are expected to onboard
        targetCountries: text("targetCountries"),
        status: mysqlEnum("status", [
          "discovery",
          "leads",
          "quotation_sent",
          "msa_sent",
          "msa_signed",
          "closed_won",
          "closed_lost"
        ]).default("discovery").notNull(),
        lostReason: text("lostReason"),
        // Reason if status = closed_lost
        createdBy: int("createdBy"),
        // User ID who created this lead (owner)
        assignedTo: int("assignedTo"),
        // User ID of the assigned salesperson
        convertedCustomerId: int("convertedCustomerId"),
        // Link to customers table after MSA signed
        notes: text("notes"),
        // General notes / follow-up log
        expectedCloseDate: date("expectedCloseDate"),
        // When the deal is expected to close
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        slStatusIdx: index("sl_status_idx").on(table.status),
        slAssignedToIdx: index("sl_assigned_to_idx").on(table.assignedTo),
        slCompanyNameIdx: index("sl_company_name_idx").on(table.companyName)
      })
    );
    salesActivities = mysqlTable(
      "sales_activities",
      {
        id: int("id").autoincrement().primaryKey(),
        leadId: int("leadId").notNull(),
        activityType: mysqlEnum("activityType", [
          "call",
          "email",
          "meeting",
          "note",
          "proposal",
          "follow_up",
          "other"
        ]).notNull(),
        description: text("description").notNull(),
        activityDate: timestamp("activityDate").defaultNow().notNull(),
        createdBy: int("createdBy"),
        // User ID who logged this activity
        createdAt: timestamp("createdAt").defaultNow().notNull()
      },
      (table) => ({
        saLeadIdIdx: index("sa_lead_id_idx").on(table.leadId),
        saActivityDateIdx: index("sa_activity_date_idx").on(table.activityDate)
      })
    );
    knowledgeSources = mysqlTable(
      "knowledge_sources",
      {
        id: int("id").autoincrement().primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        url: text("url").notNull(),
        sourceType: mysqlEnum("sourceType", ["rss", "api", "web"]).default("web").notNull(),
        language: mysqlEnum("language", ["en", "zh", "multi"]).default("multi").notNull(),
        topic: mysqlEnum("topic", ["payroll", "compliance", "leave", "invoice", "onboarding", "general"]).default("general").notNull(),
        isActive: boolean("isActive").default(true).notNull(),
        authorityScore: int("authorityScore").default(0).notNull(),
        authorityLevel: mysqlEnum("authorityLevel", ["high", "medium", "low"]).default("low").notNull(),
        authorityReason: text("authorityReason"),
        aiReviewedAt: timestamp("aiReviewedAt"),
        lastFetchedAt: timestamp("lastFetchedAt"),
        updatedBy: int("updatedBy"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        kbSourceActiveIdx: index("kb_source_active_idx").on(table.isActive),
        kbSourceTopicIdx: index("kb_source_topic_idx").on(table.topic)
      })
    );
    knowledgeItems = mysqlTable(
      "knowledge_items",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId"),
        // null = global item, otherwise customer-specific
        sourceId: int("sourceId"),
        title: varchar("title", { length: 500 }).notNull(),
        summary: text("summary"),
        content: text("content"),
        status: mysqlEnum("status", ["draft", "pending_review", "published", "rejected"]).default("pending_review").notNull(),
        category: mysqlEnum("category", ["article", "alert", "guide"]).default("article").notNull(),
        topic: mysqlEnum("topic", ["payroll", "compliance", "leave", "invoice", "onboarding", "general"]).default("general").notNull(),
        language: mysqlEnum("language", ["en", "zh"]).default("en").notNull(),
        metadata: json("metadata").$type().default(null),
        aiConfidence: int("aiConfidence").default(0).notNull(),
        aiSummary: text("aiSummary"),
        publishedAt: timestamp("publishedAt"),
        reviewedBy: int("reviewedBy"),
        reviewedAt: timestamp("reviewedAt"),
        reviewNote: text("reviewNote"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        kbItemCustomerIdx: index("kb_item_customer_idx").on(table.customerId),
        kbItemStatusIdx: index("kb_item_status_idx").on(table.status),
        kbItemTopicIdx: index("kb_item_topic_idx").on(table.topic),
        kbItemPublishedIdx: index("kb_item_published_idx").on(table.publishedAt)
      })
    );
    knowledgeMarketingEvents = mysqlTable(
      "knowledge_marketing_events",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId").notNull(),
        contactId: int("contactId"),
        channel: mysqlEnum("channel", ["email"]).default("email").notNull(),
        cadence: mysqlEnum("cadence", ["daily", "weekly", "monthly"]).default("weekly").notNull(),
        topics: json("topics").$type().notNull(),
        payload: json("payload").$type().notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull()
      },
      (table) => ({
        kbEventCustomerIdx: index("kb_event_customer_idx").on(table.customerId)
      })
    );
    knowledgeFeedbackEvents = mysqlTable(
      "knowledge_feedback_events",
      {
        id: int("id").autoincrement().primaryKey(),
        customerId: int("customerId").notNull(),
        contactId: int("contactId"),
        locale: mysqlEnum("locale", ["en", "zh"]).default("en").notNull(),
        query: varchar("query", { length: 500 }),
        topics: json("topics").$type().notNull(),
        feedbackType: mysqlEnum("feedbackType", ["no_results", "not_helpful"]).default("not_helpful").notNull(),
        note: text("note"),
        metadata: json("metadata").$type().default(null),
        createdAt: timestamp("createdAt").defaultNow().notNull()
      },
      (table) => ({
        kbFeedbackCustomerIdx: index("kb_feedback_customer_idx").on(table.customerId),
        kbFeedbackTypeIdx: index("kb_feedback_type_idx").on(table.feedbackType),
        kbFeedbackCreatedIdx: index("kb_feedback_created_idx").on(table.createdAt)
      })
    );
    aiProviderConfigs = mysqlTable(
      "ai_provider_configs",
      {
        id: int("id").autoincrement().primaryKey(),
        provider: mysqlEnum("provider", ["manus_forge", "openai", "anthropic", "google"]).notNull(),
        displayName: varchar("displayName", { length: 100 }).notNull(),
        baseUrl: text("baseUrl"),
        model: varchar("model", { length: 100 }).notNull(),
        apiKeyEnv: varchar("apiKeyEnv", { length: 100 }).notNull(),
        isEnabled: boolean("isEnabled").default(true).notNull(),
        priority: int("priority").default(100).notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        aiProviderIdx: uniqueIndex("ai_provider_idx").on(table.provider),
        aiProviderEnabledIdx: index("ai_provider_enabled_idx").on(table.isEnabled)
      })
    );
    aiTaskPolicies = mysqlTable(
      "ai_task_policies",
      {
        id: int("id").autoincrement().primaryKey(),
        task: mysqlEnum("task", ["knowledge_summarize", "source_authority_review", "vendor_bill_parse", "invoice_audit"]).notNull(),
        primaryProvider: mysqlEnum("primaryProvider", ["manus_forge", "openai", "anthropic", "google"]).default("manus_forge").notNull(),
        fallbackProvider: mysqlEnum("fallbackProvider", ["manus_forge", "openai", "anthropic", "google"]),
        modelOverride: varchar("modelOverride", { length: 100 }),
        temperature: decimal("temperature", { precision: 4, scale: 2 }).default("0.30"),
        maxTokens: int("maxTokens").default(4096),
        isActive: boolean("isActive").default(true).notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => ({
        aiTaskIdx: uniqueIndex("ai_task_idx").on(table.task),
        aiTaskActiveIdx: index("ai_task_active_idx").on(table.isActive)
      })
    );
    aiTaskExecutions = mysqlTable(
      "ai_task_executions",
      {
        id: int("id").autoincrement().primaryKey(),
        taskType: mysqlEnum("taskType", ["knowledge_summarize", "source_authority_review", "vendor_bill_parse", "invoice_audit"]).notNull(),
        providerPrimary: mysqlEnum("providerPrimary", ["manus_forge", "openai", "anthropic", "google"]).notNull(),
        providerActual: mysqlEnum("providerActual", ["manus_forge", "openai", "anthropic", "google"]).notNull(),
        fallbackTriggered: boolean("fallbackTriggered").default(false).notNull(),
        latencyMs: int("latencyMs").default(0).notNull(),
        tokenUsageIn: int("tokenUsageIn").default(0).notNull(),
        tokenUsageOut: int("tokenUsageOut").default(0).notNull(),
        costEstimate: decimal("costEstimate", { precision: 10, scale: 4 }).default("0.0000").notNull(),
        success: boolean("success").default(true).notNull(),
        errorClass: varchar("errorClass", { length: 120 }),
        createdAt: timestamp("createdAt").defaultNow().notNull()
      },
      (table) => ({
        aiExecTaskIdx: index("ai_exec_task_idx").on(table.taskType),
        aiExecCreatedIdx: index("ai_exec_created_idx").on(table.createdAt),
        aiExecSuccessIdx: index("ai_exec_success_idx").on(table.success)
      })
    );
  }
});

// server/portal/portalAuth.ts
var portalAuth_exports = {};
__export(portalAuth_exports, {
  authenticatePortalRequest: () => authenticatePortalRequest,
  clearPortalCookie: () => clearPortalCookie,
  generateInviteToken: () => generateInviteToken2,
  generateResetToken: () => generateResetToken,
  getInviteExpiryDate: () => getInviteExpiryDate2,
  getPortalTokenFromRequest: () => getPortalTokenFromRequest,
  getResetExpiryDate: () => getResetExpiryDate,
  hashPassword: () => hashPassword2,
  setPortalCookie: () => setPortalCookie,
  signPortalToken: () => signPortalToken,
  verifyPassword: () => verifyPassword2,
  verifyPortalToken: () => verifyPortalToken
});
import bcrypt2 from "bcryptjs";
import * as jose2 from "jose";
import { eq, and } from "drizzle-orm";
import crypto2 from "crypto";
function getJwtSecret2() {
  const portalKey = `portal:${ENV.cookieSecret}`;
  return new TextEncoder().encode(portalKey);
}
async function signPortalToken(payload) {
  const secret = getJwtSecret2();
  return new jose2.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setIssuer(JWT_ISSUER2).setAudience(JWT_AUDIENCE2).setExpirationTime(PORTAL_JWT_EXPIRY).sign(secret);
}
async function verifyPortalToken(token) {
  try {
    const secret = getJwtSecret2();
    const { payload } = await jose2.jwtVerify(token, secret, {
      issuer: JWT_ISSUER2,
      audience: JWT_AUDIENCE2
    });
    if (!payload.sub || !payload.customerId || !payload.email || !payload.portalRole) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
async function hashPassword2(password) {
  return bcrypt2.hash(password, BCRYPT_ROUNDS2);
}
async function verifyPassword2(password, hash) {
  return bcrypt2.compare(password, hash);
}
function generateInviteToken2() {
  return crypto2.randomBytes(32).toString("hex");
}
function getInviteExpiryDate2() {
  return new Date(Date.now() + PORTAL_INVITE_EXPIRY_HOURS * 60 * 60 * 1e3);
}
function generateResetToken() {
  return crypto2.randomBytes(32).toString("hex");
}
function getResetExpiryDate() {
  return new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1e3);
}
function setPortalCookie(res, token) {
  res.cookie(PORTAL_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
}
function clearPortalCookie(res) {
  res.clearCookie(PORTAL_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });
}
function getPortalTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, ...vals] = cookie.trim().split("=");
      acc[key] = vals.join("=");
      return acc;
    },
    {}
  );
  return cookies[PORTAL_COOKIE_NAME] || null;
}
async function authenticatePortalRequest(req) {
  const token = getPortalTokenFromRequest(req);
  if (!token) return null;
  const payload = await verifyPortalToken(token);
  if (!payload) return null;
  const db = await getDb();
  if (!db) return null;
  const contacts = await db.select({
    id: customerContacts.id,
    customerId: customerContacts.customerId,
    email: customerContacts.email,
    contactName: customerContacts.contactName,
    portalRole: customerContacts.portalRole,
    isPortalActive: customerContacts.isPortalActive,
    hasPortalAccess: customerContacts.hasPortalAccess
  }).from(customerContacts).where(
    and(
      eq(customerContacts.id, parseInt(payload.sub)),
      eq(customerContacts.isPortalActive, true),
      eq(customerContacts.hasPortalAccess, true)
    )
  ).limit(1);
  if (contacts.length === 0) return null;
  const contact = contacts[0];
  const customerRows = await db.select({ companyName: customers.companyName, status: customers.status }).from(customers).where(eq(customers.id, contact.customerId)).limit(1);
  if (customerRows.length === 0 || customerRows[0].status !== "active") return null;
  return {
    contactId: contact.id,
    customerId: contact.customerId,
    email: contact.email,
    contactName: contact.contactName,
    portalRole: contact.portalRole || "viewer",
    companyName: customerRows[0].companyName
  };
}
var JWT_ISSUER2, JWT_AUDIENCE2, BCRYPT_ROUNDS2, RESET_TOKEN_EXPIRY_HOURS;
var init_portalAuth = __esm({
  "server/portal/portalAuth.ts"() {
    "use strict";
    init_env();
    init_const();
    init_db();
    init_schema();
    JWT_ISSUER2 = "gea-portal";
    JWT_AUDIENCE2 = "gea-portal-client";
    BCRYPT_ROUNDS2 = 12;
    RESET_TOKEN_EXPIRY_HOURS = 1;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import helmet from "helmet";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/authRoutes.ts
init_db();
import rateLimit from "express-rate-limit";

// server/_core/adminAuth.ts
init_const();
init_env();
import bcrypt from "bcryptjs";
import * as jose from "jose";
import crypto from "crypto";
import { parse as parseCookieHeader } from "cookie";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/adminAuth.ts
init_db();

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/adminAuth.ts
var JWT_ISSUER = "gea-admin";
var JWT_AUDIENCE = "gea-admin-client";
function getJwtSecret() {
  const secret = ENV.cookieSecret;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}
async function signAdminToken(payload) {
  const secret = getJwtSecret();
  return new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setIssuer(JWT_ISSUER).setAudience(JWT_AUDIENCE).setExpirationTime("365d").sign(secret);
}
async function verifyAdminToken(token) {
  try {
    const secret = getJwtSecret();
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });
    if (!payload.sub || !payload.email) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
var BCRYPT_ROUNDS = 12;
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
var INVITE_EXPIRY_HOURS = 72;
function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}
function getInviteExpiryDate() {
  return new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1e3);
}
function setAdminCookie(req, res, token) {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
}
function clearAdminCookie(req, res) {
  const cookieOptions = getSessionCookieOptions(req);
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
}
function getAdminTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[COOKIE_NAME] || null;
}
async function authenticateAdminRequest(req) {
  const token = getAdminTokenFromRequest(req);
  if (!token) {
    throw ForbiddenError("Missing session cookie");
  }
  const payload = await verifyAdminToken(token);
  if (!payload) {
    throw ForbiddenError("Invalid session token");
  }
  const userId = parseInt(payload.sub, 10);
  if (isNaN(userId)) {
    throw ForbiddenError("Invalid session payload");
  }
  const user = await getUserById(userId);
  if (!user) {
    throw ForbiddenError("User not found");
  }
  if (!user.isActive) {
    throw ForbiddenError("Account is deactivated");
  }
  await upsertUser({
    openId: user.openId,
    lastSignedIn: /* @__PURE__ */ new Date()
  });
  return user;
}

// server/_core/authRoutes.ts
function registerAuthRoutes(app) {
  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts. Please try again later." }
  });
  app.post("/api/auth/login", adminLoginLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }
      const user = await getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
      if (!user.isActive) {
        res.status(401).json({ error: "Account is deactivated" });
        return;
      }
      if (!user.passwordHash) {
        res.status(401).json({ error: "Account not activated. Please use your invite link to set a password." });
        return;
      }
      const passwordValid = await verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
      const payload = {
        sub: String(user.id),
        email: user.email || "",
        name: user.name || "",
        role: user.role,
        iss: "gea-admin"
      };
      const token = await signAdminToken(payload);
      setAdminCookie(req, res, token);
      await upsertUser({
        openId: user.openId,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    clearAdminCookie(req, res);
    res.json({ success: true });
  });
}

// server/routers.ts
init_const();

// server/_core/systemRouter.ts
init_notification();
import { z } from "zod";

// server/_core/trpc.ts
init_const();
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";

// shared/roles.ts
var ALL_ROLES = [
  "admin",
  "customer_manager",
  "operations_manager",
  "finance_manager",
  "user"
];
var MANAGER_ROLES = [
  "customer_manager",
  "operations_manager",
  "finance_manager"
];
var EXCLUSIVE_ROLES = ["admin", "user"];
function parseRoles(roleStr) {
  if (!roleStr) return ["user"];
  return roleStr.split(",").map((r) => r.trim()).filter(Boolean);
}
function serializeRoles(roles) {
  if (roles.length === 0) return "user";
  return roles.join(",");
}
function hasRole(roleStr, targetRole) {
  const roles = parseRoles(roleStr);
  return roles.includes(targetRole);
}
function hasAnyRole(roleStr, targetRoles) {
  const roles = parseRoles(roleStr);
  return targetRoles.some((r) => roles.includes(r));
}
function isAdmin(roleStr) {
  return hasRole(roleStr, "admin");
}
function validateRoles(roles) {
  if (roles.length === 0) return { valid: false, error: "At least one role is required" };
  const hasExclusive = roles.some((r) => EXCLUSIVE_ROLES.includes(r));
  const hasManager = roles.some((r) => MANAGER_ROLES.includes(r));
  if (hasExclusive && hasManager) {
    return {
      valid: false,
      error: `"admin" and "user" cannot be combined with manager roles`
    };
  }
  if (hasExclusive && roles.length > 1) {
    return {
      valid: false,
      error: `"admin" and "user" are exclusive roles and cannot be combined`
    };
  }
  return { valid: true };
}

// server/_core/trpc.ts
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || !isAdmin(ctx.user.role)) {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/customers.ts
import { z as z2 } from "zod";

// server/procedures.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (!isAdmin(ctx.user.role)) {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var customerManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "customer_manager"])) {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "Customer Manager access required"
    });
  }
  return next({ ctx });
});
var operationsManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "operations_manager"])) {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "Operations Manager access required"
    });
  }
  return next({ ctx });
});
var financeManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "finance_manager"])) {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "Finance Manager access required"
    });
  }
  return next({ ctx });
});
var userProcedure = protectedProcedure;

// server/routers/customers.ts
init_db();

// server/storage.ts
init_env();
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/routers/customers.ts
init_portalAuth();
import { TRPCError as TRPCError4 } from "@trpc/server";
var customersRouter = router({
  list: userProcedure.input(
    z2.object({
      status: z2.string().optional(),
      search: z2.string().optional(),
      limit: z2.number().default(50),
      offset: z2.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listCustomers(
      { status: input.status, search: input.search },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    return await getCustomerById(input.id);
  }),
  create: customerManagerProcedure.input(
    z2.object({
      companyName: z2.string().min(1),
      legalEntityName: z2.string().optional(),
      registrationNumber: z2.string().optional(),
      industry: z2.string().optional(),
      address: z2.string().optional(),
      city: z2.string().optional(),
      state: z2.string().optional(),
      country: z2.string(),
      postalCode: z2.string().optional(),
      primaryContactEmail: z2.string().email().optional(),
      primaryContactName: z2.string().optional(),
      primaryContactPhone: z2.string().optional(),
      paymentTermDays: z2.number().min(0).max(365).default(30),
      settlementCurrency: z2.string().default("USD"),
      language: z2.enum(["en", "zh"]).default("en"),
      billingEntityId: z2.number().optional(),
      depositMultiplier: z2.number().min(1).max(3).default(2),
      notes: z2.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.primaryContactEmail) {
      const existing = await getCustomerByEmail(input.primaryContactEmail);
      if (existing) {
        throw new TRPCError4({ code: "CONFLICT", message: `Email "${input.primaryContactEmail}" is already used by customer "${existing.companyName}"` });
      }
    }
    if (input.registrationNumber) {
      const allCustomers = await listCustomers({ search: input.registrationNumber }, 100, 0);
      const regDuplicate = allCustomers.data.find(
        (c) => c.registrationNumber === input.registrationNumber
      );
      if (regDuplicate) {
        throw new TRPCError4({
          code: "CONFLICT",
          message: `Registration number "${input.registrationNumber}" is already used by customer "${regDuplicate.companyName}" (${regDuplicate.clientCode}).`
        });
      }
    }
    const result = await createCustomer({ ...input, status: "active" });
    const customerId = result[0]?.insertId;
    if (customerId && input.primaryContactName) {
      await createCustomerContact({
        customerId,
        contactName: input.primaryContactName,
        email: input.primaryContactEmail || "",
        phone: input.primaryContactPhone || void 0,
        role: "Primary Contact",
        isPrimary: true,
        hasPortalAccess: false
      });
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "customer",
      changes: JSON.stringify(input)
    });
    return result;
  }),
  update: customerManagerProcedure.input(
    z2.object({
      id: z2.number(),
      data: z2.object({
        companyName: z2.string().optional(),
        legalEntityName: z2.string().optional(),
        registrationNumber: z2.string().optional(),
        industry: z2.string().optional(),
        address: z2.string().optional(),
        city: z2.string().optional(),
        state: z2.string().optional(),
        country: z2.string().optional(),
        postalCode: z2.string().optional(),
        primaryContactEmail: z2.string().optional(),
        primaryContactName: z2.string().optional(),
        primaryContactPhone: z2.string().optional(),
        paymentTermDays: z2.number().min(0).max(365).optional(),
        settlementCurrency: z2.string().optional(),
        language: z2.enum(["en", "zh"]).optional(),
        billingEntityId: z2.number().nullable().optional(),
        depositMultiplier: z2.number().min(1).max(3).optional(),
        status: z2.enum(["active", "suspended", "terminated"]).optional(),
        notes: z2.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    await updateCustomer(input.id, input.data);
    const primaryChanged = input.data.primaryContactName !== void 0 || input.data.primaryContactEmail !== void 0 || input.data.primaryContactPhone !== void 0;
    if (primaryChanged) {
      const contacts = await listCustomerContacts(input.id);
      const primaryContact = contacts.find((c) => c.isPrimary);
      if (primaryContact) {
        const syncData = {};
        if (input.data.primaryContactName !== void 0) syncData.contactName = input.data.primaryContactName;
        if (input.data.primaryContactEmail !== void 0) syncData.email = input.data.primaryContactEmail;
        if (input.data.primaryContactPhone !== void 0) syncData.phone = input.data.primaryContactPhone;
        await updateCustomerContact(primaryContact.id, syncData);
      }
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "customer",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  // ── Pricing sub-router ──────────────────────────────────────────────
  pricing: router({
    list: userProcedure.input(z2.object({ customerId: z2.number() })).query(async ({ input }) => {
      return await listCustomerPricing(input.customerId);
    }),
    // Single country pricing create - auto-deactivates old same-type pricing
    create: customerManagerProcedure.input(
      z2.object({
        customerId: z2.number(),
        pricingType: z2.enum(["global_discount", "country_specific"]),
        globalDiscountPercent: z2.string().optional(),
        countryCode: z2.string().optional(),
        serviceType: z2.enum(["eor", "visa_eor", "aor"]).optional(),
        fixedPrice: z2.string().optional(),
        currency: z2.string().default("USD"),
        effectiveFrom: z2.string(),
        // YYYY-MM-DD
        effectiveTo: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const existingPricing = await listCustomerPricing(input.customerId);
      for (const p of existingPricing) {
        if (!p.isActive) continue;
        if (input.pricingType === "global_discount" && p.pricingType === "global_discount") {
          await updateCustomerPricing(p.id, { isActive: false });
        } else if (input.pricingType === "country_specific" && p.pricingType === "country_specific" && p.countryCode === input.countryCode && p.serviceType === input.serviceType) {
          await updateCustomerPricing(p.id, { isActive: false });
        }
      }
      const result = await createCustomerPricing({
        customerId: input.customerId,
        pricingType: input.pricingType,
        globalDiscountPercent: input.globalDiscountPercent || void 0,
        countryCode: input.countryCode || void 0,
        serviceType: input.serviceType || void 0,
        fixedPrice: input.fixedPrice || void 0,
        currency: input.currency,
        effectiveFrom: /* @__PURE__ */ new Date(input.effectiveFrom + "T00:00:00Z"),
        effectiveTo: input.effectiveTo ? /* @__PURE__ */ new Date(input.effectiveTo + "T00:00:00Z") : void 0,
        isActive: true
      });
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "create",
        entityType: "customer_pricing",
        changes: JSON.stringify(input)
      });
      return result;
    }),
    // Batch create for multiple countries at once - auto-deactivates old same-type pricing
    batchCreate: customerManagerProcedure.input(
      z2.object({
        customerId: z2.number(),
        countryCodes: z2.array(z2.string()).min(1),
        serviceType: z2.enum(["eor", "visa_eor", "aor"]),
        fixedPrice: z2.string(),
        currency: z2.string().default("USD"),
        effectiveFrom: z2.string(),
        effectiveTo: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const existingPricing = await listCustomerPricing(input.customerId);
      for (const p of existingPricing) {
        if (!p.isActive) continue;
        if (p.pricingType === "country_specific" && p.serviceType === input.serviceType && input.countryCodes.includes(p.countryCode || "")) {
          await updateCustomerPricing(p.id, { isActive: false });
        }
      }
      const items = input.countryCodes.map((cc) => ({
        customerId: input.customerId,
        pricingType: "country_specific",
        countryCode: cc,
        serviceType: input.serviceType,
        fixedPrice: input.fixedPrice,
        currency: input.currency,
        effectiveFrom: /* @__PURE__ */ new Date(input.effectiveFrom + "T00:00:00Z"),
        effectiveTo: input.effectiveTo ? /* @__PURE__ */ new Date(input.effectiveTo + "T00:00:00Z") : void 0,
        isActive: true
      }));
      await batchCreateCustomerPricing(items);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "create",
        entityType: "customer_pricing",
        changes: JSON.stringify({ batch: true, count: items.length, ...input })
      });
      return { success: true, count: items.length };
    }),
    update: customerManagerProcedure.input(
      z2.object({
        id: z2.number(),
        data: z2.object({
          globalDiscountPercent: z2.string().optional(),
          fixedPrice: z2.string().optional(),
          currency: z2.string().optional(),
          effectiveTo: z2.string().optional(),
          isActive: z2.boolean().optional()
        })
      })
    ).mutation(async ({ input, ctx }) => {
      const updateData = { ...input.data };
      await updateCustomerPricing(input.id, updateData);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "customer_pricing",
        entityId: input.id,
        changes: JSON.stringify(input.data)
      });
      return { success: true };
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      await deleteCustomerPricing(input.id);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "customer_pricing",
        entityId: input.id
      });
      return { success: true };
    })
  }),
  // ── Contacts sub-router ─────────────────────────────────────────────
  contacts: router({
    list: userProcedure.input(z2.object({ customerId: z2.number() })).query(async ({ input }) => {
      return await listCustomerContacts(input.customerId);
    }),
    create: customerManagerProcedure.input(
      z2.object({
        customerId: z2.number(),
        contactName: z2.string().min(1),
        email: z2.string().email(),
        phone: z2.string().optional(),
        role: z2.string().optional(),
        isPrimary: z2.boolean().default(false),
        hasPortalAccess: z2.boolean().default(false)
      })
    ).mutation(async ({ input, ctx }) => {
      const result = await createCustomerContact(input);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "create",
        entityType: "customer_contact",
        changes: JSON.stringify(input)
      });
      return result;
    }),
    update: customerManagerProcedure.input(
      z2.object({
        id: z2.number(),
        customerId: z2.number(),
        // needed for primary contact sync
        data: z2.object({
          contactName: z2.string().optional(),
          email: z2.string().optional(),
          phone: z2.string().optional(),
          role: z2.string().optional(),
          isPrimary: z2.boolean().optional(),
          hasPortalAccess: z2.boolean().optional()
        })
      })
    ).mutation(async ({ input, ctx }) => {
      if (input.data.isPrimary === true) {
        const contacts = await listCustomerContacts(input.customerId);
        for (const c of contacts) {
          if (c.isPrimary && c.id !== input.id) {
            await updateCustomerContact(c.id, { isPrimary: false });
          }
        }
      }
      await updateCustomerContact(input.id, input.data);
      if (input.data.isPrimary === true) {
        const contacts = await listCustomerContacts(input.customerId);
        const updatedContact = contacts.find((c) => c.id === input.id);
        if (updatedContact) {
          await updateCustomer(input.customerId, {
            primaryContactName: updatedContact.contactName,
            primaryContactEmail: updatedContact.email,
            primaryContactPhone: updatedContact.phone || void 0
          });
        }
      } else if (input.data.isPrimary === void 0) {
        const contacts = await listCustomerContacts(input.customerId);
        const thisContact = contacts.find((c) => c.id === input.id);
        if (thisContact && thisContact.isPrimary) {
          const syncData = {};
          if (input.data.contactName) syncData.primaryContactName = input.data.contactName;
          if (input.data.email) syncData.primaryContactEmail = input.data.email;
          if (input.data.phone !== void 0) syncData.primaryContactPhone = input.data.phone;
          if (Object.keys(syncData).length > 0) {
            await updateCustomer(input.customerId, syncData);
          }
        }
      }
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "customer_contact",
        entityId: input.id,
        changes: JSON.stringify(input.data)
      });
      return { success: true };
    }),
    delete: customerManagerProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      await deleteCustomerContact(input.id);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "customer_contact",
        entityId: input.id
      });
      return { success: true };
    }),
    /**
     * Generate a portal invite for a contact.
     * Sets inviteToken, inviteExpiresAt, hasPortalAccess, portalRole.
     * Returns the invite token so the admin can share the link.
     */
    generatePortalInvite: customerManagerProcedure.input(
      z2.object({
        contactId: z2.number(),
        portalRole: z2.enum(["admin", "hr_manager", "finance", "viewer"]).default("viewer")
      })
    ).mutation(async ({ input, ctx }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { customerContacts: ccTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eqOp } = await import("drizzle-orm");
      const db = await getDb2();
      if (!db) throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const existing = await db.select().from(ccTable).where(eqOp(ccTable.id, input.contactId)).limit(1);
      if (existing.length === 0) {
        throw new TRPCError4({ code: "NOT_FOUND", message: "Contact not found" });
      }
      const contact = existing[0];
      if (contact.isPortalActive && contact.passwordHash) {
        throw new TRPCError4({ code: "BAD_REQUEST", message: "This contact already has an active portal account" });
      }
      const inviteToken = generateInviteToken2();
      const inviteExpiresAt = getInviteExpiryDate2();
      await updateCustomerContact(input.contactId, {
        inviteToken,
        inviteExpiresAt,
        hasPortalAccess: true,
        portalRole: input.portalRole,
        isPortalActive: false
        // Will become true after registration
      });
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "customer_contact",
        entityId: input.contactId,
        changes: JSON.stringify({ action: "portal_invite", portalRole: input.portalRole })
      });
      return {
        success: true,
        inviteToken,
        contactName: contact.contactName,
        email: contact.email
      };
    }),
    /**
     * Revoke portal access for a contact.
     */
    revokePortalAccess: customerManagerProcedure.input(z2.object({ contactId: z2.number() })).mutation(async ({ input, ctx }) => {
      await updateCustomerContact(input.contactId, {
        hasPortalAccess: false,
        isPortalActive: false,
        inviteToken: null,
        inviteExpiresAt: null
      });
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "customer_contact",
        entityId: input.contactId,
        changes: JSON.stringify({ action: "portal_revoke" })
      });
      return { success: true };
    }),
    /**
     * Admin reset password for a portal contact.
     * Sets a new password directly without requiring the old one.
     */
    resetPassword: adminProcedure2.input(
      z2.object({
        contactId: z2.number(),
        newPassword: z2.string().min(8, "Password must be at least 8 characters")
      })
    ).mutation(async ({ input, ctx }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { customerContacts: ccTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eqOp } = await import("drizzle-orm");
      const db = await getDb2();
      if (!db) throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const existing = await db.select().from(ccTable).where(eqOp(ccTable.id, input.contactId)).limit(1);
      if (existing.length === 0) {
        throw new TRPCError4({ code: "NOT_FOUND", message: "Contact not found" });
      }
      const contact = existing[0];
      if (!contact.hasPortalAccess) {
        throw new TRPCError4({ code: "BAD_REQUEST", message: "This contact does not have portal access" });
      }
      const passwordHash = await hashPassword2(input.newPassword);
      await db.update(ccTable).set({
        passwordHash,
        resetToken: null,
        resetExpiresAt: null
      }).where(eqOp(ccTable.id, input.contactId));
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "customer_contact",
        entityId: input.contactId,
        changes: JSON.stringify({ action: "admin_reset_password" })
      });
      return { success: true, contactName: contact.contactName, email: contact.email };
    })
  }),
  // ── Contracts sub-router ────────────────────────────────────────────
  contracts: router({
    list: userProcedure.input(z2.object({ customerId: z2.number() })).query(async ({ input }) => {
      return await listCustomerContracts(input.customerId);
    }),
    upload: customerManagerProcedure.input(
      z2.object({
        customerId: z2.number(),
        contractName: z2.string().min(1),
        contractType: z2.string().optional(),
        signedDate: z2.string().optional(),
        effectiveDate: z2.string().optional(),
        expiryDate: z2.string().optional(),
        fileBase64: z2.string(),
        // base64-encoded file content
        fileName: z2.string(),
        mimeType: z2.string().default("application/pdf")
      })
    ).mutation(async ({ input, ctx }) => {
      const fileBuffer = Buffer.from(input.fileBase64, "base64");
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `contracts/${input.customerId}/${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
      const result = await createCustomerContract({
        customerId: input.customerId,
        contractName: input.contractName,
        contractType: input.contractType || void 0,
        fileUrl: url,
        fileKey,
        signedDate: input.signedDate ? /* @__PURE__ */ new Date(input.signedDate + "T00:00:00Z") : void 0,
        effectiveDate: input.effectiveDate ? /* @__PURE__ */ new Date(input.effectiveDate + "T00:00:00Z") : void 0,
        expiryDate: input.expiryDate ? /* @__PURE__ */ new Date(input.expiryDate + "T00:00:00Z") : void 0,
        status: "signed"
      });
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "create",
        entityType: "customer_contract",
        changes: JSON.stringify({ contractName: input.contractName, fileName: input.fileName })
      });
      return { success: true, url };
    }),
    update: customerManagerProcedure.input(
      z2.object({
        id: z2.number(),
        data: z2.object({
          contractName: z2.string().optional(),
          contractType: z2.string().optional(),
          signedDate: z2.string().optional(),
          effectiveDate: z2.string().optional(),
          expiryDate: z2.string().optional(),
          status: z2.enum(["draft", "signed", "expired", "terminated"]).optional()
        })
      })
    ).mutation(async ({ input, ctx }) => {
      const updateData = { ...input.data };
      if (input.data.signedDate) updateData.signedDate = /* @__PURE__ */ new Date(input.data.signedDate + "T00:00:00Z");
      if (input.data.effectiveDate) updateData.effectiveDate = /* @__PURE__ */ new Date(input.data.effectiveDate + "T00:00:00Z");
      if (input.data.expiryDate) updateData.expiryDate = /* @__PURE__ */ new Date(input.data.expiryDate + "T00:00:00Z");
      await updateCustomerContract(input.id, updateData);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "customer_contract",
        entityId: input.id,
        changes: JSON.stringify(input.data)
      });
      return { success: true };
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      await deleteCustomerContract(input.id);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "customer_contract",
        entityId: input.id
      });
      return { success: true };
    })
  }),
  // Admin impersonation: generate a short-lived portal token for a customer's primary contact
  generatePortalToken: adminProcedure2.input(z2.object({ customerId: z2.number() })).mutation(async ({ input, ctx }) => {
    const contacts = await listCustomerContacts(input.customerId);
    const portalContact = contacts.find((c) => c.isPortalActive && c.hasPortalAccess) || contacts.find((c) => c.hasPortalAccess);
    if (!portalContact) {
      throw new TRPCError4({ code: "NOT_FOUND", message: "No portal-enabled contact found for this customer. Please invite a contact first." });
    }
    const customer = await getCustomerById(input.customerId);
    if (!customer) {
      throw new TRPCError4({ code: "NOT_FOUND", message: "Customer not found" });
    }
    const payload = {
      sub: String(portalContact.id),
      customerId: input.customerId,
      email: portalContact.email,
      portalRole: portalContact.portalRole || "admin",
      iss: "gea-portal"
    };
    const token = await signPortalToken(payload);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "portal_impersonate",
      entityType: "customer",
      entityId: input.customerId,
      changes: JSON.stringify({ contactId: portalContact.id, contactEmail: portalContact.email })
    });
    return { token, contactEmail: portalContact.email, contactName: portalContact.contactName };
  })
});

// server/routers/employees.ts
import { TRPCError as TRPCError5 } from "@trpc/server";
import { z as z3 } from "zod";
init_db();

// server/services/depositInvoiceService.ts
init_db();
init_schema();
import { eq as eq4, and as and4 } from "drizzle-orm";

// server/services/invoiceNumberService.ts
init_db();
init_schema();
import { like } from "drizzle-orm";
async function generateInvoiceNumber(billingEntityId, invoiceMonth) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let yearMonth;
  if (typeof invoiceMonth === "string") {
    yearMonth = invoiceMonth.slice(0, 7).replace("-", "");
  } else {
    yearMonth = invoiceMonth.toISOString().slice(0, 7).replace("-", "");
  }
  let prefix = "INV-";
  if (billingEntityId) {
    const be = await getBillingEntityById(billingEntityId);
    if (be?.invoicePrefix) {
      prefix = be.invoicePrefix;
      if (!prefix.endsWith("-") && !prefix.endsWith("_")) {
        prefix += "-";
      }
    }
  }
  const pattern = `${prefix}${yearMonth}-%`;
  const existing = await db.select({ invoiceNumber: invoices.invoiceNumber }).from(invoices).where(like(invoices.invoiceNumber, pattern));
  let maxSeq = 0;
  for (const row of existing) {
    const parts = row.invoiceNumber.split("-");
    const lastPart = parts[parts.length - 1];
    const seq = parseInt(lastPart, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }
  const nextSeq = maxSeq + 1;
  const seqStr = nextSeq.toString().padStart(3, "0");
  return `${prefix}${yearMonth}-${seqStr}`;
}
async function generateDepositInvoiceNumber(billingEntityId, date2) {
  const d = date2 || /* @__PURE__ */ new Date();
  const yearMonth = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let prefix = "DEP-";
  if (billingEntityId) {
    const be = await getBillingEntityById(billingEntityId);
    if (be?.invoicePrefix) {
      prefix = be.invoicePrefix.replace(/-$/, "") + "-DEP-";
    }
  }
  const pattern = `${prefix}${yearMonth}-%`;
  const existing = await db.select({ invoiceNumber: invoices.invoiceNumber }).from(invoices).where(like(invoices.invoiceNumber, pattern));
  let maxSeq = 0;
  for (const row of existing) {
    const parts = row.invoiceNumber.split("-");
    const lastPart = parts[parts.length - 1];
    const seq = parseInt(lastPart, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }
  const nextSeq = maxSeq + 1;
  const seqStr = nextSeq.toString().padStart(3, "0");
  return `${prefix}${yearMonth}-${seqStr}`;
}

// server/services/exchangeRateService.ts
init_db();
init_schema();
import { eq as eq3, and as and3, desc } from "drizzle-orm";
async function getGlobalMarkup() {
  try {
    const db = await getDb();
    if (!db) return 5;
    const result = await db.select().from(systemConfig).where(eq3(systemConfig.configKey, "exchange_rate_markup_percentage")).limit(1);
    if (result.length > 0) {
      return parseFloat(result[0].configValue) || 5;
    }
  } catch {
  }
  return 5;
}
async function getExchangeRate(fromCurrency, toCurrency, effectiveDate) {
  if (fromCurrency === toCurrency) {
    return { rate: 1, rateWithMarkup: 1, markupPercentage: 0 };
  }
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(exchangeRates).where(
    and3(
      eq3(exchangeRates.fromCurrency, fromCurrency),
      eq3(exchangeRates.toCurrency, toCurrency)
    )
  ).orderBy(desc(exchangeRates.effectiveDate)).limit(1);
  if (result.length > 0) {
    const rate = parseFloat(result[0].rate.toString());
    const rateWithMarkup = parseFloat(result[0].rateWithMarkup.toString());
    const markupPercentage = parseFloat(result[0].markupPercentage.toString());
    return { rate, rateWithMarkup, markupPercentage };
  }
  const inverse = await db.select().from(exchangeRates).where(
    and3(
      eq3(exchangeRates.fromCurrency, toCurrency),
      eq3(exchangeRates.toCurrency, fromCurrency)
    )
  ).orderBy(desc(exchangeRates.effectiveDate)).limit(1);
  if (inverse.length > 0) {
    const rawRate = parseFloat(inverse[0].rate.toString());
    const markupPercentage = parseFloat(inverse[0].markupPercentage.toString());
    const inverseRate = 1 / rawRate;
    const inverseRateWithMarkup = 1 / (rawRate * (1 - markupPercentage / 100));
    return { rate: inverseRate, rateWithMarkup: inverseRateWithMarkup, markupPercentage };
  }
  return null;
}
async function upsertExchangeRate(fromCurrency, toCurrency, rate, effectiveDate, source, markupPercentage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const markup = markupPercentage ?? await getGlobalMarkup();
  const rateWithMarkup = rate * (1 - markup / 100);
  const data = {
    fromCurrency,
    toCurrency,
    rate: rate.toString(),
    rateWithMarkup: rateWithMarkup.toString(),
    markupPercentage: markup.toString(),
    source,
    effectiveDate
  };
  try {
    await db.insert(exchangeRates).values(data).onDuplicateKeyUpdate({
      set: {
        rate: rate.toString(),
        rateWithMarkup: rateWithMarkup.toString(),
        markupPercentage: markup.toString(),
        source
      }
    });
  } catch (error) {
    console.error("[ExchangeRateService] Failed to upsert rate:", error);
    throw error;
  }
}
async function initializeDefaultRates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const markup = await getGlobalMarkup();
  const defaultRates = [
    { to: "EUR", rate: 0.92 },
    { to: "GBP", rate: 0.79 },
    { to: "JPY", rate: 150.5 },
    { to: "CNY", rate: 7.24 },
    { to: "SGD", rate: 1.34 },
    { to: "HKD", rate: 7.82 },
    { to: "AUD", rate: 1.56 },
    { to: "CAD", rate: 1.35 },
    { to: "CHF", rate: 0.88 }
  ];
  try {
    for (const pair of defaultRates) {
      await upsertExchangeRate("USD", pair.to, pair.rate, today, "system_default", markup);
    }
    console.log("[ExchangeRateService] Default rates initialized");
  } catch (error) {
    console.error("[ExchangeRateService] Failed to initialize default rates:", error);
  }
}

// server/services/depositInvoiceService.ts
async function hasDepositInvoice(employeeId) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select({ id: invoiceItems.id, invoiceId: invoiceItems.invoiceId, status: invoices.status }).from(invoiceItems).innerJoin(invoices, eq4(invoiceItems.invoiceId, invoices.id)).where(
    and4(
      eq4(invoiceItems.employeeId, employeeId),
      eq4(invoiceItems.itemType, "deposit"),
      eq4(invoices.invoiceType, "deposit")
    )
  ).limit(10);
  const activeDeposits = existing.filter(
    (row) => row.status !== "cancelled"
  );
  if (activeDeposits.length === 0) return false;
  for (const deposit of activeDeposits) {
    const refunds = await db.select({ id: invoices.id, status: invoices.status }).from(invoices).where(
      and4(
        eq4(invoices.relatedInvoiceId, deposit.invoiceId),
        eq4(invoices.invoiceType, "deposit_refund")
      )
    );
    const hasActiveRefund = refunds.some(
      (r) => r.status !== "cancelled"
    );
    if (hasActiveRefund) continue;
    const creditNotes = await db.select({ id: invoices.id, status: invoices.status }).from(invoices).where(
      and4(
        eq4(invoices.relatedInvoiceId, deposit.invoiceId),
        eq4(invoices.invoiceType, "credit_note")
      )
    );
    const hasActiveCreditNote = creditNotes.some(
      (cn) => cn.status !== "cancelled"
    );
    if (hasActiveCreditNote) continue;
    return true;
  }
  return false;
}
async function generateDepositInvoice(employeeId) {
  const db = await getDb();
  if (!db) return { invoiceId: null, message: "Database not available" };
  try {
    const exists = await hasDepositInvoice(employeeId);
    if (exists) {
      return { invoiceId: null, message: "Deposit invoice already exists for this employee" };
    }
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      return { invoiceId: null, message: "Employee not found" };
    }
    const customer = await getCustomerById(employee.customerId);
    if (!customer) {
      return { invoiceId: null, message: "Customer not found" };
    }
    const baseSalary = parseFloat(employee.baseSalary?.toString() ?? "0");
    const estimatedEmployerCost = parseFloat(employee.estimatedEmployerCost?.toString() ?? "0");
    const monthlyTotal = baseSalary + estimatedEmployerCost;
    const depositMultiplier = customer.depositMultiplier || 2;
    let depositAmount = monthlyTotal * depositMultiplier;
    const employeeCurrency = employee.salaryCurrency || "USD";
    const settlementCurrency = customer.settlementCurrency || "USD";
    let exchangeRate = 1;
    let exchangeRateWithMarkup = 1;
    let localAmount = depositAmount;
    if (employeeCurrency !== settlementCurrency) {
      const rateData = await getExchangeRate(employeeCurrency, settlementCurrency);
      if (rateData) {
        exchangeRate = rateData.rate;
        exchangeRateWithMarkup = rateData.rateWithMarkup;
        localAmount = depositAmount;
        depositAmount = depositAmount * exchangeRateWithMarkup;
      }
    }
    const billingEntityId = customer.billingEntityId || null;
    const invoiceNumber = await generateDepositInvoiceNumber(billingEntityId);
    let dueDate;
    if (employee.startDate) {
      dueDate = new Date(employee.startDate);
      dueDate.setDate(dueDate.getDate() - 1);
    } else {
      dueDate = /* @__PURE__ */ new Date();
      dueDate.setDate(dueDate.getDate() + 30);
    }
    const invoiceData = {
      customerId: employee.customerId,
      billingEntityId,
      invoiceNumber,
      invoiceType: "deposit",
      currency: settlementCurrency,
      exchangeRate: exchangeRate.toFixed(6),
      exchangeRateWithMarkup: exchangeRateWithMarkup.toFixed(6),
      subtotal: depositAmount.toFixed(2),
      serviceFeeTotal: "0",
      tax: "0",
      total: depositAmount.toFixed(2),
      status: "draft",
      dueDate,
      notes: `Deposit invoice for employee ${employee.firstName} ${employee.lastName} (${employee.employeeCode}). Deposit = (${baseSalary} + ${estimatedEmployerCost}) \xD7 ${depositMultiplier} = ${localAmount.toFixed(2)} ${employeeCurrency}${employeeCurrency !== settlementCurrency ? ` \u2192 ${depositAmount.toFixed(2)} ${settlementCurrency}` : ""}`
    };
    const invoiceResult = await db.insert(invoices).values(invoiceData);
    const invoiceId = invoiceResult[0]?.insertId;
    const lineItem = {
      invoiceId,
      employeeId,
      description: `Deposit - ${employee.employeeCode || ""} ${employee.firstName} ${employee.lastName}`,
      quantity: "1",
      unitPrice: depositAmount.toFixed(2),
      amount: depositAmount.toFixed(2),
      itemType: "deposit",
      countryCode: employee.country,
      localCurrency: employeeCurrency !== settlementCurrency ? employeeCurrency : void 0,
      localAmount: employeeCurrency !== settlementCurrency ? localAmount.toFixed(2) : void 0,
      exchangeRate: employeeCurrency !== settlementCurrency ? exchangeRate.toFixed(6) : void 0,
      exchangeRateWithMarkup: employeeCurrency !== settlementCurrency ? exchangeRateWithMarkup.toFixed(6) : void 0
    };
    await db.insert(invoiceItems).values(lineItem);
    return {
      invoiceId,
      message: `Deposit invoice ${invoiceNumber} created for ${employee.firstName} ${employee.lastName} (${depositAmount.toFixed(2)} ${settlementCurrency})`
    };
  } catch (error) {
    console.error("[DepositInvoice] Error generating deposit invoice:", error);
    return {
      invoiceId: null,
      message: `Failed to generate deposit invoice: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

// server/services/depositRefundService.ts
init_db();
init_schema();
init_db();
import { eq as eq5, and as and5 } from "drizzle-orm";
async function findDepositInvoice(employeeId) {
  const db = await getDb();
  if (!db) return null;
  const items = await db.select({
    invoiceId: invoiceItems.invoiceId
  }).from(invoiceItems).where(
    and5(
      eq5(invoiceItems.employeeId, employeeId),
      eq5(invoiceItems.itemType, "deposit")
    )
  );
  if (items.length === 0) return null;
  const invoice = await db.select().from(invoices).where(
    and5(
      eq5(invoices.id, items[0].invoiceId),
      eq5(invoices.invoiceType, "deposit")
    )
  );
  return invoice.length > 0 ? invoice[0] : null;
}
async function hasDepositRefund(employeeId) {
  const db = await getDb();
  if (!db) return false;
  const items = await db.select({ invoiceId: invoiceItems.invoiceId }).from(invoiceItems).where(
    and5(
      eq5(invoiceItems.employeeId, employeeId),
      eq5(invoiceItems.itemType, "deposit")
    )
  );
  if (items.length === 0) return false;
  for (const item of items) {
    const inv = await db.select({ invoiceType: invoices.invoiceType, status: invoices.status }).from(invoices).where(eq5(invoices.id, item.invoiceId));
    if (inv.length > 0 && inv[0].invoiceType === "deposit_refund" && inv[0].status !== "cancelled") {
      return true;
    }
  }
  return false;
}
async function generateDepositRefund(employeeId) {
  const db = await getDb();
  if (!db) return { invoiceId: null, message: "Database not available" };
  try {
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      return { invoiceId: null, message: "Employee not found" };
    }
    if (employee.status !== "terminated") {
      return { invoiceId: null, message: "Employee must be in 'terminated' status before generating a deposit refund" };
    }
    const exists = await hasDepositRefund(employeeId);
    if (exists) {
      return { invoiceId: null, message: "Deposit refund already exists for this employee" };
    }
    const depositInvoice = await findDepositInvoice(employeeId);
    if (!depositInvoice) {
      return { invoiceId: null, message: "No deposit invoice found for this employee" };
    }
    const existingCreditNotes = await db.select({ id: invoices.id, status: invoices.status }).from(invoices).where(
      and5(
        eq5(invoices.relatedInvoiceId, depositInvoice.id),
        eq5(invoices.invoiceType, "credit_note")
      )
    );
    const hasActiveCreditNote = existingCreditNotes.some(
      (cn) => cn.status !== "cancelled"
    );
    if (hasActiveCreditNote) {
      return {
        invoiceId: null,
        message: "This deposit has already been converted to a credit note. Cannot create a refund for a deposit that has been credited (refund and credit note are mutually exclusive)."
      };
    }
    const customer = await getCustomerById(employee.customerId);
    if (!customer) {
      return { invoiceId: null, message: "Customer not found" };
    }
    const refundAmount = parseFloat(depositInvoice.total?.toString() ?? "0");
    const originalCurrency = depositInvoice.currency || "USD";
    const billingEntityId = depositInvoice.billingEntityId || customer.billingEntityId || null;
    const invoiceNumber = await generateDepositInvoiceNumber(billingEntityId);
    const dueDate = null;
    const invoiceData = {
      customerId: employee.customerId,
      billingEntityId,
      invoiceNumber,
      invoiceType: "deposit_refund",
      currency: originalCurrency,
      exchangeRate: depositInvoice.exchangeRate?.toString() || "1",
      exchangeRateWithMarkup: depositInvoice.exchangeRateWithMarkup?.toString() || "1",
      subtotal: (-refundAmount).toFixed(2),
      serviceFeeTotal: "0",
      tax: "0",
      total: (-refundAmount).toFixed(2),
      status: "draft",
      dueDate,
      relatedInvoiceId: depositInvoice.id,
      invoiceMonth: /* @__PURE__ */ new Date(),
      notes: `Deposit refund for terminated employee ${employee.firstName} ${employee.lastName} (${employee.employeeCode}). Original deposit: ${depositInvoice.invoiceNumber}`
    };
    const invoiceResult = await db.insert(invoices).values(invoiceData);
    const invoiceId = invoiceResult[0]?.insertId;
    const lineItem = {
      invoiceId,
      employeeId,
      description: `Deposit Refund - ${employee.employeeCode || ""} ${employee.firstName} ${employee.lastName}`,
      quantity: "1",
      unitPrice: (-refundAmount).toFixed(2),
      amount: (-refundAmount).toFixed(2),
      itemType: "deposit",
      countryCode: employee.country
    };
    await db.insert(invoiceItems).values(lineItem);
    return {
      invoiceId,
      message: `Deposit refund invoice ${invoiceNumber} created for ${employee.firstName} ${employee.lastName} (${(-refundAmount).toFixed(2)} ${originalCurrency})`
    };
  } catch (error) {
    console.error("[DepositRefund] Error generating deposit refund:", error);
    return {
      invoiceId: null,
      message: `Failed to generate deposit refund: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

// server/services/visaServiceInvoiceService.ts
init_db();
init_schema();
import { eq as eq6 } from "drizzle-orm";
async function generateVisaServiceInvoice(employeeId) {
  const db = await getDb();
  if (!db) {
    return { invoiceId: null, message: "Database not available" };
  }
  try {
    const empData = await db.select().from(employees).where(eq6(employees.id, employeeId)).limit(1);
    if (empData.length === 0) {
      return { invoiceId: null, message: "Employee not found" };
    }
    const emp = empData[0];
    if (emp.serviceType !== "visa_eor") {
      return { invoiceId: null, message: "Employee is not a Visa EOR employee" };
    }
    const custData = await db.select().from(customers).where(eq6(customers.id, emp.customerId)).limit(1);
    if (custData.length === 0) {
      return { invoiceId: null, message: "Customer not found" };
    }
    const customer = custData[0];
    const settlementCurrency = customer.settlementCurrency || "USD";
    const countryConfig = await getCountryConfig(emp.country);
    if (!countryConfig) {
      return { invoiceId: null, message: `Country config not found for ${emp.country}` };
    }
    const visaSetupFee = parseFloat(countryConfig.visaEorSetupFee?.toString() ?? "0");
    if (visaSetupFee <= 0) {
      return { invoiceId: null, message: `No Visa Setup Fee configured for ${emp.country}` };
    }
    const rateCurrency = countryConfig.standardRateCurrency || "USD";
    let exchangeRate = 1;
    let rateWithMarkup = 1;
    let feeInSettlement = visaSetupFee;
    if (rateCurrency !== settlementCurrency) {
      const rateData = await getExchangeRate(rateCurrency, settlementCurrency);
      if (rateData) {
        exchangeRate = rateData.rate;
        rateWithMarkup = rateData.rateWithMarkup;
        feeInSettlement = visaSetupFee * rateWithMarkup;
      }
    }
    const vatRate = 0;
    const taxAmount = 0;
    const totalAmount = feeInSettlement;
    const billingEntityId = customer.billingEntityId || null;
    const invoiceNumber = await generateInvoiceNumber(billingEntityId, /* @__PURE__ */ new Date());
    const issueDate = /* @__PURE__ */ new Date();
    const termDays = customer.paymentTermDays || 30;
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + termDays);
    const empCode = emp.employeeCode || `EMP${emp.id}`;
    const empName = `${emp.firstName} ${emp.lastName}`;
    const invoiceData = {
      customerId: customer.id,
      billingEntityId,
      invoiceNumber,
      invoiceType: "visa_service",
      currency: settlementCurrency,
      exchangeRate: exchangeRate.toString(),
      exchangeRateWithMarkup: rateWithMarkup.toString(),
      subtotal: totalAmount.toFixed(2),
      serviceFeeTotal: "0.00",
      tax: taxAmount.toFixed(2),
      total: totalAmount.toFixed(2),
      status: "draft",
      dueDate,
      notes: `Visa & Immigration Service Fee for ${empCode} ${empName}`
    };
    const invoiceInsertResult = await db.insert(invoices).values(invoiceData);
    const invoiceId = invoiceInsertResult[0]?.insertId;
    const lineItem = {
      invoiceId,
      employeeId,
      description: `${empCode} ${empName}`,
      quantity: "1",
      unitPrice: feeInSettlement.toFixed(2),
      amount: totalAmount.toFixed(2),
      itemType: "visa_immigration_fee",
      vatRate: vatRate.toFixed(2),
      countryCode: emp.country,
      localCurrency: rateCurrency,
      localAmount: visaSetupFee.toFixed(2),
      exchangeRate: exchangeRate.toString(),
      exchangeRateWithMarkup: rateWithMarkup.toString()
    };
    await db.insert(invoiceItems).values(lineItem);
    return {
      invoiceId,
      message: `Visa Service Invoice generated for ${empCode} ${empName}`
    };
  } catch (error) {
    console.error("[VisaServiceInvoice] Error generating invoice:", error);
    return {
      invoiceId: null,
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// server/routers/employees.ts
init_schema();
import { eq as eq7, desc as desc2, and as and6 } from "drizzle-orm";
var employeesRouter = router({
  list: userProcedure.input(
    z3.object({
      customerId: z3.number().optional(),
      status: z3.string().optional(),
      country: z3.string().optional(),
      serviceType: z3.string().optional(),
      search: z3.string().optional(),
      limit: z3.number().default(50),
      offset: z3.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listEmployees(
      {
        customerId: input.customerId,
        status: input.status,
        country: input.country,
        serviceType: input.serviceType,
        search: input.search
      },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    return await getEmployeeById(input.id);
  }),
  create: customerManagerProcedure.input(
    z3.object({
      customerId: z3.number(),
      firstName: z3.string().min(1),
      lastName: z3.string().min(1),
      email: z3.string().email(),
      phone: z3.string().optional(),
      dateOfBirth: z3.string().optional(),
      gender: z3.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
      nationality: z3.string().optional(),
      idNumber: z3.string().optional(),
      idType: z3.string().optional(),
      address: z3.string().optional(),
      city: z3.string().optional(),
      state: z3.string().optional(),
      country: z3.string(),
      postalCode: z3.string().optional(),
      department: z3.string().optional(),
      jobTitle: z3.string(),
      serviceType: z3.enum(["eor", "visa_eor", "aor"]).default("eor"),
      employmentType: z3.enum(["fixed_term", "long_term"]).default("long_term"),
      startDate: z3.string(),
      endDate: z3.string().optional(),
      baseSalary: z3.string(),
      salaryCurrency: z3.string().default("USD"),
      estimatedEmployerCost: z3.string().optional(),
      requiresVisa: z3.boolean().default(false)
    })
  ).mutation(async ({ input, ctx }) => {
    const normalizedEmail = input.email.toLowerCase().trim();
    const existingByEmail = await listEmployees(
      { customerId: input.customerId, search: normalizedEmail },
      100,
      0
    );
    const emailDuplicate = existingByEmail.data.find(
      (e) => e.email?.toLowerCase() === normalizedEmail && e.status !== "terminated"
    );
    if (emailDuplicate) {
      throw new TRPCError5({
        code: "CONFLICT",
        message: `An active employee with email "${normalizedEmail}" already exists under this customer (${emailDuplicate.employeeCode}).`
      });
    }
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(input.startDate);
    if (startDate < today) {
      throw new TRPCError5({ code: "BAD_REQUEST", message: "Start date cannot be earlier than today." });
    }
    if (input.endDate) {
      const endDate = new Date(input.endDate);
      if (endDate <= startDate) {
        throw new TRPCError5({ code: "BAD_REQUEST", message: "Contract end date must be after the start date." });
      }
    }
    let requiresVisa = input.requiresVisa;
    let serviceType = input.serviceType;
    if (input.nationality && input.country) {
      const natUpper = input.nationality.toUpperCase();
      const countryUpper = input.country.toUpperCase();
      if (natUpper !== countryUpper) {
        requiresVisa = true;
        if (serviceType === "eor") {
          serviceType = "visa_eor";
        }
      }
    }
    if (serviceType === "visa_eor") {
      requiresVisa = true;
    }
    let salaryCurrency = input.salaryCurrency;
    const countryConfig = await getCountryConfig(input.country);
    if (countryConfig) {
      salaryCurrency = countryConfig.localCurrency;
    }
    const result = await createEmployee({
      ...input,
      email: normalizedEmail,
      serviceType,
      salaryCurrency,
      requiresVisa,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : void 0,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : void 0,
      status: "pending_review",
      visaStatus: requiresVisa ? "pending_application" : "not_required"
    });
    const insertId = result[0]?.insertId ?? result.insertId;
    if (insertId && input.country) {
      try {
        await initializeLeaveBalancesForEmployee(insertId, input.country, (/* @__PURE__ */ new Date()).getFullYear(), input.customerId);
      } catch (e) {
        console.error("Failed to initialize leave balances:", e);
      }
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "employee",
      changes: JSON.stringify(input)
    });
    return result;
  }),
  update: customerManagerProcedure.input(
    z3.object({
      id: z3.number(),
      data: z3.object({
        firstName: z3.string().optional(),
        lastName: z3.string().optional(),
        email: z3.string().optional(),
        phone: z3.string().optional(),
        dateOfBirth: z3.string().optional(),
        gender: z3.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
        nationality: z3.string().optional(),
        idNumber: z3.string().optional(),
        idType: z3.string().optional(),
        address: z3.string().optional(),
        city: z3.string().optional(),
        state: z3.string().optional(),
        country: z3.string().optional(),
        postalCode: z3.string().optional(),
        department: z3.string().optional(),
        jobTitle: z3.string().optional(),
        serviceType: z3.enum(["eor", "visa_eor", "aor"]).optional(),
        employmentType: z3.enum(["fixed_term", "long_term"]).optional(),
        baseSalary: z3.string().optional(),
        salaryCurrency: z3.string().optional(),
        estimatedEmployerCost: z3.string().optional(),
        // Allow any status transition (rollback capability)
        status: z3.enum(["pending_review", "documents_incomplete", "onboarding", "contract_signed", "active", "on_leave", "offboarding", "terminated"]).optional(),
        startDate: z3.string().optional(),
        endDate: z3.string().optional(),
        requiresVisa: z3.boolean().optional(),
        visaStatus: z3.enum(["not_required", "pending_application", "application_submitted", "approved", "rejected", "expired"]).optional(),
        visaExpiryDate: z3.string().optional(),
        visaNotes: z3.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.data.endDate && input.data.startDate) {
      if (new Date(input.data.endDate) <= new Date(input.data.startDate)) {
        throw new TRPCError5({ code: "BAD_REQUEST", message: "Contract end date must be after the start date." });
      }
    } else if (input.data.endDate) {
      const existing = await getEmployeeById(input.id);
      if (existing?.startDate && new Date(input.data.endDate) <= new Date(existing.startDate)) {
        throw new TRPCError5({ code: "BAD_REQUEST", message: "Contract end date must be after the start date." });
      }
    }
    if (input.data.visaExpiryDate) {
      const visaDate = new Date(input.data.visaExpiryDate);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      if (visaDate < today) {
        throw new TRPCError5({ code: "BAD_REQUEST", message: "Visa expiry date cannot be in the past." });
      }
    }
    const updateData = { ...input.data };
    if (input.data.startDate) {
      updateData.startDate = new Date(input.data.startDate);
    } else if (input.data.startDate === "") {
      delete updateData.startDate;
    }
    if (input.data.endDate) {
      updateData.endDate = new Date(input.data.endDate);
    } else if (input.data.endDate === "") {
      delete updateData.endDate;
    }
    if (input.data.dateOfBirth) {
      updateData.dateOfBirth = new Date(input.data.dateOfBirth);
    } else if (input.data.dateOfBirth === "") {
      delete updateData.dateOfBirth;
    }
    if (input.data.visaExpiryDate) {
      updateData.visaExpiryDate = new Date(input.data.visaExpiryDate);
    } else if (input.data.visaExpiryDate === "") {
      delete updateData.visaExpiryDate;
    }
    delete updateData.salaryCurrency;
    if (updateData.estimatedEmployerCost === "") {
      delete updateData.estimatedEmployerCost;
    }
    if (input.data.country) {
      const countryConfig = await getCountryConfig(input.data.country);
      if (countryConfig) {
        updateData.salaryCurrency = countryConfig.localCurrency;
      }
    }
    const isTransitioningToOnboarding = input.data.status === "onboarding";
    const isTransitioningToTerminated = input.data.status === "terminated";
    const isReactivating = input.data.status && ["active", "onboarding", "contract_signed"].includes(input.data.status);
    let previousStatus;
    if (input.data.status) {
      const currentEmp = await getEmployeeById(input.id);
      previousStatus = currentEmp?.status;
    }
    await updateEmployee(input.id, updateData);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "employee",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    let depositInvoiceResult;
    if (isTransitioningToOnboarding && previousStatus !== "onboarding") {
      depositInvoiceResult = await generateDepositInvoice(input.id);
      if (depositInvoiceResult.invoiceId) {
        await logAuditAction({
          userId: ctx.user.id,
          userName: ctx.user.name || null,
          action: "generate",
          entityType: "invoice",
          entityId: depositInvoiceResult.invoiceId,
          changes: JSON.stringify({ type: "deposit", employeeId: input.id, trigger: "onboarding_transition" })
        });
      }
    }
    let depositRefundResult;
    if (isTransitioningToTerminated && previousStatus !== "terminated") {
      depositRefundResult = await generateDepositRefund(input.id);
      if (depositRefundResult.invoiceId) {
        await logAuditAction({
          userId: ctx.user.id,
          userName: ctx.user.name || null,
          action: "generate",
          entityType: "invoice",
          entityId: depositRefundResult.invoiceId,
          changes: JSON.stringify({ type: "deposit_refund", employeeId: input.id, trigger: "termination" })
        });
      }
    }
    let reactivationDepositResult;
    if (previousStatus === "terminated" && input.data.status && ["active", "onboarding", "contract_signed"].includes(input.data.status)) {
      const depositStatus = await hasDepositBeenProcessed(input.id);
      if (depositStatus.processed) {
        reactivationDepositResult = await generateDepositInvoice(input.id);
        if (reactivationDepositResult.invoiceId) {
          await logAuditAction({
            userId: ctx.user.id,
            userName: ctx.user.name || null,
            action: "generate",
            entityType: "invoice",
            entityId: reactivationDepositResult.invoiceId,
            changes: JSON.stringify({
              type: "deposit",
              employeeId: input.id,
              trigger: "reactivation_from_terminated",
              previousDepositProcessedAs: depositStatus.type
            })
          });
        }
      }
    }
    let visaServiceResult;
    if (input.data.visaStatus === "application_submitted") {
      const currentEmpForVisa = await getEmployeeById(input.id);
      if (currentEmpForVisa?.serviceType === "visa_eor") {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (db) {
          const { invoices: invoicesTable, invoiceItems: invoiceItemsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const { eq: eq34, and: and27 } = await import("drizzle-orm");
          const existingVisaInvoices = await db.select().from(invoicesTable).where(
            and27(
              eq34(invoicesTable.invoiceType, "visa_service"),
              eq34(invoicesTable.customerId, currentEmpForVisa.customerId)
            )
          );
          let hasActiveBilledInvoice = false;
          for (const inv of existingVisaInvoices) {
            const items = await db.select().from(invoiceItemsTable).where(
              and27(
                eq34(invoiceItemsTable.invoiceId, inv.id),
                eq34(invoiceItemsTable.employeeId, input.id)
              )
            );
            if (items.length > 0) {
              if (inv.status === "sent" || inv.status === "paid" || inv.status === "pending_review") {
                hasActiveBilledInvoice = true;
                visaServiceResult = { invoiceId: null, message: "Visa service invoice already exists and is billed" };
                break;
              } else if (inv.status === "draft" || inv.status === "cancelled") {
                await db.delete(invoiceItemsTable).where(eq34(invoiceItemsTable.invoiceId, inv.id));
                await db.delete(invoicesTable).where(eq34(invoicesTable.id, inv.id));
              }
            }
          }
          if (!hasActiveBilledInvoice) {
            visaServiceResult = await generateVisaServiceInvoice(input.id);
            if (visaServiceResult.invoiceId) {
              await logAuditAction({
                userId: ctx.user.id,
                userName: ctx.user.name || null,
                action: "generate",
                entityType: "invoice",
                entityId: visaServiceResult.invoiceId,
                changes: JSON.stringify({ type: "visa_service", employeeId: input.id, trigger: "visa_application_submitted" })
              });
            }
          }
        }
      }
    }
    let leaveBalancesInitialized = false;
    if (input.data.status === "active" && previousStatus !== "active") {
      try {
        const emp = await getEmployeeById(input.id);
        if (emp) {
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          await initializeLeaveBalancesForEmployee(input.id, emp.country, currentYear, emp.customerId);
          leaveBalancesInitialized = true;
        }
      } catch (err) {
        console.error("Failed to initialize leave balances for employee", input.id, err);
      }
    }
    return {
      success: true,
      depositInvoice: depositInvoiceResult,
      depositRefund: depositRefundResult,
      visaServiceInvoice: visaServiceResult,
      reactivationDeposit: reactivationDepositResult,
      leaveBalancesInitialized
    };
  }),
  // Auto-detect visa requirement based on nationality vs work country
  checkVisaRequired: userProcedure.input(z3.object({ nationality: z3.string(), workCountry: z3.string() })).query(async ({ input }) => {
    const natUpper = input.nationality.toUpperCase();
    const countryUpper = input.workCountry.toUpperCase();
    return { requiresVisa: natUpper !== countryUpper };
  }),
  // Get salary info (base salary, social security cost, total employment cost)
  salaryInfo: userProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    const emp = await getEmployeeById(input.id);
    if (!emp) throw new TRPCError5({ code: "NOT_FOUND", message: "Employee not found" });
    const baseSalary = parseFloat(emp.baseSalary?.toString() ?? "0");
    const estimatedEmployerCost = parseFloat(emp.estimatedEmployerCost?.toString() ?? "0");
    const totalEmploymentCost = baseSalary + estimatedEmployerCost;
    return {
      baseSalary,
      salaryCurrency: emp.salaryCurrency,
      estimatedEmployerCost,
      totalEmploymentCost
    };
  }),
  // Payroll history for a specific employee
  payrollHistory: userProcedure.input(z3.object({ employeeId: z3.number() })).query(async ({ input }) => {
    return await listPayrollItemsByEmployee(input.employeeId);
  }),
  // Leave balances for a specific employee
  leaveBalances: userProcedure.input(z3.object({ employeeId: z3.number(), year: z3.number().optional() })).query(async ({ input }) => {
    return await listLeaveBalances(input.employeeId, input.year);
  }),
  // Adjustments (reimbursements, bonuses, etc.) for a specific employee
  adjustmentHistory: userProcedure.input(z3.object({ employeeId: z3.number() })).query(async ({ input }) => {
    return await listAdjustments({ employeeId: input.employeeId }, 100, 0);
  }),
  // Initialize leave balances for employee based on country leave types
  initializeLeaveBalances: customerManagerProcedure.input(z3.object({ employeeId: z3.number(), countryCode: z3.string(), year: z3.number() })).mutation(async ({ input }) => {
    return await initializeLeaveBalancesForEmployee(input.employeeId, input.countryCode, input.year);
  }),
  // Create a leave balance entry
  createLeaveBalance: customerManagerProcedure.input(z3.object({
    employeeId: z3.number(),
    leaveTypeId: z3.number(),
    year: z3.number(),
    totalEntitlement: z3.number(),
    used: z3.number().default(0),
    remaining: z3.number()
  })).mutation(async ({ input }) => {
    return await createLeaveBalance(input);
  }),
  // Update a leave balance entry — only entitlement and expiry are editable, used/remaining are auto-calculated from leave records
  updateLeaveBalance: customerManagerProcedure.input(z3.object({
    id: z3.number(),
    data: z3.object({
      totalEntitlement: z3.number(),
      expiryDate: z3.string().nullable().optional()
    })
  })).mutation(async ({ input }) => {
    const updateData = { totalEntitlement: input.data.totalEntitlement };
    if (input.data.expiryDate !== void 0) {
      updateData.expiryDate = input.data.expiryDate;
    }
    return await updateLeaveBalance(input.id, updateData);
  }),
  // Delete a leave balance entry
  deleteLeaveBalance: customerManagerProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    return await deleteLeaveBalance(input.id);
  }),
  // Get leave types for a country (for leave balance initialization)
  leaveTypes: userProcedure.input(z3.object({ countryCode: z3.string() })).query(async ({ input }) => {
    return await listLeaveTypesByCountry(input.countryCode);
  }),
  countByStatus: userProcedure.query(async () => {
    return await getEmployeeCountByStatus();
  }),
  countByCountry: userProcedure.query(async () => {
    return await getEmployeeCountByCountry();
  }),
  // ── Contracts sub-router ──────────────────────────────────────────
  contracts: router({
    list: userProcedure.input(z3.object({ employeeId: z3.number() })).query(async ({ input }) => {
      return await listEmployeeContracts(input.employeeId);
    }),
    upload: customerManagerProcedure.input(
      z3.object({
        employeeId: z3.number(),
        contractType: z3.string().optional(),
        signedDate: z3.string().optional(),
        effectiveDate: z3.string().optional(),
        expiryDate: z3.string().optional(),
        fileBase64: z3.string(),
        fileName: z3.string(),
        mimeType: z3.string().default("application/pdf")
      })
    ).mutation(async ({ input, ctx }) => {
      if (input.effectiveDate && input.expiryDate) {
        if (new Date(input.expiryDate) <= new Date(input.effectiveDate)) {
          throw new TRPCError5({ code: "BAD_REQUEST", message: "Contract expiry date must be after the effective date." });
        }
      }
      const fileBuffer = Buffer.from(input.fileBase64, "base64");
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `employee-contracts/${input.employeeId}/${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
      const result = await createEmployeeContractRecord({
        employeeId: input.employeeId,
        contractType: input.contractType,
        fileUrl: url,
        fileKey,
        signedDate: input.signedDate ? /* @__PURE__ */ new Date(input.signedDate + "T00:00:00Z") : void 0,
        effectiveDate: input.effectiveDate ? /* @__PURE__ */ new Date(input.effectiveDate + "T00:00:00Z") : void 0,
        expiryDate: input.expiryDate ? /* @__PURE__ */ new Date(input.expiryDate + "T00:00:00Z") : void 0,
        status: input.signedDate ? "signed" : "draft"
      });
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "create",
        entityType: "employee_contract",
        changes: JSON.stringify({ employeeId: input.employeeId, contractType: input.contractType })
      });
      return { success: true, url };
    }),
    update: customerManagerProcedure.input(
      z3.object({
        id: z3.number(),
        data: z3.object({
          contractType: z3.string().optional(),
          signedDate: z3.string().optional(),
          effectiveDate: z3.string().optional(),
          expiryDate: z3.string().optional(),
          status: z3.enum(["draft", "signed", "expired", "terminated"]).optional()
        })
      })
    ).mutation(async ({ input, ctx }) => {
      const updateData = { ...input.data };
      if (input.data.signedDate) updateData.signedDate = /* @__PURE__ */ new Date(input.data.signedDate + "T00:00:00Z");
      if (input.data.effectiveDate) updateData.effectiveDate = /* @__PURE__ */ new Date(input.data.effectiveDate + "T00:00:00Z");
      if (input.data.expiryDate) updateData.expiryDate = /* @__PURE__ */ new Date(input.data.expiryDate + "T00:00:00Z");
      await updateEmployeeContract(input.id, updateData);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "employee_contract",
        entityId: input.id,
        changes: JSON.stringify(input.data)
      });
      return { success: true };
    }),
    delete: customerManagerProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input, ctx }) => {
      await deleteEmployeeContract(input.id);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "employee_contract",
        entityId: input.id
      });
      return { success: true };
    })
  }),
  // ── Documents sub-router ──────────────────────────────────────────
  documents: router({
    list: userProcedure.input(z3.object({ employeeId: z3.number() })).query(async ({ input }) => {
      return await listEmployeeDocuments(input.employeeId);
    }),
    upload: customerManagerProcedure.input(
      z3.object({
        employeeId: z3.number(),
        documentType: z3.enum(["resume", "passport", "national_id", "work_permit", "visa", "contract", "education", "other"]),
        documentName: z3.string().min(1),
        fileBase64: z3.string(),
        fileName: z3.string(),
        mimeType: z3.string().default("application/pdf"),
        fileSize: z3.number().optional(),
        notes: z3.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const fileBuffer = Buffer.from(input.fileBase64, "base64");
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `employee-docs/${input.employeeId}/${input.documentType}/${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
      const result = await createEmployeeDocument({
        employeeId: input.employeeId,
        documentType: input.documentType,
        documentName: input.documentName,
        fileUrl: url,
        fileKey,
        mimeType: input.mimeType,
        fileSize: input.fileSize || fileBuffer.length,
        notes: input.notes
      });
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "create",
        entityType: "employee_document",
        changes: JSON.stringify({ employeeId: input.employeeId, documentType: input.documentType, documentName: input.documentName })
      });
      return { success: true, url };
    }),
    delete: customerManagerProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input, ctx }) => {
      await deleteEmployeeDocument(input.id);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "employee_document",
        entityId: input.id
      });
      return { success: true };
    })
  }),
  // ── Onboarding Invites (Admin view) ──────────────────────────────
  onboardingInvites: router({
    list: userProcedure.input(z3.object({
      customerId: z3.number().optional(),
      status: z3.string().optional()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input.customerId) conditions.push(eq7(onboardingInvites.customerId, input.customerId));
      if (input.status) conditions.push(eq7(onboardingInvites.status, input.status));
      const invites = await db.select({
        id: onboardingInvites.id,
        customerId: onboardingInvites.customerId,
        customerName: customers.companyName,
        employeeName: onboardingInvites.employeeName,
        employeeEmail: onboardingInvites.employeeEmail,
        status: onboardingInvites.status,
        employeeId: onboardingInvites.employeeId,
        expiresAt: onboardingInvites.expiresAt,
        completedAt: onboardingInvites.completedAt,
        createdAt: onboardingInvites.createdAt
      }).from(onboardingInvites).leftJoin(customers, eq7(onboardingInvites.customerId, customers.id)).where(conditions.length > 0 ? and6(...conditions) : void 0).orderBy(desc2(onboardingInvites.createdAt));
      return invites;
    }),
    delete: customerManagerProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(onboardingInvites).where(eq7(onboardingInvites.id, input.id));
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "onboarding_invite",
        entityId: input.id
      });
      return { success: true };
    })
  })
});

// server/routers/payroll.ts
import { z as z4 } from "zod";
import { TRPCError as TRPCError6 } from "@trpc/server";
init_db();
async function recalculatePayrollRunTotals(payrollRunId) {
  const items = await listPayrollItemsByRun(payrollRunId);
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;
  let totalEmployerCost = 0;
  for (const item of items) {
    totalGross += parseFloat(item.gross?.toString() ?? "0");
    const itemDeductions = parseFloat(item.deductions?.toString() ?? "0") + parseFloat(item.taxDeduction?.toString() ?? "0") + parseFloat(item.socialSecurityDeduction?.toString() ?? "0") + parseFloat(item.unpaidLeaveDeduction?.toString() ?? "0");
    totalDeductions += itemDeductions;
    totalNet += parseFloat(item.net?.toString() ?? "0");
    totalEmployerCost += parseFloat(item.totalEmploymentCost?.toString() ?? "0");
  }
  await updatePayrollRun(payrollRunId, {
    totalGross: totalGross.toFixed(2),
    totalDeductions: totalDeductions.toFixed(2),
    totalNet: totalNet.toFixed(2),
    totalEmployerCost: totalEmployerCost.toFixed(2)
  });
}
function calculateItemTotals(data) {
  const baseSalary = parseFloat(data.baseSalary ?? "0");
  const bonus = parseFloat(data.bonus ?? "0");
  const allowances = parseFloat(data.allowances ?? "0");
  const reimbursements2 = parseFloat(data.reimbursements ?? "0");
  const deductions = parseFloat(data.deductions ?? "0");
  const taxDeduction = parseFloat(data.taxDeduction ?? "0");
  const socialSecurityDeduction = parseFloat(data.socialSecurityDeduction ?? "0");
  const unpaidLeaveDeduction = parseFloat(data.unpaidLeaveDeduction ?? "0");
  const employerSocialContribution = parseFloat(data.employerSocialContribution ?? "0");
  const gross = baseSalary + bonus + allowances - unpaidLeaveDeduction;
  const net2 = gross - deductions - taxDeduction - socialSecurityDeduction;
  const totalEmploymentCost = gross + employerSocialContribution + reimbursements2;
  return {
    gross: gross.toFixed(2),
    net: net2.toFixed(2),
    totalEmploymentCost: totalEmploymentCost.toFixed(2)
  };
}
var payrollRouter = router({
  list: userProcedure.input(
    z4.object({
      status: z4.string().optional(),
      countryCode: z4.string().optional(),
      payrollMonth: z4.string().optional(),
      limit: z4.number().default(50),
      offset: z4.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listPayrollRuns(
      {
        status: input.status,
        countryCode: input.countryCode,
        payrollMonth: input.payrollMonth
      },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z4.object({ id: z4.number() })).query(async ({ input }) => {
    return await getPayrollRunById(input.id);
  }),
  getItems: userProcedure.input(z4.object({ payrollRunId: z4.number() })).query(async ({ input }) => {
    return await listPayrollItemsByRun(input.payrollRunId);
  }),
  // Create payroll run by country + period
  // Currency is auto-set from country's legal currency
  create: operationsManagerProcedure.input(
    z4.object({
      countryCode: z4.string(),
      payrollMonth: z4.string(),
      // YYYY-MM-01 format
      notes: z4.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const countryConfig = await getCountryConfig(input.countryCode);
    if (!countryConfig) throw new TRPCError6({ code: "BAD_REQUEST", message: "Country configuration not found for " + input.countryCode });
    const currency = countryConfig.localCurrency;
    const parts = input.payrollMonth.split("-");
    const normalizedMonth = parts[0] + "-" + parts[1].padStart(2, "0") + "-01";
    const existing = await findPayrollRunByCountryMonth(input.countryCode, normalizedMonth);
    if (existing) {
      throw new TRPCError6({ code: "BAD_REQUEST", message: "A payroll run for " + input.countryCode + " in " + parts[0] + "-" + parts[1] + " already exists (ID: " + existing.id + ", Status: " + existing.status + ")" });
    }
    const result = await createPayrollRun({
      countryCode: input.countryCode,
      payrollMonth: normalizedMonth,
      // string for MySQL date column
      currency,
      status: "draft",
      notes: input.notes
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "payroll_run",
      changes: JSON.stringify({ ...input, currency })
    });
    return result;
  }),
  update: operationsManagerProcedure.input(
    z4.object({
      id: z4.number(),
      data: z4.object({
        status: z4.enum(["draft", "pending_approval", "approved", "rejected"]).optional(),
        notes: z4.string().optional(),
        rejectionReason: z4.string().optional(),
        totalGross: z4.string().optional(),
        totalDeductions: z4.string().optional(),
        totalNet: z4.string().optional(),
        totalEmployerCost: z4.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const updateData = { ...input.data };
    if (input.data.status === "pending_approval") {
      updateData.submittedBy = ctx.user.id;
      updateData.submittedAt = /* @__PURE__ */ new Date();
    } else if (input.data.status === "approved") {
      updateData.approvedBy = ctx.user.id;
      updateData.approvedAt = /* @__PURE__ */ new Date();
    } else if (input.data.status === "rejected") {
      updateData.rejectedBy = ctx.user.id;
      updateData.rejectedAt = /* @__PURE__ */ new Date();
    }
    await updatePayrollRun(input.id, updateData);
    if (input.data.status === "pending_approval" || input.data.status === "approved") {
      const run = await getPayrollRunById(input.id);
      if (run) {
        const pm = run.payrollMonth instanceof Date ? `${run.payrollMonth.getUTCFullYear()}-${String(run.payrollMonth.getUTCMonth() + 1).padStart(2, "0")}` : String(run.payrollMonth).substring(0, 7);
        const pmDate = `${pm}-01`;
        const adjLocked = await lockSubmittedAdjustments(pmDate, run.countryCode);
        const leaveLocked = await lockSubmittedLeaveRecords(pm, run.countryCode);
        if (adjLocked > 0 || leaveLocked > 0) {
          await logAuditAction({
            userId: ctx.user.id,
            userName: ctx.user.name || null,
            action: "payroll_submit_lock",
            entityType: "payroll_run",
            entityId: input.id,
            changes: JSON.stringify({ adjustmentsLocked: adjLocked, leaveRecordsLocked: leaveLocked, month: pm, country: run.countryCode })
          });
        }
      }
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "payroll_run",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  previewItem: operationsManagerProcedure.input(
    z4.object({
      payrollRunId: z4.number(),
      employeeId: z4.number()
    })
  ).query(async ({ input }) => {
    const run = await getPayrollRunById(input.payrollRunId);
    if (!run) throw new TRPCError6({ code: "NOT_FOUND", message: "Payroll run not found" });
    const emp = await getEmployeeById(input.employeeId);
    if (!emp) throw new TRPCError6({ code: "NOT_FOUND", message: "Employee not found" });
    const pmDate = run.payrollMonth instanceof Date ? run.payrollMonth : new Date(run.payrollMonth);
    const y = pmDate.getUTCFullYear();
    const m = pmDate.getUTCMonth() + 1;
    const payrollMonth = `${y}-${String(m).padStart(2, "0")}-01`;
    const allAdj = await getSubmittedAdjustmentsForPayroll(run.countryCode, payrollMonth);
    const empAdj = allAdj.filter((a) => a.employeeId === input.employeeId);
    let totalBonus = 0, totalAllowances = 0, totalReimbursements = 0, totalDeductions = 0;
    const breakdown = [];
    for (const adj of empAdj) {
      const amount = parseFloat(adj.amount?.toString() ?? "0");
      switch (adj.adjustmentType) {
        case "bonus":
          totalBonus += amount;
          break;
        case "allowance":
          totalAllowances += amount;
          break;
        case "reimbursement":
          totalReimbursements += amount;
          break;
        case "deduction":
          totalDeductions += amount;
          break;
        case "other":
          totalAllowances += amount;
          break;
      }
      breakdown.push({ id: adj.id, type: adj.adjustmentType, category: adj.category, amount: adj.amount });
    }
    const allLeave = await getSubmittedUnpaidLeaveForPayroll(run.countryCode, payrollMonth);
    const empLeave = allLeave.filter((l) => l.employeeId === input.employeeId);
    let totalUnpaidDays = 0;
    for (const lv of empLeave) {
      totalUnpaidDays += parseFloat(lv.days?.toString() ?? "0");
    }
    const baseSalary = parseFloat(emp.baseSalary?.toString() ?? "0");
    const countryConfig = await getCountryConfig(emp.country);
    const workingDaysPerWeek = countryConfig?.workingDaysPerWeek ?? 5;
    const monthlyWorkingDays = workingDaysPerWeek * 4.33;
    const totalUnpaidDeduction = monthlyWorkingDays > 0 ? Math.round(baseSalary / monthlyWorkingDays * totalUnpaidDays * 100) / 100 : 0;
    return {
      baseSalary: baseSalary.toFixed(2),
      bonus: totalBonus.toFixed(2),
      allowances: totalAllowances.toFixed(2),
      reimbursements: totalReimbursements.toFixed(2),
      deductions: totalDeductions.toFixed(2),
      unpaidLeaveDeduction: totalUnpaidDeduction.toFixed(2),
      unpaidLeaveDays: totalUnpaidDays.toFixed(1),
      adjustmentsBreakdown: breakdown,
      currency: emp.salaryCurrency || run.currency
    };
  }),
  addItem: operationsManagerProcedure.input(
    z4.object({
      payrollRunId: z4.number(),
      employeeId: z4.number(),
      baseSalary: z4.string(),
      bonus: z4.string().default("0"),
      allowances: z4.string().default("0"),
      reimbursements: z4.string().default("0"),
      deductions: z4.string().default("0"),
      taxDeduction: z4.string().default("0"),
      socialSecurityDeduction: z4.string().default("0"),
      unpaidLeaveDeduction: z4.string().default("0"),
      unpaidLeaveDays: z4.string().default("0"),
      employerSocialContribution: z4.string().default("0"),
      currency: z4.string().default("USD"),
      notes: z4.string().optional(),
      adjustmentsBreakdown: z4.any().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const payrollRun = await getPayrollRunById(input.payrollRunId);
    if (!payrollRun) throw new TRPCError6({ code: "NOT_FOUND", message: "Payroll run not found" });
    const employee = await getEmployeeById(input.employeeId);
    if (!employee) throw new TRPCError6({ code: "NOT_FOUND", message: "Employee not found" });
    if (employee.country !== payrollRun.countryCode) {
      throw new TRPCError6({ code: "BAD_REQUEST", message: `Employee is in ${employee.country}, but this payroll run is for ${payrollRun.countryCode}. Only employees from the same country can be added.` });
    }
    const existingItems = await listPayrollItemsByRun(input.payrollRunId);
    const duplicate = existingItems?.find((item) => item.employeeId === input.employeeId);
    if (duplicate) {
      throw new TRPCError6({ code: "BAD_REQUEST", message: `Employee ${employee.firstName} ${employee.lastName} is already in this payroll run.` });
    }
    const totals = calculateItemTotals(input);
    const result = await createPayrollItem({
      payrollRunId: input.payrollRunId,
      employeeId: input.employeeId,
      baseSalary: input.baseSalary,
      bonus: input.bonus,
      allowances: input.allowances,
      reimbursements: input.reimbursements,
      deductions: input.deductions,
      taxDeduction: input.taxDeduction,
      socialSecurityDeduction: input.socialSecurityDeduction,
      unpaidLeaveDeduction: input.unpaidLeaveDeduction,
      unpaidLeaveDays: input.unpaidLeaveDays,
      gross: totals.gross,
      net: totals.net,
      employerSocialContribution: input.employerSocialContribution,
      totalEmploymentCost: totals.totalEmploymentCost,
      currency: input.currency,
      notes: input.notes,
      adjustmentsBreakdown: input.adjustmentsBreakdown
    });
    await recalculatePayrollRunTotals(input.payrollRunId);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "payroll_item",
      changes: JSON.stringify(input)
    });
    return result;
  }),
  updateItem: operationsManagerProcedure.input(
    z4.object({
      id: z4.number(),
      data: z4.object({
        baseSalary: z4.string().optional(),
        bonus: z4.string().optional(),
        allowances: z4.string().optional(),
        reimbursements: z4.string().optional(),
        deductions: z4.string().optional(),
        taxDeduction: z4.string().optional(),
        socialSecurityDeduction: z4.string().optional(),
        unpaidLeaveDeduction: z4.string().optional(),
        unpaidLeaveDays: z4.string().optional(),
        employerSocialContribution: z4.string().optional(),
        notes: z4.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const existingItem = await getPayrollItemById(input.id);
    if (!existingItem) throw new TRPCError6({ code: "NOT_FOUND", message: "Payroll item not found" });
    const merged = {
      baseSalary: input.data.baseSalary ?? existingItem.baseSalary?.toString() ?? "0",
      bonus: input.data.bonus ?? existingItem.bonus?.toString() ?? "0",
      allowances: input.data.allowances ?? existingItem.allowances?.toString() ?? "0",
      reimbursements: input.data.reimbursements ?? existingItem.reimbursements?.toString() ?? "0",
      deductions: input.data.deductions ?? existingItem.deductions?.toString() ?? "0",
      taxDeduction: input.data.taxDeduction ?? existingItem.taxDeduction?.toString() ?? "0",
      socialSecurityDeduction: input.data.socialSecurityDeduction ?? existingItem.socialSecurityDeduction?.toString() ?? "0",
      unpaidLeaveDeduction: input.data.unpaidLeaveDeduction ?? existingItem.unpaidLeaveDeduction?.toString() ?? "0",
      employerSocialContribution: input.data.employerSocialContribution ?? existingItem.employerSocialContribution?.toString() ?? "0"
    };
    const totals = calculateItemTotals(merged);
    await updatePayrollItem(input.id, {
      ...input.data,
      gross: totals.gross,
      net: totals.net,
      totalEmploymentCost: totals.totalEmploymentCost
    });
    await recalculatePayrollRunTotals(existingItem.payrollRunId);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "payroll_item",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  deleteItem: operationsManagerProcedure.input(z4.object({ id: z4.number() })).mutation(async ({ input, ctx }) => {
    const existingItem = await getPayrollItemById(input.id);
    if (!existingItem) throw new TRPCError6({ code: "NOT_FOUND", message: "Payroll item not found" });
    const payrollRunId = existingItem.payrollRunId;
    await deletePayrollItem(input.id);
    await recalculatePayrollRunTotals(payrollRunId);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "payroll_item",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Auto-fill payroll items based on all active employees in the country.
   * Now integrates:
   * - Adjustments: aggregates submitted adjustments (bonus/allowance/reimbursement/deduction) per employee
   * - Leave: aggregates submitted unpaid leave deductions per employee
   * After auto-fill, linked adjustments and leave records are locked.
   */
  autoFill: operationsManagerProcedure.input(z4.object({ payrollRunId: z4.number() })).mutation(async ({ input, ctx }) => {
    const run = await getPayrollRunById(input.payrollRunId);
    if (!run) throw new TRPCError6({ code: "BAD_REQUEST", message: "Payroll run not found" });
    let payrollMonth;
    if (run.payrollMonth instanceof Date) {
      const y = run.payrollMonth.getUTCFullYear();
      const m = String(run.payrollMonth.getUTCMonth() + 1).padStart(2, "0");
      const d = String(run.payrollMonth.getUTCDate()).padStart(2, "0");
      payrollMonth = `${y}-${m}-${d}`;
    } else {
      payrollMonth = String(run.payrollMonth);
    }
    const activeEmployees = await getActiveEmployeesForPayroll(run.countryCode);
    const existingItems = await listPayrollItemsByRun(input.payrollRunId);
    const existingEmployeeIds = new Set(existingItems.map((i) => i.employeeId));
    const allAdjustments = await getSubmittedAdjustmentsForPayroll(run.countryCode, payrollMonth);
    const adjByEmployee = /* @__PURE__ */ new Map();
    for (const adj of allAdjustments) {
      const list = adjByEmployee.get(adj.employeeId) ?? [];
      list.push(adj);
      adjByEmployee.set(adj.employeeId, list);
    }
    const allUnpaidLeave = await getSubmittedUnpaidLeaveForPayroll(run.countryCode, payrollMonth);
    const leaveByEmployee = /* @__PURE__ */ new Map();
    for (const lv of allUnpaidLeave) {
      const list = leaveByEmployee.get(lv.employeeId) ?? [];
      list.push(lv);
      leaveByEmployee.set(lv.employeeId, list);
    }
    const newItems = [];
    const lockedAdjustmentIds = [];
    const lockedLeaveIds = [];
    for (const emp of activeEmployees) {
      if (existingEmployeeIds.has(emp.id)) continue;
      const baseSalary = parseFloat(emp.baseSalary?.toString() ?? "0");
      const empAdj = adjByEmployee.get(emp.id) ?? [];
      let totalBonus = 0;
      let totalAllowances = 0;
      let totalReimbursements = 0;
      let totalDeductions = 0;
      const adjustmentsBreakdown = [];
      for (const adj of empAdj) {
        const amount = parseFloat(adj.amount?.toString() ?? "0");
        switch (adj.adjustmentType) {
          case "bonus":
            totalBonus += amount;
            break;
          case "allowance":
            totalAllowances += amount;
            break;
          case "reimbursement":
            totalReimbursements += amount;
            break;
          case "deduction":
            totalDeductions += amount;
            break;
          case "other":
            totalAllowances += amount;
            break;
        }
        adjustmentsBreakdown.push({
          id: adj.id,
          type: adj.adjustmentType,
          category: adj.category,
          description: adj.description,
          amount: adj.amount
        });
        lockedAdjustmentIds.push(adj.id);
      }
      const empLeave = leaveByEmployee.get(emp.id) ?? [];
      let totalUnpaidDays = 0;
      for (const lv of empLeave) {
        totalUnpaidDays += parseFloat(lv.days?.toString() ?? "0");
        lockedLeaveIds.push(lv.id);
      }
      const countryConfig = await getCountryConfig(run.countryCode);
      const workingDaysPerWeek = countryConfig?.workingDaysPerWeek ?? 5;
      const monthlyWorkingDays = workingDaysPerWeek * 4.33;
      const totalUnpaidDeduction = monthlyWorkingDays > 0 ? Math.round(baseSalary / monthlyWorkingDays * totalUnpaidDays * 100) / 100 : 0;
      const itemFields = {
        baseSalary: baseSalary.toFixed(2),
        bonus: totalBonus.toFixed(2),
        allowances: totalAllowances.toFixed(2),
        reimbursements: totalReimbursements.toFixed(2),
        deductions: totalDeductions.toFixed(2),
        taxDeduction: "0",
        socialSecurityDeduction: "0",
        unpaidLeaveDeduction: totalUnpaidDeduction.toFixed(2),
        employerSocialContribution: "0"
      };
      const totals = calculateItemTotals(itemFields);
      const itemData = {
        payrollRunId: input.payrollRunId,
        employeeId: emp.id,
        ...itemFields,
        unpaidLeaveDays: totalUnpaidDays.toFixed(1),
        gross: totals.gross,
        net: totals.net,
        totalEmploymentCost: totals.totalEmploymentCost,
        currency: emp.salaryCurrency || run.currency,
        adjustmentsBreakdown: adjustmentsBreakdown.length > 0 ? adjustmentsBreakdown : void 0
      };
      await createPayrollItem(itemData);
      newItems.push(itemData);
    }
    await recalculatePayrollRunTotals(input.payrollRunId);
    for (const adjId of lockedAdjustmentIds) {
      await updateAdjustment(adjId, { status: "locked", payrollRunId: input.payrollRunId });
    }
    for (const leaveId of lockedLeaveIds) {
      await updateLeaveRecord(leaveId, { status: "locked" });
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "auto_fill",
      entityType: "payroll_run",
      entityId: input.payrollRunId,
      changes: JSON.stringify({
        employeesAdded: newItems.length,
        adjustmentsLocked: lockedAdjustmentIds.length,
        leaveRecordsLocked: lockedLeaveIds.length
      })
    });
    return {
      success: true,
      itemsAdded: newItems.length,
      adjustmentsLocked: lockedAdjustmentIds.length,
      leaveRecordsLocked: lockedLeaveIds.length
    };
  })
});

// server/routers/invoices.ts
import { z as z5 } from "zod";
init_db();
init_schema();
import { eq as eq9, and as and8, sql as sql4 } from "drizzle-orm";
import { TRPCError as TRPCError7 } from "@trpc/server";

// server/services/creditNoteService.ts
init_db();
init_schema();
init_db();
import { eq as eq8, like as like2, and as and7 } from "drizzle-orm";
async function generateCreditNoteNumber(billingEntityId, invoiceMonth) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const yearMonth = `${invoiceMonth.getFullYear()}${String(invoiceMonth.getMonth() + 1).padStart(2, "0")}`;
  let bePrefix = "";
  if (billingEntityId) {
    const be = await getBillingEntityById(billingEntityId);
    if (be?.invoicePrefix) {
      bePrefix = be.invoicePrefix;
      if (!bePrefix.endsWith("-") && !bePrefix.endsWith("_")) {
        bePrefix += "-";
      }
    }
  }
  const prefix = `CN-${bePrefix}`;
  const pattern = `${prefix}${yearMonth}-%`;
  const existing = await db.select({ invoiceNumber: invoices.invoiceNumber }).from(invoices).where(like2(invoices.invoiceNumber, pattern));
  let maxSeq = 0;
  for (const row of existing) {
    const parts = row.invoiceNumber.split("-");
    const lastPart = parts[parts.length - 1];
    const seq = parseInt(lastPart, 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }
  const nextSeq = maxSeq + 1;
  return `${prefix}${yearMonth}-${nextSeq.toString().padStart(3, "0")}`;
}
async function generateCreditNote(params) {
  const db = await getDb();
  if (!db) return { invoiceId: null, message: "Database not available" };
  try {
    const originalInvoice = await getInvoiceById(params.originalInvoiceId);
    if (!originalInvoice) {
      return { invoiceId: null, message: "Original invoice not found" };
    }
    if (originalInvoice.status !== "paid") {
      return {
        invoiceId: null,
        message: `Cannot create credit note for invoice in '${originalInvoice.status}' status. Only paid invoices can be credited.`
      };
    }
    if (["credit_note", "deposit_refund"].includes(originalInvoice.invoiceType || "")) {
      return {
        invoiceId: null,
        message: `Cannot create credit note for a ${originalInvoice.invoiceType} invoice.`
      };
    }
    if (originalInvoice.invoiceType === "deposit") {
      const originalItems = await listInvoiceItemsByInvoice(params.originalInvoiceId);
      const depositItem = originalItems.find((item) => item.employeeId);
      if (depositItem?.employeeId) {
        const { getEmployeeById: getEmp } = await Promise.resolve().then(() => (init_db(), db_exports));
        const employee = await getEmp(depositItem.employeeId);
        if (employee && employee.status !== "terminated") {
          return {
            invoiceId: null,
            message: "Employee must be in 'terminated' status before creating a credit note for a deposit invoice"
          };
        }
      }
      const existingRefunds = await db.select({ id: invoices.id, status: invoices.status }).from(invoices).where(
        and7(
          eq8(invoices.relatedInvoiceId, params.originalInvoiceId),
          eq8(invoices.invoiceType, "deposit_refund")
        )
      );
      const hasActiveRefund = existingRefunds.some(
        (r) => r.status !== "cancelled"
      );
      if (hasActiveRefund) {
        return {
          invoiceId: null,
          message: "This deposit has already been refunded. Cannot create a credit note for a refunded deposit (refund and credit note are mutually exclusive)."
        };
      }
      if (!params.isFullCredit) {
        return {
          invoiceId: null,
          message: "Deposit invoices only support full-amount credit notes. Partial credit is not allowed for deposits."
        };
      }
      const existingCreditNotes = await db.select({ id: invoices.id, status: invoices.status }).from(invoices).where(
        and7(
          eq8(invoices.relatedInvoiceId, params.originalInvoiceId),
          eq8(invoices.invoiceType, "credit_note")
        )
      );
      const hasActiveCreditNote = existingCreditNotes.some(
        (cn) => cn.status !== "cancelled"
      );
      if (hasActiveCreditNote) {
        return {
          invoiceId: null,
          message: "This deposit already has a credit note. Only one credit note is allowed per deposit."
        };
      }
    }
    if (originalInvoice.invoiceType !== "deposit") {
      const existingCreditNotes = await db.select({ total: invoices.total, status: invoices.status }).from(invoices).where(
        and7(
          eq8(invoices.relatedInvoiceId, params.originalInvoiceId),
          eq8(invoices.invoiceType, "credit_note")
        )
      );
      const existingCreditTotal = existingCreditNotes.filter((cn) => cn.status !== "cancelled").reduce((sum2, cn) => sum2 + Math.abs(parseFloat(cn.total?.toString() ?? "0")), 0);
      const originalTotal = Math.abs(parseFloat(originalInvoice.total?.toString() ?? "0"));
      let pendingCreditAmount;
      if (params.isFullCredit) {
        pendingCreditAmount = originalTotal;
      } else if (params.lineItems && params.lineItems.length > 0) {
        pendingCreditAmount = params.lineItems.reduce(
          (sum2, item) => sum2 + Math.abs(parseFloat(item.amount)),
          0
        );
      } else {
        pendingCreditAmount = 0;
      }
      if (existingCreditTotal + pendingCreditAmount > originalTotal + 0.01) {
        const remaining = (originalTotal - existingCreditTotal).toFixed(2);
        return {
          invoiceId: null,
          message: `Cumulative credit notes (${existingCreditTotal.toFixed(2)} existing + ${pendingCreditAmount.toFixed(2)} new) would exceed the original invoice total (${originalTotal.toFixed(2)}). Maximum remaining credit: ${remaining}.`
        };
      }
    }
    const customer = await getCustomerById(originalInvoice.customerId);
    let creditTotal;
    let creditItems = [];
    if (params.isFullCredit) {
      creditTotal = parseFloat(originalInvoice.total?.toString() ?? "0");
      const originalItems = await listInvoiceItemsByInvoice(params.originalInvoiceId);
      creditItems = originalItems.map((item) => ({
        invoiceId: 0,
        // Will be set after invoice creation
        employeeId: item.employeeId,
        description: `Credit: ${item.description}`,
        quantity: item.quantity?.toString() || "1",
        unitPrice: (-Math.abs(parseFloat(item.unitPrice?.toString() ?? "0"))).toFixed(2),
        amount: (-Math.abs(parseFloat(item.amount?.toString() ?? "0"))).toFixed(2),
        itemType: item.itemType || "employment_cost",
        countryCode: item.countryCode,
        localCurrency: item.localCurrency,
        localAmount: item.localAmount ? (-Math.abs(parseFloat(item.localAmount.toString()))).toFixed(2) : void 0,
        exchangeRate: item.exchangeRate?.toString(),
        exchangeRateWithMarkup: item.exchangeRateWithMarkup?.toString()
      }));
    } else if (params.lineItems && params.lineItems.length > 0) {
      creditTotal = params.lineItems.reduce(
        (sum2, item) => sum2 + Math.abs(parseFloat(item.amount)),
        0
      );
      creditItems = params.lineItems.map((item) => ({
        invoiceId: 0,
        employeeId: item.employeeId,
        description: item.description,
        quantity: "1",
        unitPrice: (-Math.abs(parseFloat(item.amount))).toFixed(2),
        amount: (-Math.abs(parseFloat(item.amount))).toFixed(2),
        itemType: item.itemType || "employment_cost",
        countryCode: item.countryCode
      }));
    } else {
      return {
        invoiceId: null,
        message: "Either isFullCredit must be true or lineItems must be provided"
      };
    }
    const billingEntityId = originalInvoice.billingEntityId || customer?.billingEntityId || null;
    const creditNoteNumber = await generateCreditNoteNumber(
      billingEntityId,
      originalInvoice.invoiceMonth ? new Date(originalInvoice.invoiceMonth) : /* @__PURE__ */ new Date()
    );
    const dueDate = null;
    const invoiceData = {
      customerId: originalInvoice.customerId,
      billingEntityId,
      invoiceNumber: creditNoteNumber,
      invoiceType: "credit_note",
      invoiceMonth: originalInvoice.invoiceMonth ? new Date(originalInvoice.invoiceMonth) : void 0,
      currency: originalInvoice.currency || "USD",
      exchangeRate: originalInvoice.exchangeRate?.toString() || "1",
      exchangeRateWithMarkup: originalInvoice.exchangeRateWithMarkup?.toString() || "1",
      subtotal: (-creditTotal).toFixed(2),
      serviceFeeTotal: "0",
      tax: "0",
      total: (-creditTotal).toFixed(2),
      status: "draft",
      dueDate,
      relatedInvoiceId: params.originalInvoiceId,
      notes: `Credit Note for ${originalInvoice.invoiceNumber}. Reason: ${params.reason}`
    };
    const invoiceResult = await db.insert(invoices).values(invoiceData);
    const invoiceId = invoiceResult[0]?.insertId;
    for (const item of creditItems) {
      await db.insert(invoiceItems).values({
        ...item,
        invoiceId
      });
    }
    return {
      invoiceId,
      message: `Credit note ${creditNoteNumber} created for ${(-creditTotal).toFixed(2)} ${originalInvoice.currency || "USD"} (original: ${originalInvoice.invoiceNumber})`
    };
  } catch (error) {
    console.error("[CreditNote] Error generating credit note:", error);
    return {
      invoiceId: null,
      message: `Failed to generate credit note: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

// server/routers/invoices.ts
init_notification();
var invoiceItemTypeEnum = z5.enum([
  "eor_service_fee",
  "visa_eor_service_fee",
  "aor_service_fee",
  "employment_cost",
  "deposit",
  "equipment_procurement_fee",
  "onboarding_fee",
  "offboarding_fee",
  "admin_setup_fee",
  "contract_termination_fee",
  "payroll_processing_fee",
  "tax_filing_fee",
  "hr_advisory_fee",
  "legal_compliance_fee",
  "visa_immigration_fee",
  "relocation_fee",
  "benefits_admin_fee",
  "bank_transfer_fee",
  "consulting_fee",
  "management_consulting_fee"
]);
async function recalculateInvoiceTotals(invoiceId) {
  const invoice = await getInvoiceById(invoiceId);
  const items = await listInvoiceItemsByInvoice(invoiceId);
  const settlementCurrency = invoice?.currency || "USD";
  let subtotal = 0;
  let taxTotal = 0;
  let serviceFeeTotal = 0;
  const serviceFeeTypes = ["eor_service_fee", "visa_eor_service_fee", "aor_service_fee"];
  for (const item of items) {
    const qty = parseFloat(item.quantity?.toString() ?? "1");
    const rate = parseFloat(item.unitPrice?.toString() ?? "0");
    const vatRate = parseFloat(item.vatRate?.toString() ?? "0");
    const localCurrency = item.localCurrency || null;
    const itemExchangeRateWithMarkup = parseFloat(item.exchangeRateWithMarkup?.toString() ?? "0");
    const itemExchangeRate = parseFloat(item.exchangeRate?.toString() ?? "0");
    let conversionRate = 1;
    if (localCurrency && localCurrency !== settlementCurrency) {
      if (itemExchangeRateWithMarkup > 0) {
        conversionRate = itemExchangeRateWithMarkup;
      } else if (itemExchangeRate > 0) {
        conversionRate = itemExchangeRate;
      }
    }
    const baseAmountLocal = qty * rate;
    const baseAmountSettlement = baseAmountLocal * conversionRate;
    const isServiceFee = serviceFeeTypes.includes(item.itemType);
    const taxAmountSettlement = isServiceFee ? 0 : baseAmountSettlement * (vatRate / 100);
    if (isServiceFee) {
      serviceFeeTotal += baseAmountSettlement;
    } else {
      subtotal += baseAmountSettlement;
    }
    taxTotal += taxAmountSettlement;
    const lineItemTotalSettlement = baseAmountSettlement + taxAmountSettlement;
    await updateInvoiceItem(item.id, { amount: lineItemTotalSettlement.toFixed(2) });
  }
  const total = subtotal + serviceFeeTotal + taxTotal;
  const foreignItems = items.filter((item) => item.localCurrency && item.localCurrency !== settlementCurrency);
  const updateData = {
    subtotal: subtotal.toFixed(2),
    serviceFeeTotal: serviceFeeTotal.toFixed(2),
    tax: taxTotal.toFixed(2),
    total: total.toFixed(2)
  };
  if (foreignItems.length > 0) {
    const firstForeign = foreignItems[0];
    if (firstForeign.exchangeRate) {
      updateData.exchangeRate = firstForeign.exchangeRate.toString();
    }
    if (firstForeign.exchangeRateWithMarkup) {
      updateData.exchangeRateWithMarkup = firstForeign.exchangeRateWithMarkup.toString();
    }
  }
  await updateInvoice(invoiceId, updateData);
  return { subtotal, serviceFeeTotal, tax: taxTotal, total };
}
var invoicesRouter = router({
  list: userProcedure.input(
    z5.object({
      customerId: z5.number().optional(),
      status: z5.string().optional(),
      invoiceType: z5.string().optional(),
      invoiceMonth: z5.string().optional(),
      limit: z5.number().default(50),
      offset: z5.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listInvoices(
      {
        customerId: input.customerId,
        status: input.status,
        invoiceType: input.invoiceType,
        invoiceMonth: input.invoiceMonth
      },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z5.object({ id: z5.number() })).query(async ({ input }) => {
    return await getInvoiceById(input.id);
  }),
  getItems: userProcedure.input(z5.object({ invoiceId: z5.number() })).query(async ({ input }) => {
    return await listInvoiceItemsByInvoice(input.invoiceId);
  }),
  /**
   * Get real-time exchange rate reference for an invoice
   * Checks line items for foreign currency (non-USD localCurrency)
   * Fetches live rate and compares with invoice markup rate
   * For finance manager reference only - not shown on PDF or client-facing pages
   */
  getRealTimeRateReference: financeManagerProcedure.input(z5.object({ invoiceId: z5.number() })).query(async ({ input }) => {
    const invoice = await getInvoiceById(input.invoiceId);
    if (!invoice) {
      throw new TRPCError7({ code: "NOT_FOUND", message: "Invoice not found" });
    }
    const items = await listInvoiceItemsByInvoice(input.invoiceId);
    const foreignCurrencies = Array.from(new Set(
      items.map((item) => item.localCurrency).filter((c) => !!c && c !== "USD")
    ));
    if (foreignCurrencies.length === 0) {
      return {
        foreignCurrency: null,
        invoiceCurrency: invoice.currency || "USD",
        invoiceTotal: invoice.total?.toString() || "0",
        invoiceExchangeRate: invoice.exchangeRate?.toString() || "1",
        invoiceExchangeRateWithMarkup: invoice.exchangeRateWithMarkup?.toString() || "1",
        liveRate: null,
        liveRateSource: null,
        liveUsdEquivalent: null,
        invoiceUsdEquivalent: invoice.total?.toString() || "0",
        amountDiff: null,
        amountDiffPercent: null,
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const foreignCurrency = foreignCurrencies[0];
    let liveRate = null;
    let liveRateSource = null;
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/USD`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(1e4)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.result === "success" && data.rates[foreignCurrency] && data.rates[foreignCurrency] > 0) {
          liveRate = 1 / data.rates[foreignCurrency];
          liveRateSource = "ExchangeRate-API (open.er-api.com)";
        }
      }
    } catch {
      try {
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${foreignCurrency}`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(1e4)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.rates[foreignCurrency] && data.rates[foreignCurrency] > 0) {
            liveRate = 1 / data.rates[foreignCurrency];
            liveRateSource = "Frankfurter (ECB)";
          }
        }
      } catch {
      }
    }
    const invoiceTotal = parseFloat(invoice.total?.toString() || "0");
    const invoiceRate = parseFloat(invoice.exchangeRateWithMarkup?.toString() || invoice.exchangeRate?.toString() || "1");
    let liveUsdEquivalent = null;
    let amountDiff = null;
    let amountDiffPercent = null;
    if (liveRate && liveRate > 0 && invoiceRate > 0) {
      const localTotal = invoiceTotal / invoiceRate;
      liveUsdEquivalent = localTotal * liveRate;
      amountDiff = invoiceTotal - liveUsdEquivalent;
      amountDiffPercent = liveUsdEquivalent > 0 ? (invoiceTotal - liveUsdEquivalent) / liveUsdEquivalent * 100 : 0;
    }
    return {
      foreignCurrency,
      invoiceCurrency: invoice.currency || "USD",
      invoiceTotal: invoiceTotal.toFixed(2),
      invoiceExchangeRate: invoice.exchangeRate?.toString() || "1",
      invoiceExchangeRateWithMarkup: invoiceRate.toFixed(6),
      liveRate: liveRate?.toFixed(6) || null,
      liveRateSource,
      liveUsdEquivalent: liveUsdEquivalent?.toFixed(2) || null,
      invoiceUsdEquivalent: invoiceTotal.toFixed(2),
      amountDiff: amountDiff?.toFixed(2) || null,
      amountDiffPercent: amountDiffPercent?.toFixed(2) || null,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  getRelated: userProcedure.input(z5.object({ invoiceId: z5.number() })).query(async ({ input }) => {
    return await getRelatedInvoices(input.invoiceId);
  }),
  create: financeManagerProcedure.input(
    z5.object({
      customerId: z5.number(),
      billingEntityId: z5.number().optional(),
      invoiceType: z5.enum(["deposit", "monthly_eor", "monthly_visa_eor", "monthly_aor", "visa_service", "deposit_refund", "credit_note", "manual"]),
      invoiceMonth: z5.string().optional(),
      currency: z5.string(),
      exchangeRate: z5.string().default("1"),
      exchangeRateWithMarkup: z5.string().default("1"),
      subtotal: z5.string(),
      serviceFeeTotal: z5.string().default("0"),
      tax: z5.string().default("0"),
      notes: z5.string().optional(),
      internalNotes: z5.string().optional(),
      dueDate: z5.string().optional(),
      relatedInvoiceId: z5.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    const [customer] = await db.select({ id: customers.id }).from(customers).where(eq9(customers.id, input.customerId)).limit(1);
    if (!customer) {
      throw new TRPCError7({ code: "BAD_REQUEST", message: `Customer with ID ${input.customerId} does not exist` });
    }
    const subtotal = parseFloat(input.subtotal);
    const serviceFeeTotal = parseFloat(input.serviceFeeTotal);
    const tax = parseFloat(input.tax);
    const total = subtotal + serviceFeeTotal + tax;
    const invoiceNumber = input.invoiceType === "deposit" ? await generateDepositInvoiceNumber(input.billingEntityId) : await generateInvoiceNumber(input.billingEntityId, input.invoiceMonth || (/* @__PURE__ */ new Date()).toISOString());
    const result = await createInvoice({
      customerId: input.customerId,
      billingEntityId: input.billingEntityId,
      invoiceNumber,
      invoiceType: input.invoiceType,
      invoiceMonth: input.invoiceMonth ? new Date(input.invoiceMonth) : /* @__PURE__ */ new Date(),
      currency: input.currency,
      exchangeRate: input.exchangeRate,
      exchangeRateWithMarkup: input.exchangeRateWithMarkup,
      subtotal: input.subtotal,
      serviceFeeTotal: input.serviceFeeTotal,
      tax: input.tax,
      total: total.toString(),
      status: "draft",
      notes: input.notes,
      internalNotes: input.internalNotes,
      dueDate: input.dueDate ? new Date(input.dueDate) : void 0,
      relatedInvoiceId: input.relatedInvoiceId
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "invoice",
      changes: JSON.stringify(input)
    });
    return result;
  }),
  /**
   * Update invoice metadata (only draft invoices can be fully edited)
   */
  update: financeManagerProcedure.input(
    z5.object({
      id: z5.number(),
      data: z5.object({
        notes: z5.string().nullable().optional(),
        internalNotes: z5.string().nullable().optional(),
        dueDate: z5.string().nullable().optional(),
        billingEntityId: z5.number().nullable().optional(),
        customerId: z5.number().optional(),
        currency: z5.string().optional(),
        invoiceType: z5.enum(["deposit", "monthly_eor", "monthly_visa_eor", "monthly_aor", "visa_service", "deposit_refund", "credit_note", "manual"]).optional(),
        invoiceMonth: z5.string().nullable().optional(),
        exchangeRate: z5.string().optional(),
        exchangeRateWithMarkup: z5.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const updateData = {};
    const existingInvoice = await getInvoiceById(input.id);
    const postSentStatuses = ["sent", "paid", "overdue", "void"];
    const isPostSent = existingInvoice && postSentStatuses.includes(existingInvoice.status);
    const canEditExternalNotes = !isPostSent;
    if (input.data.notes !== void 0) {
      if (canEditExternalNotes) {
        updateData.notes = input.data.notes;
      }
    }
    if (input.data.internalNotes !== void 0) updateData.internalNotes = input.data.internalNotes;
    if (input.data.billingEntityId !== void 0) updateData.billingEntityId = input.data.billingEntityId;
    if (input.data.customerId !== void 0) updateData.customerId = input.data.customerId;
    if (input.data.currency !== void 0) updateData.currency = input.data.currency;
    if (input.data.invoiceType !== void 0) updateData.invoiceType = input.data.invoiceType;
    if (input.data.exchangeRate !== void 0) updateData.exchangeRate = input.data.exchangeRate;
    if (input.data.exchangeRateWithMarkup !== void 0) updateData.exchangeRateWithMarkup = input.data.exchangeRateWithMarkup;
    if (input.data.dueDate !== void 0) {
      updateData.dueDate = input.data.dueDate ? new Date(input.data.dueDate) : null;
    }
    if (input.data.invoiceMonth !== void 0) {
      updateData.invoiceMonth = input.data.invoiceMonth ? new Date(input.data.invoiceMonth) : null;
    }
    await updateInvoice(input.id, updateData);
    if (input.data.billingEntityId !== void 0) {
      const invoice = await getInvoiceById(input.id);
      if (invoice && invoice.status === "draft") {
        const newNumber = await generateInvoiceNumber(
          input.data.billingEntityId,
          invoice.invoiceMonth?.toISOString() || (/* @__PURE__ */ new Date()).toISOString()
        );
        await updateInvoice(input.id, { invoiceNumber: newNumber });
      }
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "invoice",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  updateStatus: financeManagerProcedure.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["draft", "pending_review", "sent", "paid", "cancelled"]),
      paidAmount: z5.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.status === "paid") {
      const invoice = await getInvoiceById(input.id);
      if (invoice && (invoice.invoiceType === "credit_note" || invoice.invoiceType === "deposit_refund")) {
        throw new TRPCError7({
          code: "BAD_REQUEST",
          message: `Cannot mark ${invoice.invoiceType.replace("_", " ")} as paid. Credit notes should be applied to invoices, and deposit refunds are processed separately.`
        });
      }
    }
    const updateData = { status: input.status };
    let paymentResult;
    if (input.status === "sent") {
      updateData.sentDate = /* @__PURE__ */ new Date();
    } else if (input.status === "paid") {
      if (!input.paidAmount) {
        throw new TRPCError7({ code: "BAD_REQUEST", message: "Payment amount is required when marking as paid" });
      }
      updateData.paidDate = /* @__PURE__ */ new Date();
      updateData.paidAmount = input.paidAmount;
      const invoice = await getInvoiceById(input.id);
      if (invoice) {
        const invoiceTotal = parseFloat(invoice.total?.toString() ?? "0");
        const creditApplied = parseFloat(invoice.creditApplied?.toString() ?? "0");
        const effectiveAmountDue = creditApplied > 0 ? parseFloat(invoice.amountDue?.toString() ?? (invoiceTotal - creditApplied).toFixed(2)) : invoiceTotal;
        const paidAmt = parseFloat(input.paidAmount);
        const diff = paidAmt - effectiveAmountDue;
        if (Math.abs(diff) < 0.01) {
          paymentResult = { type: "exact", difference: "0.00", invoiceTotal: effectiveAmountDue.toFixed(2) };
        } else if (diff < 0) {
          paymentResult = { type: "underpayment", difference: Math.abs(diff).toFixed(2), invoiceTotal: effectiveAmountDue.toFixed(2) };
        } else {
          paymentResult = { type: "overpayment", difference: diff.toFixed(2), invoiceTotal: effectiveAmountDue.toFixed(2) };
        }
      }
    }
    await updateInvoice(input.id, updateData);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "invoice",
      entityId: input.id,
      changes: JSON.stringify({ status: input.status, paidAmount: input.paidAmount })
    });
    let followUpInvoiceId;
    let creditNoteId;
    if (paymentResult && input.status === "paid") {
      const invoice = await getInvoiceById(input.id);
      if (invoice) {
        if (paymentResult.type === "underpayment") {
          const followUpMonth = /* @__PURE__ */ new Date();
          followUpMonth.setMonth(followUpMonth.getMonth() + 1);
          followUpMonth.setDate(1);
          const followUpNumber = await generateInvoiceNumber(
            invoice.billingEntityId,
            followUpMonth.toISOString()
          );
          const followUpResult = await createInvoice({
            customerId: invoice.customerId,
            billingEntityId: invoice.billingEntityId,
            invoiceNumber: followUpNumber,
            invoiceType: "manual",
            invoiceMonth: followUpMonth,
            currency: invoice.currency || "USD",
            exchangeRate: "1",
            exchangeRateWithMarkup: "1",
            subtotal: paymentResult.difference,
            serviceFeeTotal: "0",
            tax: "0",
            total: paymentResult.difference,
            status: "draft",
            relatedInvoiceId: input.id,
            notes: `Outstanding balance from ${invoice.invoiceNumber}. Original total: ${invoice.currency} ${paymentResult.invoiceTotal}, Paid: ${invoice.currency} ${input.paidAmount}, Shortfall: ${invoice.currency} ${paymentResult.difference}`,
            dueDate: new Date(followUpMonth.getTime() + 30 * 24 * 60 * 60 * 1e3)
          });
          followUpInvoiceId = followUpResult?.insertId || followUpResult?.[0]?.insertId;
          if (followUpInvoiceId) {
            await createInvoiceItem({
              invoiceId: followUpInvoiceId,
              description: `Outstanding balance from invoice ${invoice.invoiceNumber}`,
              quantity: "1",
              unitPrice: paymentResult.difference,
              amount: paymentResult.difference,
              itemType: "employment_cost"
            });
            await logAuditAction({
              userId: ctx.user.id,
              userName: ctx.user.name || null,
              action: "auto_create",
              entityType: "invoice",
              entityId: followUpInvoiceId,
              changes: JSON.stringify({
                type: "underpayment_followup",
                originalInvoiceId: input.id,
                shortfall: paymentResult.difference
              })
            });
            notifyOwner({
              title: `Follow-up Invoice Created (Underpayment)`,
              content: `A follow-up invoice has been automatically created for underpayment on invoice ${invoice.invoiceNumber}.

Original Invoice: ${invoice.invoiceNumber}
Invoice Total: ${invoice.currency} ${paymentResult.invoiceTotal}
Amount Paid: ${invoice.currency} ${input.paidAmount}
Shortfall: ${invoice.currency} ${paymentResult.difference}
Follow-up Invoice ID: #${followUpInvoiceId}

Please review and send the follow-up invoice to the client.`
            }).catch((err) => console.warn("[Notification] Failed to notify about follow-up invoice:", err));
          }
        } else if (paymentResult.type === "overpayment") {
          const creditResult = await generateCreditNote({
            originalInvoiceId: input.id,
            reason: `Overpayment on invoice ${invoice.invoiceNumber}. Paid: ${invoice.currency} ${input.paidAmount}, Invoice total: ${invoice.currency} ${paymentResult.invoiceTotal}, Excess: ${invoice.currency} ${paymentResult.difference}`,
            isFullCredit: false,
            lineItems: [{
              description: `Overpayment credit for invoice ${invoice.invoiceNumber}`,
              amount: paymentResult.difference
            }]
          });
          creditNoteId = creditResult.invoiceId || void 0;
          if (creditNoteId) {
            await logAuditAction({
              userId: ctx.user.id,
              userName: ctx.user.name || null,
              action: "auto_create",
              entityType: "invoice",
              entityId: creditNoteId,
              changes: JSON.stringify({
                type: "overpayment_credit_note",
                originalInvoiceId: input.id,
                excess: paymentResult.difference
              })
            });
            notifyOwner({
              title: `Credit Note Created (Overpayment)`,
              content: `A credit note has been automatically generated for overpayment on invoice ${invoice.invoiceNumber}.

Original Invoice: ${invoice.invoiceNumber}
Invoice Total: ${invoice.currency} ${paymentResult.invoiceTotal}
Amount Paid: ${invoice.currency} ${input.paidAmount}
Excess: ${invoice.currency} ${paymentResult.difference}
Credit Note ID: #${creditNoteId}

Please review and process the credit note accordingly.`
            }).catch((err) => console.warn("[Notification] Failed to notify about credit note:", err));
          }
        }
      }
    }
    return { success: true, paymentResult, followUpInvoiceId, creditNoteId };
  }),
  // ── Line Item CRUD ──────────────────────────────────────────────────
  addItem: financeManagerProcedure.input(
    z5.object({
      invoiceId: z5.number(),
      employeeId: z5.number().optional(),
      description: z5.string(),
      quantity: z5.string().default("1"),
      unitPrice: z5.string(),
      amount: z5.string(),
      itemType: invoiceItemTypeEnum,
      vatRate: z5.string().default("0"),
      countryCode: z5.string().optional(),
      localCurrency: z5.string().optional(),
      localAmount: z5.string().optional(),
      exchangeRate: z5.string().optional(),
      exchangeRateWithMarkup: z5.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const invoice = await getInvoiceById(input.invoiceId);
    if (!invoice) {
      throw new TRPCError7({ code: "NOT_FOUND", message: "Invoice not found" });
    }
    if (invoice.status !== "draft") {
      throw new TRPCError7({
        code: "PRECONDITION_FAILED",
        message: "Can only add items to draft invoices"
      });
    }
    if (input.localCurrency && input.localCurrency !== invoice.currency) {
      const existingItems = await listInvoiceItemsByInvoice(input.invoiceId);
      const existingForeignCurrencies = new Set(
        existingItems.map((item) => item.localCurrency).filter((c) => c && c !== invoice.currency)
      );
      const foreignArr = Array.from(existingForeignCurrencies);
      if (foreignArr.length > 0 && !existingForeignCurrencies.has(input.localCurrency)) {
        throw new TRPCError7({
          code: "PRECONDITION_FAILED",
          message: `Invoice already has foreign currency ${foreignArr[0]}. Only invoice currency (${invoice.currency}) or ${foreignArr[0]} allowed.`
        });
      }
    }
    if (input.localCurrency && input.localCurrency !== "USD" && input.localCurrency !== invoice.currency) {
      if (!input.exchangeRate || input.exchangeRate === "1" || input.exchangeRate === "0") {
        const rateData = await getExchangeRate(input.localCurrency, invoice.currency || "USD");
        if (rateData) {
          input.exchangeRate = rateData.rate.toFixed(6);
          input.exchangeRateWithMarkup = rateData.rateWithMarkup.toFixed(6);
        }
      }
    }
    const result = await createInvoiceItem(input);
    await recalculateInvoiceTotals(input.invoiceId);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "invoice_item",
      changes: JSON.stringify(input)
    });
    return result;
  }),
  updateItem: financeManagerProcedure.input(
    z5.object({
      id: z5.number(),
      invoiceId: z5.number(),
      data: z5.object({
        description: z5.string().optional(),
        quantity: z5.string().optional(),
        unitPrice: z5.string().optional(),
        amount: z5.string().optional(),
        itemType: invoiceItemTypeEnum.optional(),
        vatRate: z5.string().optional(),
        employeeId: z5.number().nullable().optional(),
        countryCode: z5.string().optional(),
        localCurrency: z5.string().optional(),
        localAmount: z5.string().optional(),
        exchangeRate: z5.string().optional(),
        exchangeRateWithMarkup: z5.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const invoice = await getInvoiceById(input.invoiceId);
    if (!invoice) {
      throw new TRPCError7({ code: "NOT_FOUND", message: "Invoice not found" });
    }
    if (invoice.status !== "draft") {
      throw new TRPCError7({
        code: "PRECONDITION_FAILED",
        message: "Can only edit items on draft invoices"
      });
    }
    if (input.data.localCurrency && input.data.localCurrency !== "USD" && input.data.localCurrency !== invoice.currency) {
      if (!input.data.exchangeRate || input.data.exchangeRate === "1" || input.data.exchangeRate === "0") {
        const rateData = await getExchangeRate(input.data.localCurrency, invoice.currency || "USD");
        if (rateData) {
          input.data.exchangeRate = rateData.rate.toFixed(6);
          input.data.exchangeRateWithMarkup = rateData.rateWithMarkup.toFixed(6);
        }
      }
    }
    await updateInvoiceItem(input.id, input.data);
    await recalculateInvoiceTotals(input.invoiceId);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "invoice_item",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  deleteItem: financeManagerProcedure.input(
    z5.object({
      id: z5.number(),
      invoiceId: z5.number()
    })
  ).mutation(async ({ input, ctx }) => {
    const invoice = await getInvoiceById(input.invoiceId);
    if (!invoice) {
      throw new TRPCError7({ code: "NOT_FOUND", message: "Invoice not found" });
    }
    if (invoice.status !== "draft") {
      throw new TRPCError7({
        code: "PRECONDITION_FAILED",
        message: "Can only delete items from draft invoices"
      });
    }
    await deleteInvoiceItem(input.id);
    await recalculateInvoiceTotals(input.invoiceId);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "invoice_item",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Delete invoice — any draft or cancelled invoice can be deleted
   * Auto-generated invoices can be recreated via Regenerate if needed
   */
  delete: financeManagerProcedure.input(z5.object({ id: z5.number() })).mutation(async ({ input, ctx }) => {
    const invoice = await getInvoiceById(input.id);
    if (!invoice) throw new TRPCError7({ code: "NOT_FOUND", message: "Invoice not found" });
    const deletableStatuses = ["draft", "cancelled"];
    if (!deletableStatuses.includes(invoice.status || "")) {
      throw new TRPCError7({
        code: "BAD_REQUEST",
        message: `Only draft or cancelled invoices can be deleted. Current status: ${invoice.status}`
      });
    }
    await deleteInvoice(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "invoice",
      entityId: input.id,
      changes: JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType,
        status: invoice.status,
        total: invoice.total
      })
    });
    return { success: true };
  }),
  /**
   * Monthly overview: aggregated invoice data per month
   * Returns months with invoice counts, totals, and status breakdown
   */
  monthlyOverview: userProcedure.input(
    z5.object({
      year: z5.number().optional(),
      limit: z5.number().default(12)
    })
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const allInvoices = await db.select({
      id: invoices.id,
      invoiceMonth: invoices.invoiceMonth,
      invoiceType: invoices.invoiceType,
      status: invoices.status,
      total: invoices.total,
      currency: invoices.currency,
      customerId: invoices.customerId,
      billingEntityId: invoices.billingEntityId,
      createdAt: invoices.createdAt,
      paidAmount: invoices.paidAmount
    }).from(invoices).orderBy(sql4`${invoices.invoiceMonth} DESC, ${invoices.createdAt} DESC`);
    const monthMap = /* @__PURE__ */ new Map();
    for (const inv of allInvoices) {
      const monthKey = inv.invoiceMonth ? new Date(inv.invoiceMonth).toISOString().slice(0, 7) : inv.createdAt ? new Date(inv.createdAt).toISOString().slice(0, 7) : "unknown";
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          invoiceCount: 0,
          statusBreakdown: {},
          typeBreakdown: {},
          customerCount: 0,
          customers: /* @__PURE__ */ new Set(),
          currencyBreakdowns: /* @__PURE__ */ new Map()
        });
      }
      const entry = monthMap.get(monthKey);
      entry.invoiceCount++;
      entry.statusBreakdown[inv.status || "draft"] = (entry.statusBreakdown[inv.status || "draft"] || 0) + 1;
      entry.typeBreakdown[inv.invoiceType || "monthly"] = (entry.typeBreakdown[inv.invoiceType || "monthly"] || 0) + 1;
      if (inv.customerId) entry.customers.add(inv.customerId);
      const ccy = inv.currency || "USD";
      if (!entry.currencyBreakdowns.has(ccy)) {
        entry.currencyBreakdowns.set(ccy, { totalAmount: 0, paidAmount: 0, invoiceCount: 0 });
      }
      const ccyEntry = entry.currencyBreakdowns.get(ccy);
      const invTotal = parseFloat(inv.total?.toString() ?? "0");
      if (inv.status !== "cancelled") {
        ccyEntry.totalAmount += invTotal;
        ccyEntry.invoiceCount++;
        if (inv.status === "paid" && inv.paidAmount) {
          ccyEntry.paidAmount += parseFloat(inv.paidAmount.toString());
        }
      }
    }
    const result = Array.from(monthMap.values()).map(({ customers: customers2, currencyBreakdowns, ...rest }) => {
      const currencies = Array.from(currencyBreakdowns.entries()).map(([currency, data]) => ({
        currency,
        totalAmount: data.totalAmount,
        paidAmount: data.paidAmount,
        invoiceCount: data.invoiceCount,
        collectionRate: data.totalAmount > 0 ? Math.round(data.paidAmount / data.totalAmount * 1e4) / 100 : 0
      })).sort((a, b) => b.totalAmount - a.totalAmount);
      return {
        ...rest,
        customerCount: customers2.size,
        currencies
      };
    }).sort((a, b) => b.month.localeCompare(a.month)).slice(0, input.limit);
    return result;
  }),
  // ── Credit Note ──────────────────────────────────────────────────────
  /**
   * Create a credit note for an existing invoice
   * Can be full credit (negate entire invoice) or partial (specific line items)
   */
  createCreditNote: financeManagerProcedure.input(
    z5.object({
      originalInvoiceId: z5.number(),
      reason: z5.string().min(1, "Reason is required"),
      isFullCredit: z5.boolean().default(false),
      lineItems: z5.array(
        z5.object({
          description: z5.string(),
          amount: z5.string(),
          employeeId: z5.number().optional(),
          countryCode: z5.string().optional()
        })
      ).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const originalInvoice = await getInvoiceById(input.originalInvoiceId);
    if (!originalInvoice) {
      throw new TRPCError7({ code: "NOT_FOUND", message: "Original invoice not found" });
    }
    if (originalInvoice.status !== "paid") {
      throw new TRPCError7({
        code: "BAD_REQUEST",
        message: `Credit notes can only be created for paid invoices. Current status: ${originalInvoice.status}`
      });
    }
    const result = await generateCreditNote({
      originalInvoiceId: input.originalInvoiceId,
      reason: input.reason,
      isFullCredit: input.isFullCredit,
      lineItems: input.lineItems
    });
    if (result.invoiceId) {
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "generate",
        entityType: "invoice",
        entityId: result.invoiceId,
        changes: JSON.stringify({
          type: "credit_note",
          originalInvoiceId: input.originalInvoiceId,
          reason: input.reason,
          isFullCredit: input.isFullCredit
        })
      });
      const originalInvoice2 = await getInvoiceById(input.originalInvoiceId);
      notifyOwner({
        title: `Credit Note Created${input.isFullCredit ? " (Full)" : " (Partial)"}`,
        content: `A ${input.isFullCredit ? "full" : "partial"} credit note has been created for invoice ${originalInvoice2?.invoiceNumber || `#${input.originalInvoiceId}`}.

Reason: ${input.reason}
Credit Note ID: #${result.invoiceId}
Type: ${input.isFullCredit ? "Full Credit" : "Partial Credit"}

Please review and process accordingly.`
      }).catch((err) => console.warn("[Notification] Failed to notify about credit note:", err));
    }
    return result;
  }),
  // ── Deposit Refund (manual trigger) ─────────────────────────────────
  /**
   * Manually generate a deposit refund for an employee
   * Usually auto-triggered on termination, but can be manually created
   */
  createDepositRefund: financeManagerProcedure.input(
    z5.object({
      employeeId: z5.number()
    })
  ).mutation(async ({ input, ctx }) => {
    const result = await generateDepositRefund(input.employeeId);
    if (result.invoiceId) {
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "generate",
        entityType: "invoice",
        entityId: result.invoiceId,
        changes: JSON.stringify({
          type: "deposit_refund",
          employeeId: input.employeeId,
          trigger: "manual"
        })
      });
    }
    return result;
  }),
  // ── Batch Operations ────────────────────────────────────────────────
  /**
   * Batch update invoice status
   * Supports batch send, batch mark as paid, batch cancel
   */
  batchUpdateStatus: financeManagerProcedure.input(
    z5.object({
      invoiceIds: z5.array(z5.number()).min(1),
      status: z5.enum(["pending_review", "sent", "paid", "cancelled"]),
      paidAmount: z5.string().optional()
      // For batch mark as paid
    })
  ).mutation(async ({ input, ctx }) => {
    const results = [];
    const validTransitions = {
      draft: ["pending_review", "cancelled"],
      pending_review: ["sent", "cancelled"],
      sent: ["paid", "cancelled"],
      overdue: ["paid", "cancelled"]
    };
    for (const invoiceId of input.invoiceIds) {
      try {
        const invoice = await getInvoiceById(invoiceId);
        if (!invoice) {
          results.push({ id: invoiceId, success: false, message: "Invoice not found" });
          continue;
        }
        if (input.status === "paid" && (invoice.invoiceType === "credit_note" || invoice.invoiceType === "deposit_refund")) {
          results.push({
            id: invoiceId,
            success: false,
            message: `Cannot mark ${invoice.invoiceType?.replace("_", " ")} as paid`
          });
          continue;
        }
        const allowed = validTransitions[invoice.status || "draft"] || [];
        if (!allowed.includes(input.status)) {
          results.push({
            id: invoiceId,
            success: false,
            message: `Cannot transition from '${invoice.status}' to '${input.status}'`
          });
          continue;
        }
        const updateData = { status: input.status };
        if (input.status === "sent") {
          updateData.sentDate = /* @__PURE__ */ new Date();
        } else if (input.status === "paid") {
          if (!input.paidAmount) {
            results.push({ id: invoiceId, success: false, message: "Payment amount is required when marking as paid" });
            continue;
          }
          updateData.paidDate = /* @__PURE__ */ new Date();
          updateData.paidAmount = input.paidAmount;
        }
        await updateInvoice(invoiceId, updateData);
        results.push({ id: invoiceId, success: true, message: `Status updated to ${input.status}` });
      } catch (error) {
        results.push({
          id: invoiceId,
          success: false,
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "batch_update",
      entityType: "invoice",
      changes: JSON.stringify({
        invoiceIds: input.invoiceIds,
        targetStatus: input.status,
        results: results.map((r) => ({ id: r.id, success: r.success }))
      })
    });
    const successCount = results.filter((r) => r.success).length;
    return {
      results,
      summary: {
        total: input.invoiceIds.length,
        success: successCount,
        failed: input.invoiceIds.length - successCount
      }
    };
  }),
  // ── Credit Note Apply Mechanism ──────────────────────────────────────
  /**
   * Apply a credit note to an invoice (offset credit against outstanding amount)
   */
  applyCreditToInvoice: financeManagerProcedure.input(
    z5.object({
      creditNoteId: z5.number(),
      appliedToInvoiceId: z5.number(),
      appliedAmount: z5.string(),
      // Decimal as string
      notes: z5.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const creditNote = await getInvoiceById(input.creditNoteId);
    if (!creditNote || creditNote.invoiceType !== "credit_note") {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "Invalid credit note" });
    }
    if (creditNote.status !== "sent") {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "Credit note must be in 'sent' status to be applied. Current status: " + creditNote.status });
    }
    const targetInvoice = await getInvoiceById(input.appliedToInvoiceId);
    if (!targetInvoice) {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "Target invoice not found" });
    }
    if (targetInvoice.status !== "pending_review") {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "Credit can only be applied to invoices in Pending Review status. Once an invoice is sent to the customer, it cannot be modified with credit." });
    }
    if (creditNote.customerId !== targetInvoice.customerId) {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "Credit note and target invoice must belong to the same customer" });
    }
    if (targetInvoice.invoiceType === "credit_note" || targetInvoice.invoiceType === "deposit_refund") {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "Cannot apply credit to a credit note or deposit refund" });
    }
    const balance = await getCreditNoteRemainingBalance(input.creditNoteId);
    if (!balance) {
      throw new TRPCError7({ code: "INTERNAL_SERVER_ERROR", message: "Could not calculate credit note balance" });
    }
    const applyAmount = parseFloat(input.appliedAmount);
    if (applyAmount <= 0) {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "Applied amount must be positive" });
    }
    if (applyAmount > balance.remainingBalance + 0.01) {
      throw new TRPCError7({
        code: "BAD_REQUEST",
        message: `Applied amount (${applyAmount.toFixed(2)}) exceeds credit note remaining balance (${balance.remainingBalance.toFixed(2)})`
      });
    }
    const targetInvoiceTotal = Math.abs(parseFloat(targetInvoice.total?.toString() ?? "0"));
    const existingApplications = await listApplicationsForInvoice(input.appliedToInvoiceId);
    const alreadyAppliedToTarget = existingApplications.reduce(
      (sum2, app) => sum2 + parseFloat(app.appliedAmount?.toString() ?? "0"),
      0
    );
    const cashAlreadyPaid = parseFloat(targetInvoice.paidAmount?.toString() ?? "0");
    const targetRemainingBalance = targetInvoiceTotal - alreadyAppliedToTarget - cashAlreadyPaid;
    if (targetRemainingBalance <= 0.01) {
      throw new TRPCError7({
        code: "BAD_REQUEST",
        message: `Target invoice is already fully covered (total: ${targetInvoiceTotal.toFixed(2)}, applied: ${alreadyAppliedToTarget.toFixed(2)}, cash paid: ${cashAlreadyPaid.toFixed(2)})`
      });
    }
    if (applyAmount > targetRemainingBalance + 0.01) {
      throw new TRPCError7({
        code: "BAD_REQUEST",
        message: `Applied amount (${applyAmount.toFixed(2)}) exceeds target invoice remaining balance (${targetRemainingBalance.toFixed(2)})`
      });
    }
    const applicationId = await applyCreditNote({
      creditNoteId: input.creditNoteId,
      appliedToInvoiceId: input.appliedToInvoiceId,
      appliedAmount: applyAmount.toFixed(2),
      notes: input.notes || null,
      appliedBy: ctx.user.id
    });
    const newBalance = await getCreditNoteRemainingBalance(input.creditNoteId);
    if (newBalance && newBalance.remainingBalance <= 0.01) {
      await updateInvoice(input.creditNoteId, { status: "applied" });
    }
    const updatedApplications = await listApplicationsForInvoice(input.appliedToInvoiceId);
    const totalAppliedToTarget = updatedApplications.reduce(
      (sum2, app) => sum2 + parseFloat(app.appliedAmount?.toString() ?? "0"),
      0
    );
    const totalCoverage = totalAppliedToTarget + cashAlreadyPaid;
    const adjustedAmountDue = Math.max(0, targetInvoiceTotal - totalAppliedToTarget);
    await updateInvoice(input.appliedToInvoiceId, {
      creditApplied: totalAppliedToTarget.toFixed(2),
      amountDue: adjustedAmountDue.toFixed(2)
    });
    let targetInvoiceNewStatus = targetInvoice.status;
    const isFullyCovered = totalCoverage >= targetInvoiceTotal - 0.01;
    if (isFullyCovered) {
      await updateInvoice(input.appliedToInvoiceId, {
        status: "paid",
        paidDate: /* @__PURE__ */ new Date(),
        paidAmount: totalCoverage.toFixed(2)
      });
      targetInvoiceNewStatus = "paid";
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "apply_credit",
      entityType: "credit_note_application",
      entityId: applicationId,
      changes: JSON.stringify({
        creditNoteId: input.creditNoteId,
        appliedToInvoiceId: input.appliedToInvoiceId,
        amount: applyAmount.toFixed(2),
        creditNoteNumber: creditNote.invoiceNumber,
        targetInvoiceNumber: targetInvoice.invoiceNumber,
        targetInvoiceAutoMarkedPaid: isFullyCovered
      })
    });
    return {
      applicationId,
      remainingBalance: newBalance?.remainingBalance ?? 0,
      creditNoteStatus: (newBalance?.remainingBalance ?? 0) <= 0.01 ? "applied" : creditNote.status,
      targetInvoiceStatus: targetInvoiceNewStatus,
      targetInvoiceTotalCoverage: totalCoverage.toFixed(2)
    };
  }),
  /**
   * Get credit note balance and application history
   */
  creditNoteBalance: userProcedure.input(z5.object({ creditNoteId: z5.number() })).query(async ({ input }) => {
    const balance = await getCreditNoteRemainingBalance(input.creditNoteId);
    if (!balance) {
      throw new TRPCError7({ code: "NOT_FOUND", message: "Credit note not found" });
    }
    const applications = await listCreditNoteApplications(input.creditNoteId);
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const invoice = await getInvoiceById(app.appliedToInvoiceId);
        return {
          ...app,
          appliedToInvoiceNumber: invoice?.invoiceNumber || "Unknown"
        };
      })
    );
    return {
      ...balance,
      applications: enrichedApplications
    };
  }),
  /**
   * Get credit applications for a specific invoice (credits applied to this invoice)
   */
  invoiceCreditApplications: userProcedure.input(z5.object({ invoiceId: z5.number() })).query(async ({ input }) => {
    const applications = await listApplicationsForInvoice(input.invoiceId);
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const creditNote = await getInvoiceById(app.creditNoteId);
        return {
          ...app,
          creditNoteNumber: creditNote?.invoiceNumber || "Unknown"
        };
      })
    );
    return enrichedApplications;
  }),
  /**
   * List available credit notes for a customer (sent status with remaining balance > 0)
   */
  availableCreditNotes: userProcedure.input(z5.object({ customerId: z5.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const creditNotes = await db.select().from(invoices).where(
      and8(
        eq9(invoices.customerId, input.customerId),
        eq9(invoices.invoiceType, "credit_note"),
        eq9(invoices.status, "sent")
      )
    );
    const result = await Promise.all(
      creditNotes.map(async (cn) => {
        const balance = await getCreditNoteRemainingBalance(cn.id);
        return {
          id: cn.id,
          invoiceNumber: cn.invoiceNumber,
          total: cn.total,
          currency: cn.currency,
          remainingBalance: balance?.remainingBalance ?? 0,
          status: cn.status
        };
      })
    );
    return result.filter((cn) => cn.remainingBalance > 0.01);
  })
});

// server/routers/invoiceGeneration.ts
import { z as z6 } from "zod";

// server/services/invoiceGenerationService.ts
init_db();
init_schema();
import { eq as eq10, and as and9, sql as sql5 } from "drizzle-orm";
var SERVICE_TYPE_TO_INVOICE_TYPE = {
  eor: "monthly_eor",
  visa_eor: "monthly_visa_eor",
  aor: "monthly_aor"
};
var SERVICE_TYPE_TO_FEE_TYPE = {
  eor: "eor_service_fee",
  visa_eor: "visa_eor_service_fee",
  aor: "aor_service_fee"
};
var SERVICE_TYPE_LABELS = {
  eor: "EOR Service Fee",
  visa_eor: "Visa EOR Service Fee",
  aor: "AOR Service Fee"
};
async function generateInvoicesFromPayroll(payrollMonth) {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available", error: "DB_ERROR" };
  }
  try {
    const warnings = [];
    const y = payrollMonth.getUTCFullYear();
    const m = String(payrollMonth.getUTCMonth() + 1).padStart(2, "0");
    const d = String(payrollMonth.getUTCDate()).padStart(2, "0");
    const payrollMonthStr = `${y}-${m}-${d}`;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabel = `${monthNames[payrollMonth.getUTCMonth()]} ${y}`;
    const payrollRunsData = await db.select().from(payrollRuns).where(
      and9(
        sql5`DATE(${payrollRuns.payrollMonth}) = ${payrollMonthStr}`,
        eq10(payrollRuns.status, "approved")
      )
    );
    if (payrollRunsData.length === 0) {
      return {
        success: false,
        message: `No approved payroll runs found for ${payrollMonthStr}. Only approved payroll runs can generate invoices.`,
        error: "NO_APPROVED_PAYROLL"
      };
    }
    const allRunsForMonth = await db.select().from(payrollRuns).where(sql5`DATE(${payrollRuns.payrollMonth}) = ${payrollMonthStr}`);
    const nonApprovedRuns = allRunsForMonth.filter((r) => r.status !== "approved");
    if (nonApprovedRuns.length > 0) {
      warnings.push(
        `${nonApprovedRuns.length} payroll run(s) for this month are not yet approved and were excluded from invoice generation.`
      );
    }
    const allEntries = [];
    const customerCache = /* @__PURE__ */ new Map();
    const countryConfigCache = /* @__PURE__ */ new Map();
    for (const run of payrollRunsData) {
      const items = await db.select().from(payrollItems).where(eq10(payrollItems.payrollRunId, run.id));
      if (items.length === 0) continue;
      if (!countryConfigCache.has(run.countryCode)) {
        const cc = await getCountryConfig(run.countryCode);
        countryConfigCache.set(run.countryCode, cc);
      }
      for (const item of items) {
        const empData = await db.select().from(employees).where(eq10(employees.id, item.employeeId)).limit(1);
        if (empData.length === 0) continue;
        const emp = empData[0];
        if (!customerCache.has(emp.customerId)) {
          const custData = await db.select().from(customers).where(eq10(customers.id, emp.customerId)).limit(1);
          if (custData.length === 0) continue;
          customerCache.set(emp.customerId, custData[0]);
        }
        allEntries.push({
          item,
          employee: emp,
          run,
          customer: customerCache.get(emp.customerId),
          countryConfig: countryConfigCache.get(run.countryCode)
        });
      }
    }
    const invoiceGroups = /* @__PURE__ */ new Map();
    for (const entry of allEntries) {
      const customerId = entry.employee.customerId;
      const serviceType = entry.employee.serviceType || "eor";
      const countryCode = entry.run.countryCode;
      const localCurrency = entry.run.currency || entry.employee.salaryCurrency || "USD";
      const serviceFeeRate = await getServiceFeeRate(
        customerId,
        countryCode,
        serviceType,
        entry.countryConfig,
        entry.customer.settlementCurrency || "USD",
        warnings
      );
      const key = `${customerId}|${serviceType}|${countryCode}|${localCurrency}|${serviceFeeRate.toFixed(2)}`;
      if (!invoiceGroups.has(key)) {
        invoiceGroups.set(key, []);
      }
      invoiceGroups.get(key).push(entry);
    }
    const invoiceIds = [];
    let skippedDuplicates = 0;
    const existingInvoicesForMonth = await db.select().from(invoices).where(
      and9(
        sql5`${invoices.invoiceMonth} = ${payrollMonthStr}`,
        sql5`${invoices.status} != 'cancelled'`,
        sql5`${invoices.status} != 'void'`
      )
    );
    for (const [key, entries] of Array.from(invoiceGroups.entries())) {
      const [customerIdStr, serviceType, countryCode, localCurrency, serviceFeeRateStr] = key.split("|");
      const customerId = parseInt(customerIdStr);
      const customer = customerCache.get(customerId);
      const serviceFeeRate = parseFloat(serviceFeeRateStr);
      const invoiceType = SERVICE_TYPE_TO_INVOICE_TYPE[serviceType] || "monthly_eor";
      const duplicate = existingInvoicesForMonth.find(
        (inv) => inv.customerId === customerId && inv.invoiceType === invoiceType && inv.currency === localCurrency
      );
      if (duplicate) {
        skippedDuplicates++;
        warnings.push(
          `Skipped: Invoice for ${customer.companyName} (${invoiceType}, ${countryCode}, ${localCurrency}) already exists for this month (Invoice #${duplicate.invoiceNumber}).`
        );
        continue;
      }
      const invoiceId = await createGroupInvoice(
        customerId,
        customer,
        serviceType,
        countryCode,
        localCurrency,
        serviceFeeRate,
        entries,
        payrollMonth,
        monthLabel,
        warnings
      );
      if (invoiceId) {
        invoiceIds.push(invoiceId);
      }
    }
    if (skippedDuplicates > 0 && invoiceIds.length === 0) {
      return {
        success: true,
        invoiceIds: [],
        message: `All invoices for this month already exist. ${skippedDuplicates} duplicate(s) skipped.`,
        warnings: warnings.length > 0 ? warnings : void 0
      };
    }
    return {
      success: true,
      invoiceIds,
      message: `Successfully generated ${invoiceIds.length} draft invoice(s) from ${payrollRunsData.length} approved payroll run(s)`,
      warnings: warnings.length > 0 ? warnings : void 0
    };
  } catch (error) {
    console.error("[InvoiceGeneration] Error generating invoices:", error);
    return {
      success: false,
      message: "Failed to generate invoices",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    };
  }
}
async function getServiceFeeRate(customerId, countryCode, serviceType, countryConfig, settlementCurrency, warnings) {
  const customerPricingData = await listCustomerPricing(customerId);
  const countrySpecificPricing = customerPricingData?.find(
    (p) => p.pricingType === "country_specific" && p.countryCode === countryCode && p.serviceType === serviceType && p.isActive
  );
  if (countrySpecificPricing && countrySpecificPricing.fixedPrice) {
    const perEmployeeFee = parseFloat(countrySpecificPricing.fixedPrice?.toString() ?? "0");
    const pricingCurrency = countrySpecificPricing.currency || "USD";
    let feeInSettlement2 = perEmployeeFee;
    if (pricingCurrency !== settlementCurrency) {
      const feeRate = await getExchangeRate(pricingCurrency, settlementCurrency);
      if (feeRate) {
        feeInSettlement2 = perEmployeeFee * feeRate.rate;
      }
    }
    return feeInSettlement2;
  }
  const globalDiscount = customerPricingData?.find(
    (p) => p.pricingType === "global_discount" && p.isActive
  );
  let standardRate = 0;
  if (countryConfig) {
    if (serviceType === "eor") {
      standardRate = parseFloat(countryConfig.standardEorRate?.toString() ?? "0");
    } else if (serviceType === "visa_eor") {
      standardRate = parseFloat(countryConfig.standardVisaEorRate?.toString() ?? "0");
    } else if (serviceType === "aor") {
      standardRate = parseFloat(countryConfig.standardAorRate?.toString() ?? "0");
    }
  }
  if (globalDiscount) {
    const discountPct = parseFloat(globalDiscount.globalDiscountPercent?.toString() ?? "0");
    standardRate = standardRate * (1 - discountPct / 100);
  }
  const rateCurrency = countryConfig?.standardRateCurrency || "USD";
  let feeInSettlement = standardRate;
  if (rateCurrency !== settlementCurrency) {
    const feeRate = await getExchangeRate(rateCurrency, settlementCurrency);
    if (feeRate) {
      feeInSettlement = standardRate * feeRate.rate;
    }
  }
  return feeInSettlement;
}
async function createGroupInvoice(customerId, customer, serviceType, countryCode, localCurrency, serviceFeeRate, entries, payrollMonth, monthLabel, warnings) {
  const db = await getDb();
  if (!db) return null;
  try {
    const settlementCurrency = customer.settlementCurrency || "USD";
    const invoiceType = SERVICE_TYPE_TO_INVOICE_TYPE[serviceType] || "monthly_eor";
    const feeItemType = SERVICE_TYPE_TO_FEE_TYPE[serviceType] || "eor_service_fee";
    const feeLabel = SERVICE_TYPE_LABELS[serviceType] || "Service Fee";
    const countryConfig = entries[0].countryConfig;
    const vatApplicable = countryConfig?.vatApplicable ?? false;
    const vatRate = vatApplicable ? parseFloat(countryConfig?.vatRate?.toString() ?? "0") : 0;
    let totalSubtotal = 0;
    let totalTax = 0;
    const lineItems = [];
    let exchangeRate = 1;
    let rateWithMarkup = 1;
    if (localCurrency !== settlementCurrency) {
      const rateData = await getExchangeRate(localCurrency, settlementCurrency);
      if (rateData) {
        exchangeRate = rateData.rate;
        rateWithMarkup = rateData.rateWithMarkup;
      } else {
        warnings.push(
          `No exchange rate found for ${localCurrency} \u2192 ${settlementCurrency}. Using 1:1 rate.`
        );
      }
    }
    for (const entry of entries) {
      const emp = entry.employee;
      const totalCostLocal = parseFloat(entry.item.totalEmploymentCost?.toString() ?? "0");
      const costInSettlement = totalCostLocal * rateWithMarkup;
      const taxAmount = costInSettlement * (vatRate / 100);
      totalSubtotal += costInSettlement;
      totalTax += taxAmount;
      const empCode = emp.employeeCode || `EMP${emp.id}`;
      const empName = `${emp.firstName} ${emp.lastName}`;
      lineItems.push({
        invoiceId: 0,
        employeeId: entry.item.employeeId,
        description: `${empCode} ${empName} - ${monthLabel}`,
        quantity: "1",
        unitPrice: totalCostLocal.toFixed(2),
        amount: totalCostLocal.toFixed(2),
        itemType: "employment_cost",
        vatRate: vatRate.toFixed(2),
        countryCode: entry.run.countryCode,
        localCurrency,
        localAmount: totalCostLocal.toFixed(2),
        exchangeRate: exchangeRate.toString(),
        exchangeRateWithMarkup: rateWithMarkup.toString()
      });
    }
    if (serviceFeeRate > 0) {
      const totalFee = serviceFeeRate * entries.length;
      totalSubtotal += totalFee;
      lineItems.push({
        invoiceId: 0,
        description: `${feeLabel} - ${monthLabel}`,
        quantity: entries.length.toString(),
        unitPrice: serviceFeeRate.toFixed(2),
        amount: totalFee.toFixed(2),
        itemType: feeItemType,
        vatRate: "0.00",
        countryCode
      });
    }
    const total = totalSubtotal + totalTax;
    const billingEntityId = customer.billingEntityId || null;
    const invoiceNumber = await generateInvoiceNumber(billingEntityId, payrollMonth);
    const issueDate = /* @__PURE__ */ new Date();
    const termDays = customer.paymentTermDays || 30;
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + termDays);
    const countryName = countryConfig?.countryName || countryCode;
    const invoiceData = {
      customerId,
      billingEntityId,
      invoiceNumber,
      invoiceType,
      invoiceMonth: payrollMonth,
      currency: settlementCurrency,
      exchangeRate: exchangeRate.toString(),
      exchangeRateWithMarkup: rateWithMarkup.toString(),
      subtotal: totalSubtotal.toFixed(2),
      serviceFeeTotal: "0.00",
      // Service fees are included in subtotal
      tax: totalTax.toFixed(2),
      total: total.toFixed(2),
      status: "draft",
      dueDate,
      notes: `Auto-generated ${feeLabel.replace(" Fee", "")} invoice for ${monthLabel} \u2014 ${countryName}`
    };
    const invoiceInsertResult = await db.insert(invoices).values(invoiceData);
    const invoiceId = invoiceInsertResult[0]?.insertId;
    const finalLineItems = lineItems.map((li) => ({ ...li, invoiceId }));
    if (finalLineItems.length > 0) {
      await db.insert(invoiceItems).values(finalLineItems);
    }
    return invoiceId;
  } catch (error) {
    console.error("[InvoiceGeneration] Error creating group invoice:", error);
    return null;
  }
}
async function getInvoiceGenerationStatus(payrollMonth) {
  const db = await getDb();
  if (!db) return null;
  const y = payrollMonth.getUTCFullYear();
  const m = String(payrollMonth.getUTCMonth() + 1).padStart(2, "0");
  const d = String(payrollMonth.getUTCDate()).padStart(2, "0");
  const monthStr = `${y}-${m}-${d}`;
  const invoicesData = await db.select().from(invoices).where(sql5`DATE(${invoices.invoiceMonth}) = ${monthStr}`);
  return {
    payrollMonth: payrollMonth.toISOString().split("T")[0],
    totalInvoices: invoicesData.length,
    byStatus: {
      draft: invoicesData.filter((i) => i.status === "draft").length,
      sent: invoicesData.filter((i) => i.status === "sent").length,
      paid: invoicesData.filter((i) => i.status === "paid").length,
      overdue: invoicesData.filter((i) => i.status === "overdue").length
    }
  };
}
async function regenerateSingleInvoice(invoiceId) {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available", error: "DB_ERROR" };
  }
  try {
    const invoiceData = await db.select().from(invoices).where(eq10(invoices.id, invoiceId)).limit(1);
    if (invoiceData.length === 0) {
      return { success: false, message: "Invoice not found", error: "NOT_FOUND" };
    }
    const invoice = invoiceData[0];
    if (invoice.status !== "draft") {
      return { success: false, message: "Only draft invoices can be regenerated", error: "INVALID_STATUS" };
    }
    if (!invoice.invoiceMonth) {
      return { success: false, message: "Invoice has no invoice month, cannot regenerate", error: "NO_MONTH" };
    }
    await db.delete(invoiceItems).where(eq10(invoiceItems.invoiceId, invoiceId));
    await db.delete(invoices).where(eq10(invoices.id, invoiceId));
    const result = await generateInvoicesFromPayroll(new Date(invoice.invoiceMonth));
    return {
      ...result,
      message: result.success ? `Invoice #${invoice.invoiceNumber} regenerated successfully (${result.invoiceIds?.length || 0} invoices created for the month)` : result.message
    };
  } catch (error) {
    console.error("[InvoiceGeneration] Error regenerating single invoice:", error);
    return {
      success: false,
      message: "Failed to regenerate invoice",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    };
  }
}
async function regenerateInvoices(payrollMonth) {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available", error: "DB_ERROR" };
  }
  try {
    const ry = payrollMonth.getUTCFullYear();
    const rm = String(payrollMonth.getUTCMonth() + 1).padStart(2, "0");
    const rd = String(payrollMonth.getUTCDate()).padStart(2, "0");
    const regenMonthStr = `${ry}-${rm}-${rd}`;
    const draftInvoices = await db.select().from(invoices).where(
      and9(
        sql5`DATE(${invoices.invoiceMonth}) = ${regenMonthStr}`,
        eq10(invoices.status, "draft")
      )
    );
    for (const invoice of draftInvoices) {
      if (invoice.id) {
        await db.delete(invoiceItems).where(eq10(invoiceItems.invoiceId, invoice.id));
        await db.delete(invoices).where(eq10(invoices.id, invoice.id));
      }
    }
    return await generateInvoicesFromPayroll(payrollMonth);
  } catch (error) {
    console.error("[InvoiceGeneration] Error regenerating invoices:", error);
    return {
      success: false,
      message: "Failed to regenerate invoices",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    };
  }
}

// server/routers/invoiceGeneration.ts
init_db();
var invoiceGenerationRouter = router({
  /**
   * Generate draft invoices from approved payroll data for a specific month
   * Service fees are calculated from customer pricing configuration
   * VAT is calculated per country from countries_config
   */
  generateFromPayroll: financeManagerProcedure.input(
    z6.object({
      payrollMonth: z6.string()
      // ISO date (first day of month)
    })
  ).mutation(async ({ input, ctx }) => {
    const payrollDate = new Date(input.payrollMonth);
    const result = await generateInvoicesFromPayroll(payrollDate);
    if (result.success) {
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "generate",
        entityType: "invoices",
        changes: JSON.stringify({
          payrollMonth: input.payrollMonth,
          invoiceCount: result.invoiceIds?.length || 0,
          warnings: result.warnings
        })
      });
    }
    return result;
  }),
  /**
   * Get status of invoice generation for a specific payroll month
   */
  getStatus: financeManagerProcedure.input(z6.object({ payrollMonth: z6.string() })).query(async ({ input }) => {
    const payrollDate = new Date(input.payrollMonth);
    return await getInvoiceGenerationStatus(payrollDate);
  }),
  /**
   * Pre-check before generate/regenerate: returns existing invoice status breakdown
   * so the frontend can warn the user about non-draft invoices that won't be affected.
   */
  preCheck: financeManagerProcedure.input(z6.object({ payrollMonth: z6.string() })).query(async ({ input }) => {
    const payrollDate = new Date(input.payrollMonth);
    const status = await getInvoiceGenerationStatus(payrollDate);
    if (!status) return { canGenerate: false, message: "Unable to check status" };
    const nonDraftCount = (status.byStatus.sent || 0) + (status.byStatus.paid || 0) + (status.byStatus.overdue || 0);
    const draftCount = status.byStatus.draft || 0;
    let warnings = [];
    if (nonDraftCount > 0) {
      warnings.push(
        `This month has ${nonDraftCount} invoice(s) in non-draft status (${status.byStatus.sent} sent, ${status.byStatus.paid} paid, ${status.byStatus.overdue} overdue). These will NOT be affected by generate/regenerate.`
      );
    }
    if (draftCount > 0) {
      warnings.push(
        `${draftCount} draft invoice(s) exist. Regenerating will delete and recreate them.`
      );
    }
    return {
      canGenerate: true,
      totalInvoices: status.totalInvoices,
      draftCount,
      nonDraftCount,
      byStatus: status.byStatus,
      warnings
    };
  }),
  /**
   * Regenerate invoices for a month (deletes draft invoices and recreates)
   */
  regenerate: financeManagerProcedure.input(
    z6.object({
      payrollMonth: z6.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const payrollDate = new Date(input.payrollMonth);
    const result = await regenerateInvoices(payrollDate);
    if (result.success) {
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "regenerate",
        entityType: "invoices",
        changes: JSON.stringify({
          payrollMonth: input.payrollMonth,
          invoiceCount: result.invoiceIds?.length || 0,
          warnings: result.warnings
        })
      });
    }
    return result;
  }),
  /**
   * Regenerate a single invoice (delete and recreate from payroll data)
   */
  regenerateSingle: financeManagerProcedure.input(
    z6.object({
      invoiceId: z6.number()
    })
  ).mutation(async ({ input, ctx }) => {
    const result = await regenerateSingleInvoice(input.invoiceId);
    if (result.success) {
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "regenerate",
        entityType: "invoice",
        entityId: input.invoiceId,
        changes: JSON.stringify({
          type: "single_regenerate",
          invoiceId: input.invoiceId,
          newInvoiceCount: result.invoiceIds?.length || 0
        })
      });
    }
    return result;
  }),
  /**
   * Manage exchange rates
   */
  exchangeRate: router({
    /**
     * Get current exchange rate between two currencies
     */
    get: financeManagerProcedure.input(
      z6.object({
        fromCurrency: z6.string(),
        toCurrency: z6.string()
      })
    ).query(async ({ input }) => {
      return await getExchangeRate(input.fromCurrency, input.toCurrency);
    }),
    /**
     * Update exchange rate with configurable markup
     */
    update: financeManagerProcedure.input(
      z6.object({
        fromCurrency: z6.string(),
        toCurrency: z6.string(),
        rate: z6.number().positive(),
        effectiveDate: z6.string().optional(),
        source: z6.string().optional(),
        markupPercentage: z6.number().min(0).max(50).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const effectiveDate = input.effectiveDate ? new Date(input.effectiveDate) : /* @__PURE__ */ new Date();
      try {
        await upsertExchangeRate(
          input.fromCurrency,
          input.toCurrency,
          input.rate,
          effectiveDate,
          input.source,
          input.markupPercentage
        );
        await logAuditAction({
          userId: ctx.user.id,
          userName: ctx.user.name || null,
          action: "update",
          entityType: "exchange_rate",
          changes: JSON.stringify({
            fromCurrency: input.fromCurrency,
            toCurrency: input.toCurrency,
            rate: input.rate,
            markupPercentage: input.markupPercentage
          })
        });
        return { success: true, message: "Exchange rate updated" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }),
    /**
     * Initialize default exchange rates
     */
    initializeDefaults: financeManagerProcedure.mutation(async ({ ctx }) => {
      try {
        await initializeDefaultRates();
        await logAuditAction({
          userId: ctx.user.id,
          userName: ctx.user.name || null,
          action: "initialize",
          entityType: "exchange_rates",
          changes: JSON.stringify({ action: "initialize_defaults" })
        });
        return { success: true, message: "Default exchange rates initialized" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    })
  })
});

// server/routers/countries.ts
import { z as z7 } from "zod";
init_db();
var countriesRouter = router({
  list: userProcedure.query(async () => {
    return await listCountriesConfig();
  }),
  get: userProcedure.input(z7.object({ countryCode: z7.string() })).query(async ({ input }) => {
    return await getCountryConfig(input.countryCode);
  }),
  create: adminProcedure2.input(
    z7.object({
      countryCode: z7.string().min(2).max(3),
      countryName: z7.string().min(1),
      localCurrency: z7.string().min(3).max(3),
      payrollCycle: z7.enum(["monthly", "semi_monthly"]).default("monthly"),
      probationPeriodDays: z7.number().default(90),
      noticePeriodDays: z7.number().default(30),
      workingDaysPerWeek: z7.number().default(5),
      statutoryAnnualLeave: z7.number().default(14),
      standardEorRate: z7.string().optional(),
      standardVisaEorRate: z7.string().optional(),
      standardAorRate: z7.string().optional(),
      visaEorSetupFee: z7.string().optional(),
      standardRateCurrency: z7.string().default("USD"),
      vatApplicable: z7.boolean().default(false),
      vatRate: z7.string().default("0"),
      notes: z7.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const hasServiceFee = !!(input.standardEorRate || input.standardVisaEorRate || input.standardAorRate);
    const result = await createCountryConfig({
      ...input,
      isActive: hasServiceFee
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "country_config",
      changes: JSON.stringify(input)
    });
    return result;
  }),
  update: adminProcedure2.input(
    z7.object({
      id: z7.number(),
      data: z7.object({
        countryName: z7.string().optional(),
        localCurrency: z7.string().optional(),
        payrollCycle: z7.enum(["monthly", "semi_monthly"]).optional(),
        probationPeriodDays: z7.number().optional(),
        noticePeriodDays: z7.number().optional(),
        workingDaysPerWeek: z7.number().optional(),
        statutoryAnnualLeave: z7.number().optional(),
        standardEorRate: z7.string().nullable().optional(),
        standardVisaEorRate: z7.string().nullable().optional(),
        standardAorRate: z7.string().nullable().optional(),
        visaEorSetupFee: z7.string().nullable().optional(),
        standardRateCurrency: z7.string().optional(),
        vatApplicable: z7.boolean().optional(),
        vatRate: z7.string().nullable().optional(),
        notes: z7.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const data = { ...input.data };
    const hasServiceFee = !!(data.standardEorRate || data.standardVisaEorRate || data.standardAorRate);
    const updateData = { ...data, isActive: hasServiceFee };
    await updateCountryConfig(input.id, updateData);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "country_config",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  delete: adminProcedure2.input(z7.object({ id: z7.number() })).mutation(async ({ input, ctx }) => {
    await deleteCountryConfig(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "country_config",
      entityId: input.id
    });
    return { success: true };
  }),
  // Batch create multiple countries at once
  batchCreate: adminProcedure2.input(
    z7.object({
      countries: z7.array(
        z7.object({
          countryCode: z7.string().min(2).max(3),
          countryName: z7.string().min(1),
          localCurrency: z7.string().min(3).max(3),
          payrollCycle: z7.enum(["monthly", "semi_monthly"]).default("monthly"),
          probationPeriodDays: z7.number().default(90),
          noticePeriodDays: z7.number().default(30),
          workingDaysPerWeek: z7.number().default(5),
          statutoryAnnualLeave: z7.number().default(14),
          standardEorRate: z7.string().optional(),
          standardVisaEorRate: z7.string().optional(),
          standardAorRate: z7.string().optional(),
          visaEorSetupFee: z7.string().optional(),
          standardRateCurrency: z7.string().default("USD"),
          vatApplicable: z7.boolean().default(false),
          vatRate: z7.string().default("0"),
          notes: z7.string().optional()
        })
      )
    })
  ).mutation(async ({ input, ctx }) => {
    const results = [];
    const errors = [];
    for (const country of input.countries) {
      try {
        const result = await createCountryConfig({
          ...country,
          isActive: true
        });
        results.push(result);
      } catch (err) {
        errors.push({ countryCode: country.countryCode, error: err.message });
      }
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "batch_create",
      entityType: "country_config",
      changes: JSON.stringify({ created: results.length, errors: errors.length })
    });
    return { created: results.length, errors };
  }),
  // Leave types sub-router
  leaveTypes: router({
    list: userProcedure.input(z7.object({ countryCode: z7.string() })).query(async ({ input }) => {
      return await listLeaveTypesByCountry(input.countryCode);
    }),
    create: adminProcedure2.input(
      z7.object({
        countryCode: z7.string(),
        leaveTypeName: z7.string().min(1),
        annualEntitlement: z7.number().default(0),
        isPaid: z7.boolean().default(true),
        requiresApproval: z7.boolean().default(true),
        description: z7.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const result = await createLeaveType(input);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "create",
        entityType: "leave_type",
        changes: JSON.stringify(input)
      });
      return result;
    }),
    update: adminProcedure2.input(
      z7.object({
        id: z7.number(),
        data: z7.object({
          leaveTypeName: z7.string().optional(),
          annualEntitlement: z7.number().optional(),
          isPaid: z7.boolean().optional(),
          requiresApproval: z7.boolean().optional(),
          description: z7.string().optional()
        })
      })
    ).mutation(async ({ input, ctx }) => {
      await updateLeaveType(input.id, input.data);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "leave_type",
        entityId: input.id,
        changes: JSON.stringify(input.data)
      });
      return { success: true };
    }),
    delete: adminProcedure2.input(z7.object({ id: z7.number() })).mutation(async ({ input, ctx }) => {
      await deleteLeaveType(input.id);
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "leave_type",
        entityId: input.id
      });
      return { success: true };
    })
  })
});

// server/routers/leave.ts
import { TRPCError as TRPCError8 } from "@trpc/server";
import { z as z8 } from "zod";
init_db();
init_schema();
import { and as and10, eq as eq11, sql as sql6, ne as ne2 } from "drizzle-orm";

// server/utils/cutoff.ts
init_db();
async function checkCutoffPassed(effectiveMonth) {
  let year, month;
  if (typeof effectiveMonth === "string") {
    const parts = effectiveMonth.split("-");
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
  } else {
    year = effectiveMonth.getFullYear();
    month = effectiveMonth.getMonth() + 1;
  }
  const cutoffDayStr = await getSystemConfig("payroll_cutoff_day") ?? "4";
  const cutoffTimeStr = await getSystemConfig("payroll_cutoff_time") ?? "23:59";
  const cutoffDay = parseInt(cutoffDayStr, 10);
  const [cutoffHour, cutoffMinute] = cutoffTimeStr.split(":").map(Number);
  let cutoffMonth = month + 1;
  let cutoffYear = year;
  if (cutoffMonth > 12) {
    cutoffMonth = 1;
    cutoffYear++;
  }
  const cutoffDateBeijing = new Date(
    Date.UTC(cutoffYear, cutoffMonth - 1, cutoffDay, cutoffHour - 8, cutoffMinute, 0)
  );
  const now = /* @__PURE__ */ new Date();
  return {
    passed: now > cutoffDateBeijing,
    cutoffDate: cutoffDateBeijing
  };
}
async function enforceCutoff(effectiveMonth, userRole, action = "modify") {
  const { passed, cutoffDate } = await checkCutoffPassed(effectiveMonth);
  if (passed && !hasAnyRole(userRole, ["admin", "operations_manager"])) {
    const cutoffStr = cutoffDate.toISOString().replace("T", " ").substring(0, 16);
    throw new Error(
      `Cannot ${action}: payroll cutoff has passed (${cutoffStr} UTC). Only operations managers can modify after cutoff.`
    );
  }
}
function getLeavePayrollMonth(endDate) {
  const parts = endDate.split("-");
  return `${parts[0]}-${parts[1]}`;
}
function getAdjustmentPayrollMonth(effectiveMonth) {
  const parts = effectiveMonth.split("-");
  return `${parts[0]}-${parts[1]}`;
}
async function getPayrollPeriodInfo(payrollMonth) {
  const parts = payrollMonth.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const effectiveMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const { passed, cutoffDate } = await checkCutoffPassed(effectiveMonth);
  const now = /* @__PURE__ */ new Date();
  const timeRemainingMs = cutoffDate.getTime() - now.getTime();
  return {
    payrollMonth: `${year}-${String(month).padStart(2, "0")}`,
    cutoffDate,
    cutoffPassed: passed,
    timeRemainingMs,
    timeRemainingLabel: formatTimeRemaining(timeRemainingMs),
    paymentDate: getLastBusinessDay(cutoffDate)
  };
}
async function getCurrentPayrollPeriod() {
  const now = /* @__PURE__ */ new Date();
  const beijingOffset = 8 * 60;
  const beijingNow = new Date(now.getTime() + (beijingOffset - now.getTimezoneOffset()) * 6e4);
  const cutoffDayStr = await getSystemConfig("payroll_cutoff_day") ?? "4";
  const cutoffDay = parseInt(cutoffDayStr, 10);
  let payrollYear = beijingNow.getFullYear();
  let payrollMonth = beijingNow.getMonth() + 1;
  if (beijingNow.getDate() <= cutoffDay) {
    payrollMonth -= 1;
    if (payrollMonth < 1) {
      payrollMonth = 12;
      payrollYear -= 1;
    }
  }
  const monthStr = `${payrollYear}-${String(payrollMonth).padStart(2, "0")}`;
  return getPayrollPeriodInfo(monthStr);
}
function splitLeaveByMonth(startDate, endDate, totalDays, workingDaysPerWeek = 5) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return [{
      startDate,
      endDate,
      days: totalDays,
      payrollMonth: getLeavePayrollMonth(endDate)
    }];
  }
  const portions = [];
  let currentStart = new Date(start);
  while (currentStart <= end) {
    const currentYear = currentStart.getFullYear();
    const currentMonth = currentStart.getMonth();
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    const portionEnd = monthEnd < end ? monthEnd : end;
    const workingDays = countWorkingDays(currentStart, portionEnd, workingDaysPerWeek);
    if (workingDays > 0) {
      portions.push({
        startDate: new Date(currentStart),
        endDate: new Date(portionEnd),
        workingDays
      });
    }
    currentStart = new Date(currentYear, currentMonth + 1, 1);
  }
  const totalWorkingDays = portions.reduce((sum2, p) => sum2 + p.workingDays, 0);
  if (totalWorkingDays === 0) {
    return [{
      startDate,
      endDate,
      days: totalDays,
      payrollMonth: getLeavePayrollMonth(endDate)
    }];
  }
  const splits = [];
  let remainingDays = totalDays;
  for (let i = 0; i < portions.length; i++) {
    const portion = portions[i];
    const isLast = i === portions.length - 1;
    const allocatedDays = isLast ? remainingDays : Math.round(portion.workingDays / totalWorkingDays * totalDays * 10) / 10;
    remainingDays -= allocatedDays;
    const portionEndStr = formatDate(portion.endDate);
    splits.push({
      startDate: formatDate(portion.startDate),
      endDate: portionEndStr,
      days: allocatedDays,
      payrollMonth: getLeavePayrollMonth(portionEndStr)
    });
  }
  return splits;
}
function isLeavesCrossMonth(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  return start.getFullYear() !== end.getFullYear() || start.getMonth() !== end.getMonth();
}
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function formatDate(date2) {
  const y = date2.getFullYear();
  const m = String(date2.getMonth() + 1).padStart(2, "0");
  const d = String(date2.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function countWorkingDays(start, end, workingDaysPerWeek) {
  let count11 = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (workingDaysPerWeek >= 6) {
      if (dayOfWeek !== 0) count11++;
    } else {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count11++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count11;
}
function getLastBusinessDay(referenceDate) {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  while (lastDay.getUTCDay() === 0 || lastDay.getUTCDay() === 6) {
    lastDay.setUTCDate(lastDay.getUTCDate() - 1);
  }
  return formatDate(new Date(lastDay.getUTCFullYear(), lastDay.getUTCMonth(), lastDay.getUTCDate()));
}
function formatTimeRemaining(ms) {
  if (ms <= 0) return "Cutoff passed";
  const days = Math.floor(ms / (1e3 * 60 * 60 * 24));
  const hours = Math.floor(ms % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
  const minutes = Math.floor(ms % (1e3 * 60 * 60) / (1e3 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// server/routers/leave.ts
async function adjustLeaveBalance(employeeId, leaveTypeId, deltaDays, year) {
  const balances = await listLeaveBalances(employeeId, year);
  const balance = balances.find((b) => b.leaveTypeId === leaveTypeId);
  if (!balance) {
    return { warning: "No leave balance found for this leave type and year" };
  }
  const newUsed = (balance.used ?? 0) + deltaDays;
  const newRemaining = (balance.remaining ?? 0) - deltaDays;
  let warning;
  if (newRemaining < 0) {
    warning = "Leave balance will be negative (" + newRemaining + " days remaining). Proceeding anyway.";
  }
  await updateLeaveBalance(balance.id, {
    used: Math.max(0, newUsed),
    remaining: newRemaining
  });
  return { warning };
}
function getEffectiveMonthFromEndDate(endDate) {
  const parts = endDate.split("-");
  return `${parts[0]}-${parts[1]}-01`;
}
function validateCalendarDate(dateStr) {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return { valid: false, error: `Invalid date format: "${dateStr}". Expected YYYY-MM-DD.` };
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { valid: false, error: `Invalid date: "${dateStr}" contains non-numeric values.` };
  }
  if (month < 1 || month > 12) {
    return { valid: false, error: `Invalid month ${month} in date "${dateStr}".` };
  }
  if (day < 1 || day > 31) {
    return { valid: false, error: `Invalid day ${day} in date "${dateStr}".` };
  }
  const constructed = new Date(year, month - 1, day);
  if (constructed.getFullYear() !== year || constructed.getMonth() !== month - 1 || constructed.getDate() !== day) {
    return { valid: false, error: `Invalid calendar date: "${dateStr}" does not exist (e.g. February has no ${day}th).` };
  }
  return { valid: true };
}
async function findOverlappingLeave(employeeId, startDate, endDate, excludeIds = []) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    eq11(leaveRecords.employeeId, employeeId),
    // Overlap: existing.start <= new.end AND existing.end >= new.start
    sql6`${leaveRecords.startDate} <= ${endDate}`,
    sql6`${leaveRecords.endDate} >= ${startDate}`,
    // Only check active records
    sql6`${leaveRecords.status} IN ('submitted', 'locked')`
  ];
  if (excludeIds.length > 0) {
    for (const id of excludeIds) {
      conditions.push(ne2(leaveRecords.id, id));
    }
  }
  const overlapping = await db.select({
    id: leaveRecords.id,
    startDate: leaveRecords.startDate,
    endDate: leaveRecords.endDate,
    days: leaveRecords.days
  }).from(leaveRecords).where(and10(...conditions));
  return overlapping.map((r) => ({
    id: r.id,
    startDate: String(r.startDate),
    endDate: String(r.endDate),
    days: String(r.days)
  }));
}
var leaveRouter = router({
  list: userProcedure.input(
    z8.object({
      employeeId: z8.number().optional(),
      status: z8.string().optional(),
      month: z8.string().optional(),
      // YYYY-MM filter by startDate month
      limit: z8.number().default(50),
      offset: z8.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listLeaveRecords(
      { employeeId: input.employeeId, status: input.status, month: input.month },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
    return await getLeaveRecordById(input.id);
  }),
  create: operationsManagerProcedure.input(
    z8.object({
      employeeId: z8.number(),
      leaveTypeId: z8.number(),
      startDate: z8.string(),
      // YYYY-MM-DD
      endDate: z8.string(),
      // YYYY-MM-DD
      days: z8.string(),
      reason: z8.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const startValid = validateCalendarDate(input.startDate);
    if (!startValid.valid) throw new TRPCError8({ code: "BAD_REQUEST", message: startValid.error ?? "Invalid start date" });
    const endValid = validateCalendarDate(input.endDate);
    if (!endValid.valid) throw new TRPCError8({ code: "BAD_REQUEST", message: endValid.error ?? "Invalid end date" });
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    if (endDate < startDate) {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "Leave end date cannot be before the start date." });
    }
    const employee = await getEmployeeById(input.employeeId);
    if (!employee) throw new TRPCError8({ code: "BAD_REQUEST", message: "Employee not found" });
    const crossMonth = isLeavesCrossMonth(input.startDate, input.endDate);
    const totalDays = parseFloat(input.days);
    const splits = splitLeaveByMonth(input.startDate, input.endDate, totalDays);
    for (const split of splits) {
      const effectiveMonth = getEffectiveMonthFromEndDate(split.endDate);
      await enforceCutoff(effectiveMonth, ctx.user.role, `create leave record for ${split.payrollMonth}`);
    }
    const overlapping = await findOverlappingLeave(input.employeeId, input.startDate, input.endDate);
    if (overlapping.length > 0) {
      const overlapDetails = overlapping.map((o) => `${o.startDate} to ${o.endDate} (${o.days} days)`).join("; ");
      throw new TRPCError8({ code: "BAD_REQUEST", message: `Duplicate leave detected: employee already has leave records overlapping with this period: ${overlapDetails}. Please adjust the dates or cancel the existing record first.` });
    }
    const createdIds = [];
    const balanceWarnings = [];
    for (const split of splits) {
      const result = await createLeaveRecord({
        employeeId: input.employeeId,
        leaveTypeId: input.leaveTypeId,
        startDate: new Date(split.startDate),
        endDate: new Date(split.endDate),
        days: String(split.days),
        reason: crossMonth ? `${input.reason || ""}${input.reason ? " | " : ""}[Split ${split.payrollMonth}: ${split.startDate} to ${split.endDate}]`.trim() : input.reason,
        status: "submitted",
        submittedBy: ctx.user.id
      });
      const insertId = result[0]?.insertId;
      if (insertId) createdIds.push(insertId);
      const year = parseInt(split.endDate.split("-")[0], 10);
      const balResult = await adjustLeaveBalance(input.employeeId, input.leaveTypeId, split.days, year);
      if (balResult.warning) balanceWarnings.push(balResult.warning);
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "leave_record",
      changes: JSON.stringify({
        ...input,
        crossMonth,
        splitCount: splits.length,
        splits: crossMonth ? splits : void 0,
        createdIds
      })
    });
    return {
      createdIds,
      splitCount: splits.length,
      crossMonth,
      splits,
      balanceWarnings: balanceWarnings.length > 0 ? balanceWarnings : void 0
    };
  }),
  update: operationsManagerProcedure.input(
    z8.object({
      id: z8.number(),
      data: z8.object({
        employeeId: z8.number().optional(),
        leaveTypeId: z8.number().optional(),
        startDate: z8.string().optional(),
        endDate: z8.string().optional(),
        days: z8.string().optional(),
        reason: z8.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const existing = await getLeaveRecordById(input.id);
    if (!existing) throw new TRPCError8({ code: "BAD_REQUEST", message: "Leave record not found" });
    if (existing.status === "locked") throw new TRPCError8({ code: "BAD_REQUEST", message: "Cannot edit a locked leave record" });
    if (input.data.startDate) {
      const v = validateCalendarDate(input.data.startDate);
      if (!v.valid) throw new TRPCError8({ code: "BAD_REQUEST", message: v.error ?? "Invalid date" });
    }
    if (input.data.endDate) {
      const v = validateCalendarDate(input.data.endDate);
      if (!v.valid) throw new TRPCError8({ code: "BAD_REQUEST", message: v.error ?? "Invalid date" });
    }
    const endDate = input.data.endDate || String(existing.endDate);
    const effectiveMonth = getEffectiveMonthFromEndDate(endDate);
    await enforceCutoff(effectiveMonth, ctx.user.role, "update leave record");
    if (input.data.endDate && input.data.endDate !== String(existing.endDate)) {
      const oldEffectiveMonth = getEffectiveMonthFromEndDate(String(existing.endDate));
      await enforceCutoff(oldEffectiveMonth, ctx.user.role, "update leave record (original month)");
    }
    const newStart = input.data.startDate || String(existing.startDate);
    const newEnd = input.data.endDate || String(existing.endDate);
    if (input.data.startDate || input.data.endDate) {
      const overlapping = await findOverlappingLeave(
        existing.employeeId,
        newStart,
        newEnd,
        [input.id]
        // exclude the record being updated
      );
      if (overlapping.length > 0) {
        const overlapDetails = overlapping.map((o) => `${o.startDate} to ${o.endDate} (${o.days} days)`).join("; ");
        throw new TRPCError8({ code: "BAD_REQUEST", message: `Duplicate leave detected: employee already has leave records overlapping with this period: ${overlapDetails}.` });
      }
    }
    const oldDays = parseFloat(existing.days?.toString() ?? "0");
    const newDays = input.data.days ? parseFloat(input.data.days) : oldDays;
    const oldLeaveTypeId = existing.leaveTypeId;
    const newLeaveTypeId = input.data.leaveTypeId ?? oldLeaveTypeId;
    const endDateParts = endDate.split("-");
    const year = parseInt(endDateParts[0], 10);
    if (oldDays !== newDays || oldLeaveTypeId !== newLeaveTypeId) {
      await adjustLeaveBalance(existing.employeeId, oldLeaveTypeId, -oldDays, year);
      await adjustLeaveBalance(existing.employeeId, newLeaveTypeId, newDays, year);
    }
    const updateData = { ...input.data };
    if (input.data.startDate) updateData.startDate = new Date(input.data.startDate);
    if (input.data.endDate) updateData.endDate = new Date(input.data.endDate);
    await updateLeaveRecord(input.id, updateData);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "leave_record",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  delete: operationsManagerProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getLeaveRecordById(input.id);
    if (!existing) throw new TRPCError8({ code: "BAD_REQUEST", message: "Leave record not found" });
    if (existing.status === "locked") throw new TRPCError8({ code: "BAD_REQUEST", message: "Cannot delete a locked leave record" });
    const endDate = String(existing.endDate);
    const effectiveMonth = getEffectiveMonthFromEndDate(endDate);
    await enforceCutoff(effectiveMonth, ctx.user.role, "delete leave record");
    const days = parseFloat(existing.days?.toString() ?? "0");
    const year = parseInt(endDate.split("-")[0], 10);
    await adjustLeaveBalance(existing.employeeId, existing.leaveTypeId, -days, year);
    await deleteLeaveRecord(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "leave_record",
      entityId: input.id
    });
    return { success: true };
  }),
  // Cancel is now equivalent to delete — no cancelled status, just remove the record
  cancel: operationsManagerProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getLeaveRecordById(input.id);
    if (!existing) throw new TRPCError8({ code: "BAD_REQUEST", message: "Leave record not found" });
    if (existing.status === "locked") throw new TRPCError8({ code: "BAD_REQUEST", message: "Cannot cancel a locked leave record" });
    const endDate = String(existing.endDate);
    const effectiveMonth = getEffectiveMonthFromEndDate(endDate);
    await enforceCutoff(effectiveMonth, ctx.user.role, "cancel leave record");
    const days = parseFloat(existing.days?.toString() ?? "0");
    const year = parseInt(endDate.split("-")[0], 10);
    await adjustLeaveBalance(existing.employeeId, existing.leaveTypeId, -days, year);
    await deleteLeaveRecord(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "cancel",
      entityType: "leave_record",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Admin approve — confirms a client_approved leave record
   */
  adminApprove: operationsManagerProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getLeaveRecordById(input.id);
    if (!existing) throw new TRPCError8({ code: "BAD_REQUEST", message: "Leave record not found" });
    if (existing.status !== "client_approved") {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "Only client-approved leave records can be admin-approved" });
    }
    await updateLeaveRecord(input.id, {
      status: "admin_approved",
      adminApprovedBy: ctx.user.id,
      adminApprovedAt: /* @__PURE__ */ new Date()
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "admin_approve",
      entityType: "leave_record",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Admin reject — rejects a client_approved leave record
   */
  adminReject: operationsManagerProcedure.input(z8.object({
    id: z8.number(),
    reason: z8.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const existing = await getLeaveRecordById(input.id);
    if (!existing) throw new TRPCError8({ code: "BAD_REQUEST", message: "Leave record not found" });
    if (existing.status !== "client_approved") {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "Only client-approved leave records can be admin-rejected" });
    }
    await updateLeaveRecord(input.id, {
      status: "admin_rejected",
      adminApprovedBy: ctx.user.id,
      adminApprovedAt: /* @__PURE__ */ new Date(),
      adminRejectionReason: input.reason || null
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "admin_reject",
      entityType: "leave_record",
      entityId: input.id,
      changes: JSON.stringify({ reason: input.reason })
    });
    return { success: true };
  }),
  balances: userProcedure.input(z8.object({ employeeId: z8.number(), year: z8.number().optional() })).query(async ({ input }) => {
    return await listLeaveBalances(input.employeeId, input.year);
  })
});

// server/routers/adjustments.ts
import { TRPCError as TRPCError9 } from "@trpc/server";
import { z as z9 } from "zod";
init_db();
var adjustmentsRouter = router({
  list: userProcedure.input(
    z9.object({
      customerId: z9.number().optional(),
      employeeId: z9.number().optional(),
      status: z9.string().optional(),
      adjustmentType: z9.string().optional(),
      effectiveMonth: z9.string().optional(),
      // YYYY-MM or YYYY-MM-01
      limit: z9.number().default(50),
      offset: z9.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listAdjustments(
      {
        customerId: input.customerId,
        employeeId: input.employeeId,
        status: input.status,
        adjustmentType: input.adjustmentType,
        effectiveMonth: input.effectiveMonth
      },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z9.object({ id: z9.number() })).query(async ({ input }) => {
    return await getAdjustmentById(input.id);
  }),
  create: operationsManagerProcedure.input(
    z9.object({
      employeeId: z9.number(),
      adjustmentType: z9.enum(["bonus", "allowance", "reimbursement", "deduction", "other"]),
      category: z9.enum([
        "housing",
        "transport",
        "meals",
        "performance_bonus",
        "year_end_bonus",
        "overtime",
        "travel_reimbursement",
        "equipment_reimbursement",
        "absence_deduction",
        "other"
      ]).optional(),
      description: z9.string().optional(),
      amount: z9.string(),
      effectiveMonth: z9.string(),
      // YYYY-MM or YYYY-MM-01
      receiptFileUrl: z9.string().optional(),
      receiptFileKey: z9.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const parts = input.effectiveMonth.split("-");
    const normalizedMonth = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;
    const now = /* @__PURE__ */ new Date();
    await enforceCutoff(normalizedMonth, ctx.user.role, "create adjustment");
    const { passed, cutoffDate } = await checkCutoffPassed(normalizedMonth);
    let cutoffWarning;
    if (!passed) {
      const hoursUntilCutoff = (cutoffDate.getTime() - now.getTime()) / (1e3 * 60 * 60);
      if (hoursUntilCutoff <= 48) {
        cutoffWarning = `Cutoff for ${parts[0]}-${parts[1]} payroll is in ${Math.round(hoursUntilCutoff)} hours. Submit before the deadline.`;
      }
    }
    const employee = await getEmployeeById(input.employeeId);
    if (!employee) throw new TRPCError9({ code: "BAD_REQUEST", message: "Employee not found" });
    const currency = employee.salaryCurrency || "USD";
    const customerId = employee.customerId;
    const payrollMonth = getAdjustmentPayrollMonth(normalizedMonth);
    const result = await createAdjustment({
      employeeId: input.employeeId,
      customerId,
      adjustmentType: input.adjustmentType,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency,
      effectiveMonth: new Date(normalizedMonth),
      receiptFileUrl: input.receiptFileUrl,
      receiptFileKey: input.receiptFileKey,
      status: "submitted",
      submittedBy: ctx.user.id
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "adjustment",
      changes: JSON.stringify({ ...input, customerId, currency, payrollMonth })
    });
    return {
      ...result,
      payrollMonth,
      cutoffWarning
    };
  }),
  update: operationsManagerProcedure.input(
    z9.object({
      id: z9.number(),
      data: z9.object({
        adjustmentType: z9.enum(["bonus", "allowance", "reimbursement", "deduction", "other"]).optional(),
        category: z9.enum([
          "housing",
          "transport",
          "meals",
          "performance_bonus",
          "year_end_bonus",
          "overtime",
          "travel_reimbursement",
          "equipment_reimbursement",
          "absence_deduction",
          "other"
        ]).optional(),
        description: z9.string().optional(),
        amount: z9.string().optional(),
        effectiveMonth: z9.string().optional(),
        receiptFileUrl: z9.string().optional().nullable(),
        receiptFileKey: z9.string().optional().nullable()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const existing = await getAdjustmentById(input.id);
    if (!existing) throw new TRPCError9({ code: "BAD_REQUEST", message: "Adjustment not found" });
    if (existing.status === "locked") throw new TRPCError9({ code: "BAD_REQUEST", message: "Cannot edit a locked adjustment" });
    const effectiveMonth = input.data.effectiveMonth ? `${input.data.effectiveMonth.split("-")[0]}-${input.data.effectiveMonth.split("-")[1].padStart(2, "0")}-01` : existing.effectiveMonth;
    await enforceCutoff(effectiveMonth, ctx.user.role, "update adjustment");
    const updateData = { ...input.data };
    if (input.data.effectiveMonth) {
      const parts = input.data.effectiveMonth.split("-");
      updateData.effectiveMonth = /* @__PURE__ */ new Date(`${parts[0]}-${parts[1].padStart(2, "0")}-01`);
    }
    if (input.data.effectiveMonth && input.data.effectiveMonth !== String(existing.effectiveMonth)) {
      await enforceCutoff(updateData.effectiveMonth, ctx.user.role, "update adjustment (new month)");
    }
    await updateAdjustment(input.id, updateData);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "adjustment",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  delete: operationsManagerProcedure.input(z9.object({ id: z9.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getAdjustmentById(input.id);
    if (!existing) throw new TRPCError9({ code: "BAD_REQUEST", message: "Adjustment not found" });
    if (existing.status === "locked") throw new TRPCError9({ code: "BAD_REQUEST", message: "Cannot delete a locked adjustment" });
    await enforceCutoff(existing.effectiveMonth, ctx.user.role, "delete adjustment");
    await deleteAdjustment(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "adjustment",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Admin approve — confirms a client_approved adjustment
   */
  adminApprove: operationsManagerProcedure.input(z9.object({ id: z9.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getAdjustmentById(input.id);
    if (!existing) throw new TRPCError9({ code: "BAD_REQUEST", message: "Adjustment not found" });
    if (existing.status !== "client_approved") {
      throw new TRPCError9({ code: "BAD_REQUEST", message: "Only client-approved adjustments can be admin-approved" });
    }
    await updateAdjustment(input.id, {
      status: "admin_approved",
      adminApprovedBy: ctx.user.id,
      adminApprovedAt: /* @__PURE__ */ new Date()
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "admin_approve",
      entityType: "adjustment",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Admin reject — rejects a client_approved adjustment
   */
  adminReject: operationsManagerProcedure.input(z9.object({
    id: z9.number(),
    reason: z9.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const existing = await getAdjustmentById(input.id);
    if (!existing) throw new TRPCError9({ code: "BAD_REQUEST", message: "Adjustment not found" });
    if (existing.status !== "client_approved") {
      throw new TRPCError9({ code: "BAD_REQUEST", message: "Only client-approved adjustments can be admin-rejected" });
    }
    await updateAdjustment(input.id, {
      status: "admin_rejected",
      adminApprovedBy: ctx.user.id,
      adminApprovedAt: /* @__PURE__ */ new Date(),
      adminRejectionReason: input.reason || null
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "admin_reject",
      entityType: "adjustment",
      entityId: input.id,
      changes: JSON.stringify({ reason: input.reason })
    });
    return { success: true };
  }),
  // Upload receipt file for reimbursement adjustments
  uploadReceipt: operationsManagerProcedure.input(
    z9.object({
      fileBase64: z9.string(),
      fileName: z9.string(),
      mimeType: z9.string().default("application/pdf")
    })
  ).mutation(async ({ input, ctx }) => {
    const fileBuffer = Buffer.from(input.fileBase64, "base64");
    if (fileBuffer.length > 20 * 1024 * 1024) {
      throw new TRPCError9({ code: "BAD_REQUEST", message: "File size must be under 20MB" });
    }
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `adjustment-receipts/${Date.now()}-${randomSuffix}-${input.fileName}`;
    const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "upload_receipt",
      entityType: "adjustment",
      changes: JSON.stringify({ fileName: input.fileName, fileKey })
    });
    return { url, fileKey };
  })
});

// server/routers/reimbursements.ts
import { TRPCError as TRPCError10 } from "@trpc/server";
import { z as z10 } from "zod";
init_db();
var reimbursementsRouter = router({
  list: userProcedure.input(
    z10.object({
      customerId: z10.number().optional(),
      employeeId: z10.number().optional(),
      status: z10.string().optional(),
      category: z10.string().optional(),
      effectiveMonth: z10.string().optional(),
      limit: z10.number().default(50),
      offset: z10.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listReimbursements(
      {
        customerId: input.customerId,
        employeeId: input.employeeId,
        status: input.status,
        category: input.category,
        effectiveMonth: input.effectiveMonth
      },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z10.object({ id: z10.number() })).query(async ({ input }) => {
    return await getReimbursementById(input.id);
  }),
  create: operationsManagerProcedure.input(
    z10.object({
      employeeId: z10.number(),
      category: z10.enum([
        "travel",
        "equipment",
        "meals",
        "transportation",
        "medical",
        "education",
        "office_supplies",
        "communication",
        "other"
      ]),
      description: z10.string().optional(),
      amount: z10.string(),
      effectiveMonth: z10.string(),
      receiptFileUrl: z10.string().optional(),
      receiptFileKey: z10.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const parts = input.effectiveMonth.split("-");
    const normalizedMonth = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;
    const employee = await getEmployeeById(input.employeeId);
    if (!employee) throw new TRPCError10({ code: "BAD_REQUEST", message: "Employee not found" });
    const currency = employee.salaryCurrency || "USD";
    const customerId = employee.customerId;
    if (!input.receiptFileUrl) {
      throw new TRPCError10({ code: "BAD_REQUEST", message: "Reimbursement claims require a receipt attachment." });
    }
    const result = await createReimbursement({
      employeeId: input.employeeId,
      customerId,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency,
      effectiveMonth: new Date(normalizedMonth),
      receiptFileUrl: input.receiptFileUrl,
      receiptFileKey: input.receiptFileKey,
      status: "submitted",
      submittedBy: ctx.user.id
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "reimbursement",
      changes: JSON.stringify({ ...input, customerId, currency })
    });
    return result;
  }),
  update: operationsManagerProcedure.input(
    z10.object({
      id: z10.number(),
      data: z10.object({
        category: z10.enum([
          "travel",
          "equipment",
          "meals",
          "transportation",
          "medical",
          "education",
          "office_supplies",
          "communication",
          "other"
        ]).optional(),
        description: z10.string().optional(),
        amount: z10.string().optional(),
        receiptFileUrl: z10.string().optional().nullable(),
        receiptFileKey: z10.string().optional().nullable()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const existing = await getReimbursementById(input.id);
    if (!existing) throw new TRPCError10({ code: "BAD_REQUEST", message: "Reimbursement not found" });
    if (existing.status === "locked" || existing.status === "admin_approved") {
      throw new TRPCError10({ code: "BAD_REQUEST", message: "Cannot edit a locked/approved reimbursement" });
    }
    await updateReimbursement(input.id, input.data);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "reimbursement",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  delete: operationsManagerProcedure.input(z10.object({ id: z10.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getReimbursementById(input.id);
    if (!existing) throw new TRPCError10({ code: "BAD_REQUEST", message: "Reimbursement not found" });
    if (existing.status === "locked") throw new TRPCError10({ code: "BAD_REQUEST", message: "Cannot delete a locked reimbursement" });
    await deleteReimbursement(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "reimbursement",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Admin approve — confirms a client_approved reimbursement
   */
  adminApprove: operationsManagerProcedure.input(z10.object({ id: z10.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getReimbursementById(input.id);
    if (!existing) throw new TRPCError10({ code: "BAD_REQUEST", message: "Reimbursement not found" });
    if (existing.status !== "client_approved") {
      throw new TRPCError10({ code: "BAD_REQUEST", message: "Only client-approved reimbursements can be admin-approved" });
    }
    await updateReimbursement(input.id, {
      status: "admin_approved",
      adminApprovedBy: ctx.user.id,
      adminApprovedAt: /* @__PURE__ */ new Date()
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "admin_approve",
      entityType: "reimbursement",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Admin reject — rejects a client_approved reimbursement
   */
  adminReject: operationsManagerProcedure.input(z10.object({
    id: z10.number(),
    reason: z10.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const existing = await getReimbursementById(input.id);
    if (!existing) throw new TRPCError10({ code: "BAD_REQUEST", message: "Reimbursement not found" });
    if (existing.status !== "client_approved") {
      throw new TRPCError10({ code: "BAD_REQUEST", message: "Only client-approved reimbursements can be admin-rejected" });
    }
    await updateReimbursement(input.id, {
      status: "admin_rejected",
      adminApprovedBy: ctx.user.id,
      adminApprovedAt: /* @__PURE__ */ new Date(),
      adminRejectionReason: input.reason || null
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "admin_reject",
      entityType: "reimbursement",
      entityId: input.id,
      changes: JSON.stringify({ reason: input.reason })
    });
    return { success: true };
  }),
  uploadReceipt: operationsManagerProcedure.input(
    z10.object({
      fileBase64: z10.string(),
      fileName: z10.string(),
      mimeType: z10.string().default("application/pdf")
    })
  ).mutation(async ({ input, ctx }) => {
    const fileBuffer = Buffer.from(input.fileBase64, "base64");
    if (fileBuffer.length > 20 * 1024 * 1024) {
      throw new TRPCError10({ code: "BAD_REQUEST", message: "File size must be under 20MB" });
    }
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `reimbursement-receipts/${Date.now()}-${randomSuffix}-${input.fileName}`;
    const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "upload_receipt",
      entityType: "reimbursement",
      changes: JSON.stringify({ fileName: input.fileName, fileKey })
    });
    return { url, fileKey };
  })
});

// server/routers/dashboard.ts
init_db();
init_schema();
import { eq as eq12, and as and11, sql as sql7, count, desc as desc3, inArray, isNotNull } from "drizzle-orm";
function getLastNMonths(n) {
  const months = [];
  const now = /* @__PURE__ */ new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}
var dashboardRouter = router({
  // ── Existing endpoints (backward compatible) ──
  stats: userProcedure.query(async () => {
    return await getDashboardStats();
  }),
  employeesByStatus: userProcedure.query(async () => {
    return await getEmployeeCountByStatus();
  }),
  employeesByCountry: userProcedure.query(async () => {
    return await getEmployeeCountByCountry();
  }),
  recentActivity: adminProcedure2.query(async () => {
    const { data } = await listAuditLogs(void 0, 20, 0);
    return data;
  }),
  // ── NEW: Monthly Trends (last 12 months) ──
  monthlyTrends: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { months: [], employeeTrend: [], customerTrend: [], invoiceTrend: [], payrollTrend: [] };
    const months = getLastNMonths(12);
    const employeeTrend = [];
    const customerTrend = [];
    const invoiceTrend = [];
    const payrollTrend = [];
    for (const m of months) {
      const [y, mo] = m.split("-").map(Number);
      const monthEnd = new Date(y, mo, 0, 23, 59, 59);
      const monthStart = `${m}-01`;
      const nextMonth = mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, "0")}-01`;
      const [empResult] = await db.select({ count: count() }).from(employees).where(and11(
        sql7`${employees.createdAt} <= ${monthEnd}`,
        inArray(employees.status, ["active", "contract_signed", "onboarding", "offboarding"])
      ));
      employeeTrend.push(empResult?.count ?? 0);
      const [custResult] = await db.select({ count: count() }).from(customers).where(and11(
        sql7`${customers.createdAt} <= ${monthEnd}`,
        eq12(customers.status, "active")
      ));
      customerTrend.push(custResult?.count ?? 0);
      const [invResult] = await db.select({ count: count() }).from(invoices).where(and11(
        sql7`${invoices.createdAt} >= ${monthStart}`,
        sql7`${invoices.createdAt} < ${nextMonth}`
      ));
      invoiceTrend.push(invResult?.count ?? 0);
      const [prResult] = await db.select({ count: count() }).from(payrollRuns).where(and11(
        sql7`${payrollRuns.payrollMonth} >= ${monthStart}`,
        sql7`${payrollRuns.payrollMonth} < ${nextMonth}`
      ));
      payrollTrend.push(prResult?.count ?? 0);
    }
    return { months, employeeTrend, customerTrend, invoiceTrend, payrollTrend };
  }),
  // ── NEW: Finance Overview ──
  financeOverview: financeManagerProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {
      totalRevenue: "0",
      totalServiceFeeRevenue: "0",
      totalPaidInvoices: 0,
      totalOutstandingAmount: "0",
      totalOverdueAmount: "0",
      totalDeferredRevenue: "0",
      totalDepositInvoices: 0,
      monthlyRevenue: []
    };
    const [paidTotal] = await db.select({
      total: sql7`COALESCE(SUM(${invoices.total}), 0)`,
      count: count()
    }).from(invoices).where(and11(
      eq12(invoices.status, "paid"),
      sql7`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
    ));
    const [depositTotal] = await db.select({
      total: sql7`COALESCE(SUM(${invoices.total}), 0)`,
      count: count()
    }).from(invoices).where(and11(
      eq12(invoices.status, "paid"),
      eq12(invoices.invoiceType, "deposit")
    ));
    const [serviceFeeTotal] = await db.select({
      total: sql7`COALESCE(SUM(ii.amount), 0)`
    }).from(invoices).innerJoin(sql7`invoice_items ii`, sql7`ii.invoiceId = ${invoices.id}`).where(and11(
      eq12(invoices.status, "paid"),
      sql7`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`,
      sql7`ii.itemType IN ('eor_service_fee', 'visa_eor_service_fee', 'aor_service_fee')`
    ));
    const [outstanding] = await db.select({
      total: sql7`COALESCE(SUM(${invoices.total}), 0)`
    }).from(invoices).where(inArray(invoices.status, ["sent", "overdue"]));
    const [overdue] = await db.select({
      total: sql7`COALESCE(SUM(${invoices.total}), 0)`
    }).from(invoices).where(eq12(invoices.status, "overdue"));
    const months = getLastNMonths(12);
    const monthlyRevenue = [];
    for (const m of months) {
      const [y, mo] = m.split("-").map(Number);
      const monthStart = `${m}-01`;
      const nextMonth = mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, "0")}-01`;
      const [monthTotal] = await db.select({
        total: sql7`COALESCE(SUM(${invoices.total}), 0)`,
        count: count()
      }).from(invoices).where(and11(
        eq12(invoices.status, "paid"),
        sql7`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`,
        sql7`(${invoices.paidDate} >= ${monthStart} AND ${invoices.paidDate} < ${nextMonth})
            OR (${invoices.paidDate} IS NULL AND ${invoices.createdAt} >= ${monthStart} AND ${invoices.createdAt} < ${nextMonth})`
      ));
      const [monthServiceFee] = await db.select({
        total: sql7`COALESCE(SUM(ii.amount), 0)`
      }).from(invoices).innerJoin(sql7`invoice_items ii`, sql7`ii.invoiceId = ${invoices.id}`).where(and11(
        eq12(invoices.status, "paid"),
        sql7`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`,
        sql7`ii.itemType IN ('eor_service_fee', 'visa_eor_service_fee', 'aor_service_fee')`,
        sql7`(${invoices.paidDate} >= ${monthStart} AND ${invoices.paidDate} < ${nextMonth})
              OR (${invoices.paidDate} IS NULL AND ${invoices.createdAt} >= ${monthStart} AND ${invoices.createdAt} < ${nextMonth})`
      ));
      monthlyRevenue.push({
        month: m,
        totalRevenue: monthTotal?.total ?? "0",
        serviceFeeRevenue: monthServiceFee?.total ?? "0",
        invoiceCount: monthTotal?.count ?? 0
      });
    }
    return {
      totalRevenue: paidTotal?.total ?? "0",
      totalServiceFeeRevenue: serviceFeeTotal?.total ?? "0",
      totalPaidInvoices: paidTotal?.count ?? 0,
      totalOutstandingAmount: outstanding?.total ?? "0",
      totalOverdueAmount: overdue?.total ?? "0",
      totalDeferredRevenue: depositTotal?.total ?? "0",
      totalDepositInvoices: depositTotal?.count ?? 0,
      monthlyRevenue
    };
  }),
  // ── NEW: Operations Overview ──
  operationsOverview: operationsManagerProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {
      payrollByStatus: [],
      pendingApprovals: { payrolls: 0, adjustments: 0, leaves: 0 },
      recentPayrollRuns: [],
      employeeOnboarding: 0,
      employeeOffboarding: 0
    };
    const payrollByStatus = await db.select({
      status: payrollRuns.status,
      count: count()
    }).from(payrollRuns).groupBy(payrollRuns.status);
    const [pendingPayrolls] = await db.select({ count: count() }).from(payrollRuns).where(eq12(payrollRuns.status, "pending_approval"));
    const [pendingAdj] = await db.select({ count: count() }).from(adjustments).where(eq12(adjustments.status, "submitted"));
    const [pendingLeaves] = await db.select({ count: count() }).from(leaveRecords).where(eq12(leaveRecords.status, "submitted"));
    const recentPayrollRuns = await db.select({
      id: payrollRuns.id,
      countryCode: payrollRuns.countryCode,
      payrollMonth: payrollRuns.payrollMonth,
      status: payrollRuns.status,
      totalGrossSalary: payrollRuns.totalGross,
      totalEmployerCost: payrollRuns.totalDeductions,
      createdAt: payrollRuns.createdAt
    }).from(payrollRuns).orderBy(desc3(payrollRuns.createdAt)).limit(10);
    const [onboarding] = await db.select({ count: count() }).from(employees).where(inArray(employees.status, ["pending_review", "documents_incomplete", "onboarding", "contract_signed"]));
    const [offboarding] = await db.select({ count: count() }).from(employees).where(eq12(employees.status, "offboarding"));
    return {
      payrollByStatus: payrollByStatus.map((r) => ({ status: r.status, count: r.count })),
      pendingApprovals: {
        payrolls: pendingPayrolls?.count ?? 0,
        adjustments: pendingAdj?.count ?? 0,
        leaves: pendingLeaves?.count ?? 0
      },
      recentPayrollRuns,
      employeeOnboarding: onboarding?.count ?? 0,
      employeeOffboarding: offboarding?.count ?? 0
    };
  }),
  // ── NEW: HR & Leave Overview ──
  hrOverview: operationsManagerProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {
      // Workforce KPIs
      activeEmployees: 0,
      onLeaveEmployees: 0,
      newHiresThisMonth: 0,
      terminationsThisMonth: 0,
      onboardingEmployees: 0,
      offboardingEmployees: 0,
      // Contract expiry alerts
      contractExpiry30: [],
      contractExpiry60: [],
      contractExpiry90: [],
      // Monthly workforce trend
      monthlyWorkforce: [],
      // Existing
      leaveByStatus: [],
      adjustmentByStatus: [],
      adjustmentByType: [],
      monthlyLeave: []
    };
    const now = /* @__PURE__ */ new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const nextMonthStart = now.getMonth() === 11 ? `${now.getFullYear() + 1}-01-01` : `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, "0")}-01`;
    const [activeResult] = await db.select({ count: count() }).from(employees).where(eq12(employees.status, "active"));
    const [onLeaveResult] = await db.select({ count: count() }).from(employees).where(eq12(employees.status, "on_leave"));
    const [onboardingResult] = await db.select({ count: count() }).from(employees).where(inArray(employees.status, ["pending_review", "documents_incomplete", "onboarding", "contract_signed"]));
    const [offboardingResult] = await db.select({ count: count() }).from(employees).where(eq12(employees.status, "offboarding"));
    const [newHiresResult] = await db.select({ count: count() }).from(employees).where(and11(
      sql7`${employees.startDate} >= ${currentMonthStart}`,
      sql7`${employees.startDate} < ${nextMonthStart}`
    ));
    const [terminationsResult] = await db.select({ count: count() }).from(employees).where(and11(
      eq12(employees.status, "terminated"),
      sql7`${employees.updatedAt} >= ${currentMonthStart}`,
      sql7`${employees.updatedAt} < ${nextMonthStart}`
    ));
    const getExpiringContracts = async (daysAhead) => {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + daysAhead);
      const futureDateStr = futureDate.toISOString().slice(0, 10);
      const results = await db.select({
        employeeId: employeeContracts.employeeId,
        expiryDate: employeeContracts.expiryDate,
        contractType: employeeContracts.contractType,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode
      }).from(employeeContracts).innerJoin(employees, eq12(employeeContracts.employeeId, employees.id)).where(and11(
        isNotNull(employeeContracts.expiryDate),
        sql7`${employeeContracts.expiryDate} >= ${todayStr}`,
        sql7`${employeeContracts.expiryDate} <= ${futureDateStr}`,
        eq12(employeeContracts.status, "signed"),
        inArray(employees.status, ["active", "on_leave"])
      )).orderBy(employeeContracts.expiryDate);
      return results.map((r) => ({
        employeeId: r.employeeId,
        employeeName: `${r.firstName} ${r.lastName}`,
        employeeCode: r.employeeCode || "",
        expiryDate: r.expiryDate || "",
        contractType: r.contractType
      }));
    };
    const contractExpiry30 = await getExpiringContracts(30);
    const contractExpiry60 = await getExpiringContracts(60);
    const contractExpiry90 = await getExpiringContracts(90);
    const months = getLastNMonths(12);
    const monthlyWorkforce = [];
    for (const m of months) {
      const [y, mo] = m.split("-").map(Number);
      const monthEnd = new Date(y, mo, 0, 23, 59, 59);
      const monthStart = `${m}-01`;
      const mNextMonth = mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, "0")}-01`;
      const [activeAtMonth] = await db.select({ count: count() }).from(employees).where(and11(
        sql7`${employees.createdAt} <= ${monthEnd}`,
        inArray(employees.status, ["active", "on_leave", "offboarding"])
      ));
      const [newInMonth] = await db.select({ count: count() }).from(employees).where(and11(
        sql7`${employees.startDate} >= ${monthStart}`,
        sql7`${employees.startDate} < ${mNextMonth}`
      ));
      const [termInMonth] = await db.select({ count: count() }).from(employees).where(and11(
        eq12(employees.status, "terminated"),
        sql7`${employees.updatedAt} >= ${monthStart}`,
        sql7`${employees.updatedAt} < ${mNextMonth}`
      ));
      const [onLeaveAtMonth] = await db.select({ count: count() }).from(employees).where(and11(
        sql7`${employees.createdAt} <= ${monthEnd}`,
        eq12(employees.status, "on_leave")
      ));
      monthlyWorkforce.push({
        month: m,
        active: activeAtMonth?.count ?? 0,
        newHires: newInMonth?.count ?? 0,
        terminations: termInMonth?.count ?? 0,
        onLeave: onLeaveAtMonth?.count ?? 0
      });
    }
    const leaveByStatus = await db.select({
      status: leaveRecords.status,
      count: count()
    }).from(leaveRecords).groupBy(leaveRecords.status);
    const adjustmentByStatus = await db.select({
      status: adjustments.status,
      count: count()
    }).from(adjustments).groupBy(adjustments.status);
    const adjustmentByType = await db.select({
      type: adjustments.adjustmentType,
      count: count(),
      totalAmount: sql7`COALESCE(SUM(${adjustments.amount}), 0)`
    }).from(adjustments).groupBy(adjustments.adjustmentType);
    const monthlyLeave = [];
    for (const m of months) {
      const [y, mo] = m.split("-").map(Number);
      const monthStart = `${m}-01`;
      const mNextMonth = mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, "0")}-01`;
      const [result] = await db.select({
        count: count(),
        totalDays: sql7`COALESCE(SUM(${leaveRecords.days}), 0)`
      }).from(leaveRecords).where(and11(
        sql7`${leaveRecords.startDate} >= ${monthStart}`,
        sql7`${leaveRecords.startDate} < ${mNextMonth}`
      ));
      monthlyLeave.push({
        month: m,
        count: result?.count ?? 0,
        totalDays: result?.totalDays ?? "0"
      });
    }
    return {
      activeEmployees: activeResult?.count ?? 0,
      onLeaveEmployees: onLeaveResult?.count ?? 0,
      newHiresThisMonth: newHiresResult?.count ?? 0,
      terminationsThisMonth: terminationsResult?.count ?? 0,
      onboardingEmployees: onboardingResult?.count ?? 0,
      offboardingEmployees: offboardingResult?.count ?? 0,
      contractExpiry30,
      contractExpiry60,
      contractExpiry90,
      monthlyWorkforce,
      leaveByStatus: leaveByStatus.map((r) => ({ status: r.status, count: r.count })),
      adjustmentByStatus: adjustmentByStatus.map((r) => ({ status: r.status, count: r.count })),
      adjustmentByType: adjustmentByType.map((r) => ({ type: r.type, count: r.count, totalAmount: r.totalAmount })),
      monthlyLeave
    };
  })
});

// server/routers/billingEntities.ts
import { z as z11 } from "zod";
init_db();
import { TRPCError as TRPCError11 } from "@trpc/server";
var billingEntitiesRouter = router({
  list: userProcedure.query(async () => {
    return await listBillingEntities();
  }),
  get: userProcedure.input(z11.object({ id: z11.number() })).query(async ({ input }) => {
    return await getBillingEntityById(input.id);
  }),
  create: financeManagerProcedure.input(
    z11.object({
      entityName: z11.string().min(1),
      legalName: z11.string().min(1),
      registrationNumber: z11.string().optional(),
      taxId: z11.string().optional(),
      country: z11.string(),
      address: z11.string().optional(),
      city: z11.string().optional(),
      state: z11.string().optional(),
      postalCode: z11.string().optional(),
      bankDetails: z11.string().optional(),
      currency: z11.string().default("USD"),
      contactEmail: z11.string().optional(),
      contactPhone: z11.string().optional(),
      isDefault: z11.boolean().default(false),
      invoicePrefix: z11.string().max(20).optional(),
      notes: z11.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.invoicePrefix) {
      const allEntities = await listBillingEntities();
      const prefixDup = allEntities.find(
        (e) => e.invoicePrefix === input.invoicePrefix
      );
      if (prefixDup) {
        throw new TRPCError11({
          code: "CONFLICT",
          message: `Invoice prefix "${input.invoicePrefix}" is already used by billing entity "${prefixDup.entityName}".`
        });
      }
      const nameDup = allEntities.find(
        (e) => e.entityName.toLowerCase() === input.entityName.toLowerCase()
      );
      if (nameDup) {
        throw new TRPCError11({
          code: "CONFLICT",
          message: `A billing entity with name "${input.entityName}" already exists. Please use a different name or confirm this is intentional.`
        });
      }
    }
    const result = await createBillingEntity({ ...input, isActive: true });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "billing_entity",
      changes: JSON.stringify(input)
    });
    return result;
  }),
  update: financeManagerProcedure.input(
    z11.object({
      id: z11.number(),
      data: z11.object({
        entityName: z11.string().optional(),
        legalName: z11.string().optional(),
        registrationNumber: z11.string().optional(),
        taxId: z11.string().optional(),
        country: z11.string().optional(),
        address: z11.string().optional(),
        city: z11.string().optional(),
        state: z11.string().optional(),
        postalCode: z11.string().optional(),
        bankDetails: z11.string().optional(),
        currency: z11.string().optional(),
        contactEmail: z11.string().optional(),
        contactPhone: z11.string().optional(),
        isDefault: z11.boolean().optional(),
        isActive: z11.boolean().optional(),
        invoicePrefix: z11.string().max(20).optional(),
        logoUrl: z11.string().optional(),
        logoFileKey: z11.string().optional(),
        notes: z11.string().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.data.invoicePrefix) {
      const allEntities = await listBillingEntities();
      const prefixDup = allEntities.find(
        (e) => e.invoicePrefix === input.data.invoicePrefix && e.id !== input.id
      );
      if (prefixDup) {
        throw new TRPCError11({
          code: "CONFLICT",
          message: `Invoice prefix "${input.data.invoicePrefix}" is already used by billing entity "${prefixDup.entityName}".`
        });
      }
    }
    await updateBillingEntity(input.id, input.data);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "billing_entity",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  /** Upload logo image to S3 and update billing entity */
  uploadLogo: financeManagerProcedure.input(
    z11.object({
      id: z11.number(),
      fileBase64: z11.string(),
      fileName: z11.string(),
      mimeType: z11.string().default("image/png")
    })
  ).mutation(async ({ input, ctx }) => {
    const fileBuffer = Buffer.from(input.fileBase64, "base64");
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `billing-entity-logos/${input.id}/${randomSuffix}-${input.fileName}`;
    const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
    await updateBillingEntity(input.id, { logoUrl: url, logoFileKey: fileKey });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "billing_entity",
      entityId: input.id,
      changes: JSON.stringify({ logoUrl: url, logoFileKey: fileKey })
    });
    return { success: true, logoUrl: url };
  }),
  delete: adminProcedure2.input(z11.object({ id: z11.number() })).mutation(async ({ input, ctx }) => {
    await deleteBillingEntity(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "billing_entity",
      entityId: input.id
    });
    return { success: true };
  })
});

// server/routers/userManagement.ts
import { z as z12 } from "zod";
import { TRPCError as TRPCError12 } from "@trpc/server";
init_db();
init_schema();
import { eq as eq13 } from "drizzle-orm";
import crypto3 from "crypto";
var userManagementRouter = router({
  list: adminProcedure2.input(
    z12.object({
      limit: z12.number().default(100),
      offset: z12.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listUsers(input.limit, input.offset);
  }),
  get: adminProcedure2.input(z12.object({ id: z12.number() })).query(async ({ input }) => {
    return await getUserById(input.id);
  }),
  /**
   * Update user roles.
   */
  updateRole: adminProcedure2.input(
    z12.object({
      id: z12.number(),
      roles: z12.array(z12.enum(ALL_ROLES)).min(1)
    })
  ).mutation(async ({ input, ctx }) => {
    const roles = input.roles;
    const validation = validateRoles(roles);
    if (!validation.valid) {
      throw new TRPCError12({ code: "BAD_REQUEST", message: validation.error });
    }
    const roleStr = serializeRoles(roles);
    await updateUser(input.id, { role: roleStr });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update_role",
      entityType: "user",
      entityId: input.id,
      changes: JSON.stringify({ roles })
    });
    return { success: true };
  }),
  toggleActive: adminProcedure2.input(z12.object({ id: z12.number(), isActive: z12.boolean() })).mutation(async ({ input, ctx }) => {
    await updateUser(input.id, { isActive: input.isActive });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: input.isActive ? "activate" : "deactivate",
      entityType: "user",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Invite a new admin user.
   * Creates a user record with an invite token.
   */
  invite: adminProcedure2.input(
    z12.object({
      email: z12.string().email(),
      name: z12.string().min(1),
      roles: z12.array(z12.enum(ALL_ROLES)).min(1)
    })
  ).mutation(async ({ input, ctx }) => {
    const existing = await getUserByEmail(input.email);
    if (existing) {
      throw new TRPCError12({ code: "CONFLICT", message: "A user with this email already exists" });
    }
    const roles = input.roles;
    const validation = validateRoles(roles);
    if (!validation.valid) {
      throw new TRPCError12({ code: "BAD_REQUEST", message: validation.error });
    }
    const inviteToken = generateInviteToken();
    const inviteExpiresAt = getInviteExpiryDate();
    const roleStr = serializeRoles(roles);
    const openId = `invite_${crypto3.randomBytes(16).toString("hex")}`;
    const db = await getDb();
    if (!db) throw new TRPCError12({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await db.insert(users).values({
      openId,
      name: input.name,
      email: input.email.toLowerCase().trim(),
      loginMethod: "password",
      role: roleStr,
      isActive: false,
      // Not active until they set a password
      inviteToken,
      inviteExpiresAt,
      language: "en",
      lastSignedIn: /* @__PURE__ */ new Date()
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "invite_user",
      entityType: "user",
      entityId: 0,
      changes: JSON.stringify({ email: input.email, name: input.name, roles })
    });
    const origin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
    const inviteUrl = `${origin}/invite?token=${inviteToken}`;
    return {
      success: true,
      inviteUrl,
      inviteToken
    };
  }),
  /**
   * Verify invite token (public — no auth required)
   */
  verifyInvite: publicProcedure.input(z12.object({ token: z12.string() })).query(async ({ input }) => {
    const user = await getUserByInviteToken(input.token);
    if (!user) {
      return { valid: false, reason: "Invalid invite link" };
    }
    if (user.isActive) {
      return { valid: false, reason: "Account already activated" };
    }
    if (user.inviteExpiresAt && user.inviteExpiresAt < /* @__PURE__ */ new Date()) {
      return { valid: false, reason: "Invite link has expired" };
    }
    return {
      valid: true,
      email: user.email,
      name: user.name
    };
  }),
  /**
   * Accept invite — set password and activate account (public — no auth required)
   */
  acceptInvite: publicProcedure.input(
    z12.object({
      token: z12.string(),
      password: z12.string().min(8, "Password must be at least 8 characters")
    })
  ).mutation(async ({ input, ctx }) => {
    const user = await getUserByInviteToken(input.token);
    if (!user) {
      throw new TRPCError12({ code: "BAD_REQUEST", message: "Invalid invite link" });
    }
    if (user.isActive) {
      throw new TRPCError12({ code: "BAD_REQUEST", message: "Account already activated" });
    }
    if (user.inviteExpiresAt && user.inviteExpiresAt < /* @__PURE__ */ new Date()) {
      throw new TRPCError12({ code: "BAD_REQUEST", message: "Invite link has expired" });
    }
    const passwordHash = await hashPassword(input.password);
    const db = await getDb();
    if (!db) throw new TRPCError12({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await db.update(users).set({
      passwordHash,
      isActive: true,
      inviteToken: null,
      inviteExpiresAt: null,
      lastSignedIn: /* @__PURE__ */ new Date()
    }).where(eq13(users.id, user.id));
    const payload = {
      sub: String(user.id),
      email: user.email || "",
      name: user.name || "",
      role: user.role,
      iss: "gea-admin"
    };
    const token = await signAdminToken(payload);
    setAdminCookie(ctx.req, ctx.res, token);
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }),
  /**
   * Change own password (authenticated)
   */
  changePassword: userProcedure.input(
    z12.object({
      currentPassword: z12.string(),
      newPassword: z12.string().min(8, "Password must be at least 8 characters")
    })
  ).mutation(async ({ input, ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user || !user.passwordHash) {
      throw new TRPCError12({ code: "INTERNAL_SERVER_ERROR", message: "Account error" });
    }
    const valid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new TRPCError12({ code: "BAD_REQUEST", message: "Current password is incorrect" });
    }
    const newHash = await hashPassword(input.newPassword);
    const db = await getDb();
    if (!db) throw new TRPCError12({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await db.update(users).set({ passwordHash: newHash }).where(eq13(users.id, ctx.user.id));
    return { success: true };
  }),
  /**
   * Admin reset password — generate a temporary password for a user.
   * The user will be required to change it on next login.
   */
  resetPassword: adminProcedure2.input(z12.object({ id: z12.number() })).mutation(async ({ input, ctx }) => {
    const user = await getUserById(input.id);
    if (!user) {
      throw new TRPCError12({ code: "NOT_FOUND", message: "User not found" });
    }
    if (user.id === ctx.user.id) {
      throw new TRPCError12({ code: "BAD_REQUEST", message: "Cannot reset your own password here. Use Change Password instead." });
    }
    const tempPassword = crypto3.randomBytes(6).toString("base64url").slice(0, 12);
    const passwordHash = await hashPassword(tempPassword);
    const db = await getDb();
    if (!db) throw new TRPCError12({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await db.update(users).set({
      passwordHash,
      mustChangePassword: true
    }).where(eq13(users.id, input.id));
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "reset_password",
      entityType: "user",
      entityId: input.id,
      changes: JSON.stringify({ targetUser: user.email })
    });
    return {
      success: true,
      temporaryPassword: tempPassword,
      userName: user.name,
      userEmail: user.email
    };
  }),
  /**
   * Resend invite — regenerate invite token for a pending user
   */
  resendInvite: adminProcedure2.input(z12.object({ id: z12.number() })).mutation(async ({ input, ctx }) => {
    const user = await getUserById(input.id);
    if (!user) {
      throw new TRPCError12({ code: "NOT_FOUND", message: "User not found" });
    }
    if (user.isActive) {
      throw new TRPCError12({ code: "BAD_REQUEST", message: "User is already active" });
    }
    const inviteToken = generateInviteToken();
    const inviteExpiresAt = getInviteExpiryDate();
    const db = await getDb();
    if (!db) throw new TRPCError12({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await db.update(users).set({ inviteToken, inviteExpiresAt }).where(eq13(users.id, input.id));
    const origin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
    const inviteUrl = `${origin}/invite?token=${inviteToken}`;
    return { success: true, inviteUrl, inviteToken };
  })
});

// server/routers/auditLogs.ts
import { z as z13 } from "zod";
init_db();
var auditLogsRouter = router({
  list: adminProcedure2.input(
    z13.object({
      entityType: z13.string().optional(),
      userId: z13.number().optional(),
      limit: z13.number().default(100),
      offset: z13.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listAuditLogs(
      { entityType: input.entityType, userId: input.userId },
      input.limit,
      input.offset
    );
  })
});

// server/routers/exchangeRates.ts
import { z as z14 } from "zod";
init_db();

// server/services/exchangeRateFetchService.ts
init_db();
init_schema();
import { eq as eq14 } from "drizzle-orm";
var EXCHANGERATE_API_URL = "https://open.er-api.com/v6/latest";
var FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";
var FRANKFURTER_SUPPORTED = /* @__PURE__ */ new Set([
  "AUD",
  "BGN",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "ISK",
  "JPY",
  "KRW",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RON",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "ZAR"
]);
async function fetchFromExchangeRateAPI(base) {
  const url = `${EXCHANGERATE_API_URL}/${base}`;
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15e3)
    });
    if (!response.ok) {
      console.error(
        `[ExchangeRateFetch] ExchangeRate-API error: ${response.status} ${response.statusText}`
      );
      return null;
    }
    const data = await response.json();
    if (data.result !== "success") {
      console.error(`[ExchangeRateFetch] ExchangeRate-API returned error result`);
      return null;
    }
    const dateMatch = data.time_last_update_utc?.match(/\d{4}-\d{2}-\d{2}/) || data.time_last_update_utc?.match(/\w+, (\d{2}) (\w+) (\d{4})/);
    let dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (data.time_last_update_utc) {
      const d = new Date(data.time_last_update_utc);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split("T")[0];
      }
    }
    return { rates: data.rates, date: dateStr };
  } catch (error) {
    console.error("[ExchangeRateFetch] Failed to fetch from ExchangeRate-API:", error);
    return null;
  }
}
async function fetchFromFrankfurter(base, symbols) {
  const validSymbols = symbols.filter((s) => s !== base && FRANKFURTER_SUPPORTED.has(s));
  if (validSymbols.length === 0) return null;
  const symbolsParam = validSymbols.join(",");
  const url = `${FRANKFURTER_BASE_URL}/latest?base=${base}&symbols=${symbolsParam}`;
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15e3)
    });
    if (!response.ok) {
      console.error(
        `[ExchangeRateFetch] Frankfurter API error: ${response.status} ${response.statusText}`
      );
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("[ExchangeRateFetch] Failed to fetch from Frankfurter:", error);
    return null;
  }
}
async function getDefaultMarkup() {
  try {
    const db = await getDb();
    if (!db) return 5;
    const result = await db.select().from(systemConfig).where(eq14(systemConfig.configKey, "exchange_rate_markup_percentage")).limit(1);
    if (result.length > 0) {
      return parseFloat(result[0].configValue) || 5;
    }
  } catch {
  }
  return 5;
}
async function setDefaultMarkup(percentage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(systemConfig).values({
    configKey: "exchange_rate_markup_percentage",
    configValue: percentage.toFixed(2),
    description: "Global exchange rate markup percentage applied to all currency conversions"
  }).onDuplicateKeyUpdate({
    set: {
      configValue: percentage.toFixed(2)
    }
  });
}
async function getRequiredCurrencies() {
  try {
    const countries = await listCountriesConfig();
    const currencies = /* @__PURE__ */ new Set();
    for (const c of countries) {
      if (c.localCurrency && c.localCurrency !== "USD") {
        currencies.add(c.localCurrency);
      }
    }
    return Array.from(currencies);
  } catch {
    return [
      "EUR",
      "GBP",
      "SGD",
      "JPY",
      "AUD",
      "CNY",
      "HKD",
      "CAD",
      "CHF",
      "KRW",
      "INR",
      "MYR",
      "THB",
      "PHP",
      "IDR"
    ];
  }
}
async function fetchAndStoreExchangeRates() {
  const errors = [];
  const unsupported = [];
  let ratesFetched = 0;
  let ratesStored = 0;
  let rateDate = "";
  let source = "";
  const markup = await getDefaultMarkup();
  const requiredCurrencies = await getRequiredCurrencies();
  const erApiData = await fetchFromExchangeRateAPI("USD");
  if (erApiData) {
    source = "exchangerate_api";
    rateDate = erApiData.date;
    const effectiveDate2 = /* @__PURE__ */ new Date(erApiData.date + "T00:00:00Z");
    for (const currency of requiredCurrencies) {
      const rate = erApiData.rates[currency];
      if (rate != null) {
        ratesFetched++;
        try {
          await upsertExchangeRate(
            "USD",
            currency,
            rate,
            effectiveDate2,
            "exchangerate_api",
            markup
          );
          ratesStored++;
        } catch (err) {
          errors.push(`Failed to store USD\u2192${currency}: ${err}`);
        }
      } else {
        unsupported.push(currency);
      }
    }
    console.log(
      `[ExchangeRateFetch] ExchangeRate-API: ${ratesStored}/${ratesFetched} rates stored for ${rateDate}` + (unsupported.length > 0 ? ` | Not found: ${unsupported.join(", ")}` : "")
    );
    return { success: errors.length === 0, ratesFetched, ratesStored, date: rateDate, errors, unsupported, source };
  }
  console.log("[ExchangeRateFetch] ExchangeRate-API unavailable, falling back to Frankfurter...");
  source = "frankfurter_ecb";
  const supported = requiredCurrencies.filter((c) => FRANKFURTER_SUPPORTED.has(c));
  const notSupported = requiredCurrencies.filter((c) => !FRANKFURTER_SUPPORTED.has(c));
  unsupported.push(...notSupported);
  const usdData = await fetchFromFrankfurter("USD", supported);
  if (!usdData) {
    errors.push("Both ExchangeRate-API and Frankfurter API failed");
    return { success: false, ratesFetched: 0, ratesStored: 0, date: "", errors, unsupported, source };
  }
  rateDate = usdData.date;
  const effectiveDate = /* @__PURE__ */ new Date(usdData.date + "T00:00:00Z");
  for (const [currency, rate] of Object.entries(usdData.rates)) {
    ratesFetched++;
    try {
      await upsertExchangeRate("USD", currency, rate, effectiveDate, "frankfurter_ecb", markup);
      ratesStored++;
    } catch (err) {
      errors.push(`Failed to store USD\u2192${currency}: ${err}`);
    }
  }
  console.log(
    `[ExchangeRateFetch] Frankfurter fallback: ${ratesStored}/${ratesFetched} rates stored for ${rateDate}` + (unsupported.length > 0 ? ` | Unsupported: ${unsupported.join(", ")}` : "")
  );
  return { success: errors.length === 0, ratesFetched, ratesStored, date: rateDate, errors, unsupported, source };
}

// server/routers/exchangeRates.ts
var exchangeRatesRouter = router({
  list: userProcedure.input(
    z14.object({
      limit: z14.number().default(200),
      offset: z14.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listAllExchangeRates(input.limit, input.offset);
  }),
  /** Get the current global markup percentage */
  getMarkup: userProcedure.query(async () => {
    const markup = await getDefaultMarkup();
    return { markupPercentage: markup };
  }),
  /** Update the global markup percentage (admin only) */
  setMarkup: adminProcedure2.input(z14.object({ markupPercentage: z14.number().min(0).max(50) })).mutation(async ({ input, ctx }) => {
    await setDefaultMarkup(input.markupPercentage);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "exchange_rate_markup",
      changes: JSON.stringify({ markupPercentage: input.markupPercentage })
    });
    return { success: true };
  }),
  upsert: adminProcedure2.input(
    z14.object({
      fromCurrency: z14.string().min(1).default("USD"),
      toCurrency: z14.string().min(1),
      rate: z14.number().positive(),
      effectiveDate: z14.string().optional(),
      source: z14.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const effectiveDate = input.effectiveDate ? new Date(input.effectiveDate) : /* @__PURE__ */ new Date();
    const markup = await getGlobalMarkup();
    await upsertExchangeRate(
      input.fromCurrency,
      input.toCurrency,
      input.rate,
      effectiveDate,
      input.source || "manual",
      markup
    );
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "upsert",
      entityType: "exchange_rate",
      changes: JSON.stringify({ ...input, markupPercentage: markup })
    });
    return { success: true };
  }),
  delete: adminProcedure2.input(z14.object({ id: z14.number() })).mutation(async ({ input, ctx }) => {
    await deleteExchangeRate(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "exchange_rate",
      entityId: input.id
    });
    return { success: true };
  }),
  /**
   * Get a real-time reference exchange rate for a currency pair.
   * Fetches from ExchangeRate-API (no key needed) and returns the live rate.
   * Used for reference display on invoice detail page (finance managers only).
   * Does NOT store the rate in DB.
   */
  liveRate: userProcedure.input(z14.object({
    from: z14.string().min(1).default("USD"),
    to: z14.string().min(1)
  })).query(async ({ input }) => {
    try {
      const url = `https://open.er-api.com/v6/latest/${input.from}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8e3) });
      if (!response.ok) {
        return { success: false, rate: null, error: `API returned ${response.status}` };
      }
      const data = await response.json();
      if (data.result !== "success" || !data.rates[input.to]) {
        return { success: false, rate: null, error: `Rate not available for ${input.from}\u2192${input.to}` };
      }
      return {
        success: true,
        rate: data.rates[input.to],
        from: input.from,
        to: input.to,
        lastUpdate: data.time_last_update_utc
      };
    } catch (err) {
      return { success: false, rate: null, error: err.message || "Failed to fetch live rate" };
    }
  }),
  /**
   * Manually trigger exchange rate fetch.
   * Primary: ExchangeRate-API (166 currencies)
   * Fallback: Frankfurter API (ECB data, 30 currencies)
   * Fetches latest USD→XXX rates and stores them with global markup applied
   */
  fetchLive: adminProcedure2.mutation(async ({ ctx }) => {
    const result = await fetchAndStoreExchangeRates();
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "fetch_live",
      entityType: "exchange_rates",
      changes: JSON.stringify({
        ratesFetched: result.ratesFetched,
        ratesStored: result.ratesStored,
        date: result.date,
        errors: result.errors,
        unsupported: result.unsupported
      })
    });
    return result;
  })
});

// server/routers/systemSettings.ts
import { z as z15 } from "zod";
init_db();

// server/cronJobs.ts
import cron from "node-cron";
init_db();
init_schema();
import { eq as eq15 } from "drizzle-orm";
function getWorkingDaysInMonth(year, month, workingDaysPerWeek = 5) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    if (workingDaysPerWeek >= 6) {
      if (dayOfWeek !== 0) workingDays++;
    } else {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
  }
  return workingDays;
}
function getWorkingDaysFromDate(year, month, startDay, workingDaysPerWeek = 5) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let d = startDay; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    if (workingDaysPerWeek >= 6) {
      if (dayOfWeek !== 0) workingDays++;
    } else {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
  }
  return workingDays;
}
function calculateProRata(baseSalary, startDate, payrollYear, payrollMonth, workingDaysPerWeek = 5) {
  const totalWorkingDays = getWorkingDaysInMonth(payrollYear, payrollMonth, workingDaysPerWeek);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();
  if (startYear < payrollYear || startYear === payrollYear && startMonth < payrollMonth) {
    return { proRataAmount: baseSalary, totalWorkingDays, workedDays: totalWorkingDays };
  }
  if (startYear === payrollYear && startMonth === payrollMonth) {
    const workedDays = getWorkingDaysFromDate(payrollYear, payrollMonth, startDay, workingDaysPerWeek);
    const proRataAmount = totalWorkingDays > 0 ? baseSalary * workedDays / totalWorkingDays : 0;
    return { proRataAmount: Math.round(proRataAmount * 100) / 100, totalWorkingDays, workedDays };
  }
  return { proRataAmount: 0, totalWorkingDays, workedDays: 0 };
}
async function runEmployeeAutoActivation() {
  const today = /* @__PURE__ */ new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(today.getTime() + (beijingOffset - today.getTimezoneOffset()) * 6e4);
  const todayStr = beijingDate.toISOString().split("T")[0];
  const dayOfMonth = beijingDate.getDate();
  const currentYear = beijingDate.getFullYear();
  const currentMonth = beijingDate.getMonth() + 1;
  console.log(`[CronJob] Employee auto-activation check for ${todayStr}`);
  const midMonthCutoff = parseInt(await getSystemConfig("mid_month_cutoff_day") ?? "15", 10);
  const readyEmployees = await getContractSignedEmployeesReadyForActivation(todayStr);
  let activated = 0;
  let addedToPayroll = 0;
  for (const emp of readyEmployees) {
    await updateEmployee(emp.id, { status: "active" });
    activated++;
    console.log(`[CronJob] Activated employee ${emp.employeeCode} (${emp.firstName} ${emp.lastName})`);
    try {
      await initializeLeaveBalancesForEmployee(emp.id, emp.country, currentYear, emp.customerId);
      console.log(`[CronJob] Initialized leave balances for ${emp.employeeCode}`);
    } catch (err) {
      console.error(`[CronJob] Failed to initialize leave balances for ${emp.employeeCode}:`, err);
    }
    await logAuditAction({
      userName: "System",
      action: "employee_auto_activated",
      entityType: "employee",
      entityId: emp.id,
      changes: { detail: `Auto-activated: contract_signed \u2192 active (startDate: ${emp.startDate})` }
    });
    if (dayOfMonth <= midMonthCutoff) {
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const existingRun = await findPayrollRunByCountryMonth(emp.country, monthStr);
      if (existingRun && existingRun.status === "draft") {
        const startDate = new Date(emp.startDate);
        const baseSalary = parseFloat(emp.baseSalary?.toString() ?? "0");
        const { proRataAmount, totalWorkingDays, workedDays } = calculateProRata(
          baseSalary,
          startDate,
          currentYear,
          currentMonth
        );
        const salaryStr = String(proRataAmount);
        await createPayrollItem({
          payrollRunId: existingRun.id,
          employeeId: emp.id,
          baseSalary: salaryStr,
          gross: salaryStr,
          net: salaryStr,
          totalEmploymentCost: salaryStr,
          currency: emp.salaryCurrency ?? existingRun.currency,
          notes: workedDays < totalWorkingDays ? `Pro-rata: ${workedDays}/${totalWorkingDays} working days (started ${emp.startDate})` : void 0
        });
        addedToPayroll++;
        console.log(`[CronJob] Added ${emp.employeeCode} to payroll run #${existingRun.id} (pro-rata: ${proRataAmount})`);
        await logAuditAction({
          userName: "System",
          action: "employee_auto_added_to_payroll",
          entityType: "payroll_run",
          entityId: existingRun.id,
          changes: { detail: `Auto-added employee ${emp.employeeCode} to payroll (pro-rata: ${proRataAmount}, ${workedDays}/${totalWorkingDays} days)` }
        });
      }
    } else {
      console.log(`[CronJob] ${emp.employeeCode} activated after ${midMonthCutoff}th, will be in next month's payroll`);
    }
  }
  console.log(`[CronJob] Employee activation complete: ${activated} activated, ${addedToPayroll} added to payroll`);
  return { activated, addedToPayroll };
}
async function runAutoLock() {
  const today = /* @__PURE__ */ new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(today.getTime() + (beijingOffset - today.getTimezoneOffset()) * 6e4);
  const currentYear = beijingDate.getFullYear();
  const currentMonth = beijingDate.getMonth() + 1;
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
  const prevMonthDate = `${prevMonthStr}-01`;
  console.log(`[CronJob] Auto-locking submitted data for ${prevMonthStr}`);
  const adjLocked = await lockSubmittedAdjustments(prevMonthDate);
  console.log(`[CronJob] Locked ${adjLocked} adjustments for ${prevMonthStr}`);
  const leaveLocked = await lockSubmittedLeaveRecords(prevMonthStr);
  console.log(`[CronJob] Locked ${leaveLocked} leave records for ${prevMonthStr}`);
  await logAuditAction({
    userName: "System",
    action: "auto_lock_monthly",
    entityType: "system",
    entityId: 0,
    changes: { detail: `Auto-locked ${adjLocked} adjustments and ${leaveLocked} leave records for ${prevMonthStr}` }
  });
  return { adjustmentsLocked: adjLocked, leaveLocked };
}
async function runAutoCreatePayrollRuns() {
  const today = /* @__PURE__ */ new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(today.getTime() + (beijingOffset - today.getTimezoneOffset()) * 6e4);
  const currentYear = beijingDate.getFullYear();
  const currentMonth = beijingDate.getMonth() + 1;
  const targetMonth = currentMonth;
  const targetYear = currentYear;
  const targetMonthStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const targetMonthEnd = new Date(targetYear, targetMonth, 0);
  const targetMonthEndStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetMonthEnd.getDate()).padStart(2, "0")}`;
  console.log(`[CronJob] Auto-creating payroll runs for ${targetMonthStr}`);
  const countryCodes = await getCountriesWithActiveEmployees();
  console.log(`[CronJob] Found ${countryCodes.length} countries with active employees`);
  const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const db = await getDb2();
  if (!db) {
    console.error("[CronJob] Database not available");
    return { created: 0, employeesFilled: 0 };
  }
  let created = 0;
  let employeesFilled = 0;
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }
  const prevMonthPayroll = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
  for (const countryCode of countryCodes) {
    const existing = await findPayrollRunByCountryMonth(countryCode, targetMonthStr);
    if (existing) {
      console.log(`[CronJob] Payroll run already exists for ${countryCode} ${targetMonthStr}, skipping`);
      continue;
    }
    const [config] = await db.select().from(countriesConfig).where(eq15(countriesConfig.countryCode, countryCode)).limit(1);
    if (!config) {
      console.log(`[CronJob] No country config for ${countryCode}, skipping`);
      continue;
    }
    const result = await createPayrollRun({
      countryCode,
      payrollMonth: targetMonthStr,
      currency: config.localCurrency,
      status: "draft",
      notes: `Auto-created on ${beijingDate.toISOString().split("T")[0]}`
    });
    const runId = result[0]?.insertId;
    if (!runId) {
      console.error(`[CronJob] Failed to create payroll run for ${countryCode}`);
      continue;
    }
    created++;
    console.log(`[CronJob] Created payroll run #${runId} for ${countryCode} ${targetMonthStr}`);
    const eligibleEmployees = await getEmployeesForPayrollMonth(countryCode, targetMonthStr, targetMonthEndStr);
    const lockedAdjustments = await getSubmittedAdjustmentsForPayroll(countryCode, prevMonthPayroll, ["locked"]);
    const lockedUnpaidLeave = await getSubmittedUnpaidLeaveForPayroll(countryCode, `${prevYear}-${String(prevMonth).padStart(2, "0")}`, ["locked"]);
    const adjByEmployee = /* @__PURE__ */ new Map();
    for (const adj of lockedAdjustments) {
      const empId = adj.employeeId;
      if (!adjByEmployee.has(empId)) {
        adjByEmployee.set(empId, { bonus: 0, allowances: 0, reimbursements: 0, otherDeductions: 0 });
      }
      const agg = adjByEmployee.get(empId);
      const amount = parseFloat(String(adj.amount ?? 0));
      switch (adj.adjustmentType) {
        case "bonus":
          agg.bonus += amount;
          break;
        case "allowance":
          agg.allowances += amount;
          break;
        case "reimbursement":
          agg.reimbursements += amount;
          break;
        case "deduction":
          agg.otherDeductions += amount;
          break;
        case "other":
          agg.otherDeductions += amount;
          break;
      }
    }
    const leaveByEmployee = /* @__PURE__ */ new Map();
    for (const leave of lockedUnpaidLeave) {
      const empId = leave.employeeId;
      if (!leaveByEmployee.has(empId)) {
        leaveByEmployee.set(empId, { days: 0 });
      }
      const agg = leaveByEmployee.get(empId);
      agg.days += parseFloat(String(leave.days ?? 0));
    }
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalEmployerCost = 0;
    for (const emp of eligibleEmployees) {
      const baseSalary = parseFloat(emp.baseSalary?.toString() ?? "0");
      const startDate = new Date(emp.startDate);
      const workingDaysPerWeek = config.workingDaysPerWeek ?? 5;
      const { proRataAmount, totalWorkingDays, workedDays } = calculateProRata(
        baseSalary,
        startDate,
        targetYear,
        targetMonth,
        workingDaysPerWeek
      );
      const adjAgg = adjByEmployee.get(emp.id) ?? { bonus: 0, allowances: 0, reimbursements: 0, otherDeductions: 0 };
      const leaveAgg = leaveByEmployee.get(emp.id) ?? { days: 0 };
      const monthlyWorkingDays = workingDaysPerWeek * 4.33;
      const unpaidLeaveDeduction = monthlyWorkingDays > 0 && leaveAgg.days > 0 ? Math.round(baseSalary / monthlyWorkingDays * leaveAgg.days * 100) / 100 : 0;
      const gross = proRataAmount + adjAgg.bonus + adjAgg.allowances + adjAgg.reimbursements;
      const deductions = adjAgg.otherDeductions + unpaidLeaveDeduction;
      const net2 = gross - deductions;
      await createPayrollItem({
        payrollRunId: runId,
        employeeId: emp.id,
        baseSalary: String(proRataAmount),
        bonus: String(adjAgg.bonus),
        allowances: String(adjAgg.allowances),
        reimbursements: String(adjAgg.reimbursements),
        deductions: String(adjAgg.otherDeductions),
        unpaidLeaveDays: String(leaveAgg.days),
        unpaidLeaveDeduction: String(unpaidLeaveDeduction),
        gross: String(gross),
        net: String(net2),
        totalEmploymentCost: String(net2),
        currency: emp.salaryCurrency ?? config.localCurrency,
        notes: workedDays < totalWorkingDays ? `Pro-rata: ${workedDays}/${totalWorkingDays} working days (started ${emp.startDate})` : void 0
      });
      totalGross += gross;
      totalDeductions += deductions;
      totalNet += net2;
      totalEmployerCost += net2;
      employeesFilled++;
    }
    await updatePayrollRun(runId, {
      totalGross: String(totalGross),
      totalDeductions: String(totalDeductions),
      totalNet: String(totalNet),
      totalEmployerCost: String(totalEmployerCost)
    });
    console.log(`[CronJob] Filled ${eligibleEmployees.length} employees for ${countryCode} (gross: ${totalGross})`);
    await logAuditAction({
      userName: "System",
      action: "payroll_run_auto_created",
      entityType: "payroll_run",
      entityId: runId,
      changes: { detail: `Auto-created draft payroll for ${countryCode} ${targetMonthStr} with ${eligibleEmployees.length} employees, aggregated locked adjustments/leave` }
    });
  }
  console.log(`[CronJob] Payroll auto-creation complete: ${created} runs created, ${employeesFilled} employees filled`);
  return { created, employeesFilled };
}
async function runLeaveStatusTransition() {
  const today = /* @__PURE__ */ new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(today.getTime() + (beijingOffset - today.getTimezoneOffset()) * 6e4);
  const todayStr = beijingDate.toISOString().split("T")[0];
  console.log(`[CronJob] Leave status transition check for ${todayStr}`);
  let toOnLeave = 0;
  let toActive = 0;
  const activeLeaves = await getActiveLeaveRecordsForDate(todayStr);
  const employeesWithActiveLeave = /* @__PURE__ */ new Set();
  for (const leave of activeLeaves) {
    employeesWithActiveLeave.add(leave.employeeId);
  }
  const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const db = await getDb2();
  if (!db) {
    console.error("[CronJob] Database not available for leave transition");
    return { toOnLeave: 0, toActive: 0 };
  }
  const { employees: employees2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  for (const empId of Array.from(employeesWithActiveLeave)) {
    const [emp] = await db.select({ id: employees2.id, status: employees2.status, employeeCode: employees2.employeeCode }).from(employees2).where(eq15(employees2.id, empId)).limit(1);
    if (emp && emp.status === "active") {
      await updateEmployee(empId, { status: "on_leave" });
      toOnLeave++;
      console.log(`[CronJob] Employee ${emp.employeeCode || empId} transitioned to on_leave`);
      await logAuditAction({
        userName: "System",
        action: "employee_auto_on_leave",
        entityType: "employee",
        entityId: empId,
        changes: { detail: `Auto-transitioned active \u2192 on_leave (leave record covers ${todayStr})` }
      });
    }
  }
  const expiredLeaveEmps = await getOnLeaveEmployeesWithExpiredLeave(todayStr);
  for (const emp of expiredLeaveEmps) {
    await updateEmployee(emp.id, { status: "active" });
    toActive++;
    console.log(`[CronJob] Employee ${emp.employeeCode || emp.id} returned to active (leave ended)`);
    await logAuditAction({
      userName: "System",
      action: "employee_auto_return_from_leave",
      entityType: "employee",
      entityId: emp.id,
      changes: { detail: `Auto-transitioned on_leave \u2192 active (all leave records ended before ${todayStr})` }
    });
  }
  console.log(`[CronJob] Leave transition complete: ${toOnLeave} to on_leave, ${toActive} returned to active`);
  return { toOnLeave, toActive };
}
async function runOverdueInvoiceDetection() {
  const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const db = await getDb2();
  if (!db) {
    console.error("[CronJob] Database not available for overdue detection");
    return { overdueCount: 0 };
  }
  const { invoices: invoices2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq34, and: and27, lt: lt3, isNotNull: isNotNull2 } = await import("drizzle-orm");
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const overdueInvoices = await db.select({ id: invoices2.id, invoiceNumber: invoices2.invoiceNumber, dueDate: invoices2.dueDate }).from(invoices2).where(
    and27(
      eq34(invoices2.status, "sent"),
      isNotNull2(invoices2.dueDate),
      lt3(invoices2.dueDate, today)
    )
  );
  let overdueCount = 0;
  for (const inv of overdueInvoices) {
    await db.update(invoices2).set({ status: "overdue" }).where(eq34(invoices2.id, inv.id));
    overdueCount++;
    console.log(`[CronJob] Invoice ${inv.invoiceNumber || inv.id} marked as overdue (due: ${inv.dueDate})`);
    await logAuditAction({
      userName: "System",
      action: "invoice_auto_overdue",
      entityType: "invoice",
      entityId: inv.id,
      changes: { detail: `Auto-transitioned sent \u2192 overdue (dueDate: ${inv.dueDate})` }
    });
  }
  if (overdueCount > 0) {
    const { notifyOwner: notifyOwner2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
    notifyOwner2({
      title: `${overdueCount} Invoice(s) Now Overdue`,
      content: `${overdueCount} invoice(s) have been automatically marked as overdue because their due date has passed.

Please review and follow up with the respective clients.`
    }).catch((err) => console.warn("[Notification] Failed to notify about overdue invoices:", err));
  }
  console.log(`[CronJob] Overdue detection complete: ${overdueCount} invoices marked overdue`);
  return { overdueCount };
}
async function runMonthlyLeaveAccrual() {
  const now = /* @__PURE__ */ new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(now.getTime() + (beijingOffset - now.getTimezoneOffset()) * 6e4);
  const currentYear = beijingDate.getFullYear();
  const currentMonth = beijingDate.getMonth() + 1;
  console.log(`[CronJob] Running monthly leave accrual for ${currentYear}-${String(currentMonth).padStart(2, "0")}`);
  const { data: activeEmployees } = await listEmployees({ status: "active" }, 1e4, 0);
  const newEmployees = activeEmployees.filter((emp) => {
    if (!emp.startDate) return false;
    const startDate = new Date(emp.startDate);
    return startDate.getFullYear() === currentYear;
  });
  console.log(`[CronJob] Found ${newEmployees.length} employees who started in ${currentYear}`);
  let processed = 0;
  let updated = 0;
  let errors = 0;
  for (const emp of newEmployees) {
    try {
      processed++;
      const startDate = new Date(emp.startDate);
      const startMonth = startDate.getMonth() + 1;
      const startDay = startDate.getDate();
      let fullMonthsServed;
      if (startDay === 1) {
        fullMonthsServed = currentMonth - startMonth + 1;
      } else {
        fullMonthsServed = currentMonth - startMonth;
      }
      if (fullMonthsServed <= 0) {
        continue;
      }
      const policies = await getCustomerLeavePoliciesForCountry(emp.customerId, emp.country);
      const balances = await listLeaveBalances(emp.id, currentYear);
      for (const balance of balances) {
        const policy = policies.find((p) => p.leaveTypeId === balance.leaveTypeId);
        const annualEntitlement = policy ? policy.annualEntitlement : balance.totalEntitlement;
        if (!annualEntitlement || annualEntitlement <= 0) continue;
        const rawAccrued = annualEntitlement / 12 * fullMonthsServed;
        const accruedHalfDay = Math.ceil(rawAccrued * 2) / 2;
        const finalAccrued = Math.round(accruedHalfDay);
        if (finalAccrued !== balance.totalEntitlement && finalAccrued < annualEntitlement) {
          const newRemaining = finalAccrued - balance.used;
          await updateLeaveBalance(balance.id, {
            totalEntitlement: finalAccrued,
            remaining: Math.max(0, newRemaining)
          });
          updated++;
          console.log(`[CronJob] Updated leave balance for ${emp.firstName} ${emp.lastName} (${emp.employeeCode}): leaveType=${balance.leaveTypeName}, months=${fullMonthsServed}, accrued=${finalAccrued}/${annualEntitlement}`);
        }
      }
    } catch (err) {
      errors++;
      console.error(`[CronJob] Failed to process leave accrual for employee ${emp.id}:`, err);
    }
  }
  console.log(`[CronJob] Monthly leave accrual complete: ${processed} processed, ${updated} updated, ${errors} errors`);
  await logAuditAction({
    userName: "System",
    action: "monthly_leave_accrual",
    entityType: "system",
    entityId: 0,
    changes: { detail: `Monthly leave accrual: ${processed} processed, ${updated} updated, ${errors} errors` }
  });
  return { processed, updated, errors };
}
function scheduleCronJobs() {
  cron.schedule("0 1 0 * * *", async () => {
    console.log("[CronJob] Running daily employee auto-activation (Beijing 00:01)...");
    try {
      await runEmployeeAutoActivation();
    } catch (err) {
      console.error("[CronJob] Employee auto-activation failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });
  cron.schedule("0 0 0 5 * *", async () => {
    console.log("[CronJob] Running monthly auto-lock (Beijing 00:00 on 5th)...");
    try {
      await runAutoLock();
    } catch (err) {
      console.error("[CronJob] Auto-lock failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });
  cron.schedule("0 1 0 5 * *", async () => {
    console.log("[CronJob] Running monthly payroll auto-creation (Beijing 00:01 on 5th)...");
    try {
      await runAutoCreatePayrollRuns();
    } catch (err) {
      console.error("[CronJob] Payroll auto-creation failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });
  cron.schedule("0 2 0 * * *", async () => {
    console.log("[CronJob] Running daily leave status transition (Beijing 00:02)...");
    try {
      await runLeaveStatusTransition();
    } catch (err) {
      console.error("[CronJob] Leave status transition failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });
  cron.schedule("0 3 0 * * *", async () => {
    console.log("[CronJob] Running daily overdue invoice detection (Beijing 00:03)...");
    try {
      await runOverdueInvoiceDetection();
    } catch (err) {
      console.error("[CronJob] Overdue invoice detection failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });
  cron.schedule("0 5 0 * * *", async () => {
    console.log("[CronJob] Running daily exchange rate fetch (Beijing 00:05)...");
    try {
      const result = await fetchAndStoreExchangeRates();
      console.log(`[CronJob] Exchange rates: ${result.ratesStored} stored, date: ${result.date}`);
      if (result.errors.length > 0) {
        console.warn("[CronJob] Exchange rate fetch warnings:", result.errors);
      }
    } catch (err) {
      console.error("[CronJob] Exchange rate fetch failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });
  cron.schedule("0 10 0 1 * *", async () => {
    console.log("[CronJob] Running monthly leave accrual (Beijing 00:10 on 1st)...");
    try {
      await runMonthlyLeaveAccrual();
    } catch (err) {
      console.error("[CronJob] Monthly leave accrual failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });
  console.log("[CronJob] Scheduled: Employee auto-activation (daily 00:01 Beijing)");
  console.log("[CronJob] Scheduled: Leave status transition (daily 00:02 Beijing)");
  console.log("[CronJob] Scheduled: Overdue invoice detection (daily 00:03 Beijing)");
  console.log("[CronJob] Scheduled: Exchange rate auto-fetch (daily 00:05 Beijing)");
  console.log("[CronJob] Scheduled: Auto-lock adjustments/leave (monthly 5th 00:00 Beijing)");
  console.log("[CronJob] Scheduled: Payroll auto-creation (monthly 5th 00:01 Beijing)");
  console.log("[CronJob] Scheduled: Monthly leave accrual (monthly 1st 00:10 Beijing)");
}

// server/routers/systemSettings.ts
var systemSettingsRouter = router({
  // List all system configs (any authenticated user can view)
  list: userProcedure.query(async () => {
    return await listSystemConfigs();
  }),
  // Get a single config value
  get: userProcedure.input(z15.object({ key: z15.string() })).query(async ({ input }) => {
    const value = await getSystemConfig(input.key);
    return { key: input.key, value };
  }),
  // Update a system config (admin only)
  update: adminProcedure2.input(z15.object({
    key: z15.string(),
    value: z15.string(),
    description: z15.string().optional()
  })).mutation(async ({ input }) => {
    await setSystemConfig(input.key, input.value, input.description);
    return { success: true };
  }),
  // Bulk update multiple configs at once
  bulkUpdate: adminProcedure2.input(z15.object({
    configs: z15.array(z15.object({
      key: z15.string(),
      value: z15.string(),
      description: z15.string().optional()
    }))
  })).mutation(async ({ input }) => {
    for (const cfg of input.configs) {
      await setSystemConfig(cfg.key, cfg.value, cfg.description);
    }
    return { success: true, updated: input.configs.length };
  }),
  // ── Payroll Period Endpoints ──
  /**
   * Get the current active payroll period with cutoff info.
   * Returns: payrollMonth, cutoffDate, cutoffPassed, timeRemaining, paymentDate
   */
  currentPayrollPeriod: userProcedure.query(async () => {
    return await getCurrentPayrollPeriod();
  }),
  /**
   * Get payroll period info for a specific month.
   */
  payrollPeriodInfo: userProcedure.input(z15.object({ month: z15.string().regex(/^\d{4}-\d{2}$/) })).query(async ({ input }) => {
    return await getPayrollPeriodInfo(input.month);
  }),
  /**
   * Check cutoff status for a specific effective month.
   * Used by frontend to show warnings before submitting.
   */
  checkCutoff: userProcedure.input(z15.object({ effectiveMonth: z15.string() })).query(async ({ input }) => {
    const result = await checkCutoffPassed(input.effectiveMonth);
    return {
      passed: result.passed,
      cutoffDate: result.cutoffDate.toISOString()
    };
  }),
  /**
   * Preview how a cross-month leave would be split into monthly portions.
   * Used by frontend to show the split before user confirms.
   */
  previewLeaveSplit: userProcedure.input(z15.object({
    startDate: z15.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z15.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    totalDays: z15.number().positive()
  })).query(({ input }) => {
    const crossMonth = isLeavesCrossMonth(input.startDate, input.endDate);
    const splits = splitLeaveByMonth(input.startDate, input.endDate, input.totalDays);
    return {
      crossMonth,
      splits
    };
  }),
  // ── Manual Triggers ──
  // Manual trigger: Run employee auto-activation (admin only)
  triggerEmployeeActivation: adminProcedure2.mutation(async () => {
    const result = await runEmployeeAutoActivation();
    return result;
  }),
  // Manual trigger: Run payroll auto-creation (admin only)
  triggerPayrollAutoCreate: adminProcedure2.mutation(async () => {
    const result = await runAutoCreatePayrollRuns();
    return result;
  })
});

// server/routers/customerLeavePolicies.ts
import { z as z16 } from "zod";
import { TRPCError as TRPCError13 } from "@trpc/server";
init_db();
var customerLeavePoliciesRouter = router({
  // List all leave policies for a customer, optionally filtered by country
  list: userProcedure.input(
    z16.object({
      customerId: z16.number(),
      countryCode: z16.string().optional()
    })
  ).query(async ({ input }) => {
    return await listCustomerLeavePolicies(input.customerId, input.countryCode);
  }),
  // Create a new leave policy
  create: customerManagerProcedure.input(
    z16.object({
      customerId: z16.number(),
      countryCode: z16.string(),
      leaveTypeId: z16.number(),
      annualEntitlement: z16.number().min(0),
      expiryRule: z16.enum(["year_end", "anniversary", "no_expiry"]).default("year_end"),
      carryOverDays: z16.number().min(0).default(0)
    })
  ).mutation(async ({ input }) => {
    const countryConfig = await getCountryConfig(input.countryCode);
    const leaveTypes2 = await listLeaveTypesByCountry(input.countryCode);
    const leaveType = leaveTypes2.find((lt3) => lt3.id === input.leaveTypeId);
    if (!leaveType) {
      throw new TRPCError13({
        code: "BAD_REQUEST",
        message: `Leave type ${input.leaveTypeId} not found for country ${input.countryCode}`
      });
    }
    if (leaveType.leaveTypeName.toLowerCase().includes("annual") && countryConfig?.statutoryAnnualLeave) {
      if (input.annualEntitlement < countryConfig.statutoryAnnualLeave) {
        throw new TRPCError13({
          code: "BAD_REQUEST",
          message: `Annual entitlement (${input.annualEntitlement}) cannot be less than statutory minimum (${countryConfig.statutoryAnnualLeave}) for ${input.countryCode}`
        });
      }
    }
    if (leaveType.annualEntitlement && input.annualEntitlement < leaveType.annualEntitlement) {
      throw new TRPCError13({
        code: "BAD_REQUEST",
        message: `Annual entitlement (${input.annualEntitlement}) cannot be less than statutory minimum (${leaveType.annualEntitlement}) for ${leaveType.leaveTypeName}`
      });
    }
    return await createCustomerLeavePolicy(input);
  }),
  // Update an existing leave policy
  update: customerManagerProcedure.input(
    z16.object({
      id: z16.number(),
      data: z16.object({
        annualEntitlement: z16.number().min(0).optional(),
        expiryRule: z16.enum(["year_end", "anniversary", "no_expiry"]).optional(),
        carryOverDays: z16.number().min(0).optional()
      })
    })
  ).mutation(async ({ input }) => {
    const updateResult = await updateCustomerLeavePolicy(input.id, input.data);
    syncLeaveBalancesOnPolicyUpdate(input.id).catch((err) => {
      console.error(`[LeaveSync] Background sync failed for policy ID ${input.id}:`, err);
    });
    return updateResult;
  }),
  // Delete a leave policy
  delete: customerManagerProcedure.input(z16.object({ id: z16.number() })).mutation(async ({ input }) => {
    return await deleteCustomerLeavePolicy(input.id);
  }),
  // Batch create: initialize policies for a customer + country from statutory defaults
  initializeFromStatutory: customerManagerProcedure.input(
    z16.object({
      customerId: z16.number(),
      countryCode: z16.string(),
      overrides: z16.array(
        z16.object({
          leaveTypeId: z16.number(),
          annualEntitlement: z16.number().min(0),
          expiryRule: z16.enum(["year_end", "anniversary", "no_expiry"]).optional(),
          carryOverDays: z16.number().min(0).optional()
        })
      ).optional()
    })
  ).mutation(async ({ input }) => {
    const leaveTypes2 = await listLeaveTypesByCountry(input.countryCode);
    if (leaveTypes2.length === 0) {
      throw new TRPCError13({
        code: "BAD_REQUEST",
        message: `No leave types configured for country ${input.countryCode}`
      });
    }
    const existing = await listCustomerLeavePolicies(input.customerId, input.countryCode);
    const existingTypeIds = new Set(existing.map((p) => p.leaveTypeId));
    const overrideMap = new Map(
      (input.overrides ?? []).map((o) => [o.leaveTypeId, o])
    );
    let created = 0;
    for (const lt3 of leaveTypes2) {
      if (existingTypeIds.has(lt3.id)) continue;
      const override = overrideMap.get(lt3.id);
      await createCustomerLeavePolicy({
        customerId: input.customerId,
        countryCode: input.countryCode,
        leaveTypeId: lt3.id,
        annualEntitlement: override?.annualEntitlement ?? lt3.annualEntitlement ?? 0,
        expiryRule: override?.expiryRule ?? "year_end",
        carryOverDays: override?.carryOverDays ?? 0
      });
      created++;
    }
    return { created };
  })
});

// server/routers/vendors.ts
import { z as z17 } from "zod";
init_db();
import { TRPCError as TRPCError14 } from "@trpc/server";
var vendorsRouter = router({
  list: userProcedure.input(
    z17.object({
      status: z17.string().optional(),
      country: z17.string().optional(),
      vendorType: z17.string().optional(),
      search: z17.string().optional(),
      limit: z17.number().default(50),
      offset: z17.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listVendors(
      {
        status: input.status,
        country: input.country,
        vendorType: input.vendorType,
        search: input.search
      },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z17.object({ id: z17.number() })).query(async ({ input }) => {
    const vendor = await getVendorById(input.id);
    if (!vendor) {
      throw new TRPCError14({ code: "NOT_FOUND", message: "Vendor not found" });
    }
    return vendor;
  }),
  create: financeManagerProcedure.input(
    z17.object({
      name: z17.string().min(1, "Vendor name is required"),
      legalName: z17.string().optional(),
      contactName: z17.string().optional(),
      contactEmail: z17.string().email().optional().or(z17.literal("")),
      contactPhone: z17.string().optional(),
      country: z17.string().min(1, "Country is required"),
      address: z17.string().optional(),
      city: z17.string().optional(),
      state: z17.string().optional(),
      postalCode: z17.string().optional(),
      serviceType: z17.string().optional(),
      currency: z17.string().default("USD"),
      bankDetails: z17.string().optional(),
      taxId: z17.string().optional(),
      paymentTermDays: z17.number().default(30),
      vendorType: z17.enum(["client_related", "operational"]).default("client_related"),
      status: z17.enum(["active", "inactive"]).default("active"),
      notes: z17.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const result = await createVendor(input);
    const insertId = result[0]?.insertId ?? result.insertId;
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "create",
      entityType: "vendor",
      entityId: insertId,
      changes: { created: input }
    });
    return { id: insertId, message: "Vendor created successfully" };
  }),
  update: financeManagerProcedure.input(
    z17.object({
      id: z17.number(),
      name: z17.string().min(1).optional(),
      legalName: z17.string().optional(),
      contactName: z17.string().optional(),
      contactEmail: z17.string().email().optional().or(z17.literal("")),
      contactPhone: z17.string().optional(),
      country: z17.string().optional(),
      address: z17.string().optional(),
      city: z17.string().optional(),
      state: z17.string().optional(),
      postalCode: z17.string().optional(),
      serviceType: z17.string().optional(),
      currency: z17.string().optional(),
      bankDetails: z17.string().optional(),
      taxId: z17.string().optional(),
      paymentTermDays: z17.number().optional(),
      vendorType: z17.enum(["client_related", "operational"]).optional(),
      status: z17.enum(["active", "inactive"]).optional(),
      notes: z17.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    const existing = await getVendorById(id);
    if (!existing) {
      throw new TRPCError14({ code: "NOT_FOUND", message: "Vendor not found" });
    }
    await updateVendor(id, data);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "update",
      entityType: "vendor",
      entityId: id,
      changes: { before: existing, after: data }
    });
    return { success: true, message: "Vendor updated successfully" };
  }),
  delete: financeManagerProcedure.input(z17.object({ id: z17.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getVendorById(input.id);
    if (!existing) {
      throw new TRPCError14({ code: "NOT_FOUND", message: "Vendor not found" });
    }
    await deleteVendor(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "delete",
      entityType: "vendor",
      entityId: input.id,
      changes: { deleted: existing }
    });
    return { success: true, message: "Vendor deleted successfully" };
  })
});

// server/routers/vendorBills.ts
import { z as z18 } from "zod";
init_db();
import { TRPCError as TRPCError15 } from "@trpc/server";
var billItemSchema = z18.object({
  description: z18.string().min(1),
  quantity: z18.string().default("1"),
  unitPrice: z18.string(),
  amount: z18.string(),
  relatedCustomerId: z18.number().optional(),
  relatedEmployeeId: z18.number().optional(),
  relatedCountryCode: z18.string().optional()
});
var vendorBillsRouter = router({
  list: userProcedure.input(
    z18.object({
      vendorId: z18.number().optional(),
      status: z18.string().optional(),
      category: z18.string().optional(),
      billMonth: z18.string().optional(),
      search: z18.string().optional(),
      limit: z18.number().default(50),
      offset: z18.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listVendorBills(
      {
        vendorId: input.vendorId,
        status: input.status,
        category: input.category,
        billMonth: input.billMonth,
        search: input.search
      },
      input.limit,
      input.offset
    );
  }),
  get: userProcedure.input(z18.object({ id: z18.number() })).query(async ({ input }) => {
    const bill = await getVendorBillById(input.id);
    if (!bill) {
      throw new TRPCError15({ code: "NOT_FOUND", message: "Vendor bill not found" });
    }
    const items = await listVendorBillItemsByBill(input.id);
    const vendor = await getVendorById(bill.vendorId);
    return { ...bill, items, vendor };
  }),
  create: financeManagerProcedure.input(
    z18.object({
      vendorId: z18.number(),
      billNumber: z18.string().min(1, "Bill number is required"),
      billDate: z18.string(),
      // YYYY-MM-DD
      dueDate: z18.string().optional(),
      paidDate: z18.string().optional(),
      billMonth: z18.string().optional(),
      // YYYY-MM
      currency: z18.string().default("USD"),
      subtotal: z18.string(),
      tax: z18.string().default("0"),
      totalAmount: z18.string(),
      status: z18.enum(["draft", "pending_approval", "approved", "paid", "partially_paid", "overdue", "cancelled", "void"]).default("draft"),
      category: z18.enum([
        "payroll_processing",
        "social_contributions",
        "tax_filing",
        "legal_compliance",
        "visa_immigration",
        "hr_advisory",
        "it_services",
        "office_rent",
        "insurance",
        "bank_charges",
        "consulting",
        "equipment",
        "travel",
        "marketing",
        "other"
      ]).default("other"),
      billType: z18.enum(["operational", "deposit", "deposit_refund"]).default("operational"),
      description: z18.string().optional(),
      internalNotes: z18.string().optional(),
      receiptFileUrl: z18.string().optional(),
      receiptFileKey: z18.string().optional(),
      items: z18.array(billItemSchema).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const { items, ...billData } = input;
    const vendor = await getVendorById(billData.vendorId);
    if (!vendor) {
      throw new TRPCError15({ code: "NOT_FOUND", message: "Vendor not found" });
    }
    const billValues = {
      ...billData,
      billDate: new Date(billData.billDate),
      dueDate: billData.dueDate ? new Date(billData.dueDate) : void 0,
      paidDate: billData.paidDate ? new Date(billData.paidDate) : void 0,
      billMonth: billData.billMonth ? /* @__PURE__ */ new Date(`${billData.billMonth}-01`) : void 0,
      submittedBy: ctx.user.id,
      submittedAt: /* @__PURE__ */ new Date()
    };
    const insertId = await createVendorBill(billValues);
    if (items && items.length > 0 && insertId) {
      for (const item of items) {
        await createVendorBillItem({
          vendorBillId: insertId,
          ...item
        });
      }
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "create",
      entityType: "vendor_bill",
      entityId: insertId,
      changes: { created: { ...billData, itemCount: items?.length || 0 } }
    });
    return { id: insertId, message: "Vendor bill created successfully" };
  }),
  update: financeManagerProcedure.input(
    z18.object({
      id: z18.number(),
      vendorId: z18.number().optional(),
      billNumber: z18.string().optional(),
      billDate: z18.string().optional(),
      dueDate: z18.string().optional().nullable(),
      paidDate: z18.string().optional().nullable(),
      billMonth: z18.string().optional().nullable(),
      currency: z18.string().optional(),
      subtotal: z18.string().optional(),
      tax: z18.string().optional(),
      totalAmount: z18.string().optional(),
      paidAmount: z18.string().optional(),
      status: z18.enum(["draft", "pending_approval", "approved", "paid", "partially_paid", "overdue", "cancelled", "void"]).optional(),
      category: z18.enum([
        "payroll_processing",
        "social_contributions",
        "tax_filing",
        "legal_compliance",
        "visa_immigration",
        "hr_advisory",
        "it_services",
        "office_rent",
        "insurance",
        "bank_charges",
        "consulting",
        "equipment",
        "travel",
        "marketing",
        "other"
      ]).optional(),
      billType: z18.enum(["operational", "deposit", "deposit_refund"]).optional(),
      description: z18.string().optional(),
      internalNotes: z18.string().optional(),
      receiptFileUrl: z18.string().optional().nullable(),
      receiptFileKey: z18.string().optional().nullable()
    })
  ).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    const existing = await getVendorBillById(id);
    if (!existing) {
      throw new TRPCError15({ code: "NOT_FOUND", message: "Vendor bill not found" });
    }
    const updateValues = { ...data };
    if (data.billDate) updateValues.billDate = new Date(data.billDate);
    if (data.dueDate) updateValues.dueDate = new Date(data.dueDate);
    if (data.dueDate === null) updateValues.dueDate = null;
    if (data.paidDate) updateValues.paidDate = new Date(data.paidDate);
    if (data.paidDate === null) updateValues.paidDate = null;
    if (data.billMonth) updateValues.billMonth = /* @__PURE__ */ new Date(`${data.billMonth}-01`);
    if (data.billMonth === null) updateValues.billMonth = null;
    if (data.status === "approved") {
      updateValues.approvedBy = ctx.user.id;
      updateValues.approvedAt = /* @__PURE__ */ new Date();
    }
    await updateVendorBill(id, updateValues);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "update",
      entityType: "vendor_bill",
      entityId: id,
      changes: { before: existing, after: data }
    });
    return { success: true, message: "Vendor bill updated successfully" };
  }),
  delete: financeManagerProcedure.input(z18.object({ id: z18.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getVendorBillById(input.id);
    if (!existing) {
      throw new TRPCError15({ code: "NOT_FOUND", message: "Vendor bill not found" });
    }
    if (!["draft", "cancelled"].includes(existing.status)) {
      throw new TRPCError15({
        code: "BAD_REQUEST",
        message: "Only draft or cancelled bills can be deleted"
      });
    }
    const items = await listVendorBillItemsByBill(input.id);
    for (const item of items) {
      await deleteVendorBillItem(item.id);
    }
    await deleteVendorBill(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "delete",
      entityType: "vendor_bill",
      entityId: input.id,
      changes: { deleted: existing }
    });
    return { success: true, message: "Vendor bill deleted successfully" };
  }),
  // ── Bill Items CRUD ──
  addItem: financeManagerProcedure.input(
    z18.object({
      vendorBillId: z18.number(),
      description: z18.string().min(1),
      quantity: z18.string().default("1"),
      unitPrice: z18.string(),
      amount: z18.string(),
      relatedCustomerId: z18.number().optional(),
      relatedEmployeeId: z18.number().optional(),
      relatedCountryCode: z18.string().optional()
    })
  ).mutation(async ({ input }) => {
    const bill = await getVendorBillById(input.vendorBillId);
    if (!bill) {
      throw new TRPCError15({ code: "NOT_FOUND", message: "Vendor bill not found" });
    }
    const insertId = await createVendorBillItem(input);
    return { id: insertId, message: "Item added successfully" };
  }),
  updateItem: financeManagerProcedure.input(
    z18.object({
      id: z18.number(),
      description: z18.string().optional(),
      quantity: z18.string().optional(),
      unitPrice: z18.string().optional(),
      amount: z18.string().optional(),
      relatedCustomerId: z18.number().optional().nullable(),
      relatedEmployeeId: z18.number().optional().nullable(),
      relatedCountryCode: z18.string().optional().nullable()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await updateVendorBillItem(id, data);
    return { success: true, message: "Item updated successfully" };
  }),
  deleteItem: financeManagerProcedure.input(z18.object({ id: z18.number() })).mutation(async ({ input }) => {
    await deleteVendorBillItem(input.id);
    return { success: true, message: "Item deleted successfully" };
  }),
  listItems: userProcedure.input(z18.object({ vendorBillId: z18.number() })).query(async ({ input }) => {
    return await listVendorBillItemsByBill(input.vendorBillId);
  })
});

// server/routers/reports.ts
import { z as z19 } from "zod";
init_db();
init_schema();
import { eq as eq16, and as and12, sql as sql8, inArray as inArray2, count as count2 } from "drizzle-orm";
function getLastNMonths2(n, fromDate) {
  const d = fromDate ? new Date(fromDate) : /* @__PURE__ */ new Date();
  const months = [];
  for (let i = 0; i < n; i++) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    months.unshift(`${y}-${String(m).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return months;
}
var reportsRouter = router({
  /**
   * Profit & Loss Report
   * Aggregates revenue (from invoices) and expenses (from vendor_bills) by month.
   */
  profitAndLoss: financeManagerProcedure.input(
    z19.object({
      startMonth: z19.string().optional(),
      // YYYY-MM
      endMonth: z19.string().optional(),
      // YYYY-MM
      months: z19.number().default(12),
      // Default last 12 months
      currency: z19.string().default("USD")
      // Reporting currency
    })
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      return {
        summary: {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          profitMargin: 0
        },
        monthlyBreakdown: [],
        revenueByType: [],
        expensesByCategory: [],
        expensesByVendor: [],
        revenueByCustomer: []
      };
    }
    let months;
    if (input.startMonth && input.endMonth) {
      months = [];
      const [sy, sm] = input.startMonth.split("-").map(Number);
      const [ey, em] = input.endMonth.split("-").map(Number);
      let cy = sy, cm = sm;
      while (cy < ey || cy === ey && cm <= em) {
        months.push(`${cy}-${String(cm).padStart(2, "0")}`);
        cm++;
        if (cm > 12) {
          cm = 1;
          cy++;
        }
      }
    } else {
      months = getLastNMonths2(input.months);
    }
    const monthlyBreakdown = [];
    let totalRevenue = 0;
    let totalExpenses = 0;
    for (const m of months) {
      const [y, mo] = m.split("-").map(Number);
      const monthStart = `${m}-01`;
      const nextMonth = mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, "0")}-01`;
      const revenueResult = await db.select({
        total: sql8`COALESCE(SUM(${invoices.total}), 0)`,
        cnt: count2()
      }).from(invoices).where(
        and12(
          eq16(invoices.status, "paid"),
          sql8`${invoices.invoiceMonth} >= ${monthStart}`,
          sql8`${invoices.invoiceMonth} < ${nextMonth}`,
          // Exclude deposit & deposit_refund — they are not revenue
          sql8`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
        )
      );
      const monthRevenue = parseFloat(revenueResult[0]?.total ?? "0");
      const invoiceCount = revenueResult[0]?.cnt ?? 0;
      const expenseResult = await db.select({
        total: sql8`COALESCE(SUM(${vendorBills.totalAmount}), 0)`,
        cnt: count2()
      }).from(vendorBills).where(
        and12(
          inArray2(vendorBills.status, ["paid", "approved", "partially_paid"]),
          sql8`${vendorBills.billMonth} >= ${monthStart}`,
          sql8`${vendorBills.billMonth} < ${nextMonth}`
        )
      );
      const monthExpenses = parseFloat(expenseResult[0]?.total ?? "0");
      const billCount = expenseResult[0]?.cnt ?? 0;
      const netProfit2 = monthRevenue - monthExpenses;
      monthlyBreakdown.push({
        month: m,
        revenue: Math.round(monthRevenue * 100) / 100,
        expenses: Math.round(monthExpenses * 100) / 100,
        netProfit: Math.round(netProfit2 * 100) / 100,
        invoiceCount,
        billCount
      });
      totalRevenue += monthRevenue;
      totalExpenses += monthExpenses;
    }
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue * 100 : 0;
    const globalStart = `${months[0]}-01`;
    const lastMonth = months[months.length - 1].split("-").map(Number);
    const globalEnd = lastMonth[1] === 12 ? `${lastMonth[0] + 1}-01-01` : `${lastMonth[0]}-${String(lastMonth[1] + 1).padStart(2, "0")}-01`;
    const revenueByTypeResult = await db.select({
      type: invoices.invoiceType,
      amount: sql8`COALESCE(SUM(${invoices.total}), 0)`
    }).from(invoices).where(
      and12(
        eq16(invoices.status, "paid"),
        sql8`${invoices.invoiceMonth} >= ${globalStart}`,
        sql8`${invoices.invoiceMonth} < ${globalEnd}`,
        sql8`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
      )
    ).groupBy(invoices.invoiceType);
    const expensesByCategoryResult = await db.select({
      category: vendorBills.category,
      amount: sql8`COALESCE(SUM(${vendorBills.totalAmount}), 0)`
    }).from(vendorBills).where(
      and12(
        inArray2(vendorBills.status, ["paid", "approved", "partially_paid"]),
        sql8`${vendorBills.billMonth} >= ${globalStart}`,
        sql8`${vendorBills.billMonth} < ${globalEnd}`
      )
    ).groupBy(vendorBills.category);
    const expensesByVendorResult = await db.select({
      vendorId: vendorBills.vendorId,
      vendorName: vendors.name,
      amount: sql8`COALESCE(SUM(${vendorBills.totalAmount}), 0)`
    }).from(vendorBills).innerJoin(vendors, eq16(vendorBills.vendorId, vendors.id)).where(
      and12(
        inArray2(vendorBills.status, ["paid", "approved", "partially_paid"]),
        sql8`${vendorBills.billMonth} >= ${globalStart}`,
        sql8`${vendorBills.billMonth} < ${globalEnd}`
      )
    ).groupBy(vendorBills.vendorId, vendors.name);
    const revenueByCustomerResult = await db.select({
      customerId: invoices.customerId,
      customerName: customers.companyName,
      amount: sql8`COALESCE(SUM(${invoices.total}), 0)`
    }).from(invoices).innerJoin(customers, eq16(invoices.customerId, customers.id)).where(
      and12(
        eq16(invoices.status, "paid"),
        sql8`${invoices.invoiceMonth} >= ${globalStart}`,
        sql8`${invoices.invoiceMonth} < ${globalEnd}`,
        sql8`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
      )
    ).groupBy(invoices.customerId, customers.companyName);
    const customerProfitResult = await db.select({
      customerId: invoices.customerId,
      customerName: customers.companyName,
      revenue: sql8`COALESCE(SUM(DISTINCT ${invoices.total}), 0)`,
      costAllocated: sql8`COALESCE(SUM(${billInvoiceAllocations.allocatedAmount}), 0)`
    }).from(invoices).innerJoin(customers, eq16(invoices.customerId, customers.id)).leftJoin(billInvoiceAllocations, eq16(billInvoiceAllocations.invoiceId, invoices.id)).where(
      and12(
        eq16(invoices.status, "paid"),
        sql8`${invoices.invoiceMonth} >= ${globalStart}`,
        sql8`${invoices.invoiceMonth} < ${globalEnd}`,
        sql8`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
      )
    ).groupBy(invoices.customerId, customers.companyName);
    const unallocatedResult = await db.select({
      total: sql8`COALESCE(SUM(${vendorBills.unallocatedAmount}), 0)`
    }).from(vendorBills).where(
      and12(
        inArray2(vendorBills.status, ["paid", "approved", "partially_paid"]),
        sql8`${vendorBills.billMonth} >= ${globalStart}`,
        sql8`${vendorBills.billMonth} < ${globalEnd}`
      )
    );
    const totalUnallocated = Math.round(parseFloat(unallocatedResult[0]?.total ?? "0") * 100) / 100;
    return {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalUnallocated
      },
      monthlyBreakdown,
      revenueByType: revenueByTypeResult.map((r) => ({
        type: r.type || "unknown",
        amount: Math.round(parseFloat(r.amount) * 100) / 100
      })),
      expensesByCategory: expensesByCategoryResult.map((r) => ({
        category: r.category || "other",
        amount: Math.round(parseFloat(r.amount) * 100) / 100
      })),
      expensesByVendor: expensesByVendorResult.map((r) => ({
        vendorId: r.vendorId,
        vendorName: r.vendorName || "Unknown",
        amount: Math.round(parseFloat(r.amount) * 100) / 100
      })),
      revenueByCustomer: revenueByCustomerResult.map((r) => ({
        customerId: r.customerId,
        customerName: r.customerName || "Unknown",
        amount: Math.round(parseFloat(r.amount) * 100) / 100
      })),
      customerProfit: customerProfitResult.map((r) => {
        const rev = Math.round(parseFloat(r.revenue) * 100) / 100;
        const cost = Math.round(parseFloat(r.costAllocated) * 100) / 100;
        const profit = Math.round((rev - cost) * 100) / 100;
        const margin = rev > 0 ? Math.round(profit / rev * 1e4) / 100 : 0;
        return {
          customerId: r.customerId,
          customerName: r.customerName || "Unknown",
          revenue: rev,
          costAllocated: cost,
          profit,
          margin,
          isLoss: profit < 0
        };
      }).sort((a, b) => b.revenue - a.revenue)
    };
  }),
  /**
   * Quick financial summary for dashboard integration
   */
  financialSummary: financeManagerProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        currentMonthRevenue: 0,
        currentMonthExpenses: 0,
        currentMonthProfit: 0,
        previousMonthRevenue: 0,
        previousMonthExpenses: 0,
        previousMonthProfit: 0,
        totalOutstandingBills: 0,
        totalOutstandingInvoices: 0
      };
    }
    const now = /* @__PURE__ */ new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const nextMonthStart = now.getMonth() === 11 ? `${now.getFullYear() + 1}-01-01` : `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, "0")}-01`;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStart = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}-01`;
    const [curRevenue] = await db.select({ total: sql8`COALESCE(SUM(${invoices.total}), 0)` }).from(invoices).where(
      and12(
        eq16(invoices.status, "paid"),
        sql8`${invoices.invoiceMonth} >= ${currentMonthStart}`,
        sql8`${invoices.invoiceMonth} < ${nextMonthStart}`,
        sql8`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
      )
    );
    const [curExpenses] = await db.select({ total: sql8`COALESCE(SUM(${vendorBills.totalAmount}), 0)` }).from(vendorBills).where(
      and12(
        inArray2(vendorBills.status, ["paid", "approved", "partially_paid"]),
        sql8`${vendorBills.billMonth} >= ${currentMonthStart}`,
        sql8`${vendorBills.billMonth} < ${nextMonthStart}`
      )
    );
    const [prevRevenue] = await db.select({ total: sql8`COALESCE(SUM(${invoices.total}), 0)` }).from(invoices).where(
      and12(
        eq16(invoices.status, "paid"),
        sql8`${invoices.invoiceMonth} >= ${prevMonthStart}`,
        sql8`${invoices.invoiceMonth} < ${currentMonthStart}`,
        sql8`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
      )
    );
    const [prevExpenses] = await db.select({ total: sql8`COALESCE(SUM(${vendorBills.totalAmount}), 0)` }).from(vendorBills).where(
      and12(
        inArray2(vendorBills.status, ["paid", "approved", "partially_paid"]),
        sql8`${vendorBills.billMonth} >= ${prevMonthStart}`,
        sql8`${vendorBills.billMonth} < ${currentMonthStart}`
      )
    );
    const [outstandingBills] = await db.select({ total: sql8`COALESCE(SUM(${vendorBills.totalAmount}), 0)` }).from(vendorBills).where(inArray2(vendorBills.status, ["pending_approval", "approved", "overdue"]));
    const [outstandingInvoices] = await db.select({ total: sql8`COALESCE(SUM(${invoices.total}), 0)` }).from(invoices).where(
      and12(
        inArray2(invoices.status, ["sent", "overdue"]),
        sql8`${invoices.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
      )
    );
    const curRev = parseFloat(curRevenue?.total ?? "0");
    const curExp = parseFloat(curExpenses?.total ?? "0");
    const prevRev = parseFloat(prevRevenue?.total ?? "0");
    const prevExp = parseFloat(prevExpenses?.total ?? "0");
    return {
      currentMonthRevenue: Math.round(curRev * 100) / 100,
      currentMonthExpenses: Math.round(curExp * 100) / 100,
      currentMonthProfit: Math.round((curRev - curExp) * 100) / 100,
      previousMonthRevenue: Math.round(prevRev * 100) / 100,
      previousMonthExpenses: Math.round(prevExp * 100) / 100,
      previousMonthProfit: Math.round((prevRev - prevExp) * 100) / 100,
      totalOutstandingBills: Math.round(parseFloat(outstandingBills?.total ?? "0") * 100) / 100,
      totalOutstandingInvoices: Math.round(parseFloat(outstandingInvoices?.total ?? "0") * 100) / 100
    };
  })
});

// server/routers/allocations.ts
import { z as z20 } from "zod";
init_db();
init_schema();
import { TRPCError as TRPCError16 } from "@trpc/server";
import { eq as eq17, sql as sql9, and as and13, desc as desc4 } from "drizzle-orm";
var allocationsRouter = router({
  // List allocations for a specific vendor bill (with employee + invoice details)
  listByBill: userProcedure.input(z20.object({ vendorBillId: z20.number() })).query(async ({ input }) => {
    return await listDetailedAllocationsByBill(input.vendorBillId);
  }),
  // List allocations for a specific invoice (with employee + bill details)
  listByInvoice: userProcedure.input(z20.object({ invoiceId: z20.number() })).query(async ({ input }) => {
    return await listDetailedAllocationsByInvoice(input.invoiceId);
  }),
  // Get allocation summary for a bill (totals + validation info)
  billSummary: userProcedure.input(z20.object({ vendorBillId: z20.number() })).query(async ({ input }) => {
    const bill = await getVendorBillById(input.vendorBillId);
    if (!bill) throw new TRPCError16({ code: "NOT_FOUND", message: "Bill not found" });
    const allocatedTotal = await getBillAllocatedTotal(input.vendorBillId);
    const totalAmount = parseFloat(String(bill.totalAmount));
    return {
      vendorBillId: input.vendorBillId,
      billNumber: bill.billNumber,
      totalAmount,
      allocatedTotal,
      unallocatedAmount: totalAmount - allocatedTotal,
      isFullyAllocated: allocatedTotal >= totalAmount,
      isOverAllocated: allocatedTotal > totalAmount
    };
  }),
  // Get allocation summary for an invoice (totals + profit info)
  invoiceSummary: userProcedure.input(z20.object({ invoiceId: z20.number() })).query(async ({ input }) => {
    return await getInvoiceProfitAnalysis(input.invoiceId);
  }),
  // Get vendor profit analysis
  vendorAnalysis: userProcedure.input(z20.object({ vendorId: z20.number() })).query(async ({ input }) => {
    return await getVendorProfitAnalysis(input.vendorId);
  }),
  // Create a new allocation (link bill item to invoice via employee)
  create: financeManagerProcedure.input(
    z20.object({
      vendorBillId: z20.number(),
      vendorBillItemId: z20.number().optional(),
      invoiceId: z20.number(),
      employeeId: z20.number(),
      allocatedAmount: z20.string().refine((v) => parseFloat(v) > 0, "Amount must be positive"),
      description: z20.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const amount = parseFloat(input.allocatedAmount);
    const bill = await getVendorBillById(input.vendorBillId);
    if (!bill) throw new TRPCError16({ code: "NOT_FOUND", message: "Vendor bill not found" });
    const db = await getDb();
    if (!db) throw new TRPCError16({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const invRows = await db.select().from(invoices).where(eq17(invoices.id, input.invoiceId)).limit(1);
    if (!invRows[0]) throw new TRPCError16({ code: "NOT_FOUND", message: "Invoice not found" });
    const inv = invRows[0];
    const billType = bill.billType || "operational";
    if (inv.invoiceType === "credit_note" || inv.invoiceType === "deposit_refund") {
      throw new TRPCError16({ code: "BAD_REQUEST", message: `Cannot allocate costs to ${inv.invoiceType.replace("_", " ")}` });
    }
    if (billType === "deposit" && inv.invoiceType !== "deposit") {
      throw new TRPCError16({ code: "BAD_REQUEST", message: "Deposit vendor bills can only be allocated to deposit invoices" });
    }
    if (billType === "operational" && inv.invoiceType === "deposit") {
      throw new TRPCError16({ code: "BAD_REQUEST", message: "Operational vendor bills should not be allocated to deposit invoices. Use a deposit-type vendor bill instead." });
    }
    const empRows = await db.select().from(employees).where(eq17(employees.id, input.employeeId)).limit(1);
    if (!empRows[0]) throw new TRPCError16({ code: "NOT_FOUND", message: "Employee not found" });
    const billAllocated = await getBillAllocatedTotal(input.vendorBillId);
    const billTotal = parseFloat(String(bill.totalAmount));
    const newBillTotal = billAllocated + amount;
    const invoiceCostTotal = await getInvoiceCostAllocatedTotal(input.invoiceId);
    const invoiceTotal = parseFloat(String(invRows[0].total));
    const newInvoiceCostTotal = invoiceCostTotal + amount;
    const allocationId = await createBillInvoiceAllocation({
      vendorBillId: input.vendorBillId,
      vendorBillItemId: input.vendorBillItemId,
      invoiceId: input.invoiceId,
      employeeId: input.employeeId,
      allocatedAmount: input.allocatedAmount,
      description: input.description,
      allocatedBy: ctx.user.id
    });
    await recalcBillAllocation(input.vendorBillId);
    await recalcInvoiceCostAllocation(input.invoiceId);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "create",
      entityType: "bill_invoice_allocation",
      entityId: allocationId,
      changes: { created: input }
    });
    return {
      id: allocationId,
      message: "Allocation created successfully",
      warnings: {
        billOverAllocated: newBillTotal > billTotal,
        billOverAmount: newBillTotal > billTotal ? newBillTotal - billTotal : 0,
        invoiceLoss: newInvoiceCostTotal > invoiceTotal,
        invoiceLossAmount: newInvoiceCostTotal > invoiceTotal ? newInvoiceCostTotal - invoiceTotal : 0
      }
    };
  }),
  // Batch create allocations (for AI-parsed results)
  batchCreate: financeManagerProcedure.input(
    z20.object({
      allocations: z20.array(
        z20.object({
          vendorBillId: z20.number(),
          vendorBillItemId: z20.number().optional(),
          invoiceId: z20.number(),
          employeeId: z20.number(),
          allocatedAmount: z20.string(),
          description: z20.string().optional()
        })
      )
    })
  ).mutation(async ({ input, ctx }) => {
    const results = [];
    const affectedBills = [];
    const affectedInvoices = [];
    for (const alloc of input.allocations) {
      const allocationId = await createBillInvoiceAllocation({
        ...alloc,
        allocatedBy: ctx.user.id
      });
      results.push({ id: allocationId });
      if (!affectedBills.includes(alloc.vendorBillId)) affectedBills.push(alloc.vendorBillId);
      if (!affectedInvoices.includes(alloc.invoiceId)) affectedInvoices.push(alloc.invoiceId);
    }
    for (const billId of affectedBills) {
      await recalcBillAllocation(billId);
    }
    for (const invoiceId of affectedInvoices) {
      await recalcInvoiceCostAllocation(invoiceId);
    }
    return { created: results.length, results };
  }),
  // Update an allocation
  update: financeManagerProcedure.input(
    z20.object({
      id: z20.number(),
      allocatedAmount: z20.string().optional(),
      description: z20.string().optional(),
      invoiceId: z20.number().optional(),
      employeeId: z20.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const existing = await getBillInvoiceAllocationById(input.id);
    if (!existing) throw new TRPCError16({ code: "NOT_FOUND", message: "Allocation not found" });
    const { id, ...data } = input;
    await updateBillInvoiceAllocation(id, data);
    await recalcBillAllocation(existing.vendorBillId);
    await recalcInvoiceCostAllocation(existing.invoiceId);
    if (input.invoiceId && input.invoiceId !== existing.invoiceId) {
      await recalcInvoiceCostAllocation(input.invoiceId);
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "update",
      entityType: "bill_invoice_allocation",
      entityId: id,
      changes: { before: existing, after: data }
    });
    return { success: true, message: "Allocation updated" };
  }),
  // Delete an allocation
  delete: financeManagerProcedure.input(z20.object({ id: z20.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getBillInvoiceAllocationById(input.id);
    if (!existing) throw new TRPCError16({ code: "NOT_FOUND", message: "Allocation not found" });
    await deleteBillInvoiceAllocation(input.id);
    await recalcBillAllocation(existing.vendorBillId);
    await recalcInvoiceCostAllocation(existing.invoiceId);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "delete",
      entityType: "bill_invoice_allocation",
      entityId: input.id,
      changes: { deleted: existing }
    });
    return { success: true, message: "Allocation deleted" };
  }),
  // Delete all allocations for a bill
  deleteAllForBill: financeManagerProcedure.input(z20.object({ vendorBillId: z20.number() })).mutation(async ({ input, ctx }) => {
    const allocations = await listAllocationsByBill(input.vendorBillId);
    const affectedInvoiceIds = allocations.map((a) => a.invoiceId).filter((v, i, arr) => arr.indexOf(v) === i);
    await deleteAllocationsByBill(input.vendorBillId);
    await recalcBillAllocation(input.vendorBillId);
    for (const invoiceId of affectedInvoiceIds) {
      await recalcInvoiceCostAllocation(invoiceId);
    }
    return { success: true, deleted: allocations.length };
  }),
  // Get profit analysis across all invoices (for P&L enhancement)
  profitOverview: userProcedure.input(
    z20.object({
      startMonth: z20.string().optional(),
      // YYYY-MM
      endMonth: z20.string().optional()
    })
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError16({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    let conditions = [];
    if (input.startMonth) {
      conditions.push(sql9`${invoices.invoiceMonth} >= ${input.startMonth + "-01"}`);
    }
    if (input.endMonth) {
      conditions.push(sql9`${invoices.invoiceMonth} <= ${input.endMonth + "-01"}`);
    }
    const where = conditions.length > 0 ? and13(...conditions) : void 0;
    const invList = await db.select().from(invoices).where(where).orderBy(desc4(invoices.invoiceMonth));
    const results = [];
    for (const inv of invList) {
      const costAllocated = parseFloat(String(inv.costAllocated || "0"));
      const revenue = parseFloat(String(inv.total));
      const profit = revenue - costAllocated;
      const margin = revenue > 0 ? profit / revenue * 100 : 0;
      const customerRows = await db.select().from(
        (await Promise.resolve().then(() => (init_schema(), schema_exports))).customers
      ).where(eq17((await Promise.resolve().then(() => (init_schema(), schema_exports))).customers.id, inv.customerId)).limit(1);
      results.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceMonth: inv.invoiceMonth,
        customerId: inv.customerId,
        customerName: customerRows[0]?.companyName || "Unknown",
        revenue,
        costAllocated,
        profit,
        profitMargin: Math.round(margin * 100) / 100,
        isLoss: profit < 0
      });
    }
    const totalRevenue = results.reduce((sum2, r) => sum2 + r.revenue, 0);
    const totalCost = results.reduce((sum2, r) => sum2 + r.costAllocated, 0);
    const totalProfit = totalRevenue - totalCost;
    const lossInvoices = results.filter((r) => r.isLoss);
    return {
      invoices: results,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        overallMargin: totalRevenue > 0 ? Math.round(totalProfit / totalRevenue * 1e4) / 100 : 0,
        invoiceCount: results.length,
        lossCount: lossInvoices.length
      }
    };
  }),
  // Vendor cost-effectiveness comparison
  vendorComparison: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError16({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const vendorList = await db.select().from(vendors).where(eq17(vendors.status, "active"));
    const results = [];
    for (const vendor of vendorList) {
      const analysis = await getVendorProfitAnalysis(vendor.id);
      results.push({
        vendorName: vendor.name,
        vendorCode: vendor.vendorCode,
        country: vendor.country,
        serviceType: vendor.serviceType,
        ...analysis
      });
    }
    return results.sort((a, b) => b.totalBilled - a.totalBilled);
  })
});

// server/routers/pdfParsing.ts
import { z as z21 } from "zod";

// server/services/aiGatewayService.ts
init_db();
import { and as and14, eq as eq18 } from "drizzle-orm";

// server/_core/llm.ts
init_env();
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/services/aiGatewayService.ts
init_schema();
function resolveEnvKey(name) {
  return process.env[name] ?? "";
}
function extractTokenUsage(result) {
  const usage = result?.usage;
  if (!usage) return { inputTokens: 0, outputTokens: 0 };
  return {
    inputTokens: Number(usage.prompt_tokens ?? usage.input_tokens ?? usage.inputTokenCount ?? 0),
    outputTokens: Number(usage.completion_tokens ?? usage.output_tokens ?? usage.outputTokenCount ?? 0)
  };
}
function estimateCost(task, inputTokens, outputTokens) {
  const inRate = task === "vendor_bill_parse" ? 3e-6 : 15e-7;
  const outRate = task === "vendor_bill_parse" ? 8e-6 : 4e-6;
  return Number((inputTokens * inRate + outputTokens * outRate).toFixed(4));
}
function applyPolicyToParams(params, policy) {
  if (!policy) return params;
  const merged = {
    ...params
  };
  if (policy.maxTokens) {
    merged.maxTokens = policy.maxTokens;
    merged.max_tokens = policy.maxTokens;
  }
  if (policy.temperature !== null && policy.temperature !== void 0) {
    const temperature = Number(policy.temperature);
    if (!Number.isNaN(temperature)) {
      merged.temperature = temperature;
    }
  }
  return merged;
}
async function logTaskExecution(payload) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(aiTaskExecutions).values({
      taskType: payload.task,
      providerPrimary: payload.providerPrimary,
      providerActual: payload.providerActual,
      fallbackTriggered: payload.fallbackTriggered,
      latencyMs: payload.latencyMs,
      tokenUsageIn: payload.tokenUsageIn,
      tokenUsageOut: payload.tokenUsageOut,
      costEstimate: String(payload.costEstimate),
      success: payload.success,
      errorClass: payload.errorClass || null
    });
  } catch (error) {
    console.error("[AI Gateway] Failed to log task execution", error);
  }
}
async function invokeOpenAICompatible(baseUrl, apiKey, model, params) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      response_format: params.responseFormat || params.response_format,
      max_tokens: params.maxTokens || params.max_tokens || 4096,
      temperature: params.temperature
    })
  });
  if (!response.ok) throw new Error(`Provider call failed: ${response.status}`);
  return await response.json();
}
async function getTaskPolicy(task) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(aiTaskPolicies).where(and14(eq18(aiTaskPolicies.task, task), eq18(aiTaskPolicies.isActive, true))).limit(1);
  return row || null;
}
async function getProvider(provider) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(aiProviderConfigs).where(and14(eq18(aiProviderConfigs.provider, provider), eq18(aiProviderConfigs.isEnabled, true))).limit(1);
  return row || null;
}
async function resolveModelForProvider(provider, policy) {
  if (policy?.modelOverride) return policy.modelOverride;
  const providerConfig = await getProvider(provider);
  return providerConfig?.model || "gemini-2.5-flash";
}
async function invokeByProvider(provider, model, params) {
  if (provider === "manus_forge") return invokeLLM(params);
  const providerConfig = await getProvider(provider);
  if (!providerConfig?.baseUrl) throw new Error(`Provider ${provider} missing baseUrl config`);
  const apiKey = resolveEnvKey(providerConfig.apiKeyEnv);
  if (!apiKey) throw new Error(`Missing provider API key env: ${providerConfig.apiKeyEnv}`);
  return invokeOpenAICompatible(providerConfig.baseUrl, apiKey, model, params);
}
async function executeTaskLLM(task, params) {
  const startedAt = Date.now();
  const policy = await getTaskPolicy(task);
  const runtimeParams = applyPolicyToParams(params, policy);
  if (!policy) {
    try {
      const result = await invokeLLM(runtimeParams);
      const usage = extractTokenUsage(result);
      await logTaskExecution({
        task,
        providerPrimary: "manus_forge",
        providerActual: "manus_forge",
        fallbackTriggered: false,
        latencyMs: Date.now() - startedAt,
        tokenUsageIn: usage.inputTokens,
        tokenUsageOut: usage.outputTokens,
        costEstimate: estimateCost(task, usage.inputTokens, usage.outputTokens),
        success: true
      });
      return result;
    } catch (error) {
      await logTaskExecution({
        task,
        providerPrimary: "manus_forge",
        providerActual: "manus_forge",
        fallbackTriggered: false,
        latencyMs: Date.now() - startedAt,
        tokenUsageIn: 0,
        tokenUsageOut: 0,
        costEstimate: 0,
        success: false,
        errorClass: error?.name || "Error"
      });
      throw error;
    }
  }
  const primaryProvider = policy.primaryProvider;
  const primaryModel = await resolveModelForProvider(primaryProvider, policy);
  try {
    const result = await invokeByProvider(primaryProvider, primaryModel, runtimeParams);
    const usage = extractTokenUsage(result);
    await logTaskExecution({
      task,
      providerPrimary: primaryProvider,
      providerActual: primaryProvider,
      fallbackTriggered: false,
      latencyMs: Date.now() - startedAt,
      tokenUsageIn: usage.inputTokens,
      tokenUsageOut: usage.outputTokens,
      costEstimate: estimateCost(task, usage.inputTokens, usage.outputTokens),
      success: true
    });
    return result;
  } catch (primaryError) {
    if (!policy.fallbackProvider) {
      await logTaskExecution({
        task,
        providerPrimary: primaryProvider,
        providerActual: primaryProvider,
        fallbackTriggered: false,
        latencyMs: Date.now() - startedAt,
        tokenUsageIn: 0,
        tokenUsageOut: 0,
        costEstimate: 0,
        success: false,
        errorClass: primaryError?.name || "PrimaryProviderError"
      });
      throw primaryError;
    }
    const fallbackProvider = policy.fallbackProvider;
    const fallbackModel = await resolveModelForProvider(fallbackProvider, policy);
    try {
      const fallbackResult = await invokeByProvider(fallbackProvider, fallbackModel, runtimeParams);
      const usage = extractTokenUsage(fallbackResult);
      await logTaskExecution({
        task,
        providerPrimary: primaryProvider,
        providerActual: fallbackProvider,
        fallbackTriggered: true,
        latencyMs: Date.now() - startedAt,
        tokenUsageIn: usage.inputTokens,
        tokenUsageOut: usage.outputTokens,
        costEstimate: estimateCost(task, usage.inputTokens, usage.outputTokens),
        success: true
      });
      return fallbackResult;
    } catch (fallbackError) {
      await logTaskExecution({
        task,
        providerPrimary: primaryProvider,
        providerActual: fallbackProvider,
        fallbackTriggered: true,
        latencyMs: Date.now() - startedAt,
        tokenUsageIn: 0,
        tokenUsageOut: 0,
        costEstimate: 0,
        success: false,
        errorClass: fallbackError?.name || "FallbackProviderError"
      });
      throw fallbackError;
    }
  }
}

// server/routers/pdfParsing.ts
init_db();
init_schema();
import { eq as eq19, sql as sql10, inArray as inArray3, desc as desc5 } from "drizzle-orm";
import { TRPCError as TRPCError17 } from "@trpc/server";
async function buildSystemContext(serviceMonth) {
  const db = await getDb();
  if (!db) return { employees: [], customers: [], invoices: [], summary: "No database available" };
  const empRows = await db.select({
    id: employees.id,
    employeeCode: employees.employeeCode,
    firstName: employees.firstName,
    lastName: employees.lastName,
    country: employees.country,
    customerId: employees.customerId,
    jobTitle: employees.jobTitle,
    baseSalary: employees.baseSalary,
    salaryCurrency: employees.salaryCurrency
  }).from(employees).where(eq19(employees.status, "active"));
  const custRows = await db.select({
    id: customers.id,
    clientCode: customers.clientCode,
    companyName: customers.companyName,
    country: customers.country,
    settlementCurrency: customers.settlementCurrency
  }).from(customers).where(eq19(customers.status, "active"));
  let invQuery = db.select({
    id: invoices.id,
    invoiceNumber: invoices.invoiceNumber,
    customerId: invoices.customerId,
    invoiceType: invoices.invoiceType,
    currency: invoices.currency,
    total: invoices.total,
    status: invoices.status,
    invoiceMonth: invoices.invoiceMonth
  }).from(invoices);
  let invRows;
  if (serviceMonth) {
    invRows = await invQuery.where(
      sql10`DATE_FORMAT(${invoices.invoiceMonth}, '%Y-%m') = ${serviceMonth} OR DATE_FORMAT(${invoices.createdAt}, '%Y-%m') = ${serviceMonth}`
    ).orderBy(desc5(invoices.createdAt)).limit(200);
  } else {
    invRows = await invQuery.orderBy(desc5(invoices.createdAt)).limit(100);
  }
  const invIds = invRows.map((i) => i.id);
  let invItemRows = [];
  if (invIds.length > 0) {
    invItemRows = await db.select({
      invoiceId: invoiceItems.invoiceId,
      employeeId: invoiceItems.employeeId,
      description: invoiceItems.description,
      amount: invoiceItems.amount,
      countryCode: invoiceItems.countryCode
    }).from(invoiceItems).where(inArray3(invoiceItems.invoiceId, invIds));
  }
  const empInvoiceMap = {};
  for (const item of invItemRows) {
    if (item.employeeId) {
      if (!empInvoiceMap[item.employeeId]) empInvoiceMap[item.employeeId] = [];
      const inv = invRows.find((i) => i.id === item.invoiceId);
      if (inv) {
        empInvoiceMap[item.employeeId].push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerId: inv.customerId,
          amount: item.amount
        });
      }
    }
  }
  const empContext = empRows.map((e) => ({
    id: e.id,
    code: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    country: e.country,
    customerId: e.customerId,
    customerName: custRows.find((c) => c.id === e.customerId)?.companyName || "Unknown",
    salary: `${e.salaryCurrency} ${e.baseSalary}`,
    linkedInvoices: empInvoiceMap[e.id] || []
  }));
  const custContext = custRows.map((c) => ({
    id: c.id,
    code: c.clientCode,
    name: c.companyName,
    country: c.country,
    currency: c.settlementCurrency
  }));
  const invContext = invRows.map((i) => ({
    id: i.id,
    number: i.invoiceNumber,
    customerId: i.customerId,
    customerName: custRows.find((c) => c.id === i.customerId)?.companyName || "Unknown",
    type: i.invoiceType,
    currency: i.currency,
    total: i.total,
    status: i.status,
    month: i.invoiceMonth
  }));
  return {
    employees: empContext,
    customers: custContext,
    invoices: invContext,
    summary: `${empContext.length} active employees, ${custContext.length} active customers, ${invContext.length} invoices`
  };
}
function detectMimeType(fileName) {
  const ext = fileName.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return "application/pdf";
  }
}
var pdfParsingRouter = router({
  // Multi-file AI parse: Upload multiple files for one vendor, cross-validate, and suggest allocations
  parseMultiFile: financeManagerProcedure.input(
    z21.object({
      files: z21.array(
        z21.object({
          fileUrl: z21.string(),
          fileKey: z21.string(),
          fileName: z21.string(),
          fileType: z21.enum(["invoice", "payment_receipt", "statement", "other"]).default("invoice")
        })
      ).min(1).max(10),
      serviceMonth: z21.string(),
      // YYYY-MM format
      vendorId: z21.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const systemContext = await buildSystemContext(input.serviceMonth);
    const fileMessages = input.files.map((f) => ({
      type: "file_url",
      file_url: {
        url: f.fileUrl,
        mime_type: detectMimeType(f.fileName)
      }
    }));
    const response = await executeTaskLLM("vendor_bill_parse", {
      messages: [
        {
          role: "system",
          content: `You are a senior financial analyst for an EOR (Employer of Record) company called Best GEA.
You are analyzing multiple documents from a SINGLE vendor for the service month ${input.serviceMonth}.
The documents may include invoices, payment receipts (POP), bank statements, or other supporting documents.

YOUR TASK:
1. Cross-reference ALL uploaded documents to extract and verify vendor bill information
2. Match line items to employees and customers in our system
3. Suggest cost allocations (link vendor costs to our customer invoices)
4. Report confidence levels and any discrepancies between documents

SYSTEM DATA (our active employees, customers, and invoices):
${JSON.stringify(systemContext.employees.slice(0, 200), null, 1)}

CUSTOMERS:
${JSON.stringify(systemContext.customers, null, 1)}

INVOICES FOR ${input.serviceMonth}:
${JSON.stringify(systemContext.invoices.slice(0, 100), null, 1)}

Return a JSON object with these fields:
- overallConfidence: number (0-100, how confident you are in the overall extraction)
- vendor: object with:
  - name: string (vendor company name)
  - legalName: string | null
  - country: string (vendor's country)
  - address: string | null
  - city: string | null
  - contactName: string | null
  - contactEmail: string | null
  - contactPhone: string | null
  - taxId: string | null
  - serviceType: string | null (e.g. "Payroll Processing", "Legal", "IT Services")
  - vendorType: string ("client_related" if costs relate to specific employees/customers, "operational" if general business cost)
  - confidence: number (0-100)
- bill: object with:
  - invoiceNumber: string
  - invoiceDate: string (YYYY-MM-DD)
  - dueDate: string | null (YYYY-MM-DD)
  - serviceMonth: string (YYYY-MM)
  - currency: string (3-letter code)
  - subtotal: number
  - tax: number
  - totalAmount: number
  - category: string (one of: payroll_processing, social_contributions, tax_filing, legal_compliance, visa_immigration, hr_advisory, it_services, office_rent, insurance, bank_charges, consulting, equipment, travel, marketing, other)
  - billType: string (one of: "operational", "deposit", "deposit_refund"). Use "deposit" if the bill is for a security deposit, guarantee deposit, or refundable advance payment to the vendor. Use "deposit_refund" if the vendor is returning a previously paid deposit. Use "operational" for all regular service/expense bills.
  - description: string
  - confidence: number (0-100)
- payment: object | null (if POP/receipt is included):
  - bankName: string
  - transactionReference: string
  - paymentDate: string (YYYY-MM-DD)
  - localCurrency: string
  - localAmount: number
  - usdAmount: number
  - exchangeRate: number | null
  - bankFee: number
  - confidence: number (0-100)
- lineItems: array of objects, each with:
  - description: string
  - employeeName: string | null (employee name as shown in document)
  - matchedEmployeeId: number | null (ID from our system if matched, from the SYSTEM DATA above)
  - matchedCustomerId: number | null (customer ID from our system if matched via employee)
  - matchedInvoiceId: number | null (invoice ID from our system if matched)
  - quantity: number
  - unitPrice: number
  - amount: number
  - countryCode: string | null (2-3 letter country code)
  - confidence: number (0-100)
  - allocationSuggestion: object | null (only for client_related vendor type):
    - invoiceId: number (from our system)
    - employeeId: number (from our system)
    - allocatedAmount: number
    - reason: string (why this allocation is suggested)
- crossValidation: object with:
  - invoiceVsPaymentMatch: boolean | null (do invoice total and payment amount match?)
  - invoiceVsPaymentDifference: number | null (difference if any)
  - lineItemsSumMatchesTotal: boolean (do line items sum to the total?)
  - lineItemsSumDifference: number (difference if any)
  - documentsAnalyzed: number (how many files were successfully parsed)
  - warnings: array of strings (any discrepancies or issues found)
  - notes: array of strings (any helpful observations)

IMPORTANT RULES:
- Match employees by name carefully. Names may appear in different orders (e.g. "John Smith" vs "Smith, John") or with slight variations.
- For matchedEmployeeId, ONLY use IDs from the SYSTEM DATA provided. If no match, use null.
- For matchedCustomerId, derive from the matched employee's customerId in SYSTEM DATA.
- For matchedInvoiceId, find the invoice linked to the matched employee for this service month.
- Be conservative with confidence scores. Use 90+ only when data is clearly readable and cross-validated.
- If a field is missing or unclear, use null and lower the confidence.
- For operational costs (bank fees, office rent, etc.), set vendorType to "operational" and skip allocation suggestions.`
        },
        {
          role: "user",
          content: [
            ...fileMessages,
            {
              type: "text",
              text: `I'm uploading ${input.files.length} document(s) from a single vendor for service month ${input.serviceMonth}. File types: ${input.files.map((f) => `${f.fileName} (${f.fileType})`).join(", ")}. Please analyze all documents together, cross-validate the information, and provide structured extraction with confidence scores and allocation suggestions.`
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "multi_file_vendor_parse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallConfidence: { type: "number" },
              vendor: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  legalName: { type: ["string", "null"] },
                  country: { type: "string" },
                  address: { type: ["string", "null"] },
                  city: { type: ["string", "null"] },
                  contactName: { type: ["string", "null"] },
                  contactEmail: { type: ["string", "null"] },
                  contactPhone: { type: ["string", "null"] },
                  taxId: { type: ["string", "null"] },
                  serviceType: { type: ["string", "null"] },
                  vendorType: { type: "string" },
                  confidence: { type: "number" }
                },
                required: ["name", "legalName", "country", "address", "city", "contactName", "contactEmail", "contactPhone", "taxId", "serviceType", "vendorType", "confidence"],
                additionalProperties: false
              },
              bill: {
                type: "object",
                properties: {
                  invoiceNumber: { type: "string" },
                  invoiceDate: { type: "string" },
                  dueDate: { type: ["string", "null"] },
                  serviceMonth: { type: "string" },
                  currency: { type: "string" },
                  subtotal: { type: "number" },
                  tax: { type: "number" },
                  totalAmount: { type: "number" },
                  category: { type: "string" },
                  billType: { type: "string", enum: ["operational", "deposit", "deposit_refund"] },
                  description: { type: "string" },
                  confidence: { type: "number" }
                },
                required: ["invoiceNumber", "invoiceDate", "dueDate", "serviceMonth", "currency", "subtotal", "tax", "totalAmount", "category", "billType", "description", "confidence"],
                additionalProperties: false
              },
              payment: {
                type: ["object", "null"],
                properties: {
                  bankName: { type: "string" },
                  transactionReference: { type: "string" },
                  paymentDate: { type: "string" },
                  localCurrency: { type: "string" },
                  localAmount: { type: "number" },
                  usdAmount: { type: "number" },
                  exchangeRate: { type: ["number", "null"] },
                  bankFee: { type: "number" },
                  confidence: { type: "number" }
                },
                required: ["bankName", "transactionReference", "paymentDate", "localCurrency", "localAmount", "usdAmount", "exchangeRate", "bankFee", "confidence"],
                additionalProperties: false
              },
              lineItems: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    employeeName: { type: ["string", "null"] },
                    matchedEmployeeId: { type: ["number", "null"] },
                    matchedCustomerId: { type: ["number", "null"] },
                    matchedInvoiceId: { type: ["number", "null"] },
                    quantity: { type: "number" },
                    unitPrice: { type: "number" },
                    amount: { type: "number" },
                    countryCode: { type: ["string", "null"] },
                    confidence: { type: "number" },
                    allocationSuggestion: {
                      type: ["object", "null"],
                      properties: {
                        invoiceId: { type: "number" },
                        employeeId: { type: "number" },
                        allocatedAmount: { type: "number" },
                        reason: { type: "string" }
                      },
                      required: ["invoiceId", "employeeId", "allocatedAmount", "reason"],
                      additionalProperties: false
                    }
                  },
                  required: ["description", "employeeName", "matchedEmployeeId", "matchedCustomerId", "matchedInvoiceId", "quantity", "unitPrice", "amount", "countryCode", "confidence", "allocationSuggestion"],
                  additionalProperties: false
                }
              },
              crossValidation: {
                type: "object",
                properties: {
                  invoiceVsPaymentMatch: { type: ["boolean", "null"] },
                  invoiceVsPaymentDifference: { type: ["number", "null"] },
                  lineItemsSumMatchesTotal: { type: "boolean" },
                  lineItemsSumDifference: { type: "number" },
                  documentsAnalyzed: { type: "number" },
                  warnings: { type: "array", items: { type: "string" } },
                  notes: { type: "array", items: { type: "string" } }
                },
                required: ["invoiceVsPaymentMatch", "invoiceVsPaymentDifference", "lineItemsSumMatchesTotal", "lineItemsSumDifference", "documentsAnalyzed", "warnings", "notes"],
                additionalProperties: false
              }
            },
            required: ["overallConfidence", "vendor", "bill", "payment", "lineItems", "crossValidation"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new TRPCError17({ code: "INTERNAL_SERVER_ERROR", message: "AI failed to parse documents" });
    }
    const parsed = JSON.parse(content);
    parsed.vendorMatch = null;
    if (parsed.vendor?.name && !input.vendorId) {
      const vendorList = await listVendors({ search: parsed.vendor.name }, 5, 0);
      if (vendorList.data.length > 0) {
        parsed.vendorMatch = {
          status: "matched",
          vendor: {
            id: vendorList.data[0].id,
            name: vendorList.data[0].name,
            vendorCode: vendorList.data[0].vendorCode,
            country: vendorList.data[0].country
          }
        };
      } else {
        try {
          const newVendorData = {
            name: parsed.vendor.name,
            legalName: parsed.vendor.legalName || void 0,
            country: parsed.vendor.country || "Unknown",
            address: parsed.vendor.address || void 0,
            city: parsed.vendor.city || void 0,
            contactName: parsed.vendor.contactName || void 0,
            contactEmail: parsed.vendor.contactEmail || void 0,
            contactPhone: parsed.vendor.contactPhone || void 0,
            taxId: parsed.vendor.taxId || void 0,
            serviceType: parsed.vendor.serviceType || void 0,
            vendorType: parsed.vendor.vendorType || "client_related",
            currency: parsed.bill?.currency || "USD",
            paymentTermDays: 30,
            status: "active",
            notes: `Auto-created from AI parsing (${input.files.length} files, ${input.serviceMonth})`
          };
          const newVendorId = await createVendor(newVendorData);
          const vendorCode = `VND-${String(newVendorId).padStart(4, "0")}`;
          parsed.vendorMatch = {
            status: "auto_created",
            vendor: {
              id: newVendorId,
              name: parsed.vendor.name,
              vendorCode,
              country: parsed.vendor.country || "Unknown"
            }
          };
          await logAuditAction({
            userId: ctx.user.id,
            userName: ctx.user.name || ctx.user.email || "Unknown",
            action: "create",
            entityType: "vendor",
            entityId: newVendorId,
            changes: { source: "ai_multi_file_parse", created: newVendorData }
          });
        } catch (err) {
          console.error("Auto-create vendor failed:", err);
          parsed.vendorMatch = { status: "not_found", vendor: null };
        }
      }
    } else if (input.vendorId) {
      const vendorList = await listVendors({}, 1, 0);
      const db = await getDb();
      if (db) {
        const vRows = await db.select().from(vendors).where(eq19(vendors.id, input.vendorId)).limit(1);
        if (vRows[0]) {
          parsed.vendorMatch = {
            status: "pre_selected",
            vendor: {
              id: vRows[0].id,
              name: vRows[0].name,
              vendorCode: vRows[0].vendorCode,
              country: vRows[0].country
            }
          };
        }
      }
    }
    return {
      parsed,
      files: input.files,
      serviceMonth: input.serviceMonth
    };
  }),
  // Apply parsed multi-file result: create bill + items + optional allocations
  applyMultiFileParse: financeManagerProcedure.input(
    z21.object({
      vendorId: z21.number(),
      billNumber: z21.string(),
      billDate: z21.string(),
      dueDate: z21.string().optional(),
      billMonth: z21.string().optional(),
      currency: z21.string().default("USD"),
      subtotal: z21.string(),
      tax: z21.string().default("0"),
      totalAmount: z21.string(),
      category: z21.enum([
        "payroll_processing",
        "social_contributions",
        "tax_filing",
        "legal_compliance",
        "visa_immigration",
        "hr_advisory",
        "it_services",
        "office_rent",
        "insurance",
        "bank_charges",
        "consulting",
        "equipment",
        "travel",
        "marketing",
        "other"
      ]).default("other"),
      billType: z21.enum(["operational", "deposit", "deposit_refund"]).default("operational"),
      description: z21.string().optional(),
      receiptFileUrl: z21.string().optional(),
      receiptFileKey: z21.string().optional(),
      // Payment info (from POP)
      paymentInfo: z21.object({
        paidDate: z21.string(),
        paidAmount: z21.string(),
        bankReference: z21.string(),
        bankName: z21.string(),
        bankFee: z21.string().default("0")
      }).optional(),
      // Line items
      items: z21.array(
        z21.object({
          description: z21.string(),
          quantity: z21.string().default("1"),
          unitPrice: z21.string(),
          amount: z21.string(),
          relatedEmployeeId: z21.number().optional(),
          relatedCustomerId: z21.number().optional(),
          relatedCountryCode: z21.string().optional()
        })
      ).optional(),
      // Allocation suggestions to auto-create
      allocations: z21.array(
        z21.object({
          invoiceId: z21.number(),
          employeeId: z21.number(),
          allocatedAmount: z21.string(),
          description: z21.string().optional()
        })
      ).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const { items, allocations, paymentInfo, ...billData } = input;
    const billValues = {
      ...billData,
      billDate: new Date(billData.billDate),
      dueDate: billData.dueDate ? new Date(billData.dueDate) : void 0,
      billMonth: billData.billMonth ? /* @__PURE__ */ new Date(`${billData.billMonth}-01`) : void 0,
      submittedBy: ctx.user.id,
      submittedAt: /* @__PURE__ */ new Date(),
      status: paymentInfo ? "paid" : "pending_approval"
    };
    if (paymentInfo) {
      billValues.paidDate = new Date(paymentInfo.paidDate);
      billValues.paidAmount = paymentInfo.paidAmount;
      billValues.bankReference = paymentInfo.bankReference;
      billValues.bankName = paymentInfo.bankName;
      billValues.bankFee = paymentInfo.bankFee;
    }
    const billId = await createVendorBill(billValues);
    const itemIds = [];
    if (items && items.length > 0 && billId) {
      for (const item of items) {
        const itemId = await createVendorBillItem({
          vendorBillId: billId,
          ...item
        });
        itemIds.push(itemId);
      }
    }
    let allocationsCreated = 0;
    if (allocations && allocations.length > 0 && billId) {
      const affectedInvoices = [];
      for (const alloc of allocations) {
        try {
          await createBillInvoiceAllocation({
            vendorBillId: billId,
            invoiceId: alloc.invoiceId,
            employeeId: alloc.employeeId,
            allocatedAmount: alloc.allocatedAmount,
            description: alloc.description || "Auto-allocated from AI parsing",
            allocatedBy: ctx.user.id
          });
          allocationsCreated++;
          if (!affectedInvoices.includes(alloc.invoiceId)) {
            affectedInvoices.push(alloc.invoiceId);
          }
        } catch (err) {
          console.error("Failed to create allocation:", err);
        }
      }
      await recalcBillAllocation(billId);
      for (const invoiceId of affectedInvoices) {
        await recalcInvoiceCostAllocation(invoiceId);
      }
    }
    if (paymentInfo && parseFloat(paymentInfo.bankFee) > 0) {
      const bankFeeBill = {
        vendorId: input.vendorId,
        billNumber: `FEE-${paymentInfo.bankReference}`,
        billDate: new Date(paymentInfo.paidDate),
        currency: "USD",
        subtotal: paymentInfo.bankFee,
        tax: "0",
        totalAmount: paymentInfo.bankFee,
        paidAmount: paymentInfo.bankFee,
        status: "paid",
        paidDate: new Date(paymentInfo.paidDate),
        category: "bank_charges",
        description: `Bank wire fee for ${billData.billNumber} via ${paymentInfo.bankName}`,
        bankReference: paymentInfo.bankReference,
        bankName: paymentInfo.bankName,
        submittedBy: ctx.user.id,
        submittedAt: /* @__PURE__ */ new Date()
      };
      await createVendorBill(bankFeeBill);
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "create",
      entityType: "vendor_bill",
      entityId: billId,
      changes: {
        source: "ai_multi_file_parse",
        created: { ...billData, itemCount: items?.length || 0, allocationsCreated }
      }
    });
    return {
      id: billId,
      itemsCreated: itemIds.length,
      allocationsCreated,
      message: "Vendor bill created from AI analysis"
    };
  }),
  // Upload file to S3 (generic helper for file uploads)
  uploadFile: financeManagerProcedure.input(
    z21.object({
      fileName: z21.string(),
      fileBase64: z21.string(),
      contentType: z21.string().default("application/pdf")
    })
  ).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.fileBase64, "base64");
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const fileKey = `vendor-docs/${Date.now()}-${randomSuffix}-${input.fileName}`;
    const { url, key } = await storagePut(fileKey, buffer, input.contentType);
    return { url, key };
  }),
  // Legacy: Single file parse (kept for backward compatibility)
  parseVendorInvoice: financeManagerProcedure.input(
    z21.object({
      fileUrl: z21.string(),
      fileKey: z21.string(),
      vendorId: z21.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const response = await executeTaskLLM("vendor_bill_parse", {
      messages: [
        {
          role: "system",
          content: `You are a financial document parser specializing in vendor invoices for an EOR (Employer of Record) company.
Extract the following information from the vendor invoice.

Return a JSON object with these fields:
- vendorName: string
- vendorCountry: string
- invoiceNumber: string
- invoiceDate: string (YYYY-MM-DD)
- dueDate: string | null (YYYY-MM-DD)
- serviceMonth: string | null (YYYY-MM)
- currency: string (3-letter code)
- subtotal: number
- tax: number
- totalAmount: number
- category: string (one of: payroll_processing, social_contributions, tax_filing, legal_compliance, visa_immigration, hr_advisory, it_services, office_rent, insurance, bank_charges, consulting, equipment, travel, marketing, other)
- billType: string (one of: "operational", "deposit", "deposit_refund"). Use "deposit" if the bill is for a security deposit, guarantee deposit, or refundable advance payment. Use "deposit_refund" if the vendor is returning a previously paid deposit. Use "operational" for all regular service/expense bills.
- description: string
- lineItems: array of { description: string, employeeName: string | null, quantity: number, unitPrice: number, amount: number, countryCode: string | null }

Be precise with numbers. If a field is not found, use null.`
        },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: { url: input.fileUrl, mime_type: "application/pdf" }
            },
            { type: "text", text: "Parse this vendor invoice." }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "vendor_invoice_parse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              vendorName: { type: "string" },
              vendorCountry: { type: "string" },
              invoiceNumber: { type: "string" },
              invoiceDate: { type: "string" },
              dueDate: { type: ["string", "null"] },
              serviceMonth: { type: ["string", "null"] },
              currency: { type: "string" },
              subtotal: { type: "number" },
              tax: { type: "number" },
              totalAmount: { type: "number" },
              category: { type: "string" },
              billType: { type: "string", enum: ["operational", "deposit", "deposit_refund"] },
              description: { type: "string" },
              lineItems: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    employeeName: { type: ["string", "null"] },
                    quantity: { type: "number" },
                    unitPrice: { type: "number" },
                    amount: { type: "number" },
                    countryCode: { type: ["string", "null"] }
                  },
                  required: ["description", "employeeName", "quantity", "unitPrice", "amount", "countryCode"],
                  additionalProperties: false
                }
              }
            },
            required: ["vendorName", "vendorCountry", "invoiceNumber", "invoiceDate", "dueDate", "serviceMonth", "currency", "subtotal", "tax", "totalAmount", "category", "billType", "description", "lineItems"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new TRPCError17({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse PDF" });
    }
    const parsed = JSON.parse(content);
    if (parsed.vendorName && !input.vendorId) {
      const vendorList = await listVendors({ search: parsed.vendorName }, 5, 0);
      parsed.matchedVendors = vendorList.data.map((v) => ({
        id: v.id,
        name: v.name,
        vendorCode: v.vendorCode,
        country: v.country
      }));
    }
    return { parsed, fileUrl: input.fileUrl, fileKey: input.fileKey };
  }),
  // Legacy: Apply single vendor invoice (kept for backward compatibility)
  applyVendorInvoice: financeManagerProcedure.input(
    z21.object({
      vendorId: z21.number(),
      billNumber: z21.string(),
      billDate: z21.string(),
      dueDate: z21.string().optional(),
      billMonth: z21.string().optional(),
      currency: z21.string().default("USD"),
      subtotal: z21.string(),
      tax: z21.string().default("0"),
      totalAmount: z21.string(),
      category: z21.enum([
        "payroll_processing",
        "social_contributions",
        "tax_filing",
        "legal_compliance",
        "visa_immigration",
        "hr_advisory",
        "it_services",
        "office_rent",
        "insurance",
        "bank_charges",
        "consulting",
        "equipment",
        "travel",
        "marketing",
        "other"
      ]).default("other"),
      billType: z21.enum(["operational", "deposit", "deposit_refund"]).default("operational"),
      description: z21.string().optional(),
      receiptFileUrl: z21.string().optional(),
      receiptFileKey: z21.string().optional(),
      items: z21.array(
        z21.object({
          description: z21.string(),
          quantity: z21.string().default("1"),
          unitPrice: z21.string(),
          amount: z21.string(),
          relatedEmployeeId: z21.number().optional(),
          relatedCustomerId: z21.number().optional(),
          relatedCountryCode: z21.string().optional()
        })
      ).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const { items, ...billData } = input;
    const billValues = {
      ...billData,
      billDate: new Date(billData.billDate),
      dueDate: billData.dueDate ? new Date(billData.dueDate) : void 0,
      billMonth: billData.billMonth ? /* @__PURE__ */ new Date(`${billData.billMonth}-01`) : void 0,
      submittedBy: ctx.user.id,
      submittedAt: /* @__PURE__ */ new Date(),
      status: "pending_approval"
    };
    const insertId = await createVendorBill(billValues);
    if (items && items.length > 0 && insertId) {
      for (const item of items) {
        await createVendorBillItem({
          vendorBillId: insertId,
          ...item
        });
      }
    }
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || ctx.user.email || "Unknown",
      action: "create",
      entityType: "vendor_bill",
      entityId: insertId,
      changes: { source: "pdf_parse", created: { ...billData, itemCount: items?.length || 0 } }
    });
    return { id: insertId, message: "Vendor bill created from parsed invoice" };
  })
});

// server/routers/sales.ts
import { z as z22 } from "zod";
init_db();
import { TRPCError as TRPCError18 } from "@trpc/server";
var salesRouter = router({
  // ── List all sales leads ──────────────────────────────────────────────
  list: userProcedure.input(
    z22.object({
      status: z22.string().optional(),
      assignedTo: z22.number().optional(),
      search: z22.string().optional(),
      limit: z22.number().default(50),
      offset: z22.number().default(0)
    })
  ).query(async ({ input }) => {
    return await listSalesLeads(
      {
        status: input.status,
        assignedTo: input.assignedTo,
        search: input.search
      },
      input.limit,
      input.offset
    );
  }),
  // ── Get single lead by ID ────────────────────────────────────────────
  get: userProcedure.input(z22.object({ id: z22.number() })).query(async ({ input }) => {
    const lead = await getSalesLeadById(input.id);
    if (!lead) throw new TRPCError18({ code: "NOT_FOUND", message: "Sales lead not found" });
    return lead;
  }),
  // ── Create a new sales lead ──────────────────────────────────────────
  create: customerManagerProcedure.input(
    z22.object({
      companyName: z22.string().min(1, "Company name is required"),
      contactName: z22.string().optional(),
      contactEmail: z22.union([z22.literal(""), z22.string().email("Invalid email address")]).optional().transform((v) => v || void 0),
      contactPhone: z22.string().optional(),
      country: z22.string().optional(),
      industry: z22.string().optional(),
      estimatedEmployees: z22.number().min(0).optional(),
      estimatedRevenue: z22.string().optional(),
      currency: z22.string().default("USD"),
      source: z22.string().optional(),
      intendedServices: z22.string().optional(),
      targetCountries: z22.string().optional(),
      assignedTo: z22.number().optional(),
      notes: z22.string().optional(),
      expectedCloseDate: z22.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const result = await createSalesLead({
      companyName: input.companyName,
      contactName: input.contactName || null,
      contactEmail: input.contactEmail || null,
      contactPhone: input.contactPhone || null,
      country: input.country || null,
      industry: input.industry || null,
      estimatedEmployees: input.estimatedEmployees ?? null,
      estimatedRevenue: input.estimatedRevenue || null,
      currency: input.currency,
      source: input.source || null,
      intendedServices: input.intendedServices || null,
      targetCountries: input.targetCountries || null,
      createdBy: ctx.user.id,
      assignedTo: input.assignedTo ?? null,
      notes: input.notes || null,
      expectedCloseDate: input.expectedCloseDate ? /* @__PURE__ */ new Date(input.expectedCloseDate + "T00:00:00Z") : null,
      status: "discovery"
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "create",
      entityType: "sales_lead",
      changes: JSON.stringify(input)
    });
    return result;
  }),
  // ── Update a sales lead ──────────────────────────────────────────────
  update: customerManagerProcedure.input(
    z22.object({
      id: z22.number(),
      data: z22.object({
        companyName: z22.string().optional(),
        contactName: z22.string().optional(),
        contactEmail: z22.union([z22.literal(""), z22.string().email()]).optional().transform((v) => v || void 0),
        contactPhone: z22.string().optional(),
        country: z22.string().optional(),
        industry: z22.string().optional(),
        estimatedEmployees: z22.number().optional(),
        estimatedRevenue: z22.string().optional(),
        currency: z22.string().optional(),
        source: z22.string().optional(),
        intendedServices: z22.string().optional(),
        targetCountries: z22.string().optional(),
        status: z22.enum([
          "discovery",
          "leads",
          "quotation_sent",
          "msa_sent",
          "msa_signed",
          "closed_won",
          "closed_lost"
        ]).optional(),
        lostReason: z22.string().optional(),
        assignedTo: z22.number().nullable().optional(),
        notes: z22.string().optional(),
        expectedCloseDate: z22.string().nullable().optional()
      })
    })
  ).mutation(async ({ input, ctx }) => {
    const existing = await getSalesLeadById(input.id);
    if (!existing) throw new TRPCError18({ code: "NOT_FOUND", message: "Sales lead not found" });
    if (existing.status === "closed_won") {
      throw new TRPCError18({
        code: "BAD_REQUEST",
        message: "Cannot edit a closed-won deal."
      });
    }
    const updateData = { ...input.data };
    if (input.data.expectedCloseDate !== void 0) {
      updateData.expectedCloseDate = input.data.expectedCloseDate ? /* @__PURE__ */ new Date(input.data.expectedCloseDate + "T00:00:00Z") : null;
    }
    await updateSalesLead(input.id, updateData);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "sales_lead",
      entityId: input.id,
      changes: JSON.stringify(input.data)
    });
    return { success: true };
  }),
  // ── Convert lead to customer (triggered at MSA Signed stage) ─────────
  convertToCustomer: customerManagerProcedure.input(
    z22.object({
      leadId: z22.number(),
      paymentTermDays: z22.number().min(0).max(365).default(30),
      settlementCurrency: z22.string().default("USD"),
      language: z22.enum(["en", "zh"]).default("en"),
      billingEntityId: z22.number().optional(),
      notes: z22.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const lead = await getSalesLeadById(input.leadId);
    if (!lead) throw new TRPCError18({ code: "NOT_FOUND", message: "Sales lead not found" });
    if (lead.convertedCustomerId) {
      throw new TRPCError18({
        code: "BAD_REQUEST",
        message: "This lead has already been converted to a customer."
      });
    }
    if (lead.status !== "msa_signed") {
      throw new TRPCError18({
        code: "BAD_REQUEST",
        message: 'Only leads at "MSA Signed" stage can be converted to customers.'
      });
    }
    const customerResult = await createCustomer({
      companyName: lead.companyName,
      industry: lead.industry || void 0,
      country: lead.country || "Unknown",
      primaryContactName: lead.contactName || void 0,
      primaryContactEmail: lead.contactEmail || void 0,
      primaryContactPhone: lead.contactPhone || void 0,
      paymentTermDays: input.paymentTermDays,
      settlementCurrency: input.settlementCurrency,
      language: input.language,
      billingEntityId: input.billingEntityId || void 0,
      notes: input.notes || lead.notes || void 0,
      status: "active"
    });
    const customerId = customerResult[0]?.insertId ?? customerResult.insertId;
    if (customerId && lead.contactName) {
      await createCustomerContact({
        customerId,
        contactName: lead.contactName,
        email: lead.contactEmail || "",
        phone: lead.contactPhone || void 0,
        role: "Primary Contact",
        isPrimary: true,
        hasPortalAccess: false
      });
    }
    await updateSalesLead(input.leadId, {
      convertedCustomerId: customerId
    });
    await createSalesActivity({
      leadId: input.leadId,
      activityType: "note",
      description: `Customer created (ID: ${customerId}). Sales to introduce customer manager and arrange kickoff meeting. Converted by ${ctx.user.name || "Unknown"}.`,
      createdBy: ctx.user.id
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "convert_to_customer",
      entityType: "sales_lead",
      entityId: input.leadId,
      changes: JSON.stringify({ customerId, companyName: lead.companyName })
    });
    return { success: true, customerId };
  }),
  // ── Check if customer has employees at onboarding or later stages ──────
  checkOnboardingStatus: userProcedure.input(z22.object({ leadId: z22.number() })).query(async ({ input }) => {
    const lead = await getSalesLeadById(input.leadId);
    if (!lead || !lead.convertedCustomerId) return { hasOnboardingEmployee: false, employeeCount: 0 };
    const onboardingOrLaterStatuses = [
      "onboarding",
      "contract_signed",
      "active",
      "on_leave",
      "offboarding",
      "terminated"
    ];
    const result = await listEmployees({ customerId: lead.convertedCustomerId }, 1e3, 0);
    const employees2 = result.data || [];
    const onboardingEmployees = employees2.filter(
      (emp) => onboardingOrLaterStatuses.includes(emp.status)
    );
    return {
      hasOnboardingEmployee: onboardingEmployees.length > 0,
      employeeCount: employees2.length,
      onboardingCount: onboardingEmployees.length
    };
  }),
  // ── Mark as Closed Won (requires customer to have employee at onboarding+) ──
  closeWon: customerManagerProcedure.input(z22.object({ leadId: z22.number() })).mutation(async ({ input, ctx }) => {
    const lead = await getSalesLeadById(input.leadId);
    if (!lead) throw new TRPCError18({ code: "NOT_FOUND", message: "Sales lead not found" });
    if (lead.status !== "msa_signed") {
      throw new TRPCError18({
        code: "BAD_REQUEST",
        message: 'Only leads at "MSA Signed" stage can be marked as Closed Won.'
      });
    }
    if (!lead.convertedCustomerId) {
      throw new TRPCError18({
        code: "BAD_REQUEST",
        message: "Customer must be created before closing the deal."
      });
    }
    const onboardingOrLaterStatuses = [
      "onboarding",
      "contract_signed",
      "active",
      "on_leave",
      "offboarding",
      "terminated"
    ];
    const empResult = await listEmployees({ customerId: lead.convertedCustomerId }, 1e3, 0);
    const allEmployees = empResult.data || [];
    const onboardingEmployees = allEmployees.filter(
      (emp) => onboardingOrLaterStatuses.includes(emp.status)
    );
    if (onboardingEmployees.length === 0) {
      throw new TRPCError18({
        code: "BAD_REQUEST",
        message: "Cannot close as won: the customer must have at least one employee at Onboarding stage or later."
      });
    }
    await updateSalesLead(input.leadId, { status: "closed_won" });
    await createSalesActivity({
      leadId: input.leadId,
      activityType: "note",
      description: `Deal closed as won. ${onboardingEmployees.length} employee(s) confirmed at onboarding or later stage. Closed by ${ctx.user.name || "Unknown"}.`,
      createdBy: ctx.user.id
    });
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "update",
      entityType: "sales_lead",
      entityId: input.leadId,
      changes: JSON.stringify({ status: "closed_won", onboardingEmployees: onboardingEmployees.length })
    });
    return { success: true };
  }),
  // ── Delete a sales lead ──────────────────────────────────────────────
  delete: customerManagerProcedure.input(z22.object({ id: z22.number() })).mutation(async ({ input, ctx }) => {
    const existing = await getSalesLeadById(input.id);
    if (!existing) throw new TRPCError18({ code: "NOT_FOUND", message: "Sales lead not found" });
    if (existing.status === "closed_won" || existing.convertedCustomerId) {
      throw new TRPCError18({
        code: "BAD_REQUEST",
        message: "Cannot delete a lead that has been converted to a customer."
      });
    }
    await deleteSalesLead(input.id);
    await logAuditAction({
      userId: ctx.user.id,
      userName: ctx.user.name || null,
      action: "delete",
      entityType: "sales_lead",
      entityId: input.id,
      changes: JSON.stringify({ companyName: existing.companyName })
    });
    return { success: true };
  }),
  // ── Activities sub-router ────────────────────────────────────────────
  activities: router({
    list: userProcedure.input(z22.object({ leadId: z22.number() })).query(async ({ input }) => {
      return await listSalesActivities(input.leadId);
    }),
    create: customerManagerProcedure.input(
      z22.object({
        leadId: z22.number(),
        activityType: z22.enum([
          "call",
          "email",
          "meeting",
          "note",
          "proposal",
          "follow_up",
          "other"
        ]),
        description: z22.string().min(1, "Description is required")
      })
    ).mutation(async ({ input, ctx }) => {
      const lead = await getSalesLeadById(input.leadId);
      if (!lead) throw new TRPCError18({ code: "NOT_FOUND", message: "Sales lead not found" });
      return await createSalesActivity({
        leadId: input.leadId,
        activityType: input.activityType,
        description: input.description,
        createdBy: ctx.user.id
      });
    }),
    delete: customerManagerProcedure.input(z22.object({ id: z22.number() })).mutation(async ({ input }) => {
      await deleteSalesActivity(input.id);
      return { success: true };
    })
  }),
  // ── List users for assignment dropdown ───────────────────────────────
  assignableUsers: userProcedure.query(async () => {
    const result = await listUsers(100, 0);
    return result.data.map((u) => ({
      id: u.id,
      name: u.name || u.email || `User #${u.id}`,
      email: u.email
    }));
  })
});

// server/routers/knowledgeBaseAdmin.ts
import { z as z23 } from "zod";
import { desc as desc6, eq as eq20, gte as gte3, inArray as inArray4 } from "drizzle-orm";
import { TRPCError as TRPCError19 } from "@trpc/server";
init_db();
init_schema();

// server/services/knowledgeAiService.ts
function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function authorityLevel(score) {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}
function heuristicAuthority(sourceName, url) {
  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();
  const authorityHosts = [
    "littler.com",
    "fragomen.com",
    "ilo.org",
    "shrm.org",
    "gov",
    "oecd.org",
    "imf.org",
    "worldbank.org"
  ];
  const mediumHosts = ["papayaglobal.com", "remote.com", "deel.com"];
  let score = 40;
  if (authorityHosts.some((h) => host.includes(h))) score += 40;
  else if (mediumHosts.some((h) => host.includes(h))) score += 20;
  if (host.endsWith(".gov") || host.includes("gov.")) score += 20;
  if (sourceName.length > 5) score += 5;
  const finalScore = clampScore(score);
  return {
    score: finalScore,
    level: authorityLevel(finalScore),
    reason: `Heuristic authority evaluation for host ${host || "unknown"}.`
  };
}
async function evaluateSourceAuthorityWithAI(params) {
  const fallback = heuristicAuthority(params.sourceName, params.url);
  try {
    const result = await executeTaskLLM("source_authority_review", {
      messages: [
        {
          role: "system",
          content: "You are a compliance intelligence assistant. Evaluate source authority for global employment, payroll, labor law and immigration topics."
        },
        {
          role: "user",
          content: JSON.stringify(params)
        }
      ],
      responseFormat: { type: "json_object" },
      maxTokens: 300
    });
    const raw = result.choices?.[0]?.message?.content;
    const text2 = typeof raw === "string" ? raw : "";
    const parsed = JSON.parse(text2 || "{}");
    const score = clampScore(Number(parsed.score ?? fallback.score));
    const reason = String(parsed.reason ?? fallback.reason).slice(0, 500);
    const level = authorityLevel(score);
    return { score, level, reason };
  } catch {
    return fallback;
  }
}
async function generateKnowledgeDraftWithAI(params) {
  const fallback = {
    title: params.rawTitle || "Knowledge Update",
    summary: (params.rawContent || "").slice(0, 220),
    content: (params.rawContent || "").slice(0, 2e3),
    category: "article",
    topic: params.topic,
    language: params.languageHint === "zh" ? "zh" : "en",
    tags: [params.topic, "auto-generated"],
    countries: [],
    confidence: 65
  };
  try {
    const prompt = {
      goal: "Summarize and normalize raw web content for enterprise knowledge base",
      constraints: {
        audience: "B2B clients using EOR/AOR/visa services",
        output_language: params.languageHint,
        style: "concise, practical, policy-aware"
      },
      input: {
        sourceName: params.sourceName,
        sourceUrl: params.sourceUrl,
        topic: params.topic,
        rawTitle: params.rawTitle,
        rawContent: params.rawContent.slice(0, 6e3)
      },
      output_schema: {
        title: "string",
        summary: "string <= 240 chars",
        content: "string markdown format",
        category: "article|alert|guide",
        topic: "payroll|compliance|leave|invoice|onboarding|general",
        language: "en|zh",
        tags: "string[]",
        countries: "string[] ISO country code if possible",
        confidence: "number 0-100"
      }
    };
    const result = await executeTaskLLM("knowledge_summarize", {
      messages: [
        {
          role: "system",
          content: "You are a legal/compliance editor for global employment operations. Return strict JSON only."
        },
        {
          role: "user",
          content: JSON.stringify(prompt)
        }
      ],
      responseFormat: { type: "json_object" },
      maxTokens: 900
    });
    const raw = result.choices?.[0]?.message?.content;
    const text2 = typeof raw === "string" ? raw : "";
    const parsed = JSON.parse(text2 || "{}");
    return {
      title: String(parsed.title || fallback.title).slice(0, 500),
      summary: String(parsed.summary || fallback.summary).slice(0, 500),
      content: String(parsed.content || fallback.content).slice(0, 1e4),
      category: ["article", "alert", "guide"].includes(parsed.category) ? parsed.category : fallback.category,
      topic: ["payroll", "compliance", "leave", "invoice", "onboarding", "general"].includes(parsed.topic) ? parsed.topic : fallback.topic,
      language: parsed.language === "zh" ? "zh" : "en",
      tags: Array.isArray(parsed.tags) ? parsed.tags.map((x) => String(x)).slice(0, 12) : fallback.tags,
      countries: Array.isArray(parsed.countries) ? parsed.countries.map((x) => String(x).toUpperCase()).slice(0, 8) : fallback.countries,
      confidence: clampScore(Number(parsed.confidence ?? fallback.confidence))
    };
  } catch {
    return fallback;
  }
}

// server/routers/knowledgeBaseAdmin.ts
async function pullFromSource(url) {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Failed to fetch source: ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json2 = await res.json();
    if (Array.isArray(json2)) {
      return json2.slice(0, 20).map((row, idx) => ({
        title: String(row.title || row.name || `Untitled ${idx + 1}`),
        summary: String(row.summary || row.description || ""),
        content: String(row.content || row.body || row.summary || "")
      }));
    }
    return [
      {
        title: String(json2.title || "JSON Source Update"),
        summary: String(json2.summary || json2.message || "Pulled from JSON endpoint"),
        content: JSON.stringify(json2).slice(0, 4e3)
      }
    ];
  }
  const text2 = await res.text();
  const titleMatch = text2.match(/<title>(.*?)<\/title>/i);
  return [
    {
      title: titleMatch?.[1]?.trim() || "Web Source Update",
      summary: "Fetched from web source",
      content: text2.slice(0, 4e3)
    }
  ];
}
function computeFreshnessScore() {
  return 92;
}
function computeDuplicationScore(rawContent, title) {
  const normalizedLength = Math.min(100, Math.floor((rawContent.length + title.length) / 40));
  return Math.max(5, Math.min(95, normalizedLength));
}
function computeRiskScore(input) {
  const authority = Number(input.authorityScore ?? 0);
  const freshness = Number(input.freshnessScore ?? 0);
  const duplication = Number(input.duplicationScore ?? 0);
  return Math.max(0, Math.min(100, Math.round((100 - authority) * 0.45 + (100 - freshness) * 0.25 + duplication * 0.3)));
}
var knowledgeBaseAdminRouter = router({
  listReviewQueue: userProcedure.input(
    z23.object({
      statuses: z23.array(z23.enum(["pending_review", "published", "rejected", "draft"])).default(["pending_review"])
    }).optional()
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError19({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const statuses = input?.statuses?.length ? input.statuses : ["pending_review"];
    const rows = await db.select().from(knowledgeItems).where(inArray4(knowledgeItems.status, statuses)).orderBy(desc6(knowledgeItems.createdAt)).limit(200);
    return rows.map((row) => {
      const meta = row.metadata || {};
      const riskScore = computeRiskScore({
        authorityScore: meta.authorityScore,
        freshnessScore: meta.freshnessScore,
        duplicationScore: meta.duplicationScore
      });
      return {
        ...row,
        riskScore,
        metadata: {
          ...meta,
          freshnessScore: Number(meta.freshnessScore ?? 0),
          duplicationScore: Number(meta.duplicationScore ?? 0)
        }
      };
    }).sort((a, b) => b.riskScore - a.riskScore || Number(b.createdAt) - Number(a.createdAt));
  }),
  listSources: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError19({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    return db.select().from(knowledgeSources).orderBy(desc6(knowledgeSources.updatedAt));
  }),
  listContentGaps: userProcedure.input(
    z23.object({
      days: z23.number().min(1).max(90).default(30)
    }).optional()
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError19({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const days = input?.days ?? 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
    const rows = await db.select().from(knowledgeFeedbackEvents).where(gte3(knowledgeFeedbackEvents.createdAt, since)).orderBy(desc6(knowledgeFeedbackEvents.createdAt)).limit(500);
    const bucket = /* @__PURE__ */ new Map();
    for (const row of rows) {
      const key = (row.query || "(empty)").trim().toLowerCase() || "(empty)";
      const current = bucket.get(key) || {
        query: row.query || "",
        hits: 0,
        topics: /* @__PURE__ */ new Set(),
        latestAt: row.createdAt
      };
      current.hits += 1;
      for (const topic of row.topics || []) current.topics.add(topic);
      if (row.createdAt > current.latestAt) current.latestAt = row.createdAt;
      bucket.set(key, current);
    }
    return Array.from(bucket.values()).map((item) => ({
      query: item.query,
      hits: item.hits,
      topics: Array.from(item.topics),
      latestAt: item.latestAt
    })).sort((a, b) => b.hits - a.hits).slice(0, 20);
  }),
  upsertSource: adminProcedure2.input(
    z23.object({
      id: z23.number().optional(),
      name: z23.string().min(2),
      url: z23.string().url(),
      sourceType: z23.enum(["rss", "api", "web"]).default("web"),
      language: z23.enum(["en", "zh", "multi"]).default("multi"),
      topic: z23.enum(["payroll", "compliance", "leave", "invoice", "onboarding", "general"]).default("general"),
      isActive: z23.boolean().default(true)
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError19({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const authority = await evaluateSourceAuthorityWithAI({
      sourceName: input.name,
      url: input.url,
      sourceType: input.sourceType
    });
    if (input.id) {
      await db.update(knowledgeSources).set({
        name: input.name,
        url: input.url,
        sourceType: input.sourceType,
        language: input.language,
        topic: input.topic,
        isActive: input.isActive,
        authorityScore: authority.score,
        authorityLevel: authority.level,
        authorityReason: authority.reason,
        aiReviewedAt: /* @__PURE__ */ new Date(),
        updatedBy: ctx.user.id
      }).where(eq20(knowledgeSources.id, input.id));
      return { success: true, id: input.id };
    }
    const result = await db.insert(knowledgeSources).values({
      name: input.name,
      url: input.url,
      sourceType: input.sourceType,
      language: input.language,
      topic: input.topic,
      isActive: input.isActive,
      authorityScore: authority.score,
      authorityLevel: authority.level,
      authorityReason: authority.reason,
      aiReviewedAt: /* @__PURE__ */ new Date(),
      updatedBy: ctx.user.id
    });
    return { success: true, id: Number(result.insertId ?? 0), authority };
  }),
  auditSourceAuthority: adminProcedure2.input(z23.object({ sourceId: z23.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError19({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [source] = await db.select().from(knowledgeSources).where(eq20(knowledgeSources.id, input.sourceId)).limit(1);
    if (!source) throw new TRPCError19({ code: "NOT_FOUND", message: "Source not found" });
    const authority = await evaluateSourceAuthorityWithAI({
      sourceName: source.name,
      url: source.url,
      sourceType: source.sourceType
    });
    await db.update(knowledgeSources).set({
      authorityScore: authority.score,
      authorityLevel: authority.level,
      authorityReason: authority.reason,
      aiReviewedAt: /* @__PURE__ */ new Date()
    }).where(eq20(knowledgeSources.id, source.id));
    return { success: true, authority };
  }),
  ingestSourceNow: adminProcedure2.input(z23.object({ sourceId: z23.number(), customerId: z23.number().optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError19({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [source] = await db.select().from(knowledgeSources).where(eq20(knowledgeSources.id, input.sourceId)).limit(1);
    if (!source) throw new TRPCError19({ code: "NOT_FOUND", message: "Source not found" });
    const pulled = await pullFromSource(source.url);
    if (!pulled.length) return { success: true, created: 0 };
    const drafts = await Promise.all(
      pulled.map(
        (item) => generateKnowledgeDraftWithAI({
          sourceName: source.name,
          sourceUrl: source.url,
          topic: source.topic,
          languageHint: source.language,
          rawTitle: item.title,
          rawContent: `${item.summary}

${item.content}`
        })
      )
    );
    await db.insert(knowledgeItems).values(
      drafts.map((draft, idx) => {
        const raw = pulled[idx];
        const freshnessScore = computeFreshnessScore();
        const duplicationScore = computeDuplicationScore(raw.content, raw.title);
        const riskScore = computeRiskScore({
          authorityScore: source.authorityScore,
          freshnessScore,
          duplicationScore
        });
        return {
          customerId: input.customerId ?? null,
          sourceId: source.id,
          title: draft.title,
          summary: draft.summary,
          content: draft.content,
          status: "pending_review",
          category: draft.category,
          topic: draft.topic,
          language: draft.language,
          aiConfidence: draft.confidence,
          aiSummary: draft.summary,
          metadata: {
            sourceName: source.name,
            sourceUrl: source.url,
            aiTags: draft.tags,
            aiCountries: draft.countries,
            authorityScore: source.authorityScore,
            authorityLevel: source.authorityLevel,
            freshnessScore,
            duplicationScore,
            riskScore
          }
        };
      })
    );
    await db.update(knowledgeSources).set({ lastFetchedAt: /* @__PURE__ */ new Date() }).where(eq20(knowledgeSources.id, source.id));
    return { success: true, created: drafts.length };
  }),
  reviewItem: adminProcedure2.input(z23.object({ id: z23.number(), action: z23.enum(["publish", "reject"]), note: z23.string().optional() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError19({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [item] = await db.select().from(knowledgeItems).where(eq20(knowledgeItems.id, input.id)).limit(1);
    if (!item) throw new TRPCError19({ code: "NOT_FOUND", message: "Item not found" });
    await db.update(knowledgeItems).set({
      status: input.action === "publish" ? "published" : "rejected",
      reviewedBy: ctx.user.id,
      reviewedAt: /* @__PURE__ */ new Date(),
      publishedAt: input.action === "publish" ? /* @__PURE__ */ new Date() : item.publishedAt,
      reviewNote: input.note || null
    }).where(eq20(knowledgeItems.id, input.id));
    return { success: true };
  })
});

// server/routers/aiSettings.ts
import { z as z24 } from "zod";
import { asc, desc as desc7, eq as eq21, gte as gte4 } from "drizzle-orm";
init_db();
init_schema();
var providerEnum = z24.enum(["manus_forge", "openai", "anthropic", "google"]);
var taskEnum = z24.enum(["knowledge_summarize", "source_authority_review", "vendor_bill_parse", "invoice_audit"]);
var aiSettingsRouter = router({
  listProviders: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(aiProviderConfigs).orderBy(asc(aiProviderConfigs.priority));
  }),
  upsertProvider: adminProcedure2.input(
    z24.object({
      provider: providerEnum,
      displayName: z24.string().min(2),
      baseUrl: z24.string().optional(),
      model: z24.string().min(2),
      apiKeyEnv: z24.string().min(2),
      isEnabled: z24.boolean().default(true),
      priority: z24.number().default(100)
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { success: false };
    const existing = await db.select().from(aiProviderConfigs).where(eq21(aiProviderConfigs.provider, input.provider)).limit(1);
    if (existing.length) {
      await db.update(aiProviderConfigs).set(input).where(eq21(aiProviderConfigs.provider, input.provider));
    } else {
      await db.insert(aiProviderConfigs).values(input);
    }
    return { success: true };
  }),
  listTaskPolicies: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(aiTaskPolicies).orderBy(asc(aiTaskPolicies.task));
  }),
  aiHealthSummary: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        windowHours: 24,
        totalCalls: 0,
        successRate: 0,
        fallbackRate: 0,
        p95LatencyMs: 0,
        avgCost: 0,
        byTask: [],
        recentFailures: []
      };
    }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const rows = await db.select().from(aiTaskExecutions).where(gte4(aiTaskExecutions.createdAt, since)).orderBy(desc7(aiTaskExecutions.createdAt)).limit(2e3);
    const totalCalls = rows.length;
    const successCalls = rows.filter((r) => r.success).length;
    const fallbackCalls = rows.filter((r) => r.fallbackTriggered).length;
    const latencies = rows.map((r) => Number(r.latencyMs || 0)).sort((a, b) => a - b);
    const p95Index = latencies.length ? Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95)) : 0;
    const p95LatencyMs = latencies.length ? latencies[p95Index] : 0;
    const totalCost = rows.reduce((sum2, row) => sum2 + Number(row.costEstimate || 0), 0);
    const avgCost = totalCalls ? Number((totalCost / totalCalls).toFixed(4)) : 0;
    const byTaskMap = /* @__PURE__ */ new Map();
    for (const row of rows) {
      const key = row.taskType;
      const data = byTaskMap.get(key) || { taskType: key, calls: 0, success: 0, fallback: 0 };
      data.calls += 1;
      data.success += row.success ? 1 : 0;
      data.fallback += row.fallbackTriggered ? 1 : 0;
      byTaskMap.set(key, data);
    }
    const byTask = Array.from(byTaskMap.values()).map((item) => ({
      ...item,
      successRate: item.calls ? Number((item.success / item.calls * 100).toFixed(1)) : 0,
      fallbackRate: item.calls ? Number((item.fallback / item.calls * 100).toFixed(1)) : 0
    }));
    const recentFailures = rows.filter((r) => !r.success).slice(0, 10).map((row) => ({
      id: row.id,
      taskType: row.taskType,
      providerPrimary: row.providerPrimary,
      providerActual: row.providerActual,
      errorClass: row.errorClass,
      createdAt: row.createdAt
    }));
    return {
      windowHours: 24,
      totalCalls,
      successRate: totalCalls ? Number((successCalls / totalCalls * 100).toFixed(1)) : 0,
      fallbackRate: totalCalls ? Number((fallbackCalls / totalCalls * 100).toFixed(1)) : 0,
      p95LatencyMs,
      avgCost,
      byTask,
      recentFailures
    };
  }),
  upsertTaskPolicy: adminProcedure2.input(
    z24.object({
      task: taskEnum,
      primaryProvider: providerEnum,
      fallbackProvider: providerEnum.optional(),
      modelOverride: z24.string().optional(),
      temperature: z24.number().min(0).max(2).default(0.3),
      maxTokens: z24.number().min(256).max(32768).default(4096),
      isActive: z24.boolean().default(true)
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { success: false };
    const existing = await db.select().from(aiTaskPolicies).where(eq21(aiTaskPolicies.task, input.task)).limit(1);
    const payload = {
      ...input,
      temperature: String(input.temperature)
    };
    if (existing.length) {
      await db.update(aiTaskPolicies).set(payload).where(eq21(aiTaskPolicies.task, input.task));
    } else {
      await db.insert(aiTaskPolicies).values(payload);
    }
    return { success: true };
  })
});

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  customers: customersRouter,
  employees: employeesRouter,
  payroll: payrollRouter,
  invoices: invoicesRouter,
  invoiceGeneration: invoiceGenerationRouter,
  countries: countriesRouter,
  leave: leaveRouter,
  adjustments: adjustmentsRouter,
  reimbursements: reimbursementsRouter,
  dashboard: dashboardRouter,
  billingEntities: billingEntitiesRouter,
  userManagement: userManagementRouter,
  auditLogs: auditLogsRouter,
  exchangeRates: exchangeRatesRouter,
  systemSettings: systemSettingsRouter,
  customerLeavePolicies: customerLeavePoliciesRouter,
  vendors: vendorsRouter,
  vendorBills: vendorBillsRouter,
  reports: reportsRouter,
  allocations: allocationsRouter,
  pdfParsing: pdfParsingRouter,
  sales: salesRouter,
  knowledgeBaseAdmin: knowledgeBaseAdminRouter,
  aiSettings: aiSettingsRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await authenticateAdminRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/portal/portalTrpc.ts
init_portalAuth();
init_const();
import { initTRPC as initTRPC2, TRPCError as TRPCError20 } from "@trpc/server";
import superjson2 from "superjson";
async function createPortalContext(opts) {
  let portalUser = null;
  try {
    portalUser = await authenticatePortalRequest(opts.req);
  } catch {
    portalUser = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    portalUser
  };
}
var t2 = initTRPC2.context().create({
  transformer: superjson2
});
var portalRouter = t2.router;
var portalPublicProcedure = t2.procedure;
var requirePortalUser = t2.middleware(async ({ ctx, next }) => {
  if (!ctx.portalUser) {
    throw new TRPCError20({
      code: "UNAUTHORIZED",
      message: PORTAL_UNAUTHED_ERR_MSG
    });
  }
  return next({
    ctx: {
      ...ctx,
      portalUser: ctx.portalUser
      // guaranteed non-null
    }
  });
});
var protectedPortalProcedure = t2.procedure.use(requirePortalUser);
var portalAdminProcedure = t2.procedure.use(
  t2.middleware(async ({ ctx, next }) => {
    if (!ctx.portalUser) {
      throw new TRPCError20({
        code: "UNAUTHORIZED",
        message: PORTAL_UNAUTHED_ERR_MSG
      });
    }
    if (ctx.portalUser.portalRole !== "admin") {
      throw new TRPCError20({
        code: "FORBIDDEN",
        message: PORTAL_FORBIDDEN_ERR_MSG
      });
    }
    return next({
      ctx: {
        ...ctx,
        portalUser: ctx.portalUser
      }
    });
  })
);
var portalHrProcedure = t2.procedure.use(
  t2.middleware(async ({ ctx, next }) => {
    if (!ctx.portalUser) {
      throw new TRPCError20({
        code: "UNAUTHORIZED",
        message: PORTAL_UNAUTHED_ERR_MSG
      });
    }
    if (!["admin", "hr_manager"].includes(ctx.portalUser.portalRole)) {
      throw new TRPCError20({
        code: "FORBIDDEN",
        message: PORTAL_FORBIDDEN_ERR_MSG
      });
    }
    return next({
      ctx: {
        ...ctx,
        portalUser: ctx.portalUser
      }
    });
  })
);
var portalFinanceProcedure = t2.procedure.use(
  t2.middleware(async ({ ctx, next }) => {
    if (!ctx.portalUser) {
      throw new TRPCError20({
        code: "UNAUTHORIZED",
        message: PORTAL_UNAUTHED_ERR_MSG
      });
    }
    if (!["admin", "finance"].includes(ctx.portalUser.portalRole)) {
      throw new TRPCError20({
        code: "FORBIDDEN",
        message: PORTAL_FORBIDDEN_ERR_MSG
      });
    }
    return next({
      ctx: {
        ...ctx,
        portalUser: ctx.portalUser
      }
    });
  })
);

// server/portal/routers/portalAuthRouter.ts
import { z as z25 } from "zod";
import { TRPCError as TRPCError21 } from "@trpc/server";
import { eq as eq22 } from "drizzle-orm";
init_portalAuth();
init_db();
init_schema();
var loginAttemptTracker = /* @__PURE__ */ new Map();
var LOGIN_WINDOW_MS = 15 * 60 * 1e3;
var LOGIN_ATTEMPT_LIMIT = 20;
function cleanupLoginAttemptTracker(now) {
  loginAttemptTracker.forEach((value, key) => {
    if (now - value.firstAt > LOGIN_WINDOW_MS) {
      loginAttemptTracker.delete(key);
    }
  });
}
function assertPortalLoginRateLimit(identifier) {
  const now = Date.now();
  cleanupLoginAttemptTracker(now);
  const record = loginAttemptTracker.get(identifier);
  if (!record || now - record.firstAt > LOGIN_WINDOW_MS) {
    loginAttemptTracker.set(identifier, { count: 1, firstAt: now });
    return;
  }
  if (record.count >= LOGIN_ATTEMPT_LIMIT) {
    throw new TRPCError21({ code: "TOO_MANY_REQUESTS", message: "Too many login attempts. Please try again later." });
  }
  record.count += 1;
  loginAttemptTracker.set(identifier, record);
}
var portalAuthRouter = portalRouter({
  /**
   * Login with email + password
   */
  login: portalPublicProcedure.input(
    z25.object({
      email: z25.string().email(),
      password: z25.string().min(1)
    })
  ).mutation(async ({ input, ctx }) => {
    assertPortalLoginRateLimit(input.email.toLowerCase().trim());
    const db = await getDb();
    if (!db) throw new TRPCError21({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const contacts = await db.select().from(customerContacts).where(eq22(customerContacts.email, input.email.toLowerCase().trim())).limit(1);
    if (contacts.length === 0) {
      throw new TRPCError21({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }
    const contact = contacts[0];
    if (!contact.hasPortalAccess || !contact.isPortalActive) {
      throw new TRPCError21({ code: "UNAUTHORIZED", message: "Portal access not enabled" });
    }
    if (!contact.passwordHash) {
      throw new TRPCError21({ code: "UNAUTHORIZED", message: "Account not activated. Please use your invite link." });
    }
    const passwordValid = await verifyPassword2(input.password, contact.passwordHash);
    if (!passwordValid) {
      throw new TRPCError21({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }
    const customerRows = await db.select({ companyName: customers.companyName, status: customers.status }).from(customers).where(eq22(customers.id, contact.customerId)).limit(1);
    if (customerRows.length === 0 || customerRows[0].status !== "active") {
      throw new TRPCError21({ code: "FORBIDDEN", message: "Company account is not active" });
    }
    const payload = {
      sub: String(contact.id),
      customerId: contact.customerId,
      email: contact.email,
      portalRole: contact.portalRole || "viewer",
      iss: "gea-portal"
    };
    const token = await signPortalToken(payload);
    setPortalCookie(ctx.res, token);
    await db.update(customerContacts).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq22(customerContacts.id, contact.id));
    return {
      success: true,
      user: {
        contactId: contact.id,
        customerId: contact.customerId,
        email: contact.email,
        contactName: contact.contactName,
        portalRole: contact.portalRole || "viewer",
        companyName: customerRows[0].companyName
      }
    };
  }),
  /**
   * Verify invite token (check if valid before showing register form)
   */
  verifyInvite: portalPublicProcedure.input(z25.object({ token: z25.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError21({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const contacts = await db.select({
      id: customerContacts.id,
      email: customerContacts.email,
      contactName: customerContacts.contactName,
      inviteExpiresAt: customerContacts.inviteExpiresAt,
      isPortalActive: customerContacts.isPortalActive,
      customerId: customerContacts.customerId
    }).from(customerContacts).where(eq22(customerContacts.inviteToken, input.token)).limit(1);
    if (contacts.length === 0) {
      return { valid: false, reason: "Invalid invite link" };
    }
    const contact = contacts[0];
    if (contact.isPortalActive) {
      return { valid: false, reason: "Account already activated" };
    }
    if (contact.inviteExpiresAt && contact.inviteExpiresAt < /* @__PURE__ */ new Date()) {
      return { valid: false, reason: "Invite link has expired" };
    }
    const customerRows = await db.select({ companyName: customers.companyName }).from(customers).where(eq22(customers.id, contact.customerId)).limit(1);
    return {
      valid: true,
      email: contact.email,
      contactName: contact.contactName,
      companyName: customerRows[0]?.companyName || ""
    };
  }),
  /**
   * Register (accept invite and set password)
   */
  register: portalPublicProcedure.input(
    z25.object({
      token: z25.string(),
      password: z25.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z25.string()
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.password !== input.confirmPassword) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Passwords do not match" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError21({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const contacts = await db.select().from(customerContacts).where(eq22(customerContacts.inviteToken, input.token)).limit(1);
    if (contacts.length === 0) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Invalid invite link" });
    }
    const contact = contacts[0];
    if (contact.isPortalActive) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Account already activated" });
    }
    if (contact.inviteExpiresAt && contact.inviteExpiresAt < /* @__PURE__ */ new Date()) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Invite link has expired" });
    }
    const passwordHash = await hashPassword2(input.password);
    await db.update(customerContacts).set({
      passwordHash,
      isPortalActive: true,
      hasPortalAccess: true,
      inviteToken: null,
      // Clear invite token after use
      inviteExpiresAt: null,
      lastLoginAt: /* @__PURE__ */ new Date()
    }).where(eq22(customerContacts.id, contact.id));
    const customerRows = await db.select({ companyName: customers.companyName }).from(customers).where(eq22(customers.id, contact.customerId)).limit(1);
    const payload = {
      sub: String(contact.id),
      customerId: contact.customerId,
      email: contact.email,
      portalRole: contact.portalRole || "viewer",
      iss: "gea-portal"
    };
    const token = await signPortalToken(payload);
    setPortalCookie(ctx.res, token);
    return {
      success: true,
      user: {
        contactId: contact.id,
        customerId: contact.customerId,
        email: contact.email,
        contactName: contact.contactName,
        portalRole: contact.portalRole || "viewer",
        companyName: customerRows[0]?.companyName || ""
      }
    };
  }),
  /**
   * Get current portal user
   */
  me: portalPublicProcedure.query(async ({ ctx }) => {
    return ctx.portalUser;
  }),
  /**
   * Logout
   */
  logout: protectedPortalProcedure.mutation(async ({ ctx }) => {
    clearPortalCookie(ctx.res);
    return { success: true };
  }),
  /**
   * Forgot password — generates a reset token
   * Returns the reset link (in production, this would be emailed)
   */
  forgotPassword: portalPublicProcedure.input(
    z25.object({
      email: z25.string().email(),
      origin: z25.string().url()
      // Frontend origin for building reset URL
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError21({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const contacts = await db.select({
      id: customerContacts.id,
      email: customerContacts.email,
      isPortalActive: customerContacts.isPortalActive,
      hasPortalAccess: customerContacts.hasPortalAccess
    }).from(customerContacts).where(eq22(customerContacts.email, input.email.toLowerCase().trim())).limit(1);
    if (contacts.length === 0 || !contacts[0].isPortalActive || !contacts[0].hasPortalAccess) {
      return {
        success: true,
        message: "If an account exists with this email, a reset link has been generated."
      };
    }
    const contact = contacts[0];
    const resetToken = generateResetToken();
    const resetExpiresAt = getResetExpiryDate();
    await db.update(customerContacts).set({ resetToken, resetExpiresAt }).where(eq22(customerContacts.id, contact.id));
    const origin = input.origin;
    const isPortalDomain = origin.includes("app.geahr.com");
    const resetUrl = isPortalDomain ? `${origin}/reset-password?token=${resetToken}` : `${origin}/portal/reset-password?token=${resetToken}`;
    return {
      success: true,
      message: "If an account exists with this email, a reset link has been generated.",
      // DEV ONLY: return the reset link for testing. Remove in production.
      resetUrl
    };
  }),
  /**
   * Verify reset token (check if valid before showing reset form)
   */
  verifyResetToken: portalPublicProcedure.input(z25.object({ token: z25.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError21({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const contacts = await db.select({
      id: customerContacts.id,
      email: customerContacts.email,
      contactName: customerContacts.contactName,
      resetExpiresAt: customerContacts.resetExpiresAt
    }).from(customerContacts).where(eq22(customerContacts.resetToken, input.token)).limit(1);
    if (contacts.length === 0) {
      return { valid: false, reason: "Invalid reset link" };
    }
    const contact = contacts[0];
    if (contact.resetExpiresAt && contact.resetExpiresAt < /* @__PURE__ */ new Date()) {
      return { valid: false, reason: "Reset link has expired" };
    }
    return {
      valid: true,
      email: contact.email,
      contactName: contact.contactName
    };
  }),
  /**
   * Reset password using token
   */
  resetPassword: portalPublicProcedure.input(
    z25.object({
      token: z25.string(),
      password: z25.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z25.string()
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.password !== input.confirmPassword) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Passwords do not match" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError21({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const contacts = await db.select().from(customerContacts).where(eq22(customerContacts.resetToken, input.token)).limit(1);
    if (contacts.length === 0) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Invalid reset link" });
    }
    const contact = contacts[0];
    if (contact.resetExpiresAt && contact.resetExpiresAt < /* @__PURE__ */ new Date()) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Reset link has expired" });
    }
    const passwordHash = await hashPassword2(input.password);
    await db.update(customerContacts).set({
      passwordHash,
      resetToken: null,
      resetExpiresAt: null
    }).where(eq22(customerContacts.id, contact.id));
    const customerRows = await db.select({ companyName: customers.companyName }).from(customers).where(eq22(customers.id, contact.customerId)).limit(1);
    const payload = {
      sub: String(contact.id),
      customerId: contact.customerId,
      email: contact.email,
      portalRole: contact.portalRole || "viewer",
      iss: "gea-portal"
    };
    const token = await signPortalToken(payload);
    setPortalCookie(ctx.res, token);
    return {
      success: true,
      user: {
        contactId: contact.id,
        customerId: contact.customerId,
        email: contact.email,
        contactName: contact.contactName,
        portalRole: contact.portalRole || "viewer",
        companyName: customerRows[0]?.companyName || ""
      }
    };
  }),
  /**
   * Change password
   */
  changePassword: protectedPortalProcedure.input(
    z25.object({
      currentPassword: z25.string(),
      newPassword: z25.string().min(8, "Password must be at least 8 characters"),
      confirmNewPassword: z25.string()
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.newPassword !== input.confirmNewPassword) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Passwords do not match" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError21({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const contacts = await db.select({ passwordHash: customerContacts.passwordHash }).from(customerContacts).where(eq22(customerContacts.id, ctx.portalUser.contactId)).limit(1);
    if (contacts.length === 0 || !contacts[0].passwordHash) {
      throw new TRPCError21({ code: "INTERNAL_SERVER_ERROR", message: "Account error" });
    }
    const valid = await verifyPassword2(input.currentPassword, contacts[0].passwordHash);
    if (!valid) {
      throw new TRPCError21({ code: "BAD_REQUEST", message: "Current password is incorrect" });
    }
    const newHash = await hashPassword2(input.newPassword);
    await db.update(customerContacts).set({ passwordHash: newHash }).where(eq22(customerContacts.id, ctx.portalUser.contactId));
    return { success: true };
  })
});

// server/portal/routers/portalDashboardRouter.ts
import { sql as sql11, eq as eq23, and as and17, count as count3, inArray as inArray5 } from "drizzle-orm";
init_db();
init_schema();
var portalDashboardRouter = portalRouter({
  /**
   * Dashboard summary stats — scoped to customerId
   */
  stats: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const cid = ctx.portalUser.customerId;
    const [empCount] = await db.select({ count: count3() }).from(employees).where(and17(eq23(employees.customerId, cid), eq23(employees.status, "active")));
    const activeCountries = await db.select({ countryCode: employees.country }).from(employees).where(and17(eq23(employees.customerId, cid), eq23(employees.status, "active"))).groupBy(employees.country);
    const [onboardingCount] = await db.select({ count: count3() }).from(employees).where(
      and17(
        eq23(employees.customerId, cid),
        inArray5(employees.status, ["pending_review", "documents_incomplete", "onboarding"])
      )
    );
    const [adjCount] = await db.select({ count: count3() }).from(adjustments).where(and17(eq23(adjustments.customerId, cid), eq23(adjustments.status, "submitted")));
    const [leaveCount] = await db.select({ count: count3() }).from(leaveRecords).innerJoin(employees, eq23(leaveRecords.employeeId, employees.id)).where(and17(eq23(employees.customerId, cid), eq23(leaveRecords.status, "submitted")));
    const [overdueCount] = await db.select({ count: count3() }).from(invoices).where(and17(eq23(invoices.customerId, cid), eq23(invoices.status, "overdue")));
    const [unpaidCount] = await db.select({ count: count3() }).from(invoices).where(and17(eq23(invoices.customerId, cid), eq23(invoices.status, "sent")));
    return {
      activeEmployees: empCount?.count ?? 0,
      activeCountries: activeCountries.length,
      pendingOnboarding: onboardingCount?.count ?? 0,
      pendingAdjustments: adjCount?.count ?? 0,
      pendingLeave: leaveCount?.count ?? 0,
      overdueInvoices: overdueCount?.count ?? 0,
      unpaidInvoices: unpaidCount?.count ?? 0
    };
  }),
  /**
   * Employee distribution by country — for the world map
   */
  employeesByCountry: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const result = await db.select({
      countryCode: employees.country,
      countryName: countriesConfig.countryName,
      count: count3()
    }).from(employees).leftJoin(countriesConfig, eq23(employees.country, countriesConfig.countryCode)).where(and17(eq23(employees.customerId, cid), eq23(employees.status, "active"))).groupBy(employees.country, countriesConfig.countryName);
    return result.map((r) => ({
      countryCode: r.countryCode,
      countryName: r.countryName || r.countryCode,
      employeeCount: r.count
    }));
  }),
  /**
   * Recent activity feed — last 20 events across employees, adjustments, leave
   */
  recentActivity: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const recentEmployees = await db.select({
      id: employees.id,
      type: sql11`'employee'`,
      title: sql11`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      status: employees.status,
      date: employees.updatedAt
    }).from(employees).where(eq23(employees.customerId, cid)).orderBy(sql11`${employees.updatedAt} DESC`).limit(10);
    const recentAdj = await db.select({
      id: adjustments.id,
      type: sql11`'adjustment'`,
      title: adjustments.adjustmentType,
      status: adjustments.status,
      date: adjustments.updatedAt
    }).from(adjustments).where(eq23(adjustments.customerId, cid)).orderBy(sql11`${adjustments.updatedAt} DESC`).limit(10);
    const recentLeave = await db.select({
      id: leaveRecords.id,
      type: sql11`'leave'`,
      title: sql11`CONCAT('Leave #', ${leaveRecords.id})`,
      status: leaveRecords.status,
      date: leaveRecords.updatedAt
    }).from(leaveRecords).innerJoin(employees, eq23(leaveRecords.employeeId, employees.id)).where(eq23(employees.customerId, cid)).orderBy(sql11`${leaveRecords.updatedAt} DESC`).limit(10);
    const all = [...recentEmployees, ...recentAdj, ...recentLeave].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
    return all;
  }),
  /**
   * Monthly payroll cost trend — last 12 months
   * Payroll runs are per-country, so we aggregate via payrollItems -> employees -> customerId
   */
  payrollTrend: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const result = await db.select({
      month: payrollRuns.payrollMonth,
      totalGross: sql11`COALESCE(SUM(${payrollItems.gross}), 0)`,
      totalNet: sql11`COALESCE(SUM(${payrollItems.net}), 0)`,
      totalEmployerCost: sql11`COALESCE(SUM(${payrollItems.totalEmploymentCost}), 0)`,
      currency: payrollRuns.currency
    }).from(payrollItems).innerJoin(payrollRuns, eq23(payrollItems.payrollRunId, payrollRuns.id)).innerJoin(employees, eq23(payrollItems.employeeId, employees.id)).where(
      and17(
        eq23(employees.customerId, cid),
        sql11`${payrollRuns.status} IN ('approved', 'locked', 'paid')`,
        sql11`${payrollRuns.payrollMonth} >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`
      )
    ).groupBy(payrollRuns.payrollMonth, payrollRuns.currency).orderBy(payrollRuns.payrollMonth);
    return result.map((r) => ({
      month: r.month,
      totalGross: Number(r.totalGross),
      totalNet: Number(r.totalNet),
      totalEmployerCost: Number(r.totalEmployerCost),
      currency: r.currency
    }));
  }),
  /**
   * Employee status distribution — for pie/donut chart
   */
  employeeStatusDistribution: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const result = await db.select({
      status: employees.status,
      count: count3()
    }).from(employees).where(eq23(employees.customerId, cid)).groupBy(employees.status);
    return result.map((r) => ({
      status: r.status,
      count: r.count
    }));
  })
});

// server/portal/routers/portalEmployeesRouter.ts
import { z as z26 } from "zod";
import { TRPCError as TRPCError22 } from "@trpc/server";
import { sql as sql12, eq as eq24, and as and18, count as count4 } from "drizzle-orm";
import crypto4 from "crypto";
init_db();
init_schema();
var PORTAL_EMPLOYEE_FIELDS = {
  id: employees.id,
  employeeCode: employees.employeeCode,
  firstName: employees.firstName,
  lastName: employees.lastName,
  email: employees.email,
  phone: employees.phone,
  dateOfBirth: employees.dateOfBirth,
  gender: employees.gender,
  nationality: employees.nationality,
  idType: employees.idType,
  idNumber: employees.idNumber,
  address: employees.address,
  country: employees.country,
  city: employees.city,
  state: employees.state,
  postalCode: employees.postalCode,
  department: employees.department,
  jobTitle: employees.jobTitle,
  serviceType: employees.serviceType,
  employmentType: employees.employmentType,
  startDate: employees.startDate,
  endDate: employees.endDate,
  status: employees.status,
  baseSalary: employees.baseSalary,
  salaryCurrency: employees.salaryCurrency,
  requiresVisa: employees.requiresVisa,
  visaStatus: employees.visaStatus,
  visaExpiryDate: employees.visaExpiryDate,
  createdAt: employees.createdAt,
  updatedAt: employees.updatedAt
  // NOTE: estimatedEmployerCost, visaNotes, and other internal fields are NOT included
};
var portalEmployeesRouter = portalRouter({
  /**
   * List employees — scoped to customerId
   */
  list: protectedPortalProcedure.input(
    z26.object({
      page: z26.number().min(1).default(1),
      pageSize: z26.number().min(1).max(100).default(20),
      search: z26.string().optional(),
      status: z26.string().optional(),
      country: z26.string().optional(),
      serviceType: z26.string().optional()
    })
  ).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return { items: [], total: 0 };
    const cid = ctx.portalUser.customerId;
    const conditions = [eq24(employees.customerId, cid)];
    if (input.status) {
      conditions.push(eq24(employees.status, input.status));
    }
    if (input.country) {
      conditions.push(eq24(employees.country, input.country));
    }
    if (input.serviceType) {
      conditions.push(eq24(employees.serviceType, input.serviceType));
    }
    if (input.search) {
      conditions.push(
        sql12`(${employees.firstName} LIKE ${`%${input.search}%`} OR ${employees.lastName} LIKE ${`%${input.search}%`} OR ${employees.email} LIKE ${`%${input.search}%`})`
      );
    }
    const where = and18(...conditions);
    const [totalResult] = await db.select({ count: count4() }).from(employees).where(where);
    const items = await db.select(PORTAL_EMPLOYEE_FIELDS).from(employees).where(where).orderBy(sql12`${employees.updatedAt} DESC`).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    return {
      items,
      total: totalResult?.count ?? 0
    };
  }),
  /**
   * Get employee detail — scoped to customerId
   */
  detail: protectedPortalProcedure.input(z26.object({ id: z26.number() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [emp] = await db.select(PORTAL_EMPLOYEE_FIELDS).from(employees).where(and18(eq24(employees.id, input.id), eq24(employees.customerId, cid)));
    if (!emp) {
      throw new TRPCError22({ code: "NOT_FOUND", message: "Employee not found" });
    }
    const contracts = await db.select({
      id: employeeContracts.id,
      contractType: employeeContracts.contractType,
      fileUrl: employeeContracts.fileUrl,
      signedDate: employeeContracts.signedDate,
      effectiveDate: employeeContracts.effectiveDate,
      expiryDate: employeeContracts.expiryDate,
      status: employeeContracts.status
    }).from(employeeContracts).where(eq24(employeeContracts.employeeId, input.id));
    const documents = await db.select({
      id: employeeDocuments.id,
      documentType: employeeDocuments.documentType,
      documentName: employeeDocuments.documentName,
      fileUrl: employeeDocuments.fileUrl,
      mimeType: employeeDocuments.mimeType,
      uploadedAt: employeeDocuments.uploadedAt
    }).from(employeeDocuments).where(eq24(employeeDocuments.employeeId, input.id));
    const balances = await db.select({
      id: leaveBalances.id,
      leaveTypeId: leaveBalances.leaveTypeId,
      leaveTypeName: leaveTypes.leaveTypeName,
      year: leaveBalances.year,
      totalEntitlement: leaveBalances.totalEntitlement,
      used: leaveBalances.used,
      remaining: leaveBalances.remaining
    }).from(leaveBalances).leftJoin(leaveTypes, eq24(leaveBalances.leaveTypeId, leaveTypes.id)).where(eq24(leaveBalances.employeeId, input.id));
    return {
      ...emp,
      contracts,
      documents,
      leaveBalances: balances
    };
  }),
  /**
   * Submit new employee onboarding request
   * Only HR managers and admins can do this
   */
  submitOnboarding: portalHrProcedure.input(
    z26.object({
      firstName: z26.string().min(1),
      lastName: z26.string().min(1),
      email: z26.string().email(),
      phone: z26.string().optional(),
      dateOfBirth: z26.string().optional(),
      gender: z26.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
      nationality: z26.string().optional(),
      idType: z26.string().optional(),
      idNumber: z26.string().optional(),
      address: z26.string().optional(),
      country: z26.string().min(1),
      city: z26.string().optional(),
      state: z26.string().optional(),
      postalCode: z26.string().optional(),
      department: z26.string().optional(),
      jobTitle: z26.string().min(1),
      serviceType: z26.enum(["eor", "visa_eor", "aor"]).default("eor"),
      employmentType: z26.enum(["fixed_term", "long_term"]).default("long_term"),
      startDate: z26.string().min(1),
      endDate: z26.string().optional(),
      baseSalary: z26.string().min(1),
      salaryCurrency: z26.string().default("USD"),
      requiresVisa: z26.boolean().default(false)
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const result = await createEmployee({
      customerId: cid,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      dateOfBirth: input.dateOfBirth || null,
      gender: input.gender || null,
      nationality: input.nationality || null,
      idType: input.idType || null,
      idNumber: input.idNumber || null,
      address: input.address || null,
      country: input.country,
      city: input.city || null,
      state: input.state || null,
      postalCode: input.postalCode || null,
      department: input.department || null,
      jobTitle: input.jobTitle,
      serviceType: input.serviceType,
      employmentType: input.employmentType,
      startDate: input.startDate,
      endDate: input.endDate || null,
      baseSalary: input.baseSalary,
      salaryCurrency: input.salaryCurrency,
      requiresVisa: input.requiresVisa,
      status: "pending_review"
    });
    return { success: true, employeeId: result[0].insertId };
  }),
  /**
   * Upload document for an employee
   * Only HR managers and admins can do this
   */
  uploadDocument: portalHrProcedure.input(
    z26.object({
      employeeId: z26.number(),
      documentType: z26.enum(["resume", "passport", "national_id", "work_permit", "visa", "contract", "education", "other"]),
      documentName: z26.string().min(1),
      fileBase64: z26.string(),
      fileName: z26.string(),
      mimeType: z26.string().default("application/pdf"),
      fileSize: z26.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [emp] = await db.select({ id: employees.id }).from(employees).where(and18(eq24(employees.id, input.employeeId), eq24(employees.customerId, cid)));
    if (!emp) {
      throw new TRPCError22({ code: "NOT_FOUND", message: "Employee not found" });
    }
    const fileBuffer = Buffer.from(input.fileBase64, "base64");
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `employee-docs/${input.employeeId}/${input.documentType}/${randomSuffix}-${input.fileName}`;
    const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
    await createEmployeeDocument({
      employeeId: input.employeeId,
      documentType: input.documentType,
      documentName: input.documentName,
      fileUrl: url,
      fileKey,
      mimeType: input.mimeType,
      fileSize: input.fileSize || fileBuffer.length
    });
    return { success: true, url };
  }),
  /**
   * Get available countries for onboarding
   */
  availableCountries: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const countries = await db.select({
      countryCode: countriesConfig.countryCode,
      countryName: countriesConfig.countryName,
      currency: countriesConfig.localCurrency
    }).from(countriesConfig).where(eq24(countriesConfig.isActive, true)).orderBy(countriesConfig.countryName);
    return countries;
  }),
  /**
   * Get leave types for a specific country
   */
  leaveTypesByCountry: protectedPortalProcedure.input(z26.object({ countryCode: z26.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const types = await db.select({
      id: leaveTypes.id,
      leaveTypeName: leaveTypes.leaveTypeName,
      annualEntitlement: leaveTypes.annualEntitlement,
      isPaid: leaveTypes.isPaid,
      requiresApproval: leaveTypes.requiresApproval
    }).from(leaveTypes).where(eq24(leaveTypes.countryCode, input.countryCode));
    return types;
  }),
  /**
   * Send self-service onboarding invite to an employee
   * The employee will receive a link to fill in their own information
   */
  sendOnboardingInvite: portalHrProcedure.input(
    z26.object({
      employeeName: z26.string().min(1),
      employeeEmail: z26.string().email()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const token = crypto4.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1e3);
    await db.insert(onboardingInvites).values({
      customerId: cid,
      employeeName: input.employeeName,
      employeeEmail: input.employeeEmail,
      token,
      status: "pending",
      expiresAt,
      createdBy: ctx.portalUser.contactId
    });
    return { success: true, token };
  }),
  /**
   * List onboarding invites for this customer
   */
  listOnboardingInvites: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const invites = await db.select({
      id: onboardingInvites.id,
      employeeName: onboardingInvites.employeeName,
      employeeEmail: onboardingInvites.employeeEmail,
      token: onboardingInvites.token,
      status: onboardingInvites.status,
      employeeId: onboardingInvites.employeeId,
      expiresAt: onboardingInvites.expiresAt,
      completedAt: onboardingInvites.completedAt,
      createdAt: onboardingInvites.createdAt
    }).from(onboardingInvites).where(eq24(onboardingInvites.customerId, cid)).orderBy(sql12`${onboardingInvites.createdAt} DESC`);
    return invites;
  }),
  /**
   * Resend an onboarding invite (regenerate token + extend expiry)
   */
  resendOnboardingInvite: portalHrProcedure.input(z26.object({ id: z26.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [invite] = await db.select().from(onboardingInvites).where(
      and18(
        eq24(onboardingInvites.id, input.id),
        eq24(onboardingInvites.customerId, cid),
        eq24(onboardingInvites.status, "pending")
      )
    );
    if (!invite) {
      throw new TRPCError22({ code: "NOT_FOUND", message: "Invite not found or not pending" });
    }
    const newToken = crypto4.randomBytes(32).toString("hex");
    const newExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1e3);
    await db.update(onboardingInvites).set({ token: newToken, expiresAt: newExpiresAt }).where(eq24(onboardingInvites.id, input.id));
    return { success: true, token: newToken };
  }),
  /**
   * Cancel an onboarding invite
   */
  cancelOnboardingInvite: portalHrProcedure.input(z26.object({ id: z26.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    await db.update(onboardingInvites).set({ status: "cancelled" }).where(
      and18(
        eq24(onboardingInvites.id, input.id),
        eq24(onboardingInvites.customerId, cid),
        eq24(onboardingInvites.status, "pending")
      )
    );
    return { success: true };
  }),
  /**
   * Validate self-service onboarding token (public — no auth required)
   */
  validateOnboardingToken: portalPublicProcedure.input(z26.object({ token: z26.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const [invite] = await db.select({
      id: onboardingInvites.id,
      employeeName: onboardingInvites.employeeName,
      employeeEmail: onboardingInvites.employeeEmail,
      status: onboardingInvites.status,
      expiresAt: onboardingInvites.expiresAt,
      customerId: onboardingInvites.customerId
    }).from(onboardingInvites).where(eq24(onboardingInvites.token, input.token));
    if (!invite) {
      return { valid: false, reason: "Invalid invite link" };
    }
    if (invite.status !== "pending") {
      return { valid: false, reason: invite.status === "completed" ? "This form has already been submitted" : "This invite has been cancelled or expired" };
    }
    if (new Date(invite.expiresAt) < /* @__PURE__ */ new Date()) {
      await db.update(onboardingInvites).set({ status: "expired" }).where(eq24(onboardingInvites.id, invite.id));
      return { valid: false, reason: "This invite link has expired" };
    }
    return {
      valid: true,
      employeeName: invite.employeeName,
      employeeEmail: invite.employeeEmail
    };
  }),
  /**
   * Submit self-service onboarding form (public — no auth required)
   * Employee fills in their own information
   */
  submitSelfServiceOnboarding: portalPublicProcedure.input(
    z26.object({
      token: z26.string(),
      firstName: z26.string().min(1),
      lastName: z26.string().min(1),
      email: z26.string().email(),
      phone: z26.string().optional(),
      dateOfBirth: z26.string().optional(),
      gender: z26.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
      nationality: z26.string().optional(),
      idType: z26.string().optional(),
      idNumber: z26.string().optional(),
      address: z26.string().optional(),
      country: z26.string().min(1),
      city: z26.string().optional(),
      state: z26.string().optional(),
      postalCode: z26.string().optional(),
      jobTitle: z26.string().min(1),
      department: z26.string().optional(),
      startDate: z26.string().min(1)
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const [invite] = await db.select().from(onboardingInvites).where(
      and18(
        eq24(onboardingInvites.token, input.token),
        eq24(onboardingInvites.status, "pending")
      )
    );
    if (!invite) {
      throw new TRPCError22({ code: "NOT_FOUND", message: "Invalid or expired invite" });
    }
    if (new Date(invite.expiresAt) < /* @__PURE__ */ new Date()) {
      await db.update(onboardingInvites).set({ status: "expired" }).where(eq24(onboardingInvites.id, invite.id));
      throw new TRPCError22({ code: "BAD_REQUEST", message: "This invite has expired" });
    }
    const result = await createEmployee({
      customerId: invite.customerId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      dateOfBirth: input.dateOfBirth || null,
      gender: input.gender || null,
      nationality: input.nationality || null,
      idType: input.idType || null,
      idNumber: input.idNumber || null,
      address: input.address || null,
      country: input.country,
      city: input.city || null,
      state: input.state || null,
      postalCode: input.postalCode || null,
      department: input.department || null,
      jobTitle: input.jobTitle,
      serviceType: "eor",
      employmentType: "long_term",
      startDate: input.startDate,
      baseSalary: "0",
      // To be set by employer
      salaryCurrency: "USD",
      status: "pending_review"
    });
    const employeeId = result[0]?.insertId;
    await db.update(onboardingInvites).set({
      status: "completed",
      employeeId,
      completedAt: /* @__PURE__ */ new Date()
    }).where(eq24(onboardingInvites.id, invite.id));
    return { success: true, employeeId };
  }),
  /**
   * Upload document for self-service onboarding (public — uses token)
   */
  uploadSelfServiceDocument: portalPublicProcedure.input(
    z26.object({
      token: z26.string(),
      employeeId: z26.number(),
      documentType: z26.enum(["resume", "passport", "national_id", "work_permit", "visa", "contract", "education", "other"]),
      documentName: z26.string().min(1),
      fileBase64: z26.string(),
      fileName: z26.string(),
      mimeType: z26.string().default("application/pdf"),
      fileSize: z26.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const [invite] = await db.select().from(onboardingInvites).where(
      and18(
        eq24(onboardingInvites.token, input.token),
        eq24(onboardingInvites.employeeId, input.employeeId)
      )
    );
    if (!invite) {
      throw new TRPCError22({ code: "FORBIDDEN", message: "Invalid token or employee" });
    }
    const fileBuffer = Buffer.from(input.fileBase64, "base64");
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `employee-docs/${input.employeeId}/${input.documentType}/${randomSuffix}-${input.fileName}`;
    const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
    await createEmployeeDocument({
      employeeId: input.employeeId,
      documentType: input.documentType,
      documentName: input.documentName,
      fileUrl: url,
      fileKey,
      mimeType: input.mimeType,
      fileSize: input.fileSize || fileBuffer.length
    });
    return { success: true, url };
  }),
  /**
   * Delete an employee — only allowed for pending_review status
   * Only HR managers and admins can do this
   */
  delete: portalHrProcedure.input(z26.object({ id: z26.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError22({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [emp] = await db.select({ id: employees.id, status: employees.status }).from(employees).where(and18(eq24(employees.id, input.id), eq24(employees.customerId, cid)));
    if (!emp) {
      throw new TRPCError22({ code: "NOT_FOUND", message: "Employee not found" });
    }
    if (emp.status !== "pending_review") {
      throw new TRPCError22({
        code: "BAD_REQUEST",
        message: "Only employees in pending review status can be deleted"
      });
    }
    await db.delete(employeeDocuments).where(eq24(employeeDocuments.employeeId, input.id));
    await db.delete(employeeContracts).where(eq24(employeeContracts.employeeId, input.id));
    await db.delete(leaveBalances).where(eq24(leaveBalances.employeeId, input.id));
    await db.delete(employees).where(eq24(employees.id, input.id));
    return { success: true };
  })
});

// server/portal/routers/portalAdjustmentsRouter.ts
import { z as z27 } from "zod";
import { TRPCError as TRPCError23 } from "@trpc/server";
import { sql as sql13, eq as eq25, and as and19, count as count5 } from "drizzle-orm";
init_db();
init_schema();
var portalAdjustmentsRouter = portalRouter({
  /**
   * List adjustments — scoped to customerId
   */
  list: protectedPortalProcedure.input(
    z27.object({
      page: z27.number().min(1).default(1),
      pageSize: z27.number().min(1).max(100).default(20),
      status: z27.string().optional(),
      effectiveMonth: z27.string().optional(),
      employeeId: z27.number().optional()
    })
  ).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return { items: [], total: 0 };
    const cid = ctx.portalUser.customerId;
    const conditions = [eq25(adjustments.customerId, cid)];
    if (input.status) {
      conditions.push(eq25(adjustments.status, input.status));
    }
    if (input.effectiveMonth) {
      conditions.push(eq25(adjustments.effectiveMonth, input.effectiveMonth));
    }
    if (input.employeeId) {
      conditions.push(eq25(adjustments.employeeId, input.employeeId));
    }
    const where = and19(...conditions);
    const [totalResult] = await db.select({ count: count5() }).from(adjustments).where(where);
    const items = await db.select({
      id: adjustments.id,
      employeeId: adjustments.employeeId,
      adjustmentType: adjustments.adjustmentType,
      category: adjustments.category,
      amount: adjustments.amount,
      currency: adjustments.currency,
      effectiveMonth: adjustments.effectiveMonth,
      description: adjustments.description,
      status: adjustments.status,
      receiptFileUrl: adjustments.receiptFileUrl,
      clientApprovedBy: adjustments.clientApprovedBy,
      clientApprovedAt: adjustments.clientApprovedAt,
      clientRejectionReason: adjustments.clientRejectionReason,
      adminApprovedBy: adjustments.adminApprovedBy,
      adminApprovedAt: adjustments.adminApprovedAt,
      adminRejectionReason: adjustments.adminRejectionReason,
      createdAt: adjustments.createdAt,
      updatedAt: adjustments.updatedAt,
      // Join employee name
      employeeFirstName: employees.firstName,
      employeeLastName: employees.lastName
    }).from(adjustments).innerJoin(employees, eq25(adjustments.employeeId, employees.id)).where(where).orderBy(sql13`${adjustments.updatedAt} DESC`).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    return {
      items,
      total: totalResult?.count ?? 0
    };
  }),
  /**
   * Create adjustment — only HR managers and admins
   */
  create: portalHrProcedure.input(
    z27.object({
      employeeId: z27.number(),
      adjustmentType: z27.enum(["bonus", "allowance", "reimbursement", "deduction", "other"]),
      category: z27.enum(["housing", "transport", "meals", "performance_bonus", "year_end_bonus", "overtime", "travel_reimbursement", "equipment_reimbursement", "absence_deduction", "other"]).optional(),
      amount: z27.string(),
      currency: z27.string().default("USD"),
      effectiveMonth: z27.string(),
      description: z27.string().optional(),
      receiptFileUrl: z27.string().optional(),
      receiptFileKey: z27.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError23({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [emp] = await db.select({ id: employees.id }).from(employees).where(and19(eq25(employees.id, input.employeeId), eq25(employees.customerId, cid)));
    if (!emp) {
      throw new TRPCError23({ code: "NOT_FOUND", message: "Employee not found" });
    }
    const parts = input.effectiveMonth.split("-");
    const normalizedMonth = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;
    const result = await db.insert(adjustments).values({
      employeeId: input.employeeId,
      customerId: cid,
      // ALWAYS from context
      adjustmentType: input.adjustmentType,
      category: input.category || null,
      amount: input.amount,
      currency: input.currency,
      effectiveMonth: new Date(normalizedMonth),
      description: input.description || null,
      receiptFileUrl: input.receiptFileUrl || null,
      receiptFileKey: input.receiptFileKey || null,
      status: "submitted"
    });
    return { success: true, adjustmentId: result[0].insertId };
  }),
  /**
   * Update adjustment — only if status is 'submitted' (not locked)
   */
  update: portalHrProcedure.input(
    z27.object({
      id: z27.number(),
      amount: z27.string().optional(),
      description: z27.string().optional(),
      receiptFileUrl: z27.string().optional(),
      receiptFileKey: z27.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError23({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [adj] = await db.select({ id: adjustments.id, status: adjustments.status }).from(adjustments).where(and19(eq25(adjustments.id, input.id), eq25(adjustments.customerId, cid)));
    if (!adj) {
      throw new TRPCError23({ code: "NOT_FOUND", message: "Adjustment not found" });
    }
    if (adj.status !== "submitted") {
      throw new TRPCError23({ code: "FORBIDDEN", message: "Adjustment is locked and cannot be edited" });
    }
    const updates = {};
    if (input.amount !== void 0) updates.amount = input.amount;
    if (input.description !== void 0) updates.description = input.description;
    if (input.receiptFileUrl !== void 0) updates.receiptFileUrl = input.receiptFileUrl;
    if (input.receiptFileKey !== void 0) updates.receiptFileKey = input.receiptFileKey;
    if (Object.keys(updates).length > 0) {
      await db.update(adjustments).set(updates).where(eq25(adjustments.id, input.id));
    }
    return { success: true };
  }),
  /**
   * Delete adjustment — only if status is 'submitted'
   */
  delete: portalHrProcedure.input(z27.object({ id: z27.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError23({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [adj] = await db.select({ id: adjustments.id, status: adjustments.status }).from(adjustments).where(and19(eq25(adjustments.id, input.id), eq25(adjustments.customerId, cid)));
    if (!adj) {
      throw new TRPCError23({ code: "NOT_FOUND", message: "Adjustment not found" });
    }
    if (adj.status !== "submitted") {
      throw new TRPCError23({ code: "FORBIDDEN", message: "Adjustment is locked and cannot be deleted" });
    }
    await db.delete(adjustments).where(eq25(adjustments.id, input.id));
    return { success: true };
  }),
  /**
   * Client approve adjustment — HR manager / admin approves a submitted adjustment
   */
  approve: portalHrProcedure.input(z27.object({ id: z27.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError23({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [adj] = await db.select({ id: adjustments.id, status: adjustments.status }).from(adjustments).where(and19(eq25(adjustments.id, input.id), eq25(adjustments.customerId, cid)));
    if (!adj) {
      throw new TRPCError23({ code: "NOT_FOUND", message: "Adjustment not found" });
    }
    if (adj.status !== "submitted") {
      throw new TRPCError23({ code: "FORBIDDEN", message: "Only submitted adjustments can be approved" });
    }
    await db.update(adjustments).set({
      status: "client_approved",
      clientApprovedBy: ctx.portalUser.contactId,
      clientApprovedAt: /* @__PURE__ */ new Date()
    }).where(eq25(adjustments.id, input.id));
    return { success: true };
  }),
  /**
   * Client reject adjustment
   */
  reject: portalHrProcedure.input(z27.object({
    id: z27.number(),
    reason: z27.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError23({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [adj] = await db.select({ id: adjustments.id, status: adjustments.status }).from(adjustments).where(and19(eq25(adjustments.id, input.id), eq25(adjustments.customerId, cid)));
    if (!adj) {
      throw new TRPCError23({ code: "NOT_FOUND", message: "Adjustment not found" });
    }
    if (adj.status !== "submitted") {
      throw new TRPCError23({ code: "FORBIDDEN", message: "Only submitted adjustments can be rejected" });
    }
    await db.update(adjustments).set({
      status: "client_rejected",
      clientApprovedBy: ctx.portalUser.contactId,
      clientApprovedAt: /* @__PURE__ */ new Date(),
      clientRejectionReason: input.reason || null
    }).where(eq25(adjustments.id, input.id));
    return { success: true };
  }),
  /**
   * Upload receipt file for an adjustment
   */
  uploadReceipt: portalHrProcedure.input(
    z27.object({
      fileBase64: z27.string(),
      fileName: z27.string(),
      mimeType: z27.string().default("application/pdf")
    })
  ).mutation(async ({ input }) => {
    const fileBuffer = Buffer.from(input.fileBase64, "base64");
    if (fileBuffer.length > 20 * 1024 * 1024) {
      throw new TRPCError23({ code: "BAD_REQUEST", message: "File size must be under 20MB" });
    }
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `adjustment-receipts/${Date.now()}-${randomSuffix}-${input.fileName}`;
    const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
    return { url, fileKey };
  })
});

// server/portal/routers/portalLeaveRouter.ts
import { z as z28 } from "zod";
import { TRPCError as TRPCError24 } from "@trpc/server";
import { sql as sql14, eq as eq26, and as and20, count as count6 } from "drizzle-orm";
init_db();
init_schema();
var portalLeaveRouter = portalRouter({
  /**
   * List leave records — scoped to customerId via employee join
   */
  list: protectedPortalProcedure.input(
    z28.object({
      page: z28.number().min(1).default(1),
      pageSize: z28.number().min(1).max(100).default(20),
      status: z28.string().optional(),
      employeeId: z28.number().optional()
    })
  ).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return { items: [], total: 0 };
    const cid = ctx.portalUser.customerId;
    const conditions = [eq26(employees.customerId, cid)];
    if (input.status) {
      conditions.push(eq26(leaveRecords.status, input.status));
    }
    if (input.employeeId) {
      conditions.push(eq26(leaveRecords.employeeId, input.employeeId));
    }
    const where = and20(...conditions);
    const [totalResult] = await db.select({ count: count6() }).from(leaveRecords).innerJoin(employees, eq26(leaveRecords.employeeId, employees.id)).where(where);
    const items = await db.select({
      id: leaveRecords.id,
      employeeId: leaveRecords.employeeId,
      leaveTypeId: leaveRecords.leaveTypeId,
      startDate: leaveRecords.startDate,
      endDate: leaveRecords.endDate,
      days: leaveRecords.days,
      status: leaveRecords.status,
      reason: leaveRecords.reason,
      clientApprovedBy: leaveRecords.clientApprovedBy,
      clientApprovedAt: leaveRecords.clientApprovedAt,
      clientRejectionReason: leaveRecords.clientRejectionReason,
      adminApprovedBy: leaveRecords.adminApprovedBy,
      adminApprovedAt: leaveRecords.adminApprovedAt,
      adminRejectionReason: leaveRecords.adminRejectionReason,
      createdAt: leaveRecords.createdAt,
      // Employee info
      employeeFirstName: employees.firstName,
      employeeLastName: employees.lastName,
      // Leave type info
      leaveTypeName: leaveTypes.leaveTypeName
    }).from(leaveRecords).innerJoin(employees, eq26(leaveRecords.employeeId, employees.id)).leftJoin(leaveTypes, eq26(leaveRecords.leaveTypeId, leaveTypes.id)).where(where).orderBy(sql14`${leaveRecords.updatedAt} DESC`).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    return { items, total: totalResult?.count ?? 0 };
  }),
  /**
   * Get leave balances for an employee — scoped to customerId
   */
  balances: protectedPortalProcedure.input(z28.object({ employeeId: z28.number() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const [emp] = await db.select({ id: employees.id }).from(employees).where(and20(eq26(employees.id, input.employeeId), eq26(employees.customerId, cid)));
    if (!emp) return [];
    const balances = await db.select({
      id: leaveBalances.id,
      leaveTypeId: leaveBalances.leaveTypeId,
      year: leaveBalances.year,
      totalEntitlement: leaveBalances.totalEntitlement,
      used: leaveBalances.used,
      remaining: leaveBalances.remaining,
      leaveTypeName: leaveTypes.leaveTypeName
    }).from(leaveBalances).leftJoin(leaveTypes, eq26(leaveBalances.leaveTypeId, leaveTypes.id)).where(eq26(leaveBalances.employeeId, input.employeeId));
    return balances;
  }),
  /**
   * Submit leave record — only HR managers and admins
   */
  create: portalHrProcedure.input(
    z28.object({
      employeeId: z28.number(),
      leaveTypeId: z28.number(),
      startDate: z28.string(),
      endDate: z28.string(),
      days: z28.string(),
      reason: z28.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError24({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [emp] = await db.select({ id: employees.id }).from(employees).where(and20(eq26(employees.id, input.employeeId), eq26(employees.customerId, cid)));
    if (!emp) {
      throw new TRPCError24({ code: "NOT_FOUND", message: "Employee not found" });
    }
    const result = await db.insert(leaveRecords).values({
      employeeId: input.employeeId,
      leaveTypeId: input.leaveTypeId,
      startDate: input.startDate,
      endDate: input.endDate,
      days: input.days,
      status: "submitted",
      reason: input.reason || null
    });
    return { success: true, leaveRecordId: result[0].insertId };
  }),
  /**
   * Delete leave record — only if status is 'submitted'
   */
  delete: portalHrProcedure.input(z28.object({ id: z28.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError24({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const records = await db.select({ id: leaveRecords.id, status: leaveRecords.status }).from(leaveRecords).innerJoin(employees, eq26(leaveRecords.employeeId, employees.id)).where(and20(eq26(leaveRecords.id, input.id), eq26(employees.customerId, cid)));
    if (records.length === 0) {
      throw new TRPCError24({ code: "NOT_FOUND", message: "Leave record not found" });
    }
    if (records[0].status !== "submitted") {
      throw new TRPCError24({ code: "FORBIDDEN", message: "Leave record is locked and cannot be deleted" });
    }
    await db.delete(leaveRecords).where(eq26(leaveRecords.id, input.id));
    return { success: true };
  }),
  /**
   * Client approve leave record — HR manager / admin approves a submitted leave
   */
  approve: portalHrProcedure.input(z28.object({ id: z28.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError24({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const records = await db.select({ id: leaveRecords.id, status: leaveRecords.status }).from(leaveRecords).innerJoin(employees, eq26(leaveRecords.employeeId, employees.id)).where(and20(eq26(leaveRecords.id, input.id), eq26(employees.customerId, cid)));
    if (records.length === 0) {
      throw new TRPCError24({ code: "NOT_FOUND", message: "Leave record not found" });
    }
    if (records[0].status !== "submitted") {
      throw new TRPCError24({ code: "FORBIDDEN", message: "Only submitted leave records can be approved" });
    }
    await db.update(leaveRecords).set({
      status: "client_approved",
      clientApprovedBy: ctx.portalUser.contactId,
      clientApprovedAt: /* @__PURE__ */ new Date()
    }).where(eq26(leaveRecords.id, input.id));
    return { success: true };
  }),
  /**
   * Client reject leave record
   */
  reject: portalHrProcedure.input(z28.object({
    id: z28.number(),
    reason: z28.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError24({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const records = await db.select({ id: leaveRecords.id, status: leaveRecords.status }).from(leaveRecords).innerJoin(employees, eq26(leaveRecords.employeeId, employees.id)).where(and20(eq26(leaveRecords.id, input.id), eq26(employees.customerId, cid)));
    if (records.length === 0) {
      throw new TRPCError24({ code: "NOT_FOUND", message: "Leave record not found" });
    }
    if (records[0].status !== "submitted") {
      throw new TRPCError24({ code: "FORBIDDEN", message: "Only submitted leave records can be rejected" });
    }
    await db.update(leaveRecords).set({
      status: "client_rejected",
      clientApprovedBy: ctx.portalUser.contactId,
      clientApprovedAt: /* @__PURE__ */ new Date(),
      clientRejectionReason: input.reason || null
    }).where(eq26(leaveRecords.id, input.id));
    return { success: true };
  }),
  /**
   * Get public holidays for countries where this customer has active employees
   */
  publicHolidays: protectedPortalProcedure.input(z28.object({ year: z28.number().default(2026) })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const activeCountries = await db.select({ country: employees.country }).from(employees).where(and20(eq26(employees.customerId, cid), eq26(employees.status, "active"))).groupBy(employees.country);
    if (activeCountries.length === 0) return [];
    const countryCodes = activeCountries.map((c) => c.country);
    const holidays = await db.select().from(publicHolidays).where(
      and20(
        sql14`${publicHolidays.countryCode} IN (${sql14.join(countryCodes.map((c) => sql14`${c}`), sql14`, `)})`,
        eq26(publicHolidays.year, input.year)
      )
    ).orderBy(publicHolidays.holidayDate);
    return holidays;
  })
});

// server/portal/routers/portalInvoicesRouter.ts
import { z as z29 } from "zod";
import { TRPCError as TRPCError25 } from "@trpc/server";
import { sql as sql15, eq as eq27, and as and21, count as count7, inArray as inArray7 } from "drizzle-orm";
init_db();
init_schema();
var PORTAL_INVOICE_FIELDS = {
  id: invoices.id,
  invoiceNumber: invoices.invoiceNumber,
  invoiceType: invoices.invoiceType,
  invoiceMonth: invoices.invoiceMonth,
  currency: invoices.currency,
  subtotal: invoices.subtotal,
  serviceFeeTotal: invoices.serviceFeeTotal,
  tax: invoices.tax,
  total: invoices.total,
  status: invoices.status,
  dueDate: invoices.dueDate,
  sentDate: invoices.sentDate,
  paidDate: invoices.paidDate,
  paidAmount: invoices.paidAmount,
  creditApplied: invoices.creditApplied,
  amountDue: invoices.amountDue,
  relatedInvoiceId: invoices.relatedInvoiceId,
  notes: invoices.notes,
  // Client-facing notes only
  // internalNotes is NOT included — admin-only field
  createdAt: invoices.createdAt,
  updatedAt: invoices.updatedAt
};
var VISIBLE_FILTER = sql15`${invoices.status} NOT IN ('draft', 'pending_review')`;
var ACTIVE_FILTER = sql15`${invoices.status} NOT IN ('draft', 'pending_review', 'cancelled', 'void')`;
var portalInvoicesRouter = portalRouter({
  /**
   * List invoices — scoped to customerId
   * Supports filtering by status, type category, and invoice month
   * tab: "active" (default) shows non-cancelled/void; "history" shows paid/applied/cancelled/void
   */
  list: protectedPortalProcedure.input(
    z29.object({
      page: z29.number().min(1).default(1),
      pageSize: z29.number().min(1).max(100).default(20),
      status: z29.string().optional(),
      invoiceMonth: z29.string().optional(),
      tab: z29.enum(["active", "history"]).default("active"),
      typeCategory: z29.enum(["all", "receivables", "credits", "deposits"]).default("all")
    })
  ).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return { items: [], total: 0 };
    const cid = ctx.portalUser.customerId;
    const conditions = [
      eq27(invoices.customerId, cid),
      VISIBLE_FILTER
    ];
    if (input.tab === "active") {
      conditions.push(sql15`${invoices.status} NOT IN ('cancelled', 'void')`);
    } else {
      conditions.push(sql15`${invoices.status} IN ('paid', 'applied', 'cancelled', 'void')`);
    }
    if (input.status) {
      conditions.push(eq27(invoices.status, input.status));
    }
    if (input.typeCategory === "receivables") {
      conditions.push(sql15`${invoices.invoiceType} IN ('monthly_eor', 'monthly_visa_eor', 'monthly_aor', 'visa_service', 'manual')`);
    } else if (input.typeCategory === "credits") {
      conditions.push(eq27(invoices.invoiceType, "credit_note"));
    } else if (input.typeCategory === "deposits") {
      conditions.push(sql15`${invoices.invoiceType} IN ('deposit', 'deposit_refund')`);
    }
    if (input.invoiceMonth) {
      conditions.push(eq27(invoices.invoiceMonth, input.invoiceMonth));
    }
    const where = and21(...conditions);
    const [totalResult] = await db.select({ count: count7() }).from(invoices).where(where);
    const items = await db.select(PORTAL_INVOICE_FIELDS).from(invoices).where(where).orderBy(sql15`${invoices.createdAt} DESC`).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    const creditNoteIds = items.filter((inv) => inv.invoiceType === "credit_note").map((inv) => inv.id);
    let creditNoteBalances = {};
    if (creditNoteIds.length > 0) {
      const applications = await db.select({
        creditNoteId: creditNoteApplications.creditNoteId,
        totalApplied: sql15`COALESCE(SUM(${creditNoteApplications.appliedAmount}), 0)`
      }).from(creditNoteApplications).where(inArray7(creditNoteApplications.creditNoteId, creditNoteIds)).groupBy(creditNoteApplications.creditNoteId);
      for (const app of applications) {
        creditNoteBalances[app.creditNoteId] = Number(app.totalApplied);
      }
    }
    const itemIds = items.map((inv) => inv.id);
    let relatedInvoicesMap = {};
    if (itemIds.length > 0) {
      const relatedInvs = await db.select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        invoiceType: invoices.invoiceType,
        total: invoices.total,
        status: invoices.status,
        relatedInvoiceId: invoices.relatedInvoiceId
      }).from(invoices).where(
        and21(
          eq27(invoices.customerId, cid),
          VISIBLE_FILTER,
          inArray7(invoices.relatedInvoiceId, itemIds)
        )
      );
      for (const rel of relatedInvs) {
        const parentId = rel.relatedInvoiceId;
        if (!relatedInvoicesMap[parentId]) relatedInvoicesMap[parentId] = [];
        relatedInvoicesMap[parentId].push({
          id: rel.id,
          invoiceNumber: rel.invoiceNumber,
          invoiceType: rel.invoiceType,
          total: String(rel.total),
          status: rel.status
        });
      }
    }
    const enrichedItems = items.map((inv) => {
      const total = Number(inv.total);
      const paidAmount = inv.paidAmount != null ? Number(inv.paidAmount) : 0;
      const creditApplied = inv.creditApplied != null ? Number(inv.creditApplied) : 0;
      const amountDue = inv.amountDue != null ? Number(inv.amountDue) : total;
      let balanceDue = 0;
      if (inv.invoiceType === "credit_note") {
        const totalApplied = creditNoteBalances[inv.id] || 0;
        balanceDue = Math.abs(total) - totalApplied;
      } else if (inv.invoiceType === "deposit_refund") {
        balanceDue = 0;
      } else if (inv.status === "paid") {
        const followUps = relatedInvoicesMap[inv.id] || [];
        const hasFollowUp = followUps.some((f) => f.invoiceType === "manual" || f.invoiceType === "monthly_eor");
        if (hasFollowUp) {
          balanceDue = 0;
        } else {
          balanceDue = 0;
        }
      } else if (inv.status === "cancelled" || inv.status === "void") {
        balanceDue = 0;
      } else {
        balanceDue = Math.max(0, amountDue - paidAmount);
      }
      let displayStatus = inv.status;
      let isPartiallyPaid = false;
      let isOverpaid = false;
      if (inv.status === "paid") {
        const followUps = relatedInvoicesMap[inv.id] || [];
        const hasUnderpaymentFollowUp = followUps.some(
          (f) => f.invoiceType === "manual" && Number(f.total) > 0
        );
        const hasOverpaymentCN = followUps.some(
          (f) => f.invoiceType === "credit_note"
        );
        if (hasUnderpaymentFollowUp) {
          isPartiallyPaid = true;
        }
        if (hasOverpaymentCN) {
          isOverpaid = true;
        }
      }
      let creditNoteRemaining = 0;
      let creditNoteTotalApplied = 0;
      if (inv.invoiceType === "credit_note") {
        creditNoteTotalApplied = creditNoteBalances[inv.id] || 0;
        creditNoteRemaining = Math.abs(total) - creditNoteTotalApplied;
      }
      return {
        ...inv,
        balanceDue,
        displayStatus,
        isPartiallyPaid,
        isOverpaid,
        creditNoteRemaining: inv.invoiceType === "credit_note" ? creditNoteRemaining : void 0,
        creditNoteTotalApplied: inv.invoiceType === "credit_note" ? creditNoteTotalApplied : void 0,
        relatedDocuments: relatedInvoicesMap[inv.id] || []
      };
    });
    return {
      items: enrichedItems,
      total: totalResult?.count ?? 0
    };
  }),
  /**
   * Get invoice detail with line items, credit applications, and related documents
   */
  detail: protectedPortalProcedure.input(z29.object({ id: z29.number() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError25({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [invoice] = await db.select(PORTAL_INVOICE_FIELDS).from(invoices).where(
      and21(
        eq27(invoices.id, input.id),
        eq27(invoices.customerId, cid),
        VISIBLE_FILTER
      )
    );
    if (!invoice) {
      throw new TRPCError25({ code: "NOT_FOUND", message: "Invoice not found" });
    }
    const items = await db.select({
      id: invoiceItems.id,
      description: invoiceItems.description,
      quantity: invoiceItems.quantity,
      unitPrice: invoiceItems.unitPrice,
      amount: invoiceItems.amount,
      itemType: invoiceItems.itemType,
      vatRate: invoiceItems.vatRate,
      countryCode: invoiceItems.countryCode,
      localCurrency: invoiceItems.localCurrency,
      localAmount: invoiceItems.localAmount,
      exchangeRate: invoiceItems.exchangeRate
      // exchangeRateWithMarkup is NOT included — admin-only field
    }).from(invoiceItems).where(eq27(invoiceItems.invoiceId, input.id));
    const creditApplicationsToThis = await db.select({
      id: creditNoteApplications.id,
      creditNoteId: creditNoteApplications.creditNoteId,
      appliedAmount: creditNoteApplications.appliedAmount,
      notes: creditNoteApplications.notes,
      appliedAt: creditNoteApplications.appliedAt
    }).from(creditNoteApplications).where(eq27(creditNoteApplications.appliedToInvoiceId, input.id));
    let creditNoteDetails = [];
    if (creditApplicationsToThis.length > 0) {
      const cnIds = creditApplicationsToThis.map((ca) => ca.creditNoteId);
      creditNoteDetails = await db.select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        total: invoices.total,
        status: invoices.status
      }).from(invoices).where(
        and21(
          inArray7(invoices.id, cnIds),
          eq27(invoices.customerId, cid)
        )
      );
    }
    let creditApplicationsFromThis = [];
    if (invoice.invoiceType === "credit_note") {
      const apps = await db.select({
        id: creditNoteApplications.id,
        appliedToInvoiceId: creditNoteApplications.appliedToInvoiceId,
        appliedAmount: creditNoteApplications.appliedAmount,
        notes: creditNoteApplications.notes,
        appliedAt: creditNoteApplications.appliedAt
      }).from(creditNoteApplications).where(eq27(creditNoteApplications.creditNoteId, input.id));
      if (apps.length > 0) {
        const appliedToIds = apps.map((a) => a.appliedToInvoiceId);
        const appliedToInvoices = await db.select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          invoiceType: invoices.invoiceType,
          total: invoices.total,
          status: invoices.status
        }).from(invoices).where(
          and21(
            inArray7(invoices.id, appliedToIds),
            eq27(invoices.customerId, cid)
          )
        );
        creditApplicationsFromThis = apps.map((a) => ({
          ...a,
          invoiceNumber: appliedToInvoices.find((inv) => inv.id === a.appliedToInvoiceId)?.invoiceNumber || `INV-${a.appliedToInvoiceId}`,
          invoiceType: appliedToInvoices.find((inv) => inv.id === a.appliedToInvoiceId)?.invoiceType || "unknown"
        }));
      }
    }
    const childDocuments = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      invoiceType: invoices.invoiceType,
      total: invoices.total,
      status: invoices.status,
      createdAt: invoices.createdAt
    }).from(invoices).where(
      and21(
        eq27(invoices.relatedInvoiceId, input.id),
        eq27(invoices.customerId, cid),
        VISIBLE_FILTER
      )
    );
    let parentDocument = null;
    if (invoice.relatedInvoiceId) {
      const [parent] = await db.select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        invoiceType: invoices.invoiceType,
        total: invoices.total,
        status: invoices.status
      }).from(invoices).where(
        and21(
          eq27(invoices.id, invoice.relatedInvoiceId),
          eq27(invoices.customerId, cid)
        )
      );
      parentDocument = parent || null;
    }
    let creditNoteBalance = null;
    if (invoice.invoiceType === "credit_note") {
      const [totalAppliedResult] = await db.select({
        total: sql15`COALESCE(SUM(${creditNoteApplications.appliedAmount}), 0)`
      }).from(creditNoteApplications).where(eq27(creditNoteApplications.creditNoteId, input.id));
      const original = Math.abs(Number(invoice.total));
      const applied = Number(totalAppliedResult?.total || 0);
      creditNoteBalance = {
        original,
        applied,
        remaining: Math.max(0, original - applied)
      };
    }
    const total = Number(invoice.total);
    const paidAmount = invoice.paidAmount != null ? Number(invoice.paidAmount) : 0;
    const amountDue = invoice.amountDue != null ? Number(invoice.amountDue) : total;
    let isPartiallyPaid = false;
    let isOverpaid = false;
    if (invoice.status === "paid") {
      const hasUnderpaymentFollowUp = childDocuments.some(
        (d) => d.invoiceType === "manual" && Number(d.total) > 0
      );
      const hasOverpaymentCN = childDocuments.some(
        (d) => d.invoiceType === "credit_note"
      );
      if (hasUnderpaymentFollowUp) isPartiallyPaid = true;
      if (hasOverpaymentCN) isOverpaid = true;
    }
    let balanceDue = 0;
    if (invoice.invoiceType === "credit_note") {
      balanceDue = creditNoteBalance?.remaining ?? 0;
    } else if (invoice.invoiceType === "deposit_refund") {
      balanceDue = 0;
    } else if (invoice.status === "paid") {
      balanceDue = 0;
    } else if (invoice.status === "cancelled" || invoice.status === "void") {
      balanceDue = 0;
    } else {
      balanceDue = Math.max(0, amountDue - paidAmount);
    }
    return {
      ...invoice,
      items,
      // Credits applied TO this invoice
      creditApplications: creditApplicationsToThis.map((ca) => ({
        ...ca,
        creditNoteNumber: creditNoteDetails.find((cn) => cn.id === ca.creditNoteId)?.invoiceNumber || `CN-${ca.creditNoteId}`,
        creditNoteStatus: creditNoteDetails.find((cn) => cn.id === ca.creditNoteId)?.status || "unknown"
      })),
      // If this is a credit note: where it was applied
      creditApplicationsFrom: creditApplicationsFromThis,
      // Credit note balance (only for credit notes)
      creditNoteBalance,
      // Related documents (bidirectional)
      relatedDocuments: {
        parent: parentDocument,
        children: childDocuments.map((d) => ({
          id: d.id,
          invoiceNumber: d.invoiceNumber,
          invoiceType: d.invoiceType,
          total: String(d.total),
          status: d.status
        }))
      },
      // Computed display fields
      isPartiallyPaid,
      isOverpaid,
      balanceDue
    };
  }),
  /**
   * Account summary — overview of all financial activity
   */
  accountSummary: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalInvoiced: 0, totalPaid: 0, totalCreditNotes: 0, totalDeposits: 0, outstandingBalance: 0 };
    const cid = ctx.portalUser.customerId;
    const [invoiced] = await db.select({ total: sql15`COALESCE(SUM(${invoices.total}), 0)` }).from(invoices).where(
      and21(
        eq27(invoices.customerId, cid),
        sql15`${invoices.invoiceType} IN ('monthly_eor', 'monthly_visa_eor', 'monthly_aor', 'visa_service', 'manual')`,
        ACTIVE_FILTER
      )
    );
    const [paid] = await db.select({ total: sql15`COALESCE(SUM(${invoices.paidAmount}), 0)` }).from(invoices).where(
      and21(
        eq27(invoices.customerId, cid),
        eq27(invoices.status, "paid")
      )
    );
    const [credits] = await db.select({ total: sql15`COALESCE(SUM(ABS(${invoices.total})), 0)` }).from(invoices).where(
      and21(
        eq27(invoices.customerId, cid),
        eq27(invoices.invoiceType, "credit_note"),
        ACTIVE_FILTER
      )
    );
    const [creditApplied] = await db.select({ total: sql15`COALESCE(SUM(cna.appliedAmount), 0)` }).from(sql15`credit_note_applications cna`).where(
      sql15`cna.creditNoteId IN (SELECT id FROM invoices WHERE customerId = ${cid} AND invoiceType = 'credit_note')`
    );
    const [depositsGross] = await db.select({ total: sql15`COALESCE(SUM(${invoices.total}), 0)` }).from(invoices).where(
      and21(
        eq27(invoices.customerId, cid),
        eq27(invoices.invoiceType, "deposit"),
        ACTIVE_FILTER
      )
    );
    const [depositCreditNotes] = await db.select({ total: sql15`COALESCE(SUM(ABS(${invoices.total})), 0)` }).from(invoices).where(
      and21(
        eq27(invoices.customerId, cid),
        eq27(invoices.invoiceType, "credit_note"),
        ACTIVE_FILTER,
        sql15`${invoices.relatedInvoiceId} IN (SELECT id FROM invoices WHERE customerId = ${cid} AND invoiceType = 'deposit')`
      )
    );
    const [depositRefunds] = await db.select({ total: sql15`COALESCE(SUM(ABS(${invoices.total})), 0)` }).from(invoices).where(
      and21(
        eq27(invoices.customerId, cid),
        eq27(invoices.invoiceType, "deposit_refund"),
        ACTIVE_FILTER
      )
    );
    const netDeposits = Math.max(
      0,
      Number(depositsGross?.total || 0) - Number(depositCreditNotes?.total || 0) - Number(depositRefunds?.total || 0)
    );
    const [outstanding] = await db.select({ total: sql15`COALESCE(SUM(COALESCE(${invoices.amountDue}, ${invoices.total})), 0)` }).from(invoices).where(
      and21(
        eq27(invoices.customerId, cid),
        sql15`${invoices.status} IN ('sent', 'overdue')`,
        sql15`${invoices.invoiceType} NOT IN ('credit_note', 'deposit_refund')`
      )
    );
    const totalCreditIssued = Number(credits?.total || 0);
    const totalCreditUsed = Number(creditApplied?.total || 0);
    const creditBalance = Math.max(0, totalCreditIssued - totalCreditUsed);
    return {
      totalInvoiced: Number(invoiced?.total || 0),
      totalPaid: Number(paid?.total || 0),
      totalCreditNotes: totalCreditIssued,
      creditBalance,
      totalDeposits: netDeposits,
      outstandingBalance: Number(outstanding?.total || 0)
    };
  })
});

// server/portal/routers/portalSettingsRouter.ts
import { z as z30 } from "zod";
import { TRPCError as TRPCError26 } from "@trpc/server";
import { eq as eq28, and as and22 } from "drizzle-orm";
init_db();
init_schema();
init_portalAuth();
var portalSettingsRouter = portalRouter({
  /**
   * Get company profile — scoped to customerId
   */
  companyProfile: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const cid = ctx.portalUser.customerId;
    const [company] = await db.select({
      id: customers.id,
      companyName: customers.companyName,
      legalEntityName: customers.legalEntityName,
      registrationNumber: customers.registrationNumber,
      industry: customers.industry,
      address: customers.address,
      city: customers.city,
      state: customers.state,
      country: customers.country,
      postalCode: customers.postalCode,
      primaryContactName: customers.primaryContactName,
      primaryContactEmail: customers.primaryContactEmail,
      primaryContactPhone: customers.primaryContactPhone,
      settlementCurrency: customers.settlementCurrency,
      language: customers.language
      // Exclude: internalNotes, pricing info, markup data, depositMultiplier
    }).from(customers).where(eq28(customers.id, cid));
    return company || null;
  }),
  /**
   * Update company profile — admin only
   * Legal entity name and settlement currency are NOT editable by client
   */
  updateCompanyProfile: portalAdminProcedure.input(
    z30.object({
      companyName: z30.string().min(1).optional(),
      registrationNumber: z30.string().optional().nullable(),
      industry: z30.string().optional().nullable(),
      address: z30.string().optional().nullable(),
      city: z30.string().optional().nullable(),
      state: z30.string().optional().nullable(),
      country: z30.string().optional(),
      postalCode: z30.string().optional().nullable(),
      primaryContactName: z30.string().optional().nullable(),
      primaryContactEmail: z30.string().email().optional().nullable(),
      primaryContactPhone: z30.string().optional().nullable(),
      language: z30.enum(["en", "zh"]).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError26({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const updateData = {};
    if (input.companyName !== void 0) updateData.companyName = input.companyName;
    if (input.registrationNumber !== void 0) updateData.registrationNumber = input.registrationNumber;
    if (input.industry !== void 0) updateData.industry = input.industry;
    if (input.address !== void 0) updateData.address = input.address;
    if (input.city !== void 0) updateData.city = input.city;
    if (input.state !== void 0) updateData.state = input.state;
    if (input.country !== void 0) updateData.country = input.country;
    if (input.postalCode !== void 0) updateData.postalCode = input.postalCode;
    if (input.primaryContactName !== void 0) updateData.primaryContactName = input.primaryContactName;
    if (input.primaryContactEmail !== void 0) updateData.primaryContactEmail = input.primaryContactEmail;
    if (input.primaryContactPhone !== void 0) updateData.primaryContactPhone = input.primaryContactPhone;
    if (input.language !== void 0) updateData.language = input.language;
    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }
    await db.update(customers).set(updateData).where(eq28(customers.id, cid));
    return { success: true };
  }),
  /**
   * Get leave policies for this customer — per country
   */
  leavePolicies: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const policies = await db.select({
      id: customerLeavePolicies.id,
      countryCode: customerLeavePolicies.countryCode,
      leaveTypeId: customerLeavePolicies.leaveTypeId,
      annualEntitlement: customerLeavePolicies.annualEntitlement,
      expiryRule: customerLeavePolicies.expiryRule,
      carryOverDays: customerLeavePolicies.carryOverDays,
      leaveTypeName: leaveTypes.leaveTypeName,
      countryName: countriesConfig.countryName,
      statutoryMinimum: leaveTypes.annualEntitlement
    }).from(customerLeavePolicies).leftJoin(leaveTypes, eq28(customerLeavePolicies.leaveTypeId, leaveTypes.id)).leftJoin(countriesConfig, eq28(customerLeavePolicies.countryCode, countriesConfig.countryCode)).where(eq28(customerLeavePolicies.customerId, cid));
    return policies;
  }),
  /**
   * Update leave policy — admin only
   */
  updateLeavePolicy: portalAdminProcedure.input(
    z30.object({
      id: z30.number(),
      annualEntitlement: z30.number().min(0),
      expiryRule: z30.enum(["year_end", "anniversary", "no_expiry"]),
      carryOverDays: z30.number().min(0)
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError26({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [policy] = await db.select({ id: customerLeavePolicies.id, leaveTypeId: customerLeavePolicies.leaveTypeId }).from(customerLeavePolicies).where(and22(eq28(customerLeavePolicies.id, input.id), eq28(customerLeavePolicies.customerId, cid)));
    if (!policy) {
      throw new TRPCError26({ code: "NOT_FOUND", message: "Leave policy not found" });
    }
    const [leaveType] = await db.select({ annualEntitlement: leaveTypes.annualEntitlement }).from(leaveTypes).where(eq28(leaveTypes.id, policy.leaveTypeId));
    if (leaveType && leaveType.annualEntitlement && input.annualEntitlement < leaveType.annualEntitlement) {
      throw new TRPCError26({
        code: "BAD_REQUEST",
        message: `Annual entitlement cannot be less than statutory minimum (${leaveType.annualEntitlement} days)`
      });
    }
    await db.update(customerLeavePolicies).set({
      annualEntitlement: input.annualEntitlement,
      expiryRule: input.expiryRule,
      carryOverDays: input.carryOverDays
    }).where(eq28(customerLeavePolicies.id, input.id));
    return { success: true };
  }),
  // ============================================================================
  // User Management (Portal Admin only)
  // ============================================================================
  /**
   * List portal users for this customer
   */
  listUsers: portalAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const users2 = await db.select({
      id: customerContacts.id,
      contactName: customerContacts.contactName,
      email: customerContacts.email,
      phone: customerContacts.phone,
      role: customerContacts.role,
      portalRole: customerContacts.portalRole,
      hasPortalAccess: customerContacts.hasPortalAccess,
      isPortalActive: customerContacts.isPortalActive,
      lastLoginAt: customerContacts.lastLoginAt,
      isPrimary: customerContacts.isPrimary
      // passwordHash is NOT included
    }).from(customerContacts).where(eq28(customerContacts.customerId, cid)).orderBy(customerContacts.contactName);
    return users2;
  }),
  /**
   * Invite a new portal user
   */
  inviteUser: portalAdminProcedure.input(
    z30.object({
      contactName: z30.string().min(1),
      email: z30.string().email(),
      phone: z30.string().optional(),
      role: z30.string().optional(),
      // Business role
      portalRole: z30.enum(["admin", "hr_manager", "finance", "viewer"]).default("viewer")
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError26({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const existing = await db.select({ id: customerContacts.id }).from(customerContacts).where(eq28(customerContacts.email, input.email.toLowerCase().trim()));
    if (existing.length > 0) {
      throw new TRPCError26({ code: "CONFLICT", message: "A user with this email already exists" });
    }
    const inviteToken = generateInviteToken2();
    const inviteExpiresAt = getInviteExpiryDate2();
    await db.insert(customerContacts).values({
      customerId: cid,
      // ALWAYS from context
      contactName: input.contactName,
      email: input.email.toLowerCase().trim(),
      phone: input.phone || null,
      role: input.role || null,
      portalRole: input.portalRole,
      hasPortalAccess: true,
      isPortalActive: false,
      // Activated when they set password
      inviteToken,
      inviteExpiresAt
    });
    return {
      success: true,
      inviteToken,
      inviteExpiresAt: inviteExpiresAt.toISOString()
    };
  }),
  /**
   * Update a portal user's role
   */
  updateUserRole: portalAdminProcedure.input(
    z30.object({
      contactId: z30.number(),
      portalRole: z30.enum(["admin", "hr_manager", "finance", "viewer"])
    })
  ).mutation(async ({ input, ctx }) => {
    if (input.contactId === ctx.portalUser.contactId) {
      throw new TRPCError26({ code: "BAD_REQUEST", message: "Cannot change your own role" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError26({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [contact] = await db.select({ id: customerContacts.id }).from(customerContacts).where(and22(eq28(customerContacts.id, input.contactId), eq28(customerContacts.customerId, cid)));
    if (!contact) {
      throw new TRPCError26({ code: "NOT_FOUND", message: "User not found" });
    }
    await db.update(customerContacts).set({ portalRole: input.portalRole }).where(eq28(customerContacts.id, input.contactId));
    return { success: true };
  }),
  /**
   * Deactivate a portal user
   */
  deactivateUser: portalAdminProcedure.input(z30.object({ contactId: z30.number() })).mutation(async ({ input, ctx }) => {
    if (input.contactId === ctx.portalUser.contactId) {
      throw new TRPCError26({ code: "BAD_REQUEST", message: "Cannot deactivate your own account" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError26({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [contact] = await db.select({ id: customerContacts.id }).from(customerContacts).where(and22(eq28(customerContacts.id, input.contactId), eq28(customerContacts.customerId, cid)));
    if (!contact) {
      throw new TRPCError26({ code: "NOT_FOUND", message: "User not found" });
    }
    await db.update(customerContacts).set({ hasPortalAccess: false, isPortalActive: false }).where(eq28(customerContacts.id, input.contactId));
    return { success: true };
  }),
  /**
   * Resend invite to a user who hasn't activated yet
   */
  resendInvite: portalAdminProcedure.input(z30.object({ contactId: z30.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError26({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [contact] = await db.select({ id: customerContacts.id, isPortalActive: customerContacts.isPortalActive }).from(customerContacts).where(and22(eq28(customerContacts.id, input.contactId), eq28(customerContacts.customerId, cid)));
    if (!contact) {
      throw new TRPCError26({ code: "NOT_FOUND", message: "User not found" });
    }
    if (contact.isPortalActive) {
      throw new TRPCError26({ code: "BAD_REQUEST", message: "User is already activated" });
    }
    const inviteToken = generateInviteToken2();
    const inviteExpiresAt = getInviteExpiryDate2();
    await db.update(customerContacts).set({ inviteToken, inviteExpiresAt }).where(eq28(customerContacts.id, input.contactId));
    return {
      success: true,
      inviteToken,
      inviteExpiresAt: inviteExpiresAt.toISOString()
    };
  }),
  /**
   * Get countries where this customer has employees (for leave policy setup)
   */
  activeCountries: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const countries = await db.select({
      country: employees.country,
      countryName: countriesConfig.countryName
    }).from(employees).leftJoin(countriesConfig, eq28(employees.country, countriesConfig.countryCode)).where(eq28(employees.customerId, cid)).groupBy(employees.country, countriesConfig.countryName);
    return countries;
  })
});

// server/portal/routers/portalPayrollRouter.ts
import { z as z31 } from "zod";
import { TRPCError as TRPCError27 } from "@trpc/server";
import { sql as sql17, eq as eq29, and as and23, count as count9, inArray as inArray8 } from "drizzle-orm";
init_db();
init_schema();
var portalPayrollRouter = portalRouter({
  /**
   * List payroll runs that include the customer's employees
   * Only shows approved payroll runs
   */
  list: protectedPortalProcedure.input(
    z31.object({
      page: z31.number().min(1).default(1),
      pageSize: z31.number().min(1).max(100).default(20),
      year: z31.number().optional()
    })
  ).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return { items: [], total: 0 };
    const cid = ctx.portalUser.customerId;
    const subquery = db.select({ payrollRunId: payrollItems.payrollRunId }).from(payrollItems).innerJoin(employees, eq29(payrollItems.employeeId, employees.id)).where(eq29(employees.customerId, cid)).groupBy(payrollItems.payrollRunId);
    const runIds = (await subquery).map((r) => r.payrollRunId);
    if (runIds.length === 0) return { items: [], total: 0 };
    const conditions = [
      inArray8(payrollRuns.id, runIds),
      eq29(payrollRuns.status, "approved")
    ];
    if (input.year) {
      conditions.push(
        sql17`YEAR(${payrollRuns.payrollMonth}) = ${input.year}`
      );
    }
    const where = and23(...conditions);
    const [totalResult] = await db.select({ count: count9() }).from(payrollRuns).where(where);
    const runs = await db.select({
      id: payrollRuns.id,
      countryCode: payrollRuns.countryCode,
      payrollMonth: payrollRuns.payrollMonth,
      currency: payrollRuns.currency,
      status: payrollRuns.status,
      totalGross: payrollRuns.totalGross,
      totalDeductions: payrollRuns.totalDeductions,
      totalNet: payrollRuns.totalNet,
      approvedAt: payrollRuns.approvedAt,
      notes: payrollRuns.notes
    }).from(payrollRuns).where(where).orderBy(sql17`${payrollRuns.payrollMonth} DESC`).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    const enrichedRuns = await Promise.all(
      runs.map(async (run) => {
        const [empCount] = await db.select({ count: count9() }).from(payrollItems).innerJoin(employees, eq29(payrollItems.employeeId, employees.id)).where(
          and23(
            eq29(payrollItems.payrollRunId, run.id),
            eq29(employees.customerId, cid)
          )
        );
        const [customerTotals] = await db.select({
          totalGross: sql17`COALESCE(SUM(${payrollItems.gross}), 0)`,
          totalNet: sql17`COALESCE(SUM(${payrollItems.net}), 0)`,
          totalDeductions: sql17`COALESCE(SUM(${payrollItems.deductions} + ${payrollItems.taxDeduction} + ${payrollItems.socialSecurityDeduction} + ${payrollItems.unpaidLeaveDeduction}), 0)`,
          totalEmployerCost: sql17`COALESCE(SUM(${payrollItems.totalEmploymentCost}), 0)`
        }).from(payrollItems).innerJoin(employees, eq29(payrollItems.employeeId, employees.id)).where(
          and23(
            eq29(payrollItems.payrollRunId, run.id),
            eq29(employees.customerId, cid)
          )
        );
        return {
          ...run,
          employeeCount: empCount?.count ?? 0,
          customerTotalGross: customerTotals?.totalGross ?? "0",
          customerTotalNet: customerTotals?.totalNet ?? "0",
          customerTotalDeductions: customerTotals?.totalDeductions ?? "0",
          customerTotalEmployerCost: customerTotals?.totalEmployerCost ?? "0"
        };
      })
    );
    return {
      items: enrichedRuns,
      total: totalResult?.count ?? 0
    };
  }),
  /**
   * Get payroll run detail with employee-level breakdown
   * Only shows this customer's employees
   */
  detail: protectedPortalProcedure.input(z31.object({ id: z31.number() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError27({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [run] = await db.select({
      id: payrollRuns.id,
      countryCode: payrollRuns.countryCode,
      payrollMonth: payrollRuns.payrollMonth,
      currency: payrollRuns.currency,
      status: payrollRuns.status,
      approvedAt: payrollRuns.approvedAt,
      notes: payrollRuns.notes
    }).from(payrollRuns).where(
      and23(
        eq29(payrollRuns.id, input.id),
        eq29(payrollRuns.status, "approved")
      )
    );
    if (!run) {
      throw new TRPCError27({ code: "NOT_FOUND", message: "Payroll run not found" });
    }
    const items = await db.select({
      id: payrollItems.id,
      employeeId: payrollItems.employeeId,
      employeeName: sql17`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      employeeCode: employees.employeeCode,
      jobTitle: employees.jobTitle,
      baseSalary: payrollItems.baseSalary,
      bonus: payrollItems.bonus,
      allowances: payrollItems.allowances,
      reimbursements: payrollItems.reimbursements,
      deductions: payrollItems.deductions,
      taxDeduction: payrollItems.taxDeduction,
      socialSecurityDeduction: payrollItems.socialSecurityDeduction,
      unpaidLeaveDeduction: payrollItems.unpaidLeaveDeduction,
      unpaidLeaveDays: payrollItems.unpaidLeaveDays,
      gross: payrollItems.gross,
      net: payrollItems.net,
      employerSocialContribution: payrollItems.employerSocialContribution,
      totalEmploymentCost: payrollItems.totalEmploymentCost,
      currency: payrollItems.currency,
      notes: payrollItems.notes
    }).from(payrollItems).innerJoin(employees, eq29(payrollItems.employeeId, employees.id)).where(
      and23(
        eq29(payrollItems.payrollRunId, input.id),
        eq29(employees.customerId, cid)
      )
    );
    if (items.length === 0) {
      throw new TRPCError27({ code: "NOT_FOUND", message: "No payroll data found for your employees" });
    }
    return {
      ...run,
      items
    };
  })
});

// server/portal/routers/portalReimbursementsRouter.ts
import { z as z32 } from "zod";
import { TRPCError as TRPCError28 } from "@trpc/server";
import { sql as sql18, eq as eq30, and as and24, count as count10 } from "drizzle-orm";
init_db();
init_schema();
var portalReimbursementsRouter = portalRouter({
  /**
   * List reimbursements — scoped to customerId
   */
  list: protectedPortalProcedure.input(
    z32.object({
      page: z32.number().min(1).default(1),
      pageSize: z32.number().min(1).max(100).default(20),
      status: z32.string().optional(),
      effectiveMonth: z32.string().optional(),
      employeeId: z32.number().optional()
    })
  ).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return { items: [], total: 0 };
    const cid = ctx.portalUser.customerId;
    const conditions = [eq30(reimbursements.customerId, cid)];
    if (input.status) {
      conditions.push(eq30(reimbursements.status, input.status));
    }
    if (input.effectiveMonth) {
      conditions.push(eq30(reimbursements.effectiveMonth, input.effectiveMonth));
    }
    if (input.employeeId) {
      conditions.push(eq30(reimbursements.employeeId, input.employeeId));
    }
    const where = and24(...conditions);
    const [totalResult] = await db.select({ count: count10() }).from(reimbursements).where(where);
    const items = await db.select({
      id: reimbursements.id,
      employeeId: reimbursements.employeeId,
      category: reimbursements.category,
      amount: reimbursements.amount,
      currency: reimbursements.currency,
      effectiveMonth: reimbursements.effectiveMonth,
      description: reimbursements.description,
      status: reimbursements.status,
      receiptFileUrl: reimbursements.receiptFileUrl,
      clientApprovedBy: reimbursements.clientApprovedBy,
      clientApprovedAt: reimbursements.clientApprovedAt,
      clientRejectionReason: reimbursements.clientRejectionReason,
      adminApprovedBy: reimbursements.adminApprovedBy,
      adminApprovedAt: reimbursements.adminApprovedAt,
      adminRejectionReason: reimbursements.adminRejectionReason,
      createdAt: reimbursements.createdAt,
      updatedAt: reimbursements.updatedAt,
      // Join employee name
      employeeFirstName: employees.firstName,
      employeeLastName: employees.lastName
    }).from(reimbursements).innerJoin(employees, eq30(reimbursements.employeeId, employees.id)).where(where).orderBy(sql18`${reimbursements.updatedAt} DESC`).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    return {
      items,
      total: totalResult?.count ?? 0
    };
  }),
  /**
   * Create reimbursement — only HR managers and admins
   */
  create: portalHrProcedure.input(
    z32.object({
      employeeId: z32.number(),
      category: z32.enum([
        "travel",
        "equipment",
        "meals",
        "transportation",
        "medical",
        "education",
        "office_supplies",
        "communication",
        "other"
      ]),
      amount: z32.string(),
      currency: z32.string().default("USD"),
      effectiveMonth: z32.string(),
      description: z32.string().optional(),
      receiptFileUrl: z32.string().optional(),
      receiptFileKey: z32.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError28({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [emp] = await db.select({ id: employees.id }).from(employees).where(and24(eq30(employees.id, input.employeeId), eq30(employees.customerId, cid)));
    if (!emp) {
      throw new TRPCError28({ code: "NOT_FOUND", message: "Employee not found" });
    }
    if (!input.receiptFileUrl) {
      throw new TRPCError28({ code: "BAD_REQUEST", message: "Receipt is required for reimbursement claims" });
    }
    const result = await db.insert(reimbursements).values({
      employeeId: input.employeeId,
      customerId: cid,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      effectiveMonth: input.effectiveMonth,
      description: input.description || null,
      receiptFileUrl: input.receiptFileUrl || null,
      receiptFileKey: input.receiptFileKey || null,
      status: "submitted",
      submittedBy: ctx.portalUser.contactId
    });
    return { success: true, reimbursementId: result[0].insertId };
  }),
  /**
   * Update reimbursement — only if status is 'submitted' (not yet approved)
   */
  update: portalHrProcedure.input(
    z32.object({
      id: z32.number(),
      amount: z32.string().optional(),
      description: z32.string().optional(),
      receiptFileUrl: z32.string().optional(),
      receiptFileKey: z32.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError28({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [reimb] = await db.select({ id: reimbursements.id, status: reimbursements.status }).from(reimbursements).where(and24(eq30(reimbursements.id, input.id), eq30(reimbursements.customerId, cid)));
    if (!reimb) {
      throw new TRPCError28({ code: "NOT_FOUND", message: "Reimbursement not found" });
    }
    if (reimb.status !== "submitted") {
      throw new TRPCError28({ code: "FORBIDDEN", message: "Reimbursement cannot be edited after approval" });
    }
    const updates = {};
    if (input.amount !== void 0) updates.amount = input.amount;
    if (input.description !== void 0) updates.description = input.description;
    if (input.receiptFileUrl !== void 0) updates.receiptFileUrl = input.receiptFileUrl;
    if (input.receiptFileKey !== void 0) updates.receiptFileKey = input.receiptFileKey;
    if (Object.keys(updates).length > 0) {
      await db.update(reimbursements).set(updates).where(eq30(reimbursements.id, input.id));
    }
    return { success: true };
  }),
  /**
   * Delete reimbursement — only if status is 'submitted'
   */
  delete: portalHrProcedure.input(z32.object({ id: z32.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError28({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [reimb] = await db.select({ id: reimbursements.id, status: reimbursements.status }).from(reimbursements).where(and24(eq30(reimbursements.id, input.id), eq30(reimbursements.customerId, cid)));
    if (!reimb) {
      throw new TRPCError28({ code: "NOT_FOUND", message: "Reimbursement not found" });
    }
    if (reimb.status !== "submitted") {
      throw new TRPCError28({ code: "FORBIDDEN", message: "Reimbursement cannot be deleted after approval" });
    }
    await db.delete(reimbursements).where(eq30(reimbursements.id, input.id));
    return { success: true };
  }),
  /**
   * Client approve reimbursement — HR manager / admin approves a submitted reimbursement
   */
  approve: portalHrProcedure.input(z32.object({ id: z32.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError28({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [reimb] = await db.select({ id: reimbursements.id, status: reimbursements.status }).from(reimbursements).where(and24(eq30(reimbursements.id, input.id), eq30(reimbursements.customerId, cid)));
    if (!reimb) {
      throw new TRPCError28({ code: "NOT_FOUND", message: "Reimbursement not found" });
    }
    if (reimb.status !== "submitted") {
      throw new TRPCError28({ code: "FORBIDDEN", message: "Only submitted reimbursements can be approved" });
    }
    await db.update(reimbursements).set({
      status: "client_approved",
      clientApprovedBy: ctx.portalUser.contactId,
      clientApprovedAt: /* @__PURE__ */ new Date()
    }).where(eq30(reimbursements.id, input.id));
    return { success: true };
  }),
  /**
   * Client reject reimbursement
   */
  reject: portalHrProcedure.input(z32.object({
    id: z32.number(),
    reason: z32.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError28({ code: "INTERNAL_SERVER_ERROR" });
    const cid = ctx.portalUser.customerId;
    const [reimb] = await db.select({ id: reimbursements.id, status: reimbursements.status }).from(reimbursements).where(and24(eq30(reimbursements.id, input.id), eq30(reimbursements.customerId, cid)));
    if (!reimb) {
      throw new TRPCError28({ code: "NOT_FOUND", message: "Reimbursement not found" });
    }
    if (reimb.status !== "submitted") {
      throw new TRPCError28({ code: "FORBIDDEN", message: "Only submitted reimbursements can be rejected" });
    }
    await db.update(reimbursements).set({
      status: "client_rejected",
      clientApprovedBy: ctx.portalUser.contactId,
      clientApprovedAt: /* @__PURE__ */ new Date(),
      clientRejectionReason: input.reason || null
    }).where(eq30(reimbursements.id, input.id));
    return { success: true };
  }),
  /**
   * Upload receipt file
   */
  uploadReceipt: portalHrProcedure.input(
    z32.object({
      fileBase64: z32.string(),
      fileName: z32.string(),
      mimeType: z32.string().default("application/pdf")
    })
  ).mutation(async ({ input }) => {
    const fileBuffer = Buffer.from(input.fileBase64, "base64");
    if (fileBuffer.length > 20 * 1024 * 1024) {
      throw new TRPCError28({ code: "BAD_REQUEST", message: "File size must be under 20MB" });
    }
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `reimbursement-receipts/${Date.now()}-${randomSuffix}-${input.fileName}`;
    const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
    return { url, fileKey };
  })
});

// server/portal/routers/portalKnowledgeBaseRouter.ts
import { z as z33 } from "zod";
import { and as and25, desc as desc8, eq as eq31, inArray as inArray9, isNull, or as or2 } from "drizzle-orm";
import { TRPCError as TRPCError29 } from "@trpc/server";
init_db();
init_schema();
var topicEnum = ["payroll", "compliance", "leave", "invoice", "onboarding", "general"];
var portalKnowledgeBaseRouter = portalRouter({
  dashboard: protectedPortalProcedure.input(
    z33.object({
      locale: z33.enum(["en", "zh"]).default("en"),
      topics: z33.array(z33.enum(topicEnum)).optional()
    }).optional()
  ).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError29({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    }
    const customerId = ctx.portalUser.customerId;
    const topics = input?.topics?.length ? input.topics : [...topicEnum];
    const items = await db.select().from(knowledgeItems).where(
      and25(
        inArray9(knowledgeItems.topic, topics),
        eq31(knowledgeItems.language, input?.locale ?? "en"),
        eq31(knowledgeItems.status, "published"),
        or2(eq31(knowledgeItems.customerId, customerId), isNull(knowledgeItems.customerId))
      )
    ).orderBy(desc8(knowledgeItems.publishedAt), desc8(knowledgeItems.createdAt)).limit(100);
    const topicCounts = topics.reduce((acc, topic) => {
      acc[topic] = items.filter((item) => item.topic === topic).length;
      return acc;
    }, {});
    return {
      customerId,
      generatedAt: Date.now(),
      topicCounts,
      items
    };
  }),
  marketingPreview: protectedPortalProcedure.input(
    z33.object({
      locale: z33.enum(["en", "zh"]).default("en"),
      cadence: z33.enum(["daily", "weekly", "monthly"]).default("weekly"),
      topics: z33.array(z33.enum(topicEnum)).min(1),
      channel: z33.enum(["email"]).default("email")
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError29({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    }
    const payload = {
      audienceKey: `customer-${ctx.portalUser.customerId}`,
      locale: input.locale,
      cadence: input.cadence,
      topics: input.topics,
      channel: input.channel,
      generatedAt: Date.now()
    };
    await db.insert(knowledgeMarketingEvents).values({
      customerId: ctx.portalUser.customerId,
      contactId: ctx.portalUser.contactId,
      channel: input.channel,
      cadence: input.cadence,
      topics: input.topics,
      payload
    });
    return {
      success: true,
      integrationType: "marketing-api-preview",
      payload,
      message: input.locale === "zh" ? "\u5DF2\u751F\u6210\u8425\u9500\u63A5\u53E3\u9884\u89C8\u8F7D\u8377\uFF0C\u5E76\u8BB0\u5F55\u5230\u77E5\u8BC6\u5E93\u8425\u9500\u4E8B\u4EF6\u3002" : "Marketing integration payload preview generated and saved as knowledge marketing event."
    };
  }),
  submitSearchFeedback: protectedPortalProcedure.input(
    z33.object({
      locale: z33.enum(["en", "zh"]).default("en"),
      query: z33.string().max(500).optional(),
      topics: z33.array(z33.enum(topicEnum)).default([]),
      feedbackType: z33.enum(["no_results", "not_helpful"]).default("not_helpful"),
      note: z33.string().max(2e3).optional(),
      metadata: z33.record(z33.string(), z33.any()).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError29({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    }
    await db.insert(knowledgeFeedbackEvents).values({
      customerId: ctx.portalUser.customerId,
      contactId: ctx.portalUser.contactId,
      locale: input.locale,
      query: input.query || null,
      topics: input.topics,
      feedbackType: input.feedbackType,
      note: input.note || null,
      metadata: input.metadata || {
        contactId: ctx.portalUser.contactId,
        submittedAt: Date.now()
      }
    });
    return {
      success: true,
      message: input.locale === "zh" ? "\u611F\u8C22\u53CD\u9988\uFF0C\u6211\u4EEC\u4F1A\u6301\u7EED\u4F18\u5316\u77E5\u8BC6\u5185\u5BB9\u3002" : "Thanks for your feedback. We will keep improving the knowledge content."
    };
  })
});

// server/portal/portalRouter.ts
var portalAppRouter = portalRouter({
  auth: portalAuthRouter,
  dashboard: portalDashboardRouter,
  employees: portalEmployeesRouter,
  adjustments: portalAdjustmentsRouter,
  leave: portalLeaveRouter,
  payroll: portalPayrollRouter,
  reimbursements: portalReimbursementsRouter,
  invoices: portalInvoicesRouter,
  settings: portalSettingsRouter,
  knowledgeBase: portalKnowledgeBaseRouter
});

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/services/invoicePdfService.ts
init_db();
import PDFDocument from "pdfkit";
import path3 from "path";
import fs3 from "fs";
var CJK_FONT_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663378930055/BicAsHhoridCdJUF.ttf";
var CJK_FONT_CACHE_DIR = path3.join(process.cwd(), ".font-cache");
var CJK_FONT_CACHE_PATH = path3.join(CJK_FONT_CACHE_DIR, "NotoSansSC-Regular.ttf");
function hasCJK(text2) {
  return /[^\x00-\x7F]/.test(text2);
}
async function ensureCJKFont() {
  try {
    if (fs3.existsSync(CJK_FONT_CACHE_PATH)) {
      return CJK_FONT_CACHE_PATH;
    }
    console.log("[InvoicePDF] Downloading CJK font...");
    fs3.mkdirSync(CJK_FONT_CACHE_DIR, { recursive: true });
    const response = await fetch(CJK_FONT_URL);
    if (!response.ok) {
      console.warn("[InvoicePDF] Failed to download CJK font:", response.status);
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    fs3.writeFileSync(CJK_FONT_CACHE_PATH, buffer);
    console.log("[InvoicePDF] CJK font cached successfully");
    return CJK_FONT_CACHE_PATH;
  } catch (err) {
    console.warn("[InvoicePDF] Failed to ensure CJK font:", err);
    return null;
  }
}
async function generateInvoicePdf(options) {
  const invoice = await getInvoiceById(options.invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  const customer = await getCustomerById(invoice.customerId);
  const billingEntity = invoice.billingEntityId ? await getBillingEntityById(invoice.billingEntityId) : null;
  const items = await listInvoiceItemsByInvoice(invoice.id);
  let logoBuffer = null;
  if (billingEntity && billingEntity.logoUrl) {
    try {
      const logoResponse = await fetch(billingEntity.logoUrl);
      if (logoResponse.ok) {
        logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
      }
    } catch (logoErr) {
      console.warn("[InvoicePDF] Failed to fetch billing entity logo:", logoErr);
    }
  }
  const cjkFontPath = await ensureCJKFont();
  const creditAppliedAmt = parseFloat(invoice.creditApplied?.toString() || "0");
  let creditApps = [];
  if (creditAppliedAmt > 0.01) {
    const rawApps = await listApplicationsForInvoice(invoice.id);
    creditApps = await Promise.all(
      rawApps.map(async (app) => {
        const cn = await getInvoiceById(app.creditNoteId);
        return {
          creditNoteId: app.creditNoteId,
          appliedAmount: app.appliedAmount,
          creditNoteNumber: cn?.invoiceNumber || `CN-${app.creditNoteId}`
        };
      })
    );
  }
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    if (cjkFontPath) {
      doc.registerFont("NotoSansSC", cjkFontPath);
    }
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
    const pageWidth = doc.page.width - 100;
    const rightCol = 350;
    function smartText(text2, x, y, opts, fontStyle) {
      if (hasCJK(text2) && cjkFontPath) {
        doc.font("NotoSansSC");
      } else {
        doc.font(fontStyle === "bold" ? "Helvetica-Bold" : "Helvetica");
      }
      doc.text(text2, x, y, opts);
    }
    let leftY = 50;
    const rightStartY = 50;
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, 50, leftY, { width: 80, height: 40, fit: [80, 40] });
        leftY += 48;
      } catch (logoErr) {
        console.warn("[InvoicePDF] Failed to render logo:", logoErr);
      }
    }
    function textHeight(text2, fontSize, width) {
      doc.fontSize(fontSize);
      return doc.heightOfString(text2, { width }) + 2;
    }
    doc.fontSize(16).fillColor("#1a1a1a");
    if (billingEntity) {
      smartText(billingEntity.entityName, 50, leftY, { width: 280 }, "bold");
      leftY += textHeight(billingEntity.entityName, 16, 280) + 2;
      doc.fontSize(9).fillColor("#666666");
      if (billingEntity.legalName && billingEntity.legalName !== billingEntity.entityName) {
        smartText(billingEntity.legalName, 50, leftY, { width: 280 });
        leftY += textHeight(billingEntity.legalName, 9, 280);
      }
      if (billingEntity.address) {
        smartText(billingEntity.address, 50, leftY, { width: 280 });
        leftY += textHeight(billingEntity.address, 9, 280);
      }
      const cityLine = [billingEntity.city, billingEntity.state, billingEntity.postalCode].filter(Boolean).join(", ");
      if (cityLine) {
        smartText(cityLine, 50, leftY, { width: 280 });
        leftY += textHeight(cityLine, 9, 280);
      }
      if (billingEntity.country) {
        smartText(billingEntity.country, 50, leftY, { width: 280 });
        leftY += textHeight(billingEntity.country, 9, 280);
      }
      if (billingEntity.registrationNumber) {
        const regText = `Reg: ${billingEntity.registrationNumber}`;
        smartText(regText, 50, leftY, { width: 280 });
        leftY += textHeight(regText, 9, 280);
      }
      if (billingEntity.taxId) {
        const taxText = `Tax ID: ${billingEntity.taxId}`;
        smartText(taxText, 50, leftY, { width: 280 });
        leftY += textHeight(taxText, 9, 280);
      }
    } else {
      smartText("GEA - Global Employment Advisors", 50, leftY, { width: 280 }, "bold");
      leftY += 20;
    }
    let ry = rightStartY;
    doc.fontSize(24).font("Helvetica-Bold").fillColor("#1a1a1a");
    doc.text("INVOICE", rightCol, ry, { width: pageWidth - rightCol + 50, align: "right" });
    ry += 32;
    doc.fontSize(10).font("Helvetica").fillColor("#333333");
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, rightCol, ry, { width: pageWidth - rightCol + 50, align: "right" });
    ry += 14;
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("en-GB")}`, rightCol, ry, { width: pageWidth - rightCol + 50, align: "right" });
    ry += 14;
    if (invoice.dueDate) {
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}`, rightCol, ry, { width: pageWidth - rightCol + 50, align: "right" });
      ry += 14;
    }
    if (invoice.invoiceMonth) {
      const monthVal = String(invoice.invoiceMonth);
      let monthStr;
      if (/^\d{4}-\d{2}/.test(monthVal)) {
        const [yearStr, monthNumStr] = monthVal.split("-");
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];
        monthStr = `${monthNames[parseInt(monthNumStr, 10) - 1]} ${yearStr}`;
      } else {
        monthStr = new Date(monthVal).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      }
      doc.text(`Period: ${monthStr}`, rightCol, ry, { width: pageWidth - rightCol + 50, align: "right" });
      ry += 14;
    }
    const typeLabel = invoice.invoiceType === "deposit" ? "Deposit Invoice" : invoice.invoiceType === "monthly_eor" ? "Monthly Invoice (EOR)" : invoice.invoiceType === "monthly_visa_eor" ? "Monthly Invoice (Visa EOR)" : invoice.invoiceType === "monthly_aor" ? "Monthly Invoice (AOR)" : invoice.invoiceType === "visa_service" ? "Visa Service Invoice" : invoice.invoiceType === "credit_note" ? "Credit Note" : invoice.invoiceType === "deposit_refund" ? "Deposit Refund" : invoice.invoiceType === "manual" ? "Invoice" : "Invoice";
    doc.font("Helvetica-Bold").text(typeLabel, rightCol, ry, { width: pageWidth - rightCol + 50, align: "right" });
    ry += 14;
    let billToY = Math.max(leftY, ry) + 15;
    doc.moveTo(50, billToY).lineTo(50 + pageWidth, billToY).lineWidth(0.5).strokeColor("#cccccc").stroke();
    billToY += 15;
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#888888");
    doc.text("BILL TO", 50, billToY);
    billToY += 14;
    doc.fontSize(10).fillColor("#1a1a1a");
    smartText(customer?.companyName || `Customer #${invoice.customerId}`, 50, billToY, void 0, "bold");
    billToY += 14;
    doc.fontSize(9).fillColor("#666666");
    if (customer?.legalEntityName) {
      smartText(customer.legalEntityName, 50, billToY, { width: 280 });
      billToY += textHeight(customer.legalEntityName, 9, 280);
    }
    if (customer?.address) {
      smartText(customer.address, 50, billToY, { width: 280 });
      billToY += textHeight(customer.address, 9, 280);
    }
    const custCityLine = [customer?.city, customer?.state, customer?.postalCode].filter(Boolean).join(", ");
    if (custCityLine) {
      smartText(custCityLine, 50, billToY, { width: 280 });
      billToY += textHeight(custCityLine, 9, 280);
    }
    if (customer?.country) {
      smartText(customer.country, 50, billToY, { width: 280 });
      billToY += textHeight(customer.country, 9, 280);
    }
    if (customer?.primaryContactEmail) {
      doc.font("Helvetica");
      doc.text(customer.primaryContactEmail, 50, billToY, { width: 280 });
      billToY += textHeight(customer.primaryContactEmail, 9, 280);
    }
    let tableY = billToY + 20;
    doc.moveTo(50, tableY).lineTo(50 + pageWidth, tableY).lineWidth(0.5).strokeColor("#cccccc").stroke();
    tableY += 8;
    const cols = {
      item: { x: 50, w: 175 },
      curr: { x: 230, w: 40 },
      qty: { x: 275, w: 40 },
      rate: { x: 320, w: 75 },
      tax: { x: 400, w: 50 },
      amount: { x: 455, w: 90 }
    };
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#888888");
    doc.text("ITEM", cols.item.x, tableY, { width: cols.item.w });
    doc.text("CURR", cols.curr.x, tableY, { width: cols.curr.w });
    doc.text("QTY", cols.qty.x, tableY, { width: cols.qty.w, align: "right" });
    doc.text("RATE", cols.rate.x, tableY, { width: cols.rate.w, align: "right" });
    doc.text("TAX", cols.tax.x, tableY, { width: cols.tax.w, align: "right" });
    doc.text("AMOUNT", cols.amount.x, tableY, { width: cols.amount.w, align: "right" });
    tableY += 14;
    doc.moveTo(50, tableY).lineTo(50 + pageWidth, tableY).lineWidth(0.3).strokeColor("#e0e0e0").stroke();
    tableY += 6;
    const currency = invoice.currency || "USD";
    const itemTypeLabels = {
      eor_service_fee: "EOR Service Fee",
      visa_eor_service_fee: "Visa EOR Service Fee",
      aor_service_fee: "AOR Service Fee",
      employment_cost: "Employment Cost",
      deposit: "Deposit",
      equipment_procurement_fee: "Equipment Procurement",
      one_time_onboarding_fee: "Onboarding Fee",
      one_time_offboarding_fee: "Offboarding Fee",
      administrative_setup_fee: "Admin Setup Fee",
      contract_termination_fee: "Contract Termination",
      payroll_processing_fee: "Payroll Processing",
      tax_filing_compliance_fee: "Tax Filing & Compliance",
      hr_advisory_service_fee: "HR Advisory",
      legal_compliance_support_fee: "Legal & Compliance",
      visa_immigration_service_fee: "Visa & Immigration",
      relocation_support_fee: "Relocation Support",
      custom_benefits_admin_fee: "Benefits Admin",
      bank_transfer_fee: "Bank Transfer Fee",
      consulting_fee: "Consulting Fee",
      management_consulting_fee: "Mgmt Consulting"
    };
    for (const item of items) {
      if (tableY > doc.page.height - 160) {
        doc.addPage();
        tableY = 50;
      }
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#333333");
      const typeText = itemTypeLabels[item.itemType] || item.itemType;
      doc.text(typeText, cols.item.x, tableY, { width: cols.item.w });
      doc.font("Helvetica").fillColor("#333333").fontSize(8);
      doc.text(item.localCurrency || currency || "\u2014", cols.curr.x, tableY, { width: cols.curr.w });
      doc.text(parseFloat(item.quantity?.toString() || "1").toString(), cols.qty.x, tableY, { width: cols.qty.w, align: "right" });
      doc.text(formatNum(item.unitPrice), cols.rate.x, tableY, { width: cols.rate.w, align: "right" });
      const vatRate = parseFloat(item.vatRate?.toString() || "0");
      doc.text(vatRate > 0 ? `${vatRate}%` : "\u2014", cols.tax.x, tableY, { width: cols.tax.w, align: "right" });
      doc.text(formatNum(item.localAmount || item.amount), cols.amount.x, tableY, { width: cols.amount.w, align: "right" });
      tableY += 11;
      doc.fontSize(7).fillColor("#888888");
      const desc9 = item.description.length > 80 ? item.description.slice(0, 77) + "..." : item.description;
      smartText(desc9, cols.item.x + 2, tableY, { width: cols.item.w + cols.curr.w + cols.qty.w - 2 });
      tableY += 14;
    }
    tableY += 6;
    doc.moveTo(50, tableY).lineTo(50 + pageWidth, tableY).lineWidth(0.5).strokeColor("#cccccc").stroke();
    tableY += 10;
    const totalsLabelX = 350;
    const totalsValX = 435;
    const totalsValW = 110;
    doc.fontSize(9).font("Helvetica").fillColor("#888888");
    doc.text("Invoice Currency", totalsLabelX, tableY, { width: 110 });
    doc.font("Helvetica-Bold").fillColor("#333333");
    doc.text(currency, totalsValX, tableY, { width: totalsValW, align: "right" });
    tableY += 16;
    const foreignCurrencies = new Set(
      items.map((i) => i.localCurrency).filter((c) => c && c !== currency)
    );
    if (foreignCurrencies.size > 0 && invoice.exchangeRateWithMarkup) {
      const foreignCcy = Array.from(foreignCurrencies)[0];
      doc.fontSize(9).font("Helvetica").fillColor("#888888");
      doc.text("Exchange Rate", totalsLabelX, tableY, { width: 110 });
      doc.font("Helvetica").fillColor("#333333");
      doc.text(`1 ${foreignCcy} = ${invoice.exchangeRateWithMarkup} ${currency}`, totalsValX, tableY, { width: totalsValW, align: "right" });
      tableY += 16;
    }
    doc.fontSize(9).font("Helvetica").fillColor("#666666");
    doc.text("Subtotal", totalsLabelX, tableY, { width: 110 });
    doc.text(`${currency} ${formatNum(invoice.subtotal)}`, totalsValX, tableY, { width: totalsValW, align: "right" });
    tableY += 14;
    doc.text("Tax / VAT", totalsLabelX, tableY, { width: 110 });
    doc.text(`${currency} ${formatNum(invoice.tax)}`, totalsValX, tableY, { width: totalsValW, align: "right" });
    tableY += 14;
    if (creditAppliedAmt > 0.01 && creditApps.length > 0) {
      tableY += 4;
      doc.moveTo(totalsLabelX, tableY).lineTo(50 + pageWidth, tableY).lineWidth(0.3).strokeColor("#aaaaaa").stroke();
      tableY += 8;
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#2563eb");
      doc.text("INVOICE TOTAL", totalsLabelX, tableY, { width: 110 });
      doc.text(`${currency} ${formatNum(invoice.total)}`, totalsValX, tableY, { width: totalsValW, align: "right" });
      tableY += 14;
      doc.fontSize(8).font("Helvetica").fillColor("#2563eb");
      doc.text("Less: Credit Note Applied", totalsLabelX, tableY, { width: totalsValX - totalsLabelX - 5 });
      doc.text(`- ${currency} ${formatNum(creditAppliedAmt)}`, totalsValX, tableY, { width: totalsValW, align: "right" });
      tableY += 12;
      tableY += 2;
    }
    tableY += 4;
    doc.moveTo(totalsLabelX, tableY).lineTo(50 + pageWidth, tableY).lineWidth(0.5).strokeColor("#333333").stroke();
    tableY += 8;
    const finalAmountDue = creditAppliedAmt > 0.01 ? parseFloat(invoice.amountDue?.toString() || (parseFloat(invoice.total?.toString() || "0") - creditAppliedAmt).toFixed(2)) : parseFloat(invoice.total?.toString() || "0");
    const totalLabel = creditAppliedAmt > 0.01 ? "AMOUNT DUE" : "TOTAL DUE";
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a1a1a");
    doc.text(totalLabel, totalsLabelX, tableY, { width: 110 });
    doc.text(`${currency} ${formatNum(finalAmountDue.toFixed(2))}`, totalsValX, tableY, { width: totalsValW, align: "right" });
    if (billingEntity && billingEntity.bankDetails) {
      tableY += 35;
      if (tableY > doc.page.height - 120) {
        doc.addPage();
        tableY = 50;
      }
      doc.moveTo(50, tableY).lineTo(50 + pageWidth, tableY).lineWidth(0.5).strokeColor("#cccccc").stroke();
      tableY += 12;
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#888888");
      doc.text("PAYMENT DETAILS", 50, tableY);
      tableY += 14;
      doc.fontSize(9).fillColor("#333333");
      const bankLines = billingEntity.bankDetails.split("\n");
      for (const line of bankLines) {
        if (tableY > doc.page.height - 80) {
          doc.addPage();
          tableY = 50;
        }
        smartText(line.trim(), 50, tableY, { width: pageWidth });
        tableY += 12;
      }
    }
    if (invoice.notes) {
      tableY += 20;
      if (tableY > doc.page.height - 80) {
        doc.addPage();
        tableY = 50;
      }
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#888888");
      doc.text("NOTES", 50, tableY);
      tableY += 12;
      doc.fontSize(8).fillColor("#666666");
      smartText(invoice.notes, 50, tableY, { width: pageWidth });
    }
    doc.end();
  });
}
function formatNum(val) {
  if (val === null || val === void 0) return "0.00";
  const num = typeof val === "string" ? parseFloat(val) : Number(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// server/_core/index.ts
init_portalAuth();
init_db();
init_schema();
import { eq as eq33, and as and26 } from "drizzle-orm";

// server/seedAdmin.ts
init_db();
init_schema();
init_env();
import { eq as eq32 } from "drizzle-orm";
import crypto5 from "crypto";
var DEFAULT_ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL || "simon.ding@geahr.com";
var DEFAULT_ADMIN_NAME = process.env.ADMIN_BOOTSTRAP_NAME || "Simon Ding";
var DEV_FALLBACK_PASSWORD = "BestGEA2026~~";
function resolveBootstrapPassword() {
  const fromEnv = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  if (!ENV.isProduction) return DEV_FALLBACK_PASSWORD;
  throw new Error("ADMIN_BOOTSTRAP_PASSWORD is required in production for initial admin seeding");
}
async function seedDefaultAdmin() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Seed] Database not available, skipping admin seed");
      return;
    }
    const existing = await db.select({ id: users.id }).from(users).where(eq32(users.email, DEFAULT_ADMIN_EMAIL)).limit(1);
    if (existing.length > 0) {
      console.log("[Seed] Default admin already exists, skipping");
      return;
    }
    const bootstrapPassword = resolveBootstrapPassword();
    const passwordHash = await hashPassword(bootstrapPassword);
    const openId = `admin_${crypto5.randomBytes(16).toString("hex")}`;
    await db.insert(users).values({
      openId,
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      loginMethod: "password",
      role: "admin",
      isActive: true,
      language: "en",
      lastSignedIn: /* @__PURE__ */ new Date()
    });
    if (ENV.isProduction) {
      console.warn(`[Seed] Bootstrap admin created: ${DEFAULT_ADMIN_EMAIL}. Please rotate ADMIN_BOOTSTRAP_PASSWORD immediately.`);
    } else {
      console.log(`[Seed] Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error("[Seed] Failed to seed default admin:", error);
  }
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      // CSP requires existing frontend asset/source inventory; enable in next phase.
      crossOriginEmbedderPolicy: false
    })
  );
  registerAuthRoutes(app);
  app.get("/api/invoices/:id/pdf/preview", async (req, res) => {
    try {
      const user = await authenticateAdminRequest(req);
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const invoiceId = parseInt(req.params.id, 10);
      if (isNaN(invoiceId)) {
        res.status(400).json({ error: "Invalid invoice ID" });
        return;
      }
      const pdfBuffer = await generateInvoicePdf({ invoiceId });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="invoice-${invoiceId}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF preview error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "PDF generation failed" });
    }
  });
  app.get("/api/invoices/:id/pdf", async (req, res) => {
    try {
      const user = await authenticateAdminRequest(req);
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const invoiceId = parseInt(req.params.id, 10);
      if (isNaN(invoiceId)) {
        res.status(400).json({ error: "Invalid invoice ID" });
        return;
      }
      const pdfBuffer = await generateInvoicePdf({ invoiceId });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoiceId}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "PDF generation failed" });
    }
  });
  app.get("/api/portal-invoices/:id/pdf", async (req, res) => {
    try {
      const portalUser = await authenticatePortalRequest(req);
      if (!portalUser) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const invoiceId = parseInt(req.params.id, 10);
      if (isNaN(invoiceId)) {
        res.status(400).json({ error: "Invalid invoice ID" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database unavailable" });
        return;
      }
      const [invoice] = await db.select({ id: invoices.id }).from(invoices).where(and26(eq33(invoices.id, invoiceId), eq33(invoices.customerId, portalUser.customerId)));
      if (!invoice) {
        res.status(404).json({ error: "Invoice not found" });
        return;
      }
      const pdfBuffer = await generateInvoicePdf({ invoiceId });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoiceId}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Portal PDF generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "PDF generation failed" });
    }
  });
  app.get("/api/portal-impersonate", async (req, res) => {
    try {
      const token = req.query.token;
      if (!token) {
        res.status(400).json({ error: "Missing token" });
        return;
      }
      const { verifyPortalToken: verifyPortalToken3, setPortalCookie: setPortalCookie2 } = await Promise.resolve().then(() => (init_portalAuth(), portalAuth_exports));
      const payload = await verifyPortalToken3(token);
      if (!payload) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }
      setPortalCookie2(res, token);
      const portalBase = req.hostname === "app.geahr.com" ? "" : "/portal";
      res.redirect(`${portalBase}/dashboard`);
    } catch (error) {
      console.error("Portal impersonation error:", error);
      res.status(500).json({ error: "Impersonation failed" });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app.use(
    "/api/portal",
    createExpressMiddleware({
      router: portalAppRouter,
      createContext: createPortalContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    await seedDefaultAdmin();
    scheduleCronJobs();
  });
}
startServer().catch(console.error);
