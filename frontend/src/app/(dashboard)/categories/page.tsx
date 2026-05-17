'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/category';
import CategoryTree from '@/components/categories/CategoryTree';
import CategoryForm from '@/components/categories/CategoryForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<number | undefined>(undefined);

  const { data: categories, isLoading } = useCategories();

  const handleAddRoot = () => {
    setEditingCategory(null);
    setParentId(undefined);
    setIsModalOpen(true);
  };

  const handleAddChild = (parentId: number) => {
    setEditingCategory(null);
    setParentId(parentId);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setParentId(undefined);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setParentId(undefined);
  };

  // Build tree structure
  const buildTree = (cats: Category[]): Category[] => {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    cats.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    cats.forEach(cat => {
      if (cat.parentId && map.has(cat.parentId)) {
        const parent = map.get(cat.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(map.get(cat.id)!);
      } else {
        roots.push(map.get(cat.id)!);
      }
    });

    return roots;
  };

  const categoryTree = categories ? buildTree(categories) : [];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <p className="mt-1 text-sm text-gray-600">
              Organize your links and notes with categories
            </p>
          </div>
          <Button onClick={handleAddRoot}>
            + Add Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      ) : categoryTree.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <CategoryTree
            categories={categoryTree}
            onEdit={handleEdit}
            onAddChild={handleAddChild}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            No categories yet
          </p>
          <Button onClick={handleAddRoot}>
            Create your first category
          </Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <CategoryForm
          category={editingCategory}
          parentId={parentId}
          onClose={handleClose}
        />
      </Modal>
    </div>
  );
}