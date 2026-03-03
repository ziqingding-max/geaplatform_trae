import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CopilotService } from '../server/services/copilotService';
import { getCopilotCacheManager } from '../server/services/copilotCache';
import { cleanup } from './test-utils';

describe('CopilotService', () => {
  let copilotService: CopilotService;
  const testUserId = 1;
  const testUserRole = 'operations_manager';

  beforeEach(() => {
    copilotService = new CopilotService(testUserId, testUserRole);
  });

  afterEach(async () => {
    await cleanup.run();
    await getCopilotCacheManager().cleanup();
  });

  describe('User Configuration', () => {
    it('should create default user config when none exists', async () => {
      const config = await copilotService.getUserConfig();
      
      expect(config).toBeDefined();
      expect(config?.userId).toBe(testUserId);
      expect(config?.theme).toBe('auto');
      expect(config?.language).toBe('zh');
      expect(config?.isEnabled).toBe(true);
    });

    it('should update user configuration', async () => {
      const updateData = {
        theme: 'dark',
        language: 'en',
        position: 'top-left',
      };

      const result = await copilotService.updateUserConfig(updateData);
      expect(result).toBe(true);

      const updatedConfig = await copilotService.getUserConfig();
      expect(updatedConfig?.theme).toBe('dark');
      expect(updatedConfig?.language).toBe('en');
      expect(updatedConfig?.position).toBe('top-left');
    });
  });

  describe('Chat Message Processing', () => {
    it('should process simple chat messages', async () => {
      const message = '今天有多少员工在岗？';
      const context = {
        currentPage: '/employees',
        userRole: testUserRole,
      };

      const response = await copilotService.processChatMessage(message, context);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      expect(response.text.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(100);
    });

    it('should handle messages with payroll keywords', async () => {
      const message = '本月薪酬处理进度如何？';
      const context = {
        currentPage: '/payroll',
        userRole: testUserRole,
      };

      const response = await copilotService.processChatMessage(message, context);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      // 应该包含薪酬相关的信息
      expect(response.text.toLowerCase()).toMatch(/薪酬|工资|payroll/);
    });

    it('should handle messages with leave keywords', async () => {
      const message = '最近有多少休假申请？';
      const context = {
        currentPage: '/leave',
        userRole: testUserRole,
      };

      const response = await copilotService.processChatMessage(message, context);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      // 应该包含休假相关的信息
      expect(response.text.toLowerCase()).toMatch(/休假|请假|leave/);
    });

    it('should respect user role permissions', async () => {
      const financeService = new CopilotService(testUserId, 'finance_manager');
      const message = '本月财务数据如何？';
      
      const response = await financeService.processChatMessage(message);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      // 财务经理应该能访问财务数据
      expect(response.text.toLowerCase()).toMatch(/财务|发票|invoice|financial/);
    });

    it('should handle file attachments', async () => {
      const message = '请分析这个文件';
      const attachments = [
        {
          type: 'file' as const,
          url: 'https://example.com/test.pdf',
          name: 'test.pdf',
          mimeType: 'application/pdf',
        },
      ];

      const response = await copilotService.processChatMessage(message, undefined, attachments);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      // 应该提到文件分析
      expect(response.text.toLowerCase()).toMatch(/文件|分析|file|analysis/);
    });
  });

  describe('Data Context Building', () => {
    it('should build appropriate data context based on message content', async () => {
      const message = '显示本月薪酬统计';
      const context = {
        currentPage: '/payroll',
        userRole: testUserRole,
      };

      // 这里应该测试私有方法，但为了测试覆盖率，我们测试公共方法的行为
      const response = await copilotService.processChatMessage(message, context);
      
      expect(response).toBeDefined();
      expect(response.text).toContain('薪酬');
    });

    it('should limit data access based on user role', async () => {
      const userService = new CopilotService(testUserId, 'user');
      const message = '查看所有财务数据';
      
      const response = await userService.processChatMessage(message);
      
      expect(response).toBeDefined();
      // 普通用户不应该能访问敏感的财务数据
      expect(response.text.toLowerCase()).not.toMatch(/具体.*财务.*数据/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const invalidMessage = '';
      
      // 空消息应该被拒绝或返回友好的错误信息
      await expect(copilotService.processChatMessage(invalidMessage))
        .rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      // 模拟数据库错误
      const originalGetDb = require('../server/db').getDb;
      require('../server/db').getDb = () => {
        throw new Error('Database connection failed');
      };

      await expect(copilotService.processChatMessage('测试消息'))
        .rejects.toThrow('处理消息时发生错误');

      // 恢复原始函数
      require('../server/db').getDb = originalGetDb;
    });
  });

  describe('Performance and Caching', () => {
    it('should utilize cache for repeated requests', async () => {
      const message = '缓存测试消息';
      const context = { userRole: testUserRole };

      const start1 = Date.now();
      const response1 = await copilotService.processChatMessage(message, context);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const response2 = await copilotService.processChatMessage(message, context);
      const time2 = Date.now() - start2;

      expect(response1.text).toBe(response2.text);
      // 第二次应该更快（缓存命中）
      expect(time2).toBeLessThanOrEqual(time1);
    });

    it('should handle cache invalidation', async () => {
      const cacheManager = getCopilotCacheManager();
      
      // 先填充缓存
      await copilotService.processChatMessage('缓存测试', { userRole: testUserRole });
      
      // 验证缓存存在
      const cacheStatsBefore = cacheManager.getCacheStats();
      expect(cacheStatsBefore.userConfig.size).toBeGreaterThan(0);
      
      // 清除用户缓存
      await cacheManager.invalidateUserCache(testUserId);
      
      // 验证缓存被清除
      const cacheStatsAfter = cacheManager.getCacheStats();
      expect(cacheStatsAfter.userConfig.size).toBe(0);
    });
  });

  describe('Security and Privacy', () => {
    it('should not expose sensitive data in responses', async () => {
      const message = '显示所有员工的银行账号';
      
      const response = await copilotService.processChatMessage(message);
      
      expect(response).toBeDefined();
      // 不应该包含敏感的银行信息
      expect(response.text.toLowerCase()).not.toMatch(/银行|账号|bank|account/);
      // 应该提供安全的替代方案
      expect(response.text.toLowerCase()).toMatch(/权限|安全|privacy|permission/);
    });

    it('should sanitize user input', async () => {
      const maliciousMessage = '<script>alert("xss")</script>';
      
      const response = await copilotService.processChatMessage(maliciousMessage);
      
      expect(response).toBeDefined();
      // 响应不应该包含未转义的脚本标签
      expect(response.text).not.toContain('<script>');
      expect(response.text).not.toContain('alert(');
    });
  });
});