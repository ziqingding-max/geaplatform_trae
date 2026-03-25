CREATE TABLE "adjustments" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"payrollRunId" integer,
	"adjustmentType" text NOT NULL,
	"category" text,
	"description" text,
	"amount" text NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"receiptFileUrl" text,
	"receiptFileKey" varchar(500),
	"status" text DEFAULT 'submitted' NOT NULL,
	"submittedBy" integer,
	"clientApprovedBy" integer,
	"clientApprovedAt" timestamp with time zone,
	"clientRejectionReason" text,
	"adminApprovedBy" integer,
	"adminApprovedAt" timestamp with time zone,
	"adminRejectionReason" text,
	"effectiveMonth" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "ai_provider_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"displayName" varchar(100) NOT NULL,
	"baseUrl" text,
	"model" varchar(100) NOT NULL,
	"apiKeyEnv" varchar(100) NOT NULL,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "ai_task_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"taskType" text NOT NULL,
	"providerPrimary" text NOT NULL,
	"providerActual" text NOT NULL,
	"fallbackTriggered" boolean DEFAULT false NOT NULL,
	"latencyMs" integer DEFAULT 0 NOT NULL,
	"tokenUsageIn" integer DEFAULT 0 NOT NULL,
	"tokenUsageOut" integer DEFAULT 0 NOT NULL,
	"costEstimate" text DEFAULT '0.0000' NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"errorClass" varchar(120),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "ai_task_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"task" text NOT NULL,
	"primaryProvider" text DEFAULT 'volcengine' NOT NULL,
	"fallbackProvider" text,
	"modelOverride" varchar(100),
	"temperature" text DEFAULT '0.30',
	"maxTokens" integer DEFAULT 4096,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"userName" varchar(255),
	"action" varchar(100) NOT NULL,
	"entityType" varchar(100) NOT NULL,
	"entityId" integer,
	"changes" jsonb,
	"ipAddress" varchar(50),
	"userAgent" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "bill_invoice_allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorBillId" integer NOT NULL,
	"vendorBillItemId" integer,
	"invoiceId" integer NOT NULL,
	"employeeId" integer,
	"contractorId" integer,
	"allocatedAmount" text NOT NULL,
	"description" text,
	"allocatedBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "billing_entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"entityName" varchar(255) NOT NULL,
	"legalName" varchar(255) NOT NULL,
	"registrationNumber" varchar(100),
	"taxId" varchar(100),
	"country" varchar(100) NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"postalCode" varchar(20),
	"bankDetails" text,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"contactEmail" varchar(320),
	"contactPhone" varchar(20),
	"isDefault" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"logoUrl" text,
	"logoFileKey" varchar(500),
	"invoicePrefix" varchar(20),
	"paymentTermDays" integer DEFAULT 30 NOT NULL,
	"invoiceSequence" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contractor_adjustments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractorId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"amount" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"attachmentUrl" text,
	"attachmentFileKey" varchar(500),
	"status" text DEFAULT 'submitted' NOT NULL,
	"submittedBy" integer,
	"clientApprovedBy" integer,
	"clientApprovedAt" timestamp with time zone,
	"clientRejectionReason" text,
	"adminApprovedBy" integer,
	"adminApprovedAt" timestamp with time zone,
	"adminRejectionReason" text,
	"effectiveMonth" text NOT NULL,
	"invoiceId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contractor_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractorId" integer NOT NULL,
	"contractType" varchar(100),
	"fileUrl" text,
	"fileKey" varchar(500),
	"signedDate" text,
	"effectiveDate" text,
	"expiryDate" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contractor_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractorId" integer NOT NULL,
	"documentType" text NOT NULL,
	"documentName" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileKey" varchar(500) NOT NULL,
	"mimeType" varchar(100),
	"fileSize" integer,
	"notes" text,
	"uploadedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contractor_invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoiceId" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" text DEFAULT '1' NOT NULL,
	"unitPrice" text NOT NULL,
	"amount" text NOT NULL,
	"itemType" text NOT NULL,
	"milestoneId" integer,
	"adjustmentId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contractor_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoiceNumber" varchar(100),
	"contractorId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"invoiceDate" text NOT NULL,
	"dueDate" text,
	"periodStart" text,
	"periodEnd" text,
	"currency" varchar(3) NOT NULL,
	"totalAmount" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"clientInvoiceId" integer,
	"approvedBy" integer,
	"approvedAt" timestamp with time zone,
	"rejectedReason" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contractor_invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);

CREATE TABLE "contractor_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractorId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"amount" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"dueDate" text,
	"completedAt" timestamp with time zone,
	"deliverableFileUrl" text,
	"deliverableFileKey" varchar(500),
	"deliverableFileName" varchar(255),
	"submissionNote" text,
	"submittedBy" integer,
	"clientApprovedBy" integer,
	"clientApprovedAt" timestamp with time zone,
	"clientRejectionReason" text,
	"adminApprovedBy" integer,
	"adminApprovedAt" timestamp with time zone,
	"adminRejectionReason" text,
	"effectiveMonth" text,
	"invoiceId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractorCode" varchar(20),
	"customerId" integer NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"dateOfBirth" text,
	"nationality" varchar(100),
	"idNumber" varchar(100),
	"idType" varchar(50),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) NOT NULL,
	"postalCode" varchar(20),
	"jobTitle" varchar(255) NOT NULL,
	"jobDescription" text,
	"department" varchar(100),
	"startDate" text NOT NULL,
	"endDate" text,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"paymentFrequency" text DEFAULT 'monthly' NOT NULL,
	"rateType" text DEFAULT 'fixed_monthly' NOT NULL,
	"rateAmount" text,
	"bankDetails" jsonb,
	"notes" text,
	"defaultApproverId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contractors_contractorCode_unique" UNIQUE("contractorCode")
);

