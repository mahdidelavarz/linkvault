'use client';

import { useState } from 'react';
import { Category } from '@/types/category';
import { useDeleteCategory } from '@/hooks/useCategories';
import Button from '@/components/ui/Button';

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onAddChild: (parentId: number) => void;
  level?: number;
}

export default function CategoryTree({ categories, onEdit, onAddChild, level = 0 }: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const deleteCategory = useDeleteCategory();

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? Links and notes in this category will become uncategorized.')) {
      deleteCategory.mutate(id);
    }
  };

  return (
    <ul className={`${level > 0 ? 'ml-4' : ''}`}>
      {categories.map((category) => (
        <li key={category.id} className="mb-1">
          <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group">
            {/* Expand/Collapse */}
            {category.children && category.children.length > 0 && (
              <button
                onClick={() => toggleExpand(category.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                {expanded[category.id] ? '📂' : '📁'}
              </button>
            )}
            {(!category.children || category.children.length === 0) && (
              <span className="text-gray-400">📄</span>
            )}

            {/* Category Name */}
            <span className="flex-1 text-sm font-medium text-gray-700">
              {category.name}
            </span>

            {/* Counts */}
            <span className="text-xs text-gray-400">
              {category._count && (
                <>
                  {category._count.links > 0 && `${category._count.links} links`}
                  {category._count.links > 0 && category._count.notes > 0 && ', '}
                  {category._count.notes > 0 && `${category._count.notes} notes`}
                </>
              )}
            </span>

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => onAddChild(category.id)}
                className="text-xs text-blue-600 hover:text-blue-800"
                title="Add subcategory"
              >
                + Add
              </button>
              <button
                onClick={() => onEdit(category)}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Children */}
          {expanded[category.id] && category.children && category.children.length > 0 && (
            <CategoryTree
              categories={category.children}
              onEdit={onEdit}
              onAddChild={onAddChild}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}