'use client';

import { useState } from 'react';
import { usePrompts } from '@/hooks/usePrompt';
import { useCategories } from '@/hooks/useCategories';
import { Prompt, PROMPT_TYPES } from '@/types/prompt';
import PromptCard from '@/components/prompts/PromptCard';
import PromptForm from '@/components/prompts/PromptForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function PromptsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFavorites, setShowFavorites] = useState(false);

  const { data: categories } = useCategories();
  const { data: prompts, isLoading } = usePrompts({
    search: searchTerm || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
    promptType: selectedType || undefined,
    isFavorite: showFavorites || undefined,
  });

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingPrompt(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedCategory('');
    setShowFavorites(false);
  };

  const hasFilters = searchTerm || selectedType || selectedCategory || showFavorites;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Prompts</h2>
            <p className="mt-1 text-sm text-gray-600">
              Store and reuse AI prompts with variable templates
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>+ New Prompt</Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Types</option>
              {Object.entries(PROMPT_TYPES).map(([key, { label, icon }]) => (
                <option key={key} value={key}>{icon} {label}</option>
              ))}
            </select>
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
            <label className="flex items-center gap-2 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={showFavorites}
                onChange={(e) => setShowFavorites(e.target.checked)}
                className="w-4 h-4"
              />
              ⭐ Favorites
            </label>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-red-600">Clear filters</button>
          )}
        </div>
      </div>

      {/* Prompts Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : prompts && prompts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No prompts found</p>
          {!hasFilters && (
            <Button onClick={() => setIsFormOpen(true)} className="mt-4">
              Create your first prompt
            </Button>
          )}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={handleClose} size="large">
        <PromptForm prompt={editingPrompt} onClose={handleClose} />
      </Modal>
    </div>
  );
}