CREATE TABLE "countries_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryCode" varchar(3) NOT NULL,
	"countryName" varchar(100) NOT NULL,
	"localCurrency" varchar(3) NOT NULL,
	"payrollCycle" text DEFAULT 'monthly' NOT NULL,
	"probationPeriodDays" integer DEFAULT 90,
	"noticePeriodDays" integer DEFAULT 30,
	"workingDaysPerWeek" integer DEFAULT 5,
	"statutoryAnnualLeave" integer DEFAULT 14,
	"standardEorRate" text,
	"standardVisaEorRate" text,
	"standardAorRate" text,
	"visaEorSetupFee" text,
	"standardRateCurrency" varchar(3) DEFAULT 'USD',
	"vatApplicable" boolean DEFAULT false NOT NULL,
	"vatRate" text DEFAULT '0',
	"isActive" boolean DEFAULT false NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "countries_config_countryCode_unique" UNIQUE("countryCode")
);

CREATE TABLE "country_guide_chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryCode" varchar(3) NOT NULL,
	"part" integer NOT NULL,
	"chapterKey" varchar(50) NOT NULL,
	"titleEn" varchar(300) NOT NULL,
	"titleZh" varchar(300) NOT NULL,
	"contentEn" text NOT NULL,
	"contentZh" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"version" varchar(20) NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"metadata" jsonb,
	"effectiveFrom" text,
	"effectiveTo" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "country_social_insurance_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryCode" varchar(3) NOT NULL,
	"itemKey" varchar(50) NOT NULL,
	"itemNameEn" varchar(200) NOT NULL,
	"itemNameZh" varchar(200) NOT NULL,
	"category" text NOT NULL,
	"rateEmployer" text DEFAULT '0' NOT NULL,
	"rateEmployee" text DEFAULT '0' NOT NULL,
	"capType" text DEFAULT 'none' NOT NULL,
	"capBase" text,
	"capMultiplier" text,
	"capReferenceBase" text,
	"regionCode" text,
	"regionName" text,
	"ageBracketMin" integer,
	"ageBracketMax" integer,
	"salaryBracketMin" text,
	"salaryBracketMax" text,
	"effectiveYear" integer NOT NULL,
	"effectiveFrom" text,
	"effectiveTo" text,
	"legalReference" text,
	"notes" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "credit_note_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"creditNoteId" integer NOT NULL,
	"appliedToInvoiceId" integer NOT NULL,
	"appliedAmount" text NOT NULL,
	"notes" text,
	"appliedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"appliedBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "customer_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"contactName" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"role" varchar(100),
	"isPrimary" boolean DEFAULT false NOT NULL,
	"hasPortalAccess" boolean DEFAULT false NOT NULL,
	"passwordHash" varchar(255),
	"portalRole" text DEFAULT 'viewer',
	"inviteToken" varchar(255),
	"inviteExpiresAt" timestamp with time zone,
	"resetToken" varchar(255),
	"resetExpiresAt" timestamp with time zone,
	"isPortalActive" boolean DEFAULT false NOT NULL,
	"lastLoginAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "customer_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"contractName" varchar(255) NOT NULL,
	"contractType" varchar(100),
	"fileUrl" text,
	"fileKey" varchar(500),
	"signedDate" text,
	"effectiveDate" text,
	"expiryDate" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "customer_frozen_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"balance" text DEFAULT '0' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "customer_leave_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"countryCode" varchar(3) NOT NULL,
	"leaveTypeId" integer NOT NULL,
	"annualEntitlement" integer NOT NULL,
	"expiryRule" text DEFAULT 'year_end' NOT NULL,
	"carryOverDays" integer DEFAULT 0 NOT NULL,
	"clientConfirmed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "customer_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"pricingType" text NOT NULL,
	"globalDiscountPercent" text,
	"countryCode" varchar(3),
	"serviceType" text,
	"fixedPrice" text,
	"visaOneTimeFee" text,
	"currency" varchar(3) DEFAULT 'USD',
	"effectiveFrom" text NOT NULL,
	"effectiveTo" text,
	"sourceQuotationId" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "customer_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"balance" text DEFAULT '0' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientCode" varchar(20),
	"companyName" varchar(255) NOT NULL,
	"legalEntityName" varchar(255),
	"registrationNumber" varchar(100),
	"industry" varchar(100),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) NOT NULL,
	"postalCode" varchar(20),
	"primaryContactName" varchar(255),
	"primaryContactEmail" varchar(320),
	"primaryContactPhone" varchar(20),
	"paymentTermDays" integer DEFAULT 30 NOT NULL,
	"settlementCurrency" varchar(3) DEFAULT 'USD' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"billingEntityId" integer,
	"depositMultiplier" integer DEFAULT 2 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_clientCode_unique" UNIQUE("clientCode")
);

