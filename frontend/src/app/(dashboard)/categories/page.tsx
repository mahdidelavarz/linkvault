"use client";

import { useState, useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { type Category } from "@/types/category";
import CategoryTree from "@/components/categories/CategoryTree";
import CategoryForm from "@/components/categories/CategoryForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  LucidePlus,
  LucideSearchX,
} from "@/Icons/Icons";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<number | undefined>(undefined);

  const { data: categories, isLoading } = useCategories();

  const openCreateRoot = () => {
    setEditingCategory(null);
    setParentId(undefined);
    setModalOpen(true);
  };

  const openCreateChild = (parentId: number) => {
    setEditingCategory(null);
    setParentId(parentId);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setParentId(undefined);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setParentId(undefined);
  };

  // Build tree structure - memoized and with null safety
  const categoryTree = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];

    const map = new Map<number, Category>();
    const roots: Category[] = [];

    // First pass: create all nodes with empty children arrays
    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build parent-child relationships
    categories.forEach((cat) => {
      const node = map.get(cat.id);
      if (!node) return;

      if (cat.parentId && map.has(cat.parentId)) {
        const parent = map.get(cat.parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [categories]);

  return (
    <>
      <style>{CSS}</style>
      <div className="categories-page">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">
              {isLoading
                ? "…"
                : `${categories?.length ?? 0} categories`}
            </p>
          </div>
          <Button leftIcon={LucidePlus} onClick={openCreateRoot}>
            Add Category
          </Button>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="categories-skeleton">
            {[...Array(5)].map((_, i) => (
              <CategorySkeleton key={i} level={i % 3 === 0 ? 0 : 1} />
            ))}
          </div>
        ) : categoryTree.length > 0 ? (
          <div className="categories-panel">
            <CategoryTree
              categories={categoryTree}
              onEdit={openEdit}
              onAddChild={openCreateChild}
            />
          </div>
        ) : (
          <EmptyState onAdd={openCreateRoot} />
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingCategory
            ? "Edit Category"
            : parentId
              ? "Add Subcategory"
              : "Add Category"
        }
        size="md"
      >
        <CategoryForm
          category={editingCategory}
          parentId={parentId}
          onClose={closeModal}
        />
      </Modal>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CategorySkeleton({ level }: { level: number }) {
  return (
    <div
      className="category-skeleton"
      style={{ paddingLeft: level === 1 ? 28 : 0 }}
    >
      <div
        className="skeleton"
        style={{ height: 16, width: 14, marginRight: 8, flexShrink: 0 }}
      />
      <div
        className="skeleton"
        style={{ height: 16, width: "40%", marginRight: 12 }}
      />
      <div
        className="skeleton"
        style={{ height: 14, width: 60, marginLeft: "auto", marginRight: 8 }}
      />
      <div className="skeleton" style={{ height: 14, width: 28 }} />
      <div className="skeleton" style={{ height: 14, width: 36 }} />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <LucideSearchX width={28} />
      </div>
      <p className="empty-title">No categories yet</p>
      <p className="empty-subtitle">
        Create categories to organize your links and notes
      </p>
      <Button leftIcon={LucidePlus} onClick={onAdd}>
        Create your first category
      </Button>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.categories-page { display: flex; flex-direction: column; gap: 20px; }

/* Header */
.page-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             16px;
  flex-wrap:       wrap;
}
.page-title    { font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.page-subtitle { font-size: var(--text-sm);  color: var(--text-tertiary); margin-top: 2px; }

/* Panel */
.categories-panel {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px 24px;
}

/* Category skeleton */
.categories-skeleton {
  display:        flex;
  flex-direction: column;
  gap:            8px;
  padding:        20px 24px;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
}
.category-skeleton {
  display:     flex;
  align-items: center;
  padding:     10px 12px;
  background:  var(--bg-subtle);
  border-radius: var(--radius-md);
}

/* Empty state */
.empty-state {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             12px;
  padding:         64px 24px;
  background:      var(--bg-surface);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  text-align:      center;
}
.empty-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           56px;
  height:          56px;
  background:      var(--bg-overlay);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  color:           var(--text-tertiary);
}
.empty-title    { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.empty-subtitle { font-size: var(--text-sm); color: var(--text-tertiary); }
`;