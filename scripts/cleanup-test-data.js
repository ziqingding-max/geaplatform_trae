#!/usr/bin/env node

/**
 * 物理删除测试数据脚本
 * 删除所有CUS-930xxx、CUS-960xxx和CUS-990001系列的测试客户数据
 */

import { db } from '../server/db.js';
import { customers, employees, invoices, invoiceItems } from '../drizzle/schema.js';
import { like, or, and, inArray } from 'drizzle-orm';

async function cleanupTestData() {
  console.log('🧹 开始清理测试数据...');
  
  try {
    // 1. 找出所有测试客户的ID
    const testCustomers = await db
      .select({
        id: customers.id,
        clientCode: customers.clientCode,
        companyName: customers.companyName
      })
      .from(customers)
      .where(
        or(
          like(customers.clientCode, 'CUS-930%'),
          like(customers.clientCode, 'CUS-960%'),
          like(customers.clientCode, 'CUS-990%')
        )
      );

    console.log(`📊 发现 ${testCustomers.length} 个测试客户:`);
    testCustomers.forEach(customer => {
      console.log(`  - ${customer.clientCode}: ${customer.companyName}`);
    });

    if (testCustomers.length === 0) {
      console.log('✅ 没有找到测试数据需要清理');
      return;
    }

    const customerIds = testCustomers.map(c => c.id);

    // 2. 删除与测试客户相关的所有员工数据
    console.log('👥 删除测试客户相关的员工数据...');
    const deletedEmployees = await db
      .delete(employees)
      .where(inArray(employees.customerId, customerIds));
    console.log(`✅ 删除了 ${deletedEmployees.rowsAffected} 条员工记录`);

    // 3. 删除与测试客户相关的发票明细
    console.log('📄 删除测试客户相关的发票明细...');
    const deletedInvoiceItems = await db
      .delete(invoiceItems)
      .where(inArray(invoiceItems.customerId, customerIds));
    console.log(`✅ 删除了 ${deletedInvoiceItems.rowsAffected} 条发票明细记录`);

    // 4. 删除与测试客户相关的发票
    console.log('📋 删除测试客户相关的发票...');
    const deletedInvoices = await db
      .delete(invoices)
      .where(inArray(invoices.customerId, customerIds));
    console.log(`✅ 删除了 ${deletedInvoices.rowsAffected} 条发票记录`);

    // 5. 最后删除测试客户本身
    console.log('🏢 删除测试客户...');
    const deletedCustomers = await db
      .delete(customers)
      .where(inArray(customers.id, customerIds));
    console.log(`✅ 删除了 ${deletedCustomers.rowsAffected} 条客户记录`);

    console.log('\n🎉 测试数据清理完成！');
    console.log('📈 清理统计:');
    console.log(`  - 客户: ${deletedCustomers.rowsAffected}`);
    console.log(`  - 员工: ${deletedEmployees.rowsAffected}`);
    console.log(`  - 发票: ${deletedInvoices.rowsAffected}`);
    console.log(`  - 发票明细: ${deletedInvoiceItems.rowsAffected}`);

  } catch (error) {
    console.error('❌ 清理测试数据时出错:', error);
    process.exit(1);
  }
}

// 执行清理
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupTestData()
    .then(() => {
      console.log('\n✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { cleanupTestData };