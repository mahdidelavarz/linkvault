// components/dashboard/ProfileMenuModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTheme } from '@/app/providers';
import {
  LucideLogOut,
  LucideMoon,
  LucideSettings,
  LucideSunDim,
  LucideUser,
  LucideUserCog,
  LucideX,
} from '@/Icons/Icons';

interface ProfileMenuModalProps {
  onClose: () => void;
}

export default function ProfileMenuModal({ onClose }: ProfileMenuModalProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore((s) => s);
  const { theme, toggleTheme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    onClose();
  };

  const menuItems = [
    {
      name: 'Profile',
      description: 'View and edit your profile',
      icon: LucideUserCog,
      onClick: () => {
        router.push('/profile');
        onClose();
      },
    },
    {
      name: 'Settings',
      description: 'App preferences and settings',
      icon: LucideSettings,
      onClick: () => {
        router.push('/settings');
        onClose();
      },
    },
    {
      name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: `Change theme to ${theme === 'dark' ? 'light' : 'dark'} mode`,
      icon: theme === 'dark' ? LucideSunDim : LucideMoon,
      onClick: () => {
        toggleTheme();
        onClose();
      },
    },
  ];

  if (showConfirmLogout) {
    return (
      <>
        <style>{CSS}</style>
        <div className="profile-overlay">
          <div className="profile-modal" ref={modalRef}>
            <div className="profile-header">
              <h3 className="profile-title">Sign Out</h3>
              <button
                className="profile-close"
                onClick={() => setShowConfirmLogout(false)}
                aria-label="Close"
              >
                <LucideX width={18} />
              </button>
            </div>
            
            <div className="confirm-logout-content">
              <p className="confirm-logout-message">
                Are you sure you want to sign out?
              </p>
              <div className="confirm-logout-actions">
                <button
                  className="confirm-logout-cancel"
                  onClick={() => setShowConfirmLogout(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-logout-confirm"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="profile-overlay">
        <div className="profile-modal" ref={modalRef}>
          {/* Header */}
          <div className="profile-header">
            <h3 className="profile-title">Profile</h3>
            <button
              className="profile-close"
              onClick={onClose}
              aria-label="Close"
            >
              <LucideX width={18} />
            </button>
          </div>

          {/* User Info */}
          <div className="profile-user-info">
            <div className="profile-avatar">
              <LucideUser width={24} />
            </div>
            <div className="profile-user-details">
              <p className="profile-username">{user?.username || 'User'}</p>
            </div>
          </div>

          <div className="profile-divider" />

          {/* Menu Items */}
          <div className="profile-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className="profile-menu-item"
                  onClick={item.onClick}
                >
                  <div className="profile-menu-icon">
                    <Icon width={18} />
                  </div>
                  <div className="profile-menu-content">
                    <span className="profile-menu-name">{item.name}</span>
                    <span className="profile-menu-description">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="profile-divider" />

          {/* Logout Button */}
          <button
            className="profile-logout-btn"
            onClick={() => setShowConfirmLogout(true)}
          >
            <LucideLogOut width={18} />
            <span>Sign Out</span>
          </button>

          {/* Version Info */}
          <p className="profile-version">LinkVault v1.0.0</p>
        </div>
      </div>
    </>
  );
}

const CSS = `
.profile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: calc(var(--z-modal) + 1);
  animation: fadeIn var(--transition-base) ease;
}

.profile-modal {
  background: var(--bg-elevated);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-width: 500px;
  animation: slideUp var(--transition-base) ease;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  max-height: 85vh;
  overflow-y: auto;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  position: sticky;
  top: 0;
  background: var(--bg-elevated);
  z-index: 1;
}

.profile-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.profile-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.profile-close:hover {
  background: var(--bg-overlay);
  color: var(--text-primary);
}

/* User Info */
.profile-user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 20px 20px;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--accent-muted);
  border: 2px solid var(--accent-border);
  border-radius: var(--radius-full);
  color: var(--cyan-400);
}

.profile-user-details {
  flex: 1;
}

.profile-username {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.profile-email {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.profile-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 8px 0;
}

/* Menu Items */
.profile-menu {
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
  text-align: left;
  width: 100%;
}

.profile-menu-item:hover {
  background: var(--bg-overlay);
}

.profile-menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.profile-menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-menu-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.profile-menu-description {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Logout Button */
.profile-logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 32px);
  margin: 12px 16px;
  padding: 12px;
  background: var(--danger-muted);
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-lg);
  color: var(--danger);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.profile-logout-btn:hover {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}

.profile-version {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  padding: 16px 20px 24px;
  margin: 0;
}

/* Confirm Logout Styles */
.confirm-logout-content {
  padding: 20px;
}

.confirm-logout-message {
  font-size: var(--text-sm);
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 24px;
}

.confirm-logout-actions {
  display: flex;
  gap: 12px;
}

.confirm-logout-cancel,
.confirm-logout-confirm {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.confirm-logout-cancel {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
}

.confirm-logout-cancel:hover {
  background: var(--bg-overlay);
  color: var(--text-primary);
}

.confirm-logout-confirm {
  background: var(--danger);
  border: none;
  color: white;
}

.confirm-logout-confirm:hover {
  background: var(--danger-hover);
  transform: translateY(-1px);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (min-width: 768px) {
  .profile-overlay {
    align-items: center;
  }
  
  .profile-modal {
    border-radius: var(--radius-xl);
    max-width: 400px;
    animation: scaleIn var(--transition-base) ease;
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
}
`;