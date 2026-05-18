'use client';

import { useState } from 'react';
import { useSnippets } from '@/hooks/useSnippet';
import { useCategories } from '@/hooks/useCategories';
import { Snippet, LANGUAGES } from '@/types/snippet';
import SnippetCard from '@/components/snippets/SnippetCard';
import SnippetForm from '@/components/snippets/SnippetForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';

export default function SnippetsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: categories } = useCategories();
  const { data: snippets, isLoading } = useSnippets({
    search: searchTerm || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
    language: selectedLanguage || undefined,
    isFavorite: showFavorites || undefined,
  });

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
    setSelectedLanguage('');
    setShowFavorites(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedLanguage || showFavorites;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Snippets</h2>
            <p className="mt-1 text-sm text-gray-600">
              Store code snippets, commands, and configurations
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            + New Snippet
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
              ))}
            </select>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Languages</option>
              {Object.entries(LANGUAGES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showFavorites}
                onChange={(e) => setShowFavorites(e.target.checked)}
                className="w-4 h-4"
              />
              ⭐ Favorites
            </label>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-red-600">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {copiedId && (
        <div className="fixed top-4 right-4 z-50">
          <Alert type="success" message="Copied to clipboard!" />
        </div>
      )}

      {/* Snippets Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : snippets && snippets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {snippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={handleEdit}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No snippets found</p>
          {!hasActiveFilters && (
            <Button onClick={() => setIsFormOpen(true)} className="mt-4">
              Create your first snippet
            </Button>
          )}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={handleClose} size="large">
        <SnippetForm snippet={editingSnippet} onClose={handleClose} />
      </Modal>
    </div>
  );
}