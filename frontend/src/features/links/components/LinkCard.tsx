"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Link as LinkType } from "@/features/links/types/link";
import { useToggleFavorite } from "@/features/links/hooks/useLinks";
import { CredentialsSection } from "@/features/links/components/LinkCredentials";
import FavoriteButton from "@/features/shared/components/FavoriteButton";
import TagSection from "@/features/shared/components/TagSection";
import ProjectBadge from "@/features/projects/components/ProjectBadge";
import {
  LucideCheck,
  LucideCopy,
  LucideExternalLink,
} from "@/Icons/Icons";

interface LinkCardProps {
  link: LinkType;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}

export default function LinkCard({
  link,
  isSelectMode = false, isSelected = false, onToggleSelect,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const toggleFavorite = useToggleFavorite();

  const hostname = (() => {
    try { return new URL(link.url).hostname.replace("www.", ""); }
    catch { return link.url; }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  const hasCredentials = link.username || link.email || link.phone || link.passwordEncrypted;

  const goToDetail = () => router.push(`/links/${link.id}`);
  const handleCardClick = () => { isSelectMode ? onToggleSelect?.(link.id) : goToDetail(); };

  return (
    <>
      <style>{CSS}</style>

      <div
        className={["lcard", isSelectMode ? "lcard--selectable" : "", isSelected ? "lcard--selected" : ""].filter(Boolean).join(" ")}
        onClick={handleCardClick}
        role={isSelectMode ? "checkbox" : "button"}
        aria-checked={isSelectMode ? isSelected : undefined}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleCardClick(); } }}
      >
        {/* Selection checkbox */}
        {isSelectMode && (
          <div className={["lcard-checkbox", isSelected ? "lcard-checkbox--checked" : ""].filter(Boolean).join(" ")}>
            {isSelected && <LucideCheck width={10} />}
          </div>
        )}

        {/* Top row */}
        <div className="lcard-top">
          <div className="lcard-favicon">
            <img src={faviconUrl} alt="" width={16} height={16}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="lcard-info">
            <button className="lcard-title"
              onClick={(e) => {
                e.stopPropagation();
                if (isSelectMode) { onToggleSelect?.(link.id); return; }
                window.open(link.url, "_blank", "noopener,noreferrer");
              }}
            >{link.title}</button>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="lcard-url" title={link.url}
              onClick={(e) => {
                e.stopPropagation();
                if (isSelectMode) { e.preventDefault(); onToggleSelect?.(link.id); }
              }}
            >{hostname}</a>
          </div>
          {!isSelectMode && (
            <FavoriteButton
              active={link.isFavorite}
              pending={toggleFavorite.isPending}
              onToggle={() => toggleFavorite.mutate(link.id)}
            />
          )}
        </div>

        {/* Description */}
        {link.description && <p className="lcard-desc">{link.description}</p>}

        {/* Credentials */}
        {hasCredentials && (
          <CredentialsSection link={link} isSelectMode={isSelectMode} />
        )}

        {/* Tags & category */}
        <TagSection tags={link.tags} category={link.category} />

        {/* Footer */}
        {!isSelectMode && (
          <div className="lcard-footer">
            <ProjectBadge itemType="link" itemId={link.id} />
            <div className="lcard-quick-actions">
              <button className={["lcard-icon-btn", copied ? "lcard-icon-btn--copied" : ""].filter(Boolean).join(" ")}
                onClick={handleCopyUrl} aria-label="Copy URL" type="button" title={copied ? "Copied!" : "Copy URL"}
              >
                {copied ? <LucideCheck width={14} /> : <LucideCopy width={14} />}
              </button>
              <button className="lcard-icon-btn"
                onClick={(e) => { e.stopPropagation(); window.open(link.url, "_blank", "noopener,noreferrer"); }}
                aria-label="Open link" type="button" title="Open link"
              >
                <LucideExternalLink width={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const CSS = `
.lcard {
  display: flex; flex-direction: column; gap: 12px;
  padding: 14px 16px;
  background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  cursor: pointer; user-select: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
  width: 100%; min-width: 0; overflow: hidden; box-sizing: border-box; position: relative;
}
.lcard:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.lcard:active { opacity: 0.85; }
@media (max-width: 479px) { .lcard { padding: 12px; gap: 10px; } }

.lcard--selected { border-color: var(--accent-border); background: var(--accent-muted); box-shadow: 0 0 0 1px var(--accent-border); }

.lcard-checkbox {
  position: absolute; top: 10px; left: 10px;
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px;
  border: 2px solid var(--border-strong); border-radius: var(--radius-sm);
  background: var(--bg-surface); z-index: 2; pointer-events: none;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.lcard-checkbox--checked { background: var(--accent); border-color: var(--accent); color: #fff; }
.lcard--selectable .lcard-top { padding-left: 28px; }

.lcard-top    { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
.lcard-favicon {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; min-width: 30px;
  background: var(--bg-overlay); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); flex-shrink: 0; overflow: hidden;
}
.lcard-info  { flex: 1; min-width: 0; overflow: hidden; }
.lcard-title {
  display: block; width: 100%; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);
  text-align: left; background: none; border: none; cursor: pointer; padding: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-family: var(--font-sans); transition: color var(--transition-fast); line-height: 1.4;
}
.lcard-title:hover { color: var(--text-accent); }
.lcard-url {
  display: block; font-size: var(--text-xs); color: var(--text-tertiary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 2px; text-decoration: none; transition: color var(--transition-fast);
}
.lcard-url:hover { color: var(--text-accent); }

.lcard-desc {
  font-size: var(--text-xs); color: var(--text-secondary); line-height: var(--leading-snug);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; word-break: break-word;
}

.lcard-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding-top: 10px; border-top: 1px solid var(--border-subtle); margin-top: auto; min-width: 0;
}
.lcard-quick-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.lcard-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  background: transparent; border: 1px solid transparent; border-radius: var(--radius-sm);
  color: var(--text-tertiary); cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
@media (hover: none) { .lcard-icon-btn { width: 40px; height: 40px; } }
.lcard-icon-btn:hover { background: var(--bg-overlay); border-color: var(--border-default); color: var(--text-primary); }
.lcard-icon-btn--copied { color: var(--success) !important; }
`;
