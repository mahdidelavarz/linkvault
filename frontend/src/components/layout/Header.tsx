'use client';

import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">
            🗂️ LinkVault
          </h1>
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