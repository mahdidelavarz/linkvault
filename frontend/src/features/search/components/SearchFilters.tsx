"use client";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { useTags } from "@/features/tags/hooks/useTag";
import {
  LucideFolder,
  LucideTag,
  LucideFilter,
  LucideX,
  LucideLink2,
  LucideNotebookPen,
  LucideCodeXml,
  LucideLayers,
  LucideMessageSquare,
  LucideServer,
} from "@/Icons/Icons";

interface SearchFiltersProps {
  type: string;
  categoryId?: number;
  selectedTagIds: number[];
  onTypeChange: (type: string) => void;
  onCategoryChange: (categoryId: number | undefined) => void;
  onTagsChange: (tagIds: number[]) => void;
  onClear: () => void;
}

const typeOptions = [
  { value: "all",            label: "All",            icon: LucideLayers },
  { value: "link",           label: "Links",          icon: LucideLink2 },
  { value: "note",           label: "Notes",          icon: LucideNotebookPen },
  { value: "snippet",        label: "Snippets",       icon: LucideCodeXml },
  { value: "prompt",         label: "Prompts",        icon: LucideMessageSquare },
  { value: "infrastructure", label: "Infrastructure", icon: LucideServer },
];

export default function SearchFilters({
  type,
  categoryId,
  selectedTagIds,
  onTypeChange,
  onCategoryChange,
  onTagsChange,
  onClear,
}: SearchFiltersProps) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const hasFilters =
    type !== "all" || categoryId || selectedTagIds.length > 0;

  const toggleTag = (tagId: number) => {
    const newTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onTagsChange(newTags);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="filters-panel">
        <div className="filters-header">
          <LucideFilter width={14} />
          <span className="filters-title">Filters</span>
          {hasFilters && (
            <button className="filters-clear" onClick={onClear}>
              <LucideX width={12} />
              Clear
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="filter-group">
          <label className="filter-label">Type</label>
          <div className="filter-type-options">
            {typeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onTypeChange(option.value)}
                  className={[
                    "filter-type-btn",
                    type === option.value ? "filter-type-btn--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Icon width={13} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <div className="filter-select-wrap">
            <LucideFolder className="filter-select-icon" />
            <select
              className="filter-select"
              value={categoryId || ""}
              onChange={(e) =>
                onCategoryChange(
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Tags
            {selectedTagIds.length > 0 && (
              <span className="filter-label-count">
                {selectedTagIds.length}
              </span>
            )}
          </label>
          <div className="filter-tags">
            {tags?.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={[
                  "filter-tag",
                  selectedTagIds.includes(tag.id)
                    ? "filter-tag--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <LucideTag width={10} />
                {tag.name}
              </button>
            ))}
            {(!tags || tags.length === 0) && (
              <p className="filter-empty">No tags available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const CSS = `
.filters-panel {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       16px;
  display:       flex;
  flex-direction: column;
  gap:           16px;
}

/* Header */
.filters-header {
  display:         flex;
  align-items:     center;
  gap:             8px;
  padding-bottom:  12px;
  border-bottom:   1px solid var(--border-default);
}
.filters-title {
  font-size:   var(--text-sm);
  font-weight: 600;
  color:       var(--text-primary);
  flex:        1;
}
.filters-clear {
  display:     flex;
  align-items: center;
  gap:         4px;
  padding:     3px 8px;
  background:  transparent;
  border:      none;
  border-radius: var(--radius-sm);
  color:       var(--text-tertiary);
  font-size:   var(--text-xs);
  font-family: var(--font-sans);
  cursor:      pointer;
  transition:  color var(--transition-fast), background var(--transition-fast);
}
.filters-clear:hover { color: var(--danger); background: var(--danger-muted); }

/* Filter group */
.filter-group {
  display:        flex;
  flex-direction: column;
  gap:            8px;
}
.filter-label {
  font-size:      var(--text-xs);
  font-weight:    600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color:          var(--text-tertiary);
  display:        flex;
  align-items:    center;
  gap:            6px;
}
.filter-label-count {
  font-size:   var(--text-xs);
  font-weight: 500;
  color:       var(--accent);
  background:  var(--accent-muted);
  padding:     0 6px;
  border-radius: var(--radius-full);
}

/* Type buttons */
.filter-type-options {
  display:        flex;
  flex-direction: column;
  gap:            2px;
}
.filter-type-btn {
  display:       flex;
  align-items:   center;
  gap:           8px;
  width:         100%;
  padding:       7px 10px;
  background:    transparent;
  border:        none;
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  cursor:        pointer;
  transition:    all var(--transition-fast);
  text-align:    left;
}
.filter-type-btn:hover { background: var(--bg-overlay); color: var(--text-primary); }
.filter-type-btn--active {
  background: var(--accent-muted);
  color:      var(--accent);
}

/* Select */
.filter-select-wrap {
  position: relative;
  display:  flex;
  align-items: center;
}
.filter-select-icon {
  position:  absolute;
  left:      10px;
  width:     13px;
  height:    13px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.filter-select {
  width:            100%;
  height:           36px;
  padding:          0 12px 0 30px;
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
.filter-select:focus { border-color: var(--border-focus); }
.filter-select option { background: var(--bg-elevated); }

/* Tags */
.filter-tags {
  display:   flex;
  flex-wrap: wrap;
  gap:       4px;
  max-height: 160px;
  overflow-y: auto;
}
.filter-tag {
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  padding:      4px 10px;
  background:   var(--bg-subtle);
  border:       1px solid var(--border-default);
  border-radius: var(--radius-full);
  color:        var(--text-tertiary);
  font-size:    var(--text-xs);
  font-family:  var(--font-sans);
  cursor:       pointer;
  transition:   all var(--transition-fast);
}
.filter-tag:hover { border-color: var(--border-strong); color: var(--text-secondary); }
.filter-tag--active {
  background:   var(--accent-muted);
  border-color: var(--accent-border);
  color:        var(--accent);
}
.filter-empty {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
  padding:   4px 0;
}

@media (max-width: 1023px) {
  .filter-type-options { flex-direction: row; flex-wrap: wrap; }
  .filter-type-btn { width: auto; }
}
`;