import { TestCleanup } from "../../server/test-cleanup";
import { createAdminCaller } from "./test-helpers";

interface TestCustomerInput {
  name: string;
  country: string;
  status?: string;
  billingEmail?: string;
  contractType?: string;
}

interface TestEmployeeInput {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  status?: string;
  salary?: number;
  currency?: string;
  startDate?: Date;
}

interface TestLeadInput {
  companyName: string;
  contactPerson: string;
  email: string;
  country: string;
  serviceType: string;
  status?: string;
}

export class TestDataFactory {
  private cleanup: TestCleanup;
  private dataTracker: Map<string, string[]> = new Map();
  private adminCaller: any;

  constructor() {
    this.cleanup = new TestCleanup();
    this.adminCaller = createAdminCaller();
  }

  // 创建完整的测试客户数据
  async createCompleteCustomer(overrides?: Partial<TestCustomerInput>) {
    const customerData = {
      name: `Test Customer ${Date.now()}`,
      country: 'SG',
      status: 'active',
      billingEmail: `finance${Date.now()}@testcustomer.com`,
      contractType: 'EOR',
      ...overrides
    };

    const customer = await this.adminCaller.customers.create(customerData);
    
    // 自动跟踪清理
    this.cleanup.trackCustomer(customer.id);
    this.trackData('customers', customer.id);

    // 创建关联数据
    await this.createCustomerContacts(customer.id);
    await this.createCustomerContract(customer.id);
    await this.createCustomerLeavePolicy(customer.id);
    await this.createCustomerPricing(customer.id);
    
    return customer;
  }

  // 创建测试员工完整数据
  async createCompleteEmployee(customerId: string, overrides?: Partial<TestEmployeeInput>) {
    const employeeData = {
      customerId,
      firstName: 'Test',
      lastName: `Employee ${Date.now()}`,
      email: `test.employee${Date.now()}@test.com`,
      country: 'SG',
      status: 'active',
      salary: 8000,
      currency: 'SGD',
      startDate: new Date(),
      ...overrides
    };

    const employee = await this.adminCaller.employees.create(employeeData);
    
    this.cleanup.trackEmployee(employee.id);
    this.trackData('employees', employee.id);

    // 创建关联数据
    await this.createEmployeeContract(employee.id, employeeData);
    await this.createLeaveBalance(employee.id);
    await this.createPayrollItems(employee.id);

    return employee;
  }

  // 创建销售线索
  async createSalesLead(overrides?: Partial<TestLeadInput>) {
    const leadData = {
      companyName: `Test Company ${Date.now()}`,
      contactPerson: 'John Doe',
      email: `john${Date.now()}@testcorp.com`,
      country: 'SG',
      serviceType: 'EOR',
      status: 'new',
      ...overrides
    };

    const lead = await this.adminCaller.salesLeads.create(leadData);
    this.trackData('salesLeads', lead.id);
    
    return lead;
  }

  // 创建客户联系人
  private async createCustomerContacts(customerId: string) {
    const contact = await this.adminCaller.customerContacts.create({
      customerId,
      name: 'HR Manager',
      email: `hr${Date.now()}@testcustomer.com`,
      role: 'hr_manager',
      isPrimary: true
    });
    
    this.trackData('customerContacts', contact.id);
    return contact;
  }

  // 创建客户合同
  private async createCustomerContract(customerId: string) {
    const contract = await this.adminCaller.customerContracts.create({
      customerId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后
      services: ['EOR', 'AOR'],
      pricing: { discount: 0.1 }
    });
    
    this.trackData('customerContracts', contract.id);
    return contract;
  }

  // 创建客户休假政策
  private async createCustomerLeavePolicy(customerId: string) {
    const policy = await this.adminCaller.customerLeavePolicies.create({
      customerId,
      country: 'SG',
      annualLeave: 14,
      sickLeave: 10,
      publicHoliday: 11
    });
    
    this.trackData('customerLeavePolicies', policy.id);
    return policy;
  }

  // 创建客户定价
  private async createCustomerPricing(customerId: string) {
    const pricing = await this.adminCaller.customerPricing.create({
      customerId,
      country: 'SG',
      serviceType: 'EOR',
      baseFee: 500,
      discount: 0.15
    });
    
    this.trackData('customerPricing', pricing.id);
    return pricing;
  }

