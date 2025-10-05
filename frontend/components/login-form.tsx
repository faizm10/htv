'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const invite = searchParams.get('invite')
    if (invite) {
      setInviteToken(invite)
    }
  }, [searchParams])

  const handleInviteAcceptance = async (userId: string, token: string) => {
    try {
      console.log('🎫 Starting invite acceptance:', { userId, token });
      const supabase = createClient();
      
      // get invite details
      console.log('📋 Fetching invite details...');
      const { data: invite, error: inviteError } = await supabase
        .from('chat_invites')
        .select('*')
        .eq('id', token)
        .single();

      console.log('📋 Invite query result:', { invite, inviteError });

      if (inviteError || !invite) {
        console.error('❌ Invalid invite:', inviteError);
        throw new Error(`Invalid invite: ${inviteError?.message || 'Not found'}`);
      }

      // create conversation between users
      console.log('💬 Creating conversation...');
      const conversationData = {
        participants: [userId, invite.created_by],
        metadata: {
          title: `Chat with ${invite.created_by}`,
          created_via: 'invite',
          type: 'direct',
          status: 'active'
        },
        context: {},
        metrics: {},
        settings: {}
      };
      
      console.log('💬 Conversation data:', conversationData);
      
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

      console.log('💬 Conversation result:', { conversation, convError });

      if (convError) {
        console.error('❌ Failed to create conversation:', convError);
        throw new Error(`Failed to create conversation: ${convError.message}`);
      }

      // mark invite as used
      console.log('✅ Marking invite as used...');
      const { error: updateError } = await supabase
        .from('chat_invites')
        .update({
          used: true,
          used_by: userId,
          used_at: new Date().toISOString(),
          conversation_id: conversation.id
        })
        .eq('id', token);

      if (updateError) {
        console.error('❌ Failed to update invite:', updateError);
        // Don't throw here, conversation was created successfully
      }

      console.log('🚀 Redirecting to conversation:', conversation.id);
      // redirect to the new conversation
      router.push(`/chat?conversation=${conversation.id}`);

    } catch (error) {
      console.error('Error accepting invite:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        token,
        error
      });
      // fallback to chat page
      router.push('/chat');
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // if we have an invite token, handle it after login
      if (data.user && inviteToken) {
        await handleInviteAcceptance(data.user.id, inviteToken);
      } else {
        // Redirect to chat page after successful login
        router.push('/chat')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
