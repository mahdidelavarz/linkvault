'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuthStore } from '@/store/authStore'

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_MAIN = [
  { name: 'Dashboard',      href: '/dashboard',      icon: 'lucide:layout-dashboard' },
  { name: 'Links',          href: '/links',           icon: 'lucide:link-2'           },
  { name: 'Notes',          href: '/notes',           icon: 'lucide:file-text'        },
  { name: 'Snippets',       href: '/snippets',        icon: 'lucide:code-2'           },
  { name: 'Prompts',        href: '/prompts',         icon: 'lucide:message-square'   },
  { name: 'API Client',     href: '/api-client',      icon: 'lucide:globe'            },
  { name: 'Infrastructure', href: '/infrastructure',  icon: 'lucide:server'           },
]

const NAV_MANAGE = [
  { name: 'Categories', href: '/categories', icon: 'lucide:folder'  },
  { name: 'Tags',       href: '/tags',       icon: 'lucide:tag'     },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname  = usePathname()
  const user      = useAuthStore((s) => s.user)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <style>{CSS}</style>
      <aside className={['sidebar', collapsed ? 'sidebar--collapsed' : ''].filter(Boolean).join(' ')}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Icon icon="lucide:vault" width={18} />
          </div>
          {!collapsed && <span className="sidebar-logo-text">LinkVault</span>}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((p) => !p)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon
              icon={collapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'}
              width={14}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">

          {/* Main section */}
          <NavSection label="Menu" collapsed={collapsed}>
            {NAV_MAIN.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                collapsed={collapsed}
              />
            ))}
          </NavSection>

          {/* Manage section */}
          <NavSection label="Manage" collapsed={collapsed}>
            {NAV_MANAGE.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            ))}
          </NavSection>

        </nav>

        {/* Footer — user info */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              <Icon icon="lucide:user" width={14} />
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-username">{user?.username ?? 'User'}</span>
              </div>
            )}
          </div>
        </div>

      </aside>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavSection({
  label,
  collapsed,
  children,
}: {
  label:     string
  collapsed: boolean
  children:  React.ReactNode
}) {
  return (
    <div className="nav-section">
      {!collapsed && <p className="nav-section-label">{label}</p>}
      <div className="nav-section-items">{children}</div>
    </div>
  )
}

function NavItem({
  name,
  href,
  icon,
  active,
  collapsed,
}: {
  name:      string
  href:      string
  icon:      string
  active:    boolean
  collapsed: boolean
}) {
  return (<Link
      href={href}
      className={['nav-item', active ? 'nav-item--active' : ''].filter(Boolean).join(' ')}
      title={collapsed ? name : undefined}
    >
      <Icon icon={icon} className="nav-item-icon" />
      {!collapsed && <span className="nav-item-label">{name}</span>}
      {active && !collapsed && <span className="nav-item-dot" />}
    </Link>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.sidebar {
  display:        flex;
  flex-direction: column;
  width:          var(--sidebar-width);
  min-height:     100dvh;
  background:     var(--bg-surface);
  border-right:   1px solid var(--border-default);
  transition:     width var(--transition-slow);
  flex-shrink:    0;
  position:       sticky;
  top:            0;
  overflow:       hidden;
}
.sidebar--collapsed {
  width: var(--sidebar-width-collapsed);
}

/* Logo */
.sidebar-logo {
  display:         flex;
  align-items:     center;
  gap:             10px;
  padding:         18px 14px 14px;
  border-bottom:   1px solid var(--border-subtle);
  flex-shrink:     0;
  min-height:      60px;
}
.sidebar-logo-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           32px;
  height:          32px;
  background:      var(--accent-muted);
  border:          1px solid var(--accent-border);
  border-radius:   var(--radius-md);
  color:           var(--cyan-400);
  flex-shrink:     0;
}
.sidebar-logo-text {
  font-size:   var(--text-md);
  font-weight: 700;
  color:       var(--text-primary);
  letter-spacing: -0.02em;
  flex:        1;
  white-space: nowrap;
}
.sidebar-collapse-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           24px;
  height:          24px;
  background:      transparent;
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  flex-shrink:     0;
  margin-left:     auto;
  transition:      background var(--transition-fast),
                   color      var(--transition-fast);
}
.sidebar-collapse-btn:hover {
  background: var(--bg-overlay);
  color:      var(--text-primary);
}

/* Nav */
.sidebar-nav {
  flex:       1;
  overflow-y: auto;
  overflow-x: hidden;
  padding:    8px 8px;
  display:    flex;
  flex-direction: column;
  gap:        4px;
}
.sidebar-nav::-webkit-scrollbar { width: 0; }

.nav-section { margin-bottom: 4px; }
.nav-section-label {
  font-size:      var(--text-xs);
  font-weight:    600;
  color:          var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding:        10px 8px 4px;
  white-space:    nowrap;
}
.nav-section-items {
  display:        flex;
  flex-direction: column;
  gap:            2px;
}

.nav-item {
  display:       flex;
  align-items:   center;
  gap:           10px;
  padding:       7px 8px;
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-weight:   500;
  text-decoration: none;
  transition:    background var(--transition-fast),
                 color      var(--transition-fast);
  white-space:   nowrap;
  position:      relative;
}
.nav-item:hover {
  background: var(--bg-overlay);
  color:      var(--text-primary);
}
.nav-item--active {
  background: var(--accent-muted);
  color:      var(--cyan-300);
}
.nav-item--active:hover {
  background: var(--accent-muted);
  color:      var(--cyan-300);
}
.nav-item-icon {
  width:      16px;
  height:     16px;
  flex-shrink: 0;
}
.nav-item-label { flex: 1; }
.nav-item-dot {
  width:         5px;
  height:        5px;
  border-radius: 50%;
  background:    var(--accent);
  flex-shrink:   0;
}

/* Footer */
.sidebar-footer {
  padding:      10px 8px;
  border-top:   1px solid var(--border-subtle);
  flex-shrink:  0;
}
.sidebar-user {
  display:       flex;
  align-items:   center;
  gap:           10px;
  padding:       7px 8px;
  border-radius: var(--radius-md);
  overflow:      hidden;
}
.sidebar-avatar {display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  background:      var(--bg-subtle);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-full);
  color:           var(--text-secondary);
  flex-shrink:     0;
}
.sidebar-user-info {
  flex:      1;
  min-width: 0;
  overflow:  hidden;
}
.sidebar-username {
  font-size:     var(--text-sm);
  font-weight:   500;
  color:         var(--text-secondary);
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
  display:       block;
}
`