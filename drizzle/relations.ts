/**
 * Drizzle ORM Relations
 *
 * Defines relationships between tables for use with Drizzle's relational query API.
 * These relations are purely for query convenience (the `with` syntax) and do NOT
 * create database-level foreign keys.
 *
 * Note: The existing codebase uses manual JOINs for all queries. These relations
 * are provided for future refactoring and new feature development.
 */
import { relations } from "drizzle-orm";
import {
  users,
  countriesConfig,
  leaveTypes,
  publicHolidays,
  customers,
  customerContacts,
  customerPricing,
  customerContracts,
  customerLeavePolicies,
  employees,
  employeeContracts,
  employeeDocuments,
  leaveBalances,
  leaveRecords,
  adjustments,
  payrollRuns,
  payrollItems,
  invoices,
  invoiceItems,
  creditNoteApplications,
  reimbursements,
  vendors,
  vendorBills,
  vendorBillItems,
  billInvoiceAllocations,
  salesLeads,
  salesActivities,
  onboardingInvites,
} from "./schema";

// ============================================================================
// 1. COUNTRY CONFIGURATION
// ============================================================================

export const countriesConfigRelations = relations(countriesConfig, ({ many }) => ({
  leaveTypes: many(leaveTypes),
  publicHolidays: many(publicHolidays),
  employees: many(employees),
  payrollRuns: many(payrollRuns),
}));

export const leaveTypesRelations = relations(leaveTypes, ({ one, many }) => ({
  country: one(countriesConfig, {
    fields: [leaveTypes.countryCode],
    references: [countriesConfig.countryCode],
  }),
  leaveBalances: many(leaveBalances),
  leaveRecords: many(leaveRecords),
  customerLeavePolicies: many(customerLeavePolicies),
}));

export const publicHolidaysRelations = relations(publicHolidays, ({ one }) => ({
  country: one(countriesConfig, {
    fields: [publicHolidays.countryCode],
    references: [countriesConfig.countryCode],
  }),
}));

// ============================================================================
// 2. CUSTOMER DOMAIN
// ============================================================================

export const customersRelations = relations(customers, ({ many }) => ({
  contacts: many(customerContacts),
  pricing: many(customerPricing),
  contracts: many(customerContracts),
  leavePolicies: many(customerLeavePolicies),
  employees: many(employees),
  invoices: many(invoices),
  adjustments: many(adjustments),
  payrollRuns: many(payrollRuns),
  salesLeads: many(salesLeads),
}));

export const customerContactsRelations = relations(customerContacts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerContacts.customerId],
    references: [customers.id],
  }),
}));

export const customerPricingRelations = relations(customerPricing, ({ one }) => ({
  customer: one(customers, {
    fields: [customerPricing.customerId],
    references: [customers.id],
  }),
}));

export const customerContractsRelations = relations(customerContracts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerContracts.customerId],
    references: [customers.id],
  }),
}));

export const customerLeavePoliciesRelations = relations(customerLeavePolicies, ({ one }) => ({
  customer: one(customers, {
    fields: [customerLeavePolicies.customerId],
    references: [customers.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [customerLeavePolicies.leaveTypeId],
    references: [leaveTypes.id],
  }),
}));

// ============================================================================
// 3. EMPLOYEE DOMAIN
// ============================================================================

export const employeesRelations = relations(employees, ({ one, many }) => ({
  customer: one(customers, {
    fields: [employees.customerId],
    references: [customers.id],
  }),
  contracts: many(employeeContracts),
  documents: many(employeeDocuments),
  leaveBalances: many(leaveBalances),
  leaveRecords: many(leaveRecords),
  adjustments: many(adjustments),
  payrollItems: many(payrollItems),
  invoiceItems: many(invoiceItems),
  reimbursements: many(reimbursements),
}));

export const employeeContractsRelations = relations(employeeContracts, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeContracts.employeeId],
    references: [employees.id],
  }),
}));

export const employeeDocumentsRelations = relations(employeeDocuments, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeDocuments.employeeId],
    references: [employees.id],
  }),
}));

// ============================================================================
// 4. LEAVE MANAGEMENT
// ============================================================================

