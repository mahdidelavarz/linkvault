'use client';

import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTag';
import Button from '@/components/ui/Button';

interface SearchFiltersProps {
  type: string;
  categoryId?: number;
  selectedTagIds: number[];
  onTypeChange: (type: string) => void;
  onCategoryChange: (categoryId: number | undefined) => void;
  onTagsChange: (tagIds: number[]) => void;
  onClear: () => void;
}

export default function SearchFilters({
  type,
  categoryId,
  selectedTagIds,
  onTypeChange,
  onCategoryChange,
  onTagsChange,
  onClear
}: SearchFiltersProps) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const hasFilters = type !== 'all' || categoryId || selectedTagIds.length > 0;

  const toggleTag = (tagId: number) => {
    const newTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onTagsChange(newTags);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: '🔍 All' },
            { value: 'link', label: '🔗 Links' },
            { value: 'note', label: '📝 Notes' },
            { value: 'snippet', label: '💻 Snippets' },
          ].map((item) => (
            <Button
              key={item.value}
              onClick={() => onTypeChange(item.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                type === item.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={categoryId || ''}
          onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
          ))}
        </select>
      </div>

      {/* Tags Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags {selectedTagIds.length > 0 && `(${selectedTagIds.length})`}
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {tags?.map((tag) => (
            <Button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag.name}
            </Button>
          ))}
          {(!tags || tags.length === 0) && (
            <p className="text-xs text-gray-400">No tags available</p>
          )}
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          onClick={onClear}
          className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}