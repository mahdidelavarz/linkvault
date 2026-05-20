'use client';

import { useState, useEffect } from 'react';
import { useGlobalSearch } from '@/hooks/useSearch';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchResultCard from '@/components/search/SearchResultCard';
import SearchFilters from '@/components/search/SearchFilters';
import SearchEmptyState from '@/components/search/SearchEmptyState';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState<string>('all');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tagIds, setTagIds] = useState<number[]>([]);

  const { data: results, isLoading } = useGlobalSearch({
    query,
    type: type !== 'all' ? type : undefined,
    categoryId,
    tagIds
  });

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (type !== 'all') params.set('type', type);
    if (categoryId) params.set('categoryId', categoryId.toString());
    if (tagIds.length > 0) params.set('tagIds', tagIds.join(','));
    
    const newUrl = `/search${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl);
  }, [query, type, categoryId, tagIds, router]);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearFilters = () => {
    setQuery('');
    setType('all');
    setCategoryId(undefined);
    setTagIds([]);
  };

  const hasQuery = query.length > 0;
  const hasFilters = type !== 'all' || categoryId !== undefined || tagIds.length > 0;
  const hasResults = results && results.totalResults > 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Search</h2>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-3.5 text-gray-400 text-lg">🔍</span>
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all your links, notes, and snippets... (Ctrl+K)"
            className="w-full pl-12 pr-20 py-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <SearchFilters
              type={type}
              categoryId={categoryId}
              selectedTagIds={tagIds}
              onTypeChange={setType}
              onCategoryChange={setCategoryId}
              onTagsChange={setTagIds}
              onClear={clearFilters}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !hasResults && (
              <SearchEmptyState hasQuery={hasQuery} hasFilters={hasFilters} />
            )}

            {/* Results */}
            {!isLoading && hasResults && results && (
              <div>
                <div className="mb-4 text-sm text-gray-500">
                  Found {results.totalResults} result{results.totalResults !== 1 ? 's' : ''}
                  {hasQuery && <> for "{query}"</>}
                </div>

                <div className="space-y-6">
                  {/* Links Results */}
                  {results.results.links.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        🔗 Links ({results.results.links.length})
                      </h3>
                      <div className="space-y-3">
                        {results.results.links.map(link => (
                          <SearchResultCard 
                            key={link.id} 
                            result={link} 
                            searchTerm={query}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes Results */}
                  {results.results.notes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        📝 Notes ({results.results.notes.length})
                      </h3>
                      <div className="space-y-3">
                        {results.results.notes.map(note => (
                          <SearchResultCard 
                            key={note.id} 
                            result={note} 
                            searchTerm={query}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Snippets Results */}
                  {results.results.snippets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        💻 Snippets ({results.results.snippets.length})
                      </h3>
                      <div className="space-y-3">
                        {results.results.snippets.map(snippet => (
                          <SearchResultCard 
                            key={snippet.id} 
                            result={snippet} 
                            searchTerm={query}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}