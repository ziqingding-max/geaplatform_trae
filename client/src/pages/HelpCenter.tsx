/*
 * GEA Admin — Help Center
 * Bilingual (EN/CN) operation guides, FAQ, and glossary
 * Available to all authenticated users
 * Searchable with instant filter
 */

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/contexts/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  BookOpen,
  HelpCircle,
  BookText,
  Users,
  Building2,
  DollarSign,
  FileText,
  CalendarDays,
  ArrowUpDown,
  Globe,
  Shield,
  Briefcase,
  History,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

// ── Content Data ──

interface GuideSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: { en: string; cn: string };
  steps: { en: string; cn: string }[];
  tips?: { en: string; cn: string }[];
}

interface FAQItem {
  id: string;
  category: string;
  question: { en: string; cn: string };
  answer: { en: string; cn: string };
}

interface GlossaryItem {
  term: { en: string; cn: string };
  definition: { en: string; cn: string };
}

interface UpdateEntry {
  version: string;
  date: string;
  title: { en: string; cn: string };
  highlights: { en: string; cn: string }[];
  details: {
    category: "fix" | "feature" | "change";
    description: { en: string; cn: string };
  }[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "customer-management",
    icon: Building2,
    title: { en: "Customer Management", cn: "客户管理" },
    steps: [
      {
        en: "1. Navigate to **Customers** in the sidebar to view all customer accounts.",
        cn: "1. 在侧边栏点击**客户**，查看所有客户账户。",
      },
      {
        en: "2. Click **New Customer** to create a new customer. Fill in company name, registration number, contact email, and settlement currency.",
        cn: "2. 点击**新建客户**创建新客户。填写公司名称、注册号、联系邮箱和结算币种。",
      },
      {
        en: "3. After creation, the system auto-generates a unique Client Code (e.g., CUS-330001). Click on a customer to view their detail page.",
        cn: "3. 创建后系统自动生成唯一客户编号（如 CUS-330001）。点击客户进入详情页。",
      },
      {
        en: "4. In the detail page, manage **Contacts** (add/edit contact persons), **Pricing** (set country-specific or global discount pricing), and **Contracts** (upload signed service agreements).",
        cn: "4. 在详情页中管理**联系人**（添加/编辑联系人）、**定价**（设置国家特定价格或全局折扣）和**合同**（上传已签署的服务协议）。",
      },
      {
        en: "5. The **Employees** tab shows all employees under this customer. The **Invoices** tab shows all invoices billed to this customer.",
        cn: "5. **员工**标签页显示该客户下所有员工。**发票**标签页显示所有向该客户开具的发票。",
      },
    ],
    tips: [
      {
        en: "Pricing priority: Country-specific price > Global discount on standard rate. If both exist, country-specific takes precedence.",
        cn: "定价优先级：国家特定价格 > 标准费率的全局折扣。如果两者都存在，国家特定价格优先。",
      },
      {
        en: "Company name and registration number have duplicate checks to prevent accidental duplicates.",
        cn: "公司名称和注册号有重复检查，防止意外创建重复客户。",
      },
    ],
  },
  {
    id: "employee-management",
    icon: Users,
    title: { en: "Employee Management", cn: "员工管理" },
    steps: [
      {
        en: "1. Navigate to **Employees** to view the employee list. Use filters to search by name, status, customer, or country.",
        cn: "1. 进入**员工**页面查看员工列表。使用筛选器按姓名、状态、客户或国家搜索。",
      },
      {
        en: "2. Click **New Employee** to onboard a new employee. Select the customer, work country, and service type (EOR / Visa EOR / AOR).",
        cn: "2. 点击**新建员工**入职新员工。选择客户、工作国家和服务类型（EOR / Visa EOR / AOR）。",
      },
      {
        en: "3. The employee's salary currency is automatically set based on the work country's legal currency and cannot be changed manually.",
        cn: "3. 员工的薪资币种根据工作国家的法定货币自动设置，不可手动更改。",
      },
      {
        en: "4. Employee status flow: **Pending Review → Onboarding → Contract Signed → Active → Offboarding → Terminated**. Each transition requires manual confirmation except Contract Signed → Active (auto-triggered on start date).",
        cn: "4. 员工状态流程：**待审核 → 入职中 → 合同已签 → 在职 → 离职中 → 已终止**。除了合同已签→在职（在入职日期自动触发）外，每次转换需要手动确认。",
      },
      {
        en: "5. In the employee detail page, manage **Documents** (contracts, visa documents, general files), view **Leave Balance**, **Payroll History**, and **Adjustments**.",
        cn: "5. 在员工详情页管理**文件**（合同、签证文件、一般文件），查看**假期余额**、**工资历史**和**调整项**。",
      },
    ],
    tips: [
      {
        en: "For Visa EOR employees, the system auto-detects visa requirement based on nationality vs. work country. Upload visa documents in the Documents tab.",
        cn: "对于 Visa EOR 员工，系统根据国籍与工作国家自动检测签证需求。在文件标签页上传签证文件。",
      },
      {
        en: "When an employee's start date arrives, the system auto-transitions from Contract Signed to Active at 00:01 Beijing time daily.",
        cn: "当员工入职日期到达时，系统在每天北京时间 00:01 自动将状态从合同已签转为在职。",
      },
      {
        en: "Leave balances can be initialized from the country's statutory leave types using the 'Initialize from Country' button.",
        cn: "假期余额可以使用『从国家初始化『按钮从国家法定假期类型初始化。",
      },
    ],
  },
  {
    id: "payroll-management",
    icon: DollarSign,
    title: { en: "Payroll Management", cn: "工资单管理" },
    steps: [
      {
        en: "1. Navigate to **Payroll** to view all payroll runs. Payroll runs are organized by **country + month**.",
        cn: "1. 进入**工资单**页面查看所有工资批次。工资批次按**国家 + 月份**组织。",
      },
      {
        en: "2. **Auto-creation**: On the 5th of each month (00:01 Beijing time), the system auto-creates draft payroll runs for the next month for all countries with active employees.",
        cn: "2. **自动创建**：每月5日（北京时间 00:01），系统为所有有在职员工的国家自动创建下月的草稿工资批次。",
      },
      {
        en: "3. **Auto-fill**: Draft payroll runs are auto-filled with active employees. Mid-month starters get pro-rata salary (remaining working days / total working days).",
        cn: "3. **自动填充**：草稿工资批次自动填充在职员工。月中入职的员工按比例计算薪资（剩余工作日 / 总工作日）。",
      },
      {
        en: "4. **Cutoff**: On the 4th of each month (23:59 Beijing time), submitted adjustments and leave records for the current month are automatically locked and included in payroll.",
        cn: "4. **截止日期**：每月4日（北京时间 23:59），当月已提交的调整项和假期记录自动锁定并纳入工资单。",
      },
      {
        en: "5. Review the payroll detail, verify amounts, then submit for approval. Status flow: **Draft → Pending Approval → Approved → Processing → Completed**.",
        cn: "5. 审核工资单详情，验证金额，然后提交审批。状态流程：**草稿 → 待审批 → 已批准 → 处理中 → 已完成**。",
      },
      {
        en: "6. You can manually create payroll runs at any time using the **New Payroll Run** button.",
        cn: "6. 您可以随时使用**新建工资批次**按钮手动创建工资批次。",
      },
    ],
    tips: [
      {
        en: "Unpaid leave deductions are automatically calculated during auto-fill: daily rate × leave days, where daily rate = base salary / working days in month.",
        cn: "无薪假扣款在自动填充时自动计算：日薪 × 假期天数，其中日薪 = 基本工资 / 当月工作日数。",
      },
      {
        en: "Service fees are automatically calculated based on customer pricing configuration.",
        cn: "服务费根据客户定价配置自动计算。",
      },
      {
        en: "Cross-month leave is automatically split by natural month. Only the current month's portion is locked during payroll cutoff.",
        cn: "跨月假期按自然月自动拆分。工资截止日期时仅锁定当月部分。",
      },
    ],
  },
  {
    id: "invoice-management",
    icon: FileText,
    title: { en: "Invoice Management", cn: "发票管理" },
    steps: [
      {
        en: "1. Navigate to **Invoices** to view all invoices. Use the tabs to switch between list view and monthly overview.",
        cn: "1. 进入**发票**页面查看所有发票。使用标签页切换列表视图和月度概览。",
      },
      {
        en: "2. Create invoices from completed payroll runs using **Generate Invoice**. The system aggregates payroll data by customer and calculates service fees.",
        cn: "2. 使用**生成发票**从已完成的工资批次创建发票。系统按客户汇总工资数据并计算服务费。",
      },
      {
        en: "3. Invoice status flow: **Draft → Pending Review → Sent → Paid**. Invoices can also become **Overdue** (auto-detected daily) or be **Cancelled** (before paid).",
        cn: "3. 发票状态流程：**草稿 → 待审核 → 已发送 → 已付款**。发票也可能变为**逾期**（每日自动检测）或被**取消**（付款前）。",
      },
      {
        en: "4. **Credit Notes** can only be created for **Paid** invoices. Cumulative credit notes for one invoice cannot exceed the original invoice total. Deposit invoices only support full-amount credit notes.",
        cn: "4. **贷项通知单**只能为**已付款**的发票创建。同一张发票的贷项通知单累计金额不能超过原始发票总额。Deposit发票仅支持全额贷项通知单。",
      },
      {
        en: "5. **Apply Credit**: Credit notes can be applied to invoices in **Pending Review** status only. This must be done before sending the invoice to the customer. You can apply from either the credit note detail page or the invoice detail page (bidirectional).",
        cn: "5. **抵扣信用**：贷项通知单只能抵扣**待审核**状态的发票。必须在发票发送给客户之前完成抵扣。可以从贷项通知单详情页或发票详情页双向操作。",
      },
      {
        en: "6. **PDF Export**: Click the PDF button to download a professional invoice PDF. The PDF includes billing entity info, customer details, line items, credit applied details, and adjusted amount due.",
        cn: "6. **PDF导出**：点击PDF按钮下载专业发票PDF。PDF包含开票实体信息、客户详情、明细项、已抵扣信用明细和调整后的应付金额。",
      },
      {
        en: "7. **Finance Managers** can see real-time exchange rate comparison in the Total Due section for non-USD invoices, showing the USD equivalent and markup difference.",
        cn: "7. **财务经理**可以在非USD发票的应付总额部分看到实时汇率对比，显示USD等值金额和加价差异。",
      },
    ],
    tips: [
      {
        en: "Invoice numbers are auto-generated using the billing entity's prefix (e.g., GEAHK-202602-001).",
        cn: "发票号码使用开票实体的前缀自动生成（如 GEAHK-202602-001）。",
      },
      {
        en: "Overdue detection runs daily at 00:03 Beijing time. Sent invoices past their due date are automatically marked as Overdue.",
        cn: "逾期检测每天北京时间 00:03 运行。超过到期日的已发送发票自动标记为逾期。",
      },
      {
        en: "Cancellation is allowed for Draft, Pending Review, Sent, and Overdue invoices — but not for Paid invoices (use Credit Note instead).",
        cn: "草稿、待审核、已发送和逾期发票可以取消——但已付款发票不能取消（请使用贷项通知单）。",
      },
      {
        en: "Credit note apply amount cannot exceed the credit note's remaining balance or the invoice's remaining payable amount (whichever is smaller).",
        cn: "贷项通知单抵扣金额不能超过贷项通知单的剩余余额或发票的剩余应付金额（取较小值）。",
      },
      {
        en: "Deposit invoices are excluded from total revenue statistics. They are tracked separately as Deferred Revenue (liability) on the Dashboard.",
        cn: "Deposit发票不计入总收入统计。它们在仪表板上作为递延收入（负债）单独跟踪。",
      },
    ],
  },
  {
    id: "leave-management",
    icon: CalendarDays,
    title: { en: "Leave Management", cn: "假期管理" },
    steps: [
      {
        en: "1. Navigate to **Leave** to view all leave records. Filter by employee, status, or leave type.",
        cn: "1. 进入**假期**页面查看所有假期记录。按员工、状态或假期类型筛选。",
      },
      {
        en: "2. Click **New Leave** to create a leave request. Select the employee, leave type, start/end dates, and optionally mark as half-day.",
        cn: "2. 点击**新建假期**创建假期申请。选择员工、假期类型、开始/结束日期，可选标记为半天。",
      },
      {
        en: "3. **Cross-month leave** is automatically split by natural month. For example, a leave from Jan 28 to Feb 3 becomes two records: Jan 28-31 and Feb 1-3.",
        cn: "3. **跨月假期**按自然月自动拆分。例如，1月28日至2月3日的假期会拆分为两条记录：1月28-31日和2月1-3日。",
      },
      {
        en: "4. Leave status flow: **Submitted → Locked** (auto-locked during payroll cutoff on the 4th). Leave can be **Cancelled** before being locked.",
        cn: "4. 假期状态流程：**已提交 → 已锁定**（每月4日工资截止时自动锁定）。假期在锁定前可以**取消**。",
      },
      {
        en: "5. **Unpaid leave** is automatically deducted from payroll during auto-fill. The deduction is calculated as: daily rate × leave days.",
        cn: "5. **无薪假**在工资自动填充时自动扣除。扣除计算方式：日薪 × 假期天数。",
      },
    ],
    tips: [
      {
        en: "Leave balances are tracked per employee per leave type per year. Initialize from country defaults using the button in employee detail.",
        cn: "假期余额按员工、假期类型、年份跟踪。使用员工详情中的按钮从国家默认值初始化。",
      },
      {
        en: "Only the current month's portion of cross-month leave is locked during cutoff. Future months remain cancellable.",
        cn: "跨月假期在截止时仅锁定当月部分。未来月份仍可取消。",
      },
    ],
  },
  {
    id: "adjustment-management",
    icon: ArrowUpDown,
    title: { en: "Adjustments (Variable Compensation)", cn: "调整项（变动薪酬）" },
    steps: [
      {
        en: "1. Navigate to **Adjustments** to view all adjustment records. Filter by type (bonus, allowance, reimbursement, deduction) or status.",
        cn: "1. 进入**调整项**页面查看所有调整记录。按类型（奖金、津贴、报销、扣款）或状态筛选。",
      },
      {
        en: "2. Click **New Adjustment** to submit an adjustment. Select the employee, type, amount, effective month, and provide a description.",
        cn: "2. 点击**新建调整项**提交调整。选择员工、类型、金额、生效月份并提供说明。",
      },
      {
        en: "3. Adjustment status flow: **Submitted → Locked** (auto-locked during payroll cutoff on the 4th). Adjustments can be **Cancelled** before being locked.",
        cn: "3. 调整项状态流程：**已提交 → 已锁定**（每月4日工资截止时自动锁定）。调整项在锁定前可以**取消**。",
      },
      {
        en: "4. Locked adjustments are automatically included in the payroll run for the effective month.",
        cn: "4. 已锁定的调整项自动纳入生效月份的工资批次。",
      },
    ],
    tips: [
      {
        en: "Adjustment types: Bonus (one-time payment), Allowance (recurring benefit), Reimbursement (expense claim), Deduction (salary reduction).",
        cn: "调整类型：奖金（一次性支付）、津贴（经常性福利）、报销（费用报销）、扣款（薪资扣减）。",
      },
    ],
  },
  {
    id: "country-configuration",
    icon: Globe,
    title: { en: "Country Configuration", cn: "国家配置" },
    steps: [
      {
        en: "1. Navigate to **Countries** to view all pre-configured countries. Countries are pre-populated with legal currency, payroll cycle, and statutory leave types.",
        cn: "1. 进入**国家**页面查看所有预配置的国家。国家已预填法定货币、工资周期和法定假期类型。",
      },
      {
        en: "2. A country becomes **Active** when it has service fees configured (EOR/AOR/Visa). Countries without service fees are **Inactive**.",
        cn: "2. 当国家配置了服务费（EOR/AOR/签证）时变为**活跃**状态。未配置服务费的国家为**非活跃**。",
      },
      {
        en: "3. Click the edit button to configure service fees: EOR monthly rate, AOR monthly rate, and Visa one-time setup fee.",
        cn: "3. 点击编辑按钮配置服务费：EOR月费、AOR月费和签证一次性设置费。",
      },
      {
        en: "4. The country detail panel shows pre-populated legal information (currency, payroll cycle, probation period, notice period, working days, leave types) as read-only.",
        cn: "4. 国家详情面板显示预填的法律信息（货币、工资周期、试用期、通知期、工作日、假期类型）为只读。",
      },
    ],
    tips: [
      {
        en: "Standard rates: APAC countries default to $249 USD/month for EOR; non-APAC countries default to $449 USD/month.",
        cn: "标准费率：亚太国家EOR默认$249 USD/月；非亚太国家默认$449 USD/月。",
      },
    ],
  },
  {
    id: "billing-entities",
    icon: Briefcase,
    title: { en: "Billing Entities", cn: "开票实体" },
    steps: [
      {
        en: "1. Navigate to **Billing Entities** under Finance to manage your legal entities that issue invoices.",
        cn: "1. 在财务下进入**开票实体**管理发行发票的法律实体。",
      },
      {
        en: "2. Create a billing entity with: entity name, legal name, invoice prefix (unique, used for invoice numbering), address, tax ID, and bank details.",
        cn: "2. 创建开票实体：实体名称、法律名称、发票前缀（唯一，用于发票编号）、地址、税号和银行信息。",
      },
      {
        en: "3. Each billing entity generates invoices with its own numbering sequence (e.g., GEAHK-202602-001, GEASG-202602-001).",
        cn: "3. 每个开票实体使用自己的编号序列生成发票（如 GEAHK-202602-001、GEASG-202602-001）。",
      },
    ],
    tips: [
      {
        en: "Invoice prefix must be unique across all billing entities. The system enforces this at both database and application level.",
        cn: "发票前缀在所有开票实体中必须唯一。系统在数据库和应用层面都强制执行此规则。",
      },
    ],
  },
  {
    id: "user-roles",
    icon: Shield,
    title: { en: "User Roles & Permissions", cn: "用户角色与权限" },
    steps: [
      {
        en: "1. Navigate to **Settings → User Management** (admin only) to manage system users and their roles.",
        cn: "1. 进入**设置 → 用户管理**（仅管理员）管理系统用户及其角色。",
      },
      {
        en: "2. Available roles: **Admin** (full access), **Customer Manager** (customer & employee management), **Operations Manager** (payroll & operations), **Finance Manager** (invoices & billing), **User** (read-only).",
        cn: "2. 可用角色：**管理员**（完全访问）、**客户经理**（客户和员工管理）、**运营经理**（工资和运营）、**财务经理**（发票和计费）、**用户**（只读）。",
      },
      {
        en: "3. Admin and User are exclusive roles — they cannot be combined with manager roles. Manager roles can be combined (e.g., Customer Manager + Operations Manager).",
        cn: "3. 管理员和用户是互斥角色——不能与经理角色组合。经理角色可以组合（如客户经理 + 运营经理）。",
      },
      {
        en: "4. Dashboard tabs are role-restricted: Overview (all), Operations (admin + operations_manager), Finance (admin + finance_manager), HR & Leave (admin + operations_manager), Activity Log (admin only).",
        cn: "4. 仪表盘标签页按角色限制：概览（所有人）、运营（管理员 + 运营经理）、财务（管理员 + 财务经理）、人事与假期（管理员 + 运营经理）、活动日志（仅管理员）。",
      },
    ],
    tips: [
      {
        en: "To promote a user to admin, update the role in Settings → User Management. Only existing admins can change roles.",
        cn: "要将用户提升为管理员，在设置 → 用户管理中更新角色。只有现有管理员可以更改角色。",
      },
    ],
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    category: "payroll",
    question: {
      en: "When does the payroll cutoff happen?",
      cn: "工资截止日期是什么时候？",
    },
    answer: {
      en: "The payroll cutoff is on the **4th of each month at 23:59 Beijing time**. At this time, all submitted adjustments and leave records for the current month are automatically locked and included in the payroll run. After cutoff, locked items cannot be cancelled or modified.",
      cn: "工资截止日期为**每月4日北京时间 23:59**。此时，当月所有已提交的调整项和假期记录自动锁定并纳入工资批次。截止后，已锁定的项目不能取消或修改。",
    },
  },
  {
    id: "faq-2",
    category: "payroll",
    question: {
      en: "How is pro-rata salary calculated for mid-month starters?",
      cn: "月中入职员工的按比例薪资如何计算？",
    },
    answer: {
      en: "Pro-rata salary = Base Salary × (Remaining Working Days / Total Working Days in Month). For example, if an employee starts on the 15th of a month with 22 working days, and their base salary is $5,000, the pro-rata amount = $5,000 × (12/22) = $2,727.27.",
      cn: "按比例薪资 = 基本工资 × (剩余工作日 / 当月总工作日)。例如，如果员工在一个有22个工作日的月份的15日入职，基本工资为$5,000，按比例金额 = $5,000 × (12/22) = $2,727.27。",
    },
  },
  {
    id: "faq-3",
    category: "payroll",
    question: {
      en: "How are unpaid leave deductions calculated?",
      cn: "无薪假扣款如何计算？",
    },
    answer: {
      en: "Unpaid leave deduction = Daily Rate × Leave Days, where Daily Rate = Base Salary / Working Days in Month. Only leave records with status 'locked' and leave type marked as 'unpaid' are included in the deduction.",
      cn: "无薪假扣款 = 日薪 × 假期天数，其中日薪 = 基本工资 / 当月工作日数。只有状态为『已锁定』且假期类型标记为『无薪』的假期记录才会被纳入扣款。",
    },
  },
  {
    id: "faq-4",
    category: "leave",
    question: {
      en: "What happens with cross-month leave requests?",
      cn: "跨月假期申请会怎样处理？",
    },
    answer: {
      en: "Cross-month leave is **automatically split by natural month**. For example, a leave from Jan 28 to Feb 3 becomes two separate records: Jan 28-31 (4 days) and Feb 1-3 (3 days). Each record is independently managed — the January portion gets locked during January's payroll cutoff, while the February portion remains cancellable until February's cutoff.",
      cn: "跨月假期**按自然月自动拆分**。例如，1月28日至2月3日的假期会拆分为两条独立记录：1月28-31日（4天）和2月1-3日（3天）。每条记录独立管理——1月部分在1月工资截止时锁定，而2月部分在2月截止前仍可取消。",
    },
  },
  {
    id: "faq-5",
    category: "invoice",
    question: {
      en: "When can I create a Credit Note?",
      cn: "什么时候可以创建贷项通知单？",
    },
    answer: {
      en: "Credit Notes can **only** be created for invoices with **Paid** status. This is because a credit note is a financial correction to a completed transaction. For unpaid invoices, use the **Cancel** function instead.",
      cn: "贷项通知单**只能**为**已付款**状态的发票创建。这是因为贷项通知单是对已完成交易的财务更正。对于未付款的发票，请使用**取消**功能。",
    },
  },
  {
    id: "faq-6",
    category: "invoice",
    question: {
      en: "How does the overdue detection work?",
      cn: "逾期检测如何工作？",
    },
    answer: {
      en: "A daily cron job runs at **00:03 Beijing time** and checks all invoices with 'sent' status. If the invoice's due date is before today, it is automatically marked as 'overdue'. No manual intervention is needed.",
      cn: "每日定时任务在**北京时间 00:03** 运行，检查所有『已发送』状态的发票。如果发票的到期日在今天之前，自动标记为『逾期』。无需人工干预。",
    },
  },
  {
    id: "faq-7",
    category: "invoice",
    question: {
      en: "What is the real-time exchange rate comparison on invoices?",
      cn: "发票上的实时汇率对比是什么？",
    },
    answer: {
      en: "For non-USD invoices, **Finance Managers** can see a real-time exchange rate comparison in the Total Due section. It shows: the current live exchange rate, the USD equivalent at the live rate, and the **amount difference** compared to the invoice's recorded exchange rate. This helps finance managers quickly assess the markup or variance.",
      cn: "对于非USD发票，**财务经理**可以在应付总额部分看到实时汇率对比。它显示：当前实时汇率、按实时汇率计算的USD等值金额，以及与发票记录汇率的**金额差异**。这帮助财务经理快速评估加价或差异。",
    },
  },
  {
    id: "faq-8",
    category: "employee",
    question: {
      en: "Why can't I change an employee's salary currency?",
      cn: "为什么不能更改员工的薪资币种？",
    },
    answer: {
      en: "Employee salary currency is **automatically locked** to the work country's legal currency. This ensures payroll calculations are consistent and compliant with local regulations. If you need a different currency, the employee must be assigned to a different work country.",
      cn: "员工薪资币种**自动锁定**为工作国家的法定货币。这确保工资计算与当地法规一致。如果需要不同的币种，必须将员工分配到不同的工作国家。",
    },
  },
  {
    id: "faq-9",
    category: "employee",
    question: {
      en: "How does the automatic status transition work for new employees?",
      cn: "新员工的自动状态转换如何工作？",
    },
    answer: {
      en: "When an employee reaches 'Contract Signed' status and their start date arrives, the system automatically transitions them to 'Active' at **00:01 Beijing time daily**. If the start date is on or before the 15th, they are added to the current month's payroll (pro-rata). If after the 15th, they start in the next month's payroll.",
      cn: "当员工达到『合同已签』状态且入职日期到达时，系统在**每天北京时间 00:01** 自动将其转为『在职』。如果入职日期在15日或之前，会被加入当月工资单（按比例）。如果在15日之后，从下月工资单开始。",
    },
  },
  {
    id: "faq-10",
    category: "system",
    question: {
      en: "What are the different user roles and what can they access?",
      cn: "不同的用户角色分别可以访问什么？",
    },
    answer: {
      en: "**Admin**: Full system access including settings and user management. **Customer Manager**: Customer and employee management. **Operations Manager**: Payroll, adjustments, leave, and employee operations. **Finance Manager**: Invoices, billing entities, and exchange rates. **User**: Read-only access to all modules.",
      cn: "**管理员**：完全系统访问权限，包括设置和用户管理。**客户经理**：客户和员工管理。**运营经理**：工资、调整项、假期和员工运营。**财务经理**：发票、开票实体和汇率。**用户**：所有模块的只读访问。",
    },
  },
  {
    id: "faq-11",
    category: "system",
    question: {
      en: "How do exchange rates work in the system?",
      cn: "系统中的汇率如何运作？",
    },
    answer: {
      en: "Exchange rates are fetched daily from ExchangeRate-API and stored in the database. When generating invoices, the system uses the stored rate for the invoice date. Finance managers can also view real-time rates for comparison. Exchange rates can be manually managed in Settings → Exchange Rates.",
      cn: "汇率每天从 ExchangeRate-API 获取并存储在数据库中。生成发票时，系统使用发票日期的存储汇率。财务经理还可以查看实时汇率进行对比。汇率可以在设置 → 汇率中手动管理。",
    },
  },
  {
    id: "faq-12",
    category: "portal",
    question: {
      en: "What is the Customer Portal?",
      cn: "什么是客户门户？",
    },
    answer: {
      en: "The Customer Portal is a separate interface for your clients to self-service. Clients can view their employees, submit adjustments and leave requests, view invoices, and manage their portal users. Access it at /portal/login with the credentials provided during onboarding.",
      cn: "客户门户是为您的客户提供的独立自助界面。客户可以查看其员工、提交调整项和假期申请、查看发票和管理门户用户。通过入职时提供的凭据在 /portal/login 访问。",
    },
  },
];

