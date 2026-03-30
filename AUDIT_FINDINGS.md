# Audit Findings - Frontend-Backend Alignment

## Issue 1: HiringCompliance page data structure mismatch
**Problem**: The frontend HiringCompliance.tsx expects an array of objects with fields like `metricNameEn`, `metricNameZh`, `metricValueEn`, `metricValueZh`, `riskLevel`, `notesEn`, `notesZh`, `category`. But the backend `getComplianceByCountry` returns a SINGLE row with fields like `probationRulesEn`, `noticePeriodRulesEn`, etc.
**Fix**: Transform the single compliance record into an array of metric objects in the frontend, OR restructure the frontend to display the flat record.

## Issue 2: Route path mismatches between Layout.tsx and App.tsx
- Layout: `/admin/toolkit/salary-benchmark` → App.tsx: `/admin/toolkit/salary`
- Layout: `/admin/system/toolkit-cms` → App.tsx: `/admin/toolkit-cms`
**Fix**: Align paths in App.tsx to match Layout.tsx

## Issue 3: GlobalBenefits filter field (FIXED)
- Was filtering by `b.category === "statutory"` instead of `b.benefitType === "statutory"`
- Already fixed.

## Issue 4: SalaryBenchmark fields (OK)
- Frontend correctly uses `salaryP25/P50/P75`, `jobCategory`, `seniorityLevel`
- Backend returns these correctly. No issue.

## Issue 5: DocumentTemplates page
- Need to verify field alignment.

## Issue 6: ToolkitCms compliance tab
- CMS compliance tab may have same data structure issue as HiringCompliance page.