  // 创建员工合同
  private async createEmployeeContract(employeeId: string, employeeData: any) {
    const contract = await this.adminCaller.employeeContracts.create({
      employeeId,
      type: 'full_time',
      startDate: employeeData.startDate,
      salary: employeeData.salary,
      currency: employeeData.currency
    });
    
    this.trackData('employeeContracts', contract.id);
    return contract;
  }

  // 创建休假余额
  private async createLeaveBalance(employeeId: string) {
    const balance = await this.adminCaller.leaveBalances.create({
      employeeId,
      annualLeaveBalance: 14,
      sickLeaveBalance: 10,
      year: new Date().getFullYear()
    });
    
    this.trackData('leaveBalances', balance.id);
    return balance;
  }

  // 创建工资项目
  private async createPayrollItems(employeeId: string) {
    // 这里可以根据需要创建工资相关的测试数据
    return true;
  }

  // 创建工资运行
  async createPayrollRun(customerId: string, overrides?: any) {
    const payrollData = {
      customerId,
      country: 'SG',
      month: '2024-03',
      status: 'draft',
      ...overrides
    };

    const payrollRun = await this.adminCaller.payrollRuns.create(payrollData);
    this.cleanup.trackPayrollRun(payrollRun.id);
    this.trackData('payrollRuns', payrollRun.id);
    
    return payrollRun;
  }

  // 创建发票
  async createInvoice(customerId: string, overrides?: any) {
    const invoiceData = {
      customerId,
      type: 'monthly_service',
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      items: [
        {
          description: 'EOR Service Fee',
          quantity: 1,
          unitPrice: 500,
          amount: 500
        }
      ],
      ...overrides
    };

    const invoice = await this.adminCaller.invoices.create(invoiceData);
    this.cleanup.trackInvoice(invoice.id);
    this.trackData('invoices', invoice.id);
    
    return invoice;
  }

  // 更新线索状态
  async updateLeadStatus(leadId: string, status: string) {
    return await this.adminCaller.salesLeads.updateStatus({
      id: leadId,
      status
    });
  }

  // MSA签署
  async signMSA(leadId: string, msaData: any) {
    return await this.adminCaller.salesLeads.signMSA({
      id: leadId,
      ...msaData
    });
  }

  // 转换线索为客户
  async convertLeadToCustomer(leadId: string) {
    return await this.adminCaller.salesLeads.convertToCustomer({ id: leadId });
  }

  // 跟踪数据
  private trackData(type: string, id: string) {
    if (!this.dataTracker.has(type)) {
      this.dataTracker.set(type, []);
    }
    this.dataTracker.get(type)!.push(id);
  }

  // 获取跟踪的数据
  getTrackedData() {
    return this.dataTracker;
  }

  // 批量清理所有测试数据
  async cleanupAll() {
    console.log('🧹 开始清理所有测试数据...');
    
    // 按照依赖关系顺序清理
    await this.cleanupPayrollData();
    await this.cleanupInvoiceData();
    await this.cleanupEmployeeData();
    await this.cleanupCustomerData();
    
    // 最后运行标准清理
    await this.cleanup.run();
    
    console.log('✅ 测试数据清理完成');
  }

  private async cleanupPayrollData() {
    const payrollRunIds = this.dataTracker.get('payrollRuns') || [];
    for (const id of payrollRunIds) {
      try {
        await this.adminCaller.payrollRuns.delete({ id });
      } catch (error) {
        console.warn(`⚠️  清理工资运行失败: ${id}`, error);
      }
    }
  }

  private async cleanupInvoiceData() {
    const invoiceIds = this.dataTracker.get('invoices') || [];
    for (const id of invoiceIds) {
      try {
        await this.adminCaller.invoices.delete({ id });
      } catch (error) {
        console.warn(`⚠️  清理发票失败: ${id}`, error);
      }
    }
  }

  private async cleanupEmployeeData() {
    const employeeIds = this.dataTracker.get('employees') || [];
    for (const id of employeeIds) {
      try {
        await this.adminCaller.employees.delete({ id });
      } catch (error) {
        console.warn(`⚠️  清理员工失败: ${id}`, error);
      }
    }
  }

  private async cleanupCustomerData() {
    const customerIds = this.dataTracker.get('customers') || [];
    for (const id of customerIds) {
      try {
        await this.adminCaller.customers.delete({ id });
      } catch (error) {
        console.warn(`⚠️  清理客户失败: ${id}`, error);
      }
    }
  }
}