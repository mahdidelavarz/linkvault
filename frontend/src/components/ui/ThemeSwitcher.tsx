// components/ThemeSwitcher.tsx
"use client";

import { useState, useEffect } from "react";

import {
  LucideCheck,
  SolarPaletteRoundBoldDuotone,
  LucideX,
} from "@/Icons/Icons";
import { ThemeName, themes } from "@/lib/theme";

interface ThemeSwitcherProps {
  onClose?: () => void;
}

export default function ThemeSwitcher({ onClose }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("default");
  const [isOpen, setIsOpen] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-palette") as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (themeName: ThemeName) => {
    const theme = themes[themeName];
    const root = document.documentElement;

    // Update CSS variables
    root.style.setProperty("--accent", theme.colors.accent);
    root.style.setProperty("--accent-hover", theme.colors.accentHover);
    root.style.setProperty("--accent-muted", theme.colors.accentMuted);
    root.style.setProperty("--accent-subtle", theme.colors.accentSubtle);
    root.style.setProperty("--accent-border", theme.colors.accentBorder);

    // Update cyan palette
    root.style.setProperty("--cyan-50", theme.colors.cyan50);
    root.style.setProperty("--cyan-100", theme.colors.cyan100);
    root.style.setProperty("--cyan-200", theme.colors.cyan200);
    root.style.setProperty("--cyan-300", theme.colors.cyan300);
    root.style.setProperty("--cyan-400", theme.colors.cyan400);
    root.style.setProperty("--cyan-500", theme.colors.cyan500);
    root.style.setProperty("--cyan-600", theme.colors.cyan600);
    root.style.setProperty("--cyan-700", theme.colors.cyan700);
    root.style.setProperty("--cyan-800", theme.colors.cyan800);
    root.style.setProperty("--cyan-900", theme.colors.cyan900);

    // Update semantic colors that use accent
    root.style.setProperty("--text-accent", theme.colors.cyan400);
    root.style.setProperty("--info", theme.colors.accent);
    root.style.setProperty("--info-muted", theme.colors.accentMuted);
    root.style.setProperty("--border-focus", theme.colors.accent);
    root.style.setProperty(
      "--shadow-accent",
      `0 0 0 1px ${theme.colors.accent}, 0 4px 16px ${theme.colors.accent}26`,
    );
    root.style.setProperty(
      "--shadow-glow",
      `0 0 24px ${theme.colors.accent}33`,
    );

    // Save to localStorage
    localStorage.setItem("theme-palette", themeName);
    setCurrentTheme(themeName);
  };

  const handleThemeChange = (themeName: ThemeName) => {
    applyTheme(themeName);
    if (onClose) onClose();
    setIsOpen(false);
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Theme Button */}
      <button
        className="theme-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
      >
        <SolarPaletteRoundBoldDuotone width={18} />
      </button>

      {/* Theme Dropdown/Modal */}
      {isOpen && (
        <>
          <div className="theme-overlay" onClick={() => setIsOpen(false)} />
          <div className="theme-dropdown">
            <div className="theme-header">
              <h3 className="theme-title">Color Palettes</h3>
              <button className="theme-close" onClick={() => setIsOpen(false)}>
                <LucideX width={16} />
              </button>
            </div>

            <div className="theme-grid">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`theme-item ${currentTheme === key ? "theme-item--active" : ""}`}
                  onClick={() => handleThemeChange(key as ThemeName)}
                >
                  <div className="theme-preview">
                    <div
                      className="theme-preview-color"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <div className="theme-preview-colors">
                      <div
                        className="theme-preview-dot"
                        style={{ backgroundColor: theme.colors.cyan400 }}
                      />
                      <div
                        className="theme-preview-dot"
                        style={{ backgroundColor: theme.colors.cyan500 }}
                      />
                      <div
                        className="theme-preview-dot"
                        style={{ backgroundColor: theme.colors.cyan600 }}
                      />
                    </div>
                  </div>
                  <div className="theme-info">
                    <span className="theme-label">{theme.label}</span>
                    {currentTheme === key && (
                      <LucideCheck width={14} className="theme-check" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

const CSS = `
.theme-switcher-btn {
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

.theme-switcher-btn:hover {
  background: var(--bg-overlay);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.theme-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-dropdown);
  animation: fadeIn var(--transition-fast) ease;
}

.theme-dropdown {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: calc(var(--z-dropdown) + 1);
  overflow: hidden;
  animation: scaleIn var(--transition-base) ease;
}

.theme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.theme-title {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.theme-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-close:hover {
  background: var(--bg-overlay);
  color: var(--text-primary);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.theme-item:hover {
  background: var(--bg-overlay);
  border-color: var(--border-strong);
}

.theme-item--active {
  border-color: var(--accent);
  background: var(--accent-muted);
}

.theme-preview {
  display: flex;
  align-items: center;
  gap: 6px;
}

.theme-preview-color {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.theme-preview-colors {
  display: flex;
  gap: 3px;
}

.theme-preview-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.theme-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.theme-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.theme-check {
  color: var(--accent);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .theme-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
`;
