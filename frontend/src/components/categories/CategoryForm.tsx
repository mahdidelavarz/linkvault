'use client';

import { useState, useEffect } from 'react';
import { Category, CreateCategoryDto } from '@/types/category';
import { useCreateCategory, useUpdateCategory, useCategories } from '@/hooks/useCategories';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface CategoryFormProps {
  category?: Category | null;
  parentId?: number;
  onClose: () => void;
}

export default function CategoryForm({ category, parentId, onClose }: CategoryFormProps) {
  const isEditing = !!category;
  const [name, setName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>(parentId);
  
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSelectedParentId(category.parentId);
    } else if (parentId) {
      setSelectedParentId(parentId);
    }
  }, [category, parentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ 
          id: category.id, 
          name, 
          parentId: selectedParentId 
        });
      } else {
        await createCategory.mutateAsync({ 
          name, 
          parentId: selectedParentId 
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const isLoading = createCategory.isPending || updateCategory.isPending;
  const error = createCategory.error || updateCategory.error;

  // Filter out the current category and its children to prevent circular reference
  const availableParents = categories?.filter(cat => {
    if (!category) return true;
    return cat.id !== category.id && !isDescendant(cat, category.id);
  });

  function isDescendant(cat: Category, targetId: number): boolean {
    if (cat.id === targetId) return true;
    if (cat.children) {
      return cat.children.some(child => isDescendant(child, targetId));
    }
    return false;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Category' : 'Create New Category'}
      </h3>

      {error && (
        <Alert 
          type="error" 
          message={error instanceof Error ? error.message : 'An error occurred'} 
        />
      )}

      <Input
        label="Category Name *"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Enter category name"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category
        </label>
        <select
          value={selectedParentId || ''}
          onChange={(e) => setSelectedParentId(e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">None (Root Category)</option>
          {availableParents?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}