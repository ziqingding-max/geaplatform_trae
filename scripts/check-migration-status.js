#!/usr/bin/env node

/**
 * 数据迁移检查脚本
 * 检查当前数据库状态并提供迁移建议
 */

import { db } from '../server/db.js';
import { 
  countriesConfig, 
  leaveTypes, 
  publicHolidays, 
  systemConfig,
  customers,
  employees,
  invoices
} from '../drizzle/schema.js';
import { like, or, count } from 'drizzle-orm';

async function checkMigrationStatus() {
  console.log('🔍 检查数据迁移状态...\n');
  
  try {
    // 1. 检查基础数据
    console.log('📊 基础数据状态:');
    const baselineStatus = await db.execute(`
      SELECT 
        'countries_config' as table_name,
        (SELECT COUNT(*) FROM countries_config) as current_count,
        '126' as expected_count
      UNION ALL
      SELECT 
        'leave_types',
        (SELECT COUNT(*) FROM leave_types),
        '767'
      UNION ALL
      SELECT 
        'public_holidays',
        (SELECT COUNT(*) FROM public_holidays),
        '1312'
      UNION ALL
      SELECT 
        'system_config',
        (SELECT COUNT(*) FROM system_config),
        '6'
    `);

    baselineStatus.rows.forEach(row => {
      const status = parseInt(row.current_count) === parseInt(row.expected_count) ? '✅' : '❌';
      const percentage = Math.round((parseInt(row.current_count) / parseInt(row.expected_count)) * 100);
      console.log(`  ${row.table_name.padEnd(18)} | ${row.current_count.padEnd(3)}/${row.expected_count} | ${percentage}% ${status}`);
    });

    // 2. 检查业务数据
    console.log('\n💼 业务数据状态:');
    const businessStatus = await db.execute(`
      SELECT 
        'customers' as table_name,
        COUNT(*) as current_count,
        '31' as expected_count
      FROM customers
      WHERE clientCode NOT LIKE 'CUS-930%'
        AND clientCode NOT LIKE 'CUS-960%'
        AND clientCode NOT LIKE 'CUS-990%'
      UNION ALL
      SELECT 
        'employees',
        COUNT(*),
        '105'
      FROM employees
      UNION ALL
      SELECT 
        'invoices',
        COUNT(*),
        '变化'
      FROM invoices
    `);

    businessStatus.rows.forEach(row => {
      const isExpected = row.expected_count === '变化' || parseInt(row.current_count) === parseInt(row.expected_count);
      const status = isExpected ? '✅' : '❌';
      console.log(`  ${row.table_name.padEnd(18)} | ${row.current_count.padEnd(3)}${row.expected_count === '变化' ? '' : '/' + row.expected_count} | ${status}`);
    });

    // 3. 检查测试数据
    console.log('\n🧪 测试数据状态:');
    const testDataStatus = await db.execute(`
      SELECT 
        COUNT(*) as test_customers
      FROM customers
      WHERE clientCode LIKE 'CUS-930%'
         OR clientCode LIKE 'CUS-960%'
         OR clientCode LIKE 'CUS-990%'
    `);

    const testCustomerCount = testDataStatus.rows[0].test_customers;
    if (testCustomerCount > 0) {
      console.log(`  ❌ 发现 ${testCustomerCount} 个测试客户需要清理`);
    } else {
      console.log('  ✅ 没有发现测试数据');
    }

    // 4. 提供迁移建议
    console.log('\n💡 迁移建议:');
    
    const hasBaselineData = baselineStatus.rows.every(row => parseInt(row.current_count) > 0);
    const hasBusinessData = businessStatus.rows.some(row => parseInt(row.current_count) > 0);
    const hasTestData = testCustomerCount > 0;

    if (hasTestData) {
      console.log('  1. 🔧 运行: node scripts/cleanup-test-data.js');
    }
    
    if (!hasBaselineData) {
      console.log('  2. 📥 运行: node scripts/migrate-all-data.js');
    } else if (!hasBusinessData) {
      console.log('  2. 📥 核心业务数据缺失，需要导入');
    } else {
      console.log('  2. ✅ 数据迁移已完成');
    }

    // 5. 检查特定客户
    console.log('\n🔍 客户代码检查:');
    const customerCodes = await db
      .select({
        clientCode: customers.clientCode,
        companyName: customers.companyName,
        count: count()
      })
      .from(customers)
      .groupBy(customers.clientCode, customers.companyName)
      .orderBy(customers.clientCode);

    if (customerCodes.length > 0) {
      console.log(`  发现 ${customerCodes.length} 个客户:`);
      customerCodes.slice(0, 10).forEach(cust => {
        const isTest = cust.clientCode.match(/CUS-(930|960|990)/) ? ' (测试)' : '';
        console.log(`    ${cust.clientCode}: ${cust.companyName}${isTest}`);
      });
      if (customerCodes.length > 10) {
        console.log(`    ... 还有 ${customerCodes.length - 10} 个客户`);
      }
    }

    return {
      baselineData: baselineStatus.rows,
      businessData: businessStatus.rows,
      testDataCount: testCustomerCount,
      recommendations: {
        needsCleanup: hasTestData,
        needsMigration: !hasBaselineData || !hasBusinessData,
        isComplete: hasBaselineData && hasBusinessData && !hasTestData
      }
    };

  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

// 执行检查
if (import.meta.url === `file://${process.argv[1]}`) {
  checkMigrationStatus()
    .then((result) => {
      console.log('\n✅ 检查完成');
      if (result.recommendations.isComplete) {
        console.log('🎉 数据迁移状态：完整');
      } else {
        console.log('⚠️  数据迁移状态：需要处理');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 检查失败:', error);
      process.exit(1);
    });
}

export { checkMigrationStatus };