"use client";

import { useState, useCallback } from "react";
import { usePrompts } from "@/hooks/usePrompt";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCategories } from "@/hooks/useCategories";
import { type Prompt, PROMPT_TYPES } from "@/types/prompt";
import PromptCard from "@/components/prompts/PromptCard";
import PromptForm from "@/components/prompts/PromptForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  LucideChevronDown,
  LucideFolder,
  LucideMessageSquare,
  LucidePlus,
  LucideSearch,
  LucideSearchX,
  LucideStar,
  LucideX,
} from "@/Icons/Icons";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PromptsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const { data: categories } = useCategories();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePrompts({
    search: search || undefined,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    promptType: selectedType || undefined,
    isFavorite: showFavorites || undefined,
  });
  const prompts = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const onReach = useCallback(() => { if (hasNextPage) fetchNextPage(); }, [hasNextPage, fetchNextPage]);
  const sentinelRef = useInfiniteScroll(onReach, !!hasNextPage && !isLoading);

  const hasFilters = !!(search || categoryId || selectedType || showFavorites);

  const openCreate = () => {
    setEditingPrompt(null);
    setModalOpen(true);
  };
  const openEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingPrompt(null);
  };
  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setSelectedType("");
    setShowFavorites(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="prompts-page">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Prompts</h1>
            <p className="page-subtitle">
              {isLoading ? "…" : `${total} saved`}
            </p>
          </div>
          <Button leftIcon={LucidePlus} onClick={openCreate}>
            New Prompt
          </Button>
        </div>

        {/* ── Filters ── */}
        <div className="filters-bar">
          {/* Search */}
          <div className="filter-search-wrap">
            <LucideSearch className="filter-search-icon" />
            <input
              className="filter-search"
              type="text"
              placeholder="Search prompts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="filter-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear"
              >
                <LucideX width={12} />
              </button>
            )}
          </div>

          {/* Type select */}
          <div className="filter-select-wrap">
            <LucideMessageSquare className="filter-select-icon" />
            <select
              className="filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.entries(PROMPT_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <LucideChevronDown className="filter-select-chevron" />
          </div>

          {/* Category select */}
          <div className="filter-select-wrap">
            <LucideFolder className="filter-select-icon" />
            <select
              className="filter-select"
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
            <LucideChevronDown className="filter-select-chevron" />
          </div>

          {/* Favorites toggle */}
          <button
            className={[
              "filter-toggle",
              showFavorites ? "filter-toggle--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
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
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="prompts-grid">
            {[...Array(4)].map((_, i) => (
              <PromptCardSkeleton key={i} />
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <>
            <div className="prompts-grid">
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} onEdit={openEdit} />
              ))}
            </div>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isFetchingNextPage && (
              <div className="prompts-grid">
                {[...Array(3)].map((_, i) => <PromptCardSkeleton key={i} />)}
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
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPrompt ? "Edit Prompt" : "New Prompt"}
        size="lg"
      >
        <PromptForm prompt={editingPrompt} onClose={closeModal} />
      </Modal>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PromptCardSkeleton() {
  return (
    <div className="prompt-skeleton">
      <div className="skeleton-prompt-header">
        <div className="skeleton" style={{ height: 18, width: 18 }} />
        <div className="skeleton" style={{ height: 18, width: "50%" }} />
        <div className="skeleton" style={{ height: 18, width: 18, marginLeft: "auto" }} />
      </div>
      <div
        className="skeleton"
        style={{ height: 13, width: "80%", marginBottom: 10 }}
      />
      <div
        className="skeleton"
        style={{
          height: 80,
          width: "100%",
          borderRadius: "var(--radius-md)",
          marginBottom: 12,
        }}
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <div
          className="skeleton"
          style={{ height: 22, width: 70, borderRadius: 99 }}
        />
        <div
          className="skeleton"
          style={{ height: 22, width: 55, borderRadius: 99 }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div
          className="skeleton"
          style={{ height: 32, flex: 1, borderRadius: "var(--radius-md)" }}
        />
        <div
          className="skeleton"
          style={{ height: 32, flex: 1, borderRadius: "var(--radius-md)" }}
        />
        <div
          className="skeleton"
          style={{ height: 32, width: 60, borderRadius: "var(--radius-md)" }}
        />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

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
    <div className="empty-state">
      <div className="empty-icon">
        {hasFilters ? <LucideSearchX width={28} /> : <LucideMessageSquare width={28} />}
      </div>
      <p className="empty-title">
        {hasFilters ? "No prompts found" : "No prompts yet"}
      </p>
      <p className="empty-subtitle">
        {hasFilters
          ? "Try adjusting your filters"
          : "Save your first AI prompt to get started"}
      </p>
      {hasFilters ? (
        <Button variant="secondary" onClick={onClear}>
          Clear filters
        </Button>
      ) : (
        <Button leftIcon={LucidePlus} onClick={onAdd}>
          Create your first prompt
        </Button>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.prompts-page { display: flex; flex-direction: column; gap:10px;}

/* Header */
.page-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:15px 10px 0px 10px;
  flex-wrap:       wrap;
}
.page-title    { font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.page-subtitle { font-size: var(--text-sm);  color: var(--text-tertiary); margin-top: 2px; }

/* Filters */
.filters-bar {
  display:     flex;
  align-items: center;
  gap:         8px;
  flex-wrap:   wrap;
  padding:     14px 16px;
  background:  var(--bg-surface);
  border:      1px solid var(--border-default);
  border-radius: var(--radius-lg);
}

/* Search */
.filter-search-wrap {
  position:    relative;
  flex:        1;
  min-width:   180px;
  display:     flex;
  align-items: center;
}
.filter-search-icon {
  position:  absolute;
  left:      10px;
  width:     14px;
  height:    14px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.filter-search {
  width:         100%;
  height:        34px;
  padding:       0 30px 0 32px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  outline:       none;
  transition:    border-color var(--transition-fast), background var(--transition-fast);
}
.filter-search::placeholder { color: var(--text-tertiary); }
.filter-search:focus { border-color: var(--border-focus); background: var(--bg-elevated); }
.filter-search-clear {
  position:    absolute;
  right:       8px;
  display:     flex;
  align-items: center;
  justify-content: center;
  width:       18px;
  height:      18px;
  background:  var(--bg-overlay);
  border:      none;
  border-radius: 50%;
  color:       var(--text-tertiary);
  cursor:      pointer;
}

/* Select */
.filter-select-wrap {
  position:    relative;
  display:     flex;
  align-items: center;
  flex-shrink: 0;
}
.filter-select-icon {
  position:  absolute;
  left:      9px;
  width:     13px;
  height:    13px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.filter-select-chevron {
  position:  absolute;
  right:     8px;
  width:     12px;
  height:    12px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.filter-select {
  height:          34px;
  padding:         0 28px 0 30px;
  background:      var(--bg-subtle);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-md);
  color:           var(--text-primary);
  font-family:     var(--font-sans);
  font-size:       var(--text-sm);
  outline:         none;
  cursor:          pointer;
  appearance:      none;
  -webkit-appearance: none;
  transition:      border-color var(--transition-fast);
}
.filter-select:focus { border-color: var(--border-focus); }
.filter-select option { background: var(--bg-elevated); }

/* Toggle */
.filter-toggle {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        34px;
  padding:       0 12px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  white-space:   nowrap;
  transition:    background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.filter-toggle:hover { background: var(--bg-overlay); border-color: var(--border-strong); }
.filter-toggle--active {
  background:   var(--warning-muted);
  border-color: rgba(245,158,11,0.3);
  color:        #fbbf24;
}

/* Clear */
.filter-clear {
  display:     flex;
  align-items: center;
  gap:         5px;
  height:      34px;
  padding:     0 10px;
  background:  transparent;
  border:      none;
  color:       var(--text-tertiary);
  font-size:   var(--text-sm);
  font-family: var(--font-sans);
  cursor:      pointer;
  border-radius: var(--radius-md);
  transition:  color var(--transition-fast), background var(--transition-fast);
  white-space: nowrap;
}
.filter-clear:hover { color: var(--danger); background: var(--danger-muted); }

/* Grid */
.prompts-grid {
  display:               grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap:                   16px;
}
@media (max-width: 767px) {
  .prompts-grid { grid-template-columns: 1fr; }
}

/* Skeleton card */
.prompt-skeleton {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px;
}
.skeleton-prompt-header {
  display:     flex;
  align-items: center;
  gap:         10px;
  margin-bottom: 14px;
}

/* Empty state */
.empty-state {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             12px;
  padding:         64px 24px;
  background:      var(--bg-surface);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  text-align:      center;
}
.empty-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           56px;
  height:          56px;
  background:      var(--bg-overlay);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  color:           var(--text-tertiary);
}
.empty-title    { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.empty-subtitle { font-size: var(--text-sm); color: var(--text-tertiary); }
`;