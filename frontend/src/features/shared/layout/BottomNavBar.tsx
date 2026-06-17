// components/mobile/BottomNavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LucideLayoutDashboard,
  LucideLink2,
  LucideMessageSquare,
  LucideCodeXml,
  LucideFileText,
} from '@/Icons/Icons';

const NAV_ITEMS = [
  { href: '/links',          label: 'Links',     icon: LucideLink2 },
  { href: '/snippets',       label: 'Snippets',  icon: LucideCodeXml },
  { href: '/dashboard',      label: 'Dashboard', icon: LucideLayoutDashboard },
  { href: '/prompts',        label: 'Prompts',   icon: LucideMessageSquare },
  { href: '/notes',          label: 'Notes',     icon: LucideFileText },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <>
      <style>{CSS}</style>
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={['bottom-nav-btn', active ? 'bottom-nav-btn--active' : ''].filter(Boolean).join(' ')}
              aria-label={item.label}
            >
              <Icon width={20} />
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

const CSS = `
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-default);
  padding: 8px 8px;
  justify-content: space-around;
  align-items: center;
  z-index: var(--z-sticky);
  backdrop-filter: blur(10px);
  background: rgba(var(--bg-surface-rgb), 0.95);
}

.bottom-nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  text-decoration: none;
  cursor: pointer;
  padding: 6px 2px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-size: 10px;
  font-weight: 500;
  min-width: 0;
}

.bottom-nav-btn:active {
  transform: scale(0.95);
  background: var(--bg-overlay);
  color: var(--text-primary);
}

.bottom-nav-btn--active {
  color: var(--text-accent);
}

.bottom-nav-label {
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (max-width: 767px) {
  .bottom-nav {
    display: flex;
  }

  /* Add padding to main content to account for bottom nav */
  .dashboard-page,
  main {
    padding-bottom: 80px !important;
  }
}

@media (max-width: 479px) {
  .bottom-nav {
    padding: 8px 4px;
  }

  .bottom-nav-btn svg {
    width: 18px;
    height: 18px;
  }

  .bottom-nav-label {
    font-size: 9px;
  }
}

@media (max-width: 359px) {
  .bottom-nav-label {
    font-size: 8px;
  }
}
`;
