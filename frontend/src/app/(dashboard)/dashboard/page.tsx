"use client";

import { useDashboard } from "@/hooks/useDashboard";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const stats = data?.stats;
  const recentItems = data?.recentItems || [];

  return (
    <>
      <style>{CSS}</style>
      <div className="dashboard-page">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {isLoading ? (
          <>
            {/* Stats Grid Skeleton */}
            <div className="stats-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card-skeleton">
                  <div className="skeleton-stat-header">
                    <div
                      className="skeleton"
                      style={{ height: 40, width: 40, borderRadius: "var(--radius-lg)" }}
                    />
                    <div
                      className="skeleton"
                      style={{ height: 28, width: 48, borderRadius: "var(--radius-md)" }}
                    />
                  </div>
                  <div
                    className="skeleton"
                    style={{ height: 20, width: "60%", marginBottom: 14 }}
                  />
                  <div className="skeleton-stat-row">
                    <div
                      className="skeleton"
                      style={{ height: 14, width: "55%", marginBottom: 8 }}
                    />
                    <div
                      className="skeleton"
                      style={{ height: 14, width: 24 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary Stats Skeleton */}
            <div className="secondary-stats-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="secondary-stat-skeleton">
                  <div
                    className="skeleton"
                    style={{
                      height: 32,
                      width: 32,
                      borderRadius: "var(--radius-md)",
                      marginBottom: 8,
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      height: 24,
                      width: 36,
                      marginLeft: "auto",
                      marginRight: "auto",
                      marginBottom: 6,
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      height: 14,
                      width: 60,
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Recent Activity & Quick Actions Skeleton */}
            <div className="bottom-grid">
              <div className="activity-skeleton">
                <div
                  className="skeleton"
                  style={{ height: 22, width: 140, marginBottom: 20 }}
                />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="activity-skeleton-row">
                    <div
                      className="skeleton"
                      style={{
                        height: 32,
                        width: 32,
                        borderRadius: "var(--radius-md)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        className="skeleton"
                        style={{ height: 15, width: "70%", marginBottom: 6 }}
                      />
                      <div
                        className="skeleton"
                        style={{ height: 12, width: "40%" }}
                      />
                    </div>
                    <div
                      className="skeleton"
                      style={{
                        height: 13,
                        width: 40,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="quick-actions-skeleton">
                <div
                  className="skeleton"
                  style={{ height: 22, width: 120, marginBottom: 16 }}
                />
                <div className="quick-actions-skeleton-grid">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="skeleton"
                      style={{
                        height: 48,
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                  ))}
                </div>
                <div
                  className="skeleton"
                  style={{
                    height: 40,
                    width: "100%",
                    borderRadius: "var(--radius-md)",
                    marginTop: 16,
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Stats Grid */}
            {stats && (
              <div className="stats-grid">
                <StatCard
                  title="Links"
                  icon="link"
                  total={stats.links.total}
                  subStats={[
                    { label: "Favorites", value: stats.links.favorites, icon: "star" },
                  ]}
                  href="/links"
                  variant="blue"
                />
                <StatCard
                  title="Notes"
                  icon="note"
                  total={stats.notes.total}
                  subStats={[
                    { label: "Pinned", value: stats.notes.pinned, icon: "pin" },
                  ]}
                  href="/notes"
                  variant="green"
                />
                <StatCard
                  title="Snippets"
                  icon="snippet"
                  total={stats.snippets.total}
                  subStats={[
                    {
                      label: "Favorites",
                      value: stats.snippets.favorites,
                      icon: "star",
                    },
                  ]}
                  href="/snippets"
                  variant="purple"
                />
                <StatCard
                  title="Prompts"
                  icon="prompt"
                  total={stats.prompts.total}
                  subStats={[
                    {
                      label: "Favorites",
                      value: stats.prompts.favorites,
                      icon: "star",
                    },
                  ]}
                  href="/prompts"
                  variant="teal"
                />
              </div>
            )}

            {/* Secondary Stats */}
            {stats && (
              <div className="secondary-stats-grid">
                <div className="secondary-stat">
                  <span className="secondary-stat-icon">📁</span>
                  <p className="secondary-stat-value">
                    {stats.categories.total}
                  </p>
                  <p className="secondary-stat-label">Categories</p>
                </div>
                <div className="secondary-stat">
                  <span className="secondary-stat-icon">🏷️</span>
                  <p className="secondary-stat-value">{stats.tags.total}</p>
                  <p className="secondary-stat-label">Tags</p>
                </div>
                <div className="secondary-stat">
                  <span className="secondary-stat-icon">⭐</span>
                  <p className="secondary-stat-value">
                    {stats.links.favorites +
                      stats.snippets.favorites +
                      stats.prompts.favorites}
                  </p>
                  <p className="secondary-stat-label">Favorites</p>
                </div>
                <div className="secondary-stat">
                  <span className="secondary-stat-icon">📊</span>
                  <p className="secondary-stat-value">
                    {stats.links.total +
                      stats.notes.total +
                      stats.snippets.total +
                      stats.prompts.total}
                  </p>
                  <p className="secondary-stat-label">Total Items</p>
                </div>
              </div>
            )}

            {/* Recent Activity & Quick Actions */}
            <div className="bottom-grid">
              <div className="bottom-grid-activity">
                <RecentActivity items={recentItems} />
              </div>
              <div className="bottom-grid-actions">
                <QuickActions />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.dashboard-page {
  display:        flex;
  flex-direction: column;
  gap:            20px;
}

/* Stats Grid */
.stats-grid {
  display:               grid;
  grid-template-columns: repeat(4, 1fr);
  gap:                   16px;
}
@media (max-width: 1199px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 639px) {
  .stats-grid { grid-template-columns: 1fr; }
}

/* Stat Card Skeleton */
.stat-card-skeleton {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px;
}
.skeleton-stat-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  margin-bottom:   16px;
}
.skeleton-stat-row {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
}

/* Secondary Stats Grid */
.secondary-stats-grid {
  display:               grid;
  grid-template-columns: repeat(4, 1fr);
  gap:                   12px;
}
@media (max-width: 767px) {
  .secondary-stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 479px) {
  .secondary-stats-grid { grid-template-columns: 1fr; }
}

.secondary-stat {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       16px;
  text-align:    center;
  transition:    border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.secondary-stat:hover {
  border-color: var(--border-strong);
  box-shadow:   0 2px 8px rgba(0,0,0,0.04);
}
.secondary-stat-icon {
  display:   block;
  font-size: 24px;
  margin-bottom: 4px;
}
.secondary-stat-value {
  font-size:   var(--text-2xl);
  font-weight: 700;
  color:       var(--text-primary);
  line-height: 1.2;
}
.secondary-stat-label {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
  margin-top: 2px;
}

/* Secondary Stat Skeleton */
.secondary-stat-skeleton {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       16px;
}

/* Bottom Grid */
.bottom-grid {
  display:               grid;
  grid-template-columns: 2fr 1fr;
  gap:                   16px;
  align-items:           start;
}
@media (max-width: 1023px) {
  .bottom-grid { grid-template-columns: 1fr; }
}

/* Activity Skeleton */
.activity-skeleton {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px;
}
.activity-skeleton-row {
  display:     flex;
  align-items: center;
  gap:         12px;
  padding:     10px 0;
}
.activity-skeleton-row:not(:last-child) {
  border-bottom: 1px solid var(--border-default);
}

/* Quick Actions Skeleton */
.quick-actions-skeleton {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px;
}
.quick-actions-skeleton-grid {
  display:               grid;
  grid-template-columns: repeat(2, 1fr);
  gap:                   8px;
}
`;