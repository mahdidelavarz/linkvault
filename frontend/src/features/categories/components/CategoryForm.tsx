"use client";

import { useState, useEffect } from "react";
import { type Category } from "@/features/categories/types/category";
import { useCreateCategory, useUpdateCategory, useCategories } from "@/features/categories/hooks/useCategories";
import Button from "@/features/shared/ui/Button";
import Alert from "@/features/shared/ui/Alert";
import { LucideFolder } from "@/Icons/Icons";

interface CategoryFormProps {
  category?: Category | null;
  parentId?: number;
  onClose: () => void;
}

export default function CategoryForm({
  category,
  parentId,
  onClose,
}: CategoryFormProps) {
  const isEditing = !!category;
  const [name, setName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>(
    parentId
  );

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
          parentId: selectedParentId,
        });
      } else {
        await createCategory.mutateAsync({
          name,
          parentId: selectedParentId,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const isLoading = createCategory.isPending || updateCategory.isPending;
  const error = createCategory.error || updateCategory.error;

  // Filter out the current category and its children to prevent circular reference
  const availableParents = categories?.filter((cat) => {
    if (!category) return true;
    return cat.id !== category.id && !isDescendant(cat, category.id);
  });

  function isDescendant(cat: Category, targetId: number): boolean {
    if (cat.id === targetId) return true;
    if (cat.children) {
      return cat.children.some((child) => isDescendant(child, targetId));
    }
    return false;
  }

  return (
    <>
      <style>{CSS}</style>
      <form onSubmit={handleSubmit} className="category-form">
        {error && (
          <Alert
            type="error"
            message={
              error instanceof Error ? error.message : "An error occurred"
            }
          />
        )}

        <div className="form-field">
          <label className="form-label" htmlFor="cat-name">
            Category Name <span className="required">*</span>
          </label>
          <input
            id="cat-name"
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter category name"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="cat-parent">
            Parent Category
          </label>
          <div className="form-select-wrap">
            <LucideFolder className="form-select-icon" />
            <select
              id="cat-parent"
              className="form-select"
              value={selectedParentId || ""}
              onChange={(e) =>
                setSelectedParentId(
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            >
              <option value="">None (Root Category)</option>
              {availableParents?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.category-form {
  display:        flex;
  flex-direction: column;
  gap:            20px;
}

.form-field {
  display:        flex;
  flex-direction: column;
  gap:            6px;
}
.form-label {
  font-size:   var(--text-sm);
  font-weight: 600;
  color:       var(--text-secondary);
}
.required { color: var(--danger); }

.form-input {
  height:          40px;
  padding:         0 12px;
  background:      var(--bg-subtle);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-md);
  color:           var(--text-primary);
  font-family:     var(--font-sans);
  font-size:       var(--text-sm);
  outline:         none;
  transition:      border-color var(--transition-fast), background var(--transition-fast);
}
.form-input::placeholder { color: var(--text-tertiary); }
.form-input:focus { border-color: var(--border-focus); background: var(--bg-elevated); }

.form-select-wrap {
  position: relative;
  display:  flex;
  align-items: center;
}
.form-select-icon {
  position:  absolute;
  left:      10px;
  width:     14px;
  height:    14px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.form-select {
  width:            100%;
  height:           40px;
  padding:          0 12px 0 32px;
  background:       var(--bg-subtle);
  border:           1px solid var(--border-default);
  border-radius:    var(--radius-md);
  color:            var(--text-primary);
  font-family:      var(--font-sans);
  font-size:        var(--text-sm);
  outline:          none;
  cursor:           pointer;
  appearance:       none;
  -webkit-appearance: none;
  transition:       border-color var(--transition-fast);
}
.form-select:focus { border-color: var(--border-focus); }

.form-actions {
  display:         flex;
  justify-content: flex-end;
  gap:             12px;
  padding-top:     8px;
  border-top:      1px solid var(--border-default);
}
`;