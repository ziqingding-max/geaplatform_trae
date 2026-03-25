#!/usr/bin/env python3
"""
SQLite -> PostgreSQL 数据迁移脚本
用法:
  python3 scripts/migrate-sqlite-to-pg.py --sqlite /path/to/production.db --pg "postgresql://user:pass@host:5432/db" [--dry-run]
"""

import sqlite3
import psycopg2
import psycopg2.extras
import argparse
import sys
import json
from datetime import datetime, timezone

# ============================================================================
# Boolean 字段映射（SQLite 中存储为 0/1，PostgreSQL 中需要 True/False）
# ============================================================================
BOOLEAN_FIELDS = {
    "users": ["isActive", "mustChangePassword"],
    "countries_config": ["vatApplicable", "isActive"],
    "leave_types": [],
    "public_holidays": [],
    "customers": [],
    "customer_contacts": ["isPrimary", "hasPortalAccess", "isPortalActive"],
    "customer_pricing": ["isActive"],
    "customer_contracts": [],
    "customer_leave_policies": ["clientConfirmed"],
    "employees": ["requiresVisa"],
    "employee_contracts": [],
    "leave_balances": [],
    "leave_records": [],
    "adjustments": [],
    "payroll_runs": [],
    "payroll_items": [],
    "invoices": [],
    "invoice_items": [],
    "exchange_rates": [],
    "audit_logs": [],
    "system_settings": [],
    "employee_documents": [],
    "billing_entities": ["isDefault", "isActive"],
    "credit_note_applications": [],
    "onboarding_invites": [],
    "reimbursements": [],
    "vendors": [],
    "vendor_bills": [],
    "vendor_bill_items": [],
    "bill_invoice_allocations": [],
    "sales_leads": [],
    "sales_activities": [],
    "knowledge_sources": ["isActive"],
    "knowledge_items": [],
    "knowledge_marketing_events": [],
    "knowledge_feedback_events": [],
    "ai_provider_configs": ["isEnabled"],
    "ai_task_policies": ["isActive"],
    "ai_task_executions": ["fallbackTriggered", "success"],
    "notifications": ["isRead"],
    "country_social_insurance_items": ["isActive"],
    "country_guide_chapters": [],
    "salary_benchmarks": [],
    "quotations": [],
    "sales_documents": [],
    "customer_wallets": [],
    "wallet_transactions": [],
    "customer_frozen_wallets": [],
    "frozen_wallet_transactions": [],
    "lead_change_logs": [],
    "contractors": [],
    "contractor_invoices": [],
    "contractor_invoice_items": [],
    "contractor_milestones": [],
    "contractor_adjustments": [],
    "contractor_documents": [],
    "contractor_contracts": [],
    "employee_payslips": ["isPublished"],
    "worker_users": ["isActive", "isEmailVerified"],
    "migration_id_map": [],
}

