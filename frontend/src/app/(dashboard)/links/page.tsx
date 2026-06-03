"use client";

import { useState, useCallback } from "react";
import { useLinks, useDeleteLink, useUpdateLink } from "@/hooks/useLinks";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCategories } from "@/hooks/useCategories";
import { type Link } from "@/types/link";
import LinkCard from "@/components/links/LinkCard";
import LinkForm from "@/components/links/LinkForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  LucideCheck,
  LucideChevronDown,
  LucideFolder,
  LucideLink2,
  LucidePlus,
  LucideSearch,
  LucideSearchX,
  LucideStar,
  LucideTrash2,
  LucideX,
} from "@/Icons/Icons";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinksPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  // ── Selection state ──────────────────────────────────────────────────────
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const deleteLink = useDeleteLink();
  const updateLink = useUpdateLink();

  const { data: categories } = useCategories();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLinks({
    search: search || undefined,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    isFavorite: showFavorites || undefined,
  });
  const links = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const onReach = useCallback(() => { if (hasNextPage) fetchNextPage(); }, [hasNextPage, fetchNextPage]);
  const sentinelRef = useInfiniteScroll(onReach, !!hasNextPage && !isLoading);

  const hasFilters = !!(search || categoryId || showFavorites);

  // ── Navigation handlers ──────────────────────────────────────────────────
  const openCreate = () => {
    exitSelectMode();
    setEditingLink(null);
    setModalOpen(true);
  };
  const openEdit = (link: Link) => {
    setEditingLink(link);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingLink(null);
  };
  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setShowFavorites(false);
  };

  // ── Selection handlers ───────────────────────────────────────────────────
  const enterSelectMode = () => {
    setIsSelectMode(true);
    setSelectedIds(new Set());
  };
  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const isAllSelected = links.length > 0 && links.every((l) => selectedIds.has(l.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(links.map((l) => l.id)));
    }
  };

  // ── Bulk actions ─────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all([...selectedIds].map((id) => deleteLink.mutateAsync(id)));
      exitSelectMode();
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkFavorite = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => updateLink.mutateAsync({ id, isFavorite: true }))
      );
      exitSelectMode();
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="links-page">

        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Links</h1>
            <p className="page-subtitle">
              {isLoading ? "…" : `${total} saved`}
            </p>
          </div>
          {!isSelectMode && (
            <Button leftIcon={LucidePlus} onClick={openCreate}>
              Add Link
            </Button>
          )}
        </div>

        {/* ── Filters bar / Select bar ── */}
        {isSelectMode ? (
          <div className="select-bar">
            {/* Select all toggle */}
            <button
              className={["select-all-btn", isAllSelected ? "select-all-btn--checked" : ""].filter(Boolean).join(" ")}
              onClick={toggleSelectAll}
              aria-label={isAllSelected ? "Deselect all" : "Select all"}
            >
              <span className={["scheck", isAllSelected ? "scheck--checked" : ""].filter(Boolean).join(" ")}>
                {isAllSelected && <LucideCheck width={10} />}
              </span>
              <span className="select-all-label">
                {isAllSelected ? "Deselect all" : "Select all"}
              </span>
            </button>

            <span className="select-count">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Tap cards to select"}
            </span>

            <button className="select-cancel" onClick={exitSelectMode}>
              <LucideX width={14} />
              Cancel
            </button>
          </div>
        ) : (
          <div className="filters-bar">
            {/* Search */}
            <div className="filter-search-wrap">
              <LucideSearch className="filter-search-icon" />
              <input
                className="filter-search"
                type="text"
                placeholder="Search links…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="filter-search-clear" onClick={() => setSearch("")} aria-label="Clear">
                  <LucideX width={12} />
                </button>
              )}
            </div>

            {/* Category select */}
            <div className="filter-select-wrap">
              <LucideFolder className="filter-select-icon" />
              <select className="filter-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">All categories</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <LucideChevronDown className="filter-select-chevron" />
            </div>

            {/* Favorites toggle */}
            <button
              className={["filter-toggle", showFavorites ? "filter-toggle--active" : ""].filter(Boolean).join(" ")}
              onClick={() => setShowFavorites((p) => !p)}
            >
              <LucideStar width={14} />
              Favorites
            </button>

            {/* Clear */}
            {hasFilters && (
              <button className="filter-clear" onClick={clearFilters}>
                <LucideX width={13} />
                Clear
              </button>
            )}

            {/* Select mode toggle */}
            {links.length > 0 && (
              <button className="filter-select-mode" onClick={enterSelectMode}>
                <span className="scheck scheck--sm" />
                Select
              </button>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {isLoading ? (
          <div className="links-grid">
            {[...Array(6)].map((_, i) => <LinkCardSkeleton key={i} />)}
          </div>
        ) : links.length > 0 ? (
          <>
            <div className="links-grid">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={openEdit}
                  isSelectMode={isSelectMode}
                  isSelected={selectedIds.has(link.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isFetchingNextPage && (
              <div className="links-grid">
                {[...Array(3)].map((_, i) => <LinkCardSkeleton key={i} />)}
              </div>
            )}
          </>
        ) : (
          <EmptyState hasFilters={hasFilters} onAdd={openCreate} onClear={clearFilters} />
        )}

        {/* Extra bottom padding when bulk bar is visible so last card isn't hidden */}
        {selectedIds.size > 0 && <div style={{ height: 80 }} />}
      </div>

      {/* ── Bulk action bar ── */}
      {selectedIds.size > 0 && (
        <div className="bulk-bar" role="toolbar" aria-label="Bulk actions">
          <span className="bulk-count">{selectedIds.size} link{selectedIds.size !== 1 ? "s" : ""} selected</span>
          <div className="bulk-actions">
            <button
              className="bulk-btn bulk-btn--fav"
              onClick={handleBulkFavorite}
              disabled={isBulkProcessing}
              aria-label="Favorite selected"
            >
              <LucideStar width={15} />
              <span className="bulk-btn-label">Favorite</span>
            </button>
            <button
              className="bulk-btn bulk-btn--delete"
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
              aria-label={`Delete ${selectedIds.size} links`}
            >
              {isBulkProcessing ? (
                <span className="bulk-spinner" />
              ) : (
                <LucideTrash2 width={15} />
              )}
              <span className="bulk-btn-label">Delete {selectedIds.size}</span>
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingLink ? "Edit Link" : "Add Link"} size="lg">
        <LinkForm link={editingLink} onClose={closeModal} />
      </Modal>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LinkCardSkeleton() {
  return (
    <div className="link-skeleton">
      <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 13, width: "50%", marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 99 }} />
        <div className="skeleton" style={{ height: 22, width: 55, borderRadius: 99 }} />
      </div>
      <div className="skeleton" style={{ height: 32, width: "100%", borderRadius: 8 }} />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onAdd, onClear }: { hasFilters: boolean; onAdd: () => void; onClear: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {hasFilters ? <LucideSearchX width={28} /> : <LucideLink2 width={28} />}
      </div>
      <p className="empty-title">{hasFilters ? "No links found" : "No links yet"}</p>
      <p className="empty-subtitle">{hasFilters ? "Try adjusting your filters" : "Save your first link to get started"}</p>
      {hasFilters ? (
        <Button variant="secondary" onClick={onClear}>Clear filters</Button>
      ) : (
        <Button leftIcon={LucidePlus} onClick={onAdd}>Add your first link</Button>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.links-page { display: flex; flex-direction: column; gap: 10px; }

/* Header */
.page-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         15px 10px 0 10px;
  flex-wrap:       wrap;
  gap:             8px;
}
.page-title    { font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.page-subtitle { font-size: var(--text-sm); color: var(--text-tertiary); margin-top: 2px; }

/* ── Filters bar ── */
.filters-bar {
  display:       flex;
  align-items:   center;
  gap:           8px;
  flex-wrap:     wrap;
  padding:       14px 16px;
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
}

.filter-search-wrap {
  position:    relative;
  flex:        1;
  min-width:   140px;
  display:     flex;
  align-items: center;
}
.filter-search-icon { position: absolute; left: 10px; width: 14px; height: 14px; color: var(--text-tertiary); pointer-events: none; }
.filter-search {
  width: 100%; height: 34px; padding: 0 30px 0 32px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-primary); font-family: var(--font-sans); font-size: var(--text-sm);
  outline: none; transition: border-color var(--transition-fast), background var(--transition-fast);
}
.filter-search::placeholder { color: var(--text-tertiary); }
.filter-search:focus { border-color: var(--border-focus); background: var(--bg-elevated); }
.filter-search-clear {
  position: absolute; right: 8px; display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; background: var(--bg-overlay); border: none; border-radius: 50%;
  color: var(--text-tertiary); cursor: pointer;
}

.filter-select-wrap { position: relative; display: flex; align-items: center; flex-shrink: 0; }
.filter-select-icon  { position: absolute; left: 9px; width: 13px; height: 13px; color: var(--text-tertiary); pointer-events: none; }
.filter-select-chevron { position: absolute; right: 8px; width: 12px; height: 12px; color: var(--text-tertiary); pointer-events: none; }
.filter-select {
  height: 34px; padding: 0 28px 0 30px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-primary); font-family: var(--font-sans); font-size: var(--text-sm);
  outline: none; cursor: pointer; appearance: none; -webkit-appearance: none;
  transition: border-color var(--transition-fast);
}
.filter-select:focus { border-color: var(--border-focus); }
.filter-select option { background: var(--bg-elevated); }

.filter-toggle {
  display: flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-secondary); font-size: var(--text-sm); font-family: var(--font-sans); font-weight: 500;
  cursor: pointer; white-space: nowrap;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.filter-toggle:hover { background: var(--bg-overlay); border-color: var(--border-strong); }
.filter-toggle--active { background: var(--warning-muted); border-color: rgba(245,158,11,0.3); color: #fbbf24; }

.filter-clear {
  display: flex; align-items: center; gap: 5px; height: 34px; padding: 0 10px;
  background: transparent; border: none; color: var(--text-tertiary);
  font-size: var(--text-sm); font-family: var(--font-sans); cursor: pointer;
  border-radius: var(--radius-md); white-space: nowrap;
  transition: color var(--transition-fast), background var(--transition-fast);
}
.filter-clear:hover { color: var(--danger); background: var(--danger-muted); }

/* Select mode toggle button in filters bar */
.filter-select-mode {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        34px;
  padding:       0 12px;
  background:    transparent;
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-tertiary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  cursor:        pointer;
  white-space:   nowrap;
  margin-left:   auto;
  transition:    background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.filter-select-mode:hover { background: var(--bg-overlay); color: var(--text-primary); border-color: var(--border-strong); }

/* ── Select bar (replaces filters when in select mode) ── */
.select-bar {
  display:       flex;
  align-items:   center;
  gap:           8px;
  flex-wrap:     wrap;
  padding:       10px 16px;
  background:    var(--bg-surface);
  border:        1px solid var(--accent-border);
  border-radius: var(--radius-lg);
  animation:     fadeIn 0.15s ease;
}
.select-all-btn {
  display:     flex;
  align-items: center;
  gap:         8px;
  background:  transparent;
  border:      none;
  cursor:      pointer;
  padding:     4px 0;
  color:       var(--text-secondary);
  font-size:   var(--text-sm);
  font-family: var(--font-sans);
}
.select-all-label { white-space: nowrap; }
.select-count {
  flex:      1;
  font-size: var(--text-sm);
  color:     var(--text-tertiary);
  min-width: 0;
}
.select-cancel {
  display:       flex;
  align-items:   center;
  gap:           5px;
  height:        32px;
  padding:       0 12px;
  background:    transparent;
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  cursor:        pointer;
  white-space:   nowrap;
  transition:    background var(--transition-fast), color var(--transition-fast);
}
.select-cancel:hover { background: var(--bg-overlay); color: var(--text-primary); }

/* Shared checkbox style (used in select bar + filter-select-mode) */
.scheck {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           16px;
  height:          16px;
  min-width:       16px;
  border:          1.5px solid var(--border-strong);
  border-radius:   var(--radius-sm);
  background:      var(--bg-subtle);
  transition:      background var(--transition-fast), border-color var(--transition-fast);
}
.scheck--checked { background: var(--accent); border-color: var(--accent); color: #fff; }
.scheck--sm { width: 13px; height: 13px; min-width: 13px; border-width: 1.5px; }

/* ── Grid ── */
.links-grid {
  display:               grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap:                   16px;
}
@media (max-width: 639px) {
  .links-grid { grid-template-columns: 1fr; gap: 10px; }
}

/* ── Skeleton card ── */
.link-skeleton {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       16px;
}

/* ── Empty state ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 64px 24px;
  background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  text-align: center;
}
.empty-icon {
  display: flex; align-items: center; justify-content: center;
  width: 56px; height: 56px;
  background: var(--bg-overlay); border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  color: var(--text-tertiary);
}
.empty-title    { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.empty-subtitle { font-size: var(--text-sm); color: var(--text-tertiary); }

/* ── Bulk action bar (fixed at bottom) ── */
.bulk-bar {
  position:        fixed;
  bottom:          0;
  left:            50%;
  transform:       translateX(-50%);
  width:           min(480px, calc(100vw - 32px));
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             12px;
  padding:         12px 16px;
  padding-bottom:  calc(12px + env(safe-area-inset-bottom));
  background:      var(--bg-elevated);
  border:          1px solid var(--border-strong);
  border-radius:   var(--radius-xl) var(--radius-xl) 0 0;
  box-shadow:      var(--shadow-lg), 0 -1px 0 var(--border-subtle);
  z-index:         150;
  animation:       bulk-slide-up 0.2s ease;
}
@media (max-width: 767px) {
  /* Sit above the mobile bottom nav (~60px) */
  .bulk-bar { bottom: 60px; border-radius: var(--radius-xl); width: calc(100vw - 24px); }
}
@keyframes bulk-slide-up {
  from { transform: translateX(-50%) translateY(100%); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
}

.bulk-count {
  font-size:   var(--text-sm);
  font-weight: 500;
  color:       var(--text-primary);
  white-space: nowrap;
}
.bulk-actions { display: flex; align-items: center; gap: 8px; }

.bulk-btn {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        36px;
  padding:       0 14px;
  border-radius: var(--radius-md);
  border:        1px solid transparent;
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  white-space:   nowrap;
  transition:    background var(--transition-fast), opacity var(--transition-fast);
}
.bulk-btn:disabled { opacity: 0.6; pointer-events: none; }

.bulk-btn--fav {
  background:   var(--warning-muted);
  border-color: rgba(245,158,11,0.25);
  color:        #d97706;
}
.bulk-btn--fav:hover { background: rgba(245,158,11,0.2); }

.bulk-btn--delete {
  background:   var(--danger-muted);
  border-color: rgba(239,68,68,0.25);
  color:        var(--danger);
}
.bulk-btn--delete:hover { background: rgba(239,68,68,0.15); }

.bulk-btn-label { }
@media (max-width: 360px) {
  .bulk-btn-label { display: none; }
  .bulk-btn       { padding: 0 12px; }
}

.bulk-spinner {
  display:       block;
  width:         14px;
  height:        14px;
  border:        2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation:     lform-spin 0.6s linear infinite;
}
`;
