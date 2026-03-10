#!/usr/bin/env python3
"""
Parallel Country Guide generator - processes multiple countries concurrently.
"""
import json
import os
import sys
import time
import concurrent.futures
from openai import OpenAI

client = OpenAI()

COUNTRIES = [
    ("CN", "China", "CNY"), ("HK", "Hong Kong", "HKD"), ("SG", "Singapore", "SGD"),
    ("VN", "Vietnam", "VND"), ("JP", "Japan", "JPY"), ("KR", "South Korea", "KRW"),
    ("AU", "Australia", "AUD"), ("IN", "India", "INR"), ("TH", "Thailand", "THB"),
    ("MY", "Malaysia", "MYR"), ("ID", "Indonesia", "IDR"), ("PH", "Philippines", "PHP"),
    ("TW", "Taiwan", "TWD"), ("NZ", "New Zealand", "NZD"), ("PK", "Pakistan", "PKR"),
    ("BD", "Bangladesh", "BDT"), ("LK", "Sri Lanka", "LKR"), ("KH", "Cambodia", "KHR"),
    ("US", "United States", "USD"), ("CA", "Canada", "CAD"), ("MX", "Mexico", "MXN"),
    ("BR", "Brazil", "BRL"), ("AR", "Argentina", "ARS"), ("CO", "Colombia", "COP"),
    ("CL", "Chile", "CLP"), ("PE", "Peru", "PEN"), ("CR", "Costa Rica", "CRC"),
    ("GB", "United Kingdom", "GBP"), ("DE", "Germany", "EUR"), ("FR", "France", "EUR"),
    ("IT", "Italy", "EUR"), ("ES", "Spain", "EUR"), ("NL", "Netherlands", "EUR"),
    ("SE", "Sweden", "SEK"), ("CH", "Switzerland", "CHF"), ("IE", "Ireland", "EUR"),
    ("PL", "Poland", "PLN"), ("BE", "Belgium", "EUR"), ("AT", "Austria", "EUR"),
    ("PT", "Portugal", "EUR"), ("NO", "Norway", "NOK"), ("DK", "Denmark", "DKK"),
    ("FI", "Finland", "EUR"), ("CZ", "Czech Republic", "CZK"), ("RO", "Romania", "RON"),
    ("HU", "Hungary", "HUF"), ("GR", "Greece", "EUR"),
    ("AE", "United Arab Emirates", "AED"), ("SA", "Saudi Arabia", "SAR"),
    ("IL", "Israel", "ILS"), ("TR", "Turkey", "TRY"), ("EG", "Egypt", "EGP"),
    ("NG", "Nigeria", "NGN"), ("KE", "Kenya", "KES"), ("ZA", "South Africa", "ZAR"),
    ("GH", "Ghana", "GHS"),
]

SECTIONS = [
    {
        "part": 1, "chapterKey": "overview", "sortOrder": 1,
        "titleEn": "Country Overview", "titleZh": "国家概览",
        "prompt": """Write a comprehensive country overview for {country_name} covering:
- Official name, capital, population, language(s), time zone(s)
- Political system and government structure
- Economic overview (GDP, major industries, economic growth)
- Business culture and etiquette
- Currency and banking system
- Key facts for international employers

Format as professional Markdown with headers (##), bullet points, and tables where appropriate.
Length: 800-1200 words. Be specific with current data and statistics."""
    },
    {
        "part": 2, "chapterKey": "hiring", "sortOrder": 2,
        "titleEn": "Hiring & Employment", "titleZh": "招聘与雇佣",
        "prompt": """Write a comprehensive hiring and employment guide for {country_name} covering:
- Employment contract requirements (written vs oral, mandatory clauses)
- Types of employment contracts (fixed-term, indefinite, part-time)
- Probation period regulations (duration, terms, restrictions)
- Work permits and visa requirements for foreign workers
- Background check regulations and limitations
- Onboarding requirements and mandatory registrations
- EOR (Employer of Record) considerations
- Anti-discrimination laws in hiring

Format as professional Markdown with headers (##), bullet points, and tables where appropriate.
Length: 800-1200 words. Include specific legal references where possible."""
    },
    {
        "part": 3, "chapterKey": "compensation", "sortOrder": 3,
        "titleEn": "Compensation & Taxes", "titleZh": "薪酬与税务",
        "prompt": """Write a comprehensive compensation and tax guide for {country_name} covering:
- Minimum wage (current rates, regional variations if any)
- Typical salary structure and components
- Mandatory bonuses (13th month, annual bonus requirements)
- Payroll cycle and payment methods
- Income tax brackets and rates (employee)
- Employer tax obligations and rates
- Social security/insurance contributions (employer and employee portions)
- Tax filing deadlines and requirements
- Common allowances and benefits taxation

Format as professional Markdown with headers (##), tables for tax rates, and bullet points.
Length: 800-1200 words. Include specific current rates and percentages."""
    },
    {
        "part": 4, "chapterKey": "working-conditions", "sortOrder": 4,
        "titleEn": "Working Conditions & Leave", "titleZh": "工作条件与假期",
        "prompt": """Write a comprehensive working conditions and leave guide for {country_name} covering:
- Standard working hours (daily/weekly limits)
- Overtime regulations and compensation rates
- Rest periods and break requirements
- Annual leave/vacation entitlement (statutory minimum, accrual)
- Public holidays (list all with dates)
- Sick leave entitlement and pay
- Maternity leave (duration, pay, job protection)
- Paternity leave
- Parental leave
- Other statutory leave types (bereavement, marriage, study, etc.)
- Remote work regulations (if any)

Format as professional Markdown with headers (##), tables for leave types, and bullet points.
Length: 800-1200 words. Include specific durations and rates."""
    },
    {
        "part": 5, "chapterKey": "termination", "sortOrder": 5,
        "titleEn": "Termination & Compliance", "titleZh": "终止与合规",
        "prompt": """Write a comprehensive termination and compliance guide for {country_name} covering:
- Grounds for termination (with cause, without cause, mutual agreement)
- Notice period requirements (by tenure/position)
- Severance pay calculations and requirements
- Unfair dismissal protections
- Redundancy/layoff procedures
- Non-compete and non-solicitation clauses
- Data protection and privacy laws (GDPR equivalent)
- Employee data handling requirements
- Workplace safety regulations
- Trade union and collective bargaining rights
- Dispute resolution mechanisms

Format as professional Markdown with headers (##), tables for notice periods, and bullet points.
Length: 800-1200 words. Include specific legal requirements and calculations."""
    },
]

