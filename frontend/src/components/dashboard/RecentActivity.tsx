"use client";

import { useRouter } from "next/navigation";
import {
  LucideLink2,
  LucideNotebookPen,
  LucideCodeXml,
  LucideMessageSquare,
  LucideStar,
  LucidePin,
  LucideFolder,
  LucideClock,
} from "@/Icons/Icons";

interface RecentItem {
  id: number;
  title: string;
  type: "link" | "note" | "snippet" | "prompt";
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

const typeConfig = {
  link: {
    icon: LucideLink2,
    color: "var(--primary, #3b82f6)",
    bg: "var(--primary-muted, rgba(59,130,246,0.1))",
    route: "/links",
  },
  note: {
    icon: LucideNotebookPen,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    route: "/notes",
  },
  snippet: {
    icon: LucideCodeXml,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    route: "/snippets",
  },
  prompt: {
    icon: LucideMessageSquare,
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.1)",
    route: "/prompts",
  },
};

export default function RecentActivity({ items }: RecentActivityProps) {
  const router = useRouter();

  const handleClick = (item: RecentItem) => {
    const config = typeConfig[item.type];
    router.push(config.route);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return updated.toLocaleDateString();
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="activity-panel">
        <h3 className="activity-panel-title">Recent Activity</h3>

        {items.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty-icon">
              <LucideClock width={28} />
            </div>
            <p className="activity-empty-title">No recent activity</p>
            <p className="activity-empty-subtitle">
              Start adding items to see them here
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {items.map((item) => {
              const config = typeConfig[item.type];
              const TypeIcon = config.icon;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleClick(item)}
                  className="activity-row"
                >
                  <div
                    className="activity-row-icon"
                    style={{
                      backgroundColor: config.bg,
                      color: config.color,
                    }}
                  >
                    <TypeIcon width={15} />
                  </div>
                  <div className="activity-row-content">
                    <div className="activity-row-title-wrap">
                      <span className="activity-row-title">{item.title}</span>
                      {item.isFavorite && (
                        <LucideStar
                          width={12}
                          className="activity-row-badge activity-row-badge--star"
                        />
                      )}
                      {item.isPinned && (
                        <LucidePin
                          width={12}
                          className="activity-row-badge activity-row-badge--pin"
                        />
                      )}
                    </div>
                    <div className="activity-row-meta">
                      <span
                        className="activity-row-type"
                        style={{ color: config.color }}
                      >
                        {item.type}
                      </span>
                      {item.category && (
                        <>
                          <span className="activity-row-separator">•</span>
                          <span className="activity-row-category">
                            <LucideFolder width={10} />
                            {item.category}
                          </span>
                        </>
                      )}
                      {item.language && (
                        <>
                          <span className="activity-row-separator">•</span>
                          <span>{item.language}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="activity-row-time">
                    {formatTimeAgo(item.updatedAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const CSS = `
.activity-panel {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px;
}
.activity-panel-title {
  font-size:     var(--text-lg);
  font-weight:   600;
  color:         var(--text-primary);
  margin-bottom: 16px;
}

/* Empty */
.activity-empty {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  padding:         40px 20px;
  text-align:      center;
  gap:             8px;
}
.activity-empty-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           48px;
  height:          48px;
  background:      var(--bg-overlay);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  color:           var(--text-tertiary);
  margin-bottom:   4px;
}
.activity-empty-title    { font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); }
.activity-empty-subtitle { font-size: var(--text-xs); color: var(--text-tertiary); }

/* List */
.activity-list {
  display:        flex;
  flex-direction: column;
}
.activity-row {
  display:       flex;
  align-items:   center;
  gap:           12px;
  padding:       10px 12px;
  border-radius: var(--radius-md);
  cursor:        pointer;
  transition:    background var(--transition-fast);
}
.activity-row:hover { background: var(--bg-subtle); }
.activity-row:not(:last-child) {
  margin-bottom: 2px;
}

.activity-row-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           34px;
  height:          34px;
  border-radius:   var(--radius-md);
  flex-shrink:     0;
}
.activity-row-content {
  flex: 1;
  min-width: 0;
}
.activity-row-title-wrap {
  display:     flex;
  align-items: center;
  gap:         6px;
  margin-bottom: 3px;
}
.activity-row-title {
  font-size:     var(--text-sm);
  font-weight:   500;
  color:         var(--text-primary);
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
  transition:    color var(--transition-fast);
}
.activity-row:hover .activity-row-title { color: var(--primary); }

.activity-row-badge { flex-shrink: 0; }
.activity-row-badge--star { color: #f59e0b; }
.activity-row-badge--pin  { color: var(--text-tertiary); }

.activity-row-meta {
  display:     flex;
  align-items: center;
  gap:         5px;
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
}
.activity-row-type {
  font-weight: 600;
  text-transform: capitalize;
}
.activity-row-separator { opacity: 0.4; }
.activity-row-category {
  display:     flex;
  align-items: center;
  gap:         3px;
}
.activity-row-time {
  font-size:    var(--text-xs);
  color:        var(--text-tertiary);
  flex-shrink:  0;
  white-space:  nowrap;
}
`;