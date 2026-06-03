"use client";

import { ComponentType, SVGProps, useState, useCallback } from "react";
import { useInfrastructures } from "@/hooks/useInfrastructure";
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
import Badge from "@/components/ui/Badge";
import {
  LucideChevronDown,
  LucideContainer,
  LucideDatabase,
  LucideFolder,
  LucideKeyRound,
  LucideNetwork,
  LucidePlus,
  LucideRocket,
  LucideSearch,
  LucideSettings,
  LucideSlidersHorizontal,
  LucideStar,
  LucideX,
} from "@/Icons/Icons";
import { LucideServer } from "../../../Icons/Icons";

const INFRA_ICONS = {
  env: LucideKeyRound,
  server: LucideServer,
  docker: LucideContainer,
  deployment: LucideRocket,
  database: LucideDatabase,
  network: LucideNetwork,
} as const;

type InfraIconKey = keyof typeof INFRA_ICONS;

export default function InfrastructurePage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Infrastructure | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  const handleCopy = async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* silently fail */
    }
  };

  // Group items by type for the type quick-filter tabs
  const typeCounts = items
    ? Object.keys(INFRA_TYPES).reduce(
        (acc, key) => {
          acc[key] = items.filter((i) => i.infraType === key).length;
          return acc;
        },
        {} as Record<string, number>,
      )
    : {};

  return (
    <>
      <style>{CSS}</style>
      <div className="ip-page">
        {/* ── Header ── */}
        <div className="ip-header">
          <div>
            <h1 className="page-title">Infrastructure</h1>
            <p className="page-subtitle">
              {isLoading ? "…" : `${total} configs`}
            </p>
          </div>
          <Button leftIcon={LucidePlus} onClick={openCreate}>
            New Config
          </Button>
        </div>

        {/* ── Type quick-tabs ── */}
        <div className="ip-type-tabs">
          <button
            className={[
              "ip-type-tab",
              !selectedType ? "ip-type-tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSelectedType("")}
          >
            All
            {total > 0 && <span className="ip-type-tab-count">{total}</span>}
          </button>
          {Object.entries(INFRA_TYPES).map(([key, { label }]) => {
            const count = typeCounts[key] ?? 0;
            if (!isLoading && count === 0) return null;
            return (
              <button
                key={key}
                className={[
                  "ip-type-tab",
                  selectedType === key ? "ip-type-tab--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedType(selectedType === key ? "" : key)}
              >
                {(() => {
                  const Icon = INFRA_ICONS[key as InfraIconKey];
                  return Icon ? (
                    <Icon width={13} />
                  ) : (
                    <LucideSettings width={13} />
                  );
                })()}
                {label}
                {count > 0 && (
                  <span className="ip-type-tab-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>

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

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="ip-grid">
            {[...Array(6)].map((_, i) => (
              <InfraSkeleton key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="ip-grid">
              {items.map((item) => (
                <InfraCard
                  key={item.id}
                  item={item}
                  copiedId={copiedId}
                  onEdit={openEdit}
                  onCopy={handleCopy}
                />
              ))}
            </div>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isFetchingNextPage && (
              <div className="ip-grid">
                {[...Array(3)].map((_, i) => <InfraSkeleton key={i} />)}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            hasFilters={hasFilters}
            onAdd={openCreate}
            onClear={clearFilters}
          />
        )}
      </div>

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

function EmptyState({
  hasFilters,
  onAdd,
  onClear,
}: {
  hasFilters: boolean;
  onAdd: () => void;
  onClear: () => void;
}) {
  return (
    <div className="ip-empty">
      <div className="ip-empty-icon">
        {hasFilters ? <LucideX width={28} /> : <LucideServer width={28} />}
      </div>
      <p className="ip-empty-title">
        {hasFilters ? "No configs found" : "No configs yet"}
      </p>
      <p className="ip-empty-sub">
        {hasFilters
          ? "Try adjusting your filters"
          : "Store your first infrastructure config"}
      </p>
      {hasFilters ? (
        <Button variant="secondary" onClick={onClear}>
          Clear filters
        </Button>
      ) : (
        <Button leftIcon={LucidePlus} onClick={onAdd}>
          New Config
        </Button>
      )}
    </div>
  );
}

const CSS = `
.ip-page   { display: flex; flex-direction: column; gap:10px; }
.page-title    { font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.page-subtitle { font-size: var(--text-sm); color: var(--text-tertiary); margin-top: 2px;  }

/* Header */
.ip-header { display: flex; align-items: center; justify-content: space-between; padding:15px 10px 0px 10px; flex-wrap: wrap; }

/* Type tabs */
.ip-type-tabs {
  display:    flex;
  gap:        4px;
  flex-wrap:  wrap;
  padding:    12px 14px;
  background: var(--bg-surface);
  border:     1px solid var(--border-default);
  border-radius: var(--radius-lg);
}
.ip-type-tab {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        30px;
  padding:       0 12px;
  background:    transparent;
  border:        1px solid transparent;
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  white-space:   nowrap;
  min-height:    44px;
  transition:    background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.ip-type-tab:hover      { background: var(--bg-overlay); border-color: var(--border-default); color: var(--text-primary); }
.ip-type-tab--active    { background: var(--accent-muted); border-color: var(--accent-border); color: var(--cyan-300); }
.ip-type-tab-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--bg-overlay); border-radius: 99px;
  font-size: 10px; font-weight: 700; color: var(--text-tertiary);
}
.ip-type-tab--active .ip-type-tab-count { background: var(--accent-border); color: var(--cyan-200); }

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

/* Grid */
.ip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
@media (max-width: 639px) { .ip-grid { grid-template-columns: 1fr; gap: 12px; } }

/* Skeleton */
.ip-skeleton {
  padding: 16px; background: var(--bg-surface);
  border: 1px solid var(--border-default); border-radius: var(--radius-lg);
}

/* Empty */
.ip-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 64px 24px;
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: var(--radius-lg); text-align: center;
}
.ip-empty-icon {
  display: flex; align-items: center; justify-content: center;
  width: 56px; height: 56px;
  background: var(--bg-overlay); border: 1px solid var(--border-default);
  border-radius: var(--radius-lg); color: var(--text-tertiary);
}
.ip-empty-title { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.ip-empty-sub   { font-size: var(--text-sm); color: var(--text-tertiary); }
`;
