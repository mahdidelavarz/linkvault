"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/authStore";
import {
  LucideArrowRight,
  LucideBarChart3,
  LucideFileCode2,
  LucideFileText,
  LucideFolder,
  LucideGlobe,
  LucideLink2,
  LucideMessageSquare,
  LucidePlus,
  LucideServer,
  LucideStar,
  LucideTag,
  LucideVault,
  LucideZap,
} from "@/Icons/Icons";

// ─── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Module config ────────────────────────────────────────────────────────────

const MODULES = [
  { key: "links",          label: "Links",          href: "/links",          icon: LucideLink2,        color: "var(--cyan-400)",  bg: "var(--accent-muted)",          border: "var(--accent-border)" },
  { key: "notes",          label: "Notes",          href: "/notes",          icon: LucideFileText,     color: "#10b981",          bg: "rgba(16,185,129,0.08)",        border: "rgba(16,185,129,0.2)" },
  { key: "snippets",       label: "Snippets",       href: "/snippets",       icon: LucideFileCode2,    color: "#8b5cf6",          bg: "rgba(139,92,246,0.08)",        border: "rgba(139,92,246,0.2)" },
  { key: "prompts",        label: "Prompts",        href: "/prompts",        icon: LucideMessageSquare,color: "#f59e0b",          bg: "rgba(245,158,11,0.08)",        border: "rgba(245,158,11,0.2)" },
  { key: "infrastructure", label: "Infrastructure", href: "/infrastructure", icon: LucideServer,       color: "#3b82f6",          bg: "rgba(59,130,246,0.08)",        border: "rgba(59,130,246,0.2)" },
  { key: "api",            label: "API Client",     href: "/api-client",     icon: LucideGlobe,        color: "#ec4899",          bg: "rgba(236,72,153,0.08)",        border: "rgba(236,72,153,0.2)" },
];

