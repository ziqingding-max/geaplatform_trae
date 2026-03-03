import { describe, it, expect, afterAll } from "vitest";
import { TestDataFactory } from "../utils/test-data-factory";

describe('销售流程端到端测试', () => {
  const dataFactory = new TestDataFactory();

  afterAll(async () => {
    console.log('🧹 清理销售流程测试数据...');
    await dataFactory.cleanupAll();
  });

  it('完整的销售线索到客户转换流程', async () => {
    console.log('🚀 开始销售流程端到端测试...');
    
    // 1. 创建销售线索
    console.log('📋 步骤1: 创建销售线索');
    const lead = await dataFactory.createSalesLead({
      companyName: 'Test Corp Pte Ltd',
      contactPerson: 'John Smith',
      email: 'john.smith@testcorp.com',
      country: 'SG',
      serviceType: 'EOR'
    });
    
    expect(lead).toBeDefined();
    expect(lead.companyName).toBe('Test Corp Pte Ltd');
    expect(lead.status).toBe('new');
    console.log(`✅ 销售线索创建成功: ${lead.id}`);

    // 2. 更新线索状态 - qualified
    console.log('📋 步骤2: 更新线索状态为qualified');
    await dataFactory.updateLeadStatus(lead.id, 'qualified');
    console.log('✅ 线索状态更新为qualified');

    // 3. 更新线索状态 - proposal_sent
    console.log('📋 步骤3: 更新线索状态为proposal_sent');
    await dataFactory.updateLeadStatus(lead.id, 'proposal_sent');
    console.log('✅ 线索状态更新为proposal_sent');

    // 4. 更新线索状态 - negotiation
    console.log('📋 步骤4: 更新线索状态为negotiation');
    await dataFactory.updateLeadStatus(lead.id, 'negotiation');
    console.log('✅ 线索状态更新为negotiation');

    // 5. MSA签署
    console.log('📋 步骤5: MSA签署');
    const msaResult = await dataFactory.signMSA(lead.id, {
      contractDate: new Date(),
      services: ['EOR', 'AOR'],
      countries: ['SG', 'HK'],
      contractValue: 50000,
      contractPeriod: 12
    });
    
    expect(msaResult.success).toBe(true);
    console.log('✅ MSA签署完成');

    // 6. 转换为客户
    console.log('📋 步骤6: 转换线索为客户');
    const customer = await dataFactory.convertLeadToCustomer(lead.id);
    
    expect(customer).toBeDefined();
    expect(customer.status).toBe('active');
    expect(customer.name).toBe('Test Corp Pte Ltd');
    expect(customer.country).toBe('SG');
    console.log(`✅ 客户转换成功: ${customer.id}`);

    // 7. 验证客户相关数据已创建
    console.log('📋 步骤7: 验证客户相关数据');
    
    // 验证客户联系人
    const contacts = await dataFactory['adminCaller'].customerContacts.list({
      customerId: customer.id
    });
    expect(contacts.length).toBeGreaterThan(0);
    console.log(`✅ 客户联系人创建成功: ${contacts.length}个`);

    // 验证客户合同
    const contracts = await dataFactory['adminCaller'].customerContracts.list({
      customerId: customer.id
    });
    expect(contracts.length).toBeGreaterThan(0);
    console.log(`✅ 客户合同创建成功: ${contracts.length}个`);

    // 验证客户休假政策
    const leavePolicies = await dataFactory['adminCaller'].customerLeavePolicies.list({
      customerId: customer.id
    });
    expect(leavePolicies.length).toBeGreaterThan(0);
    console.log(`✅ 客户休假政策创建成功: ${leavePolicies.length}个`);

    // 验证客户定价
    const pricing = await dataFactory['adminCaller'].customerPricing.list({
      customerId: customer.id
    });
    expect(pricing.length).toBeGreaterThan(0);
    console.log(`✅ 客户定价创建成功: ${pricing.length}个`);

    console.log('🎉 销售流程端到端测试完成！');
  });

  it('销售线索状态流转验证', async () => {
    console.log('🚀 开始销售线索状态流转测试...');
    
    // 创建新的销售线索
    const lead = await dataFactory.createSalesLead({
      companyName: 'Status Flow Test Company',
      contactPerson: 'Alice Johnson',
      email: 'alice.johnson@statusflow.com',
      country: 'HK',
      serviceType: 'AOR'
    });

    // 验证状态流转路径
    const validTransitions = ['new', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'];
    
    for (const status of validTransitions.slice(1, 4)) { // 测试前4个状态
      await dataFactory.updateLeadStatus(lead.id, status);
      console.log(`✅ 状态流转成功: ${status}`);
    }

    console.log('🎉 销售线索状态流转测试完成！');
  });

  it('多服务类型销售流程', async () => {
    console.log('🚀 开始多服务类型销售流程测试...');
    
    // 创建EOR服务线索
    const eorLead = await dataFactory.createSalesLead({
      companyName: 'EOR Services Ltd',
      contactPerson: 'Bob Wilson',
      email: 'bob.wilson@eor-services.com',
      country: 'SG',
      serviceType: 'EOR'
    });

    // 创建AOR服务线索
    const aorLead = await dataFactory.createSalesLead({
      companyName: 'AOR Solutions Ltd',
      contactPerson: 'Carol Davis',
      email: 'carol.davis@aor-solutions.com',
      country: 'HK',
      serviceType: 'AOR'
    });

    // 创建多服务类型线索
    const multiServiceLead = await dataFactory.createSalesLead({
      companyName: 'Multi Service Corp',
      contactPerson: 'David Brown',
      email: 'david.brown@multi-service.com',
      country: 'SG',
      serviceType: 'EOR_AOR'
    });

    // 转换所有线索
    const eorCustomer = await dataFactory.convertLeadToCustomer(eorLead.id);
    const aorCustomer = await dataFactory.convertLeadToCustomer(aorLead.id);
    const multiServiceCustomer = await dataFactory.convertLeadToCustomer(multiServiceLead.id);

    expect(eorCustomer).toBeDefined();
    expect(aorCustomer).toBeDefined();
    expect(multiServiceCustomer).toBeDefined();

    console.log('✅ EOR客户转换成功');
    console.log('✅ AOR客户转换成功');
    console.log('✅ 多服务客户转换成功');

    console.log('🎉 多服务类型销售流程测试完成！');
  });
});