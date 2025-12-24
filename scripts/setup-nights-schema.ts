import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bXdjc3dkZGJlcGVsZ2N0eWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTgzMjYsImV4cCI6MjA3MDM3NDMyNn0._eI2GVgkTRZoD7J1Y-LurfIPPwqrJBVBuERfDB5uNL8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSchema() {
  console.log('🔧 Setting up nights and time_slots schema...');
  
  try {
    // Read SQL file
    const sql = readFileSync(join(__dirname, 'setup-nights-schema.sql'), 'utf-8');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`\nExecuting: ${statement.substring(0, 60)}...`);
        // Note: Supabase doesn't support direct SQL execution via client
        // This needs to be run in Supabase SQL editor
        console.log('⚠️ This SQL needs to be run in Supabase SQL Editor:');
        console.log(statement + ';');
      }
    }
    
    console.log('\n✅ Please run the SQL in setup-nights-schema.sql in Supabase SQL Editor');
    console.log('   Then run populate-schedule.ts again');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupSchema();

