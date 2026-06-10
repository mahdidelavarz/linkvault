"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePrompts, usePrompt } from "@/hooks/usePrompt";
import { usePromptCollections } from "@/hooks/usePromptCollections";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CardGrid from "@/components/shared/CardGrid";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCategories } from "@/hooks/useCategories";
import { type Prompt, PROMPT_TYPES } from "@/types/prompt";
import PromptCard from "@/components/prompts/PromptCard";
import PromptForm from "@/components/prompts/PromptForm";
import ManageCollectionsModal from "@/components/prompts/ManageCollectionsModal";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  LucideArrowDownUp,
  LucideChevronDown,
  LucideFolder,
  LucideLayers,
  LucideMessageSquare,
  LucidePlus,
  LucideSearch,
  LucideSettings,
  LucideSlidersHorizontal,
  LucideStar,
  LucideX,
} from "@/Icons/Icons";
import TagSelector from "@/components/tags/TagSelector";
import { useTags } from "@/hooks/useTag";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PromptsPage() {
  const searchParams   = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [duplicateFrom, setDuplicateFrom] = useState<Prompt | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [manageCollectionsOpen, setManageCollectionsOpen] = useState(false);

  // P1-6: Deep-link from search — ?open=<id> opens that prompt's form directly
  const openParam = searchParams.get("open");
  const { data: openPrompt } = usePrompt(openParam ? parseInt(openParam) : 0);
  useEffect(() => {
    if (openPrompt) {
      setEditingPrompt(openPrompt);
      setModalOpen(true);
    }
  }, [openPrompt]);

  const { data: categories } = useCategories();
  const { data: allTags }    = useTags();
  const { data: collections } = usePromptCollections();
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
    tagIds: selectedTagIds.length ? selectedTagIds : undefined,
    sortBy: sortBy || undefined,
    collectionId: collectionId ? parseInt(collectionId) : undefined,
  });
  const prompts = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const onReach = useCallback(() => { if (hasNextPage) fetchNextPage(); }, [hasNextPage, fetchNextPage]);
  const sentinelRef = useInfiniteScroll(onReach, !!hasNextPage && !isLoading);

  const hasFilters = !!(search || categoryId || selectedType || showFavorites || selectedTagIds.length || sortBy || collectionId);
  const activeFilterCount = [categoryId, selectedType, showFavorites, selectedTagIds.length, sortBy, collectionId].filter(Boolean).length;

  const openCreate = () => {
    setEditingPrompt(null);
    setDuplicateFrom(null);
    setModalOpen(true);
  };
  const openEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setDuplicateFrom(null);
    setModalOpen(true);
  };
  const openDuplicate = (prompt: Prompt) => {
    setDuplicateFrom(prompt);
    setEditingPrompt(null);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingPrompt(null);
    setDuplicateFrom(null);
  };
  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setSelectedType("");
    setShowFavorites(false);
    setSelectedTagIds([]);
    setSortBy("");
    setCollectionId("");
  };

  return (
    <>
      <style>{CSS}</style>
      <PageLayout top={<>
        <PageHeader
          title="Prompts"
          subtitle={isLoading ? "…" : `${total} saved`}
          action={<Button leftIcon={LucidePlus} onClick={openCreate}>New Prompt</Button>}
        />

        {/* ── Filters ── */}
        <div className="filters-bar">
          {/* Top row: search + filter toggle */}
          <div className="filter-top-row">
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
                <button className="filter-search-clear" onClick={() => setSearch("")} aria-label="Clear">
                  <LucideX width={12} />
                </button>
              )}
            </div>

            <button
              className={["filter-toggle-btn", filtersExpanded ? "filter-toggle-btn--active" : ""].filter(Boolean).join(" ")}
              onClick={() => setFiltersExpanded((p) => !p)}
            >
              <LucideSlidersHorizontal width={14} />
              Filters
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Expandable filters */}
          {filtersExpanded && (
            <div className="filter-expanded">
              {/* Type select */}
              <div className="filter-select-wrap">
                <LucideMessageSquare className="filter-select-icon" />
                <select className="filter-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="">All Types</option>
                  {Object.entries(PROMPT_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <LucideChevronDown className="filter-select-chevron" />
              </div>

              {/* Category select */}
              <div className="filter-select-wrap">
                <LucideFolder className="filter-select-icon" />
                <select className="filter-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">All categories</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <LucideChevronDown className="filter-select-chevron" />
              </div>

              {/* Sort */}
              <div className="filter-select-wrap">
                <LucideArrowDownUp className="filter-select-icon" />
                <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="">Most used</option>
                  <option value="created">Recently created</option>
                  <option value="title_asc">Title A–Z</option>
                  <option value="title_desc">Title Z–A</option>
                  <option value="type">By type</option>
                </select>
                <LucideChevronDown className="filter-select-chevron" />
              </div>

              {/* Collections */}
              <div className="filter-select-wrap">
                <LucideLayers className="filter-select-icon" />
                <select className="filter-select" value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
                  <option value="">All collections</option>
                  {collections?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <LucideChevronDown className="filter-select-chevron" />
              </div>

              {/* Tags */}
              <TagSelector selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} variant="filter" />

              {/* Favorites */}
              <button
                className={["filter-toggle", showFavorites ? "filter-toggle--active" : ""].filter(Boolean).join(" ")}
                onClick={() => setShowFavorites((p) => !p)}
              >
                <LucideStar width={14} />
                Favorites
              </button>

              {/* Manage collections */}
              <button className="filter-toggle" onClick={() => setManageCollectionsOpen(true)}>
                <LucideSettings width={14} />
                Collections
              </button>

              {/* Clear */}
              {hasFilters && (
                <button className="filter-clear" onClick={clearFilters}>
                  <LucideX width={13} />
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Active tag/sort chips */}
          {(selectedTagIds.length > 0 || sortBy || collectionId) && (
            <div className="filter-tag-chips">
              {selectedTagIds.map((tid) => {
                const tag = allTags?.find((t) => t.id === tid);
                if (!tag) return null;
                return (
                  <button key={tid} className="filter-chip" onClick={() => setSelectedTagIds((p) => p.filter((id) => id !== tid))}>
                    #{tag.name} <LucideX width={10} />
                  </button>
                );
              })}
              {sortBy && (
                <button className="filter-chip" onClick={() => setSortBy("")}>
                  {sortBy === "created" ? "Recently created" : sortBy === "title_asc" ? "Title A–Z" : sortBy === "title_desc" ? "Title Z–A" : "By type"}
                  <LucideX width={10} />
                </button>
              )}
              {collectionId && (
                <button className="filter-chip" onClick={() => setCollectionId("")}>
                  <LucideLayers width={10} />
                  {collections?.find((c) => c.id === parseInt(collectionId))?.title ?? "Collection"}
                  <LucideX width={10} />
                </button>
              )}
            </div>
          )}
        </div>
      </>}>

        {/* ── Content ── */}
        {isLoading ? (
          <CardGrid minCardWidth={380}>{[...Array(4)].map((_, i) => <PromptCardSkeleton key={i} />)}</CardGrid>
        ) : prompts.length > 0 ? (
          <>
            <CardGrid minCardWidth={380}>
              {prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} onEdit={openEdit} onDuplicate={openDuplicate} />)}
            </CardGrid>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isFetchingNextPage && (
              <CardGrid minCardWidth={380}>{[...Array(3)].map((_, i) => <PromptCardSkeleton key={i} />)}</CardGrid>
            )}
          </>
        ) : (
          <EmptyState
            icon={LucideMessageSquare}
            title="No prompts yet"
            subtitle="Save your first AI prompt to get started"
            action={<Button leftIcon={LucidePlus} onClick={openCreate}>Create your first prompt</Button>}
            hasFilters={hasFilters}
            filteredTitle="No prompts found"
            onClearFilters={clearFilters}
          />
        )}
      </PageLayout>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPrompt ? "Edit Prompt" : duplicateFrom ? "Duplicate Prompt" : "New Prompt"}
        size="lg"
      >
        <PromptForm
          prompt={editingPrompt}
          onClose={closeModal}
          initialValues={duplicateFrom ?? undefined}
        />
      </Modal>

      <ManageCollectionsModal
        isOpen={manageCollectionsOpen}
        onClose={() => setManageCollectionsOpen(false)}
      />
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


// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.prompts-page { display: flex; flex-direction: column; gap:10px;}


/* Filters */
.filters-bar {
  display:        flex;
  flex-direction: column;
  gap:            8px;
  padding:        14px 16px;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
}
.filter-top-row {
  display:     flex;
  align-items: center;
  gap:         8px;
}
.filter-toggle-btn {
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
.filter-toggle-btn:hover { background: var(--bg-overlay); border-color: var(--border-strong); }
.filter-toggle-btn--active { background: var(--accent-muted); border-color: var(--accent-border); color: var(--accent); }
.filter-count {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  width:           18px;
  height:          18px;
  background:      var(--accent);
  color:           #fff;
  border-radius:   50%;
  font-size:       10px;
  font-weight:     600;
}
.filter-expanded {
  display:     flex;
  flex-wrap:   wrap;
  align-items: center;
  gap:         8px;
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

/* Tag chips row */
.filter-tag-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.filter-chip {
  display: inline-flex; align-items: center; gap: 4px;
  height: 26px; padding: 0 10px;
  background: var(--accent-muted); border: 1px solid var(--accent-border); border-radius: var(--radius-full);
  color: var(--accent); font-size: var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor: pointer; transition: background var(--transition-fast);
}
.filter-chip:hover { background: var(--accent); color: #fff; }

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

`;