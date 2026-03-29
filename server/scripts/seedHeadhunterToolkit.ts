/**
 * Seed script for Headhunter Toolkit data
 * Generates initial AI-sourced data for global benefits, hiring compliance,
 * and expanded salary benchmarks for core countries.
 *
 * Usage: npx tsx server/scripts/seedHeadhunterToolkit.ts
 *
 * All data is marked with source = "ai_generated" and should be verified
 * by the business team before being marked as "gea_official".
 */

// ── Types matching schema enums ──────────────────────────────────────────────

interface BenefitSeed {
  countryCode: string;
  benefitType: "statutory" | "customary";
  category:
    | "social_security"
    | "health_insurance"
    | "pension"
    | "paid_leave"
    | "parental"
    | "housing"
    | "meal_transport"
    | "bonus"
    | "insurance"
    | "equity"
    | "wellness"
    | "education"
    | "other";
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  costIndication?: string;
  pitchCardEn?: string;
  pitchCardZh?: string;
  sortOrder: number;
}

interface ComplianceSeed {
  countryCode: string;
  probationRulesEn: string;
  probationRulesZh: string;
  noticePeriodRulesEn: string;
  noticePeriodRulesZh: string;
  backgroundCheckRulesEn: string;
  backgroundCheckRulesZh: string;
  severanceRulesEn: string;
  severanceRulesZh: string;
  nonCompeteRulesEn: string;
  nonCompeteRulesZh: string;
  workPermitRulesEn: string;
  workPermitRulesZh: string;
  additionalNotesEn?: string;
  additionalNotesZh?: string;
}

interface SalaryBenchmarkSeed {
  countryCode: string;
  jobCategory: string;
  jobTitle: string;
  seniorityLevel: "junior" | "mid" | "senior" | "lead" | "director";
  salaryP25: string;
  salaryP50: string;
  salaryP75: string;
  currency: string;
  dataYear: number;
}

// ── BENEFITS DATA ────────────────────────────────────────────────────────────