export const leaveBalancesRelations = relations(leaveBalances, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveBalances.employeeId],
    references: [employees.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveBalances.leaveTypeId],
    references: [leaveTypes.id],
  }),
}));

export const leaveRecordsRelations = relations(leaveRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRecords.employeeId],
    references: [employees.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveRecords.leaveTypeId],
    references: [leaveTypes.id],
  }),
}));

// ============================================================================
// 5. ADJUSTMENTS & REIMBURSEMENTS
// ============================================================================

export const adjustmentsRelations = relations(adjustments, ({ one }) => ({
  employee: one(employees, {
    fields: [adjustments.employeeId],
    references: [employees.id],
  }),
}));

export const reimbursementsRelations = relations(reimbursements, ({ one }) => ({
  employee: one(employees, {
    fields: [reimbursements.employeeId],
    references: [employees.id],
  }),
}));

// ============================================================================
// 6. PAYROLL
// ============================================================================

export const payrollRunsRelations = relations(payrollRuns, ({ one, many }) => ({
  customer: one(customers, {
    fields: [payrollRuns.customerId],
    references: [customers.id],
  }),
  country: one(countriesConfig, {
    fields: [payrollRuns.countryCode],
    references: [countriesConfig.countryCode],
  }),
  items: many(payrollItems),
}));

export const payrollItemsRelations = relations(payrollItems, ({ one }) => ({
  payrollRun: one(payrollRuns, {
    fields: [payrollItems.payrollRunId],
    references: [payrollRuns.id],
  }),
  employee: one(employees, {
    fields: [payrollItems.employeeId],
    references: [employees.id],
  }),
}));

// ============================================================================
// 7. INVOICING
// ============================================================================

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
  creditNoteApplications: many(creditNoteApplications),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  employee: one(employees, {
    fields: [invoiceItems.employeeId],
    references: [employees.id],
  }),
}));

export const creditNoteApplicationsRelations = relations(creditNoteApplications, ({ one }) => ({
  creditNote: one(invoices, {
    fields: [creditNoteApplications.creditNoteId],
    references: [invoices.id],
    relationName: "creditNote",
  }),
  targetInvoice: one(invoices, {
    fields: [creditNoteApplications.targetInvoiceId],
    references: [invoices.id],
    relationName: "targetInvoice",
  }),
}));

// ============================================================================
// 8. VENDOR & BILL MANAGEMENT
// ============================================================================

export const vendorsRelations = relations(vendors, ({ many }) => ({
  bills: many(vendorBills),
}));

export const vendorBillsRelations = relations(vendorBills, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [vendorBills.vendorId],
    references: [vendors.id],
  }),
  items: many(vendorBillItems),
  allocations: many(billInvoiceAllocations),
}));

export const vendorBillItemsRelations = relations(vendorBillItems, ({ one }) => ({
  vendorBill: one(vendorBills, {
    fields: [vendorBillItems.vendorBillId],
    references: [vendorBills.id],
  }),
}));

export const billInvoiceAllocationsRelations = relations(billInvoiceAllocations, ({ one }) => ({
  vendorBill: one(vendorBills, {
    fields: [billInvoiceAllocations.vendorBillId],
    references: [vendorBills.id],
  }),
  invoice: one(invoices, {
    fields: [billInvoiceAllocations.invoiceId],
    references: [invoices.id],
  }),
}));

// ============================================================================
// 9. SALES / CRM
// ============================================================================

export const salesLeadsRelations = relations(salesLeads, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesLeads.customerId],
    references: [customers.id],
  }),
  activities: many(salesActivities),
}));

export const salesActivitiesRelations = relations(salesActivities, ({ one }) => ({
  lead: one(salesLeads, {
    fields: [salesActivities.leadId],
    references: [salesLeads.id],
  }),
}));

// ============================================================================
// 10. ONBOARDING
// ============================================================================

export const onboardingInvitesRelations = relations(onboardingInvites, ({ one }) => ({
  employee: one(employees, {
    fields: [onboardingInvites.employeeId],
    references: [employees.id],
  }),
}));
