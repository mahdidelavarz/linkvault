"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSnippets, useSnippet } from "@/hooks/useSnippet";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CardGrid from "@/components/shared/CardGrid";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTag";
import TagSelector from "@/components/tags/TagSelector";
import {
  type Snippet,
  SNIPPET_TYPES,
  TYPE_LANGUAGES,
  type SnippetType,
} from "@/types/snippet";
import SnippetCard from "@/components/snippets/SnippetCard";
import SnippetForm from "@/components/snippets/SnippetForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  LucideChevronDown,
  LucideCodeXml,
  LucideFileCode2,
  LucideFolder,
  LucideLayers,
  LucidePlus,
  LucideSearch,
  LucideSlidersHorizontal,
  LucideStar,
  LucideX,
} from "@/Icons/Icons";

const ALL_LANGUAGES: Record<string, string> = {
  js: "JavaScript",
  jsx: "React JSX",
  ts: "TypeScript",
  tsx: "React TSX",
  py: "Python",
  rb: "Ruby",
  java: "Java",
  go: "Go",
  rs: "Rust",
  php: "PHP",
  sql: "SQL",
  sh: "Shell",
  bash: "Bash",
  powershell: "PowerShell",
  dockerfile: "Docker",
  yaml: "YAML",
  json: "JSON",
  xml: "XML",
  html: "HTML",
  css: "CSS",
  md: "Markdown",
  regex: "Regex",
  curl: "cURL",
  txt: "Plain Text",
};