export const benefitsData: BenefitSeed[] = [
  // ── Singapore (SG) ──
  { countryCode: "SG", benefitType: "statutory", category: "pension", nameEn: "Central Provident Fund (CPF)", nameZh: "中央公积金 (CPF)", descriptionEn: "Mandatory savings scheme covering retirement, healthcare, and housing. Employer contributes up to 17% of ordinary wages for employees under 55.", descriptionZh: "强制性储蓄计划，涵盖退休、医疗和住房。雇主为55岁以下员工缴纳最高17%的普通工资。", costIndication: "Up to 17% of ordinary wages (employer)", pitchCardEn: "In Singapore, the Central Provident Fund (CPF) is a mandatory government-administered savings scheme. Employers must contribute up to 17% of the employee's ordinary wages. This is not optional — it is a strict legal requirement.", pitchCardZh: "在新加坡，中央公积金（CPF）是政府强制管理的储蓄计划。雇主必须缴纳员工普通工资的最高17%。这不是可选项——而是严格的法律要求。", sortOrder: 1 },
  { countryCode: "SG", benefitType: "statutory", category: "paid_leave", nameEn: "Annual Leave", nameZh: "年假", descriptionEn: "Minimum 7 days for first year, increasing by 1 day per year up to 14 days.", descriptionZh: "第一年最少7天，每年递增1天，最多14天。", sortOrder: 2 },
  { countryCode: "SG", benefitType: "statutory", category: "parental", nameEn: "Maternity Leave", nameZh: "产假", descriptionEn: "16 weeks of government-paid maternity leave for eligible mothers.", descriptionZh: "符合条件的母亲享有16周政府支付的产假。", costIndication: "Government-funded for eligible employees", sortOrder: 3 },
  { countryCode: "SG", benefitType: "customary", category: "health_insurance", nameEn: "Group Medical Insurance", nameZh: "团体医疗保险", descriptionEn: "Most employers provide supplementary group health insurance covering outpatient, specialist, and hospitalization.", descriptionZh: "大多数雇主提供补充团体健康保险，涵盖门诊、专科和住院。", costIndication: "~SGD 500–2,000/year per employee", sortOrder: 4 },
  { countryCode: "SG", benefitType: "customary", category: "bonus", nameEn: "Annual Wage Supplement (AWS / 13th Month)", nameZh: "年度工资补充 (第13个月薪)", descriptionEn: "While not legally required, the 13th-month bonus (AWS) is a deeply entrenched market practice in Singapore.", descriptionZh: "虽然法律上不强制，但第13个月奖金（AWS）是新加坡根深蒂固的市场惯例。", costIndication: "1 month salary", pitchCardEn: "The Annual Wage Supplement (13th month bonus) is not legally mandated in Singapore, but it is a strong market norm. Not offering it would put you at a significant disadvantage in talent attraction.", pitchCardZh: "年度工资补充（第13个月奖金）在新加坡虽非法律强制，但属于强烈的市场惯例。不提供将使您在人才吸引方面处于明显劣势。", sortOrder: 5 },

  // ── Vietnam (VN) ──
  { countryCode: "VN", benefitType: "statutory", category: "social_security", nameEn: "Social Insurance (BHXH)", nameZh: "社会保险 (BHXH)", descriptionEn: "Covers sickness, maternity, occupational disease, retirement, and death. Employer contributes 17.5% of gross salary.", descriptionZh: "涵盖疾病、生育、职业病、退休和死亡。雇主缴纳工资总额的17.5%。", costIndication: "17.5% of gross salary (employer)", sortOrder: 1 },
  { countryCode: "VN", benefitType: "statutory", category: "health_insurance", nameEn: "Health Insurance (BHYT)", nameZh: "医疗保险 (BHYT)", descriptionEn: "Mandatory health insurance. Employer contributes 3% of gross salary.", descriptionZh: "强制医疗保险。雇主缴纳工资总额的3%。", costIndication: "3% of gross salary (employer)", sortOrder: 2 },
  { countryCode: "VN", benefitType: "statutory", category: "social_security", nameEn: "Unemployment Insurance (BHTN)", nameZh: "失业保险 (BHTN)", descriptionEn: "Employer contributes 1% of gross salary for unemployment insurance.", descriptionZh: "雇主缴纳工资总额的1%作为失业保险。", costIndication: "1% of gross salary (employer)", sortOrder: 3 },
  { countryCode: "VN", benefitType: "statutory", category: "bonus", nameEn: "13th Month Salary (Tet Bonus)", nameZh: "第13个月工资 (春节奖金)", descriptionEn: "Legally required year-end bonus equivalent to at least one month's salary, typically paid before Tet (Lunar New Year).", descriptionZh: "法定年终奖金，至少相当于一个月工资，通常在春节前发放。", costIndication: "1 month salary (mandatory)", pitchCardEn: "In Vietnam, the 13th-month salary is a strict legal requirement under the Labour Code, not a discretionary bonus. It must be paid to all employees before the Lunar New Year (Tet) holiday.", pitchCardZh: "在越南，第13个月工资是《劳动法》的严格法律要求，而非自由裁量的奖金。必须在农历新年（春节）前支付给所有员工。", sortOrder: 4 },
  { countryCode: "VN", benefitType: "customary", category: "meal_transport", nameEn: "Lunch Allowance", nameZh: "午餐补贴", descriptionEn: "Most employers provide a monthly lunch allowance of VND 730,000–1,500,000, which is tax-exempt up to VND 730,000.", descriptionZh: "大多数雇主提供每月730,000-1,500,000越南盾的午餐补贴，其中730,000越南盾以内免税。", costIndication: "VND 730,000–1,500,000/month", sortOrder: 5 },
  { countryCode: "VN", benefitType: "customary", category: "insurance", nameEn: "Supplementary Health Insurance (PVI/Bảo Việt)", nameZh: "补充商业医疗保险", descriptionEn: "Premium private health insurance is a key talent attraction tool, covering inpatient and outpatient beyond public BHYT.", descriptionZh: "高端商业医疗保险是吸引人才的关键工具，涵盖超出公共BHYT的住院和门诊。", costIndication: "~USD 200–800/year per employee", sortOrder: 6 },

  // ── Philippines (PH) ──
  { countryCode: "PH", benefitType: "statutory", category: "bonus", nameEn: "13th Month Pay", nameZh: "第13个月薪", descriptionEn: "All rank-and-file employees are entitled to a 13th-month pay, equivalent to 1/12 of total basic salary earned during the year.", descriptionZh: "所有普通员工有权获得第13个月薪，相当于全年基本工资总额的1/12。", costIndication: "8.33% of annual base salary", pitchCardEn: "In the Philippines, the 13th-month pay is not a bonus — it is a strict statutory requirement mandated by Presidential Decree No. 851. Every employer must pay it to all rank-and-file employees by December 24 each year.", pitchCardZh: "在菲律宾，第13个月薪不是奖金——它是第851号总统令规定的严格法定要求。每个雇主必须在每年12月24日前支付给所有普通员工。", sortOrder: 1 },
  { countryCode: "PH", benefitType: "statutory", category: "social_security", nameEn: "SSS (Social Security System)", nameZh: "社会保障系统 (SSS)", descriptionEn: "Mandatory social security covering retirement, disability, sickness, maternity, and death benefits.", descriptionZh: "强制社会保障，涵盖退休、残疾、疾病、生育和死亡福利。", costIndication: "~9.5% employer share (2025 rate)", sortOrder: 2 },
  { countryCode: "PH", benefitType: "statutory", category: "health_insurance", nameEn: "PhilHealth", nameZh: "菲律宾健康保险", descriptionEn: "National health insurance program. Employer and employee share contributions equally.", descriptionZh: "国家健康保险计划。雇主和员工平均分担缴费。", costIndication: "2.5% employer share", sortOrder: 3 },
  { countryCode: "PH", benefitType: "statutory", category: "housing", nameEn: "Pag-IBIG Fund (HDMF)", nameZh: "住房公积金 (Pag-IBIG)", descriptionEn: "Home Development Mutual Fund for housing loans. Employer contributes 2% of salary (max PHP 200).", descriptionZh: "住房发展互助基金，用于住房贷款。雇主缴纳工资的2%（最高200比索）。", costIndication: "2% of salary (max PHP 200/month)", sortOrder: 4 },
  { countryCode: "PH", benefitType: "customary", category: "meal_transport", nameEn: "Rice Subsidy / Meal Allowance", nameZh: "大米补贴 / 餐食补贴", descriptionEn: "Many employers provide a monthly rice subsidy (up to PHP 2,000 tax-free) or meal allowance.", descriptionZh: "许多雇主提供每月大米补贴（最高2,000比索免税）或餐食补贴。", costIndication: "PHP 1,500–2,000/month", sortOrder: 5 },
  { countryCode: "PH", benefitType: "customary", category: "insurance", nameEn: "HMO (Health Maintenance Organization)", nameZh: "健康维护组织 (HMO)", descriptionEn: "Private HMO coverage is considered essential for talent retention. Most employers cover employee + dependents.", descriptionZh: "私人HMO保险被认为是留住人才的必需品。大多数雇主为员工及其家属提供保障。", costIndication: "PHP 15,000–40,000/year per employee", sortOrder: 6 },

  // ── India (IN) ──
  { countryCode: "IN", benefitType: "statutory", category: "pension", nameEn: "Employees' Provident Fund (EPF)", nameZh: "员工公积金 (EPF)", descriptionEn: "Mandatory retirement savings. Employer contributes 12% of basic salary + DA to EPF.", descriptionZh: "强制退休储蓄。雇主缴纳基本工资+DA的12%至EPF。", costIndication: "12% of basic + DA (employer)", sortOrder: 1 },
  { countryCode: "IN", benefitType: "statutory", category: "social_security", nameEn: "Employee State Insurance (ESI)", nameZh: "员工国家保险 (ESI)", descriptionEn: "Covers medical, sickness, maternity, and disability benefits for employees earning up to INR 21,000/month.", descriptionZh: "为月薪不超过21,000卢比的员工提供医疗、疾病、生育和残疾福利。", costIndication: "3.25% of gross wages (employer)", sortOrder: 2 },
  { countryCode: "IN", benefitType: "statutory", category: "bonus", nameEn: "Statutory Bonus", nameZh: "法定奖金", descriptionEn: "Under the Payment of Bonus Act, employees earning up to INR 21,000/month are entitled to a minimum bonus of 8.33% of salary.", descriptionZh: "根据《奖金支付法》，月薪不超过21,000卢比的员工有权获得最低8.33%工资的奖金。", costIndication: "8.33%–20% of basic salary", sortOrder: 3 },
  { countryCode: "IN", benefitType: "statutory", category: "other", nameEn: "Gratuity", nameZh: "酬金", descriptionEn: "Employees who have completed 5+ years of service are entitled to gratuity of 15 days' wages for each year of service.", descriptionZh: "服务满5年以上的员工有权获得每年服务15天工资的酬金。", costIndication: "~4.81% of basic salary (accrual)", sortOrder: 4 },
  { countryCode: "IN", benefitType: "customary", category: "health_insurance", nameEn: "Group Health Insurance (GMC)", nameZh: "团体健康保险 (GMC)", descriptionEn: "Almost all employers provide Group Mediclaim covering employee + family with INR 3–10 lakh sum insured.", descriptionZh: "几乎所有雇主都提供团体医疗保险，涵盖员工及家属，保额3-10万卢比。", costIndication: "INR 5,000–15,000/year per employee", sortOrder: 5 },
  { countryCode: "IN", benefitType: "customary", category: "meal_transport", nameEn: "Flexible Benefits (Meal + Transport)", nameZh: "弹性福利（餐补+交通）", descriptionEn: "Most companies offer tax-efficient meal vouchers (Sodexo) and transport allowance as part of CTC.", descriptionZh: "大多数公司提供节税的餐券（Sodexo）和交通补贴作为CTC的一部分。", costIndication: "Included in CTC structure", sortOrder: 6 },

  // ── United States (US) ──
  { countryCode: "US", benefitType: "statutory", category: "social_security", nameEn: "Social Security (FICA)", nameZh: "社会保障 (FICA)", descriptionEn: "Federal Insurance Contributions Act tax. Employer pays 6.2% of wages up to the annual wage base ($176,100 in 2025).", descriptionZh: "联邦保险贡献法税。雇主缴纳工资的6.2%，上限为年度工资基数（2025年为176,100美元）。", costIndication: "6.2% of wages (capped)", sortOrder: 1 },
  { countryCode: "US", benefitType: "statutory", category: "health_insurance", nameEn: "Medicare", nameZh: "医疗保险 (Medicare)", descriptionEn: "Employer pays 1.45% of all wages with no cap.", descriptionZh: "雇主缴纳所有工资的1.45%，无上限。", costIndication: "1.45% of all wages", sortOrder: 2 },
  { countryCode: "US", benefitType: "statutory", category: "social_security", nameEn: "Unemployment Insurance (FUTA/SUTA)", nameZh: "失业保险 (FUTA/SUTA)", descriptionEn: "Federal and state unemployment taxes. FUTA is 6% on first $7,000 of wages (effectively 0.6% with state credit).", descriptionZh: "联邦和州失业税。FUTA为前7,000美元工资的6%（扣除州抵免后实际为0.6%）。", costIndication: "~0.6% FUTA + variable SUTA", sortOrder: 3 },
  { countryCode: "US", benefitType: "customary", category: "health_insurance", nameEn: "Employer-Sponsored Health Insurance", nameZh: "雇主赞助的健康保险", descriptionEn: "The most critical benefit in the US. Employers typically cover 70–80% of premiums for medical, dental, and vision.", descriptionZh: "美国最关键的福利。雇主通常承担医疗、牙科和视力保险费的70-80%。", costIndication: "~USD 7,000–15,000/year per employee", pitchCardEn: "In the United States, there is no universal public healthcare. Employer-sponsored health insurance is the #1 expected benefit and a non-negotiable for talent attraction. Not offering it makes hiring virtually impossible for professional roles.", pitchCardZh: "美国没有全民公共医疗。雇主赞助的健康保险是排名第一的期望福利，是吸引人才的不可谈判项。不提供它几乎不可能招聘到专业岗位人才。", sortOrder: 4 },
  { countryCode: "US", benefitType: "customary", category: "pension", nameEn: "401(k) Retirement Plan", nameZh: "401(k) 退休计划", descriptionEn: "Most employers offer a 401(k) plan with employer matching, typically 3–6% of salary.", descriptionZh: "大多数雇主提供401(k)计划并进行雇主匹配，通常为工资的3-6%。", costIndication: "3–6% of salary (employer match)", sortOrder: 5 },
  { countryCode: "US", benefitType: "customary", category: "paid_leave", nameEn: "Paid Time Off (PTO)", nameZh: "带薪休假 (PTO)", descriptionEn: "No federal mandate for paid vacation. Market standard is 15–20 days PTO for professional roles.", descriptionZh: "联邦层面无带薪假期强制要求。专业岗位的市场标准为15-20天PTO。", costIndication: "Included in salary cost", sortOrder: 6 },

  // ── United Kingdom (GB) ──
  { countryCode: "GB", benefitType: "statutory", category: "pension", nameEn: "Workplace Pension (Auto-Enrolment)", nameZh: "职场养老金（自动注册）", descriptionEn: "Employers must auto-enrol eligible workers and contribute at least 3% of qualifying earnings.", descriptionZh: "雇主必须自动注册符合条件的员工，并缴纳至少3%的合格收入。", costIndication: "Minimum 3% of qualifying earnings", sortOrder: 1 },
  { countryCode: "GB", benefitType: "statutory", category: "paid_leave", nameEn: "Statutory Annual Leave", nameZh: "法定年假", descriptionEn: "All workers are entitled to 5.6 weeks (28 days for full-time) paid annual leave, which can include public holidays.", descriptionZh: "所有员工有权享受5.6周（全职28天）带薪年假，可包含公共假日。", sortOrder: 2 },
  { countryCode: "GB", benefitType: "statutory", category: "health_insurance", nameEn: "National Insurance Contributions (NIC)", nameZh: "国家保险缴费 (NIC)", descriptionEn: "Employer NIC is 13.8% on earnings above the secondary threshold (£175/week in 2024/25).", descriptionZh: "雇主NIC为超过二级门槛（2024/25年度每周175英镑）收入的13.8%。", costIndication: "13.8% above threshold", sortOrder: 3 },
  { countryCode: "GB", benefitType: "customary", category: "health_insurance", nameEn: "Private Medical Insurance (PMI)", nameZh: "私人医疗保险 (PMI)", descriptionEn: "While the NHS provides free healthcare, many employers offer PMI for faster access to specialists.", descriptionZh: "虽然NHS提供免费医疗，但许多雇主提供PMI以更快获得专科服务。", costIndication: "~GBP 500–1,500/year per employee", sortOrder: 4 },
  { countryCode: "GB", benefitType: "customary", category: "wellness", nameEn: "Cycle to Work Scheme", nameZh: "骑行上班计划", descriptionEn: "Tax-efficient scheme allowing employees to lease bicycles through salary sacrifice.", descriptionZh: "节税计划，允许员工通过工资牺牲方式租赁自行车。", sortOrder: 5 },

  // ── Germany (DE) ──
  { countryCode: "DE", benefitType: "statutory", category: "social_security", nameEn: "Social Insurance (Sozialversicherung)", nameZh: "社会保险", descriptionEn: "Comprehensive mandatory social insurance covering health, pension, unemployment, nursing care, and accident insurance. Total employer cost ~20–21% of gross salary.", descriptionZh: "全面的强制社会保险，涵盖健康、养老、失业、护理和工伤保险。雇主总成本约为工资总额的20-21%。", costIndication: "~20–21% of gross salary (employer total)", sortOrder: 1 },
  { countryCode: "DE", benefitType: "statutory", category: "paid_leave", nameEn: "Minimum Annual Leave", nameZh: "最低年假", descriptionEn: "Minimum 20 working days (based on 5-day week). Most employers offer 25–30 days.", descriptionZh: "最低20个工作日（基于每周5天）。大多数雇主提供25-30天。", sortOrder: 2 },
  { countryCode: "DE", benefitType: "statutory", category: "parental", nameEn: "Parental Leave (Elternzeit)", nameZh: "育儿假 (Elternzeit)", descriptionEn: "Up to 3 years of unpaid parental leave per child, with job protection. Elterngeld provides 65–67% of net income for up to 14 months.", descriptionZh: "每个孩子最多3年无薪育儿假，享有工作保护。育儿津贴提供净收入的65-67%，最长14个月。", sortOrder: 3 },
  { countryCode: "DE", benefitType: "customary", category: "meal_transport", nameEn: "Company Car / Mobility Budget", nameZh: "公司用车 / 出行预算", descriptionEn: "A company car or mobility budget is a very common perk for mid-to-senior roles in Germany.", descriptionZh: "公司用车或出行预算是德国中高级职位非常常见的福利。", costIndication: "EUR 300–800/month equivalent", sortOrder: 4 },
  { countryCode: "DE", benefitType: "customary", category: "pension", nameEn: "Company Pension (bAV)", nameZh: "企业养老金 (bAV)", descriptionEn: "Employer-funded supplementary pension scheme. Employees have a legal right to salary conversion (Entgeltumwandlung).", descriptionZh: "雇主资助的补充养老金计划。员工有权进行工资转换（Entgeltumwandlung）。", costIndication: "Employer must subsidize at least 15% of converted amount", sortOrder: 5 },

  // ── Japan (JP) ──
  { countryCode: "JP", benefitType: "statutory", category: "social_security", nameEn: "Social Insurance (Shakai Hoken)", nameZh: "社会保险 (社会保険)", descriptionEn: "Covers health insurance, pension, employment insurance, and workers' compensation. Total employer cost ~15–16% of salary.", descriptionZh: "涵盖健康保险、养老金、雇佣保险和工伤补偿。雇主总成本约为工资的15-16%。", costIndication: "~15–16% of salary (employer total)", sortOrder: 1 },
  { countryCode: "JP", benefitType: "statutory", category: "bonus", nameEn: "Bonus (Twice Yearly)", nameZh: "奖金（每年两次）", descriptionEn: "While not strictly mandated by law, semi-annual bonuses (summer and winter) are deeply embedded in Japanese employment practice and often specified in employment rules.", descriptionZh: "虽然法律上不严格强制，但半年奖金（夏季和冬季）深深嵌入日本的雇佣惯例中，通常在就业规则中明确规定。", costIndication: "Typically 2–6 months total per year", pitchCardEn: "In Japan, the semi-annual bonus system (summer & winter) is a deeply rooted employment practice. While not strictly statutory, it is specified in most companies' employment regulations and is expected by virtually all candidates.", pitchCardZh: "在日本，半年奖金制度（夏季和冬季）是根深蒂固的雇佣惯例。虽然不是严格的法定要求，但大多数公司的就业规则中都有明确规定，几乎所有候选人都有此期望。", sortOrder: 2 },
  { countryCode: "JP", benefitType: "statutory", category: "paid_leave", nameEn: "Paid Annual Leave", nameZh: "带薪年假", descriptionEn: "Minimum 10 days after 6 months of continuous employment, increasing to 20 days over time.", descriptionZh: "连续工作6个月后最少10天，随时间递增至20天。", sortOrder: 3 },
  { countryCode: "JP", benefitType: "customary", category: "meal_transport", nameEn: "Commuting Allowance (Tsūkin Teate)", nameZh: "通勤补贴 (通勤手当)", descriptionEn: "Nearly all Japanese employers fully reimburse commuting costs (train pass). Tax-exempt up to JPY 150,000/month.", descriptionZh: "几乎所有日本雇主全额报销通勤费用（月票）。每月15万日元以内免税。", costIndication: "Full reimbursement (tax-exempt up to JPY 150,000/month)", sortOrder: 4 },

  // ── Brazil (BR) ──
  { countryCode: "BR", benefitType: "statutory", category: "bonus", nameEn: "13th Salary (Décimo Terceiro)", nameZh: "第13个月工资 (Décimo Terceiro)", descriptionEn: "All employees are entitled to a 13th salary, paid in two installments (November and December).", descriptionZh: "所有员工有权获得第13个月工资，分两期支付（11月和12月）。", costIndication: "1 month salary (mandatory)", pitchCardEn: "In Brazil, the 13th salary (Décimo Terceiro Salário) is a constitutional right guaranteed by law. It must be paid in two installments: the first by November 30 and the second by December 20. This is non-negotiable.", pitchCardZh: "在巴西，第13个月工资（Décimo Terceiro Salário）是宪法保障的法定权利。必须分两期支付：第一期在11月30日前，第二期在12月20日前。这是不可谈判的。", sortOrder: 1 },
  { countryCode: "BR", benefitType: "statutory", category: "meal_transport", nameEn: "Transportation Voucher (Vale-Transporte)", nameZh: "交通券 (Vale-Transporte)", descriptionEn: "Employers must provide transportation vouchers. Can deduct up to 6% of employee's base salary.", descriptionZh: "雇主必须提供交通券。可从员工基本工资中扣除最多6%。", costIndication: "Net cost after 6% employee deduction", sortOrder: 2 },
  { countryCode: "BR", benefitType: "statutory", category: "housing", nameEn: "FGTS (Severance Fund)", nameZh: "FGTS (解雇基金)", descriptionEn: "Employer deposits 8% of salary monthly into employee's FGTS account.", descriptionZh: "雇主每月将工资的8%存入员工的FGTS账户。", costIndication: "8% of salary (employer)", sortOrder: 3 },
  { countryCode: "BR", benefitType: "customary", category: "meal_transport", nameEn: "Meal Voucher (Vale-Refeição / Vale-Alimentação)", nameZh: "餐券 (VR/VA)", descriptionEn: "Most employers provide meal vouchers (VR) or food vouchers (VA), which are tax-deductible under PAT program.", descriptionZh: "大多数雇主提供餐券（VR）或食品券（VA），在PAT计划下可税前扣除。", costIndication: "BRL 500–1,200/month", pitchCardEn: "In Brazil, while meal vouchers (Vale-Refeição) are not strictly mandatory, they are a universal market practice and expected by all candidates. Companies enrolled in the PAT program receive tax benefits for providing them.", pitchCardZh: "在巴西，虽然餐券（Vale-Refeição）不是严格强制的，但它是普遍的市场惯例，所有候选人都有此期望。加入PAT计划的公司可获得提供餐券的税收优惠。", sortOrder: 4 },
  { countryCode: "BR", benefitType: "customary", category: "health_insurance", nameEn: "Private Health Plan (Plano de Saúde)", nameZh: "私人健康计划 (Plano de Saúde)", descriptionEn: "Private health insurance is considered essential for talent attraction in Brazil.", descriptionZh: "私人健康保险被认为是巴西吸引人才的必需品。", costIndication: "BRL 300–800/month per employee", sortOrder: 5 },

  // ── UAE (AE) ──
  { countryCode: "AE", benefitType: "statutory", category: "paid_leave", nameEn: "Annual Leave", nameZh: "年假", descriptionEn: "Minimum 30 calendar days per year after completing one year of service.", descriptionZh: "完成一年服务后，每年最少30个日历天。", sortOrder: 1 },
  { countryCode: "AE", benefitType: "statutory", category: "other", nameEn: "End of Service Gratuity", nameZh: "服务终止酬金", descriptionEn: "21 days' basic salary for each year of the first 5 years, and 30 days for each subsequent year.", descriptionZh: "前5年每年21天基本工资，此后每年30天基本工资。", costIndication: "~5.8% of basic salary (accrual for first 5 years)", pitchCardEn: "In the UAE, the End of Service Gratuity (EOSG) is a mandatory terminal benefit. Employers must pay 21 days' salary per year for the first 5 years and 30 days per year thereafter. This is calculated on basic salary only and is payable upon termination.", pitchCardZh: "在阿联酋，服务终止酬金（EOSG）是强制性的终止福利。雇主必须支付前5年每年21天工资，此后每年30天工资。按基本工资计算，在终止雇佣时支付。", sortOrder: 2 },
  { countryCode: "AE", benefitType: "statutory", category: "health_insurance", nameEn: "Mandatory Health Insurance", nameZh: "强制健康保险", descriptionEn: "Employers must provide health insurance to all employees (mandatory in Abu Dhabi and Dubai).", descriptionZh: "雇主必须为所有员工提供健康保险（在阿布扎比和迪拜为强制性）。", costIndication: "AED 3,000–10,000/year per employee", sortOrder: 3 },
  { countryCode: "AE", benefitType: "customary", category: "other", nameEn: "Annual Flight Ticket", nameZh: "年度机票", descriptionEn: "Many employers provide an annual return flight ticket to the employee's home country.", descriptionZh: "许多雇主提供员工回国的年度往返机票。", costIndication: "AED 2,000–8,000/year", sortOrder: 4 },
  { countryCode: "AE", benefitType: "customary", category: "housing", nameEn: "Housing Allowance", nameZh: "住房补贴", descriptionEn: "Housing allowance is a standard component of compensation packages in the UAE, often 30–40% of base salary.", descriptionZh: "住房补贴是阿联酋薪酬方案的标准组成部分，通常为基本工资的30-40%。", costIndication: "30–40% of base salary", sortOrder: 5 },
];

