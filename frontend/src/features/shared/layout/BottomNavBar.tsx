// components/mobile/BottomNavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SolarLinkMinimalisticBoldDuotone,
  SolarCodeSquareLineDuotone,
  SolarWidgetLineDuotone,
  HugeiconsCommandLine,
  SolarNotesLineDuotone,
  SolarRoundedMagniferLineDuotone,
} from "@/Icons/Icons";

const NAV_ITEMS = [
  { href: "/links", label: "Links", icon: SolarLinkMinimalisticBoldDuotone },
  { href: "/snippets", label: "Snippets", icon: SolarCodeSquareLineDuotone },
  { href: "/dashboard", label: "Dashboard", icon: SolarWidgetLineDuotone },
  { href: "/prompts", label: "Prompts", icon: HugeiconsCommandLine },
  { href: "/notes", label: "Notes", icon: SolarNotesLineDuotone },
  { href: "/search", label: "Search", icon: SolarRoundedMagniferLineDuotone },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  const activeIndex = NAV_ITEMS.findIndex(
    (item) => pathname?.startsWith(item.href) ?? false,
  );

  return (
    <>
      <style>{CSS}</style>
      <nav className="bn" aria-label="Primary">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const active = i === activeIndex;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={["bn-item", active ? "bn-item--active" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="bn-icon">
                <Icon width={20} />
              </span>
              <span className="bn-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

const CSS = `
.bn {
  display: none;
  position: fixed;
  left: 14px;
  right: 14px;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 7px;
  border-radius: 999px;
  background-color: var(--bg-surface);

  box-shadow:
    0 1px 0 0 rgba(255, 255, 255, 0.04) inset,
    0 12px 32px -10px rgba(0, 0, 0, 0.55),
    0 4px 12px -6px rgba(0, 0, 0, 0.4);
  z-index: var(--z-sticky);
}

/* --- Tab: icon-only by default --- */
.bn-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex: 0 1 auto;
  min-width: 0;
  padding: 11px;
  border-radius: 999px;
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    background 0.4s ease,
    color 0.3s ease,
    padding 0.45s cubic-bezier(0.34, 1.4, 0.64, 1),
    gap 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.bn-item:active {
  transform: scale(0.94);
}

.bn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Label is collapsed until the tab is active, then it slides open */
.bn-label {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-width 0.45s cubic-bezier(0.34, 1.4, 0.64, 1),
    opacity 0.3s ease;
}

/* --- Active tab: expanding accent capsule --- */
.bn-item--active {
  gap: 8px;
  padding: 11px 18px;
  color: var(--text-accent);
}

.bn-item--active .bn-icon {
  transform: scale(1.06);
}

.bn-item--active .bn-label {
  max-width: 120px;
  opacity: 1;
}

/* --- Show on mobile + offset page content for the floating bar --- */
@media (max-width: 767px) {
  .bn {
    display: flex;
  }
  .dashboard-page,
  main {
    // padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

@media (max-width: 479px) {
  .bn {
    left: 10px;
    right: 10px;
    gap: 2px;
  }
  .bn-item {
    padding: 10px;
  }
  .bn-item--active {
    padding: 10px 14px;
  }
  .bn-item svg {
    width: 19px;
    height: 19px;
  }
  .bn-item {
    font-size: 12px;
  }
}

@media (max-width: 359px) {
  .bn-item--active .bn-label {
    max-width: 0;
    opacity: 0;
  }
  .bn-item--active {
    padding: 10px;
    gap: 0;
  }
}

/* Respect reduced-motion preference */
@media (prefers-reduced-motion: reduce) {
  .bn-item,
  .bn-icon,
  .bn-label {
    transition: none;
  }
}
`;