const GLOSSARY_ITEMS: GlossaryItem[] = [
  { term: { en: "EOR (Employer of Record)", cn: "EOR（名义雇主）" }, definition: { en: "A service where GEA becomes the legal employer of the client's workers in a foreign country, handling payroll, benefits, tax compliance, and employment contracts.", cn: "GEA成为客户员工在外国的法定雇主的服务，处理工资、福利、税务合规和劳动合同。" } },
  { term: { en: "AOR (Agent of Record)", cn: "AOR（名义代理）" }, definition: { en: "A lighter service where GEA acts as the client's agent for specific employment tasks without becoming the legal employer.", cn: "较轻量的服务，GEA作为客户的代理处理特定雇佣任务，但不成为法定雇主。" } },
  { term: { en: "Visa EOR", cn: "签证EOR" }, definition: { en: "EOR service that includes visa sponsorship for foreign workers who need work authorization in the employment country.", cn: "包含签证担保的EOR服务，适用于需要在就业国获得工作许可的外国员工。" } },
  { term: { en: "Payroll Run", cn: "工资批次" }, definition: { en: "A monthly payroll processing cycle for a specific country. Contains payroll items for all active employees in that country.", cn: "特定国家的月度工资处理周期。包含该国所有在职员工的工资项目。" } },
  { term: { en: "Payroll Cutoff", cn: "工资截止" }, definition: { en: "The deadline (4th of each month, 23:59 Beijing time) after which adjustments and leave records are locked and cannot be modified.", cn: "截止日期（每月4日北京时间23:59），之后调整项和假期记录被锁定且不可修改。" } },
  { term: { en: "Pro-rata Salary", cn: "按比例薪资" }, definition: { en: "Partial salary calculated for employees who start or end mid-month, based on the ratio of working days.", cn: "为月中入职或离职的员工按工作日比例计算的部分薪资。" } },
  { term: { en: "Billing Entity", cn: "开票实体" }, definition: { en: "A legal entity within GEA that issues invoices. Each entity has its own invoice prefix, address, and bank details.", cn: "GEA内发行发票的法律实体。每个实体有自己的发票前缀、地址和银行信息。" } },
  { term: { en: "Credit Note", cn: "贷项通知单" }, definition: { en: "A negative invoice issued to correct or refund a previously paid invoice. Status flow: Draft → Pending Review → Sent (can be applied) → Applied (balance exhausted). Only 'Sent' status credit notes can be applied to invoices. Apply is only allowed on 'Pending Review' invoices before sending to customer.", cn: "为更正或退还之前已付款发票而开具的负数发票。状态流程：草稿 → 待审核 → 已发送（可抵扣）→ 已抵扣（余额用完）。只有【已发送】状态的贷项通知单可以抵扣发票。抵扣只允许在发票【待审核】状态下进行，即发送给客户之前。" } },
  { term: { en: "Deposit", cn: "保证金" }, definition: { en: "A refundable security deposit collected when an employee begins onboarding. Calculated as (base salary + employer cost) × deposit multiplier. Deposit is a liability (not revenue) and is tracked separately as Deferred Revenue. When an employee is terminated, the deposit can be either refunded or converted to a credit note (mutually exclusive).", cn: "员工开始入职时收取的可退还保证金。计算方式：（基本工资 + 雇主成本）× 保证金倍数。保证金是负债（非收入），作为递延收入单独跟踪。员工终止时，保证金可以退款或转为贷项通知单（两者互斥）。" } },
  { term: { en: "Deposit Refund", cn: "保证金退款" }, definition: { en: "A negative invoice generated when a terminated employee's deposit is returned to the customer. Mutually exclusive with converting the deposit to a credit note.", cn: "终止员工的保证金退还给客户时生成的负数发票。与将保证金转为贷项通知单互斥。" } },
  { term: { en: "Amount Due", cn: "应付金额" }, definition: { en: "The final amount the customer needs to pay, calculated as Invoice Total minus Credit Applied. Displayed on both the invoice detail page and PDF.", cn: "客户需要支付的最终金额，计算方式为发票总额减去已抵扣信用。在发票详情页和PDF上均显示。" } },
  { term: { en: "Settlement Currency", cn: "结算币种" }, definition: { en: "The currency in which a customer is billed. Invoices are generated in this currency, with exchange rate conversion if needed.", cn: "客户被收费的币种。发票以此币种生成，如需要则进行汇率转换。" } },
  { term: { en: "Service Fee", cn: "服务费" }, definition: { en: "The monthly fee charged per employee for EOR/AOR services. Configured per country and can be customized per customer.", cn: "每位员工每月收取的EOR/AOR服务费。按国家配置，可按客户定制。" } },
  { term: { en: "Statutory Annual Leave", cn: "法定年假" }, definition: { en: "The minimum number of paid leave days mandated by a country's labor law.", cn: "国家劳动法规定的最低带薪假期天数。" } },
  { term: { en: "Unpaid Leave", cn: "无薪假" }, definition: { en: "Leave taken without pay. The deduction is automatically calculated and applied during payroll processing.", cn: "不带薪的假期。扣款在工资处理时自动计算并应用。" } },
];

