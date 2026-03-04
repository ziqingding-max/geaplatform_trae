
const fs = require('fs');
const path = require('path');

const files = [
  'client/src/pages/portal/PortalSalaryBenchmark.tsx',
  'client/src/components/Layout.tsx',
  'client/src/pages/portal/PortalSettings.tsx',
  'client/src/pages/portal/PortalReimbursements.tsx',
  'client/src/pages/portal/PortalLogin.tsx',
  'client/src/pages/portal/PortalAdjustments.tsx',
  'client/src/pages/Employees.tsx',
  'client/src/components/invoices/InvoiceStats.tsx',
  'client/src/pages/Settings.tsx',
  'client/src/pages/Quotations.tsx',
  'client/src/pages/QuotationCreatePage.tsx',
  'client/src/components/pages/NotificationSettingsSection.tsx',
  'client/src/pages/Adjustments.tsx',
  'client/src/pages/Contractors.tsx',
  'client/src/components/pages/ContractorCreateDialog.tsx',
  'client/src/pages/ContractorDetail.tsx',
  'client/src/pages/QuotationCreateDialog.tsx',
  'client/src/pages/SalesCRM.tsx',
  'client/src/pages/portal/PortalLeave.tsx',
  'client/src/pages/Vendors.tsx',
  'client/src/pages/VendorBills.tsx',
  'client/src/pages/Reimbursements.tsx',
  'client/src/pages/ProfitLossReport.tsx',
  'client/src/pages/Payroll.tsx',
  'client/src/pages/NotFound.tsx',
  'client/src/pages/Leave.tsx',
  'client/src/pages/KnowledgeBaseAdmin.tsx',
  'client/src/pages/Invoices.tsx',
  'client/src/pages/HelpCenter.tsx',
  'client/src/pages/Dashboard.tsx',
  'client/src/pages/Customers.tsx',
  'client/src/pages/BillingEntities.tsx',
  'client/src/pages/AuditLogs.tsx',
  'client/src/pages/AdminLogin.tsx',
  'client/src/pages/AdminInvite.tsx',
  'client/src/pages/AISettings.tsx',
  'client/src/hooks/invoices/useInvoices.ts',
  'client/src/components/pages/CountriesContent.tsx',
  'client/src/components/invoices/InvoiceTable.tsx',
  'client/src/components/invoices/InvoiceFilters.tsx'
];

const oldImport = 'from "@/contexts/i18n"';
const newImport = 'from "@/lib/i18n"';

files.forEach(file =&gt; {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(oldImport)) {
      content = content.replaceAll(oldImport, newImport);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', file);
    }
  }
});
