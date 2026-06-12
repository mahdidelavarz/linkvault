"use client";

import { useState } from "react";
import { type Category } from "@/features/categories/types/category";
import { useDeleteCategory } from "@/features/categories/hooks/useCategories";
import {
  LucideChevronRight,
  LucideFolder,
  LucideFolderOpen,
  LucideLink2,
  LucideNotebookPen,
  LucidePlus,
  LucidePencil,
  LucideTrash2,
} from "@/Icons/Icons";

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onAddChild: (parentId: number) => void;
  level?: number;
}

export default function CategoryTree({
  categories,
  onEdit,
  onAddChild,
  level = 0,
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const deleteCategory = useDeleteCategory();

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? Links and notes in this category will become uncategorized."
      )
    ) {
      deleteCategory.mutate(id);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <ul className="category-tree-list" style={{ paddingLeft: level * 20 }}>
        {categories.map((category) => {
          const hasChildren =
            category.children && category.children.length > 0;
          const isOpen = expanded[category.id] ?? level < 1; // auto-expand first level

          return (
            <li key={category.id}>
              <div className="category-tree-row">
                {/* Expand toggle */}
                <button
                  className={[
                    "tree-expand",
                    !hasChildren ? "tree-expand--hidden" : "",
                    isOpen ? "tree-expand--open" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => hasChildren && toggleExpand(category.id)}
                  disabled={!hasChildren}
                  aria-label={isOpen ? "Collapse" : "Expand"}
                >
                  <LucideChevronRight width={14} />
                </button>

                {/* Icon */}
                <span className="tree-icon">
                  {isOpen && hasChildren ? (
                    <LucideFolderOpen width={16} />
                  ) : (
                    <LucideFolder width={16} />
                  )}
                </span>

                {/* Name */}
                <span className="tree-name">{category.name}</span>

                {/* Counts */}
                <span className="tree-counts">
                  {category._count && (
                    <>
                      {category._count.links > 0 && (
                        <span className="tree-count">
                          <LucideLink2 width={11} />
                          {category._count.links}
                        </span>
                      )}
                      {category._count.notes > 0 && (
                        <span className="tree-count">
                          <LucideNotebookPen width={11} />
                          {category._count.notes}
                        </span>
                      )}
                    </>
                  )}
                </span>

                {/* Actions */}
                <div className="tree-actions">
                  <button
                    className="tree-action-btn"
                    onClick={() => onAddChild(category.id)}
                    title="Add subcategory"
                  >
                    <LucidePlus width={14} />
                  </button>
                  <button
                    className="tree-action-btn"
                    onClick={() => onEdit(category)}
                    title="Edit"
                  >
                    <LucidePencil width={13} />
                  </button>
                  <button
                    className="tree-action-btn tree-action-btn--danger"
                    onClick={() => handleDelete(category.id)}
                    title="Delete"
                  >
                    <LucideTrash2 width={13} />
                  </button>
                </div>
              </div>

              {/* Children */}
              {isOpen && hasChildren && (
                <CategoryTree
                  categories={category.children!}
                  onEdit={onEdit}
                  onAddChild={onAddChild}
                  level={level + 1}
                />
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.category-tree-list {
  list-style: none;
  margin:      0;
  padding:     0;
}

.category-tree-row {
  display:       flex;
  align-items:   center;
  gap:           8px;
  padding:       8px 10px;
  border-radius: var(--radius-md);
  transition:    background var(--transition-fast);
}
.category-tree-row:hover { background: var(--bg-subtle); }

/* Expand button */
.tree-expand {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           20px;
  height:          20px;
  padding:         0;
  background:      transparent;
  border:          none;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  transition:      transform var(--transition-fast), color var(--transition-fast);
  flex-shrink:     0;
}
.tree-expand:hover          { color: var(--text-primary); background: var(--bg-overlay); }
.tree-expand--open          { transform: rotate(90deg); }
.tree-expand--hidden        { visibility: hidden; pointer-events: none; }

/* Icon */
.tree-icon {
  display:     flex;
  align-items: center;
  color:       var(--text-tertiary);
  flex-shrink: 0;
}

/* Name */
.tree-name {
  flex:          1;
  font-size:     var(--text-sm);
  font-weight:   500;
  color:         var(--text-primary);
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
}

/* Counts */
.tree-counts {
  display:     flex;
  align-items: center;
  gap:         10px;
  flex-shrink: 0;
}
.tree-count {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
}

/* Actions */
.tree-actions {
  display:     flex;
  align-items: center;
  gap:         2px;
  opacity:     0;
  transition:  opacity var(--transition-fast);
  flex-shrink: 0;
}
.category-tree-row:hover .tree-actions { opacity: 1; }

.tree-action-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  padding:         0;
  background:      transparent;
  border:          none;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  transition:      color var(--transition-fast), background var(--transition-fast);
}
.tree-action-btn:hover          { color: var(--text-primary); background: var(--bg-overlay); }
.tree-action-btn--danger:hover  { color: var(--danger); background: var(--danger-muted); }
`;