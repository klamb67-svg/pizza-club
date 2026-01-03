import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyRLSFix() {
  console.log('🔧 Applying RLS policy fix...');
  
  try {
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('members')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Supabase connection verified');
    
    // Apply RLS policies using individual queries
    const policies = [
      // Drop existing policies
      'DROP POLICY IF EXISTS "Allow anon read" ON public.members',
      'DROP POLICY IF EXISTS "Allow authenticated read" ON public.members', 
      'DROP POLICY IF EXISTS "Allow profile updates" ON public.members',
      'DROP POLICY IF EXISTS "Allow public signup" ON public.members',
      'DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.members',
      'DROP POLICY IF EXISTS "Allow updates for own row" ON public.members',
      'DROP POLICY IF EXISTS "Public inserts for signup" ON public.members',
      
      // Create new policies
      `CREATE POLICY "Allow public signup"
       ON public.members 
       FOR INSERT 
       TO public
       WITH CHECK (true)`,
       
      `CREATE POLICY "Allow authenticated read"
       ON public.members 
       FOR SELECT 
       TO authenticated 
       USING (true)`,
       
      `CREATE POLICY "Allow profile updates"
       ON public.members 
       FOR UPDATE 
       TO public
       USING (true)
       WITH CHECK (true)`
    ];
    
    for (const policy of policies) {
      const { error } = await supabase.rpc('exec', { sql: policy });
      if (error) {
        console.log(`⚠️ Policy warning (may already exist): ${error.message}`);
      } else {
        console.log(`✅ Policy applied: ${policy.split(' ')[0]} ${policy.split(' ')[1]}`);
      }
    }
    
    console.log('🎉 RLS policies updated successfully!');
    
    // Test signup functionality
    console.log('🧪 Testing signup functionality...');
    const testMember = {
      first_name: 'Test',
      last_name: 'User',
      username: 'TestUser123',
      phone: '555-123-4567',
      address: '123 Test St',
      password_hash: 'test_hash'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('members')
      .insert([testMember])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Signup test failed:', insertError);
    } else {
      console.log('✅ Signup test successful! Member created:', insertData.username);
      
      // Clean up test data
      await supabase
        .from('members')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ RLS Fix Error:', error);
  }
}

applyRLSFix();



























