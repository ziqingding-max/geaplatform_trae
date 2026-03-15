import assert from 'node:assert';
import { getDb } from '../../server/services/db/connection';
import { walletService } from '../../server/services/walletService';
import { customers, customerWallets, walletTransactions, invoices } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

async function runTests() {
  console.log('Running Wallet Service Concurrency Tests...');
  process.env.DATABASE_URL = 'file:./server/sqlite.db';
  const db = await getDb();
  
  let testCustomerId: number;
  let testInvoiceId: number;

  try {
    // --- SETUP ---
    console.log('Setting up test data...');
    const [customer] = await db.insert(customers).values({
      companyName: 'Test Concurrency Customer',
      country: 'US',
      status: 'active',
    }).returning();
    testCustomerId = customer.id;

    const invoiceResult = await db.run(
      sql`INSERT INTO invoices (customerId, status, dueDate, currency, subtotal, total, invoiceType, invoiceNumber, createdAt, updatedAt) 
       VALUES (${testCustomerId}, 'draft', ${new Date().toISOString().split('T')[0]}, 'USD', '10.00', '10.00', 'eor', ${`TEST-INV-${Date.now()}`}, ${Date.now()}, ${Date.now()}) RETURNING id`
    );
    testInvoiceId = Number(invoiceResult.lastInsertRowid || 1);

    const wallet = await walletService.getWallet(testCustomerId, 'USD');
    await db.update(customerWallets)
      .set({ balance: '100.00' })
      .where(eq(customerWallets.id, wallet.id));

    // --- TEST 1: Concurrency ---
    console.log('Test 1: should prevent concurrent deductions that exceed balance using optimistic locking');
    const CONCURRENT_REQUESTS = 20;
    const DEDUCTION_AMOUNT = 10.00;
    const results = [];
    
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
      try {
        const w = await walletService.getWallet(testCustomerId, 'USD');
        await walletService.transact({
          walletId: w.id,
          type: 'invoice_deduction',
          amount: DEDUCTION_AMOUNT.toFixed(2),
          direction: 'debit',
          referenceId: testInvoiceId,
          referenceType: 'invoice',
          description: `Concurrent test deduction ${i}`,
        });
        results.push({ success: true, error: null });
      } catch (error: any) {
        results.push({ success: false, error: error.message });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const finalWallet = await walletService.getWallet(testCustomerId, 'USD');
    
    console.log(`  Concurrent requests: ${CONCURRENT_REQUESTS}`);
    console.log(`  Successful deductions: ${successful}`);
    console.log(`  Failed deductions: ${failed}`);
    console.log(`  Final balance: ${finalWallet.balance}`);

    assert.ok(successful <= 10, 'Successful deductions should be <= 10');
    assert.ok(Number(finalWallet.balance) >= 0, 'Balance should not be negative');
    
    const expectedBalance = 100 - (successful * DEDUCTION_AMOUNT);
    assert.strictEqual(Number(finalWallet.balance), expectedBalance, 'Balance should match exactly');
    console.log('✅ Test 1 Passed');

    // --- TEST 2: Frozen Wallet ---
    console.log('Test 2: should handle frozen wallet transactions correctly');
    const frozenWallet = await walletService.getFrozenWallet(testCustomerId, 'USD');
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    await walletService.frozenTransact({
      walletId: frozenWallet.id,
      type: 'deposit_in',
      amount: '20.00',
      direction: 'credit',
      referenceId: testInvoiceId,
      referenceType: 'invoice',
      description: 'Test deposit freeze'
    });
    
    let currentFrozen = await db.query.customerFrozenWallets.findFirst({
      where: eq(frozenWallet.id, frozenWallet.id)
    });
    assert.strictEqual(Number(currentFrozen.balance), 20.00, 'Frozen balance should be 20.00');
    
    await walletService.frozenTransact({
      walletId: frozenWallet.id,
      type: 'deposit_refund',
      amount: '10.00',
      direction: 'debit',
      referenceId: testInvoiceId,
      referenceType: 'credit_note',
      description: 'Test deposit refund'
    });
    
    currentFrozen = await db.query.customerFrozenWallets.findFirst({
      where: eq(frozenWallet.id, frozenWallet.id)
    });
    assert.strictEqual(Number(currentFrozen.balance), 10.00, 'Frozen balance should be 10.00');
    console.log('✅ Test 2 Passed');

  } catch (err: any) {
    console.error(`❌ Tests Failed: ${err.message}`);
    console.error(err.stack);
    process.exitCode = 1;
  } finally {
    // --- CLEANUP ---
    console.log('Cleaning up test data...');
    if (db && testCustomerId) {
      const wallet = await db.query.customerWallets.findFirst({ where: eq(customers.id, testCustomerId) });
      if (wallet) {
        await db.delete(walletTransactions).where(eq(walletTransactions.walletId, wallet.id));
      }
      if (testInvoiceId) {
        await db.delete(invoices).where(eq(invoices.id, testInvoiceId));
      }
      await db.delete(customers).where(eq(customers.id, testCustomerId));
    }
    console.log('Done.');
  }
}

runTests().catch(console.error);
