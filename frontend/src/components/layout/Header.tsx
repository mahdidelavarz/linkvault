"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/app/providers";
import {
  LucideChevronDown,
  LucideLogOut,
  LucideMoon,
  LucideSearch,
  LucideSunDim,
  LucideUser,
} from "@/Icons/Icons";

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Ctrl+K → search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <style>{CSS}</style>
      <header className="header">
        {/* Left — search */}
        <div className="header-left">
          <button
            className="header-search"
            onClick={() => router.push("/search")}
            aria-label="Open search"
          >
            <LucideSearch className="header-search-icon" />
            <span className="header-search-text">Search anything…</span>
            <kbd className="header-kbd">⌘K</kbd>
          </button>
        </div>

        {/* Right — actions */}
        <div className="header-right">
          {/* Theme toggle */}
          <button
            className="header-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <LucideSunDim width={16} />
            ) : (
              <LucideMoon width={16} />
            )}
          </button>

          {/* Divider */}
          <div className="header-divider" />

          {/* User menu */}
          <div className="header-user-wrap" ref={menuRef}>
            <button
              className="header-user-btn"
              onClick={() => setMenuOpen((p) => !p)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <div className="header-avatar">
                <LucideUser width={13} />
              </div>
              <span className="header-username">
                {user?.username ?? "User"}
              </span>
              <LucideChevronDown
                width={13}
                className={[
                  "header-chevron",
                  menuOpen ? "header-chevron--open" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </button>

            {menuOpen && (
              <div className="header-dropdown" role="menu">
                <div className="header-dropdown-user">
                  <div className="header-dropdown-avatar">
                    <LucideUser width={16} />
                  </div>
                  <div>
                    <p className="header-dropdown-name">{user?.username}</p>
                    <p className="header-dropdown-role">Personal Vault</p>
                  </div>
                </div>

                <div className="header-dropdown-divider" />

                <button
                  className="header-dropdown-item header-dropdown-item--danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LucideLogOut width={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             16px;
  height:          56px;
  padding:         0 20px;
  background:      var(--bg-surface);
  border-bottom:   1px solid var(--border-default);
  position:        sticky;
  top:             0;
  z-index:         var(--z-sticky);
  flex-shrink:     0;
}

/* Left */
.header-left { display: flex; align-items: center; flex: 1; }

.header-search {
  display:       flex;
  align-items:   center;
  gap:           8px;
  height:        34px;
  padding:       0 12px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-tertiary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  cursor:        pointer;
  max-width:     360px;
  width:         100%;
  text-align:    left;
  transition:    border-color var(--transition-fast),
                 background   var(--transition-fast);
}
.header-search:hover {
  border-color: var(--border-strong);
  background:   var(--bg-elevated);
}
.header-search-icon {
  width:      14px;
  height:     14px;
  flex-shrink: 0;
}
.header-search-text {
  flex: 1;
  white-space: nowrap;
  overflow:    hidden;
}
.header-kbd {
  display:       inline-flex;
  align-items:   center;
  padding:       1px 6px;
  font-size:     10px;
  font-family:   var(--font-mono);
  color:         var(--text-tertiary);
  background:    var(--bg-overlay);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-sm);
  white-space:   nowrap;
}

/* Right */
.header-right {
  display:     flex;
  align-items: center;
  gap:         6px;
  flex-shrink: 0;
}

.header-icon-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           32px;
  height:          32px;
  background:      transparent;
  border:          1px solid transparent;
  border-radius:   var(--radius-md);
  color:           var(--text-secondary);
  cursor:          pointer;
  transition:      background var(--transition-fast),
                   color      var(--transition-fast),
                   border-color var(--transition-fast);
}
.header-icon-btn:hover {
  background:   var(--bg-overlay);
  border-color: var(--border-default);
  color:        var(--text-primary);
}

.header-divider {
  width:      1px;
  height:     20px;
  background: var(--border-default);
  margin:     0 2px;
}

/* User button */
.header-user-wrap { position: relative; }

.header-user-btn {
  display:       flex;
  align-items:   center;
  gap:           7px;
  height:        32px;
  padding:       0 10px 0 6px;
  background:    transparent;
  border:        1px solid transparent;
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  transition:    background var(--transition-fast),
                 border-color var(--transition-fast),
                 color var(--transition-fast);
}
.header-user-btn:hover {
  background:   var(--bg-overlay);
  border-color: var(--border-default);
  color:        var(--text-primary);
}
.header-avatar {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           24px;
  height:          24px;
  background:      var(--accent-muted);
  border:          1px solid var(--accent-border);
  border-radius:   var(--radius-full);
  color:           var(--cyan-400);
  flex-shrink:     0;
}
.header-username {
  max-width:     120px;
  overflow:      hidden;
  text-overflow: ellipsis;
  white-space:   nowrap;
}
.header-chevron {
  color:      var(--text-tertiary);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}
.header-chevron--open { transform: rotate(180deg); }

/* Dropdown */
.header-dropdown {
  position:      absolute;
  top:           calc(100% + 6px);
  right:0;
  min-width:     200px;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow:    var(--shadow-lg);
  overflow:      hidden;
  z-index:       var(--z-dropdown);
  animation:     fadeInDown var(--transition-fast) ease both;
}
.header-dropdown-user {
  display:     flex;
  align-items: center;
  gap:         10px;
  padding:     12px 14px;
}
.header-dropdown-avatar {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           34px;
  height:          34px;
  background:      var(--accent-muted);
  border:          1px solid var(--accent-border);
  border-radius:   var(--radius-full);
  color:           var(--cyan-400);
  flex-shrink:     0;
}
.header-dropdown-name {
  font-size:   var(--text-sm);
  font-weight: 600;
  color:       var(--text-primary);
  line-height: 1.2;
}
.header-dropdown-role {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
  margin-top: 1px;
}
.header-dropdown-divider {
  height:     1px;
  background: var(--border-subtle);
  margin:     0;
}
.header-dropdown-item {
  display:       flex;
  align-items:   center;
  gap:           8px;
  width:         100%;
  padding:       9px 14px;
  background:    transparent;
  border:        none;
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  color:         var(--text-secondary);
  cursor:        pointer;
  text-align:    left;
  transition:    background var(--transition-fast),
                 color      var(--transition-fast);
}
.header-dropdown-item:hover { background: var(--bg-overlay); }
.header-dropdown-item--danger       { color: var(--danger); }
.header-dropdown-item--danger:hover { background: var(--danger-muted); }
`;
