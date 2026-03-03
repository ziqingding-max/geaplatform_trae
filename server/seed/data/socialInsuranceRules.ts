import { InferInsertModel } from "drizzle-orm";
import { countrySocialInsuranceItems } from "../../../drizzle/schema";

type SocialInsuranceItem = InferInsertModel<typeof countrySocialInsuranceItems>;

export const socialInsuranceRules: SocialInsuranceItem[] = [
  // =================================================================================
  // APAC (Asia-Pacific)
  // =================================================================================
  
  // 1. China (Mainland) - Shanghai (Tier 1)
  {
    countryCode: "CN",
    regionCode: "CN-SH",
    regionName: "Shanghai",
    itemKey: "pension_sh",
    itemNameEn: "Pension Insurance",
    itemNameZh: "养老保险",
    category: "pension",
    rateEmployer: "0.16",
    rateEmployee: "0.08",
    capType: "fixed_amount",
    capBase: "36921", // 2024/2025 estimate
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "CN",
    regionCode: "CN-SH",
    regionName: "Shanghai",
    itemKey: "medical_sh",
    itemNameEn: "Medical Insurance",
    itemNameZh: "医疗保险",
    category: "health_insurance",
    rateEmployer: "0.095", // 9.5%
    rateEmployee: "0.02",
    capType: "fixed_amount",
    capBase: "36921",
    effectiveYear: 2025,
    sortOrder: 2,
  },
  {
    countryCode: "CN",
    regionCode: "CN-SH",
    regionName: "Shanghai",
    itemKey: "unemployment_sh",
    itemNameEn: "Unemployment Insurance",
    itemNameZh: "失业保险",
    category: "unemployment",
    rateEmployer: "0.005",
    rateEmployee: "0.005",
    capType: "fixed_amount",
    capBase: "36921",
    effectiveYear: 2025,
    sortOrder: 3,
  },
  {
    countryCode: "CN",
    regionCode: "CN-SH",
    regionName: "Shanghai",
    itemKey: "work_injury_sh",
    itemNameEn: "Work Injury Insurance",
    itemNameZh: "工伤保险",
    category: "work_injury",
    rateEmployer: "0.002", // Base rate, variable
    rateEmployee: "0",
    capType: "fixed_amount",
    capBase: "36921",
    effectiveYear: 2025,
    sortOrder: 4,
  },
  {
    countryCode: "CN",
    regionCode: "CN-SH",
    regionName: "Shanghai",
    itemKey: "housing_fund_sh",
    itemNameEn: "Housing Provident Fund",
    itemNameZh: "住房公积金",
    category: "housing_fund",
    rateEmployer: "0.07", // 7% is standard, can be 5-12%
    rateEmployee: "0.07",
    capType: "fixed_amount",
    capBase: "36921",
    effectiveYear: 2025,
    sortOrder: 5,
  },

  // 2. Hong Kong (HK)
  {
    countryCode: "HK",
    itemKey: "mpf",
    itemNameEn: "Mandatory Provident Fund (MPF)",
    itemNameZh: "强积金",
    category: "pension",
    rateEmployer: "0.05",
    rateEmployee: "0.05",
    capType: "fixed_amount",
    capBase: "30000", // Monthly income cap HKD 30,000 => Max contribution HKD 1,500
    salaryBracketMin: "7100", // Min salary for employee contribution
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 3. Singapore (SG)
  // Simplified for < 55 years old
  {
    countryCode: "SG",
    itemKey: "cpf_ordinary",
    itemNameEn: "Central Provident Fund (CPF)",
    itemNameZh: "中央公积金",
    category: "pension",
    rateEmployer: "0.17",
    rateEmployee: "0.20",
    capType: "fixed_amount",
    capBase: "6800", // Raised ceiling in 2024/2025
    ageBracketMax: 55,
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "SG",
    itemKey: "sdl",
    itemNameEn: "Skills Development Levy (SDL)",
    itemNameZh: "技能发展税",
    category: "other_mandatory",
    rateEmployer: "0.0025",
    rateEmployee: "0",
    capType: "fixed_amount",
    capBase: "4500", // Max levy $11.25
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 4. Vietnam (VN) - Zone 1
  {
    countryCode: "VN",
    regionCode: "zone_1",
    itemKey: "social_insurance_vn",
    itemNameEn: "Social Insurance (BHXH)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.175",
    rateEmployee: "0.08",
    capType: "fixed_amount",
    capBase: "46800000", // 20x Base Salary (2.34M * 20)
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "VN",
    regionCode: "zone_1",
    itemKey: "health_insurance_vn",
    itemNameEn: "Health Insurance (BHYT)",
    itemNameZh: "医疗保险",
    category: "health_insurance",
    rateEmployer: "0.03",
    rateEmployee: "0.015",
    capType: "fixed_amount",
    capBase: "46800000",
    effectiveYear: 2025,
    sortOrder: 2,
  },
  {
    countryCode: "VN",
    regionCode: "zone_1",
    itemKey: "unemployment_vn",
    itemNameEn: "Unemployment Insurance (BHTN)",
    itemNameZh: "失业保险",
    category: "unemployment",
    rateEmployer: "0.01",
    rateEmployee: "0.01",
    capType: "salary_multiple",
    capMultiplier: "20",
    capReferenceBase: "4680000", // Regional min wage Zone 1
    effectiveYear: 2025,
    sortOrder: 3,
  },
  {
    countryCode: "VN",
    regionCode: "zone_1",
    itemKey: "trade_union_vn",
    itemNameEn: "Trade Union Fee",
    itemNameZh: "工会费",
    category: "trade_union",
    rateEmployer: "0.02",
    rateEmployee: "0",
    capType: "fixed_amount",
    capBase: "46800000", // Capped at base salary
    effectiveYear: 2025,
    sortOrder: 4,
  },

  // 5. Japan (JP)
  {
    countryCode: "JP",
    itemKey: "health_insurance_jp",
    itemNameEn: "Health Insurance (Kenko Hoken)",
    itemNameZh: "健康保险",
    category: "health_insurance",
    rateEmployer: "0.0492", // Tokyo rate ~9.84% split
    rateEmployee: "0.0492",
    capType: "none", // Bracket based, simplified as rate
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "JP",
    itemKey: "welfare_pension_jp",
    itemNameEn: "Welfare Pension (Kosei Nenkin)",
    itemNameZh: "厚生年金",
    category: "pension",
    rateEmployer: "0.0915", // 18.3% split
    rateEmployee: "0.0915",
    capType: "fixed_amount",
    capBase: "650000", // Standard monthly remuneration cap
    effectiveYear: 2025,
    sortOrder: 2,
  },
  {
    countryCode: "JP",
    itemKey: "unemployment_jp",
    itemNameEn: "Unemployment Insurance (Koyou Hoken)",
    itemNameZh: "雇用保险",
    category: "unemployment",
    rateEmployer: "0.0095",
    rateEmployee: "0.006",
    effectiveYear: 2025,
    sortOrder: 3,
  },

  // 6. South Korea (KR)
  {
    countryCode: "KR",
    itemKey: "national_pension_kr",
    itemNameEn: "National Pension",
    itemNameZh: "国民年金",
    category: "pension",
    rateEmployer: "0.045",
    rateEmployee: "0.045",
    capType: "fixed_amount",
    capBase: "5900000", // KRW
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "KR",
    itemKey: "health_insurance_kr",
    itemNameEn: "Health Insurance",
    itemNameZh: "健康保险",
    category: "health_insurance",
    rateEmployer: "0.03545", // ~7.09% split
    rateEmployee: "0.03545",
    effectiveYear: 2025,
    sortOrder: 2,
  },
  {
    countryCode: "KR",
    itemKey: "employment_insurance_kr",
    itemNameEn: "Employment Insurance",
    itemNameZh: "雇用保险",
    category: "unemployment",
    rateEmployer: "0.0115", // Depends on company size, standard
    rateEmployee: "0.009",
    effectiveYear: 2025,
    sortOrder: 3,
  },

  // 7. Australia (AU)
  {
    countryCode: "AU",
    itemKey: "superannuation",
    itemNameEn: "Superannuation Guarantee",
    itemNameZh: "退休金",
    category: "pension",
    rateEmployer: "0.115", // Rising to 12% in July 2025
    rateEmployee: "0",
    capType: "fixed_amount",
    capBase: "260280", // Max contribution base per quarter (simplified as annual/12)
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 8. India (IN)
  {
    countryCode: "IN",
    itemKey: "epf",
    itemNameEn: "Employees' Provident Fund (EPF)",
    itemNameZh: "公积金",
    category: "pension",
    rateEmployer: "0.12",
    rateEmployee: "0.12",
    capType: "fixed_amount",
    capBase: "15000", // INR
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 9. Thailand (TH)
  {
    countryCode: "TH",
    itemKey: "social_security_th",
    itemNameEn: "Social Security Fund",
    itemNameZh: "社会保障基金",
    category: "social_insurance",
    rateEmployer: "0.05",
    rateEmployee: "0.05",
    capType: "fixed_amount",
    capBase: "15000", // THB
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 10. Malaysia (MY)
  {
    countryCode: "MY",
    itemKey: "epf_my",
    itemNameEn: "Employees Provident Fund (EPF)",
    itemNameZh: "公积金",
    category: "pension",
    rateEmployer: "0.13", // 13% for wage < 5000, 12% for > 5000
    rateEmployee: "0.11",
    capType: "none",
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "MY",
    itemKey: "socso_my",
    itemNameEn: "SOCSO (Employment Injury)",
    itemNameZh: "社会保险",
    category: "work_injury",
    rateEmployer: "0.0175",
    rateEmployee: "0.005",
    capType: "fixed_amount",
    capBase: "5000", // MYR
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 11. Indonesia (ID)
  {
    countryCode: "ID",
    itemKey: "bpjs_health",
    itemNameEn: "BPJS Health",
    itemNameZh: "健康保险",
    category: "health_insurance",
    rateEmployer: "0.04",
    rateEmployee: "0.01",
    capType: "fixed_amount",
    capBase: "12000000", // IDR
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "ID",
    itemKey: "bpjs_tk_jht",
    itemNameEn: "BPJS Old Age Security (JHT)",
    itemNameZh: "养老保险",
    category: "pension",
    rateEmployer: "0.037",
    rateEmployee: "0.02",
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 12. Philippines (PH)
  {
    countryCode: "PH",
    itemKey: "sss",
    itemNameEn: "Social Security System (SSS)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.095",
    rateEmployee: "0.045",
    capType: "fixed_amount",
    capBase: "30000", // PHP
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "PH",
    itemKey: "philhealth",
    itemNameEn: "PhilHealth",
    itemNameZh: "健康保险",
    category: "health_insurance",
    rateEmployer: "0.025", // 5% total
    rateEmployee: "0.025",
    capType: "fixed_amount",
    capBase: "100000", // PHP
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 13. Taiwan (TW)
  {
    countryCode: "TW",
    itemKey: "labor_insurance",
    itemNameEn: "Labor Insurance",
    itemNameZh: "劳工保险",
    category: "social_insurance",
    rateEmployer: "0.084", // Approx 70% of 12%
    rateEmployee: "0.024", // Approx 20% of 12%
    capType: "fixed_amount",
    capBase: "45800", // TWD
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "TW",
    itemKey: "health_insurance_tw",
    itemNameEn: "National Health Insurance",
    itemNameZh: "全民健保",
    category: "health_insurance",
    rateEmployer: "0.031", // Approx
    rateEmployee: "0.015",
    capType: "fixed_amount",
    capBase: "182000",
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 14. New Zealand (NZ)
  {
    countryCode: "NZ",
    itemKey: "kiwisaver",
    itemNameEn: "KiwiSaver",
    itemNameZh: "KiwiSaver",
    category: "pension",
    rateEmployer: "0.03", // Min 3%
    rateEmployee: "0.03", // Min 3%
    capType: "none",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // =================================================================================
  // Americas
  // =================================================================================

  // 15. United States (US)
  {
    countryCode: "US",
    itemKey: "social_security_us",
    itemNameEn: "Social Security (OASDI)",
    itemNameZh: "社会安全税",
    category: "social_insurance",
    rateEmployer: "0.062",
    rateEmployee: "0.062",
    capType: "fixed_amount",
    capBase: "176100", // 2025 wage base projection
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "US",
    itemKey: "medicare_us",
    itemNameEn: "Medicare",
    itemNameZh: "医疗保险税",
    category: "health_insurance",
    rateEmployer: "0.0145",
    rateEmployee: "0.0145",
    capType: "none",
    effectiveYear: 2025,
    sortOrder: 2,
  },
  {
    countryCode: "US",
    itemKey: "futa",
    itemNameEn: "Federal Unemployment (FUTA)",
    itemNameZh: "联邦失业税",
    category: "unemployment",
    rateEmployer: "0.006", // Net rate after credit
    rateEmployee: "0",
    capType: "fixed_amount",
    capBase: "7000",
    effectiveYear: 2025,
    sortOrder: 3,
  },

  // 16. Canada (CA) - Ontario
  {
    countryCode: "CA",
    regionCode: "ON",
    itemKey: "cpp",
    itemNameEn: "Canada Pension Plan (CPP)",
    itemNameZh: "加拿大养老金",
    category: "pension",
    rateEmployer: "0.0595",
    rateEmployee: "0.0595",
    capType: "fixed_amount",
    capBase: "68500", // YMPE
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "CA",
    regionCode: "ON",
    itemKey: "ei",
    itemNameEn: "Employment Insurance (EI)",
    itemNameZh: "就业保险",
    category: "unemployment",
    rateEmployer: "0.0228", // 1.4x employee rate
    rateEmployee: "0.0163",
    capType: "fixed_amount",
    capBase: "63200",
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 17. Mexico (MX)
  {
    countryCode: "MX",
    itemKey: "imss",
    itemNameEn: "Social Security (IMSS)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.25", // Estimate ~20-30%
    rateEmployee: "0.027",
    capType: "salary_multiple",
    capMultiplier: "25", // 25x UMA
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 18. Brazil (BR)
  {
    countryCode: "BR",
    itemKey: "inss",
    itemNameEn: "Social Security (INSS)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.20", // Standard 20% on payroll
    rateEmployee: "0.14", // Progressive 7.5-14%
    capType: "fixed_amount",
    capBase: "7786", // BRL (Monthly ceiling)
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "BR",
    itemKey: "fgts",
    itemNameEn: "Guarantee Fund (FGTS)",
    itemNameZh: "工龄保障基金",
    category: "unemployment",
    rateEmployer: "0.08",
    rateEmployee: "0",
    capType: "none",
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 19. Colombia (CO)
  {
    countryCode: "CO",
    itemKey: "health_co",
    itemNameEn: "Health",
    itemNameZh: "健康保险",
    category: "health_insurance",
    rateEmployer: "0.085",
    rateEmployee: "0.04",
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "CO",
    itemKey: "pension_co",
    itemNameEn: "Pension",
    itemNameZh: "养老金",
    category: "pension",
    rateEmployer: "0.12",
    rateEmployee: "0.04",
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 20. Chile (CL)
  {
    countryCode: "CL",
    itemKey: "unemployment_cl",
    itemNameEn: "Unemployment Insurance",
    itemNameZh: "失业保险",
    category: "unemployment",
    rateEmployer: "0.024",
    rateEmployee: "0.006",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // =================================================================================
  // EMEA (Europe, Middle East, Africa)
  // =================================================================================

  // 21. United Kingdom (UK)
  {
    countryCode: "GB",
    itemKey: "ni_employer",
    itemNameEn: "National Insurance (Employer)",
    itemNameZh: "国民保险",
    category: "social_insurance",
    rateEmployer: "0.138",
    rateEmployee: "0.10", // Reducing to 10% in 2024/25
    capType: "none", // Employer NI has no upper limit
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "GB",
    itemKey: "pension_uk",
    itemNameEn: "Workplace Pension",
    itemNameZh: "职业养老金",
    category: "pension",
    rateEmployer: "0.03", // Min
    rateEmployee: "0.05", // Min
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 22. Germany (DE)
  {
    countryCode: "DE",
    itemKey: "pension_de",
    itemNameEn: "Pension Insurance (Rentenversicherung)",
    itemNameZh: "养老保险",
    category: "pension",
    rateEmployer: "0.093", // 18.6% split
    rateEmployee: "0.093",
    capType: "fixed_amount",
    capBase: "7550", // West monthly limit
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "DE",
    itemKey: "health_de",
    itemNameEn: "Health Insurance (Krankenversicherung)",
    itemNameZh: "医疗保险",
    category: "health_insurance",
    rateEmployer: "0.073", // 14.6% + surcharge split
    rateEmployee: "0.073",
    capType: "fixed_amount",
    capBase: "5175",
    effectiveYear: 2025,
    sortOrder: 2,
  },
  {
    countryCode: "DE",
    itemKey: "unemployment_de",
    itemNameEn: "Unemployment (Arbeitslosenversicherung)",
    itemNameZh: "失业保险",
    category: "unemployment",
    rateEmployer: "0.013", // 2.6% split
    rateEmployee: "0.013",
    capType: "fixed_amount",
    capBase: "7550",
    effectiveYear: 2025,
    sortOrder: 3,
  },

  // 23. France (FR)
  {
    countryCode: "FR",
    itemKey: "social_charges_fr",
    itemNameEn: "Social Security Charges",
    itemNameZh: "社会分摊金",
    category: "social_insurance",
    rateEmployer: "0.45", // Approx 45% total load
    rateEmployee: "0.22", // Approx 22%
    capType: "bracket", // Highly complex, simplified here
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 24. Italy (IT)
  {
    countryCode: "IT",
    itemKey: "inps",
    itemNameEn: "Social Security (INPS)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.30", // Approx 29-32%
    rateEmployee: "0.0919",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 25. Spain (ES)
  {
    countryCode: "ES",
    itemKey: "social_security_es",
    itemNameEn: "Social Security",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.236", // Common contingencies
    rateEmployee: "0.047",
    capType: "fixed_amount",
    capBase: "4720", // EUR max base
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 26. Netherlands (NL)
  {
    countryCode: "NL",
    itemKey: "employee_insurance",
    itemNameEn: "Employee Insurance",
    itemNameZh: "雇员保险",
    category: "social_insurance",
    rateEmployer: "0.18", // Approx total
    rateEmployee: "0",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 27. Sweden (SE)
  {
    countryCode: "SE",
    itemKey: "employer_contributions",
    itemNameEn: "Employer Contributions (Arbetsgivaravgifter)",
    itemNameZh: "雇主税",
    category: "social_insurance",
    rateEmployer: "0.3142", // 31.42% fixed
    rateEmployee: "0", // Included in tax usually
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 28. Switzerland (CH)
  {
    countryCode: "CH",
    itemKey: "avs_ai_apg",
    itemNameEn: "AHV/IV/EO (OASI/DI/IC)",
    itemNameZh: "养老遗属/残疾/服役补偿",
    category: "pension",
    rateEmployer: "0.053", // 10.6% split
    rateEmployee: "0.053",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 29. Ireland (IE)
  {
    countryCode: "IE",
    itemKey: "prsi",
    itemNameEn: "PRSI (Class A)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.1105", // 11.05%
    rateEmployee: "0.04",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 30. Poland (PL)
  {
    countryCode: "PL",
    itemKey: "zus",
    itemNameEn: "Social Security (ZUS)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.2048", // Approx total
    rateEmployee: "0.1371",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 31. Belgium (BE)
  {
    countryCode: "BE",
    itemKey: "onss",
    itemNameEn: "Social Security (ONSS)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.25", // Approx 25% base
    rateEmployee: "0.1307",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 32. Austria (AT)
  {
    countryCode: "AT",
    itemKey: "social_security_at",
    itemNameEn: "Social Security",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.2123",
    rateEmployee: "0.1812",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 33. Portugal (PT)
  {
    countryCode: "PT",
    itemKey: "social_security_pt",
    itemNameEn: "Social Security",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.2375",
    rateEmployee: "0.11",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 34. United Arab Emirates (AE)
  {
    countryCode: "AE",
    itemKey: "pension_ae",
    itemNameEn: "Pension (GPSSA) - Nationals Only",
    itemNameZh: "养老金 (仅本国公民)",
    category: "pension",
    rateEmployer: "0.125", // Gov sector 15%, Private 12.5%
    rateEmployee: "0.05",
    capType: "fixed_amount",
    capBase: "50000", // AED
    effectiveYear: 2025,
    sortOrder: 1,
  },
  // Note: For expats, gratuity applies (end of service benefit), not monthly contribution usually.

  // 35. Saudi Arabia (SA)
  {
    countryCode: "SA",
    itemKey: "gosi",
    itemNameEn: "GOSI (Social Insurance) - Nationals",
    itemNameZh: "社会保险 (仅本国公民)",
    category: "social_insurance",
    rateEmployer: "0.12",
    rateEmployee: "0.10",
    capType: "fixed_amount",
    capBase: "45000", // SAR
    effectiveYear: 2025,
    sortOrder: 1,
  },
  {
    countryCode: "SA",
    itemKey: "gosi_expat",
    itemNameEn: "GOSI (Work Injury) - Expats",
    itemNameZh: "工伤保险 (外籍员工)",
    category: "work_injury",
    rateEmployer: "0.02",
    rateEmployee: "0",
    effectiveYear: 2025,
    sortOrder: 2,
  },

  // 36. South Africa (ZA)
  {
    countryCode: "ZA",
    itemKey: "uif",
    itemNameEn: "Unemployment Insurance Fund (UIF)",
    itemNameZh: "失业保险",
    category: "unemployment",
    rateEmployer: "0.01",
    rateEmployee: "0.01",
    capType: "fixed_amount",
    capBase: "17712", // ZAR
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 37. Turkey (TR)
  {
    countryCode: "TR",
    itemKey: "sgk",
    itemNameEn: "Social Security (SGK)",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.205", // 20.5% (22.5 - 5% incentive + 2% unemp + 1% other)
    rateEmployee: "0.15",
    capType: "fixed_amount",
    capBase: "150018", // TRY (Approx 7.5x min wage)
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 38. Egypt (EG)
  {
    countryCode: "EG",
    itemKey: "social_insurance_eg",
    itemNameEn: "Social Insurance",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.1875",
    rateEmployee: "0.11",
    capType: "fixed_amount",
    capBase: "12600", // EGP
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 39. Denmark (DK)
  {
    countryCode: "DK",
    itemKey: "atp",
    itemNameEn: "ATP (Pension)",
    itemNameZh: "补充养老金",
    category: "pension",
    rateEmployer: "0", // Fixed amount ~190 DKK
    rateEmployee: "0", // Fixed amount ~90 DKK
    capType: "fixed_amount", // Actually it's a fixed contribution, simplified here
    capBase: "0",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 40. Finland (FI)
  {
    countryCode: "FI",
    itemKey: "tyel",
    itemNameEn: "Pension (TyEL)",
    itemNameZh: "养老金",
    category: "pension",
    rateEmployer: "0.174", // Avg
    rateEmployee: "0.0715",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 41. Norway (NO)
  {
    countryCode: "NO",
    itemKey: "payroll_tax",
    itemNameEn: "Payroll Tax",
    itemNameZh: "薪资税",
    category: "social_insurance",
    rateEmployer: "0.141", // Zone 1
    rateEmployee: "0.078", // NI
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 42. Czech Republic (CZ)
  {
    countryCode: "CZ",
    itemKey: "social_health",
    itemNameEn: "Social & Health",
    itemNameZh: "社保与医保",
    category: "social_insurance",
    rateEmployer: "0.338",
    rateEmployee: "0.11",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 43. Hungary (HU)
  {
    countryCode: "HU",
    itemKey: "social_tax",
    itemNameEn: "Social Contribution Tax",
    itemNameZh: "社会贡献税",
    category: "social_insurance",
    rateEmployer: "0.13",
    rateEmployee: "0.185",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 44. Romania (RO)
  {
    countryCode: "RO",
    itemKey: "social_contributions",
    itemNameEn: "Social Contributions",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.0225", // Shifted to employee mostly
    rateEmployee: "0.35",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 45. Greece (GR)
  {
    countryCode: "GR",
    itemKey: "efka",
    itemNameEn: "EFKA",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.2229",
    rateEmployee: "0.1387",
    capType: "fixed_amount",
    capBase: "7373", // EUR
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 46. Israel (IL)
  {
    countryCode: "IL",
    itemKey: "national_insurance",
    itemNameEn: "National Insurance",
    itemNameZh: "国民保险",
    category: "social_insurance",
    rateEmployer: "0.076", // Upper bracket
    rateEmployee: "0.12",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 47. Pakistan (PK)
  {
    countryCode: "PK",
    itemKey: "eobi",
    itemNameEn: "EOBI",
    itemNameZh: "养老保险",
    category: "pension",
    rateEmployer: "0.05",
    rateEmployee: "0.01",
    capType: "fixed_amount",
    capBase: "25000", // Minimum wages reference
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 48. Bangladesh (BD)
  // Limited formal social security usually
  {
    countryCode: "BD",
    itemKey: "provident_fund",
    itemNameEn: "Provident Fund",
    itemNameZh: "公积金",
    category: "pension",
    rateEmployer: "0.0833", // Optional usually
    rateEmployee: "0.0833",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 49. Philippines (PH) - Duplicate removed, replaced with Sri Lanka (LK)
  {
    countryCode: "LK",
    itemKey: "epf_lk",
    itemNameEn: "EPF",
    itemNameZh: "公积金",
    category: "pension",
    rateEmployer: "0.12",
    rateEmployee: "0.08",
    effectiveYear: 2025,
    sortOrder: 1,
  },

  // 50. Cambodia (KH)
  {
    countryCode: "KH",
    itemKey: "nssf",
    itemNameEn: "NSSF",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.034", // Approx
    rateEmployee: "0", // Mostly employer
    effectiveYear: 2025,
    sortOrder: 1,
  },
  
  // 51. Argentina (AR)
  {
    countryCode: "AR",
    itemKey: "social_security_ar",
    itemNameEn: "Social Security",
    itemNameZh: "社会保险",
    category: "social_insurance",
    rateEmployer: "0.264", // Avg
    rateEmployee: "0.17",
    effectiveYear: 2025,
    sortOrder: 1,
  }
];
