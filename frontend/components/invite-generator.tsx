'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface InviteGeneratorProps {
  onInviteCreated?: (inviteLink: string) => void;
}

export function InviteGenerator({ onInviteCreated }: InviteGeneratorProps) {
  const [inviteLink, setInviteLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/invite/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate invite`);
      }

      const data = await response.json();
      setInviteLink(data.inviteLink);
      onInviteCreated?.(data.inviteLink);
      toast.success('Invite link generated!');
    } catch (error) {
      console.error('Error generating invite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invite link';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy invite link');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Invite Someone to Chat
        </CardTitle>
        <CardDescription>
          Generate a link to invite someone to start a conversation with you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!inviteLink ? (
          <Button 
            onClick={generateInvite} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Generate Invite Link
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="invite-link">Your invite link:</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-link"
                  value={inviteLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Share this link with anyone you want to chat with. They'll be able to sign up or log in to start a conversation with you.
            </div>
            <Button
              onClick={() => setInviteLink('')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Generate New Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
