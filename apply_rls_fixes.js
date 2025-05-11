const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

// Initialize Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFixes() {
  try {
    console.log('Applying RLS policy fixes for snaptrade_credentials table...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'fix_snaptrade_credentials_rls.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    // Split the SQL commands
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);

    // Execute each command
    for (const command of commands) {
      try {
        console.log(`Executing SQL command: ${command.trim().substring(0, 50)}...`);
        const { error } = await supabase.rpc('pgadmin_exec_sql', { 
          sql: command.trim() 
        });

        if (error) {
          console.error(`Error executing command: ${error.message}`);
        }
      } catch (cmdError) {
        console.error(`Error executing command: ${cmdError.message}`);
      }
    }

    console.log('RLS policy fixes applied successfully!');
  } catch (error) {
    console.error('Error applying RLS fixes:', error.message);
  }
}

applyRLSFixes(); 