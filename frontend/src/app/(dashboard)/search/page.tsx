"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useGlobalSearch } from "@/features/search/hooks/useSearch";
import { useSearchParams, useRouter } from "next/navigation";
import { useRecentSearches } from "@/features/search/hooks/useRecentSearches";
import SearchResultCard from "@/features/search/components/SearchResultCard";
import SearchFilters from "@/features/search/components/SearchFilters";
import SearchEmptyState from "@/features/search/components/SearchEmptyState";
import type { SearchResult } from "@/features/search/types/search";
import {
  LucideSearch,
  LucideX,
  LucideCommand,
  LucideLink2,
  LucideNotebookPen,
  LucideCodeXml,
  LucideMessageSquare,
  LucideServer,
  SvgSpinnersRingResize,
} from "@/Icons/Icons";

// ─── Page ─────────────────────────────────────────────────────────────────────

const INITIAL_SHOWN = 20;
const LOAD_MORE_STEP = 20;

const ZERO_SHOWN = { links: INITIAL_SHOWN, notes: INITIAL_SHOWN, snippets: INITIAL_SHOWN, prompts: INITIAL_SHOWN, infrastructures: INITIAL_SHOWN };

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [shownCounts, setShownCounts] = useState(ZERO_SHOWN);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const { searches: recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  const { data: results, isLoading } = useGlobalSearch({
    query,
    type: type !== "all" ? type : undefined,
    categoryId,
    tagIds,
  });

  // Save to recent searches when results come back
  useEffect(() => {
    if (results && results.totalResults > 0 && query.length >= 2) {
      addSearch(query);
    }
  }, [results]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset visible counts and keyboard focus whenever the search changes
  useEffect(() => {
    setShownCounts(ZERO_SHOWN);
    setFocusedIndex(null);
  }, [query, type, categoryId]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type !== "all") params.set("type", type);
    if (categoryId) params.set("categoryId", categoryId.toString());
    if (tagIds.length > 0) params.set("tagIds", tagIds.join(","));
    router.replace(`/search${params.toString() ? "?" + params.toString() : ""}`);
  }, [query, type, categoryId, tagIds, router]);

  // Total count of currently visible result cards (for Arrow nav bounds)
  const totalVisible = useMemo(() => {
    if (!results) return 0;
    return (
      Math.min(results.results.links.length, shownCounts.links) +
      Math.min(results.results.notes.length, shownCounts.notes) +
      Math.min(results.results.snippets.length, shownCounts.snippets) +
      Math.min(results.results.prompts.length, shownCounts.prompts) +
      Math.min(results.results.infrastructures.length, shownCounts.infrastructures)
    );
  }, [results, shownCounts]);

  // Section start indices so each card knows its flat position
  const sectionStarts = useMemo(() => {
    if (!results) return { links: 0, notes: 0, snippets: 0, prompts: 0, infrastructures: 0 };
    const links = Math.min(results.results.links.length, shownCounts.links);
    const notes = Math.min(results.results.notes.length, shownCounts.notes);
    const snippets = Math.min(results.results.snippets.length, shownCounts.snippets);
    const prompts = Math.min(results.results.prompts.length, shownCounts.prompts);
    return {
      links: 0,
      notes: links,
      snippets: links + notes,
      prompts: links + notes + snippets,
      infrastructures: links + notes + snippets + prompts,
    };
  }, [results, shownCounts]);

  // Keyboard navigation: Arrow Up/Down moves through results, Enter opens, Escape returns to input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
        setFocusedIndex(null);
        return;
      }
      if (e.key === "ArrowDown" && totalVisible > 0) {
        e.preventDefault();
        setFocusedIndex(i => i === null ? 0 : Math.min(i + 1, totalVisible - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex(i => {
          if (i === null || i === 0) {
            document.getElementById("search-input")?.focus();
            return null;
          }
          return i - 1;
        });
      } else if (e.key === "Enter" && focusedIndex !== null) {
        e.preventDefault();
        const cards = document.querySelectorAll<HTMLElement>("[data-result-card]");
        cards[focusedIndex]?.click();
      } else if (e.key === "Escape") {
        setFocusedIndex(null);
        document.getElementById("search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [totalVisible, focusedIndex]);

  // Scroll focused card into view
  useEffect(() => {
    if (focusedIndex === null) return;
    const cards = document.querySelectorAll<HTMLElement>("[data-result-card]");
    cards[focusedIndex]?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  const clearFilters = useCallback(() => {
    setQuery(""); setType("all"); setCategoryId(undefined); setTagIds([]);
  }, []);

  const loadMore = useCallback((key: keyof typeof ZERO_SHOWN) => {
    setShownCounts(s => ({ ...s, [key]: s[key] + LOAD_MORE_STEP }));
  }, []);

  const hasQuery   = query.length > 0;
  const hasResults = results && results.totalResults > 0;

  return (
    <>
      <style>{CSS}</style>
      <div className="search-page">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Search</h1>
            <p className="page-subtitle">
              {isLoading
                ? "Searching…"
                : hasQuery && hasResults
                  ? `${results?.totalResults ?? 0} results for "${query}"`
                  : "Search across your entire vault"}
            </p>
          </div>
        </div>

        {/* ── Search Input ── */}
        <div className="search-input-wrap">
          <LucideSearch className="search-input-icon" />
          <input
            id="search-input"
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search links, notes, snippets, prompts & infrastructure…"
            autoFocus
          />
          {query ? (
            <button className="search-input-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <LucideX width={16} />
            </button>
          ) : (
            <kbd className="search-input-kbd">
              <LucideCommand width={12} />K
            </kbd>
          )}
        </div>

        {/* ── Content ── */}
        <div className="search-body">
          <aside className="search-filters">
            <SearchFilters
              type={type}
              categoryId={categoryId}
              selectedTagIds={tagIds}
              onTypeChange={setType}
              onCategoryChange={setCategoryId}
              onTagsChange={setTagIds}
              onClear={clearFilters}
            />
          </aside>

          <div className="search-results">
            {isLoading ? (
              <div className="search-loading">
                <SvgSpinnersRingResize className="search-loading-icon" width={28} />
                <p className="search-loading-text">Searching…</p>
              </div>
            ) : !hasResults ? (
              <SearchEmptyState
                hasQuery={hasQuery}
                hasFilters={type !== "all" || categoryId !== undefined || tagIds.length > 0}
                recentSearches={recentSearches}
                onSelectRecent={(q) => setQuery(q)}
                onRemoveRecent={removeSearch}
                onClearRecent={clearSearches}
              />
            ) : (
              results && (
                <>
                  <ResultSection
                    label="Links"      icon={LucideLink2}
                    items={results.results.links}          total={results.totals.links}
                    shown={shownCounts.links}              onLoadMore={() => loadMore("links")}
                    searchTerm={query}
                    startIndex={sectionStarts.links}
                    focusedIndex={focusedIndex}
                  />
                  <ResultSection
                    label="Notes"     icon={LucideNotebookPen}
                    items={results.results.notes}          total={results.totals.notes}
                    shown={shownCounts.notes}              onLoadMore={() => loadMore("notes")}
                    searchTerm={query}
                    startIndex={sectionStarts.notes}
                    focusedIndex={focusedIndex}
                  />
                  <ResultSection
                    label="Snippets"  icon={LucideCodeXml}
                    items={results.results.snippets}       total={results.totals.snippets}
                    shown={shownCounts.snippets}           onLoadMore={() => loadMore("snippets")}
                    searchTerm={query}
                    startIndex={sectionStarts.snippets}
                    focusedIndex={focusedIndex}
                  />
                  <ResultSection
                    label="Prompts"   icon={LucideMessageSquare}
                    items={results.results.prompts}        total={results.totals.prompts}
                    shown={shownCounts.prompts}            onLoadMore={() => loadMore("prompts")}
                    searchTerm={query}
                    startIndex={sectionStarts.prompts}
                    focusedIndex={focusedIndex}
                  />
                  <ResultSection
                    label="Infrastructure" icon={LucideServer}
                    items={results.results.infrastructures} total={results.totals.infrastructures}
                    shown={shownCounts.infrastructures}    onLoadMore={() => loadMore("infrastructures")}
                    searchTerm={query}
                    startIndex={sectionStarts.infrastructures}
                    focusedIndex={focusedIndex}
                  />
                </>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Result Section ───────────────────────────────────────────────────────────

interface ResultSectionProps {
  label: string;
  icon: React.ComponentType<{ width?: number; className?: string }>;
  items: SearchResult[];
  total: number;
  shown: number;
  onLoadMore: () => void;
  searchTerm: string;
  startIndex: number;
  focusedIndex: number | null;
}

function ResultSection({ label, icon: Icon, items, total, shown, onLoadMore, searchTerm, startIndex, focusedIndex }: ResultSectionProps) {
  if (items.length === 0) return null;

  const visibleItems = items.slice(0, shown);
  const hasMore = shown < items.length;

  return (
    <div className="search-section">
      <h3 className="search-section-title">
        <Icon width={16} />
        {label}
        <span className="search-section-count">
          {shown < items.length
            ? `${shown} of ${total}`
            : total > items.length
              ? `${items.length} of ${total}`
              : items.length}
        </span>
      </h3>
      <div className="search-cards">
        {visibleItems.map((item, i) => (
          <SearchResultCard
            key={item.id}
            result={item}
            searchTerm={searchTerm}
            isFocused={focusedIndex === startIndex + i}
          />
        ))}
      </div>
      {hasMore && (
        <button className="search-load-more" onClick={onLoadMore}>
          Load {Math.min(LOAD_MORE_STEP, items.length - shown)} more
        </button>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.search-page {
  display:        flex;
  flex-direction: column;
  gap:            10px;
  height:         100%;
  overflow:       hidden;
  padding:        15px 24px 0;
}
.page-header      { flex-shrink: 0; }
.search-input-wrap { flex-shrink: 0; }

.page-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding :        15px 10px 0px 10px;
  flex-wrap:       wrap;
}
.page-title {
  font-size:       var(--text-2xl);
  font-weight:     700;
  color:           var(--text-primary);
  letter-spacing:  -0.02em;
}
.page-subtitle {
  font-size:  var(--text-sm);
  color:      var(--text-tertiary);
  margin-top: 2px;
}

.search-input-wrap {
  position:    relative;
  display:     flex;
  align-items: center;
}
.search-input-icon {
  position:  absolute;
  left:      16px;
  width:     18px;
  height:    18px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.search-input {
  width:            100%;
  height:           52px;
  padding:          0 100px 0 48px;
  background:       var(--bg-surface);
  border:           2px solid var(--border-default);
  border-radius:    var(--radius-lg);
  color:            var(--text-primary);
  font-family:      var(--font-sans);
  font-size:        var(--text-lg);
  outline:          none;
  transition:       border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.search-input::placeholder { color: var(--text-tertiary); }
.search-input:focus {
  border-color: var(--border-focus);
  box-shadow:   0 0 0 4px rgba(6,182,212,0.1);
}
.search-input-clear {
  position:    absolute;
  right:       14px;
  display:     flex;
  align-items: center;
  justify-content: center;
  width:       32px;
  height:      32px;
  background:  var(--bg-overlay);
  border:      none;
  border-radius: var(--radius-md);
  color:       var(--text-tertiary);
  cursor:      pointer;
  transition:  background var(--transition-fast), color var(--transition-fast);
}
.search-input-clear:hover { background: var(--bg-subtle); color: var(--text-primary); }
.search-input-kbd {
  position:    absolute;
  right:       14px;
  display:     flex;
  align-items: center;
  gap:         4px;
  padding:     5px 10px;
  background:  var(--bg-overlay);
  border:      1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size:   var(--text-xs);
  font-family: var(--font-mono);
  color:       var(--text-tertiary);
  pointer-events: none;
}
@media (max-width: 639px) {
  .search-input-kbd { display: none; }
  .search-input { padding-right: 16px; font-size: var(--text-base); height: 46px; }
}

.search-body {
  display:    flex;
  gap:        20px;
  flex:       1;
  min-height: 0;
  overflow:   hidden;
  padding-bottom: 24px;
}
@media (max-width: 1023px) {
  .search-body { flex-direction: column; overflow-y: auto; }
}

.search-filters {
  width:      240px;
  flex-shrink: 0;
  height:     100%;
  overflow-y: auto;
}
@media (max-width: 1023px) {
  .search-filters { width: 100%; height: auto; overflow: visible; }
}

.search-results {
  flex:       1;
  min-width:  0;
  height:     100%;
  overflow-y: auto;
}
@media (max-width: 1023px) {
  .search-results { height: auto; overflow: visible; }
}

.search-loading {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             12px;
  padding:         64px 24px;
  background:      var(--bg-surface);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
}
.search-loading-icon {
  color:    var(--accent);
  animation: search-spin 0.8s linear infinite;
}
.search-loading-text {
  font-size: var(--text-sm);
  color:     var(--text-tertiary);
}
@keyframes search-spin { to { transform: rotate(360deg); } }

.search-section {
  margin-bottom: 28px;
}
.search-section:last-child { margin-bottom: 0; }
.search-section-title {
  display:       flex;
  align-items:   center;
  gap:           8px;
  font-size:     var(--text-base);
  font-weight:   600;
  color:         var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom:  1px solid var(--border-default);
}
.search-section-count {
  font-size:   var(--text-xs);
  font-weight: 500;
  color:       var(--text-tertiary);
  background:  var(--bg-overlay);
  padding:     1px 8px;
  border-radius: var(--radius-full);
  margin-left: auto;
}

.search-cards {
  display:        flex;
  flex-direction: column;
  gap:            8px;
}

/* P3-12: Load More button */
.search-load-more {
  display:       block;
  width:         100%;
  margin-top:    10px;
  padding:       9px 0;
  background:    var(--bg-overlay);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size:     var(--text-sm);
  color:         var(--text-secondary);
  cursor:        pointer;
  transition:    background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  text-align:    center;
}
.search-load-more:hover {
  background:    var(--bg-subtle);
  border-color:  var(--border-strong);
  color:         var(--text-primary);
}
`;
