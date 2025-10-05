import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Creating invite...');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 User check:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ensure user exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // create user if doesn't exist
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          profile: {
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            alias: user.user_metadata?.full_name || user.email?.split('@')[0] || 'user',
            avatar: user.user_metadata?.avatar_url || '',
            bio: '',
            timezone: 'UTC',
            language: 'en'
          },
          preferences: {
            responseTime: 'flexible',
            communicationStyle: 'casual',
            preferredTopics: [],
            avoidTopics: [],
            ghostingTolerance: 0.5
          },
          analytics: {
            averageResponseTime: 0,
            responseRate: 1.0,
            messageFrequency: 'medium',
            engagementScore: 0.5,
            lastActiveAt: new Date().toISOString()
          },
          relationship: {
            closeness: 'stranger',
            metIn: 'online',
            sharedInterests: [],
            mutualConnections: []
          }
        });

      if (userError) {
        console.error('Error creating user:', userError);
        return NextResponse.json({ 
          error: 'Failed to create user profile', 
          details: userError.message 
        }, { status: 500 });
      }
    }

    // generate unique invite token
    const inviteToken = crypto.randomUUID();
    console.log('🎫 Generated invite token:', inviteToken);
    
    // create temporary invite record in database
    const inviteData = {
      id: inviteToken,
      created_by: user.id,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      used: false
    };
    
    console.log('💾 Inserting invite data:', inviteData);
    
    const { error: inviteError } = await supabase
      .from('chat_invites')
      .insert(inviteData);

    if (inviteError) {
      console.error('❌ Error creating invite:', inviteError);
      console.error('Error details:', JSON.stringify(inviteError, null, 2));
      return NextResponse.json({ 
        error: 'Failed to create invite', 
        details: inviteError.message,
        code: inviteError.code 
      }, { status: 500 });
    }
    
    console.log('✅ Invite created successfully');
    console.log('🎫 Final invite data:', inviteData);

    // generate invite link - detect current URL from request
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const host = request.headers.get('host');
    
    let baseUrl: string;
    if (forwardedHost && forwardedProto) {
      // production with load balancer
      baseUrl = `${forwardedProto}://${forwardedHost}`;
    } else if (host) {
      // development or direct access
      const protocol = request.url.startsWith('https') ? 'https' : 'http';
      baseUrl = `${protocol}://${host}`;
    } else {
      // fallback
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }
    
    const inviteLink = `${baseUrl}/invite/${inviteToken}`;

    return NextResponse.json({ 
      inviteLink,
      inviteToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Error in create invite API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
