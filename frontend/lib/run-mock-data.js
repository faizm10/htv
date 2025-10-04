// Browser Console Script to Add Mock Data
// Copy and paste this into your browser console at http://localhost:3001

console.log('🚀 Adding mock conversations...');

// Import the function (this will work if you're in the Next.js app)
// If you get an error, we'll create a simpler version below

try {
  // Try to import and run the function
  import('/lib/add-mock-conversations.js').then(({ addMockConversations }) => {
    addMockConversations().then(() => {
      console.log('✅ Mock data added successfully!');
      console.log('🔄 Refresh the page to see the new conversations');
    });
  });
} catch (error) {
  console.log('📝 Running simplified mock data script...');
  
  // Simplified version that works directly in console
  const mockData = {
    users: [
      {
        id: 'laura_id',
        profile: {
          name: 'Laura',
          alias: 'Laura',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          bio: 'Love hiking and photography 📸'
        },
        analytics: {
          lastActiveAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        relationship: {
          closeness: 'close_friend'
        }
      },
      {
        id: 'faiz_id',
        profile: {
          name: 'Faiz',
          alias: 'Faiz',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Software engineer and coffee enthusiast ☕'
        },
        analytics: {
          lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        relationship: {
          closeness: 'good_friend'
        }
      },
      {
        id: 'smith_id',
        profile: {
          name: 'Smith',
          alias: 'Smith',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bio: 'Musician and dog lover 🎵🐕'
        },
        analytics: {
          lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        relationship: {
          closeness: 'acquaintance'
        }
      },
      {
        id: 'wosly_id',
        profile: {
          name: 'Wosly',
          alias: 'Wosly',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          bio: 'Artist and yoga instructor 🧘‍♀️'
        },
        analytics: {
          lastActiveAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        relationship: {
          closeness: 'best_friend'
        }
      }
    ]
  };

  console.log('📊 Mock data ready:', mockData);
  console.log('🔄 This data will be used by the mock database service');
}