# ============================================================================
# Timestamp 字段映射（SQLite 中可能存储为 epoch ms 或 ISO 字符串）
# ============================================================================
TIMESTAMP_FIELDS = {
    "users": ["inviteExpiresAt", "resetExpiresAt", "createdAt", "updatedAt", "lastSignedIn"],
    "countries_config": ["createdAt", "updatedAt"],
    "system_config": ["createdAt", "updatedAt"],
    "leave_types": ["createdAt", "updatedAt"],
    "public_holidays": ["createdAt", "updatedAt"],
    "customers": ["createdAt", "updatedAt"],
    "customer_contacts": ["inviteExpiresAt", "resetExpiresAt", "lastLoginAt", "createdAt", "updatedAt"],
    "customer_pricing": ["createdAt", "updatedAt"],
    "customer_contracts": ["createdAt", "updatedAt"],
    "customer_leave_policies": ["createdAt", "updatedAt"],
    "employees": ["createdAt", "updatedAt"],
    "employee_contracts": ["createdAt", "updatedAt"],
    "leave_balances": ["createdAt", "updatedAt"],
    "leave_records": ["clientApprovedAt", "adminApprovedAt", "createdAt", "updatedAt"],
    "adjustments": ["clientApprovedAt", "adminApprovedAt", "createdAt", "updatedAt"],
    "payroll_runs": ["submittedAt", "approvedAt", "rejectedAt", "createdAt", "updatedAt"],
    "payroll_items": ["createdAt", "updatedAt"],
    "invoices": ["sentDate", "paidDate", "createdAt", "updatedAt"],
    "invoice_items": ["createdAt", "updatedAt"],
    "exchange_rates": ["createdAt", "updatedAt"],
    "audit_logs": ["createdAt"],
    "system_settings": ["createdAt", "updatedAt"],
    "employee_documents": ["uploadedAt", "createdAt", "updatedAt"],
    "billing_entities": ["createdAt", "updatedAt"],
    "credit_note_applications": ["appliedAt", "createdAt", "updatedAt"],
    "onboarding_invites": ["expiresAt", "completedAt", "createdAt", "updatedAt"],
    "reimbursements": ["clientApprovedAt", "adminApprovedAt", "createdAt", "updatedAt"],
    "vendors": ["createdAt", "updatedAt"],
    "vendor_bills": ["submittedAt", "approvedAt", "createdAt", "updatedAt"],
    "vendor_bill_items": ["createdAt", "updatedAt"],
    "bill_invoice_allocations": ["createdAt", "updatedAt"],
    "sales_leads": ["createdAt", "updatedAt"],
    "sales_activities": ["activityDate", "createdAt"],
    "knowledge_sources": ["aiReviewedAt", "lastFetchedAt", "createdAt", "updatedAt"],
    "knowledge_items": ["publishedAt", "reviewedAt", "createdAt", "updatedAt"],
    "knowledge_marketing_events": ["createdAt"],
    "knowledge_feedback_events": ["createdAt"],
    "ai_provider_configs": ["createdAt", "updatedAt"],
    "ai_task_policies": ["createdAt", "updatedAt"],
    "ai_task_executions": ["createdAt"],
    "notifications": ["readAt", "createdAt"],
    "country_social_insurance_items": ["createdAt", "updatedAt"],
    "country_guide_chapters": ["createdAt", "updatedAt"],
    "salary_benchmarks": ["updatedAt"],
    "quotations": ["sentAt", "createdAt", "updatedAt"],
    "sales_documents": ["createdAt"],
    "customer_wallets": ["updatedAt"],
    "wallet_transactions": ["createdAt"],
    "customer_frozen_wallets": ["updatedAt"],
    "frozen_wallet_transactions": ["createdAt"],
    "lead_change_logs": ["createdAt"],
    "contractors": ["createdAt", "updatedAt"],
    "contractor_invoices": ["approvedAt", "createdAt", "updatedAt"],
    "contractor_invoice_items": ["createdAt"],
    "contractor_milestones": ["completedAt", "clientApprovedAt", "adminApprovedAt", "createdAt", "updatedAt"],
    "contractor_adjustments": ["clientApprovedAt", "adminApprovedAt", "createdAt", "updatedAt"],
    "contractor_documents": ["uploadedAt", "createdAt", "updatedAt"],
    "contractor_contracts": ["createdAt", "updatedAt"],
    "employee_payslips": ["publishedAt", "createdAt", "updatedAt"],
    "worker_users": ["inviteExpiresAt", "resetExpiresAt", "lastLoginAt", "createdAt", "updatedAt"],
    "migration_id_map": ["migratedAt"],
}

# ============================================================================
# JSONB 字段（SQLite 中存储为 JSON 字符串，PostgreSQL 需要 JSON 对象）
# ============================================================================
JSONB_FIELDS = {
    "payroll_items": ["breakdown"],
    "knowledge_items": ["metadata"],
    "knowledge_sources": ["fetchConfig"],
    "quotations": ["lineItems", "terms"],
    "employee_payslips": ["breakdown"],
}


def convert_timestamp(value):
    """将 SQLite 中的时间戳转换为 PostgreSQL 兼容格式"""
    if value is None:
        return None
    
    # 如果是数字（epoch milliseconds）
    if isinstance(value, (int, float)):
        if value > 1e12:  # epoch ms
            return datetime.fromtimestamp(value / 1000, tz=timezone.utc)
        else:  # epoch seconds
            return datetime.fromtimestamp(value, tz=timezone.utc)
    
    # 如果是字符串
    if isinstance(value, str):
        if not value or value.strip() == '':
            return None
        # 尝试各种格式
        for fmt in [
            '%Y-%m-%dT%H:%M:%S.%fZ',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%dT%H:%M:%S.%f',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%d %H:%M:%S.%f',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d',
        ]:
            try:
                dt = datetime.strptime(value, fmt)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except ValueError:
                continue
        # 尝试纯数字字符串
        try:
            num = float(value)
            if num > 1e12:
                return datetime.fromtimestamp(num / 1000, tz=timezone.utc)
            elif num > 1e9:
                return datetime.fromtimestamp(num, tz=timezone.utc)
        except ValueError:
            pass
        
        print(f"  [WARN] Cannot parse timestamp: '{value}', keeping as-is")
        return value
    
    return value


