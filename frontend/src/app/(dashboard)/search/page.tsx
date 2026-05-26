"use client";

import { useState, useEffect, useCallback } from "react";
import { useGlobalSearch } from "@/hooks/useSearch";
import { useSearchParams, useRouter } from "next/navigation";
import SearchResultCard from "@/components/search/SearchResultCard";
import SearchFilters from "@/components/search/SearchFilters";
import SearchEmptyState from "@/components/search/SearchEmptyState";
import {
  LucideSearch,
  LucideX,
  LucideCommand,
  SvgSpinnersRingResize,
} from "@/Icons/Icons";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tagIds, setTagIds] = useState<number[]>([]);

  const { data: results, isLoading } = useGlobalSearch({
    query,
    type: type !== "all" ? type : undefined,
    categoryId,
    tagIds,
  });

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type !== "all") params.set("type", type);
    if (categoryId) params.set("categoryId", categoryId.toString());
    if (tagIds.length > 0) params.set("tagIds", tagIds.join(","));

    const newUrl = `/search${params.toString() ? "?" + params.toString() : ""}`;
    router.replace(newUrl);
  }, [query, type, categoryId, tagIds, router]);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setType("all");
    setCategoryId(undefined);
    setTagIds([]);
  }, []);

  const hasQuery = query.length > 0;
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
            placeholder="Search links, notes, snippets & prompts…"
            autoFocus
          />
          {query ? (
            <button
              className="search-input-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
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
          {/* Filters Sidebar */}
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

          {/* Results Area */}
          <div className="search-results">
            {isLoading ? (
              <div className="search-loading">
                <SvgSpinnersRingResize className="search-loading-icon" width={28} />
                <p className="search-loading-text">Searching…</p>
              </div>
            ) : !hasResults ? (
              <SearchEmptyState
                hasQuery={hasQuery}
                hasFilters={
                  type !== "all" ||
                  categoryId !== undefined ||
                  tagIds.length > 0
                }
              />
            ) : (
              results && (
                <>
                  {/* Links */}
                  {results.results.links.length > 0 && (
                    <div className="search-section">
                      <h3 className="search-section-title">
                        <LucideSearch width={16} />
                        Links
                        <span className="search-section-count">
                          {results.results.links.length}
                        </span>
                      </h3>
                      <div className="search-cards">
                        {results.results.links.map((link) => (
                          <SearchResultCard
                            key={link.id}
                            result={link}
                            searchTerm={query}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {results.results.notes.length > 0 && (
                    <div className="search-section">
                      <h3 className="search-section-title">
                        <LucideSearch width={16} />
                        Notes
                        <span className="search-section-count">
                          {results.results.notes.length}
                        </span>
                      </h3>
                      <div className="search-cards">
                        {results.results.notes.map((note) => (
                          <SearchResultCard
                            key={note.id}
                            result={note}
                            searchTerm={query}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Snippets */}
                  {results.results.snippets.length > 0 && (
                    <div className="search-section">
                      <h3 className="search-section-title">
                        <LucideSearch width={16} />
                        Snippets
                        <span className="search-section-count">
                          {results.results.snippets.length}
                        </span>
                      </h3>
                      <div className="search-cards">
                        {results.results.snippets.map((snippet) => (
                          <SearchResultCard
                            key={snippet.id}
                            result={snippet}
                            searchTerm={query}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.search-page {
  display:        flex;
  flex-direction: column;
  gap:            20px;
}

/* Header */
.page-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             16px;
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

/* Search Input */
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

/* Body */
.search-body {
  display: flex;
  gap:     20px;
  align-items: flex-start;
}
@media (max-width: 1023px) {
  .search-body { flex-direction: column; }
}

/* Filters */
.search-filters {
  width:       240px;
  flex-shrink: 0;
}
@media (max-width: 1023px) {
  .search-filters { width: 100%; }
}

/* Results */
.search-results {
  flex:      1;
  min-width: 0;
}

/* Loading */
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
@keyframes search-spin {
  to { transform: rotate(360deg); }
}

/* Section */
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

/* Cards */
.search-cards {
  display:        flex;
  flex-direction: column;
  gap:            8px;
}
`;