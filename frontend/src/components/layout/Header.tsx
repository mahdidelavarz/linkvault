'use client';

import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">
            🗂️ LinkVault
          </h1>
          
          {/* Quick Search Button */}
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            <span>🔍</span>
            <span>Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-gray-200 rounded border border-gray-300">
              Ctrl+K
            </kbd>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.username}
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}