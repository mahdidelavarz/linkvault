"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTags } from "@/hooks/useTag";
import {
  LucideChevronDown,
  LucideSearch,
  LucideTag,
  LucideX,
  LucideCheck,
} from "@/Icons/Icons";

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export default function TagSelector({
  selectedTagIds,
  onChange,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: tags } = useTags();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!searchTerm.trim()) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  const selectedTags = useMemo(() => {
    if (!tags) return [];
    return tags.filter((tag) => selectedTagIds.includes(tag.id));
  }, [tags, selectedTagIds]);

  const toggleTag = (tagId: number) => {
    const newSelection = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onChange(newSelection);
  };

  const removeTag = (tagId: number) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="tag-selector">
        <label className="tag-selector-label">Tags</label>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="selected-tags">
            {selectedTags.map((tag) => (
              <span key={tag.id} className="selected-tag">
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="selected-tag-remove"
                  aria-label={`Remove ${tag.name}`}
                >
                  <LucideX width={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Dropdown */}
        <div className="tag-selector-dropdown" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="tag-selector-trigger"
          >
            <LucideTag className="tag-selector-trigger-icon" />
            <span
              className={
                selectedTagIds.length === 0
                  ? "tag-selector-placeholder"
                  : "tag-selector-trigger-text"
              }
            >
              {selectedTagIds.length === 0
                ? "Select tags…"
                : `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? "s" : ""} selected`}
            </span>
            <LucideChevronDown
              className={[
                "tag-selector-chevron",
                isOpen ? "tag-selector-chevron--open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              width={14}
            />
          </button>

          {isOpen && (
            <div className="tag-selector-menu">
              {/* Search Input */}
              <div className="tag-selector-search-wrap">
                <LucideSearch className="tag-selector-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tags…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="tag-selector-search"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    className="tag-selector-search-clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <LucideX width={12} />
                  </button>
                )}
              </div>

              {/* Tag List */}
              <div className="tag-selector-list">
                {filteredTags.length === 0 ? (
                  <div className="tag-selector-empty">
                    {searchTerm ? "No matching tags" : "No tags available"}
                  </div>
                ) : (
                  filteredTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <div
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={[
                          "tag-selector-option",
                          isSelected ? "tag-selector-option--selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span
                          className={[
                            "tag-selector-checkbox",
                            isSelected
                              ? "tag-selector-checkbox--checked"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {isSelected && <LucideCheck width={12} />}
                        </span>
                        <span className="tag-selector-option-name">
                          {tag.name}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Done Button */}
              <div className="tag-selector-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="tag-selector-done-btn"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create suggestion */}
        {searchTerm && filteredTags.length === 0 && (
          <p className="tag-selector-hint">
            Tag not found? Create it in the Tags page first.
          </p>
        )}
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.tag-selector {
  display:        flex;
  flex-direction: column;
  gap:            8px;
}
.tag-selector-label {
  font-size:   var(--text-sm);
  font-weight: 600;
  color:       var(--text-secondary);
}

/* Selected tags */
.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap:      6px;
}
.selected-tag {
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  padding:      3px 10px;
  background:   var(--primary-muted);
  border:       1px solid rgba(59,130,246,0.2);
  border-radius: var(--radius-full);
  font-size:    var(--text-xs);
  font-weight:  500;
  color:        var(--primary);
}
.selected-tag-remove {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           16px;
  height:          16px;
  padding:         0;
  background:      transparent;
  border:          none;
  border-radius:   50%;
  color:           var(--primary);
  cursor:          pointer;
  transition:      background var(--transition-fast);
}
.selected-tag-remove:hover { background: rgba(59,130,246,0.15); }

/* Dropdown */
.tag-selector-dropdown {
  position: relative;
}

/* Trigger */
.tag-selector-trigger {
  display:       flex;
  align-items:   center;
  gap:           8px;
  width:         100%;
  height:        40px;
  padding:       0 10px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  cursor:        pointer;
  text-align:    left;
  transition:    border-color var(--transition-fast);
}
.tag-selector-trigger:hover   { border-color: var(--border-strong); }
.tag-selector-trigger:focus   { border-color: var(--border-focus); outline: none; }
.tag-selector-trigger-icon    { color: var(--text-tertiary); flex-shrink: 0; width: 14px; }
.tag-selector-placeholder     { color: var(--text-tertiary); flex: 1; }
.tag-selector-trigger-text    { color: var(--text-primary); flex: 1; }
.tag-selector-chevron         { color: var(--text-tertiary); flex-shrink: 0; transition: transform var(--transition-fast); }
.tag-selector-chevron--open   { transform: rotate(180deg); }

/* Menu */
.tag-selector-menu {
  position:      absolute;
  z-index:       20;
  top:           calc(100% + 4px);
  left:          0;
  right:         0;
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow:    0 8px 24px rgba(0,0,0,0.1);
  overflow:      hidden;
}

/* Search */
.tag-selector-search-wrap {
  position:      relative;
  display:       flex;
  align-items:   center;
  padding:       8px;
  border-bottom: 1px solid var(--border-default);
  background:    var(--bg-subtle);
}
.tag-selector-search-icon {
  position:  absolute;
  left:      16px;
  width:     13px;
  height:    13px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.tag-selector-search {
  width:         100%;
  height:        34px;
  padding:       0 30px 0 32px;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  outline:       none;
}
.tag-selector-search::placeholder { color: var(--text-tertiary); }
.tag-selector-search:focus { border-color: var(--border-focus); }
.tag-selector-search-clear {
  position:    absolute;
  right:       16px;
  display:     flex;
  align-items: center;
  justify-content: center;
  width:       18px;
  height:      18px;
  background:  var(--bg-overlay);
  border:      none;
  border-radius: 50%;
  color:       var(--text-tertiary);
  cursor:      pointer;
}

/* List */
.tag-selector-list {
  max-height: 180px;
  overflow-y: auto;
  padding:    4px;
}
.tag-selector-empty {
  padding:     16px;
  text-align:  center;
  font-size:   var(--text-sm);
  color:       var(--text-tertiary);
}

/* Option */
.tag-selector-option {
  display:       flex;
  align-items:   center;
  gap:           10px;
  padding:       8px 10px;
  border-radius: var(--radius-md);
  cursor:        pointer;
  transition:    background var(--transition-fast);
}
.tag-selector-option:hover          { background: var(--bg-subtle); }
.tag-selector-option--selected      { background: var(--primary-muted); }
.tag-selector-option-name           { font-size: var(--text-sm); color: var(--text-primary); flex: 1; }

/* Checkbox */
.tag-selector-checkbox {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           18px;
  height:          18px;
  border:          2px solid var(--border-default);
  border-radius:   var(--radius-sm);
  flex-shrink:     0;
  transition:      background var(--transition-fast), border-color var(--transition-fast);
}
.tag-selector-checkbox--checked {
  background:   var(--primary);
  border-color: var(--primary);
  color:        #fff;
}

/* Footer */
.tag-selector-footer {
  padding:       8px;
  border-top:    1px solid var(--border-default);
  background:    var(--bg-subtle);
}
.tag-selector-done-btn {
  width:          100%;
  height:         34px;
  background:     var(--primary);
  border:         none;
  border-radius:  var(--radius-md);
  color:          #fff;
  font-family:    var(--font-sans);
  font-size:      var(--text-sm);
  font-weight:    500;
  cursor:         pointer;
  transition:     background var(--transition-fast);
}
.tag-selector-done-btn:hover { background: var(--primary-hover); }

/* Hint */
.tag-selector-hint {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
}
`;