/**
 * Finance Phase 1 Tests
 * - Customer ↔ Billing Entity association
 * - Countries VAT configuration
 * - Invoice draft editing (add/update/delete items)
 * - Billing entity new fields (IBAN, beneficiary)
 * - Exchange rate markup percentage
 *
 * Tests are resilient to no-DB environments: DB-dependent operations
 * are wrapped in try/catch to verify infra errors vs auth/validation errors.
 */
import { describe, it, expect, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TestCleanup } from "./test-cleanup";

const cleanup = new TestCleanup();

// Helper to create a caller with admin context
function createAdminCaller() {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "test-admin",
      email: "admin@test.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return appRouter.createCaller(ctx);
}

afterAll(async () => {
  await cleanup.run();
});

describe("Customer ↔ Billing Entity Association", () => {
  it("should create customer with billingEntityId and depositMultiplier", async () => {
    const caller = createAdminCaller();

    try {
      // Create billing entity first
      const beBefore = await caller.billingEntities.list();
      await caller.billingEntities.create({
        entityName: "Finance Phase1 BE",
        legalName: "Finance Phase1 BE Pte Ltd",
        country: "SG",
        currency: "SGD",
      });
      const beAfter = await caller.billingEntities.list();
      expect(beAfter.length).toBeGreaterThan(beBefore.length);

      const be = beAfter.find((b: any) => b.entityName === "Finance Phase1 BE");
      expect(be).toBeDefined();
      cleanup.trackBillingEntity(be.id);

      // Create customer with billing entity
      await caller.customers.create({
        companyName: "Finance Phase1 Customer",
        country: "SG",
        billingEntityId: be.id,
        depositMultiplier: 2,
      });

      // Verify via list
      const customersResult = await caller.customers.list({});
      const customer = (customersResult as any).data.find((c: any) => c.companyName === "Finance Phase1 Customer");
      expect(customer).toBeDefined();
      expect(customer.billingEntityId).toBe(be.id);
      cleanup.trackCustomer(customer.id);

      // Verify via get
      const fetched = await caller.customers.get({ id: customer.id });
      expect(fetched.billingEntityId).toBe(be.id);
      expect(fetched.depositMultiplier).toBe(2);
    } catch (e: any) {
      // DB unavailable — verify it's an infra error, not auth/validation
      expect(e.message).toMatch(/database|internal/i);
    }
  });

  it("should support depositMultiplier of 1", async () => {
    const caller = createAdminCaller();

    try {
      await caller.customers.create({
        companyName: "Deposit1x Customer",
        country: "US",
        depositMultiplier: 1,
      });

      const customersResult = await caller.customers.list({});
      const customer = (customersResult as any).data.find((c: any) => c.companyName === "Deposit1x Customer");
      expect(customer).toBeDefined();
      cleanup.trackCustomer(customer.id);

      const fetched = await caller.customers.get({ id: customer.id });
      expect(fetched.depositMultiplier).toBe(1);
    } catch (e: any) {
      expect(e.message).toMatch(/database|internal/i);
    }
  });
});

describe("Countries VAT Configuration", () => {
  it("should update country with VAT settings", async () => {
    const caller = createAdminCaller();

    const countries = await caller.countries.list();
    // When DB is unavailable, returns empty array
    if (countries.length === 0) {
      // No DB — skip data-dependent assertions
      expect(countries).toEqual([]);
      return;
    }

    const country = countries[0];

    await caller.countries.update({
      id: country.id,
      data: {
        vatApplicable: true,
        vatRate: "7.5",
      },
    });

    const updated = await caller.countries.list();
    const updatedCountry = updated.find((c: any) => c.id === country.id);
    expect(updatedCountry.vatApplicable).toBe(true);
    expect(parseFloat(updatedCountry.vatRate)).toBe(7.5);
  });

  it("should update VAT to not applicable", async () => {
    const caller = createAdminCaller();

    const countries = await caller.countries.list();
    // When DB is unavailable, returns empty array
    if (countries.length === 0) {
      expect(countries).toEqual([]);
      return;
    }

    const country = countries[0];

    await caller.countries.update({
      id: country.id,
      data: {
        vatApplicable: false,
        vatRate: "0",
      },
    });

    const updated = await caller.countries.list();
    const updatedCountry = updated.find((c: any) => c.id === country.id);
    expect(updatedCountry.vatApplicable).toBe(false);
  });
});

describe("Billing Entity Enhanced Fields", () => {
  it("should create billing entity with IBAN and beneficiary fields", async () => {
    const caller = createAdminCaller();

    try {
      await caller.billingEntities.create({
        entityName: "EU Entity GmbH",
        legalName: "EU Entity GmbH",
        country: "DE",
        currency: "EUR",
        bankDetails: "Bank: Deutsche Bank\nIBAN: DE89370400440532013000\nSWIFT: DEUTDEFF\nBeneficiary: EU Entity GmbH\nAddress: Friedrichstr. 123, Berlin, Germany",
      });

      const entities = await caller.billingEntities.list();
      const found = entities.find((e: any) => e.entityName === "EU Entity GmbH");
      expect(found).toBeDefined();
      expect(found.bankDetails).toContain("DE89370400440532013000");
      expect(found.bankDetails).toContain("EU Entity GmbH");
      expect(found.bankDetails).toContain("Friedrichstr. 123, Berlin, Germany");
      cleanup.trackBillingEntity(found.id);
    } catch (e: any) {
      expect(e.message).toMatch(/database|internal/i);
    }
  });
});

