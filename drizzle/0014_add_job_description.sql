-- Migration: Add jobDescription field to employees, contractors, and onboarding_invites
-- Purpose: Support job description alongside job title for full-stack onboarding

-- 1. Add jobDescription column to employees table
ALTER TABLE employees ADD COLUMN jobDescription TEXT;

-- 2. Add jobDescription column to contractors table
ALTER TABLE contractors ADD COLUMN jobDescription TEXT;

-- 3. Add jobDescription column to onboarding_invites table
ALTER TABLE onboarding_invites ADD COLUMN jobDescription TEXT;
