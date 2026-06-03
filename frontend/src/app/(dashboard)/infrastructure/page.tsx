"use client";

import { useState, useCallback } from "react";
import { useInfrastructures } from "@/hooks/useInfrastructure";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CardGrid from "@/components/shared/CardGrid";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCategories } from "@/hooks/useCategories";
import {
  type Infrastructure,
  INFRA_TYPES,
  type InfraType,
} from "@/types/infrastructure";
import InfraCard from "@/components/infrastructure/InfraCard";
import InfraForm from "@/components/infrastructure/InfraForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  LucideChevronDown,
  LucideDatabase,
  LucideFolder,
  LucidePlus,
  LucideSearch,
  LucideSlidersHorizontal,
  LucideStar,
  LucideX,
} from "@/Icons/Icons";
import { LucideServer } from "../../../Icons/Icons";

export default function InfrastructurePage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Infrastructure | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const { data: categories } = useCategories();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfrastructures({
    search: search || undefined,
    infraType: selectedType || undefined,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    isFavorite: showFavorites || undefined,
  });
  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const onReach = useCallback(() => { if (hasNextPage) fetchNextPage(); }, [hasNextPage, fetchNextPage]);
  const sentinelRef = useInfiniteScroll(onReach, !!hasNextPage && !isLoading);

  const hasFilters = !!(search || selectedType || categoryId || showFavorites);
  const activeCount = [search, selectedType, categoryId, showFavorites].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setSearch("");
    setSelectedType("");
    setCategoryId("");
    setShowFavorites(false);
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const openEdit = (item: Infrastructure) => {
    setEditingItem(item);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };



  return (
    <>
      <style>{CSS}</style>
      <PageLayout top={<>
        <PageHeader
          title="Infrastructure"
          subtitle={isLoading ? "…" : `${total} configs`}
          action={<Button leftIcon={LucidePlus} onClick={openCreate}>New Config</Button>}
        />

        {/* ── Search + filters ── */}
        <div className="ip-filter-bar">
          <div className="ip-filter-top">
            <div className="ip-search-wrap">
              <LucideSearch className="ip-search-icon" />
              <input
                className="ip-search"
                type="text"
                placeholder="Search configs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="ip-search-clear"
                  onClick={() => setSearch("")}
                >
                  <LucideX width={12} />
                </button>
              )}
            </div>

            {/* Type select */}
            <div className="ip-select-wrap">
              <LucideDatabase className="ip-select-icon" />
              <select
                className="ip-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All types</option>
                {Object.entries(INFRA_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <LucideChevronDown className="ip-select-chevron" />
            </div>

            <button
              className={[
                "ip-filter-toggle",
                filtersExpanded ? "ip-filter-toggle--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFiltersExpanded((p) => !p)}
            >
              <LucideSlidersHorizontal width={14} />
              Filters
              {activeCount > 0 && (
                <span className="ip-filter-count">{activeCount}</span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {filtersExpanded && (
            <div className="ip-filters animate-fade-in-down">
              <div className="ip-select-wrap">
                <LucideFolder className="ip-select-icon" />
                <select
                  className="ip-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">All categories</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <LucideChevronDown className="ip-select-chevron" />
              </div>

              <button
                className={[
                  "ip-fav-btn",
                  showFavorites ? "ip-fav-btn--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setShowFavorites((p) => !p)}
              >
                <LucideStar width={14} />
                Favorites only
              </button>

              {hasFilters && (
                <button className="ip-clear-btn" onClick={clearFilters}>
                  <LucideX width={13} />
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Active filter chips */}
          {hasFilters && (
            <div className="ip-chips">
              {selectedType && (
                <button className="ip-chip" onClick={() => setSelectedType("")}>
                  {INFRA_TYPES[selectedType as InfraType]?.label}
                  <LucideX width={10} />
                </button>
              )}
              {categoryId && categories && (
                <button className="ip-chip" onClick={() => setCategoryId("")}>
                  {categories.find((c) => c.id === parseInt(categoryId))?.name}
                  <LucideX width={10} />
                </button>
              )}
              {showFavorites && (
                <button
                  className="ip-chip ip-chip--star"
                  onClick={() => setShowFavorites(false)}
                >
                  Favorites <LucideX width={10} />
                </button>
              )}
            </div>
          )}
        </div>
      </>}>

        {/* ── Grid ── */}
        {isLoading ? (
          <CardGrid>{[...Array(6)].map((_, i) => <InfraSkeleton key={i} />)}</CardGrid>
        ) : items.length > 0 ? (
          <>
            <CardGrid>
              {items.map((item) => (
                <InfraCard key={item.id} item={item} onEdit={openEdit} />
              ))}
            </CardGrid>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isFetchingNextPage && (
              <CardGrid>{[...Array(3)].map((_, i) => <InfraSkeleton key={i} />)}</CardGrid>
            )}
          </>
        ) : (
          <EmptyState
            icon={LucideServer}
            title="No configs yet"
            subtitle="Store your first infrastructure config"
            action={<Button leftIcon={LucidePlus} onClick={openCreate}>New Config</Button>}
            hasFilters={hasFilters}
            filteredTitle="No configs found"
            onClearFilters={clearFilters}
          />
        )}
      </PageLayout>

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingItem ? "Edit config" : "New config"}
        size="lg"
      >
        <InfraForm item={editingItem} onClose={closeForm} />
      </Modal>
    </>
  );
}

function InfraSkeleton() {
  return (
    <div className="ip-skeleton">
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <div
          className="skeleton"
          style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div
            className="skeleton"
            style={{ height: 14, width: "60%", marginBottom: 6 }}
          />
          <div
            className="skeleton"
            style={{ height: 18, width: 70, borderRadius: 99 }}
          />
        </div>
      </div>
      <div
        className="skeleton"
        style={{ height: 80, width: "100%", borderRadius: 6, marginBottom: 12 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          className="skeleton"
          style={{ height: 34, width: 80, borderRadius: 8 }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          <div
            className="skeleton"
            style={{ height: 34, width: 44, borderRadius: 8 }}
          />
          <div
            className="skeleton"
            style={{ height: 34, width: 44, borderRadius: 8 }}
          />
        </div>
      </div>
    </div>
  );
}


const CSS = `
.ip-page   { display: flex; flex-direction: column; gap:10px; }

/* Filter bar */
.ip-filter-bar {
  display:        flex;
  flex-direction: column;
  gap:            10px;
  padding:        12px 14px;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
}
.ip-filter-top { display: flex; align-items: center; gap: 8px; }

.ip-search-wrap { position: relative; display: flex; align-items: center; flex: 1; }
.ip-search-icon { position: absolute; left: 10px; width: 14px; height: 14px; color: var(--text-tertiary); pointer-events: none; }
.ip-search {
  width: 100%; height: 36px; padding: 0 30px 0 32px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-primary); font-family: var(--font-sans); font-size: var(--text-sm);
  outline: none; transition: border-color var(--transition-fast), background var(--transition-fast);
}
.ip-search::placeholder { color: var(--text-tertiary); }
.ip-search:focus         { border-color: var(--border-focus); background: var(--bg-elevated); }
.ip-search-clear {
  position: absolute; right: 8px;
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; background: var(--bg-overlay);
  border: none; border-radius: 50%; color: var(--text-tertiary); cursor: pointer;
}

.ip-filter-toggle {
  display: flex; align-items: center; gap: 6px;
  height: 36px; padding: 0 12px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-secondary); font-size: var(--text-sm); font-family: var(--font-sans); font-weight: 500;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.ip-filter-toggle:hover     { background: var(--bg-overlay); border-color: var(--border-strong); }
.ip-filter-toggle--active   { background: var(--accent-muted); border-color: var(--accent-border); color: var(--cyan-300); }
.ip-filter-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--accent); color: var(--text-inverse);
  font-size: 10px; font-weight: 700; border-radius: 99px;
}

.ip-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.ip-select-wrap { position: relative; display: flex; align-items: center; }
.ip-select-icon { position: absolute; left: 9px; width: 13px; height: 13px; color: var(--text-tertiary); pointer-events: none; }
.ip-select-chevron { position: absolute; right: 8px; width: 11px; height: 11px; color: var(--text-tertiary); pointer-events: none; }
.ip-select {
  height: 34px; padding: 0 24px 0 28px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-primary); font-family: var(--font-sans); font-size: var(--text-sm);
  outline: none; cursor: pointer; appearance: none; -webkit-appearance: none;
  transition: border-color var(--transition-fast);
}
.ip-select:focus  { border-color: var(--border-focus); }
.ip-select option { background: var(--bg-elevated); }

.ip-fav-btn {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 12px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-secondary); font-size: var(--text-sm); font-family: var(--font-sans); font-weight: 500;
  cursor: pointer; white-space: nowrap;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.ip-fav-btn--active { background: var(--warning-muted); border-color: rgba(245,158,11,0.3); color: #fbbf24; }

.ip-clear-btn {
  display: flex; align-items: center; gap: 5px;
  height: 34px; padding: 0 10px;
  background: transparent; border: none; border-radius: var(--radius-md);
  color: var(--text-tertiary); font-size: var(--text-sm); font-family: var(--font-sans);
  cursor: pointer; transition: color var(--transition-fast), background var(--transition-fast);
}
.ip-clear-btn:hover { color: var(--danger); background: var(--danger-muted); }

.ip-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ip-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 10px; background: var(--bg-overlay); border: 1px solid var(--border-default);
  border-radius: var(--radius-full); color: var(--text-secondary);
  font-size: var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor: pointer; transition: background var(--transition-fast), color var(--transition-fast);
}
.ip-chip:hover      { background: var(--danger-muted); border-color: rgba(239,68,68,0.2); color: var(--danger); }
.ip-chip--star      { background: var(--warning-muted); border-color: rgba(245,158,11,0.2); color: #fbbf24; }

/* Skeleton */
.ip-skeleton {
  padding: 16px; background: var(--bg-surface);
  border: 1px solid var(--border-default); border-radius: var(--radius-lg);
}
`;
