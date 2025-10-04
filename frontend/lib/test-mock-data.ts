// Test script to verify the new mock conversations
// Run this in your browser console or integrate into your app

import { mockDatabase } from './mock-database-service';

export async function testMockData() {
  console.log('🧪 Testing mock data...');

  // Test getting users
  const laura = await mockDatabase.getUser('laura_id');
  const faiz = await mockDatabase.getUser('faiz_id');
  const smith = await mockDatabase.getUser('smith_id');
  const wosly = await mockDatabase.getUser('wosly_id');

  console.log('👥 Users loaded:');
  console.log('  - Laura:', laura?.profile.name, laura?.profile.bio);
  console.log('  - Faiz:', faiz?.profile.name, faiz?.profile.bio);
  console.log('  - Smith:', smith?.profile.name, smith?.profile.bio);
  console.log('  - Wosly:', wosly?.profile.name, wosly?.profile.bio);

  // Test getting conversations
  const conversations = await mockDatabase.getConversations({ userId: 'current_user' });
  console.log('💬 Total conversations:', conversations.length);

  // Test Laura & Faiz conversation
  const lauraFaizMessages = await mockDatabase.getMessages({ conversationId: 'conv_laura_faiz' });
  console.log('🏔️ Laura & Faiz conversation:');
  lauraFaizMessages.forEach((msg, i) => {
    const sender = msg.senderId === 'laura_id' ? 'Laura' : 'Faiz';
    console.log(`  ${i + 1}. ${sender}: "${msg.content.text}"`);
  });

  // Test Smith & Wosly conversation
  const smithWoslyMessages = await mockDatabase.getMessages({ conversationId: 'conv_smith_wosly' });
  console.log('🎵 Smith & Wosly conversation:');
  smithWoslyMessages.forEach((msg, i) => {
    const sender = msg.senderId === 'smith_id' ? 'Smith' : 'Wosly';
    console.log(`  ${i + 1}. ${sender}: "${msg.content.text}"`);
  });

  // Test suggestions
  const suggestions = await mockDatabase.generateSuggestions('conv_laura_faiz', 'hiking weekend plans');
  console.log('💡 Suggestions for Laura & Faiz:', suggestions);

  console.log('✅ Mock data test completed!');
  console.log('🔄 Refresh your chat app to see the new conversations');
  
  return {
    users: [laura, faiz, smith, wosly],
    conversations,
    lauraFaizMessages,
    smithWoslyMessages,
    suggestions
  };
}

export default testMockData;
