#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the Supabase database by running the migrations.
 * It uses the Supabase CLI to apply the migrations to your project.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync, writeFileSync } from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to log messages
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to execute commands
function executeCommand(command, options = {}) {
  try {
    log(`Executing: ${command}`, colors.cyan);
    const output = execSync(command, { 
      stdio: 'inherit',
      ...options
    });
    return output;
  } catch (error) {
    // Don't exit on error, just log it
    log(`Error executing command: ${command}`, colors.red);
    log(error.message, colors.red);
    return null;
  }
}

// Main function
async function main() {
  const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

  if (!DB_PASSWORD) {
    log('Error: SUPABASE_DB_PASSWORD environment variable is not set', colors.red);
    process.exit(1);
  }

  log('🚀 Starting database initialization...', colors.magenta);
  
  // Check if migrations directory exists
  if (!existsSync(MIGRATIONS_DIR)) {
    log(`Error: Migrations directory not found at ${MIGRATIONS_DIR}`, colors.red);
    process.exit(1);
  }
  
  // Get list of migration files
  const migrationFiles = readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (migrationFiles.length === 0) {
    log('No migration files found!', colors.yellow);
    process.exit(0);
  }
  
  log(`Found ${migrationFiles.length} migration files`, colors.green);
  
  // Mark all migrations as not applied
  log('Resetting migration history...', colors.blue);
  for (const file of migrationFiles) {
    const version = file.split('_')[0];
    executeCommand(`supabase migration repair --status reverted ${version}`);
  }
  
  // Fix the auth_attempts migration before pushing
  log('Updating auth_attempts migration...', colors.blue);
  const authAttemptsPath = join(MIGRATIONS_DIR, '20240319000007_create_auth_attempts.sql');
  if (existsSync(authAttemptsPath)) {
    const fixedMigration = `
-- Create auth_attempts table
DROP TABLE IF EXISTS public.auth_attempts;
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  success boolean NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "Allow admins and developers to view auth attempts" ON public.auth_attempts;

-- Create policy for inserting attempts (allow all authenticated users)
CREATE POLICY "Allow authenticated users to insert auth attempts"
  ON public.auth_attempts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for viewing attempts (allow only admins and developers)
CREATE POLICY "Allow admins and developers to view auth attempts"
  ON public.auth_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'developer')
    )
  );

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS auth_attempts_ip_address_idx;
DROP INDEX IF EXISTS auth_attempts_timestamp_idx;
DROP INDEX IF EXISTS auth_attempts_success_idx;

-- Create indexes for better query performance
CREATE INDEX auth_attempts_ip_address_idx ON public.auth_attempts(ip_address);
CREATE INDEX auth_attempts_timestamp_idx ON public.auth_attempts(timestamp);
CREATE INDEX auth_attempts_success_idx ON public.auth_attempts(success);

-- Create function to clean up old attempts
CREATE OR REPLACE FUNCTION clean_old_auth_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.auth_attempts
  WHERE timestamp < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up old attempts daily
-- Check if cron extension exists to avoid errors
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    EXECUTE 'SELECT cron.schedule(
      ''cleanup-auth-attempts'',
      ''0 0 * * *'', -- Run at midnight every day
      ''SELECT clean_old_auth_attempts();''
    )';
  END IF;
END $$;
    `.trim();
    
    // Update the migration file
    writeFileSync(authAttemptsPath, fixedMigration);
    log('Updated auth_attempts migration file', colors.green);
  }
  
  // Run all migrations
  log('Applying all migrations...', colors.blue);
  executeCommand(`supabase db push --linked -p "${DB_PASSWORD}" --include-roles`);
  
  log('✅ Database initialization completed successfully!', colors.green);
}

// Run the main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`, colors.red);
  process.exit(1);
}); 