const UPDATE_ENTRIES: UpdateEntry[] = [
  {
    version: "v2.5.0",
    date: "2026-02-27",
    title: {
      en: "Approval Workflow, Reimbursement Module & Portal UX Improvements",
      cn: "审批工作流、报销模块与客户门户体验优化",
    },
    highlights: [
      {
        en: "**Reimbursement** is now a standalone module, separated from Adjustments",
        cn: "**报销**现在是独立模块，从调整项中分离",
      },
      {
        en: "Two-level approval workflow: Client approve/reject → Admin confirm for Leave, Adjustments, and Reimbursements",
        cn: "两级审批工作流：客户审批/驳回 → 管理员确认，适用于假期、调整项和报销",
      },
      {
        en: "Invoice line items now display **local currency** amounts; settlement currency only on Subtotal/Total Due",
        cn: "发票明细项现在显示**本地币种**金额；结算币种仅在小计/应付总额显示",
      },
      {
        en: "Admin can now **reset client portal passwords** directly",
        cn: "管理员现在可以直接**重置客户门户密码**",
      },
    ],
    details: [
      {
        category: "feature",
        description: {
          en: "New standalone **Reimbursements** module with full CRUD, category classification, receipt upload, and approval workflow.",
          cn: "新增独立的**报销**模块，支持完整的增删改查、分类、收据上传和审批工作流。",
        },
      },
      {
        category: "feature",
        description: {
          en: "Two-level approval flow for Leave, Adjustments, and Reimbursements: submitted → client_approved/client_rejected → admin_approved/admin_rejected → locked.",
          cn: "假期、调整项和报销的两级审批流程：已提交 → 客户已批准/客户已驳回 → 管理员已批准/管理员已驳回 → 已锁定。",
        },
      },
      {
        category: "feature",
        description: {
          en: "Admin can reset client portal user passwords from the Customer detail page → Contacts section.",
          cn: "管理员可以从客户详情页 → 联系人部分重置客户门户用户密码。",
        },
      },
      {
        category: "feature",
        description: {
          en: "Admin Employees page now shows **Onboarding Invites** section with invitation status, email, and delete capability.",
          cn: "管理员员工页面现在显示**入职邀请**区块，包含邀请状态、邮箱和删除功能。",
        },
      },
      {
        category: "change",
        description: {
          en: "Invoice line item Amount column now shows **local currency** amount. Settlement currency amount only appears in Subtotal and Total Due.",
          cn: "发票明细项的金额列现在显示**本地币种**金额。结算币种金额仅在小计和应付总额中显示。",
        },
      },
      {
        category: "change",
        description: {
          en: "All invoice items now display their currency code (Curr column). Auto-created items that previously showed no currency are fixed.",
          cn: "所有发票明细项现在都显示币种代码（Curr列）。之前不显示币种的自动创建项已修复。",
        },
      },
      {
        category: "change",
        description: {
          en: "PDF invoice credit note display simplified: now shows 'Less: Credit Note Applied' with amount only, without listing individual credit note numbers.",
          cn: "PDF发票贷项通知单显示简化：现在仅显示『减：已抵扣贷项通知单』和金额，不再列出具体编号。",
        },
      },
      {
        category: "change",
        description: {
          en: "Adjustments no longer require mandatory receipt/attachment upload (now optional). Reimbursements retain the receipt requirement.",
          cn: "调整项不再强制要求上传收据/附件（现为可选）。报销仍保留收据要求。",
        },
      },
      {
        category: "change",
        description: {
          en: "Portal Primary Contact fields are now **read-only**. Clients must contact their GEA account manager to modify primary contact information.",
          cn: "门户主要联系人字段现在为**只读**。客户需联系GEA客户经理修改主要联系人信息。",
        },
      },
      {
        category: "change",
        description: {
          en: "Admin employee detail now shows additional fields: Gender, ID Type, ID Number, Address, State, Postal Code — matching portal-submitted data.",
          cn: "管理员员工详情现在显示更多字段：性别、证件类型、证件号码、地址、州/省、邮编——与门户提交的数据一致。",
        },
      },
      {
        category: "change",
        description: {
          en: "Payslip redesigned: Reimbursements separated from Earnings. Gross Pay no longer includes reimbursements. New **Total Payout** = Net Pay + Reimbursements.",
          cn: "工资条重新设计：报销从收入中分离。Gross Pay不再包含报销。新增**实发总额** = 净工资 + 报销。",
        },
      },
    ],
  },
  {
    version: "v2.4.0",
    date: "2026-02-26",
    title: {
      en: "Financial Accounting Compliance & Credit Note Workflow",
      cn: "财务记账合规与贷项通知单流程优化",
    },
    highlights: [
      {
        en: "Credit notes can now only be applied to **Pending Review** invoices (before sending to customer)",
        cn: "贷项通知单现在只能抵扣**待审核**状态的发票（发送给客户之前）",
      },
      {
        en: "Deposit refund and credit note conversion are now **mutually exclusive** per deposit",
        cn: "保证金退款和转贷项通知单现在每笔保证金**互斥**",
      },
      {
        en: "Invoice PDF now shows **credit applied details** and adjusted **Amount Due**",
        cn: "发票PDF现在显示**已抵扣信用明细**和调整后的**应付金额**",
      },
    ],
    details: [
      {
        category: "fix",
        description: {
          en: "Fixed invoice subtotal/total calculation: local currency amounts are now correctly converted to settlement currency (USD) using exchange rates with markup.",
          cn: "修复发票小计/总计计算：本币金额现在正确通过含加价的汇率转换为结算货币（USD）。",
        },
      },
      {
        category: "fix",
        description: {
          en: "Fixed At Live Rate (USD) calculation to use correct real-time exchange rate conversion.",
          cn: "修复实时汇率（USD）计算，使用正确的实时汇率转换。",
        },
      },
      {
        category: "change",
        description: {
          en: "Credit note apply restricted to **Pending Review** invoices only. Credit must be applied before the invoice is sent to the customer, so the customer receives the final adjusted amount.",
          cn: "贷项通知单抵扣限制为仅限**待审核**发票。必须在发票发送给客户之前完成抵扣，以便客户收到的是最终调整后的金额。",
        },
      },
      {
        category: "change",
        description: {
          en: "Only **Sent** status credit notes can be applied. Credit note status flow: Draft \u2192 Pending Review \u2192 Sent (can apply) \u2192 Applied (balance exhausted).",
          cn: "只有**已发送**状态的贷项通知单可以抵扣。贷项通知单状态流程：草稿 \u2192 待审核 \u2192 已发送（可抵扣）\u2192 已抵扣（余额用完）。",
        },
      },
      {
        category: "feature",
        description: {
          en: "Added **Apply Credit** button on invoice detail page (Pending Review status). Now you can apply credit from both the credit note side and the invoice side (bidirectional).",
          cn: "在发票详情页新增**抵扣信用**按钮（待审核状态）。现在可以从贷项通知单端和发票端双向操作抵扣。",
        },
      },
      {
        category: "feature",
        description: {
          en: "Invoice detail page now shows **Credit Applications Received** section with credit note number, amount, and date.",
          cn: "发票详情页现在显示**已收到的信用抵扣**部分，包含贷项通知单编号、金额和日期。",
        },
      },
      {
        category: "feature",
        description: {
          en: "Invoice PDF now includes **Less: Credit Applied** section between subtotal and total, showing each credit note applied and the final **AMOUNT DUE**.",
          cn: "发票PDF现在在小计和总计之间包含**减：已抵扣信用**部分，显示每笔抵扣的贷项通知单和最终**应付金额**。",
        },
      },
      {
        category: "change",
        description: {
          en: "Apply amount is now capped at the **lesser** of: credit note remaining balance, or invoice remaining payable amount. Prevents over-application.",
          cn: "抵扣金额现在上限为贷项通知单剩余余额和发票剩余应付金额中的**较小值**。防止过度抵扣。",
        },
      },
      {
        category: "change",
        description: {
          en: "Auto-status updates: invoice auto-marks as **Paid** when fully covered by credit; credit note auto-marks as **Applied** when balance is exhausted.",
          cn: "自动状态更新：发票被信用全额覆盖时自动标记为**已付款**；贷项通知单余额用完时自动标记为**已抵扣**。",
        },
      },
      {
        category: "change",
        description: {
          en: "Deposit processing: refund and credit note conversion are now **mutually exclusive**. One deposit can only be processed once (either refund or credit note, not both).",
          cn: "保证金处理：退款和转贷项通知单现在**互斥**。一笔保证金只能处理一次（退款或转贷项通知单，不能两者都做）。",
        },
      },
      {
        category: "change",
        description: {
          en: "Deposit invoices only support **full-amount** credit notes (no partial). Cumulative credit notes for regular invoices cannot exceed the original invoice total.",
          cn: "Deposit发票仅支持**全额**贷项通知单（不支持部分）。普通发票的贷项通知单累计金额不能超过原始发票总额。",
        },
      },
      {
        category: "change",
        description: {
          en: "Cannot create credit notes for credit_note or deposit_refund invoice types.",
          cn: "不能对贷项通知单或保证金退款类型的发票创建贷项通知单。",
        },
      },
      {
        category: "change",
        description: {
          en: "Deposit lifecycle: when deposit is refunded or converted to credit note, the system correctly detects this on employee reactivation and allows creating a new deposit.",
          cn: "保证金生命周期：当保证金被退款或转为贷项通知单后，系统在员工重新激活时正确检测并允许创建新的保证金。",
        },
      },
      {
        category: "change",
        description: {
          en: "Deposit invoices excluded from total revenue. Dashboard now shows **Deferred Revenue (Deposits)** as a separate KPI.",
          cn: "Deposit发票从总收入中剥离。仪表板现在将**递延收入（保证金）**作为单独的KPI显示。",
        },
      },
      {
        category: "change",
        description: {
          en: "Mark as Paid now uses adjusted **Amount Due** (invoice total minus credit applied) for payment comparison.",
          cn: "标记为已付款现在使用调整后的**应付金额**（发票总额减去已抵扣信用）进行付款比对。",
        },
      },
      {
        category: "change",
        description: {
          en: "Merged **Void** status into **Cancelled**. Void is no longer a separate status option in the UI.",
          cn: "将**作废**状态合并为**已取消**。作废不再是UI中的单独状态选项。",
        },
      },
    ],
  },
];