CREATE TABLE "employee_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"contractType" varchar(100),
	"fileUrl" text,
	"fileKey" varchar(500),
	"signedDate" text,
	"effectiveDate" text,
	"expiryDate" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "employee_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"documentType" text NOT NULL,
	"documentName" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileKey" varchar(500) NOT NULL,
	"mimeType" varchar(100),
	"fileSize" integer,
	"notes" text,
	"uploadedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "employee_payslips" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"payPeriod" text NOT NULL,
	"payDate" text,
	"fileUrl" text NOT NULL,
	"fileKey" varchar(500) NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"mimeType" varchar(100) DEFAULT 'application/pdf',
	"fileSize" integer,
	"currency" varchar(3),
	"grossAmount" text,
	"netAmount" text,
	"notes" text,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp with time zone,
	"uploadedBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeCode" varchar(20),
	"customerId" integer NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"dateOfBirth" text,
	"gender" text,
	"nationality" varchar(100),
	"idNumber" varchar(100),
	"idType" varchar(50),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) NOT NULL,
	"postalCode" varchar(20),
	"department" varchar(100),
	"jobTitle" varchar(255) NOT NULL,
	"jobDescription" text,
	"serviceType" text DEFAULT 'eor' NOT NULL,
	"employmentType" text DEFAULT 'long_term' NOT NULL,
	"startDate" text NOT NULL,
	"endDate" text,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"baseSalary" text NOT NULL,
	"salaryCurrency" varchar(3) DEFAULT 'USD' NOT NULL,
	"estimatedEmployerCost" text DEFAULT '0',
	"requiresVisa" boolean DEFAULT false NOT NULL,
	"visaStatus" text DEFAULT 'not_required',
	"visaExpiryDate" text,
	"visaNotes" text,
	"bankDetails" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employeeCode_unique" UNIQUE("employeeCode")
);

CREATE TABLE "exchange_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromCurrency" varchar(3) NOT NULL,
	"toCurrency" varchar(3) NOT NULL,
	"rate" text NOT NULL,
	"rateWithMarkup" text NOT NULL,
	"markupPercentage" text DEFAULT '5.00' NOT NULL,
	"source" varchar(100),
	"effectiveDate" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "frozen_wallet_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"walletId" integer NOT NULL,
	"type" text NOT NULL,
	"amount" text NOT NULL,
	"direction" text NOT NULL,
	"balanceBefore" text NOT NULL,
	"balanceAfter" text NOT NULL,
	"referenceId" integer NOT NULL,
	"referenceType" text NOT NULL,
	"description" text,
	"internalNote" text,
	"createdBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoiceId" integer NOT NULL,
	"employeeId" integer,
	"contractorId" integer,
	"description" varchar(500) NOT NULL,
	"quantity" text DEFAULT '1' NOT NULL,
	"unitPrice" text NOT NULL,
	"amount" text NOT NULL,
	"itemType" text NOT NULL,
	"vatRate" text DEFAULT '0',
	"countryCode" varchar(3),
	"localCurrency" varchar(3),
	"localAmount" text,
	"exchangeRate" text,
	"exchangeRateWithMarkup" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"billingEntityId" integer,
	"invoiceNumber" varchar(100) NOT NULL,
	"invoiceType" text NOT NULL,
	"creditNoteDisposition" text,
	"invoiceMonth" text,
	"currency" varchar(3) NOT NULL,
	"exchangeRate" text DEFAULT '1',
	"exchangeRateWithMarkup" text DEFAULT '1',
	"subtotal" text NOT NULL,
	"serviceFeeTotal" text DEFAULT '0',
	"tax" text DEFAULT '0',
	"total" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"dueDate" text,
	"sentDate" timestamp with time zone,
	"paidDate" timestamp with time zone,
	"paidAmount" text,
	"creditApplied" text DEFAULT '0',
	"walletAppliedAmount" text DEFAULT '0',
	"amountDue" text,
	"costAllocated" text DEFAULT '0',
	"relatedInvoiceId" integer,
	"notes" text,
	"internalNotes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);

CREATE TABLE "knowledge_feedback_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"contactId" integer,
	"locale" text DEFAULT 'en' NOT NULL,
	"query" varchar(500),
	"topics" jsonb NOT NULL,
	"feedbackType" text DEFAULT 'not_helpful' NOT NULL,
	"note" text,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "knowledge_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer,
	"sourceId" integer,
	"title" varchar(500) NOT NULL,
	"summary" text,
	"content" text,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"category" text DEFAULT 'article' NOT NULL,
	"topic" text DEFAULT 'general' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"metadata" jsonb,
	"aiConfidence" integer DEFAULT 0 NOT NULL,
	"aiSummary" text,
	"publishedAt" timestamp with time zone,
	"reviewedBy" integer,
	"reviewedAt" timestamp with time zone,
	"reviewNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "knowledge_marketing_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"contactId" integer,
	"channel" text DEFAULT 'email' NOT NULL,
	"cadence" text DEFAULT 'weekly' NOT NULL,
	"topics" jsonb NOT NULL,
	"payload" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "knowledge_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"sourceType" text DEFAULT 'web' NOT NULL,
	"language" text DEFAULT 'multi' NOT NULL,
	"topic" text DEFAULT 'general' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"authorityScore" integer DEFAULT 0 NOT NULL,
	"authorityLevel" text DEFAULT 'low' NOT NULL,
	"authorityReason" text,
	"aiReviewedAt" timestamp with time zone,
	"lastFetchedAt" timestamp with time zone,
	"updatedBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lead_change_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"userId" integer,
	"userName" varchar(255),
	"changeType" varchar(50) NOT NULL,
	"fieldName" varchar(100),
	"oldValue" text,
	"newValue" text,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "leave_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"leaveTypeId" integer NOT NULL,
	"year" integer NOT NULL,
	"totalEntitlement" integer NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"remaining" integer NOT NULL,
	"expiryDate" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "leave_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"leaveTypeId" integer NOT NULL,
	"startDate" text NOT NULL,
	"endDate" text NOT NULL,
	"days" text NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"reason" text,
	"submittedBy" integer,
	"clientApprovedBy" integer,
	"clientApprovedAt" timestamp with time zone,
	"clientRejectionReason" text,
	"adminApprovedBy" integer,
	"adminApprovedAt" timestamp with time zone,
	"adminRejectionReason" text,
	"payrollRunId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "leave_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryCode" varchar(3) NOT NULL,
	"leaveTypeName" varchar(100) NOT NULL,
	"annualEntitlement" integer DEFAULT 0,
	"isPaid" boolean DEFAULT true NOT NULL,
	"requiresApproval" boolean DEFAULT true NOT NULL,
	"applicableGender" text DEFAULT 'all' NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "migration_id_map" (
	"id" serial PRIMARY KEY NOT NULL,
	"entityType" text NOT NULL,
	"oldId" integer NOT NULL,
	"newId" integer NOT NULL,
	"migratedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"targetPortal" text NOT NULL,
	"targetUserId" integer,
	"targetRole" text,
	"targetCustomerId" integer,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"data" jsonb,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "onboarding_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"employeeName" varchar(200) NOT NULL,
	"employeeEmail" varchar(320) NOT NULL,
	"token" varchar(64) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"serviceType" text DEFAULT 'eor',
	"country" varchar(100),
	"jobTitle" varchar(255),
	"jobDescription" text,
	"department" varchar(100),
	"startDate" text,
	"endDate" text,
	"employmentType" varchar(50),
	"baseSalary" text,
	"salaryCurrency" varchar(3),
	"paymentFrequency" varchar(50),
	"rateAmount" text,
	"contractorCurrency" varchar(3),
	"employeeId" integer,
	"contractorId" integer,
	"expiresAt" timestamp with time zone NOT NULL,
	"completedAt" timestamp with time zone,
	"createdBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_invites_token_unique" UNIQUE("token")
);