// ── COMPLIANCE DATA ──────────────────────────────────────────────────────────

export const complianceData: ComplianceSeed[] = [
  {
    countryCode: "SG",
    probationRulesEn: "No statutory maximum. Market standard is 3–6 months. During probation, either party may terminate with shorter notice (typically 1 week).",
    probationRulesZh: "无法定上限。市场标准为3-6个月。试用期内，任一方可以较短通知期（通常1周）终止合同。",
    noticePeriodRulesEn: "As per employment contract, typically 1–3 months. If not specified, statutory default is 1 day (for < 26 weeks) to 4 weeks (for 5+ years).",
    noticePeriodRulesZh: "按劳动合同约定，通常1-3个月。如未约定，法定默认为1天（不足26周）至4周（5年以上）。",
    backgroundCheckRulesEn: "Generally permitted. Criminal record checks, employment verification, and education verification are common. Must comply with PDPA for data handling.",
    backgroundCheckRulesZh: "一般允许。犯罪记录查询、工作经历核实和学历核实很常见。数据处理须遵守PDPA。",
    severanceRulesEn: "No statutory severance pay requirement. Retrenchment benefits are typically negotiated (market norm: 2 weeks to 1 month per year of service).",
    severanceRulesZh: "无法定遣散费要求。裁员补偿通常通过协商确定（市场惯例：每年服务2周至1个月）。",
    nonCompeteRulesEn: "Enforceable if reasonable in scope, duration (typically ≤12 months), and geography. Courts apply a strict reasonableness test.",
    nonCompeteRulesZh: "如果在范围、期限（通常≤12个月）和地域上合理，则可执行。法院适用严格的合理性测试。",
    workPermitRulesEn: "Foreign employees need an Employment Pass (EP, for professionals earning ≥SGD 5,600/month), S Pass, or Work Permit depending on salary and qualifications.",
    workPermitRulesZh: "外国员工需要就业准证（EP，适用于月薪≥5,600新元的专业人士）、S准证或工作准证，取决于薪资和资质。",
  },
  {
    countryCode: "VN",
    probationRulesEn: "Maximum 60 days for positions requiring college degree or above; 30 days for vocational/technical positions; 6 days for others. Salary during probation must be ≥85% of the official salary.",
    probationRulesZh: "大专及以上学历岗位最长60天；职业/技术岗位30天；其他岗位6天。试用期工资不得低于正式工资的85%。",
    noticePeriodRulesEn: "Indefinite contracts: 45 days. Fixed-term contracts: 30 days. Seasonal/specific work contracts: 3 working days.",
    noticePeriodRulesZh: "无固定期限合同：45天。固定期限合同：30天。季节性/特定工作合同：3个工作日。",
    backgroundCheckRulesEn: "Permitted but limited. Criminal record checks require candidate consent. Credit checks are uncommon and not standard practice.",
    backgroundCheckRulesZh: "允许但有限制。犯罪记录查询需要候选人同意。信用查询不常见，非标准做法。",
    severanceRulesEn: "For indefinite contracts: 0.5 month salary per year of service. Unemployment insurance fund covers part of the obligation for employees who have contributed.",
    severanceRulesZh: "无固定期限合同：每年服务0.5个月工资。失业保险基金为已缴费员工承担部分义务。",
    nonCompeteRulesEn: "Vietnamese law does not explicitly regulate non-compete clauses. Enforceability is uncertain and courts have limited precedent.",
    nonCompeteRulesZh: "越南法律未明确规定竞业限制条款。可执行性不确定，法院判例有限。",
    workPermitRulesEn: "Work permits required for all foreign workers. Valid for up to 2 years. Employer must prove the position cannot be filled locally.",
    workPermitRulesZh: "所有外国工人需要工作许可。有效期最长2年。雇主必须证明该岗位无法由本地人填补。",
  },
  {
    countryCode: "PH",
    probationRulesEn: "Maximum 6 months. Employee must be informed of performance standards at the start. Failure to regularize after 6 months means automatic regular employment.",
    probationRulesZh: "最长6个月。必须在开始时告知员工绩效标准。6个月后未转正则自动成为正式员工。",
    noticePeriodRulesEn: "30 days written notice required for resignation. For employer-initiated termination, 30 days notice + just/authorized cause required.",
    noticePeriodRulesZh: "辞职需提前30天书面通知。雇主发起的解雇需30天通知+正当/授权理由。",
    backgroundCheckRulesEn: "Generally permitted with candidate consent. NBI (National Bureau of Investigation) clearance is commonly required.",
    backgroundCheckRulesZh: "经候选人同意后一般允许。通常要求NBI（国家调查局）无犯罪证明。",
    severanceRulesEn: "Separation pay required for authorized causes: 1 month salary or 0.5 month per year of service (whichever is higher) for retrenchment/redundancy.",
    severanceRulesZh: "授权理由解雇需支付遣散费：裁员/冗余时为1个月工资或每年服务0.5个月（取较高者）。",
    nonCompeteRulesEn: "Enforceable if reasonable. Philippine courts examine the duration, geographic scope, and whether adequate consideration was provided.",
    nonCompeteRulesZh: "如合理则可执行。菲律宾法院审查期限、地域范围以及是否提供了充分对价。",
    workPermitRulesEn: "Alien Employment Permit (AEP) required from DOLE. Special Work Permit for short-term assignments. 9(g) pre-arranged employment visa for long-term.",
    workPermitRulesZh: "需从DOLE获得外国人就业许可（AEP）。短期任务需特别工作许可。长期需9(g)预安排就业签证。",
  },
  {
    countryCode: "IN",
    probationRulesEn: "Typically 3–6 months as per company policy. No universal statutory limit. Some state-specific Shops & Establishments Acts may apply.",
    probationRulesZh: "通常按公司政策为3-6个月。无统一法定上限。部分州的《商店与机构法》可能适用。",
    noticePeriodRulesEn: "As per employment contract, typically 1–3 months. Senior roles often have 3-month notice periods. Notice period buyout is common.",
    noticePeriodRulesZh: "按劳动合同约定，通常1-3个月。高级职位通常为3个月通知期。买断通知期很常见。",
    backgroundCheckRulesEn: "Widely practiced. Employment verification, education verification, criminal record checks, and address verification are standard. Must comply with IT Act and data protection norms.",
    backgroundCheckRulesZh: "广泛实施。工作经历核实、学历核实、犯罪记录查询和地址核实是标准做法。须遵守IT法和数据保护规范。",
    severanceRulesEn: "Under Industrial Disputes Act (for workmen): 15 days' average pay per year of service for retrenchment. Gratuity (15 days per year) payable after 5 years.",
    severanceRulesZh: "根据《产业纠纷法》（适用于工人）：裁员时每年服务15天平均工资。服务满5年后支付酬金（每年15天）。",
    nonCompeteRulesEn: "Non-compete clauses during employment are valid. Post-employment non-competes are generally unenforceable under Section 27 of the Indian Contract Act.",
    nonCompeteRulesZh: "在职期间的竞业限制条款有效。离职后的竞业限制根据《印度合同法》第27条通常不可执行。",
    workPermitRulesEn: "Employment Visa required. Minimum salary threshold of USD 25,000/year (exceptions for certain sectors). Registration with FRRO within 14 days of arrival.",
    workPermitRulesZh: "需要就业签证。最低年薪门槛25,000美元（特定行业有例外）。抵达后14天内须在FRRO注册。",
  },
  {
    countryCode: "US",
    probationRulesEn: "No federal law governing probation periods. At-will employment means either party can terminate at any time without cause (except for discriminatory reasons).",
    probationRulesZh: "无联邦法律规定试用期。自由雇佣原则意味着任一方可随时无理由终止（歧视性原因除外）。",
    noticePeriodRulesEn: "No statutory notice period requirement (at-will employment). Two weeks' notice is a professional courtesy, not a legal requirement.",
    noticePeriodRulesZh: "无法定通知期要求（自由雇佣）。两周通知是职业礼仪，非法律要求。",
    backgroundCheckRulesEn: "Widely practiced but heavily regulated. Must comply with FCRA (Fair Credit Reporting Act). Adverse action process required. Ban-the-box laws in many states.",
    backgroundCheckRulesZh: "广泛实施但受严格监管。须遵守FCRA（公平信用报告法）。需执行不利行动程序。许多州有禁止询问犯罪记录法。",
    severanceRulesEn: "No federal requirement for severance pay. WARN Act requires 60 days' notice for mass layoffs (100+ employees). Severance packages are negotiated.",
    severanceRulesZh: "联邦层面无遣散费要求。WARN法案要求大规模裁员（100+员工）提前60天通知。遣散方案通过协商确定。",
    nonCompeteRulesEn: "Enforceability varies by state. FTC has proposed a nationwide ban (pending). California, Minnesota, Oklahoma, and North Dakota ban most non-competes.",
    nonCompeteRulesZh: "可执行性因州而异。FTC已提议全国禁令（待定）。加州、明尼苏达州、俄克拉荷马州和北达科他州禁止大多数竞业限制。",
    workPermitRulesEn: "H-1B visa (specialty occupation, annual cap), L-1 (intra-company transfer), O-1 (extraordinary ability), E-2 (treaty investor). Sponsorship required.",
    workPermitRulesZh: "H-1B签证（专业职业，年度配额）、L-1（公司内部调动）、O-1（杰出能力）、E-2（条约投资者）。需要雇主担保。",
  },
  {
    countryCode: "GB",
    probationRulesEn: "No statutory probation period. Market standard is 3–6 months. Employees gain unfair dismissal protection after 2 years of continuous service.",
    probationRulesZh: "无法定试用期。市场标准为3-6个月。员工在连续服务2年后获得不公平解雇保护。",
    noticePeriodRulesEn: "Statutory minimum: 1 week per year of service (up to 12 weeks). Contractual notice is often longer (1–3 months for professional roles).",
    noticePeriodRulesZh: "法定最低：每年服务1周（最多12周）。合同通知期通常更长（专业岗位1-3个月）。",
    backgroundCheckRulesEn: "Permitted with consent. DBS (Disclosure and Barring Service) checks for certain roles. Right to Work checks mandatory for all employees.",
    backgroundCheckRulesZh: "经同意后允许。特定岗位需DBS（披露和禁止服务）检查。所有员工必须进行工作权利检查。",
    severanceRulesEn: "Statutory redundancy pay: 0.5–1.5 weeks' pay per year of service (depending on age), capped at £700/week (2024/25). Requires 2+ years of service.",
    severanceRulesZh: "法定裁员补偿：每年服务0.5-1.5周工资（取决于年龄），上限为每周700英镑（2024/25）。需服务满2年以上。",
    nonCompeteRulesEn: "Enforceable if reasonable. UK courts scrutinize duration (typically ≤12 months), scope, and whether it protects a legitimate business interest.",
    nonCompeteRulesZh: "如合理则可执行。英国法院审查期限（通常≤12个月）、范围以及是否保护合法商业利益。",
    workPermitRulesEn: "Skilled Worker visa (replaced Tier 2). Requires sponsorship license, minimum salary threshold (£38,700 or going rate), and English language proficiency.",
    workPermitRulesZh: "技术工人签证（取代Tier 2）。需要担保许可证、最低薪资门槛（38,700英镑或行业标准）和英语语言能力。",
  },
  {
    countryCode: "DE",
    probationRulesEn: "Maximum 6 months by law. During probation, either party can terminate with 2 weeks' notice. Probation can only be agreed once per employment relationship.",
    probationRulesZh: "法定最长6个月。试用期内，任一方可提前2周通知终止。每段雇佣关系只能约定一次试用期。",
    noticePeriodRulesEn: "Statutory minimum: 4 weeks to the 15th or end of month. Increases with tenure: up to 7 months for 20+ years of service. Longer contractual periods are common.",
    noticePeriodRulesZh: "法定最低：4周至当月15日或月末。随服务年限增加：20年以上最长7个月。合同约定更长期限很常见。",
    backgroundCheckRulesEn: "Strictly regulated by GDPR and BDSG. Only job-relevant checks permitted. Criminal record checks only for specific roles (e.g., finance, childcare). Credit checks very restricted.",
    backgroundCheckRulesZh: "受GDPR和BDSG严格监管。仅允许与工作相关的检查。犯罪记录查询仅限特定岗位（如金融、儿童看护）。信用查询非常受限。",
    severanceRulesEn: "No general statutory right to severance. However, under KSchG (Protection Against Dismissal Act), courts often award 0.5 month per year of service in unfair dismissal cases.",
    severanceRulesZh: "无一般性法定遣散权。但根据KSchG（解雇保护法），法院在不公平解雇案件中通常判决每年服务0.5个月。",
    nonCompeteRulesEn: "Enforceable but employer must pay compensation of at least 50% of the last salary during the non-compete period (Karenzentschädigung). Maximum duration: 2 years.",
    nonCompeteRulesZh: "可执行但雇主必须在竞业限制期间支付至少最后工资50%的补偿金（Karenzentschädigung）。最长期限：2年。",
    workPermitRulesEn: "EU Blue Card for highly qualified workers (minimum salary €45,300 or €41,042 for shortage occupations). National visa for other skilled workers.",
    workPermitRulesZh: "高素质人才可申请欧盟蓝卡（最低年薪45,300欧元，紧缺职业41,042欧元）。其他技术工人可申请国家签证。",
  },
  {
    countryCode: "JP",
    probationRulesEn: "Typically 3–6 months. During probation, dismissal is easier but still requires reasonable grounds after 14 days. Must notify labor standards office if dismissing within 14 days.",
    probationRulesZh: "通常3-6个月。试用期内解雇较容易，但14天后仍需合理理由。14天内解雇须通知劳动基准监督署。",
    noticePeriodRulesEn: "Minimum 30 days' advance notice or 30 days' pay in lieu. This applies to all terminations by the employer.",
    noticePeriodRulesZh: "最少提前30天通知或支付30天代通知金。适用于雇主发起的所有终止。",
    backgroundCheckRulesEn: "Limited. Criminal record checks are not standard. Employment and education verification are common. Extensive background checks may raise privacy concerns under APPI.",
    backgroundCheckRulesZh: "有限。犯罪记录查询非标准做法。工作经历和学历核实很常见。广泛的背景调查可能引发APPI下的隐私问题。",
    severanceRulesEn: "No statutory severance requirement. However, most companies have retirement allowance (taishoku-kin) systems paying 1–3 months per year of service.",
    severanceRulesZh: "无法定遣散费要求。但大多数公司有退职金（退職金）制度，支付每年服务1-3个月。",
    nonCompeteRulesEn: "Enforceable if reasonable. Courts examine necessity, scope, duration (typically ≤2 years), geographic limits, and whether compensation was provided.",
    nonCompeteRulesZh: "如合理则可执行。法院审查必要性、范围、期限（通常≤2年）、地域限制以及是否提供了补偿。",
    workPermitRulesEn: "Status of Residence required. 'Engineer/Specialist in Humanities/International Services' is the most common work visa category. Employer sponsorship required.",
    workPermitRulesZh: "需要在留资格。'技术/人文知识/国际业务'是最常见的工作签证类别。需要雇主担保。",
  },
  {
    countryCode: "BR",
    probationRulesEn: "Maximum 90 days (can be 45 days + 45-day extension). During probation, either party can terminate without notice or severance (but FGTS and 13th salary pro-rata apply).",
    probationRulesZh: "最长90天（可为45天+45天延期）。试用期内，任一方可无通知或遣散费终止（但FGTS和第13个月工资按比例适用）。",
    noticePeriodRulesEn: "Minimum 30 days + 3 days per year of service (up to 90 days total). Employer can opt for pay in lieu of notice.",
    noticePeriodRulesZh: "最少30天+每年服务3天（最多共90天）。雇主可选择支付代通知金。",
    backgroundCheckRulesEn: "Limited. Criminal record checks are restricted to specific roles (security, finance). Social media screening is controversial. Must comply with LGPD (data protection law).",
    backgroundCheckRulesZh: "有限。犯罪记录查询仅限特定岗位（安保、金融）。社交媒体筛查有争议。须遵守LGPD（数据保护法）。",
    severanceRulesEn: "Employer must pay: 40% FGTS penalty + FGTS balance withdrawal + notice period pay + pro-rata 13th salary + pro-rata vacation + 1/3 vacation bonus.",
    severanceRulesZh: "雇主须支付：40% FGTS罚金+FGTS余额提取+通知期工资+按比例第13个月工资+按比例年假+1/3年假奖金。",
    nonCompeteRulesEn: "Enforceable if: (1) compensation is provided during the restriction period, (2) duration is reasonable (typically ≤2 years), and (3) scope is clearly defined.",
    nonCompeteRulesZh: "可执行条件：(1) 限制期间提供补偿，(2) 期限合理（通常≤2年），(3) 范围明确界定。",
    workPermitRulesEn: "Work visa requires employer sponsorship. Minimum 2/3 Brazilian employees rule (for companies with 3+ employees). Process takes 2–4 months.",
    workPermitRulesZh: "工作签证需雇主担保。最低2/3巴西员工规则（适用于3人以上企业）。流程需2-4个月。",
  },
  {
    countryCode: "AE",
    probationRulesEn: "Maximum 6 months under the new UAE Labour Law (2022). Cannot be extended or renewed. 14 days' notice required for termination during probation.",
    probationRulesZh: "根据2022年新阿联酋劳动法，最长6个月。不可延长或续期。试用期内终止需14天通知。",
    noticePeriodRulesEn: "Minimum 30 days, maximum 90 days as per contract. During probation: 14 days if employee has been employed for 6+ months.",
    noticePeriodRulesZh: "按合同约定最少30天，最多90天。试用期内：如员工已工作6个月以上则为14天。",
    backgroundCheckRulesEn: "Common and generally accepted. Criminal record checks, employment verification, and education verification are standard. Medical fitness test is mandatory.",
    backgroundCheckRulesZh: "常见且普遍接受。犯罪记录查询、工作经历核实和学历核实是标准做法。体检是强制性的。",
    severanceRulesEn: "End of Service Gratuity (EOSG): 21 days' basic salary per year for first 5 years; 30 days per year thereafter. Pro-rated for partial years. Capped at 2 years' total salary.",
    severanceRulesZh: "服务终止酬金（EOSG）：前5年每年21天基本工资；此后每年30天。不满一年按比例计算。总额上限为2年工资。",
    nonCompeteRulesEn: "Enforceable under the new Labour Law. Must be limited in time (max 2 years), geography, and type of work. Must not be excessively restrictive.",
    nonCompeteRulesZh: "根据新劳动法可执行。必须在时间（最长2年）、地域和工作类型上有限制。不得过度限制。",
    workPermitRulesEn: "Employment visa and labour card required. Employer sponsors the visa. Process typically takes 2–4 weeks. Emirates ID mandatory.",
    workPermitRulesZh: "需要就业签证和劳工卡。雇主担保签证。流程通常需2-4周。阿联酋身份证为强制性。",
  },
];

