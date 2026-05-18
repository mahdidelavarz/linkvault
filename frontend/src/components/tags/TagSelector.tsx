'use client';

import { useState, useRef, useEffect } from 'react';
import { useTags } from '@/hooks/useTag';
import { Tag } from '@/types/tag';

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export default function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: tags } = useTags();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTags = tags?.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedTags = tags?.filter(tag => selectedTagIds.includes(tag.id)) || [];

  const toggleTag = (tagId: number) => {
    const newSelection = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onChange(newSelection);
  };

  const removeTag = (tagId: number) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tags
      </label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <span className={selectedTagIds.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
            {selectedTagIds.length === 0 
              ? 'Select tags...' 
              : `${selectedTagIds.length} tag(s) selected`}
          </span>
          <span className="float-right text-gray-400">▼</span>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {/* Search Input */}
            <div className="sticky top-0 bg-white p-2 border-b">
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Tag List */}
            <div className="py-1">
              {filteredTags.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No matching tags' : 'No tags available'}
                </div>
              ) : (
                filteredTags.map(tag => (
                  <div
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700">{tag.name}</span>
                  </div>
                ))
              )}
            </div>

            {/* Done Button */}
            <div className="sticky bottom-0 bg-gray-50 p-2 border-t">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create new tag suggestion */}
      {searchTerm && filteredTags.length === 0 && (
        <p className="mt-1 text-xs text-gray-500">
          Tag not found? Create it in the Tags page first.
        </p>
      )}
    </div>
  );
}