#!/usr/bin/env node

/**
 * 数据迁移执行脚本（简化版）
 * 不依赖tsx，直接使用Node.js执行
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 模拟数据库操作（实际使用时需要连接到真实数据库）
class MockDB {
  constructor() {
    this.data = {
      customers: [],
      employees: [],
      invoices: [],
      countries_config: [],
      leave_types: [],
      public_holidays: [],
      system_config: []
    };
  }

  async select(table, conditions = {}) {
    let results = this.data[table] || [];
    
    // 简单的条件过滤
    if (conditions.where) {
      results = results.filter(row => {
        for (const [key, value] of Object.entries(conditions.where)) {
          if (value && !row[key]?.toString().includes(value.toString().replace('%', ''))) {
            return false;
          }
        }
        return true;
      });
    }
    
    return results;
  }

  async delete(table, conditions) {
    const beforeCount = this.data[table]?.length || 0;
    
    if (conditions.where && this.data[table]) {
      this.data[table] = this.data[table].filter(row => {
        for (const condition of conditions.where) {
          if (condition.type === 'like') {
            const field = condition.field;
            const pattern = condition.pattern.replace('%', '');
            if (row[field]?.toString().includes(pattern)) {
              return false;
            }
          }
        }
        return true;
      });
    }
    
    const afterCount = this.data[table]?.length || 0;
    return { rowsAffected: beforeCount - afterCount };
  }

  async insert(table, data) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    
    if (Array.isArray(data)) {
      this.data[table].push(...data);
      return { rowsAffected: data.length };
    } else {
      this.data[table].push(data);
      return { rowsAffected: 1 };
    }
  }

  async count(table) {
    return this.data[table]?.length || 0;
  }
}

// 模拟数据库实例
const mockDB = new MockDB();

// 加载测试数据
async function loadTestData() {
  try {
    // 加载客户数据
    const customersPath = join(__dirname, '../data/data-exports/production/customers.json');
    const customersData = JSON.parse(readFileSync(customersPath, 'utf-8'));
    mockDB.data.customers = customersData;
    console.log(`📊 加载了 ${customersData.length} 条客户数据`);
    
    return customersData;
  } catch (error) {
    console.error('❌ 加载测试数据失败:', error.message);
    return [];
  }
}

// 清理测试数据
async function cleanupTestData() {
  console.log('🧹 开始清理测试数据...');
  
  try {
    // 1. 找出所有测试客户的ID
    const testCustomers = await mockDB.select('customers', {
      where: {
        clientCode: 'CUS-930%'
      }
    });

    // 更精确地查找测试客户
    const allCustomers = mockDB.data.customers || [];
    const testCustomersFiltered = allCustomers.filter(customer => {
      const code = customer.clientCode;
      return code && (
        code.startsWith('CUS-930') || 
        code.startsWith('CUS-960') || 
        code.startsWith('CUS-990')
      );
    });

    console.log(`📊 发现 ${testCustomersFiltered.length} 个测试客户:`);
    testCustomersFiltered.forEach(customer => {
      console.log(`  - ${customer.clientCode}: ${customer.companyName}`);
    });

    if (testCustomersFiltered.length === 0) {
      console.log('✅ 没有找到测试数据需要清理');
      return;
    }

    // 2. 模拟删除操作
    const originalCount = allCustomers.length;
    mockDB.data.customers = allCustomers.filter(customer => {
      const code = customer.clientCode;
      return !(code && (
        code.startsWith('CUS-930') || 
        code.startsWith('CUS-960') || 
        code.startsWith('CUS-990')
      ));
    });
    
    const deletedCount = originalCount - mockDB.data.customers.length;
    console.log(`✅ 删除了 ${deletedCount} 条测试客户记录`);
    console.log(`📈 剩余 ${mockDB.data.customers.length} 条实际业务客户记录`);

    console.log('\n🎉 测试数据清理完成！');

  } catch (error) {
    console.error('❌ 清理测试数据时出错:', error.message);
    process.exit(1);
  }
}

// 检查迁移状态
async function checkMigrationStatus() {
  console.log('🔍 检查数据迁移状态...\n');
  
  try {
    const customers = mockDB.data.customers || [];
    
    // 1. 检查测试数据
    const testCustomers = customers.filter(customer => {
      const code = customer.clientCode;
      return code && (
        code.startsWith('CUS-930') || 
        code.startsWith('CUS-960') || 
        code.startsWith('CUS-990')
      );
    });

    const realCustomers = customers.filter(customer => {
      const code = customer.clientCode;
      return code && (
        code.startsWith('CUS-330')
      );
    });

    console.log('📊 数据状态统计:');
    console.log(`  总客户数: ${customers.length}`);
    console.log(`  实际业务客户: ${realCustomers.length}`);
    console.log(`  测试客户: ${testCustomers.length}`);

    // 2. 提供迁移建议
    console.log('\n💡 迁移建议:');
    
    if (testCustomers.length > 0) {
      console.log('  1. 🔧 需要清理测试数据');
    }
    
    if (realCustomers.length === 0) {
      console.log('  2. 📥 需要导入实际业务数据');
    } else if (realCustomers.length === 31) {
      console.log('  2. ✅ 实际业务数据完整（31家客户）');
    } else {
      console.log(`  2. ⚠️  实际业务数据不完整（${realCustomers.length}/31）`);
    }

    // 3. 显示部分客户列表
    if (customers.length > 0) {
      console.log('\n📋 客户代码检查:');
      const displayCustomers = customers.slice(0, 10);
      displayCustomers.forEach(customer => {
        const isTest = customer.clientCode?.match(/CUS-(930|960|990)/) ? ' (测试)' : '';
        console.log(`    ${customer.clientCode}: ${customer.companyName}${isTest}`);
      });
      
      if (customers.length > 10) {
        console.log(`    ... 还有 ${customers.length - 10} 个客户`);
      }
    }

    return {
      totalCustomers: customers.length,
      realCustomers: realCustomers.length,
      testCustomers: testCustomers.length,
      needsCleanup: testCustomers.length > 0,
      needsImport: realCustomers.length === 0,
      isComplete: realCustomers.length === 31 && testCustomers.length === 0
    };

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.log('🚀 开始数据迁移检查流程...\n');
  
  try {
    // 1. 加载数据
    await loadTestData();
    console.log('');

    // 2. 检查状态
    const status = await checkMigrationStatus();
    console.log('');

    // 3. 根据状态执行相应操作
    if (status.needsCleanup) {
      console.log('🧹 发现测试数据，开始清理...');
      await cleanupTestData();
      console.log('');
    }

    if (status.needsImport) {
      console.log('📥 需要导入实际业务数据');
      console.log('   请使用完整的数据迁移脚本');
    }

    if (status.isComplete) {
      console.log('🎉 数据迁移状态：完整');
      console.log('✅ 所有数据已正确配置');
    } else {
      console.log('⚠️  数据迁移状态：需要处理');
    }

  } catch (error) {
    console.error('\n❌ 流程执行失败:', error.message);
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✅ 流程执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 流程执行失败:', error.message);
      process.exit(1);
    });
}

export { 
  main, 
  cleanupTestData, 
  checkMigrationStatus, 
  loadTestData,
  mockDB 
};