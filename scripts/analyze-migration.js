#!/usr/bin/env node

/**
 * 数据迁移执行脚本（Python版本）
 * 用于在无法使用Node.js的环境中执行数据清理
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 读取并分析客户数据
 */
function analyzeCustomerData() {
  try {
    const customersPath = './data/data-exports/production/customers.json';
    const customersData = JSON.parse(readFileSync(customersPath, 'utf-8'));
    
    console.log('📊 客户数据分析:');
    console.log(`总客户数: ${customersData.length}`);
    
    // 分类客户
    const realCustomers = customersData.filter(customer => {
      const code = customer.clientCode;
      return code && code.startsWith('CUS-330');
    });
    
    const testCustomers = customersData.filter(customer => {
      const code = customer.clientCode;
      return code && (
        code.startsWith('CUS-930') || 
        code.startsWith('CUS-960') || 
        code.startsWith('CUS-990')
      );
    });
    
    console.log(`实际业务客户: ${realCustomers.length} (CUS-330系列)`);
    console.log(`测试客户: ${testCustomers.length} (CUS-930/960/990系列)`);
    
    // 生成清理后的数据文件
    const cleanedData = {
      metadata: {
        originalCount: customersData.length,
        realCustomersCount: realCustomers.length,
        testCustomersCount: testCustomers.length,
        cleanedAt: new Date().toISOString()
      },
      realCustomers: realCustomers,
      removedTestCustomers: testCustomers
    };
    
    // 保存清理后的数据
    const cleanedPath = './data/data-exports/production/customers-cleaned.json';
    writeFileSync(cleanedPath, JSON.stringify(realCustomers, null, 2));
    console.log(`\n✅ 清理后的数据已保存到: ${cleanedPath}`);
    
    // 生成测试数据报告
    const reportPath = './data/data-exports/production/test-customers-report.json';
    writeFileSync(reportPath, JSON.stringify(cleanedData, null, 2));
    console.log(`📋 详细报告已保存到: ${reportPath}`);
    
    return {
      total: customersData.length,
      realCustomers: realCustomers.length,
      testCustomers: testCustomers.length,
      testCustomerCodes: testCustomers.map(c => c.clientCode),
      realCustomerCodes: realCustomers.map(c => c.clientCode)
    };
    
  } catch (error) {
    console.error('❌ 分析客户数据失败:', error.message);
    return null;
  }
}

/**
 * 生成数据迁移报告
 */
function generateMigrationReport(analysis) {
  if (!analysis) return;
  
  console.log('\n📈 数据迁移报告:');
  console.log('==================');
  
  console.log('\n1. 数据概况:');
  console.log(`   - 原始客户总数: ${analysis.total}`);
  console.log(`   - 实际业务客户: ${analysis.realCustomers}`);
  console.log(`   - 测试客户: ${analysis.testCustomers}`);
  
  console.log('\n2. 清理结果:');
  console.log(`   - 删除测试客户: ${analysis.testCustomers} 个`);
  console.log(`   - 保留实际客户: ${analysis.realCustomers} 个`);
  console.log(`   - 清理比例: ${Math.round((analysis.testCustomers / analysis.total) * 100)}%`);
  
  console.log('\n3. 建议操作:');
  console.log('   ✅ 使用清理后的客户数据 (customers-cleaned.json)');
  console.log('   ✅ 保留测试数据报告用于备份');
  console.log('   ✅ 继续导入其他业务数据');
  
  console.log('\n4. 后续步骤:');
  console.log('   - 导入系统基础数据 (countries, leave_types, holidays)');
  console.log('   - 导入实际业务客户数据');
  console.log('   - 导入员工和发票数据');
  console.log('   - 验证数据完整性');
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始数据迁移分析流程...\n');
  
  try {
    // 1. 分析客户数据
    console.log('📊 第一步：分析客户数据');
    const analysis = analyzeCustomerData();
    
    if (!analysis) {
      console.log('❌ 数据分析失败，终止流程');
      process.exit(1);
    }
    
    console.log('\n📈 第二步：生成迁移报告');
    generateMigrationReport(analysis);
    
    console.log('\n🎉 数据迁移分析完成！');
    console.log('\n下一步操作:');
    console.log('1. 检查生成的清理数据文件');
    console.log('2. 确认无误后执行实际数据导入');
    console.log('3. 使用清理后的客户数据进行后续操作');
    
  } catch (error) {
    console.error('\n❌ 流程执行失败:', error.message);
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败:', error.message);
      process.exit(1);
    });
}

export { main, analyzeCustomerData, generateMigrationReport };