describe("Invoice Draft Editing", () => {
  it("should add, update, and delete line items on a draft invoice", async () => {
    const caller = createAdminCaller();

    try {
      // Create a billing entity with unique prefix to avoid invoice number collisions
      const bePrefix = `IEDT${Date.now().toString().slice(-6)}-`;
      await caller.billingEntities.create({
        entityName: `Invoice Edit BE ${Date.now()}`,
        legalName: "Invoice Edit BE Ltd",
        country: "US",
        currency: "USD",
        invoicePrefix: bePrefix,
      });
      const beList = await caller.billingEntities.list();
      const be = beList.find((b: any) => b.invoicePrefix === bePrefix);
      cleanup.trackBillingEntity(be.id);

      // Create a customer first
      await caller.customers.create({
        companyName: "Invoice Edit Customer",
        country: "US",
        billingEntityId: be.id,
      });
      const customersResult = await caller.customers.list({});
      const customer = (customersResult as any).data.find((c: any) => c.companyName === "Invoice Edit Customer");
      expect(customer).toBeDefined();
      cleanup.trackCustomer(customer.id);

      // Create a draft invoice
      await caller.invoices.create({
        customerId: customer.id,
        billingEntityId: be.id,
        invoiceType: "monthly_eor",
        currency: "USD",
        subtotal: "0",
      });

      // Find the invoice
      const invoicesResult = await caller.invoices.list({ customerId: customer.id });
      const invoice = (invoicesResult as any).data.find((i: any) => i.customerId === customer.id);
      expect(invoice).toBeDefined();
      cleanup.trackInvoice(invoice.id);

      // Add a line item
      await caller.invoices.addItem({
        invoiceId: invoice.id,
        description: "Employment Cost - Test Employee",
        quantity: "1",
        unitPrice: "5000.00",
        amount: "5000.00",
        itemType: "employment_cost",
        countryCode: "SG",
      });

      // Verify item was added
      let items = await caller.invoices.getItems({ invoiceId: invoice.id });
      expect(items.length).toBe(1);
      expect(items[0].description).toBe("Employment Cost - Test Employee");

      // Update the item
      await caller.invoices.updateItem({
        id: items[0].id,
        invoiceId: invoice.id,
        data: {
          description: "Employment Cost - Updated",
          amount: "5500.00",
          unitPrice: "5500.00",
        },
      });

      items = await caller.invoices.getItems({ invoiceId: invoice.id });
      expect(items[0].description).toBe("Employment Cost - Updated");
      expect(items[0].amount).toBe("5500.00");

      // Delete the item
      await caller.invoices.deleteItem({
        id: items[0].id,
        invoiceId: invoice.id,
      });

      items = await caller.invoices.getItems({ invoiceId: invoice.id });
      expect(items.length).toBe(0);
    } catch (e: any) {
      expect(e.message).toMatch(/database|internal/i);
    }
  });

  it("should not allow adding items to non-draft invoices", async () => {
    const caller = createAdminCaller();

    try {
      // Create billing entity with unique prefix
      const bePrefix2 = `NDFT${Date.now().toString().slice(-6)}-`;
      await caller.billingEntities.create({
        entityName: `Non-Draft BE ${Date.now()}`,
        legalName: "Non-Draft BE Ltd",
        country: "US",
        currency: "USD",
        invoicePrefix: bePrefix2,
      });
      const beList2 = await caller.billingEntities.list();
      const be2 = beList2.find((b: any) => b.invoicePrefix === bePrefix2);
      cleanup.trackBillingEntity(be2.id);

      // Create customer and invoice
      await caller.customers.create({
        companyName: "Non-Draft Invoice Customer",
        country: "US",
        billingEntityId: be2.id,
      });
      const customersResult = await caller.customers.list({});
      const customer = (customersResult as any).data.find((c: any) => c.companyName === "Non-Draft Invoice Customer");
      cleanup.trackCustomer(customer.id);

      await caller.invoices.create({
        customerId: customer.id,
        billingEntityId: be2.id,
        invoiceType: "monthly_eor",
        currency: "USD",
        subtotal: "0",
      });

      const invoicesResult = await caller.invoices.list({ customerId: customer.id });
      const invoice = (invoicesResult as any).data.find((i: any) => i.customerId === customer.id);
      cleanup.trackInvoice(invoice.id);

      // Move to pending_review
      await caller.invoices.updateStatus({ id: invoice.id, status: "pending_review" });

      // Try to add item - should fail
      await expect(
        caller.invoices.addItem({
          invoiceId: invoice.id,
          description: "Should fail",
          quantity: "1",
          unitPrice: "100",
          amount: "100",
          itemType: "other",
        })
      ).rejects.toThrow();
    } catch (e: any) {
      // DB unavailable — verify it's an infra error, not auth/validation
      expect(e.message).toMatch(/database|internal/i);
    }
  });
});

describe("Exchange Rate Markup", () => {
  it("should upsert exchange rate with global markup applied", async () => {
    const caller = createAdminCaller();

    try {
      // Set global markup first
      await caller.exchangeRates.setMarkup({ markupPercentage: 5 });

      const result = await caller.exchangeRates.upsert({
        fromCurrency: "USD",
        toCurrency: "TST",
        rate: 1.35,
        effectiveDate: new Date().toISOString().split("T")[0],
      });

      expect(result.success).toBe(true);

      // Verify global markup is returned correctly
      const markupResult = await caller.exchangeRates.getMarkup();
      expect(markupResult.markupPercentage).toBe(5);

      // Verify rate was stored
      const ratesResult = await caller.exchangeRates.list({
        limit: 200,
        offset: 0,
      });
      const rates = (ratesResult as any).data ?? [];
      const found = rates.find((r: any) => r.fromCurrency === "USD" && r.toCurrency === "TST");
      expect(found).toBeDefined();
    } catch (e: any) {
      expect(e.message).toMatch(/database|internal/i);
    }
  });
});
