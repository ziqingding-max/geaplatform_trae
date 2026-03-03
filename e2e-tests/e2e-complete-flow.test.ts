import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { ExtendedTestCleanup } from "./utils/extended-test-cleanup";
import { createAdminCaller } from "./utils/test-helpers";

// 端到端测试主文件
describe('🚀 端到端自动化测试套件', () => {
  const cleanup = new ExtendedTestCleanup();
  let adminCaller: any;

  beforeAll(() => {
    adminCaller = createAdminCaller();
  });

  afterAll(async () => {
    console.log('🧹 清理测试数据...');
    await cleanup.run();
  });

  it('销售流程端到端测试', async () => {
    console.log('📋 开始销售流程端到端测试...');
    
    try {
      // 1. 创建销售线索
      console.log('📝 步骤1: 创建销售线索');
      const lead = await adminCaller.salesLeads.create({
        companyName: 'Test Corp Pte Ltd',
        contactPerson: 'John Smith',
        email: 'john.smith@testcorp.com',
        country: 'SG',
        serviceType: 'EOR',
        status: 'new'
      });
      
      expect(lead).toBeDefined();
      expect(lead.companyName).toBe('Test Corp Pte Ltd');
      expect(lead.status).toBe('new');
      cleanup.trackSalesLead(lead.id); // 跟踪清理
      console.log(`✅ 销售线索创建成功: ${lead.id}`);

      // 2. 更新线索状态 - qualified
      console.log('📝 步骤2: 更新线索状态为qualified');
      const qualifiedLead = await adminCaller.salesLeads.updateStatus({
        id: lead.id,
        status: 'qualified'
      });
      expect(qualifiedLead.status).toBe('qualified');
      console.log('✅ 线索状态更新为qualified');

      // 3. 更新线索状态 - proposal_sent
      console.log('📝 步骤3: 更新线索状态为proposal_sent');
      const proposalLead = await adminCaller.salesLeads.updateStatus({
        id: lead.id,
        status: 'proposal_sent'
      });
      expect(proposalLead.status).toBe('proposal_sent');
      console.log('✅ 线索状态更新为proposal_sent');

      // 4. 更新线索状态 - negotiation
      console.log('📝 步骤4: 更新线索状态为negotiation');
      const negotiationLead = await adminCaller.salesLeads.updateStatus({
        id: lead.id,
        status: 'negotiation'
      });
      expect(negotiationLead.status).toBe('negotiation');
      console.log('✅ 线索状态更新为negotiation');

      // 5. MSA签署
      console.log('📝 步骤5: MSA签署');
      const msaResult = await adminCaller.salesLeads.signMSA({
        id: lead.id,
        contractDate: new Date(),
        services: ['EOR', 'AOR'],
        countries: ['SG', 'HK'],
        contractValue: 50000,
        contractPeriod: 12
      });
      
      expect(msaResult.success).toBe(true);
      console.log('✅ MSA签署完成');

      // 6. 转换为客户
      console.log('📝 步骤6: 转换线索为客户');
      const customer = await adminCaller.salesLeads.convertToCustomer({ id: lead.id });
      
      expect(customer).toBeDefined();
      expect(customer.status).toBe('active');
      expect(customer.name).toBe('Test Corp Pte Ltd');
      expect(customer.country).toBe('SG');
      cleanup.trackCustomer(customer.id); // 跟踪清理
      console.log(`✅ 客户转换成功: ${customer.id}`);

      // 7. 验证客户相关数据已创建
      console.log('📝 步骤7: 验证客户相关数据');
      
      // 验证客户联系人
      const contacts = await adminCaller.customerContacts.list({
        customerId: customer.id
      });
      expect(contacts.length).toBeGreaterThan(0);
      console.log(`✅ 客户联系人创建成功: ${contacts.length}个`);

      // 验证客户合同
      const contracts = await adminCaller.customerContracts.list({
        customerId: customer.id
      });
      expect(contracts.length).toBeGreaterThan(0);
      console.log(`✅ 客户合同创建成功: ${contracts.length}个`);

      // 验证客户休假政策
      const leavePolicies = await adminCaller.customerLeavePolicies.list({
        customerId: customer.id
      });
      expect(leavePolicies.length).toBeGreaterThan(0);
      console.log(`✅ 客户休假政策创建成功: ${leavePolicies.length}个`);

      // 验证客户定价
      const pricing = await adminCaller.customerPricing.list({
        customerId: customer.id
      });
      expect(pricing.length).toBeGreaterThan(0);
      console.log(`✅ 客户定价创建成功: ${pricing.length}个`);

      console.log('🎉 销售流程端到端测试完成！');
      
    } catch (error) {
      console.error('❌ 销售流程测试失败:', error);
      throw error;
    }
  });

  it('客户入职流程测试', async () => {
    console.log('📋 开始客户入职流程测试...');
    
    try {
      // 1. 创建客户基础信息
      console.log('📝 步骤1: 创建客户基础信息');
      const customer = await adminCaller.customers.create({
        name: 'New Customer Ltd',
        country: 'SG',
        billingEmail: 'finance@newcustomer.com',
        contractType: 'EOR',
        status: 'active'
      });
      
      expect(customer).toBeDefined();
      expect(customer.name).toBe('New Customer Ltd');
      cleanup.trackCustomer(customer.id);
      console.log(`✅ 客户创建成功: ${customer.id}`);

      // 2. 配置客户联系人
      console.log('📝 步骤2: 配置客户联系人');
      const contact = await adminCaller.customerContacts.create({
        customerId: customer.id,
        name: 'HR Manager',
        email: 'hr@newcustomer.com',
        role: 'hr_manager',
        isPrimary: true
      });
      
      expect(contact).toBeDefined();
      expect(contact.name).toBe('HR Manager');
      cleanup.trackCustomerContact(contact.id);
      console.log(`✅ 客户联系人创建成功: ${contact.id}`);

      // 3. 设置客户合同
      console.log('📝 步骤3: 设置客户合同');
      const contract = await adminCaller.customerContracts.create({
        customerId: customer.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后
        services: ['EOR', 'AOR'],
        pricing: { discount: 0.1 }
      });
      
      expect(contract).toBeDefined();
      expect(contract.services).toContain('EOR');
      expect(contract.services).toContain('AOR');
      cleanup.trackCustomerContract(contract.id);
      console.log(`✅ 客户合同创建成功: ${contract.id}`);

      // 4. 配置休假政策
      console.log('📝 步骤4: 配置休假政策');
      const leavePolicy = await adminCaller.customerLeavePolicies.create({
        customerId: customer.id,
        country: 'SG',
        annualLeave: 14,
        sickLeave: 10,
        publicHoliday: 11
      });
      
      expect(leavePolicy).toBeDefined();
      expect(leavePolicy.annualLeave).toBe(14);
      expect(leavePolicy.sickLeave).toBe(10);
      cleanup.trackCustomerLeavePolicy(leavePolicy.id);
      console.log(`✅ 客户休假政策创建成功: ${leavePolicy.id}`);

      // 5. 设置定价
      console.log('📝 步骤5: 设置定价');
      const pricing = await adminCaller.customerPricing.create({
        customerId: customer.id,
        country: 'SG',
        serviceType: 'EOR',
        baseFee: 500,
        discount: 0.15
      });
      
      expect(pricing).toBeDefined();
      expect(pricing.baseFee).toBe(500);
      expect(pricing.discount).toBe(0.15);
      cleanup.trackCustomerPricing(pricing.id);
      console.log(`✅ 客户定价创建成功: ${pricing.id}`);

      console.log('🎉 客户入职流程测试完成！');
      
    } catch (error) {
      console.error('❌ 客户入职流程测试失败:', error);
      throw error;
    }
  });

  it('员工生命周期测试', async () => {
    console.log('📋 开始员工生命周期测试...');
    
    try {
      // 1. 先创建客户
      console.log('📝 步骤1: 创建客户');
      const customer = await adminCaller.customers.create({
        name: 'Employee Test Customer',
        country: 'SG',
        billingEmail: 'hr@employeetest.com',
        status: 'active'
      });
      
      cleanup.trackCustomer(customer.id);
      console.log(`✅ 客户创建成功: ${customer.id}`);

      // 2. 员工入职
      console.log('📝 步骤2: 员工入职');
      const employee = await adminCaller.employees.create({
        customerId: customer.id,
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@email.com',
        country: 'SG',
        status: 'active',
        salary: 8000,
        currency: 'SGD',
        startDate: new Date()
      });
      
      expect(employee).toBeDefined();
      expect(employee.firstName).toBe('Alice');
      expect(employee.status).toBe('active');
      cleanup.trackEmployee(employee.id);
      console.log(`✅ 员工入职成功: ${employee.id}`);

      // 3. 创建员工合同
      console.log('📝 步骤3: 创建员工合同');
      const contract = await adminCaller.employeeContracts.create({
        employeeId: employee.id,
        type: 'full_time',
        startDate: employee.startDate,
        salary: employee.salary,
        currency: employee.currency
      });
      
      expect(contract).toBeDefined();
      expect(contract.type).toBe('full_time');
      cleanup.trackEmployeeContract(contract.id);
      console.log(`✅ 员工合同创建成功: ${contract.id}`);

      // 4. 创建休假余额
      console.log('📝 步骤4: 创建休假余额');
      const leaveBalance = await adminCaller.leaveBalances.create({
        employeeId: employee.id,
        annualLeaveBalance: 14,
        sickLeaveBalance: 10,
        year: new Date().getFullYear()
      });
      
      expect(leaveBalance).toBeDefined();
      expect(leaveBalance.annualLeaveBalance).toBe(14);
      expect(leaveBalance.sickLeaveBalance).toBe(10);
      cleanup.trackLeaveBalance(leaveBalance.id);
      console.log(`✅ 休假余额创建成功: ${leaveBalance.id}`);

      console.log('🎉 员工生命周期测试完成！');
      
    } catch (error) {
      console.error('❌ 员工生命周期测试失败:', error);
      throw error;
    }
  });

  it('工资处理流程测试', async () => {
    console.log('📋 开始工资处理流程测试...');
    
    try {
      // 1. 创建客户和员工
      console.log('📝 步骤1: 创建客户和员工');
      const customer = await adminCaller.customers.create({
        name: 'Payroll Test Customer',
        country: 'SG',
        status: 'active'
      });
      
      cleanup.trackCustomer(customer.id);
      console.log(`✅ 客户创建成功: ${customer.id}`);

      const employee = await adminCaller.employees.create({
        customerId: customer.id,
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@payroll.com',
        country: 'SG',
        status: 'active',
        salary: 7500,
        currency: 'SGD',
        startDate: new Date()
      });
      
      cleanup.trackEmployee(employee.id);
      console.log(`✅ 员工创建成功: ${employee.id}`);

      // 2. 创建工资运行
      console.log('📝 步骤2: 创建工资运行');
      const payrollRun = await adminCaller.payrollRuns.create({
        customerId: customer.id,
        country: 'SG',
        month: '2024-03',
        status: 'draft',
        year: 2024
      });
      
      expect(payrollRun).toBeDefined();
      expect(payrollRun.status).toBe('draft');
      cleanup.trackPayrollRun(payrollRun.id);
      console.log(`✅ 工资运行创建成功: ${payrollRun.id}`);

      // 3. 添加工资项目
      console.log('📝 步骤3: 添加工资项目');
      const payrollItem = await adminCaller.payrollItems.create({
        payrollRunId: payrollRun.id,
        employeeId: employee.id,
        baseSalary: employee.salary,
        bonus: 0,
        deduction: 0,
        netPay: employee.salary
      });
      
      expect(payrollItem).toBeDefined();
      expect(payrollItem.baseSalary).toBe(employee.salary);
      cleanup.trackPayrollItem(payrollItem.id);
      console.log(`✅ 工资项目创建成功: ${payrollItem.id}`);

      // 4. 提交工资运行
      console.log('📝 步骤4: 提交工资运行');
      const submittedPayroll = await adminCaller.payrollRuns.updateStatus({
        id: payrollRun.id,
        status: 'submitted'
      });
      
      expect(submittedPayroll.status).toBe('submitted');
      console.log('✅ 工资运行提交成功');

      console.log('🎉 工资处理流程测试完成！');
      
    } catch (error) {
      console.error('❌ 工资处理流程测试失败:', error);
      throw error;
    }
  });

  it('发票周期测试', async () => {
    console.log('📋 开始发票周期测试...');
    
    try {
      // 1. 创建客户
      console.log('📝 步骤1: 创建客户');
      const customer = await adminCaller.customers.create({
        name: 'Invoice Test Customer',
        country: 'SG',
        billingEmail: 'finance@invoicetest.com',
        status: 'active'
      });
      
      cleanup.trackCustomer(customer.id);
      console.log(`✅ 客户创建成功: ${customer.id}`);

      // 2. 创建发票
      console.log('📝 步骤2: 创建发票');
      const invoice = await adminCaller.invoices.create({
        customerId: customer.id,
        type: 'monthly_service',
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        items: [
          {
            description: 'EOR Service Fee',
            quantity: 1,
            unitPrice: 500,
            amount: 500
          },
          {
            description: 'AOR Service Fee',
            quantity: 1,
            unitPrice: 300,
            amount: 300
          }
        ]
      });
      
      expect(invoice).toBeDefined();
      expect(invoice.status).toBe('draft');
      expect(invoice.totalAmount).toBe(800); // 500 + 300
      cleanup.trackInvoice(invoice.id);
      console.log(`✅ 发票创建成功: ${invoice.id}`);

      // 3. 更新发票状态
      console.log('📝 步骤3: 更新发票状态');
      const pendingInvoice = await adminCaller.invoices.updateStatus({
        id: invoice.id,
        status: 'pending_review'
      });
      
      expect(pendingInvoice.status).toBe('pending_review');
      console.log('✅ 发票状态更新为pending_review');

      const sentInvoice = await adminCaller.invoices.updateStatus({
        id: invoice.id,
        status: 'sent'
      });
      
      expect(sentInvoice.status).toBe('sent');
      console.log('✅ 发票状态更新为sent');

      // 4. 记录付款
      console.log('📝 步骤4: 记录付款');
      const payment = await adminCaller.invoices.recordPayment({
        id: invoice.id,
        amount: invoice.totalAmount,
        paymentDate: new Date(),
        method: 'bank_transfer',
        reference: 'TEST-PAYMENT-001'
      });
      
      expect(payment).toBeDefined();
      console.log(`✅ 付款记录成功: ${payment.id}`);

      // 5. 验证发票状态
      console.log('📝 步骤5: 验证发票状态');
      const paidInvoice = await adminCaller.invoices.get({ id: invoice.id });
      expect(paidInvoice.status).toBe('paid');
      console.log('✅ 发票状态已更新为paid');

      console.log('🎉 发票周期测试完成！');
      
    } catch (error) {
      console.error('❌ 发票周期测试失败:', error);
      throw error;
    }
  });
});