// ── Helper: Render markdown-like bold text ──
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Main Component ──
export default function HelpCenter() {
  const { t, lang: currentLang } = useI18n();
  const lang = currentLang === "zh" ? "cn" : "en";
  const [search, setSearch] = useState("");

  const filteredGuides = useMemo(() => {
    if (!search.trim()) return GUIDE_SECTIONS;
    const q = search.toLowerCase();
    return GUIDE_SECTIONS.filter(
      (g) =>
        g.title[lang].toLowerCase().includes(q) ||
        g.steps.some((s) => s[lang].toLowerCase().includes(q)) ||
        g.tips?.some((t) => t[lang].toLowerCase().includes(q))
    );
  }, [search, lang]);

  const filteredFAQ = useMemo(() => {
    if (!search.trim()) return FAQ_ITEMS;
    const q = search.toLowerCase();
    return FAQ_ITEMS.filter(
      (f) =>
        f.question[lang].toLowerCase().includes(q) ||
        f.answer[lang].toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [search, lang]);

  const filteredGlossary = useMemo(() => {
    if (!search.trim()) return GLOSSARY_ITEMS;
    const q = search.toLowerCase();
    return GLOSSARY_ITEMS.filter(
      (g) =>
        g.term[lang].toLowerCase().includes(q) ||
        g.definition[lang].toLowerCase().includes(q)
    );
  }, [search, lang]);

  const categoryLabels: Record<string, { en: string; cn: string }> = {
    payroll: { en: "Payroll", cn: "工资" },
    leave: { en: "Leave", cn: "假期" },
    invoice: { en: "Invoice", cn: "发票" },
    employee: { en: "Employee", cn: "员工" },
    system: { en: "System", cn: "系统" },
    portal: { en: "Portal", cn: "门户" },
  };

  return (
    <Layout breadcrumb={["GEA", lang === "cn" ? "帮助中心" : "Help Center"]}>
      <div className="p-6 space-y-6 page-enter">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {lang === "cn" ? "帮助中心" : "Help Center"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "cn"
              ? "操作指引、常见问题和术语表"
              : "Operation guides, frequently asked questions, and glossary"}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={lang === "cn" ? "搜索帮助内容..." : "Search help content..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="guides">
          <TabsList>
            <TabsTrigger value="guides" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {lang === "cn" ? "操作指引" : "Guides"}
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{filteredGuides.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{filteredFAQ.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="glossary" className="gap-1.5">
              <BookText className="w-3.5 h-3.5" />
              {lang === "cn" ? "术语表" : "Glossary"}
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{filteredGlossary.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="updates" className="gap-1.5">
              <History className="w-3.5 h-3.5" />
              {lang === "cn" ? "更新日志" : "Updates"}
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{UPDATE_ENTRIES.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides" className="mt-6">
            {filteredGuides.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mb-3 opacity-40" />
                  <p>{lang === "cn" ? "未找到匹配的指引" : "No matching guides found"}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredGuides.map((guide) => (
                  <Card key={guide.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <guide.icon className="w-5 h-5 text-primary" />
                        {guide.title[lang]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {guide.steps.map((step, i) => (
                          <p key={i} className="text-sm text-muted-foreground leading-relaxed pl-1">
                            <RichText text={step[lang]} />
                          </p>
                        ))}
                      </div>
                      {guide.tips && guide.tips.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
                            {lang === "cn" ? "提示" : "Tips"}
                          </p>
                          <div className="space-y-1.5">
                            {guide.tips.map((tip, i) => (
                              <p key={i} className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                <RichText text={tip[lang]} />
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-6">
            {filteredFAQ.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <HelpCircle className="w-10 h-10 mb-3 opacity-40" />
                  <p>{lang === "cn" ? "未找到匹配的问题" : "No matching questions found"}</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <Accordion type="multiple" className="w-full">
                    {filteredFAQ.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-sm text-left hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-normal shrink-0">
                              {categoryLabels[faq.category]?.[lang] || faq.category}
                            </Badge>
                            <span>{faq.question[lang]}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground leading-relaxed pl-1">
                            <RichText text={faq.answer[lang]} />
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Glossary Tab */}
          <TabsContent value="glossary" className="mt-6">
            {filteredGlossary.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BookText className="w-10 h-10 mb-3 opacity-40" />
                  <p>{lang === "cn" ? "未找到匹配的术语" : "No matching terms found"}</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <div className="divide-y">
                    {filteredGlossary.map((item, i) => (
                      <div key={i} className="py-3 first:pt-0 last:pb-0">
                        <p className="text-sm font-semibold text-foreground">{item.term[lang]}</p>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.definition[lang]}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="mt-6">
            <div className="space-y-6">
              {UPDATE_ENTRIES.map((entry) => (
                <Card key={entry.version}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <History className="w-5 h-5 text-primary" />
                        {entry.title[lang]}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">{entry.version}</Badge>
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Highlights */}
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        {t("help.updates.keyChanges")}
                      </p>
                      <ul className="space-y-1">
                        {entry.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed flex items-start gap-1.5">
                            <span className="mt-1 shrink-0">&bull;</span>
                            <RichText text={h[lang]} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Detail items */}
                    <div className="space-y-2">
                      {entry.details.map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          {d.category === "fix" && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0 mt-0.5">
                              {t("help.updates.tag.fix")}
                            </Badge>
                          )}
                          {d.category === "feature" && (
                            <Badge className="text-[10px] px-1.5 py-0 shrink-0 mt-0.5 bg-emerald-600">
                              {t("help.updates.tag.new")}
                            </Badge>
                          )}
                          {d.category === "change" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 mt-0.5">
                              {t("help.updates.tag.change")}
                            </Badge>
                          )}
                          <span className="text-muted-foreground leading-relaxed">
                            <RichText text={d.description[lang]} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
