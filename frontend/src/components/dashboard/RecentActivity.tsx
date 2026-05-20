import { useRouter } from 'next/navigation';

interface RecentItem {
  id: number;
  title: string;
  type: 'link' | 'note' | 'snippet' | 'prompt';
  updatedAt: string;
  category?: string;
  url?: string;
  language?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
}

interface RecentActivityProps {
  items: RecentItem[];
}

export default function RecentActivity({ items }: RecentActivityProps) {
  const router = useRouter();

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'link': return { icon: '🔗', color: 'text-blue-600', route: '/links' };
      case 'note': return { icon: '📝', color: 'text-green-600', route: '/notes' };
      case 'snippet': return { icon: '💻', color: 'text-purple-600', route: '/snippets' };
      case 'prompt': return { icon: '💬', color: 'text-teal-600', route: '/prompts' };
      default: return { icon: '📄', color: 'text-gray-600', route: '/' };
    }
  };

  const handleClick = (item: RecentItem) => {
    const { route } = getTypeInfo(item.type);
    router.push(route);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return updated.toLocaleDateString();
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">🕒</p>
          <p>No recent activity</p>
          <p className="text-sm mt-1">Start adding items to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-2">
        {items.map((item) => {
          const { icon, color } = getTypeInfo(item.type);
          return (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleClick(item)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <span className="text-xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </p>
                  {item.isFavorite && <span className="text-xs">⭐</span>}
                  {item.isPinned && <span className="text-xs">📌</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`font-medium ${color}`}>{item.type}</span>
                  {item.category && (
                    <>
                      <span>•</span>
                      <span>📁 {item.category}</span>
                    </>
                  )}
                  {item.language && (
                    <>
                      <span>•</span>
                      <span>{item.language}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {formatTimeAgo(item.updatedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}