const TYPE_META: Record<string, { icon: typeof LucideLink2; color: string; href: string }> = {
  link:    { icon: LucideLink2,         color: "var(--cyan-400)", href: "/links"    },
  note:    { icon: LucideFileText,      color: "#10b981",         href: "/notes"    },
  snippet: { icon: LucideFileCode2,     color: "#8b5cf6",         href: "/snippets" },
  prompt:  { icon: LucideMessageSquare, color: "#f59e0b",         href: "/prompts"  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const user = useAuthStore((s) => s.user);

  const [greeting, setGreeting] = useState("");
  const [dateStr,  setDateStr]  = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    setDateStr(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  const stats        = data?.stats;
  const recentItems  = data?.recentItems ?? [];

  const totalItems     = stats ? stats.links.total + stats.notes.total + stats.snippets.total + stats.prompts.total : 0;
  const totalFavorites = stats ? stats.links.favorites + stats.snippets.favorites + stats.prompts.favorites : 0;

  const moduleCount = (key: string) => {
    if (!stats) return null;
    const map: Record<string, number> = {
      links: stats.links.total, notes: stats.notes.total,
      snippets: stats.snippets.total, prompts: stats.prompts.total,
      infrastructure: 0, api: 0,
    };
    return map[key] ?? 0;
  };
  const moduleSub = (key: string): { value: number; label: string } | null => {
    if (!stats) return null;
    if (key === "links")    return { value: stats.links.favorites,    label: "fav" };
    if (key === "notes")    return { value: stats.notes.pinned,       label: "pinned" };
    if (key === "snippets") return { value: stats.snippets.favorites, label: "fav" };
    if (key === "prompts")  return { value: stats.prompts.favorites,  label: "fav" };
    return null;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="dp">

        {/* ── Hero banner ── */}
        <div className="dp-hero">
          <div className="dp-hero-left">
            <div className="dp-hero-brand">
              <div className="dp-hero-vault"><LucideVault width={14} /></div>
              <span>LinkVault</span>
            </div>
            <h1 className="dp-hero-greeting">
              {greeting && `${greeting}, `}<span className="dp-hero-name">{user?.username ?? "there"}</span> 👋
            </h1>
            <p className="dp-hero-date">{dateStr || " "}</p>
          </div>

          {/* Summary pill */}
          <div className="dp-hero-summary">
            <div className="dp-hero-summary-row">
              <LucideBarChart3 width={16} className="dp-hero-summary-icon" />
              <div>
                {isLoading ? (
                  <div className="skeleton" style={{ height: 28, width: 56, borderRadius: 6 }} />
                ) : (
                  <p className="dp-hero-total">{totalItems}</p>
                )}
                <p className="dp-hero-total-label">items saved</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Module cards ── */}
        <section className="dp-modules-section">
          <div className="dp-modules">
            {MODULES.map((mod) => {
              const count = moduleCount(mod.key);
              const sub   = moduleSub(mod.key);
              const Icon  = mod.icon;
              return (
                <Link key={mod.key} href={mod.href} className="dp-mod-card">
                  <div className="dp-mod-icon"
                    style={{ background: mod.bg, border: `1px solid ${mod.border}`, color: mod.color }}>
                    <Icon width={18} />
                  </div>
                  <div className="dp-mod-body">
                    <p className="dp-mod-name">{mod.label}</p>
                    {isLoading ? (
                      <div className="skeleton" style={{ height: 20, width: 36, borderRadius: 4, marginTop: 4 }} />
                    ) : (
                      <p className="dp-mod-count">{count ?? "—"}</p>
                    )}
                  </div>
                  {!isLoading && sub && sub.value > 0 && (
                    <div className="dp-mod-badge">
                      <LucideStar width={9} />
                      {sub.value}
                    </div>
                  )}
                  <LucideArrowRight className="dp-mod-arrow" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Stats chips ── */}
        <div className="dp-chips">
          <div className="dp-chip dp-chip--gold">
            <LucideStar width={12} />
            <strong>{isLoading ? "—" : totalFavorites}</strong>
            <span>Favorites</span>
          </div>
          <div className="dp-chip dp-chip--cyan">
            <LucideFolder width={12} />
            <strong>{isLoading ? "—" : stats?.categories.total ?? 0}</strong>
            <span>Categories</span>
          </div>
          <div className="dp-chip dp-chip--violet">
            <LucideTag width={12} />
            <strong>{isLoading ? "—" : stats?.tags.total ?? 0}</strong>
            <span>Tags</span>
          </div>
          <div className="dp-chip dp-chip--subtle">
            <LucideZap width={12} />
            <strong>{isLoading ? "—" : totalItems}</strong>
            <span>Total</span>
          </div>
        </div>

        {/* ── Two-column: recent + quick-add ── */}
        <div className="dp-content">

          {/* Quick add — comes first on mobile */}
          <div className="dp-quick-section dp-card">
            <div className="dp-card-header">
              <LucidePlus width={14} className="dp-card-header-icon" />
              <h2 className="dp-card-title">Quick add</h2>
            </div>
            <div className="dp-quick-grid">
              {MODULES.slice(0, 4).map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link key={mod.key} href={mod.href} className="dp-quick-btn"
                    style={{ "--q-color": mod.color, "--q-bg": mod.bg, "--q-border": mod.border } as any}>
                    <span className="dp-quick-icon"><Icon width={15} /></span>
                    <span className="dp-quick-label">{mod.label}</span>
                    <LucidePlus className="dp-quick-plus" width={12} />
                  </Link>
                );
              })}
            </div>

            <div className="dp-nav-links">
              {[
                { label: "Categories", href: "/categories", icon: LucideFolder },
                { label: "Tags",       href: "/tags",       icon: LucideTag   },
              ].map((n) => (
                <Link key={n.href} href={n.href} className="dp-nav-link">
                  <n.icon width={13} />
                  {n.label}
                  <LucideArrowRight width={11} className="dp-nav-arrow" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="dp-activity-section dp-card">
            <div className="dp-card-header">
              <LucideZap width={14} className="dp-card-header-icon" />
              <h2 className="dp-card-title">Recent activity</h2>
            </div>

            {isLoading ? (
              <div className="dp-activity-list">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="dp-activity-skel">
                    <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 10, width: "35%" }} />
                    </div>
                    <div className="skeleton" style={{ width: 36, height: 10, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            ) : recentItems.length === 0 ? (
              <div className="dp-activity-empty">
                <LucideVault width={28} />
                <p>Your vault is empty.</p>
                <span>Start by adding a link or note.</span>
              </div>
            ) : (
              <div className="dp-activity-list">
                {recentItems.slice(0, 8).map((item, idx) => {
                  const meta = TYPE_META[item.type] ?? TYPE_META.link;
                  const Icon = meta.icon;
                  return (
                    <Link key={`${item.type}-${item.id}-${idx}`}
                      href={meta.href}
                      className="dp-activity-row">
                      <div className="dp-activity-icon"
                        style={{ color: meta.color, background: `${meta.color}14`, border: `1px solid ${meta.color}28` }}>
                        <Icon width={13} />
                      </div>
                      <div className="dp-activity-info">
                        <p className="dp-activity-title">{item.title}</p>
                        <p className="dp-activity-meta">
                          <span className="dp-activity-type">{item.type}</span>
                          {item.category && <> · {item.category}</>}
                        </p>
                      </div>
                      <span className="dp-activity-time">{timeAgo(item.updatedAt)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.dp {
  display:        flex;
  flex-direction: column;
  gap:            20px;
  flex:           1;
  overflow-y:     auto;
  padding:        16px 24px 32px;
  min-width:      0;
}
@media (max-width: 639px) { .dp { padding: 12px 12px 80px; gap: 16px; } }

/* ── Hero ── */
.dp-hero {
  display:         flex;
  align-items:     flex-start;
  justify-content: space-between;
  gap:             16px;
  padding:         20px 24px;
  background:      linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-xl);
  position:        relative;
  overflow:        hidden;
}
.dp-hero::before {
  content:       '';
  position:      absolute;
  top:           -60px; right: -40px;
  width:         220px; height: 220px;
  background:    radial-gradient(circle, var(--accent-muted) 0%, transparent 70%);
  pointer-events: none;
}
@media (max-width: 767px) {
  .dp-hero {
    flex-direction: column;
    gap:            14px;
    padding:        20px 16px;
    min-height:     140px;
  }
  .dp-hero-summary { width: 100%; justify-content: flex-start; }
  .dp-hero-summary-row { gap: 12px; }
}
@media (max-width: 479px) {
  .dp-hero { padding: 18px 14px; }
  .dp-hero-greeting { font-size: var(--text-xl); }
}

.dp-hero-brand {
  display:     flex;
  align-items: center;
  gap:         6px;
  font-size:   var(--text-xs);
  font-weight: 500;
  color:       var(--text-tertiary);
  margin-bottom: 8px;
}
.dp-hero-vault {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           20px; height: 20px;
  background:      var(--accent-muted);
  border:          1px solid var(--accent-border);
  border-radius:   var(--radius-sm);
  color:           var(--cyan-400);
}
.dp-hero-greeting {
  font-size:      var(--text-2xl);
  font-weight:    700;
  color:          var(--text-primary);
  letter-spacing: -0.02em;
  line-height:    1.2;
  margin:         0;
}
.dp-hero-name  { color: var(--cyan-400); }
.dp-hero-date  { font-size: var(--text-sm); color: var(--text-tertiary); margin-top: 4px; }

.dp-hero-summary {
  flex-shrink:   0;
  background:    var(--bg-overlay);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       14px 18px;
  min-width:     100px;
}
.dp-hero-summary-row { display: flex; align-items: center; gap: 10px; }
.dp-hero-summary-icon { color: var(--text-accent); flex-shrink: 0; }
.dp-hero-total { font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); letter-spacing: -0.04em; line-height: 1; }
.dp-hero-total-label { font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 2px; white-space: nowrap; }

/* ── Modules ── */
.dp-modules {
  display:               grid;
  grid-template-columns: repeat(6, 1fr);
  gap:                   10px;
}
@media (max-width: 1199px) { .dp-modules { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 767px)  { .dp-modules { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 359px)  { .dp-modules { grid-template-columns: 1fr; } }

.dp-mod-card {
  display:        flex;
  flex-direction: column;
  align-items:    flex-start;
  gap:            10px;
  padding:        14px 12px;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
  text-decoration: none;
  position:       relative;
  transition:     border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  min-width:      0;
  overflow:       hidden;
}
.dp-mod-card:hover {
  border-color: var(--border-strong);
  box-shadow:   var(--shadow-md);
  transform:    translateY(-1px);
}
.dp-mod-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           36px; height: 36px;
  border-radius:   var(--radius-md);
  flex-shrink:     0;
}
.dp-mod-body  { min-width: 0; flex: 1; }
.dp-mod-name  { font-size: var(--text-xs); font-weight: 600; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dp-mod-count { font-size: var(--text-xl); font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1.2; margin-top: 2px; }

.dp-mod-badge {
  display:         inline-flex;
  align-items:     center;
  gap:             3px;
  position:        absolute;
  top:             8px; right: 8px;
  background:      rgba(251,191,36,0.12);
  border:          1px solid rgba(251,191,36,0.25);
  border-radius:   var(--radius-full);
  padding:         2px 6px;
  font-size:       10px;
  font-weight:     600;
  color:           #fbbf24;
}
.dp-mod-arrow {
  position: absolute; bottom: 10px; right: 10px;
  width: 14px; height: 14px;
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.dp-mod-card:hover .dp-mod-arrow { opacity: 1; transform: translateX(2px); }

/* ── Chips ── */
.dp-chips {
  display:   flex;
  gap:       8px;
  flex-wrap: wrap;
}
.dp-chip {
  display:       flex;
  align-items:   center;
  gap:           6px;
  padding:       6px 12px;
  border-radius: var(--radius-full);
  border:        1px solid var(--border-default);
  background:    var(--bg-surface);
  font-size:     var(--text-xs);
  color:         var(--text-secondary);
  white-space:   nowrap;
}
.dp-chip strong { font-weight: 700; color: var(--text-primary); }
.dp-chip--gold   svg { color: #fbbf24; }
.dp-chip--cyan   svg { color: var(--cyan-400); }
.dp-chip--violet svg { color: #8b5cf6; }
.dp-chip--subtle svg { color: var(--text-tertiary); }

/* ── Content grid ── */
.dp-content {
  display:               grid;
  grid-template-columns: 1fr 2fr;
  gap:                   16px;
  align-items:           start;
}
@media (max-width: 1023px) { .dp-content { grid-template-columns: 1fr; } }

/* Quick section first on mobile */
.dp-quick-section  { order: -1; }
@media (min-width: 1024px) { .dp-quick-section { order: 0; } }

/* ── Card base ── */
.dp-card {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-xl);
  overflow:      hidden;
}
.dp-card-header {
  display:       flex;
  align-items:   center;
  gap:           8px;
  padding:       16px 16px 12px;
  border-bottom: 1px solid var(--border-subtle);
}
.dp-card-header-icon { color: var(--text-accent); flex-shrink: 0; }
.dp-card-title {
  font-size:   var(--text-sm);
  font-weight: 600;
  color:       var(--text-primary);
  margin:      0;
}

/* ── Quick add ── */
.dp-quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px;
}
.dp-quick-btn {
  display:         flex;
  align-items:     center;
  gap:             8px;
  padding:         10px 12px;
  background:      var(--bg-subtle);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-md);
  text-decoration: none;
  color:           var(--text-secondary);
  font-size:       var(--text-sm);
  font-weight:     500;
  transition:      background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
  min-width:       0;
}
.dp-quick-btn:hover {
  background:   var(--q-bg, var(--accent-muted));
  border-color: var(--q-border, var(--accent-border));
  color:        var(--q-color, var(--cyan-400));
}
.dp-quick-icon { display: flex; align-items: center; flex-shrink: 0; }
.dp-quick-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dp-quick-plus { flex-shrink: 0; color: var(--text-tertiary); transition: color var(--transition-fast); }
.dp-quick-btn:hover .dp-quick-plus { color: inherit; }

.dp-nav-links {
  display:        flex;
  flex-direction: column;
  gap:            2px;
  padding:        8px 12px 12px;
  border-top:     1px solid var(--border-subtle);
  margin-top:     4px;
}
.dp-nav-link {
  display:         flex;
  align-items:     center;
  gap:             8px;
  padding:         8px 8px;
  border-radius:   var(--radius-md);
  text-decoration: none;
  color:           var(--text-tertiary);
  font-size:       var(--text-xs);
  font-weight:     500;
  transition:      background var(--transition-fast), color var(--transition-fast);
}
.dp-nav-link:hover { background: var(--bg-overlay); color: var(--text-primary); }
.dp-nav-arrow { margin-left: auto; opacity: 0; transition: opacity var(--transition-fast), transform var(--transition-fast); }
.dp-nav-link:hover .dp-nav-arrow { opacity: 1; transform: translateX(2px); }

/* ── Activity ── */
.dp-activity-list {
  display:        flex;
  flex-direction: column;
}
.dp-activity-skel {
  display:     flex;
  align-items: center;
  gap:         10px;
  padding:     12px 16px;
}
.dp-activity-row {
  display:         flex;
  align-items:     center;
  gap:             10px;
  padding:         10px 16px;
  text-decoration: none;
  transition:      background var(--transition-fast);
  min-width:       0;
}
.dp-activity-row:not(:last-child) { border-bottom: 1px solid var(--border-subtle); }
.dp-activity-row:hover             { background: var(--bg-subtle); }

.dp-activity-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           30px; height: 30px;
  border-radius:   var(--radius-md);
  flex-shrink:     0;
}
.dp-activity-info  { flex: 1; min-width: 0; }
.dp-activity-title { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dp-activity-meta  { display: flex; align-items: center; gap: 4px; font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 2px; }
.dp-activity-type  { text-transform: capitalize; }
.dp-activity-time  { font-size: var(--text-xs); color: var(--text-tertiary); flex-shrink: 0; white-space: nowrap; }

.dp-activity-empty {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            8px;
  padding:        48px 24px;
  color:          var(--text-tertiary);
  text-align:     center;
}
.dp-activity-empty p    { font-size: var(--text-sm); font-weight: 500; color: var(--text-secondary); margin: 0; }
.dp-activity-empty span { font-size: var(--text-xs); }
`;
