# Hotfix Change Request: Production Test Data Cleanup

| Field | Value |
|:---|:---|
| **CR ID** | CR-20260228-001 |
| **Severity** | P3 (Minor) |
| **Date** | 2026-02-28 |
| **Operator** | AI Agent (Manus) |
| **Approver** | Project Owner (confirmed via chat) |

## Business Context

8 test customer records with names like "Test", "Test Corp", and XSS injection strings (`<script>alert("xss")</script>`) are polluting the production database. These appear in the customer list alongside 31 legitimate customers, degrading user experience and operational efficiency.

## Technical Solution

Physical DELETE of 8 rows from the `customers` table. No cascading deletes required — audit confirmed zero linked records across all related tables (employees, invoices, contacts, contracts, pricing, leave policies, audit logs).

## SQL Statement

```sql
DELETE FROM customers
WHERE id IN (900002, 900003, 900009, 900011, 900020, 900021, 900027, 900028);
```

## Risk Assessment

**Risk: LOW.** These 8 records have no foreign key dependencies. The WHERE clause is explicit with 8 specific IDs. Real customer data (IDs 870063–870093) is not affected.

## Rollback Plan

Re-insert the 8 records with their original data if needed. The records contain only basic fields (companyName, country=SG, status=active, default payment terms).

## Impact Scope

- Users: None (test data removal improves UX)
- Services: None
- Data: 8 rows removed from `customers` table only