OUTPUT_FILE = "/home/ubuntu/country_guide_data.json"

def load_existing():
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r") as f:
            return json.load(f)
    return []

def save_data(data):
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_completed_countries(data):
    from collections import Counter
    counts = Counter(c["countryCode"] for c in data)
    return {code for code, count in counts.items() if count >= 5}

def generate_chapter(country_code, country_name, currency, section):
    prompt = section["prompt"].format(country_name=country_name, currency=currency)
    
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": f"""You are a global employment compliance expert. Generate comprehensive, accurate country guide content for {country_name}.
Return a JSON object with exactly two fields:
- "contentEn": The full content in English (Markdown format)
- "contentZh": The full content in Simplified Chinese (Markdown format)

Both versions should have the same structure and information. Be specific, accurate, and professional.
The content should be suitable for HR professionals and business leaders planning to hire in {country_name}."""},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=4000,
                temperature=0.3,
            )
            
            raw = response.choices[0].message.content
            parsed = json.loads(raw)
            
            return {
                "countryCode": country_code,
                "part": section["part"],
                "chapterKey": section["chapterKey"],
                "titleEn": section["titleEn"],
                "titleZh": section["titleZh"],
                "contentEn": parsed.get("contentEn", ""),
                "contentZh": parsed.get("contentZh", ""),
                "sortOrder": section["sortOrder"],
                "version": "2026-Q1",
                "status": "published",
            }
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {country_code}/{section['chapterKey']}: {e}", flush=True)
            time.sleep(2 * (attempt + 1))
    
    return None

def generate_country(country_tuple):
    code, name, currency = country_tuple
    results = []
    for section in SECTIONS:
        result = generate_chapter(code, name, currency, section)
        if result:
            results.append(result)
            print(f"  Generated {code}/{section['chapterKey']}", flush=True)
        time.sleep(0.5)  # Small delay between sections
    return results

def main():
    # Kill old process if running
    existing_data = load_existing()
    completed = get_completed_countries(existing_data)
    
    remaining = [(c, n, cur) for c, n, cur in COUNTRIES if c not in completed]
    print(f"Already completed: {len(completed)} countries, Remaining: {len(remaining)}", flush=True)
    
    if not remaining:
        print("All countries completed!", flush=True)
        return
    
    # Process 3 countries at a time
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        for i in range(0, len(remaining), 3):
            batch = remaining[i:i+3]
            print(f"\nBatch {i//3 + 1}: Processing {[c[0] for c in batch]}", flush=True)
            
            futures = {executor.submit(generate_country, country): country for country in batch}
            
            for future in concurrent.futures.as_completed(futures):
                country = futures[future]
                try:
                    results = future.result()
                    if results:
                        existing_data.extend(results)
                        save_data(existing_data)
                        print(f"  Saved {country[0]} ({len(results)} chapters)", flush=True)
                except Exception as e:
                    print(f"  Error processing {country[0]}: {e}", flush=True)
            
            time.sleep(1)  # Brief pause between batches
    
    print(f"\nDone! Total chapters: {len(existing_data)}", flush=True)

if __name__ == "__main__":
    main()