def convert_boolean(value):
    """将 SQLite 中的 0/1 转换为 Python bool"""
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.lower() in ('1', 'true', 'yes')
    return bool(value)


def convert_jsonb(value):
    """将 SQLite 中的 JSON 字符串转换为 Python dict/list"""
    if value is None:
        return None
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    return value


def get_sqlite_tables(sqlite_conn):
    """获取 SQLite 中所有用户表"""
    cursor = sqlite_conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name"
    )
    return [row[0] for row in cursor.fetchall()]


def get_table_columns(sqlite_conn, table_name):
    """获取表的列信息"""
    cursor = sqlite_conn.execute(f'PRAGMA table_info("{table_name}")')
    return [(row[1], row[2]) for row in cursor.fetchall()]  # (name, type)


def migrate_table(sqlite_conn, pg_conn, table_name, dry_run=False):
    """迁移单张表的数据"""
    # 获取 SQLite 中的数据
    try:
        cursor = sqlite_conn.execute(f'SELECT * FROM "{table_name}"')
        rows = cursor.fetchall()
    except Exception as e:
        print(f"  [ERROR] Failed to read from SQLite table '{table_name}': {e}")
        return 0
    
    if not rows:
        print(f"  [SKIP] {table_name}: 0 rows (empty)")
        return 0
    
    # 获取列名
    columns = [desc[0] for desc in cursor.description]
    
    bool_cols = set(BOOLEAN_FIELDS.get(table_name, []))
    ts_cols = set(TIMESTAMP_FIELDS.get(table_name, []))
    json_cols = set(JSONB_FIELDS.get(table_name, []))
    
    # 转换数据
    converted_rows = []
    for row in rows:
        new_row = []
        for i, (col, val) in enumerate(zip(columns, row)):
            if col in bool_cols:
                val = convert_boolean(val)
            elif col in ts_cols:
                val = convert_timestamp(val)
            elif col in json_cols:
                val = convert_jsonb(val)
                if val is not None and not isinstance(val, str):
                    val = json.dumps(val)
            new_row.append(val)
        converted_rows.append(tuple(new_row))
    
    if dry_run:
        print(f"  [DRY-RUN] {table_name}: {len(converted_rows)} rows would be migrated")
        # Show first row as sample
        if converted_rows:
            sample = dict(zip(columns, converted_rows[0]))
            # Only show first few fields
            preview = {k: v for k, v in list(sample.items())[:5]}
            print(f"    Sample: {preview}")
        return len(converted_rows)
    
    # 检查 PostgreSQL 中是否已有数据
    pg_cursor = pg_conn.cursor()
    try:
        pg_cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
        existing_count = pg_cursor.fetchone()[0]
        if existing_count > 0:
            print(f"  [WARN] {table_name}: PostgreSQL already has {existing_count} rows, clearing first...")
            pg_cursor.execute(f'DELETE FROM "{table_name}"')
    except Exception as e:
        print(f"  [WARN] Table '{table_name}' may not exist in PostgreSQL: {e}")
        pg_conn.rollback()
        return 0
    
    # 插入数据到 PostgreSQL
    placeholders = ', '.join(['%s'] * len(columns))
    quoted_columns = ', '.join([f'"{c}"' for c in columns])
    insert_sql = f'INSERT INTO "{table_name}" ({quoted_columns}) VALUES ({placeholders})'
    
    try:
        # 批量插入
        batch_size = 500
        for i in range(0, len(converted_rows), batch_size):
            batch = converted_rows[i:i + batch_size]
            psycopg2.extras.execute_batch(pg_cursor, insert_sql, batch, page_size=batch_size)
        
        # 重置序列（serial 字段的自增值）
        if 'id' in columns:
            pg_cursor.execute(f"""
                SELECT setval(pg_get_serial_sequence('"{table_name}"', 'id'), 
                       COALESCE((SELECT MAX(id) FROM "{table_name}"), 0) + 1, false)
            """)
        
        pg_conn.commit()
        print(f"  [OK] {table_name}: {len(converted_rows)} rows migrated")
        return len(converted_rows)
    except Exception as e:
        pg_conn.rollback()
        print(f"  [ERROR] {table_name}: {e}")
        # 尝试逐行插入以定位问题行
        if len(converted_rows) <= 100:
            print(f"  [RETRY] Trying row-by-row insert...")
            success = 0
            for j, row in enumerate(converted_rows):
                try:
                    pg_cursor.execute(insert_sql, row)
                    pg_conn.commit()
                    success += 1
                except Exception as e2:
                    pg_conn.rollback()
                    print(f"    [ERROR] Row {j}: {e2}")
                    print(f"    Row data: {dict(zip(columns, row))}")
            print(f"  [PARTIAL] {table_name}: {success}/{len(converted_rows)} rows migrated")
            return success
        return 0


