"use client";

import {
  LucideSearch,
  LucideSearchX,
  LucideKeyboard,
} from "@/Icons/Icons";

interface SearchEmptyStateProps {
  hasQuery: boolean;
  hasFilters: boolean;
}

export default function SearchEmptyState({
  hasQuery,
  hasFilters,
}: SearchEmptyStateProps) {
  if (!hasQuery && !hasFilters) {
    return (
      <>
        <style>{CSS}</style>
        <div className="empty-state">
          <div className="empty-icon">
            <LucideSearch width={28} />
          </div>
          <p className="empty-title">Start Searching</p>
          <p className="empty-subtitle">
            Type in the search box to find links, notes, and snippets across your vault
          </p>
          <div className="empty-shortcut">
            <LucideKeyboard width={14} />
            <kbd>Ctrl</kbd> + <kbd>K</kbd>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="empty-state">
        <div className="empty-icon">
          <LucideSearchX width={28} />
        </div>
        <p className="empty-title">No Results Found</p>
        <p className="empty-subtitle">
          Try adjusting your search terms or clearing some filters
        </p>
      </div>
    </>
  );
}

const CSS = `
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
.empty-title {
  font-size:   var(--text-lg);
  font-weight: 600;
  color:       var(--text-primary);
}
.empty-subtitle {
  font-size: var(--text-sm);
  color:     var(--text-tertiary);
  max-width: 360px;
}
.empty-shortcut {
  display:     flex;
  align-items: center;
  gap:         6px;
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
  margin-top:  4px;
}
.empty-shortcut kbd {
  padding:       3px 8px;
  background:    var(--bg-overlay);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-family:   var(--font-mono);
  font-size:     var(--text-xs);
}
`;