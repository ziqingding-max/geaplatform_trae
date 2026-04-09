# Schema Audit Notes

## countriesConfig (line 56)
- countryCode (varchar 3), countryName (varchar 100)
- probationPeriodDays, noticePeriodDays, workingDaysPerWeek, statutoryAnnualLeave
- isActive (boolean)

## publicHolidays (line 141)
- countryCode, year, holidayDate (text), holidayName, localName
- isGlobal (boolean), source

## salaryBenchmarks (line 1716)
- countryCode, jobCategory (varchar 100), jobTitle (varchar 200)
- seniorityLevel (enum: junior/mid/senior/lead/director)
- salaryP25, salaryP50, salaryP75 (all text, NOT numeric)
- currency, dataYear, source
- NO createdAt field, only updatedAt
- NO isActive field

## globalBenefits (line 1987)
- countryCode, benefitType (enum: statutory/customary)
- category (enum: 13 values - social_security, health_insurance, pension, paid_leave, parental, housing, meal_transport, bonus, insurance, equity, wellness, education, other)
- nameEn, nameZh, descriptionEn, descriptionZh
- costIndication, pitchCardEn, pitchCardZh
- source, lastVerifiedAt, isActive, sortOrder

## hiringCompliance (line 2038)
- countryCode (UNIQUE) - one record per country
- probationRulesEn/Zh, noticePeriodRulesEn/Zh
- backgroundCheckRulesEn/Zh, severanceRulesEn/Zh
- nonCompeteRulesEn/Zh, workPermitRulesEn/Zh
- additionalNotesEn/Zh
- source, lastVerifiedAt
- NO isActive field

## documentTemplates (line 2081)
- countryCode, documentType (enum: employment_contract, offer_letter, nda, termination_letter, employee_handbook, other)
- titleEn, titleZh, descriptionEn, descriptionZh
- fileUrl, fileName, fileSize, mimeType
- version, source, lastVerifiedAt, isActive
