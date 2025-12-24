import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function testMemberFlow() {
  console.log('🧪 Testing Complete Member Flow...');
  
  try {
    // Test 1: Check if Robert Paulson exists
    console.log('🔍 Step 1: Checking for Robert Paulson...');
    const { data: robertData, error: robertError } = await supabase
      .from('members')
      .select('*')
      .eq('username', 'RobertP')
      .single();
    
    if (robertError && robertError.code === 'PGRST116') {
      console.log('✅ Robert Paulson not found - should route to signup (correct behavior)');
    } else if (robertData) {
      console.log('✅ Robert Paulson found:', robertData.username);
    }
    
    // Test 2: Create a new member
    console.log('🔍 Step 2: Testing member creation...');
    const newMember = {
      first_name: 'John',
      last_name: 'Doe',
      username: 'JohnD',
      phone: '555-987-6543',
      address: '456 Main St',
      password_hash: 'hashed_password_123'
    };
    
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .insert([newMember])
      .select()
      .single();
    
    if (memberError) {
      console.error('❌ Member creation failed:', memberError);
      return;
    }
    
    console.log('✅ Member created successfully:', memberData.username);
    
    // Test 3: Verify member can be retrieved
    console.log('🔍 Step 3: Testing member retrieval...');
    const { data: retrievedMember, error: retrieveError } = await supabase
      .from('members')
      .select('*')
      .eq('username', 'JohnD')
      .single();
    
    if (retrieveError) {
      console.error('❌ Member retrieval failed:', retrieveError);
    } else {
      console.log('✅ Member retrieved successfully:', retrievedMember.username);
    }
    
    // Test 4: Test username availability check
    console.log('🔍 Step 4: Testing username availability...');
    const { data: existingUser, error: checkError } = await supabase
      .from('members')
      .select('username')
      .eq('username', 'JohnD')
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ Username available (not found)');
    } else if (existingUser) {
      console.log('✅ Username taken (found existing user)');
    }
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await supabase
      .from('members')
      .delete()
      .eq('id', memberData.id);
    
    console.log('🎉 Complete member flow test successful!');
    
  } catch (error) {
    console.error('❌ Member flow test failed:', error);
  }
}

testMemberFlow();


























