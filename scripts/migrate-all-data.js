#!/usr/bin/env node

/**
 * 完整数据迁移脚本
 * 按照策略导入数据：
 * 1. 系统配置数据使用 data-exports
 * 2. 客户、员工、发票数据使用 seed-migration-data
 */

import { db } from '../server/db.js';
import { 
  countriesConfig, 
  leaveTypes, 
  publicHolidays, 
  systemConfig,
  customers,
  employees,
  invoices,
  invoiceItems,
  customerPricing,
  customerContracts,
  customerLeavePolicies
} from '../drizzle/schema.js';
import { cleanupTestData } from './cleanup-test-data.js';
import fs from 'fs/promises';
import path from 'path';

// 基础配置数据导入
async function importBaselineData() {
  console.log('📊 开始导入系统基础数据...');
  
  try {
    // 1. 导入国家配置
    console.log('🌍 导入国家配置...');
    const countriesData = JSON.parse(
      await fs.readFile('./data-exports/baseline/countries_config.json', 'utf-8')
    );
    await db.insert(countriesConfig).values(countriesData);
    console.log(`✅ 导入 ${countriesData.length} 个国家配置`);

    // 2. 导入假期类型
    console.log('📅 导入假期类型...');
    const leaveTypesData = JSON.parse(
      await fs.readFile('./data-exports/baseline/leave_types.json', 'utf-8')
    );
    await db.insert(leaveTypes).values(leaveTypesData);
    console.log(`✅ 导入 ${leaveTypesData.length} 种假期类型`);

    // 3. 导入公共假期
    console.log('🎉 导入公共假期...');
    const holidaysData = JSON.parse(
      await fs.readFile('./data-exports/baseline/public_holidays.json', 'utf-8')
    );
    await db.insert(publicHolidays).values(holidaysData);
    console.log(`✅ 导入 ${holidaysData.length} 个公共假期`);

    // 4. 导入系统配置
    console.log('⚙️ 导入系统配置...');
    const systemConfigData = JSON.parse(
      await fs.readFile('./data-exports/baseline/system_config.json', 'utf-8')
    );
    await db.insert(systemConfig).values(systemConfigData);
    console.log(`✅ 导入 ${systemConfigData.length} 项系统配置`);

  } catch (error) {
    console.error('❌ 导入基础数据失败:', error);
    throw error;
  }
}

// 核心业务数据导入（使用seed-migration-data）
async function importCoreBusinessData() {
  console.log('💼 开始导入核心业务数据...');
  
  try {
    const seedData = JSON.parse(
      await fs.readFile('./data/seed-migration-data.json', 'utf-8')
    );

    // 1. 导入客户数据（31家实际业务客户）
    console.log('🏢 导入客户数据...');
    await db.insert(customers).values(seedData.customers);
    console.log(`✅ 导入 ${seedData.customers.length} 家客户`);

    // 2. 导入员工数据
    console.log('👥 导入员工数据...');
    await db.insert(employees).values(seedData.employees);
    console.log(`✅ 导入 ${seedData.employees.length} 名员工`);

    // 3. 导入发票数据（如果有的话）
    if (seedData.invoices && seedData.invoices.length > 0) {
      console.log('📄 导入发票数据...');
      await db.insert(invoices).values(seedData.invoices);
      console.log(`✅ 导入 ${seedData.invoices.length} 张发票`);
    }

    // 4. 导入发票明细（如果有的话）
    if (seedData.invoiceItems && seedData.invoiceItems.length > 0) {
      console.log('📋 导入发票明细...');
      await db.insert(invoiceItems).values(seedData.invoiceItems);
      console.log(`✅ 导入 ${seedData.invoiceItems.length} 条发票明细`);
    }

  } catch (error) {
    console.error('❌ 导入核心业务数据失败:', error);
    throw error;
  }
}