CREATE TABLE "payroll_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"payrollRunId" integer NOT NULL,
	"employeeId" integer NOT NULL,
	"baseSalary" text NOT NULL,
	"bonus" text DEFAULT '0',
	"allowances" text DEFAULT '0',
	"reimbursements" text DEFAULT '0',
	"deductions" text DEFAULT '0',
	"taxDeduction" text DEFAULT '0',
	"socialSecurityDeduction" text DEFAULT '0',
	"unpaidLeaveDeduction" text DEFAULT '0',
	"unpaidLeaveDays" text DEFAULT '0',
	"gross" text NOT NULL,
	"net" text NOT NULL,
	"employerSocialContribution" text DEFAULT '0',
	"totalEmploymentCost" text NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"notes" text,
	"adjustmentsBreakdown" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payroll_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryCode" varchar(3) NOT NULL,
	"payrollMonth" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"totalGross" text DEFAULT '0',
	"totalDeductions" text DEFAULT '0',
	"totalNet" text DEFAULT '0',
	"totalEmployerCost" text DEFAULT '0',
	"submittedBy" integer,
	"submittedAt" timestamp with time zone,
	"approvedBy" integer,
	"approvedAt" timestamp with time zone,
	"rejectedBy" integer,
	"rejectedAt" timestamp with time zone,
	"rejectionReason" text,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public_holidays" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryCode" varchar(3) NOT NULL,
	"year" integer NOT NULL,
	"holidayDate" text NOT NULL,
	"holidayName" varchar(255) NOT NULL,
	"localName" varchar(255),
	"isGlobal" boolean DEFAULT true NOT NULL,
	"source" varchar(50) DEFAULT 'nager_api',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "quotations" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotationNumber" varchar(50) NOT NULL,
	"leadId" integer,
	"customerId" integer,
	"countries" jsonb,
	"totalMonthly" text NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"snapshotData" jsonb,
	"validUntil" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"pdfUrl" text,
	"pdfKey" text,
	"sentAt" timestamp with time zone,
	"sentTo" text,
	"sentBy" integer,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quotations_quotationNumber_unique" UNIQUE("quotationNumber")
);

CREATE TABLE "reimbursements" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"payrollRunId" integer,
	"category" text NOT NULL,
	"description" text,
	"amount" text NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"receiptFileUrl" text,
	"receiptFileKey" varchar(500),
	"status" text DEFAULT 'submitted' NOT NULL,
	"submittedBy" integer,
	"clientApprovedBy" integer,
	"clientApprovedAt" timestamp with time zone,
	"clientRejectionReason" text,
	"adminApprovedBy" integer,
	"adminApprovedAt" timestamp with time zone,
	"adminRejectionReason" text,
	"effectiveMonth" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "salary_benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"countryCode" varchar(3) NOT NULL,
	"jobCategory" varchar(100) NOT NULL,
	"jobTitle" varchar(200) NOT NULL,
	"seniorityLevel" text NOT NULL,
	"salaryP25" text NOT NULL,
	"salaryP50" text NOT NULL,
	"salaryP75" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"dataYear" integer NOT NULL,
	"source" text,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "sales_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"activityType" text NOT NULL,
	"description" text NOT NULL,
	"activityDate" timestamp with time zone DEFAULT now() NOT NULL,
	"createdBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "sales_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer,
	"customerId" integer,
	"quotationId" integer,
	"docType" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileKey" varchar(500) NOT NULL,
	"generatedBy" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "sales_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"companyName" varchar(255) NOT NULL,
	"contactName" varchar(255),
	"contactEmail" varchar(320),
	"contactPhone" varchar(20),
	"country" varchar(100),
	"industry" varchar(100),
	"estimatedEmployees" integer,
	"estimatedRevenue" text,
	"currency" varchar(3) DEFAULT 'USD',
	"source" varchar(100),
	"intendedServices" text,
	"targetCountries" text,
	"status" text DEFAULT 'discovery' NOT NULL,
	"lostReason" text,
	"createdBy" integer,
	"assignedTo" integer,
	"convertedCustomerId" integer,
	"notes" text,
	"expectedCloseDate" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "system_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"configKey" varchar(100) NOT NULL,
	"configValue" text NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_config_configKey_unique" UNIQUE("configKey")
);

CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);

CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"passwordHash" varchar(255),
	"loginMethod" varchar(64),
	"role" varchar(200) DEFAULT 'user' NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"inviteToken" varchar(255),
	"inviteExpiresAt" timestamp with time zone,
	"resetToken" varchar(255),
	"resetExpiresAt" timestamp with time zone,
	"mustChangePassword" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "vendor_bill_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorBillId" integer NOT NULL,
	"description" varchar(500) NOT NULL,
	"quantity" text DEFAULT '1' NOT NULL,
	"unitPrice" text NOT NULL,
	"amount" text NOT NULL,
	"itemType" text DEFAULT 'other' NOT NULL,
	"relatedCustomerId" integer,
	"relatedEmployeeId" integer,
	"relatedCountryCode" varchar(3),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "vendor_bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"billNumber" varchar(100) NOT NULL,
	"billDate" text NOT NULL,
	"dueDate" text,
	"paidDate" text,
	"billMonth" text,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal" text NOT NULL,
	"tax" text DEFAULT '0',
	"totalAmount" text NOT NULL,
	"paidAmount" text DEFAULT '0',
	"status" text DEFAULT 'draft' NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"billType" text DEFAULT 'operational' NOT NULL,
	"description" text,
	"internalNotes" text,
	"receiptFileUrl" text,
	"receiptFileKey" varchar(500),
	"bankReference" varchar(200),
	"bankName" varchar(255),
	"bankFee" text DEFAULT '0',
	"settlementCurrency" varchar(3) DEFAULT 'USD',
	"settlementAmount" text,
	"settlementBankFee" text,
	"settlementDate" text,
	"settlementNotes" text,
	"allocatedAmount" text DEFAULT '0',
	"unallocatedAmount" text DEFAULT '0',
	"submittedBy" integer,
	"submittedAt" timestamp with time zone,
	"approvedBy" integer,
	"approvedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorCode" varchar(20),
	"name" varchar(255) NOT NULL,
	"legalName" varchar(255),
	"contactName" varchar(255),
	"contactEmail" varchar(320),
	"contactPhone" varchar(50),
	"country" varchar(100) NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"postalCode" varchar(20),
	"serviceType" varchar(100),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"bankDetails" text,
	"taxId" varchar(100),
	"paymentTermDays" integer DEFAULT 30 NOT NULL,
	"vendorType" text DEFAULT 'client_related' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_vendorCode_unique" UNIQUE("vendorCode")
);

CREATE TABLE "wallet_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"walletId" integer NOT NULL,
	"type" text NOT NULL,
	"amount" text NOT NULL,
	"direction" text NOT NULL,
	"balanceBefore" text NOT NULL,
	"balanceAfter" text NOT NULL,
	"referenceId" integer NOT NULL,
	"referenceType" text NOT NULL,
	"description" text,
	"internalNote" text,
	"createdBy" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "worker_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"passwordHash" varchar(255),
	"contractorId" integer,
	"employeeId" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"isEmailVerified" boolean DEFAULT false NOT NULL,
	"inviteToken" varchar(255),
	"inviteExpiresAt" timestamp with time zone,
	"resetToken" varchar(255),
	"resetExpiresAt" timestamp with time zone,
	"lastLoginAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "worker_users_email_unique" UNIQUE("email"),
	CONSTRAINT "worker_users_contractorId_unique" UNIQUE("contractorId"),
	CONSTRAINT "worker_users_employeeId_unique" UNIQUE("employeeId")
);

