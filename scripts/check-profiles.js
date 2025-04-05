#!/usr/bin/env node

/**
 * Profiles Table Diagnostic Script
 * 
 * This script checks if the profiles table exists in Supabase
 * and tests basic operations against it.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

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

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY || !DB_PASSWORD) {
    log('Error: Environment variables VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_DB_PASSWORD are required', colors.red);
    process.exit(1);
  }

  log('🔍 Starting Supabase profiles table diagnostic...', colors.magenta);
  
  try {
    // Create Supabase client
    log('🔌 Connecting to Supabase...', colors.blue);
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Test connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }
    log(`✅ Connected to Supabase (has session: ${!!authData.session})`, colors.green);
    
    // Test profiles table structure
    log('🔍 Checking profiles table...', colors.blue);
    const { data: tablesData, error: tablesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      log(`❌ Error fetching from profiles table: ${tablesError.message}`, colors.red);
      
      // Try to check if the table exists using Supabase SQL
      const { error: sqlError } = await supabase.rpc('check_profiles_table');
      if (sqlError) {
        log(`❌ Failed to check profiles table using SQL: ${sqlError.message}`, colors.red);
        
        // Create a function to check table existence
        log('🔧 Creating a diagnostic function in the database...', colors.yellow);
        const createSql = `
          CREATE OR REPLACE FUNCTION check_profiles_table()
          RETURNS TABLE (
            table_exists boolean,
            table_schema text,
            column_count integer
          ) AS $$
          BEGIN
            RETURN QUERY 
            SELECT 
              EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles'
              ) as table_exists,
              'public' as table_schema,
              (
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles'
              )::integer as column_count;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;
        
        // Try to get SQL command to work from shell
        log('🔄 Attempting alternative diagnostic method...', colors.yellow);
        log('Command to run manually: ', colors.cyan);
        log(`supabase db dump -t profiles --schema-only`, colors.cyan);
        
        // Return instructions
        log('\n📋 Diagnostic Summary:', colors.magenta);
        log('1. The profiles table might be missing or inaccessible', colors.yellow);
        log('2. RLS policies might be preventing access to the table', colors.yellow);
        log('3. Try running the following directly in SQL or pgAdmin:', colors.yellow);
        log(`
-- Check if profiles table exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
        `, colors.cyan);
      }
    } else {
      log('✅ Profiles table exists and is accessible', colors.green);
      log('📊 Sample data:', colors.blue);
      console.log(tablesData);
      
      log('\n📋 Diagnostic Success:', colors.magenta);
      log('The profiles table exists and is accessible. The issue might be with RLS policies or authentication.', colors.green);
      log('Here are some things to try in your application:', colors.yellow);
      log('1. Check if you need to handle CSRF tokens in your requests', colors.yellow);
      log('2. Verify that the user has the correct permissions in the profile table', colors.yellow);
      log('3. Try using just a simple fetch with the same URL/headers to isolate browser/environment issues', colors.yellow);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
  }
}

main().catch(error => {
  log(`Unhandled error: ${error.message}`, colors.red);
  process.exit(1);
}); 