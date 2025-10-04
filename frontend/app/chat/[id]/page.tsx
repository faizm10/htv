import { redirect } from 'next/navigation';

interface ChatPageProps {
  params: { id: string };
}

export default function ChatPage({ params }: ChatPageProps) {
  // Redirect to main chat page with the conversation ID as a query parameter
  redirect(`/chat?conversation=${params.id}`);
}