CREATE INDEX "adj_employee_id_idx" ON "adjustments" USING btree ("employeeId");
CREATE INDEX "adj_customer_id_idx" ON "adjustments" USING btree ("customerId");
CREATE INDEX "adj_status_idx" ON "adjustments" USING btree ("status");
CREATE INDEX "adj_payroll_run_id_idx" ON "adjustments" USING btree ("payrollRunId");
CREATE INDEX "adj_effective_month_idx" ON "adjustments" USING btree ("effectiveMonth");
CREATE UNIQUE INDEX "ai_provider_idx" ON "ai_provider_configs" USING btree ("provider");
CREATE INDEX "ai_provider_enabled_idx" ON "ai_provider_configs" USING btree ("isEnabled");
CREATE INDEX "ai_exec_task_idx" ON "ai_task_executions" USING btree ("taskType");
CREATE INDEX "ai_exec_created_idx" ON "ai_task_executions" USING btree ("createdAt");
CREATE INDEX "ai_exec_success_idx" ON "ai_task_executions" USING btree ("success");
CREATE UNIQUE INDEX "ai_task_idx" ON "ai_task_policies" USING btree ("task");
CREATE INDEX "ai_task_active_idx" ON "ai_task_policies" USING btree ("isActive");
CREATE INDEX "al_user_id_idx" ON "audit_logs" USING btree ("userId");
CREATE INDEX "al_entity_type_idx" ON "audit_logs" USING btree ("entityType");
CREATE INDEX "al_created_at_idx" ON "audit_logs" USING btree ("createdAt");
CREATE INDEX "bia_vendor_bill_id_idx" ON "bill_invoice_allocations" USING btree ("vendorBillId");
CREATE INDEX "bia_vendor_bill_item_id_idx" ON "bill_invoice_allocations" USING btree ("vendorBillItemId");
CREATE INDEX "bia_invoice_id_idx" ON "bill_invoice_allocations" USING btree ("invoiceId");
CREATE INDEX "bia_employee_id_idx" ON "bill_invoice_allocations" USING btree ("employeeId");
CREATE INDEX "bia_contractor_id_idx" ON "bill_invoice_allocations" USING btree ("contractorId");
CREATE INDEX "be_country_idx" ON "billing_entities" USING btree ("country");
CREATE INDEX "be_active_idx" ON "billing_entities" USING btree ("isActive");
CREATE UNIQUE INDEX "be_invoice_prefix_idx" ON "billing_entities" USING btree ("invoicePrefix");
CREATE INDEX "ca_contractor_id_idx" ON "contractor_adjustments" USING btree ("contractorId");
CREATE INDEX "ca_customer_id_idx" ON "contractor_adjustments" USING btree ("customerId");
CREATE INDEX "ca_status_idx" ON "contractor_adjustments" USING btree ("status");
CREATE INDEX "ca_effective_month_idx" ON "contractor_adjustments" USING btree ("effectiveMonth");
CREATE INDEX "cc_contractor_id_idx" ON "contractor_contracts" USING btree ("contractorId");
CREATE INDEX "cc_status_idx" ON "contractor_contracts" USING btree ("status");
CREATE INDEX "cd_contractor_id_idx" ON "contractor_documents" USING btree ("contractorId");
CREATE INDEX "cd_doc_type_idx" ON "contractor_documents" USING btree ("documentType");
CREATE INDEX "cii_invoice_id_idx" ON "contractor_invoice_items" USING btree ("invoiceId");
CREATE INDEX "ci_contractor_id_idx" ON "contractor_invoices" USING btree ("contractorId");
CREATE INDEX "ci_customer_id_idx" ON "contractor_invoices" USING btree ("customerId");
CREATE INDEX "ci_status_idx" ON "contractor_invoices" USING btree ("status");
CREATE INDEX "cm_contractor_id_idx" ON "contractor_milestones" USING btree ("contractorId");
CREATE INDEX "cm_customer_id_idx" ON "contractor_milestones" USING btree ("customerId");
CREATE INDEX "cm_status_idx" ON "contractor_milestones" USING btree ("status");
CREATE INDEX "cm_effective_month_idx" ON "contractor_milestones" USING btree ("effectiveMonth");
CREATE INDEX "ctr_customer_id_idx" ON "contractors" USING btree ("customerId");
CREATE INDEX "ctr_email_idx" ON "contractors" USING btree ("email");
CREATE INDEX "ctr_status_idx" ON "contractors" USING btree ("status");
CREATE INDEX "ctr_country_idx" ON "contractors" USING btree ("country");
CREATE UNIQUE INDEX "country_code_idx" ON "countries_config" USING btree ("countryCode");
CREATE INDEX "cgc_country_idx" ON "country_guide_chapters" USING btree ("countryCode");
CREATE INDEX "cgc_status_idx" ON "country_guide_chapters" USING btree ("status");
CREATE INDEX "csi_country_year_idx" ON "country_social_insurance_items" USING btree ("countryCode","effectiveYear");
CREATE INDEX "csi_country_item_idx" ON "country_social_insurance_items" USING btree ("countryCode","itemKey");
CREATE INDEX "csi_region_idx" ON "country_social_insurance_items" USING btree ("regionCode");
CREATE INDEX "cna_credit_note_idx" ON "credit_note_applications" USING btree ("creditNoteId");
CREATE INDEX "cna_applied_to_idx" ON "credit_note_applications" USING btree ("appliedToInvoiceId");
CREATE INDEX "cc_customer_id_idx" ON "customer_contacts" USING btree ("customerId");
CREATE UNIQUE INDEX "cc_email_idx" ON "customer_contacts" USING btree ("email");
CREATE INDEX "cc_invite_token_idx" ON "customer_contacts" USING btree ("inviteToken");
CREATE INDEX "cctr_customer_id_idx" ON "customer_contracts" USING btree ("customerId");
CREATE UNIQUE INDEX "cfw_customer_currency_idx" ON "customer_frozen_wallets" USING btree ("customerId","currency");
CREATE INDEX "clp_customer_id_idx" ON "customer_leave_policies" USING btree ("customerId");
CREATE INDEX "clp_country_idx" ON "customer_leave_policies" USING btree ("countryCode");
CREATE UNIQUE INDEX "clp_unique_idx" ON "customer_leave_policies" USING btree ("customerId","countryCode","leaveTypeId");
CREATE INDEX "cp_customer_id_idx" ON "customer_pricing" USING btree ("customerId");
CREATE INDEX "cp_country_code_idx" ON "customer_pricing" USING btree ("countryCode");
CREATE UNIQUE INDEX "cw_customer_currency_idx" ON "customer_wallets" USING btree ("customerId","currency");
CREATE INDEX "company_name_idx" ON "customers" USING btree ("companyName");
CREATE INDEX "country_idx" ON "customers" USING btree ("country");
CREATE INDEX "status_idx" ON "customers" USING btree ("status");
CREATE INDEX "ec_employee_id_idx" ON "employee_contracts" USING btree ("employeeId");
CREATE INDEX "ed_employee_id_idx" ON "employee_documents" USING btree ("employeeId");
CREATE INDEX "ed_doc_type_idx" ON "employee_documents" USING btree ("documentType");
CREATE INDEX "ep_employee_id_idx" ON "employee_payslips" USING btree ("employeeId");
CREATE INDEX "ep_customer_id_idx" ON "employee_payslips" USING btree ("customerId");
CREATE INDEX "ep_pay_period_idx" ON "employee_payslips" USING btree ("payPeriod");
CREATE INDEX "ep_published_idx" ON "employee_payslips" USING btree ("isPublished");
CREATE UNIQUE INDEX "ep_employee_period_idx" ON "employee_payslips" USING btree ("employeeId","payPeriod");
CREATE INDEX "emp_customer_id_idx" ON "employees" USING btree ("customerId");
CREATE INDEX "emp_email_idx" ON "employees" USING btree ("email");
CREATE INDEX "emp_status_idx" ON "employees" USING btree ("status");
CREATE INDEX "emp_country_idx" ON "employees" USING btree ("country");
CREATE INDEX "emp_service_type_idx" ON "employees" USING btree ("serviceType");
CREATE UNIQUE INDEX "er_currency_pair_idx" ON "exchange_rates" USING btree ("fromCurrency","toCurrency","effectiveDate");
CREATE INDEX "fwt_wallet_id_idx" ON "frozen_wallet_transactions" USING btree ("walletId");
CREATE INDEX "fwt_reference_idx" ON "frozen_wallet_transactions" USING btree ("referenceId","referenceType");
CREATE INDEX "fwt_created_idx" ON "frozen_wallet_transactions" USING btree ("createdAt");
CREATE INDEX "ii_invoice_id_idx" ON "invoice_items" USING btree ("invoiceId");
CREATE INDEX "ii_employee_id_idx" ON "invoice_items" USING btree ("employeeId");
CREATE INDEX "ii_contractor_id_idx" ON "invoice_items" USING btree ("contractorId");
CREATE INDEX "inv_customer_id_idx" ON "invoices" USING btree ("customerId");
CREATE UNIQUE INDEX "inv_invoice_number_idx" ON "invoices" USING btree ("invoiceNumber");
CREATE INDEX "inv_status_idx" ON "invoices" USING btree ("status");
CREATE INDEX "inv_invoice_month_idx" ON "invoices" USING btree ("invoiceMonth");
CREATE INDEX "kb_feedback_customer_idx" ON "knowledge_feedback_events" USING btree ("customerId");
CREATE INDEX "kb_feedback_type_idx" ON "knowledge_feedback_events" USING btree ("feedbackType");
CREATE INDEX "kb_feedback_created_idx" ON "knowledge_feedback_events" USING btree ("createdAt");
CREATE INDEX "kb_item_customer_idx" ON "knowledge_items" USING btree ("customerId");
CREATE INDEX "kb_item_status_idx" ON "knowledge_items" USING btree ("status");
CREATE INDEX "kb_item_topic_idx" ON "knowledge_items" USING btree ("topic");
CREATE INDEX "kb_item_published_idx" ON "knowledge_items" USING btree ("publishedAt");
CREATE INDEX "kb_event_customer_idx" ON "knowledge_marketing_events" USING btree ("customerId");
CREATE INDEX "kb_source_active_idx" ON "knowledge_sources" USING btree ("isActive");
CREATE INDEX "kb_source_topic_idx" ON "knowledge_sources" USING btree ("topic");
CREATE INDEX "lcl_lead_id_idx" ON "lead_change_logs" USING btree ("leadId");
CREATE INDEX "lcl_created_at_idx" ON "lead_change_logs" USING btree ("createdAt");
CREATE INDEX "lb_employee_id_idx" ON "leave_balances" USING btree ("employeeId");
CREATE INDEX "lb_leave_type_id_idx" ON "leave_balances" USING btree ("leaveTypeId");
CREATE UNIQUE INDEX "lb_employee_leave_year_idx" ON "leave_balances" USING btree ("employeeId","leaveTypeId","year");
CREATE INDEX "lr_employee_id_idx" ON "leave_records" USING btree ("employeeId");
CREATE INDEX "lr_status_idx" ON "leave_records" USING btree ("status");
CREATE INDEX "lr_start_date_idx" ON "leave_records" USING btree ("startDate");
CREATE INDEX "lr_payroll_run_id_idx" ON "leave_records" USING btree ("payrollRunId");
CREATE INDEX "lt_country_code_idx" ON "leave_types" USING btree ("countryCode");
CREATE INDEX "mim_old_id_idx" ON "migration_id_map" USING btree ("oldId");
CREATE INDEX "mim_new_id_idx" ON "migration_id_map" USING btree ("newId");
CREATE UNIQUE INDEX "mim_unique_idx" ON "migration_id_map" USING btree ("entityType","oldId");
CREATE INDEX "notif_target_idx" ON "notifications" USING btree ("targetPortal","targetUserId","targetRole");
CREATE INDEX "notif_customer_idx" ON "notifications" USING btree ("targetCustomerId");
CREATE INDEX "notif_read_idx" ON "notifications" USING btree ("isRead");
CREATE INDEX "notif_type_idx" ON "notifications" USING btree ("type");
CREATE INDEX "notif_created_idx" ON "notifications" USING btree ("createdAt");
CREATE UNIQUE INDEX "oi_token_idx" ON "onboarding_invites" USING btree ("token");
CREATE INDEX "oi_customer_id_idx" ON "onboarding_invites" USING btree ("customerId");
CREATE INDEX "oi_status_idx" ON "onboarding_invites" USING btree ("status");
CREATE INDEX "oi_email_idx" ON "onboarding_invites" USING btree ("employeeEmail");
CREATE INDEX "pi_payroll_run_id_idx" ON "payroll_items" USING btree ("payrollRunId");
CREATE INDEX "pi_employee_id_idx" ON "payroll_items" USING btree ("employeeId");
CREATE UNIQUE INDEX "pi_run_employee_idx" ON "payroll_items" USING btree ("payrollRunId","employeeId");
CREATE INDEX "pr_payroll_month_idx" ON "payroll_runs" USING btree ("payrollMonth");
CREATE INDEX "pr_status_idx" ON "payroll_runs" USING btree ("status");
CREATE INDEX "pr_country_code_idx" ON "payroll_runs" USING btree ("countryCode");
CREATE UNIQUE INDEX "pr_country_month_idx" ON "payroll_runs" USING btree ("countryCode","payrollMonth");
CREATE INDEX "ph_country_code_idx" ON "public_holidays" USING btree ("countryCode");
CREATE INDEX "ph_year_idx" ON "public_holidays" USING btree ("year");
CREATE INDEX "ph_country_year_idx" ON "public_holidays" USING btree ("countryCode","year");
CREATE UNIQUE INDEX "qt_number_idx" ON "quotations" USING btree ("quotationNumber");
CREATE INDEX "qt_lead_idx" ON "quotations" USING btree ("leadId");
CREATE INDEX "qt_customer_idx" ON "quotations" USING btree ("customerId");
CREATE INDEX "qt_status_idx" ON "quotations" USING btree ("status");
CREATE INDEX "reimb_employee_id_idx" ON "reimbursements" USING btree ("employeeId");
CREATE INDEX "reimb_customer_id_idx" ON "reimbursements" USING btree ("customerId");
CREATE INDEX "reimb_status_idx" ON "reimbursements" USING btree ("status");
CREATE INDEX "reimb_payroll_run_id_idx" ON "reimbursements" USING btree ("payrollRunId");
CREATE INDEX "reimb_effective_month_idx" ON "reimbursements" USING btree ("effectiveMonth");
CREATE INDEX "sb_country_idx" ON "salary_benchmarks" USING btree ("countryCode");
CREATE INDEX "sb_job_title_idx" ON "salary_benchmarks" USING btree ("jobTitle");
CREATE INDEX "sa_lead_id_idx" ON "sales_activities" USING btree ("leadId");
CREATE INDEX "sa_activity_date_idx" ON "sales_activities" USING btree ("activityDate");
CREATE INDEX "sd_lead_idx" ON "sales_documents" USING btree ("leadId");
CREATE INDEX "sd_customer_idx" ON "sales_documents" USING btree ("customerId");
CREATE INDEX "sd_quotation_idx" ON "sales_documents" USING btree ("quotationId");
CREATE INDEX "sl_status_idx" ON "sales_leads" USING btree ("status");
CREATE INDEX "sl_assigned_to_idx" ON "sales_leads" USING btree ("assignedTo");
CREATE INDEX "sl_company_name_idx" ON "sales_leads" USING btree ("companyName");
CREATE UNIQUE INDEX "config_key_idx" ON "system_config" USING btree ("configKey");
CREATE UNIQUE INDEX "ss_key_idx" ON "system_settings" USING btree ("key");
CREATE INDEX "email_idx" ON "users" USING btree ("email");
CREATE INDEX "role_idx" ON "users" USING btree ("role");
CREATE INDEX "invite_token_idx" ON "users" USING btree ("inviteToken");
CREATE INDEX "vbi_vendor_bill_id_idx" ON "vendor_bill_items" USING btree ("vendorBillId");
CREATE INDEX "vbi_customer_id_idx" ON "vendor_bill_items" USING btree ("relatedCustomerId");
CREATE INDEX "vbi_employee_id_idx" ON "vendor_bill_items" USING btree ("relatedEmployeeId");
CREATE INDEX "vbi_country_code_idx" ON "vendor_bill_items" USING btree ("relatedCountryCode");
CREATE INDEX "vb_vendor_id_idx" ON "vendor_bills" USING btree ("vendorId");
CREATE INDEX "vb_status_idx" ON "vendor_bills" USING btree ("status");
CREATE INDEX "vb_bill_date_idx" ON "vendor_bills" USING btree ("billDate");
CREATE INDEX "vb_bill_month_idx" ON "vendor_bills" USING btree ("billMonth");
CREATE INDEX "vb_category_idx" ON "vendor_bills" USING btree ("category");
CREATE INDEX "vb_bill_number_idx" ON "vendor_bills" USING btree ("billNumber");
CREATE INDEX "vdr_name_idx" ON "vendors" USING btree ("name");
CREATE INDEX "vdr_country_idx" ON "vendors" USING btree ("country");
CREATE INDEX "vdr_status_idx" ON "vendors" USING btree ("status");
CREATE INDEX "wt_wallet_id_idx" ON "wallet_transactions" USING btree ("walletId");
CREATE INDEX "wt_reference_idx" ON "wallet_transactions" USING btree ("referenceId","referenceType");
CREATE INDEX "wt_created_idx" ON "wallet_transactions" USING btree ("createdAt");
CREATE UNIQUE INDEX "wu_email_idx" ON "worker_users" USING btree ("email");
CREATE UNIQUE INDEX "wu_contractor_id_idx" ON "worker_users" USING btree ("contractorId");
CREATE UNIQUE INDEX "wu_employee_id_idx" ON "worker_users" USING btree ("employeeId");