// ── SALARY BENCHMARKS DATA ───────────────────────────────────────────────────

export const salaryBenchmarkData: SalaryBenchmarkSeed[] = [
  // ── Singapore (SG) ──
  { countryCode: "SG", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "4000", salaryP50: "5000", salaryP75: "6500", currency: "SGD", dataYear: 2025 },
  { countryCode: "SG", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "6500", salaryP50: "8000", salaryP75: "10000", currency: "SGD", dataYear: 2025 },
  { countryCode: "SG", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "10000", salaryP50: "13000", salaryP75: "16000", currency: "SGD", dataYear: 2025 },
  { countryCode: "SG", jobCategory: "Software Engineering", jobTitle: "Engineering Manager", seniorityLevel: "lead", salaryP25: "14000", salaryP50: "17000", salaryP75: "21000", currency: "SGD", dataYear: 2025 },
  { countryCode: "SG", jobCategory: "Product & Design", jobTitle: "Product Manager", seniorityLevel: "mid", salaryP25: "7000", salaryP50: "9000", salaryP75: "11500", currency: "SGD", dataYear: 2025 },
  { countryCode: "SG", jobCategory: "Sales & Marketing", jobTitle: "Marketing Manager", seniorityLevel: "mid", salaryP25: "5500", salaryP50: "7500", salaryP75: "9500", currency: "SGD", dataYear: 2025 },
  { countryCode: "SG", jobCategory: "Finance & Accounting", jobTitle: "Financial Analyst", seniorityLevel: "mid", salaryP25: "5000", salaryP50: "6500", salaryP75: "8500", currency: "SGD", dataYear: 2025 },
  { countryCode: "SG", jobCategory: "Human Resources", jobTitle: "HR Manager", seniorityLevel: "mid", salaryP25: "6000", salaryP50: "8000", salaryP75: "10000", currency: "SGD", dataYear: 2025 },

  // ── Vietnam (VN) ──
  { countryCode: "VN", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "12000000", salaryP50: "16000000", salaryP75: "22000000", currency: "VND", dataYear: 2025 },
  { countryCode: "VN", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "22000000", salaryP50: "30000000", salaryP75: "40000000", currency: "VND", dataYear: 2025 },
  { countryCode: "VN", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "35000000", salaryP50: "50000000", salaryP75: "70000000", currency: "VND", dataYear: 2025 },
  { countryCode: "VN", jobCategory: "Product & Design", jobTitle: "Product Manager", seniorityLevel: "mid", salaryP25: "25000000", salaryP50: "35000000", salaryP75: "50000000", currency: "VND", dataYear: 2025 },
  { countryCode: "VN", jobCategory: "Sales & Marketing", jobTitle: "Marketing Manager", seniorityLevel: "mid", salaryP25: "18000000", salaryP50: "25000000", salaryP75: "35000000", currency: "VND", dataYear: 2025 },
  { countryCode: "VN", jobCategory: "Finance & Accounting", jobTitle: "Accountant", seniorityLevel: "mid", salaryP25: "15000000", salaryP50: "20000000", salaryP75: "28000000", currency: "VND", dataYear: 2025 },

  // ── Philippines (PH) ──
  { countryCode: "PH", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "25000", salaryP50: "35000", salaryP75: "45000", currency: "PHP", dataYear: 2025 },
  { countryCode: "PH", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "45000", salaryP50: "65000", salaryP75: "85000", currency: "PHP", dataYear: 2025 },
  { countryCode: "PH", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "80000", salaryP50: "110000", salaryP75: "150000", currency: "PHP", dataYear: 2025 },
  { countryCode: "PH", jobCategory: "Customer Service", jobTitle: "Customer Service Representative", seniorityLevel: "junior", salaryP25: "15000", salaryP50: "20000", salaryP75: "25000", currency: "PHP", dataYear: 2025 },
  { countryCode: "PH", jobCategory: "Sales & Marketing", jobTitle: "Digital Marketing Specialist", seniorityLevel: "mid", salaryP25: "30000", salaryP50: "45000", salaryP75: "60000", currency: "PHP", dataYear: 2025 },

  // ── India (IN) ──
  { countryCode: "IN", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "400000", salaryP50: "600000", salaryP75: "900000", currency: "INR", dataYear: 2025 },
  { countryCode: "IN", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "900000", salaryP50: "1400000", salaryP75: "2000000", currency: "INR", dataYear: 2025 },
  { countryCode: "IN", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "1800000", salaryP50: "2800000", salaryP75: "4000000", currency: "INR", dataYear: 2025 },
  { countryCode: "IN", jobCategory: "Product & Design", jobTitle: "Product Manager", seniorityLevel: "mid", salaryP25: "1200000", salaryP50: "1800000", salaryP75: "2500000", currency: "INR", dataYear: 2025 },
  { countryCode: "IN", jobCategory: "Sales & Marketing", jobTitle: "Marketing Manager", seniorityLevel: "mid", salaryP25: "800000", salaryP50: "1200000", salaryP75: "1800000", currency: "INR", dataYear: 2025 },

  // ── United States (US) ──
  { countryCode: "US", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "6500", salaryP50: "8000", salaryP75: "10000", currency: "USD", dataYear: 2025 },
  { countryCode: "US", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "10000", salaryP50: "13000", salaryP75: "16000", currency: "USD", dataYear: 2025 },
  { countryCode: "US", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "15000", salaryP50: "19000", salaryP75: "24000", currency: "USD", dataYear: 2025 },
  { countryCode: "US", jobCategory: "Software Engineering", jobTitle: "Engineering Manager", seniorityLevel: "director", salaryP25: "20000", salaryP50: "25000", salaryP75: "32000", currency: "USD", dataYear: 2025 },
  { countryCode: "US", jobCategory: "Product & Design", jobTitle: "Product Manager", seniorityLevel: "mid", salaryP25: "10000", salaryP50: "13000", salaryP75: "16000", currency: "USD", dataYear: 2025 },
  { countryCode: "US", jobCategory: "Sales & Marketing", jobTitle: "Marketing Manager", seniorityLevel: "mid", salaryP25: "7000", salaryP50: "9000", salaryP75: "12000", currency: "USD", dataYear: 2025 },
  { countryCode: "US", jobCategory: "Finance & Accounting", jobTitle: "Financial Analyst", seniorityLevel: "mid", salaryP25: "6500", salaryP50: "8500", salaryP75: "11000", currency: "USD", dataYear: 2025 },
  { countryCode: "US", jobCategory: "Human Resources", jobTitle: "HR Business Partner", seniorityLevel: "senior", salaryP25: "9000", salaryP50: "12000", salaryP75: "15000", currency: "USD", dataYear: 2025 },

  // ── United Kingdom (GB) ──
  { countryCode: "GB", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "2800", salaryP50: "3500", salaryP75: "4200", currency: "GBP", dataYear: 2025 },
  { countryCode: "GB", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "4200", salaryP50: "5500", salaryP75: "7000", currency: "GBP", dataYear: 2025 },
  { countryCode: "GB", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "6500", salaryP50: "8500", salaryP75: "11000", currency: "GBP", dataYear: 2025 },
  { countryCode: "GB", jobCategory: "Finance & Accounting", jobTitle: "Financial Analyst", seniorityLevel: "mid", salaryP25: "3500", salaryP50: "4500", salaryP75: "6000", currency: "GBP", dataYear: 2025 },

  // ── Germany (DE) ──
  { countryCode: "DE", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "3500", salaryP50: "4200", salaryP75: "5000", currency: "EUR", dataYear: 2025 },
  { countryCode: "DE", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "5000", salaryP50: "6200", salaryP75: "7500", currency: "EUR", dataYear: 2025 },
  { countryCode: "DE", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "7000", salaryP50: "8500", salaryP75: "10500", currency: "EUR", dataYear: 2025 },
  { countryCode: "DE", jobCategory: "Product & Design", jobTitle: "Product Manager", seniorityLevel: "mid", salaryP25: "5500", salaryP50: "7000", salaryP75: "8500", currency: "EUR", dataYear: 2025 },

  // ── Japan (JP) ──
  { countryCode: "JP", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "280000", salaryP50: "350000", salaryP75: "420000", currency: "JPY", dataYear: 2025 },
  { countryCode: "JP", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "420000", salaryP50: "550000", salaryP75: "700000", currency: "JPY", dataYear: 2025 },
  { countryCode: "JP", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "650000", salaryP50: "850000", salaryP75: "1100000", currency: "JPY", dataYear: 2025 },
  { countryCode: "JP", jobCategory: "Sales & Marketing", jobTitle: "Marketing Manager", seniorityLevel: "mid", salaryP25: "400000", salaryP50: "550000", salaryP75: "700000", currency: "JPY", dataYear: 2025 },

  // ── Brazil (BR) ──
  { countryCode: "BR", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "4000", salaryP50: "6000", salaryP75: "8000", currency: "BRL", dataYear: 2025 },
  { countryCode: "BR", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "8000", salaryP50: "12000", salaryP75: "16000", currency: "BRL", dataYear: 2025 },
  { countryCode: "BR", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "14000", salaryP50: "20000", salaryP75: "28000", currency: "BRL", dataYear: 2025 },

  // ── UAE (AE) ──
  { countryCode: "AE", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "junior", salaryP25: "8000", salaryP50: "12000", salaryP75: "16000", currency: "AED", dataYear: 2025 },
  { countryCode: "AE", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "mid", salaryP25: "15000", salaryP50: "22000", salaryP75: "30000", currency: "AED", dataYear: 2025 },
  { countryCode: "AE", jobCategory: "Software Engineering", jobTitle: "Software Engineer", seniorityLevel: "senior", salaryP25: "28000", salaryP50: "38000", salaryP75: "50000", currency: "AED", dataYear: 2025 },
  { countryCode: "AE", jobCategory: "Finance & Accounting", jobTitle: "Financial Controller", seniorityLevel: "senior", salaryP25: "25000", salaryP50: "35000", salaryP75: "50000", currency: "AED", dataYear: 2025 },
];

// ── Export for use in seed runner ────────────────────────────────────────────

export default {
  benefitsData,
  complianceData,
  salaryBenchmarkData,
};
