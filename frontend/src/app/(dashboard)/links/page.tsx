'use client';

import { useState } from 'react';
import { useLinks } from '@/hooks/useLinks';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTag';
import { Link } from '@/types/link';
import LinkCard from '@/components/links/LinkCard';
import LinkForm from '@/components/links/LinkForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function LinksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFavorites, setShowFavorites] = useState(false);

  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const { data: links, isLoading } = useLinks({
    search: searchTerm || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
    isFavorite: showFavorites || undefined,
  });

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowFavorites(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory || showFavorites;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Links</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage your saved links
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Add Link
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  📁 {category.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showFavorites}
                onChange={(e) => setShowFavorites(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>⭐ Favorites Only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Links Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading links...</p>
        </div>
      ) : links && links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            {hasActiveFilters 
              ? 'No links found matching your filters' 
              : 'No links yet'}
          </p>
          {!hasActiveFilters && (
            <Button onClick={() => setIsModalOpen(true)}>
              Add your first link
            </Button>
          )}
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <LinkForm link={editingLink} onClose={handleClose} />
      </Modal>
    </div>
  );
}