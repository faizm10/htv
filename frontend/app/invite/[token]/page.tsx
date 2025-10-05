'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface InviteData {
  id: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_by?: string;
  used_at?: string;
  creator_profile?: {
    name: string;
    avatar: string;
  };
}

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const resolvedParams = use(params);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkInvite();
    checkUser();
  }, [resolvedParams.token]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const checkInvite = async () => {
    try {
      console.log('Checking invite for token:', resolvedParams.token);
      
      const { data, error } = await supabase
        .from('chat_invites')
        .select('*')
        .eq('id', resolvedParams.token)
        .single();

      console.log('Invite query result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        if (error.code === 'PGRST116') {
          setError('Invite link not found or expired');
        } else if (error.code === '42P01') {
          setError('Database table not found. Please run migrations.');
        } else {
          setError(`Invalid invite link: ${error.message}`);
        }
        return;
      }

      // check if invite is expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invite link has expired');
        return;
      }

      // check if already used
      if (data.used) {
        setError('This invite link has already been used');
        return;
      }

      // fetch creator profile separately
      let creatorProfile = { name: 'Someone', avatar: '' };
      try {
        const { data: creatorData } = await supabase
          .from('users')
          .select('profile')
          .eq('id', data.created_by)
          .single();
        
        if (creatorData?.profile) {
          creatorProfile = {
            name: creatorData.profile.name || 'Someone',
            avatar: creatorData.profile.avatar || ''
          };
        }
      } catch (creatorError) {
        console.warn('Could not fetch creator profile:', creatorError);
      }

      setInvite({
        ...data,
        creator_profile: creatorProfile
      });

    } catch (err) {
      console.error('Error checking invite:', err);
      setError('Failed to load invite');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user) {
      // redirect to signup with invite token
      router.push(`/auth/sign-up?invite=${resolvedParams.token}`);
      return;
    }

    try {
      // create conversation between users
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          participants: [user.id, invite?.created_by],
          type: 'direct',
          status: 'active',
          metadata: {
            title: `Chat with ${invite?.creator_profile?.name}`,
            created_via: 'invite'
          }
        })
        .select()
        .single();

      if (convError) {
        throw convError;
      }

      // mark invite as used
      await supabase
        .from('chat_invites')
        .update({
          used: true,
          used_by: user.id,
          used_at: new Date().toISOString(),
          conversation_id: conversation.id
        })
        .eq('id', resolvedParams.token);

      // redirect to chat
      router.push(`/chat?conversation=${conversation.id}`);

    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('Failed to accept invite');
    }
  };

  const handleSignUp = () => {
    router.push(`/auth/sign-up?invite=${resolvedParams.token}`);
  };

  const handleLogin = () => {
    router.push(`/auth/login?invite=${resolvedParams.token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading invite...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Invalid Invite</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p>Invite not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Chat Invitation</CardTitle>
          </div>
          <CardDescription>
            You've been invited to start a conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {invite.creator_profile?.avatar ? (
                <img 
                  src={invite.creator_profile.avatar} 
                  alt={invite.creator_profile.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-sm font-medium">
                  {invite.creator_profile?.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">{invite.creator_profile?.name}</p>
              <p className="text-sm text-muted-foreground">wants to chat with you</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expires in {Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
          </div>

          {user ? (
            <div className="space-y-2">
              <Button onClick={handleAcceptInvite} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Invitation
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You'll be redirected to start chatting
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Sign up or log in to accept this invitation
              </p>
              <div className="flex gap-2">
                <Button onClick={handleSignUp} variant="outline" className="flex-1">
                  Sign Up
                </Button>
                <Button onClick={handleLogin} className="flex-1">
                  Log In
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
