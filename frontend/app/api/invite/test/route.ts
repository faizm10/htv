import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing invite system...');
    const supabase = await createClient();
    
    // Test 1: Check if table exists
    console.log('📋 Testing table access...');
    const { data: tableTest, error: tableError } = await supabase
      .from('chat_invites')
      .select('count')
      .limit(1);
    
    console.log('📋 Table test result:', { tableTest, tableError });
    
    // Test 2: Check if we can insert a test record
    console.log('📝 Testing insert capability...');
    const testToken = 'test-' + Date.now();
    const { data: insertTest, error: insertError } = await supabase
      .from('chat_invites')
      .insert({
        id: testToken,
        created_by: '00000000-0000-0000-0000-000000000000', // dummy UUID
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        used: false
      })
      .select();
    
    console.log('📝 Insert test result:', { insertTest, insertError });
    
    // Test 3: Try to read it back
    if (!insertError) {
      console.log('🔍 Testing read capability...');
      const { data: readTest, error: readError } = await supabase
        .from('chat_invites')
        .select('*')
        .eq('id', testToken)
        .single();
      
      console.log('🔍 Read test result:', { readTest, readError });
      
      // Clean up test record
      await supabase
        .from('chat_invites')
        .delete()
        .eq('id', testToken);
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        tableAccess: { success: !tableError, error: tableError },
        insertCapability: { success: !insertError, error: insertError },
        readCapability: { success: !insertError, error: insertError }
      },
      message: 'Invite system test completed'
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Invite system test failed'
    }, { status: 500 });
  }
}
