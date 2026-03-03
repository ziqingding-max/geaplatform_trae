import { TestCleanup } from "../server/test-cleanup";

// 扩展TestCleanup类以支持更多实体类型
export class ExtendedTestCleanup extends TestCleanup {
  private salesLeadIds: number[] = [];
  private customerContactIds: number[] = [];
  private customerContractIds: number[] = [];
  private customerLeavePolicyIds: number[] = [];
  private customerPricingIds: number[] = [];
  private employeeContractIds: number[] = [];
  private leaveBalanceIds: number[] = [];
  private payrollItemIds: number[] = [];

  trackSalesLead(id: number) { if (id) this.salesLeadIds.push(id); }
  trackCustomerContact(id: number) { if (id) this.customerContactIds.push(id); }
  trackCustomerContract(id: number) { if (id) this.customerContractIds.push(id); }
  trackCustomerLeavePolicy(id: number) { if (id) this.customerLeavePolicyIds.push(id); }
  trackCustomerPricing(id: number) { if (id) this.customerPricingIds.push(id); }
  trackEmployeeContract(id: number) { if (id) this.employeeContractIds.push(id); }
  trackLeaveBalance(id: number) { if (id) this.leaveBalanceIds.push(id); }
  trackPayrollItem(id: number) { if (id) this.payrollItemIds.push(id); }

  async run() {
    // 先调用父类的清理方法
    await super.run();

    // 然后清理扩展的实体
    const db = await import("../server/db").then(m => m.getDb());
    if (!db) return;

    const { 
      salesLeads, customerContacts, customerContracts,
      customerLeavePolicies, customerPricing, employeeContracts,
      leaveBalances, payrollItems
    } = await import("../drizzle/schema");

    const { inArray } = await import("drizzle-orm");

    try {
      // 清理扩展的实体
      if (this.payrollItemIds.length > 0) {
        await db.delete(payrollItems).where(inArray(payrollItems.id, this.payrollItemIds)).catch(() => {});
      }
      
      if (this.leaveBalanceIds.length > 0) {
        await db.delete(leaveBalances).where(inArray(leaveBalances.id, this.leaveBalanceIds)).catch(() => {});
      }
      
      if (this.employeeContractIds.length > 0) {
        await db.delete(employeeContracts).where(inArray(employeeContracts.id, this.employeeContractIds)).catch(() => {});
      }
      
      if (this.customerPricingIds.length > 0) {
        await db.delete(customerPricing).where(inArray(customerPricing.id, this.customerPricingIds)).catch(() => {});
      }
      
      if (this.customerLeavePolicyIds.length > 0) {
        await db.delete(customerLeavePolicies).where(inArray(customerLeavePolicies.id, this.customerLeavePolicyIds)).catch(() => {});
      }
      
      if (this.customerContractIds.length > 0) {
        await db.delete(customerContracts).where(inArray(customerContracts.id, this.customerContractIds)).catch(() => {});
      }
      
      if (this.customerContactIds.length > 0) {
        await db.delete(customerContacts).where(inArray(customerContacts.id, this.customerContactIds)).catch(() => {});
      }
      
      if (this.salesLeadIds.length > 0) {
        await db.delete(salesLeads).where(inArray(salesLeads.id, this.salesLeadIds)).catch(() => {});
      }
    } catch (e) {
      console.error("[ExtendedTestCleanup] Error during extended cleanup:", e);
    }
  }
}