// 补充业务数据导入（使用data-exports）
async function importSupplementaryData() {
  console.log('📈 开始导入补充业务数据...');
  
  try {
    // 1. 导入客户定价
    console.log('💰 导入客户定价...');
    const pricingData = JSON.parse(
      await fs.readFile('./data-exports/production/customer_pricing.json', 'utf-8')
    );
    if (pricingData.length > 0) {
      await db.insert(customerPricing).values(pricingData);
      console.log(`✅ 导入 ${pricingData.length} 条客户定价`);
    }

    // 2. 导入客户合同
    console.log('📋 导入客户合同...');
    const contractsData = JSON.parse(
      await fs.readFile('./data-exports/production/customer_contracts.json', 'utf-8')
    );
    if (contractsData.length > 0) {
      await db.insert(customerContracts).values(contractsData);
      console.log(`✅ 导入 ${contractsData.length} 份客户合同`);
    }

    // 3. 导入客户假期政策
    console.log('🏖️ 导入客户假期政策...');
    const leavePoliciesData = JSON.parse(
      await fs.readFile('./data-exports/production/customer_leave_policies.json', 'utf-8')
    );
    if (leavePoliciesData.length > 0) {
      await db.insert(customerLeavePolicies).values(leavePoliciesData);
      console.log(`✅ 导入 ${leavePoliciesData.length} 项假期政策`);
    }

  } catch (error) {
    console.error('❌ 导入补充业务数据失败:', error);
    throw error;
  }
}

// 数据验证函数
async function validateImport() {
  console.log('🔍 开始数据验证...');
  
  try {
    const results = await db.execute(`
      SELECT 
        'countries_config' as table_name, 
        COUNT(*) as count, 
        '126' as expected
      FROM countries_config
      UNION ALL
      SELECT 
        'leave_types', 
        COUNT(*), 
        '767'
      FROM leave_types
      UNION ALL
      SELECT 
        'public_holidays', 
        COUNT(*), 
        '1312'
      FROM public_holidays
      UNION ALL
      SELECT 
        'customers', 
        COUNT(*), 
        '31'
      FROM customers
      UNION ALL
      SELECT 
        'employees', 
        COUNT(*), 
        '105'
      FROM employees
    `);

    console.log('\n📊 数据验证结果:');
    console.log('表名                | 实际数量 | 期望数量 | 状态');
    console.log('-------------------|----------|----------|-------');
    
    results.rows.forEach(row => {
      const status = parseInt(row.count) === parseInt(row.expected) ? '✅' : '❌';
      console.log(`${row.table_name.padEnd(18)} | ${row.count.padEnd(8)} | ${row.expected.padEnd(8)} | ${status}`);
    });

    return results;
  } catch (error) {
    console.error('❌ 数据验证失败:', error);
    throw error;
  }
}

// 主执行函数
async function main() {
  console.log('🚀 开始完整数据迁移流程...\n');
  
  try {
    // 1. 清理测试数据
    console.log('🧹 第一步：清理测试数据');
    await cleanupTestData();
    console.log('');

    // 2. 导入系统基础数据
    console.log('📊 第二步：导入系统基础数据');
    await importBaselineData();
    console.log('');

    // 3. 导入核心业务数据
    console.log('💼 第三步：导入核心业务数据');
    await importCoreBusinessData();
    console.log('');

    // 4. 导入补充业务数据
    console.log('📈 第四步：导入补充业务数据');
    await importSupplementaryData();
    console.log('');

    // 5. 数据验证
    console.log('🔍 第五步：数据验证');
    await validateImport();

    console.log('\n🎉 数据迁移完成！');
    console.log('✅ 所有数据已成功导入并验证');

  } catch (error) {
    console.error('\n❌ 数据迁移失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✅ 迁移脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 迁移脚本执行失败:', error);
      process.exit(1);
    });
}

export { 
  main, 
  cleanupTestData, 
  importBaselineData, 
  importCoreBusinessData, 
  importSupplementaryData, 
  validateImport 
};