def main():
    parser = argparse.ArgumentParser(description='Migrate SQLite to PostgreSQL')
    parser.add_argument('--sqlite', required=True, help='Path to SQLite database file')
    parser.add_argument('--pg', required=True, help='PostgreSQL connection string')
    parser.add_argument('--dry-run', action='store_true', help='Preview only, do not write')
    parser.add_argument('--tables', help='Comma-separated list of tables to migrate (default: all)')
    args = parser.parse_args()
    
    print("=" * 60)
    print("GEA Platform: SQLite -> PostgreSQL Data Migration")
    print("=" * 60)
    print(f"SQLite: {args.sqlite}")
    print(f"PostgreSQL: {args.pg.split('@')[0].split('://')[0]}://***@{args.pg.split('@')[-1]}")
    print(f"Mode: {'DRY-RUN (preview only)' if args.dry_run else 'LIVE MIGRATION'}")
    print("=" * 60)
    
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(args.sqlite)
    sqlite_conn.row_factory = None  # Use tuple rows
    
    # Connect to PostgreSQL
    pg_conn = psycopg2.connect(args.pg)
    
    # Get tables
    sqlite_tables = get_sqlite_tables(sqlite_conn)
    print(f"\nFound {len(sqlite_tables)} tables in SQLite: {sqlite_tables}")
    
    # Check which tables exist in PostgreSQL
    pg_cursor = pg_conn.cursor()
    pg_cursor.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' ORDER BY table_name
    """)
    pg_tables = set(row[0] for row in pg_cursor.fetchall())
    print(f"Found {len(pg_tables)} tables in PostgreSQL")
    
    # Filter tables
    if args.tables:
        target_tables = [t.strip() for t in args.tables.split(',')]
    else:
        target_tables = [t for t in sqlite_tables if t in pg_tables]
    
    missing = [t for t in sqlite_tables if t not in pg_tables]
    if missing:
        print(f"\n[WARN] Tables in SQLite but NOT in PostgreSQL (will skip): {missing}")
    
    print(f"\nMigrating {len(target_tables)} tables...")
    print("-" * 60)
    
    total_rows = 0
    results = []
    
    for table in target_tables:
        count = migrate_table(sqlite_conn, pg_conn, table, dry_run=args.dry_run)
        total_rows += count
        results.append((table, count))
    
    print("-" * 60)
    print(f"\n{'[DRY-RUN] ' if args.dry_run else ''}Migration complete!")
    print(f"Total: {total_rows} rows across {len(target_tables)} tables")
    
    # Summary
    print("\nSummary:")
    for table, count in results:
        if count > 0:
            print(f"  {table}: {count} rows")
    
    # Verification (only in live mode)
    if not args.dry_run:
        print("\n" + "=" * 60)
        print("Verification:")
        print("=" * 60)
        for table, expected in results:
            if expected > 0:
                pg_cursor = pg_conn.cursor()
                pg_cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
                actual = pg_cursor.fetchone()[0]
                status = "OK" if actual >= expected else "MISMATCH"
                print(f"  [{status}] {table}: expected={expected}, actual={actual}")
    
    sqlite_conn.close()
    pg_conn.close()
    print("\nDone!")


if __name__ == '__main__':
    main()
