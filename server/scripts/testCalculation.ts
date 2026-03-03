import { calculationService } from "../services/calculationService";
import { getDb } from "../services/db/connection";

async function runTests() {
  const db = getDb();
  if (!db) {
    console.error("Failed to connect to DB");
    return;
  }

  console.log("=== Testing Social Insurance Calculation ===");

  // 1. China (Shanghai) - Salary 10,000 CNY (Below Cap)
  console.log("\n--- CN-SH: Salary 10,000 ---");
  const resultCN1 = await calculationService.calculateSocialInsurance({
    countryCode: "CN",
    year: 2025,
    salary: 10000,
    regionCode: "CN-SH"
  });
  console.log(`Employer: ${resultCN1.totalEmployer}, Employee: ${resultCN1.totalEmployee}, Total Cost: ${resultCN1.totalCost}`);
  resultCN1.items.forEach(item => {
    console.log(`  - ${item.itemKey}: ER ${item.employerContribution} (${item.employerRate}), EE ${item.employeeContribution} (${item.employeeRate})`);
  });

  // 2. China (Shanghai) - Salary 50,000 CNY (Above Cap 36,921)
  console.log("\n--- CN-SH: Salary 50,000 (Cap Test) ---");
  const resultCN2 = await calculationService.calculateSocialInsurance({
    countryCode: "CN",
    year: 2025,
    salary: 50000,
    regionCode: "CN-SH"
  });
  console.log(`Employer: ${resultCN2.totalEmployer}, Employee: ${resultCN2.totalEmployee}, Total Cost: ${resultCN2.totalCost}`);
  resultCN2.items.forEach(item => {
    console.log(`  - ${item.itemKey}: ER ${item.employerContribution} ${item.capNote ? `[${item.capNote}]` : ""}`);
  });

  // 3. Singapore - Salary 5,000 SGD (Below Cap)
  console.log("\n--- SG: Salary 5,000 ---");
  const resultSG1 = await calculationService.calculateSocialInsurance({
    countryCode: "SG",
    year: 2025,
    salary: 5000,
    age: 30
  });
  console.log(`Employer: ${resultSG1.totalEmployer}, Employee: ${resultSG1.totalEmployee}, Total Cost: ${resultSG1.totalCost}`);
  
  // 4. Singapore - Salary 10,000 SGD (Above Cap 6,800)
  console.log("\n--- SG: Salary 10,000 (Cap Test) ---");
  const resultSG2 = await calculationService.calculateSocialInsurance({
    countryCode: "SG",
    year: 2025,
    salary: 10000,
    age: 30
  });
  console.log(`Employer: ${resultSG2.totalEmployer}, Employee: ${resultSG2.totalEmployee}, Total Cost: ${resultSG2.totalCost}`);
  resultSG2.items.forEach(item => {
    console.log(`  - ${item.itemKey}: ER ${item.employerContribution} ${item.capNote ? `[${item.capNote}]` : ""}`);
  });

  // 5. UK - Salary 3,000 GBP
  console.log("\n--- GB: Salary 3,000 ---");
  const resultGB = await calculationService.calculateSocialInsurance({
    countryCode: "GB",
    year: 2025,
    salary: 3000
  });
  console.log(`Employer: ${resultGB.totalEmployer}, Employee: ${resultGB.totalEmployee}, Total Cost: ${resultGB.totalCost}`);

  // 6. USA - Salary 5,000 USD
  console.log("\n--- US: Salary 5,000 ---");
  const resultUS = await calculationService.calculateSocialInsurance({
    countryCode: "US",
    year: 2025,
    salary: 5000
  });
  console.log(`Employer: ${resultUS.totalEmployer}, Employee: ${resultUS.totalEmployee}, Total Cost: ${resultUS.totalCost}`);
}

runTests().catch(console.error);
