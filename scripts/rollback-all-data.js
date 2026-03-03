#!/usr/bin/env node

/**
 * 数据回滚脚本
 * 在导入失败时恢复数据
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

async function rollbackAllData() {
  console.log('🔄 开始数据回滚...');
  
  try {
    // 按照依赖关系的逆序删除数据
    console.log('🗑️ 删除客户假期政策...');
    await db.delete(customerLeavePolicies);
    
    console.log('🗑️ 删除客户合同...');
    await db.delete(customerContracts);
    
    console.log('🗑️ 删除客户定价...');
    await db.delete(customerPricing);
    
    console.log('🗑️ 删除发票明细...');
    await db.delete(invoiceItems);
    
    console.log('🗑️ 删除发票...');
    await db.delete(invoices);
    
    console.log('🗑️ 删除员工...');
    await db.delete(employees);
    
    console.log('🗑️ 删除客户...');
    await db.delete(customers);
    
    console.log('🗑️ 删除系统配置...');
    await db.delete(systemConfig);
    
    console.log('🗑️ 删除公共假期...');
    await db.delete(publicHolidays);
    
    console.log('🗑️ 删除假期类型...');
    await db.delete(leaveTypes);
    
    console.log('🗑️ 删除国家配置...');
    await db.delete(countriesConfig);
    
    console.log('\n✅ 数据回滚完成！');
    console.log('所有导入的数据已被删除');

  } catch (error) {
    console.error('❌ 数据回滚失败:', error);
    process.exit(1);
  }
}

// 执行回滚
if (import.meta.url === `file://${process.argv[1]}`) {
  rollbackAllData()
    .then(() => {
      console.log('\n✅ 回滚脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 回滚脚本执行失败:', error);
      process.exit(1);
    });
}

export { rollbackAllData };