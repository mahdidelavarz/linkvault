'use client';

import { useAuthStore } from '@/store/authStore';

export default function WelcomeBanner() {
  const user = useAuthStore((state) => state.user);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getQuote = () => {
    const quotes = [
      'Knowledge is power. Keep it organized! 🚀',
      'Your digital brain, beautifully organized. 🧠',
      'Every great project starts with a saved link. 🔗',
      'Stay focused, stay organized. ✨',
      'Your second brain is getting smarter! 💡',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {getGreeting()}, {user?.username}! 👋
          </h2>
          <p className="text-blue-100">{getQuote()}</p>
        </div>
        <div className="text-6xl hidden sm:block">
          🗂️
        </div>
      </div>
    </div>
  );
}