"use client";

import { useState, useCallback } from "react";
import { useLinks, useDeleteLink, useUpdateLink } from "@/hooks/useLinks";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCategories } from "@/hooks/useCategories";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { type Link } from "@/types/link";
import LinkCard from "@/components/links/LinkCard";
import LinkForm from "@/components/links/LinkForm";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CardGrid from "@/components/shared/CardGrid";
import BulkActionBar from "@/components/shared/BulkActionBar";
import SelectBar from "@/components/shared/SelectBar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  LucideChevronDown,
  LucideFolder,
  LucideLink2,
  LucidePlus,
  LucideSearch,
  LucideStar,
  LucideX,
} from "@/Icons/Icons";

export default function LinksPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const deleteLink = useDeleteLink();
  const updateLink = useUpdateLink();
  const { data: categories } = useCategories();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useLinks({
    search: search || undefined,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    isFavorite: showFavorites || undefined,
  });
  const links = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const bulk = useBulkSelection(links);

  const onReach = useCallback(() => { if (hasNextPage) fetchNextPage(); }, [hasNextPage, fetchNextPage]);
  const sentinelRef = useInfiniteScroll(onReach, !!hasNextPage && !isLoading);

  const hasFilters = !!(search || categoryId || showFavorites);

  const openCreate = () => { bulk.exit(); setEditingLink(null); setModalOpen(true); };
  const openEdit   = (link: Link) => { setEditingLink(link); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingLink(null); };
  const clearFilters = () => { setSearch(""); setCategoryId(""); setShowFavorites(false); };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    try { await Promise.all([...bulk.selectedIds].map((id) => deleteLink.mutateAsync(id))); bulk.exit(); }
    finally { setIsBulkProcessing(false); }
  };
  const handleBulkFavorite = async () => {
    setIsBulkProcessing(true);
    try { await Promise.all([...bulk.selectedIds].map((id) => updateLink.mutateAsync({ id, isFavorite: true }))); bulk.exit(); }
    finally { setIsBulkProcessing(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="links-page">

        {/* Header */}
        <PageHeader
          title="Links"
          subtitle={isLoading ? "…" : `${total} saved`}
          action={!bulk.isSelectMode && <Button leftIcon={LucidePlus} onClick={openCreate}>Add Link</Button>}
        />

        {/* Filter bar / Select bar */}
        {bulk.isSelectMode ? (
          <SelectBar
            selectedCount={bulk.count}
            totalCount={links.length}
            isAllSelected={bulk.isAllSelected}
            onToggleAll={bulk.toggleAll}
            onCancel={bulk.exit}
          />
        ) : (
          <div className="filters-bar">
            <div className="filter-search-wrap">
              <LucideSearch className="filter-search-icon" />
              <input
                className="filter-search" type="text" placeholder="Search links…"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="filter-search-clear" onClick={() => setSearch("")} aria-label="Clear">
                  <LucideX width={12} />
                </button>
              )}
            </div>

            <div className="filter-select-wrap">
              <LucideFolder className="filter-select-icon" />
              <select className="filter-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">All categories</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <LucideChevronDown className="filter-select-chevron" />
            </div>

            <button
              className={["filter-toggle", showFavorites ? "filter-toggle--active" : ""].filter(Boolean).join(" ")}
              onClick={() => setShowFavorites((p) => !p)}
            >
              <LucideStar width={14} /> Favorites
            </button>

            {hasFilters && (
              <button className="filter-clear" onClick={clearFilters}>
                <LucideX width={13} /> Clear
              </button>
            )}

            {links.length > 0 && (
              <button className="filter-select-mode" onClick={bulk.enter}>
                <span className="scheck scheck--sm" /> Select
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <CardGrid>
            {[...Array(6)].map((_, i) => <LinkCardSkeleton key={i} />)}
          </CardGrid>
        ) : links.length > 0 ? (
          <>
            <CardGrid>
              {links.map((link) => (
                <LinkCard
                  key={link.id} link={link} onEdit={openEdit}
                  isSelectMode={bulk.isSelectMode}
                  isSelected={bulk.selectedIds.has(link.id)}
                  onToggleSelect={bulk.toggle}
                />
              ))}
            </CardGrid>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isFetchingNextPage && (
              <CardGrid>{[...Array(3)].map((_, i) => <LinkCardSkeleton key={i} />)}</CardGrid>
            )}
          </>
        ) : (
          <EmptyState
            icon={LucideLink2}
            title="No links yet"
            subtitle="Save your first link to get started"
            action={<Button leftIcon={LucidePlus} onClick={openCreate}>Add your first link</Button>}
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
          />
        )}

        {bulk.count > 0 && <div style={{ height: 80 }} />}
      </div>

      {/* Bulk bar */}
      <BulkActionBar
        count={bulk.count}
        isProcessing={isBulkProcessing}
        onDelete={handleBulkDelete}
        onFavorite={handleBulkFavorite}
      />

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.links-page { display: flex; flex-direction: column; gap: 10px; }

.filters-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 14px 16px; background: var(--bg-surface);
  border: 1px solid var(--border-default); border-radius: var(--radius-lg);
}
.filter-search-wrap { position: relative; flex: 1; min-width: 140px; display: flex; align-items: center; }
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
.filter-select-icon    { position: absolute; left: 9px; width: 13px; height: 13px; color: var(--text-tertiary); pointer-events: none; }
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
.filter-select-mode {
  display: flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px;
  background: transparent; border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-tertiary); font-size: var(--text-sm); font-family: var(--font-sans);
  cursor: pointer; white-space: nowrap; margin-left: auto;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.filter-select-mode:hover { background: var(--bg-overlay); color: var(--text-primary); border-color: var(--border-strong); }
.scheck {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; min-width: 16px;
  border: 1.5px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-subtle);
}
.scheck--sm { width: 13px; height: 13px; min-width: 13px; }

.link-skeleton { background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 16px; }
`;
