'use client';

import { useState, useMemo } from 'react';
import { useSnippets } from '@/hooks/useSnippet';
import { useCategories } from '@/hooks/useCategories';
import { Snippet, SNIPPET_TYPES, TYPE_LANGUAGES, SnippetType } from '@/types/snippet';
import { getLanguageIcon, getLanguageName } from '@/lib/languageDetector';
import SnippetCard from '@/components/snippets/SnippetCard';
import SnippetForm from '@/components/snippets/SnippetForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';

// Language options for filter
const ALL_LANGUAGES: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'React JSX',
  ts: 'TypeScript',
  tsx: 'React TSX',
  py: 'Python',
  rb: 'Ruby',
  java: 'Java',
  go: 'Go',
  rs: 'Rust',
  php: 'PHP',
  sql: 'SQL',
  sh: 'Shell/Bash',
  bash: 'Bash',
  powershell: 'PowerShell',
  dockerfile: 'Docker',
  yaml: 'YAML',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  md: 'Markdown',
  regex: 'Regex',
  curl: 'cURL',
  txt: 'Plain Text',
};

export default function SnippetsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: categories } = useCategories();
  const { data: snippets, isLoading } = useSnippets({
    search: searchTerm || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
    snippetType: selectedType || undefined,
    language: selectedLanguage || undefined,
    isFavorite: showFavorites || undefined,
  });

  // Get available languages based on selected type
  const availableLanguages = useMemo(() => {
    if (!selectedType) return ALL_LANGUAGES;
    const typeLanguages = TYPE_LANGUAGES[selectedType as SnippetType];
    if (!typeLanguages) return ALL_LANGUAGES;
    
    const filtered: Record<string, string> = {};
    typeLanguages.forEach(lang => {
      if (ALL_LANGUAGES[lang]) {
        filtered[lang] = ALL_LANGUAGES[lang];
      }
    });
    return filtered;
  }, [selectedType]);

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsFormOpen(true);
  };

  const handleCopy = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingSnippet(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedLanguage('');
    setShowFavorites(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedType || selectedLanguage || showFavorites;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Snippets</h2>
            <p className="mt-1 text-sm text-gray-600">
              Store code snippets, SQL queries, regex patterns, commands, and more
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            + New Snippet
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setSelectedLanguage('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {Object.entries(SNIPPET_TYPES).map(([key, { label, icon }]) => (
                <option key={key} value={key}>{icon} {label}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Languages</option>
              {Object.entries(availableLanguages).map(([key, name]) => (
                <option key={key} value={key}>{getLanguageIcon(key)} {name}</option>
              ))}
            </select>

            {/* Favorites Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showFavorites}
                onChange={(e) => setShowFavorites(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>⭐ Favorites Only</span>
            </label>
          </div>

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex flex-wrap gap-2">
                {selectedType && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {SNIPPET_TYPES[selectedType as SnippetType]?.icon} {SNIPPET_TYPES[selectedType as SnippetType]?.label}
                    <button onClick={() => setSelectedType('')} className="ml-1 hover:text-blue-600">×</button>
                  </span>
                )}
                {selectedCategory && categories && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    📁 {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                    <button onClick={() => setSelectedCategory('')} className="ml-1 hover:text-green-600">×</button>
                  </span>
                )}
                {selectedLanguage && (
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {getLanguageIcon(selectedLanguage)} {getLanguageName(selectedLanguage)}
                    <button onClick={() => setSelectedLanguage('')} className="ml-1 hover:text-purple-600">×</button>
                  </span>
                )}
                {showFavorites && (
                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    ⭐ Favorites
                    <button onClick={() => setShowFavorites(false)} className="ml-1 hover:text-yellow-600">×</button>
                  </span>
                )}
              </div>
              <button 
                onClick={clearFilters} 
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Copy Notification */}
      {copiedId && (
        <div className="fixed top-4 right-4 z-50">
          <Alert type="success" message="📋 Copied to clipboard!" />
        </div>
      )}

      {/* Results Count */}
      {snippets && !isLoading && (
        <div className="mb-4 text-sm text-gray-500">
          {snippets.length} snippet{snippets.length !== 1 ? 's' : ''} found
          {hasActiveFilters && ' (filtered)'}
        </div>
      )}

      {/* Snippets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : snippets && snippets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {snippets.map((snippet : Snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={handleEdit}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          {hasActiveFilters ? (
            <>
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-gray-500 text-lg mb-2">No snippets match your filters</p>
              <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
              <Button variant="secondary" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-6xl mb-4">💻</p>
              <p className="text-gray-500 text-lg mb-2">No snippets yet</p>
              <p className="text-gray-400 text-sm mb-4">
                Start by creating your first code snippet, SQL query, or regex pattern
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                + Create Your First Snippet
              </Button>
            </>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isFormOpen} onClose={handleClose} size="lg">
        <SnippetForm snippet={editingSnippet} onClose={handleClose} />
      </Modal>
    </div>
  );
}