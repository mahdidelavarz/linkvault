'use client';

import { useDashboard } from '@/hooks/useDashboard';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const stats = data?.stats;
  const recentItems = data?.recentItems || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {isLoading ? (
        <div className="space-y-6">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="w-32 h-6 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="w-40 h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="w-3/4 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats && (
              <>
                <StatCard
                  title="Links"
                  icon="🔗"
                  total={stats.links.total}
                  subStats={[
                    { label: 'Favorites', value: stats.links.favorites, icon: '⭐' }
                  ]}
                  href="/links"
                  color="text-blue-600"
                />
                <StatCard
                  title="Notes"
                  icon="📝"
                  total={stats.notes.total}
                  subStats={[
                    { label: 'Pinned', value: stats.notes.pinned, icon: '📌' }
                  ]}
                  href="/notes"
                  color="text-green-600"
                />
                <StatCard
                  title="Snippets"
                  icon="💻"
                  total={stats.snippets.total}
                  subStats={[
                    { label: 'Favorites', value: stats.snippets.favorites, icon: '⭐' }
                  ]}
                  href="/snippets"
                  color="text-purple-600"
                />
                <StatCard
                  title="Prompts"
                  icon="💬"
                  total={stats.prompts.total}
                  subStats={[
                    { label: 'Favorites', value: stats.prompts.favorites, icon: '⭐' }
                  ]}
                  href="/prompts"
                  color="text-teal-600"
                />
              </>
            )}
          </div>

          {/* Categories & Tags Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <span className="text-2xl">📁</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.categories.total}</p>
                <p className="text-sm text-gray-500">Categories</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <span className="text-2xl">🏷️</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.tags.total}</p>
                <p className="text-sm text-gray-500">Tags</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <span className="text-2xl">⭐</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.links.favorites + stats.snippets.favorites + stats.prompts.favorites}
                </p>
                <p className="text-sm text-gray-500">Favorites</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <span className="text-2xl">📊</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.links.total + stats.notes.total + stats.snippets.total + stats.prompts.total}
                </p>
                <p className="text-sm text-gray-500">Total Items</p>
              </div>
            </div>
          )}

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity items={recentItems} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </>
      )}
    </div>
  );
}