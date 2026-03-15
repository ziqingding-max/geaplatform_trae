import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { checkCutoffPassed } from '../../server/utils/cutoff';

// Mock DB module
jest.mock('../../server/db', () => ({
  getSystemConfig: jest.fn().mockImplementation((key) => {
    if (key === 'payroll_cutoff_day') return Promise.resolve('4');
    if (key === 'payroll_cutoff_time') return Promise.resolve('23:59');
    return Promise.resolve(null);
  }),
  findPayrollRunByCountryMonth: jest.fn().mockImplementation(() => Promise.resolve(null)),
}));

describe('Cutoff Utility Tests', () => {
  let originalDate: any;

  beforeEach(() => {
    originalDate = global.Date;
  });

  afterEach(() => {
    global.Date = originalDate;
    jest.clearAllMocks();
  });

  // Helper to mock current system time
  const mockSystemTime = (isoString: string) => {
    const mockDate = new Date(isoString);
    // @ts-ignore
    global.Date = class extends originalDate {
      constructor(...args: any[]) {
        super(...args);
        if (args.length === 0) return mockDate;
        return new originalDate(...args);
      }
      static now() {
        return mockDate.getTime();
      }
    };
  };

  it('should return cutoff NOT passed when current time is BEFORE the 4th of next month (Beijing Time)', async () => {
    // Payroll Month: 2026-02
    // Cutoff: 2026-03-04 23:59:00 (UTC+8) -> 2026-03-04 15:59:00 (UTC)
    
    // Current time: March 4, 2026, 10:00:00 UTC (18:00 Beijing time) - BEFORE cutoff
    mockSystemTime('2026-03-04T10:00:00.000Z');
    
    const result = await checkCutoffPassed('2026-02-01');
    
    expect(result.passed).toBe(false);
  });

  it('should return cutoff PASSED when current time is AFTER the 4th of next month (Beijing Time)', async () => {
    // Payroll Month: 2026-02
    // Cutoff: 2026-03-04 23:59:00 (UTC+8) -> 2026-03-04 15:59:00 (UTC)
    
    // Current time: March 4, 2026, 16:05:00 UTC (00:05 March 5 Beijing time) - AFTER cutoff
    mockSystemTime('2026-03-04T16:05:00.000Z');
    
    const result = await checkCutoffPassed('2026-02-01');
    
    expect(result.passed).toBe(true);
  });

  it('should handle cross-year cutoff correctly (December payroll)', async () => {
    // Payroll Month: 2026-12
    // Cutoff: 2027-01-04 23:59:00 (UTC+8) -> 2027-01-04 15:59:00 (UTC)
    
    // Current time: Jan 4, 2027, 10:00:00 UTC - BEFORE cutoff
    mockSystemTime('2027-01-04T10:00:00.000Z');
    let result = await checkCutoffPassed('2026-12-01');
    expect(result.passed).toBe(false);

    // Current time: Jan 4, 2027, 16:05:00 UTC - AFTER cutoff
    mockSystemTime('2027-01-04T16:05:00.000Z');
    result = await checkCutoffPassed('2026-12-01');
    expect(result.passed).toBe(true);
  });
  
  it('should handle leap year correctly', async () => {
    // Payroll Month: 2024-02 (Leap year)
    // Cutoff: 2024-03-04 23:59:00 (UTC+8)
    
    // Current time: Feb 29, 2024, 10:00:00 UTC - BEFORE cutoff
    mockSystemTime('2024-02-29T10:00:00.000Z');
    let result = await checkCutoffPassed('2024-02-01');
    expect(result.passed).toBe(false);
  });
});
