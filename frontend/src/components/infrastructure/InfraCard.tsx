"use client";

import { ComponentType, SVGProps, useState, useEffect } from "react";
import { type Infrastructure, INFRA_TYPES } from "@/types/infrastructure";
import {
  useToggleInfraFavorite,
  useDeleteInfrastructure,
} from "@/hooks/useInfrastructure";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/components/shared/FavoriteButton";
import CopyButton from "@/components/shared/CopyButton";
import ActionButtons from "@/components/shared/ActionButtons";
import TagSection from "@/components/shared/TagSection";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";
import { VaultGuard } from "@/components/vault/VaultGuard";
import { useVault } from "@/hooks/useVault";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideContainer,
  LucideCopy,
  LucideDatabase,
  LucideEye,
  LucideEyeOff,
  LucideFolder,
  LucideGlobe,
  LucideKeyRound,
  LucideNetwork,
  LucidePencil,
  LucideRocket,
  LucideServer,
  LucideSettings,
  LucideStar,
  LucideTrash2,
} from "@/Icons/Icons";

// ─── Type → Iconify icon map ──────────────────────────────────────────────────

const INFRA_ICONS = {
  env: LucideKeyRound,
  server: LucideServer,
  docker: LucideContainer,
  deployment: LucideRocket,
  database: LucideDatabase,
  network: LucideNetwork,
} as const;

type InfraIconKey = keyof typeof INFRA_ICONS;

const INFRA_BADGE_VARIANT: Record<string, any> = {
  env: "cyan",
  server: "purple",
  docker: "cyan",
  deployment: "success",
  database: "warning",
  network: "orange",
};

// ENV vars: mask values by default
function maskEnvLine(line: string) {
  const eq = line.indexOf("=");
  if (eq === -1) return line;
  const key = line.slice(0, eq + 1);
  const val = line.slice(eq + 1);
  if (!val) return line;
  return key + "•".repeat(Math.min(val.length, 12));
}

interface InfraCardProps {
  item: Infrastructure;
  onEdit: (item: Infrastructure) => void;
}