export default function SnippetsPage() {
  const searchParams   = useSearchParams();
  const [formOpen, setFormOpen]           = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [duplicateFrom, setDuplicateFrom]   = useState<Snippet | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // P1-6: Deep-link from search — ?open=<id> opens that snippet's form directly
  const openParam = searchParams.get("open");
  const { data: openSnippet } = useSnippet(openParam ? parseInt(openParam) : 0);
  useEffect(() => {
    if (openSnippet) {
      setEditingSnippet(openSnippet);
      setFormOpen(true);
    }
  }, [openSnippet]);

  const { data: categories } = useCategories();
  const { data: allTags }    = useTags();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSnippets({
    search: search || undefined,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    snippetType: selectedType || undefined,
    language: selectedLang || undefined,
    isFavorite: showFavorites || undefined,
    tagIds: selectedTagIds.length ? selectedTagIds : undefined,
  });
  const snippets = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const onReach = useCallback(() => { if (hasNextPage) fetchNextPage(); }, [hasNextPage, fetchNextPage]);
  const sentinelRef = useInfiniteScroll(onReach, !!hasNextPage && !isLoading);

  const availableLanguages = useMemo(() => {
    if (!selectedType) return ALL_LANGUAGES;
    const langs = TYPE_LANGUAGES[selectedType as SnippetType];
    if (!langs) return ALL_LANGUAGES;
    return Object.fromEntries(
      langs.filter((l) => ALL_LANGUAGES[l]).map((l) => [l, ALL_LANGUAGES[l]]),
    );
  }, [selectedType]);

  const hasFilters = !!(
    search || categoryId || selectedType || selectedLang || showFavorites || selectedTagIds.length
  );

  const activeFilterCount = [
    search, categoryId, selectedType, selectedLang, showFavorites, selectedTagIds.length,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setSelectedType("");
    setSelectedLang("");
    setShowFavorites(false);
    setSelectedTagIds([]);
  };

  const openCreate = () => {
    setEditingSnippet(null);
    setDuplicateFrom(null);
    setFormOpen(true);
  };
  const openEdit = (s: Snippet) => {
    setEditingSnippet(s);
    setDuplicateFrom(null);
    setFormOpen(true);
  };
  const openDuplicate = (s: Snippet) => {
    setEditingSnippet(null);
    setDuplicateFrom(s);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingSnippet(null);
    setDuplicateFrom(null);
  };


  return (
    <>
      <style>{CSS}</style>
      <PageLayout top={<>
        <PageHeader
          title="Snippets"
          subtitle={isLoading ? "…" : `${total} snippets`}
          action={<Button leftIcon={LucidePlus} onClick={openCreate}>New Snippet</Button>}
        />

        {/* ── Filter bar ── */}
        <div className="sp-filter-bar">
          {/* Search + toggle in one row */}
          <div className="sp-top-row">
            <div className="sp-search-wrap">
              <LucideSearch className="sp-search-icon" />
              <input
                className="sp-search"
                type="text"
                placeholder="Search snippets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="sp-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear"
                >
                  <LucideX width={12} />
                </button>
              )}
            </div>

            <button
              className={[
                "sp-filter-toggle",
                filtersExpanded ? "sp-filter-toggle--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFiltersExpanded((p) => !p)}
              aria-expanded={filtersExpanded}
            >
              <LucideSlidersHorizontal width={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="sp-filter-count">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Expandable filters */}
          <div
            className={["sp-filters", filtersExpanded ? "sp-filters--open" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Type */}
            <div className="sp-select-wrap">
              <LucideLayers className="sp-select-icon" />
              <select
                className="sp-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedLang("");
                }}
              >
                <option value="">All types</option>
                {Object.entries(SNIPPET_TYPES).map(([k, { label }]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <LucideChevronDown className="sp-select-chevron" />
            </div>

            {/* Language */}
            <div className="sp-select-wrap">
              <LucideFileCode2 className="sp-select-icon" />
              <select
                className="sp-select"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
              >
                <option value="">All languages</option>
                {Object.entries(availableLanguages).map(([k, name]) => (
                  <option key={k} value={k}>
                    {name}
                  </option>
                ))}
              </select>
              <LucideChevronDown className="sp-select-chevron" />
            </div>

            {/* Category */}
            <div className="sp-select-wrap">
              <LucideFolder className="sp-select-icon" />
              <select
                className="sp-select"
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
              <LucideChevronDown className="sp-select-chevron" />
            </div>

            {/* Tags */}
            <TagSelector
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
              variant="filter"
            />

            {/* Favorites */}
            <button
              className={[
                "sp-fav-btn",
                showFavorites ? "sp-fav-btn--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setShowFavorites((p) => !p)}
            >
              <LucideStar width={14} />
              Favorites
            </button>

            {hasFilters && (
              <button className="sp-clear-btn" onClick={clearFilters}>
                <LucideX width={13} />
                Clear
              </button>
            )}
          </div>

          {/* Active filter badges */}
          {hasFilters && (
            <div className="sp-active-filters">
              {selectedType && (
                <button className="sp-chip" onClick={() => setSelectedType("")}>
                  {SNIPPET_TYPES[selectedType as SnippetType]?.label}
                  <LucideX width={10} />
                </button>
              )}
              {selectedLang && (
                <button className="sp-chip" onClick={() => setSelectedLang("")}>
                  {ALL_LANGUAGES[selectedLang] ?? selectedLang}
                  <LucideX width={10} />
                </button>
              )}
              {categoryId && categories && (
                <button className="sp-chip" onClick={() => setCategoryId("")}>
                  {categories.find((c) => c.id === parseInt(categoryId))?.name}
                  <LucideX width={10} />
                </button>
              )}
              {showFavorites && (
                <button className="sp-chip sp-chip--star" onClick={() => setShowFavorites(false)}>
                  Favorites <LucideX width={10} />
                </button>
              )}
              {selectedTagIds.map((tid) => {
                const tag = allTags?.find((t) => t.id === tid);
                if (!tag) return null;
                return (
                  <button key={tid} className="sp-chip" onClick={() => setSelectedTagIds((prev) => prev.filter((id) => id !== tid))}>
                    #{tag.name} <LucideX width={10} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </>}
      >

        {/* ── Grid ── */}
        {isLoading ? (
          <CardGrid minCardWidth={320}>{[...Array(6)].map((_, i) => <SnippetSkeleton key={i} />)}</CardGrid>
        ) : snippets.length > 0 ? (
          <>
            <CardGrid minCardWidth={320}>
              {snippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} onEdit={openEdit} onDuplicate={openDuplicate} />
              ))}
            </CardGrid>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isFetchingNextPage && (
              <CardGrid minCardWidth={320}>{[...Array(3)].map((_, i) => <SnippetSkeleton key={i} />)}</CardGrid>
            )}
          </>
        ) : (
          <EmptyState
            icon={LucideCodeXml}
            title="No snippets yet"
            subtitle="Save your first reusable snippet"
            action={<Button leftIcon={LucidePlus} onClick={openCreate}>New Snippet</Button>}
            hasFilters={hasFilters}
            filteredTitle="No snippets found"
            onClearFilters={clearFilters}
          />
        )}
      </PageLayout>

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingSnippet ? "Edit Snippet" : duplicateFrom ? "Duplicate Snippet" : "New Snippet"}
        size="xl"
      >
        <SnippetForm
          snippet={editingSnippet}
          initialValues={duplicateFrom ?? undefined}
          onClose={closeForm}
        />
      </Modal>
    </>
  );
}

function SnippetSkeleton() {
  return (
    <div className="sp-skeleton">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div className="skeleton" style={{ height: 16, width: "55%" }} />
        <div
          className="skeleton"
          style={{ height: 16, width: 60, borderRadius: 99 }}
        />
      </div>
      <div
        className="skeleton"
        style={{ height: 12, width: "80%", marginBottom: 12 }}
      />
      <div
        className="skeleton"
        style={{ height: 80, width: "100%", borderRadius: 6, marginBottom: 12 }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div
            className="skeleton"
            style={{ height: 20, width: 50, borderRadius: 99 }}
          />
          <div
            className="skeleton"
            style={{ height: 20, width: 40, borderRadius: 99 }}
          />
        </div>
        <div
          className="skeleton"
          style={{ height: 32, width: 80, borderRadius: 8 }}
        />
      </div>
    </div>
  );
}


const CSS = `
.sp-page   { display: flex; flex-direction: column; gap:10px; }

/* Filter bar */
.sp-filter-bar {
  display:        flex;
  flex-direction: column;
  gap:            10px;
  padding:        14px 16px;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
}

/* Top row: search + toggle */
.sp-filter-bar > .sp-search-wrap,
.sp-filter-bar > .sp-filter-toggle {
  /* These two sit on the same row */
}
.sp-filter-bar > :first-child { display: flex; align-items: center; gap: 8px; }

/* Specifically lay out search + toggle button in one flex row */
.sp-filter-bar {
  /* override: top row = search + toggle */
}

.sp-search-wrap {
  position:    relative;
  display:     flex;
  align-items: center;
  flex:        1;
  min-width:   0;
}
.sp-search-icon {
  position:       absolute;
  left:           10px;
  width:          14px;
  height:         14px;
  color:          var(--text-tertiary);
  pointer-events: none;
}
.sp-search {
  width:         100%;
  height:        36px;
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
.sp-search::placeholder { color: var(--text-tertiary); }
.sp-search:focus        { border-color: var(--border-focus); background: var(--bg-elevated); }
.sp-search-clear {
  position:    absolute;
  right:       8px;
  display:     flex; align-items: center; justify-content: center;
  width:       18px; height: 18px;
  background:  var(--bg-overlay);
  border:      none; border-radius: 50%;
  color:       var(--text-tertiary); cursor: pointer;
}

/* First row: search + toggle side by side */
.sp-filter-bar { display: flex; flex-direction: column; gap: 10px; }

/* Wrap search and toggle in a row */
.sp-top-row {
  display:     flex;
  align-items: center;
  gap:         8px;
}

.sp-filter-toggle {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        36px;
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
  flex-shrink:   0;
  transition:    background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.sp-filter-toggle:hover       { background: var(--bg-overlay); border-color: var(--border-strong); }
.sp-filter-toggle--active     { background: var(--accent-muted); border-color: var(--accent-border); color: var(--cyan-300); }

.sp-filter-count {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  min-width:       18px; height: 18px;
  padding:         0 5px;
  background:      var(--accent);
  color:           var(--text-inverse);
  font-size:       10px;
  font-weight:     700;
  border-radius:   99px;
}

/* Expandable filters */
.sp-filters {
  display:  none;
  gap:      8px;
  flex-wrap: wrap;
  align-items: center;
}
.sp-filters--open { display: flex; animation: fadeInDown var(--transition-base) ease both; }

.sp-select-wrap { position: relative; display: flex; align-items: center; }
.sp-select-icon { position: absolute; left: 9px; width: 13px; height: 13px; color: var(--text-tertiary); pointer-events: none; }
.sp-select-chevron { position: absolute; right: 8px; width: 11px; height: 11px; color: var(--text-tertiary); pointer-events: none; }
.sp-select {
  height:             34px;
  padding:            0 24px 0 28px;
  background:         var(--bg-subtle);
  border:             1px solid var(--border-default);
  border-radius:      var(--radius-md);
  color:              var(--text-primary);
  font-family:        var(--font-sans);
  font-size:          var(--text-sm);
  outline:            none;
  cursor:             pointer;
  appearance:         none;
  -webkit-appearance: none;
  transition:         border-color var(--transition-fast);
}
.sp-select:focus  { border-color: var(--border-focus); }
.sp-select option { background: var(--bg-elevated); }

.sp-fav-btn {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 12px;
  background: var(--bg-subtle); border: 1px solid var(--border-default);
  border-radius: var(--radius-md); color: var(--text-secondary);
  font-size: var(--text-sm); font-family: var(--font-sans); font-weight: 500;
  cursor: pointer; white-space: nowrap;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.sp-fav-btn:hover      { border-color: var(--border-strong); }
.sp-fav-btn--active    { background: var(--warning-muted); border-color: rgba(245,158,11,0.3); color: #fbbf24; }

.sp-clear-btn {
  display: flex; align-items: center; gap: 5px;
  height: 34px; padding: 0 10px;
  background: transparent; border: none;
  color: var(--text-tertiary); font-size: var(--text-sm);
  font-family: var(--font-sans); cursor: pointer;
  border-radius: var(--radius-md);
  transition: color var(--transition-fast), background var(--transition-fast);
}
.sp-clear-btn:hover { color: var(--danger); background: var(--danger-muted); }

/* Active filter chips */
.sp-active-filters { display: flex; flex-wrap: wrap; gap: 6px; }
.sp-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 10px;
  background: var(--bg-overlay); border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  color: var(--text-secondary); font-size: var(--text-xs); font-family: var(--font-sans);
  cursor: pointer; font-weight: 500;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.sp-chip:hover      { background: var(--danger-muted); border-color: rgba(239,68,68,0.2); color: var(--danger); }
.sp-chip--star      { background: var(--warning-muted); border-color: rgba(245,158,11,0.2); color: #fbbf24; }

/* Skeleton */
.sp-skeleton {
  padding: 16px;
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
}
`;