export default function InfraCard({ item, onEdit }: InfraCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [vaultContent, setVaultContent] = useState<string | null>(null);

  const { isEnabled, isUnlocked, decrypt } = useVault();
  const toggleFav = useToggleInfraFavorite();
  const deleteInfra = useDeleteInfrastructure();

  const typeConfig = INFRA_TYPES[item.infraType];
  const Icon = INFRA_ICONS[item.infraType as InfraIconKey] ?? (
    <LucideSettings />
  );
  const badgeVar = INFRA_BADGE_VARIANT[item.infraType] ?? "default";
  const isEnv = item.infraType === "env";

  const isVaultProtected = isEnv && isEnabled &&
    (!item.content || item.content === 'vault:encrypted');

  useEffect(() => {
    if (!isVaultProtected || !isUnlocked) { setVaultContent(null); return; }
    decrypt('infrastructure', String(item.id), 'content').then(v => setVaultContent(v));
  }, [isUnlocked, isVaultProtected, item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Use decrypted content if available; fall back to stored content
  const displayContent = isVaultProtected ? (vaultContent ?? '') : item.content;

  // Preview: first 5 lines
  const allLines = displayContent.split("\n");
  const previewLines = allLines.slice(0, 5);
  const hasMore = allLines.length > 5;

  const displayLines =
    isEnv && !revealed ? previewLines.map(maskEnvLine) : previewLines;

  return (
    <>
      <style>{CSS}</style>
      <div className="ic">
        {/* ── Header ── */}
        <div className="ic-header">
          <div className="ic-icon-wrap">
            <Icon width={16} />
          </div>

          <div className="ic-title-wrap">
            <h3 className="ic-title">{item.title}</h3>
            <div className="ic-meta">
              <Badge variant={badgeVar} size="sm">
                {typeConfig?.label ?? item.infraType}
              </Badge>
              {item.metadata?.environment && (
                <Badge
                  variant={
                    item.metadata.environment === "production"
                      ? "danger"
                      : item.metadata.environment === "staging"
                        ? "warning"
                        : "default"
                  }
                  size="sm"
                >
                  {item.metadata.environment}
                </Badge>
              )}
              {item.metadata?.host && (
                <span className="ic-host">
                  <LucideGlobe width={11} />
                  {item.metadata.host}
                  {item.metadata.port ? `:${item.metadata.port}` : ""}
                </span>
              )}
            </div>
          </div>

          <FavoriteButton
            active={item.isFavorite}
            pending={toggleFav.isPending}
            onToggle={() => toggleFav.mutate(item.id)}
          />
        </div>

        {/* ── Description ── */}
        {item.description && <p className="ic-desc">{item.description}</p>}

        {/* ── Content preview ── */}
        {/* Guard ALL env items when vault is enabled — not just vault-encrypted ones */}
        <VaultGuard enabled={isEnv && isEnabled}>
          <div className="ic-code-wrap">
            {/* ENV reveal toggle */}
            {isEnv && (
              <button
                className="ic-reveal-btn"
                onClick={() => setRevealed((p) => !p)}
                aria-label={revealed ? "Mask values" : "Reveal values"}
              >
                {revealed ? (
                  <LucideEyeOff width={12} />
                ) : (
                  <LucideEye width={12} />
                )}
                {revealed ? "Mask" : "Reveal"}
              </button>
            )}

            <pre
              className={["ic-code", expanded ? "ic-code--expanded" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <code>
                {expanded
                  ? (isEnv && !revealed
                      ? allLines.map(maskEnvLine)
                      : allLines
                    ).join("\n")
                  : displayLines.join("\n")}
              </code>
            </pre>

            {hasMore && (
              <button
                className="ic-expand-btn"
                onClick={() => setExpanded((p) => !p)}
              >
                {expanded ? (
                  <LucideChevronUp width={12} />
                ) : (
                  <LucideChevronDown width={12} />
                )}

                {expanded ? "Show less" : `${allLines.length - 5} more lines`}
              </button>
            )}
          </div>
        </VaultGuard>

        {/* ── Tags ── */}
        <TagSection tags={item.tags} category={item.category} />

        {/* ── Footer: copy + actions ── */}
        <div className="ic-footer">
          {!(isEnv && isEnabled && !isUnlocked) && (
            <CopyButton text={displayContent} label="Copy" />
          )}
          <ActionButtons onEdit={() => onEdit(item)} onDelete={() => setConfirmDelete(true)} />
          <span className="ic-date">
            {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        itemName={item.title}
        isLoading={deleteInfra.isPending}
        onConfirm={() => deleteInfra.mutate(item.id, { onSuccess: () => setConfirmDelete(false) })}
      />
    </>
  );
}

const CSS = `
.ic {
  display:        flex;
  flex-direction: column;
  gap:            12px;
  padding:        16px;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
  transition:     border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.ic:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }

/* Header */
.ic-header    { display: flex; align-items: flex-start; gap: 10px;}
.ic-icon-wrap {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           34px; height: 34px;
  background:      var(--accent-muted);
  border:          1px solid var(--accent-border);
  border-radius:   var(--radius-md);
  color:           var(--cyan-400);
  flex-shrink:     0;
}
.ic-title-wrap { flex: 1; min-width: 0; }
.ic-title      { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
.ic-meta       { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
.ic-host       { display: flex; align-items: center; gap: 3px; font-size: var(--text-xs); color: var(--text-tertiary); font-family: var(--font-mono); }

.ic-fav {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; flex-shrink: 0;
  background: transparent; border: none; border-radius: var(--radius-sm);
  color: var(--text-tertiary); cursor: pointer;
  transition: color var(--transition-fast), transform var(--transition-fast);
}
.ic-fav:hover   { color: #fbbf24; transform: scale(1.15); }
.ic-fav--active { color: #fbbf24; }
.ic-fav:disabled{ opacity: 0.5; pointer-events: none; }

/* Description */
.ic-desc {
  font-size: var(--text-xs); color: var(--text-secondary);
  line-height: var(--leading-snug);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* Code block */
.ic-code-wrap {
  position:      relative;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow:      hidden;
}
.ic-reveal-btn {
  display:     flex;
  align-items: center;
  gap:         4px;
  position:    absolute;
  top:         7px; right: 8px;
  font-size:   10px; font-family: var(--font-sans); font-weight: 500;
  color:       var(--text-tertiary);
  background:  var(--bg-overlay);
  border:      1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding:     2px 8px;
  cursor:      pointer;
  z-index:     1;
  transition:  color var(--transition-fast), background var(--transition-fast);
}
.ic-reveal-btn:hover { color: var(--text-primary); background: var(--bg-subtle); }

.ic-code {
  display:     block;
  padding:     10px 12px;
  margin:      0;
  font-family: var(--font-mono);
  font-size:   var(--text-xs);
  line-height: var(--leading-relaxed);
  color:       var(--cyan-200);
  white-space: pre;
  overflow-x:  auto;
  max-height:  120px;
  overflow-y:  hidden;
  transition:  max-height var(--transition-slow);
}
.ic-code--expanded { max-height: 360px; overflow-y: auto; }
.ic-code::-webkit-scrollbar { width: 4px; height: 4px; }
.ic-code::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

.ic-expand-btn {
  display:     flex; align-items: center; gap: 4px;
  width:       100%; padding: 5px 12px;
  background:  var(--bg-overlay);
  border:      none; border-top: 1px solid var(--border-subtle);
  color:       var(--text-tertiary);
  font-size:   var(--text-xs); font-family: var(--font-sans);
  cursor:      pointer;
  transition:  color var(--transition-fast), background var(--transition-fast);
}
.ic-expand-btn:hover { color: var(--text-primary); background: var(--bg-subtle); }

/* Tags */
.ic-tags      { display: flex; flex-wrap: wrap; gap: 5px; }
.ic-tags-more { font-size: var(--text-xs); color: var(--text-tertiary); align-self: center; }

/* Footer */
.ic-footer {
  display:     flex; align-items: center; gap: 8px;
  padding-top: 12px;
  border-top:  1px solid var(--border-subtle);
}
.ic-copy-btn {
  display:       flex; align-items: center; gap: 6px;
  height:        34px; padding: 0 14px;
  background:    var(--bg-overlay); border: 1px solid var(--border-default);
  border-radius: var(--radius-md); color: var(--text-secondary);
  font-size:     var(--text-sm); font-family: var(--font-sans); font-weight: 500;
  cursor:        pointer; min-height: 44px;
  transition:    background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.ic-copy-btn:hover      { background: var(--accent-muted); border-color: var(--border-focus); color: var(--cyan-300); }
.ic-copy-btn--copied    { background: var(--success-muted); border-color: rgba(16,185,129,0.3); color: #34d399; }

.ic-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.ic-action-btn {
  display:         flex; align-items: center; justify-content: center;
  min-width:       44px; min-height: 44px;
  background:      transparent; border: 1px solid transparent;
  border-radius:   var(--radius-md); color: var(--text-tertiary); cursor: pointer;
  transition:      background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.ic-action-btn:hover         { background: var(--bg-overlay); border-color: var(--border-default); color: var(--text-primary); }
.ic-action-btn--danger:hover { background: var(--danger-muted); border-color: rgba(239,68,68,0.2); color: var(--danger); }

.ic-date { font-size: var(--text-xs); color: var(--text-tertiary); white-space: nowrap; }

.ic-confirm         { display: flex; flex-direction: column; gap: 20px; }
.ic-confirm-text    { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); }
.ic-confirm-text strong { color: var(--text-primary); }
.ic-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;
