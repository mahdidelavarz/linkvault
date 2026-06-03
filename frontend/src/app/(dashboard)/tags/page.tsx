"use client";

import { useState } from "react";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/hooks/useTag";
import { type Tag } from "@/types/tag";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import {
  LucidePlus,
  LucideTag,
  LucidePencil,
  LucideTrash2,
  LucideCheck,
  LucideX,
  LucideSearchX,
  LucideHash,
} from "@/Icons/Icons";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TagsPage() {
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState("");

  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      await createTag.mutateAsync({ name: newTagName.trim() });
      setNewTagName("");
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editingTag) return;

    try {
      await updateTag.mutateAsync({ id: editingTag.id, name: editName.trim() });
      setEditingTag(null);
      setEditName("");
    } catch (error) {
      console.error("Error updating tag:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this tag? It will be removed from all items.",
      )
    ) {
      deleteTag.mutate(id);
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditName("");
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="tags-page">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Tags</h1>
            <p className="page-subtitle">
              {isLoading ? "…" : `${tags?.length ?? 0} tags`}
            </p>
          </div>
        </div>

        {/* ── Create Form ── */}
        <div className="create-panel">
          <form onSubmit={handleCreate} className="create-form">
            <div className="create-input-wrap">
              <LucideHash className="create-input-icon" />
              <input
                className="create-input"
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name…"
              />
            </div>
            <Button
              type="submit"
              leftIcon={LucidePlus}
              isLoading={createTag.isPending}
            >
              Add Tag
            </Button>
          </form>
          {createTag.isError && (
            <div className="create-error">
              <Alert
                type="error"
                message={
                  createTag.error instanceof Error
                    ? createTag.error.message
                    : "Error creating tag"
                }
              />
            </div>
          )}
        </div>

        {/* ── Tags List ── */}
        {isLoading ? (
          <div className="tags-list-panel">
            {[...Array(5)].map((_, i) => (
              <TagSkeleton key={i} />
            ))}
          </div>
        ) : tags && tags.length > 0 ? (
          <div className="tags-list-panel">
            {tags.map((tag) => (
              <div key={tag.id} className="tag-row">
                {editingTag?.id === tag.id ? (
                  <form onSubmit={handleUpdate} className="tag-edit-form">
                    <div className="tag-edit-input-wrap">
                      <LucideHash className="tag-edit-icon" />
                      <input
                        className="tag-edit-input"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Edit tag name"
                        autoFocus
                      />
                    </div>
                    <div className="tag-edit-actions">
                      <Button
                        type="submit"
                        size="sm"
                        isLoading={updateTag.isPending}
                      >
                        <LucideCheck width={14} />
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={cancelEditing}
                      >
                        <LucideX width={14} />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="tag-info">
                      <span className="tag-icon">
                        <LucideTag width={18} />
                      </span>
                      <span className="tag-name">{tag.name}</span>
                      {/* {tag. && (
                        <span className="tag-count">
                          {tag._count.items || tag._count.links || 0} items
                        </span>
                      )} */}
                    </div>
                    <div className="tag-actions">
                      <button
                        className="tag-action-btn"
                        onClick={() => startEditing(tag)}
                        title="Edit"
                      >
                        <LucidePencil width={14} />
                      </button>
                      <button
                        className="tag-action-btn tag-action-btn--danger"
                        onClick={() => handleDelete(tag.id)}
                        title="Delete"
                      >
                        <LucideTrash2 width={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TagSkeleton() {
  return (
    <div className="tag-row-skeleton">
      <div
        className="skeleton"
        style={{ height: 16, width: 16, marginRight: 10, flexShrink: 0 }}
      />
      <div
        className="skeleton"
        style={{ height: 16, width: "30%", marginRight: 12 }}
      />
      <div
        className="skeleton"
        style={{ height: 14, width: 50, marginLeft: "auto", marginRight: 12 }}
      />
      <div className="skeleton" style={{ height: 14, width: 28 }} />
      <div className="skeleton" style={{ height: 14, width: 36 }} />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <LucideSearchX width={28} />
      </div>
      <p className="empty-title">No tags yet</p>
      <p className="empty-subtitle">
        Create your first tag to start organizing
      </p>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.tags-page { display: flex; flex-direction: column; gap:10px; flex: 1; overflow-y: auto; padding: 15px 24px 24px; }

/* Header */
.page-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:25px 10px 10px 10px;
  flex-wrap:       wrap;
}
.page-title    { font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.page-subtitle { font-size: var(--text-sm);  color: var(--text-tertiary); margin-top: 2px; }

/* Create panel */
.create-panel {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       16px 20px;
}
.create-form {
  display:     flex;
  align-items: flex-start;
  gap:         12px;
}
.create-input-wrap {
  position:    relative;
  flex:        1;
  display:     flex;
  align-items: center;
}
.create-input-icon {
  position:  absolute;
  left:      10px;
  width:     14px;
  height:    14px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.create-input {
  width:         100%;
  height:        40px;
  padding:       0 12px 0 32px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  outline:       none;
  transition:    border-color var(--transition-fast), background var(--transition-fast);
}
.create-input::placeholder { color: var(--text-tertiary); }
.create-input:focus { border-color: var(--border-focus); background: var(--bg-elevated); }
.create-error { margin-top: 12px; }

/* Tags list panel */
.tags-list-panel {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow:      hidden;
}

/* Tag row */
.tag-row {
  display:       flex;
  align-items:   center;
  gap:           12px;
  padding:       14px 20px;
  transition:    background var(--transition-fast);
}
.tag-row:not(:last-child) { border-bottom: 1px solid var(--border-default); }
.tag-row:hover { background: var(--bg-subtle); }

.tag-info {
  display:     flex;
  align-items: center;
  gap:         10px;
  flex:        1;
  min-width:   0;
}
.tag-icon {
  display:     flex;
  align-items: center;
  color:       var(--text-tertiary);
  flex-shrink: 0;
}
.tag-name {
  font-size:     var(--text-sm);
  font-weight:   500;
  color:         var(--text-primary);
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
}
.tag-count {
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
  flex-shrink: 0;
  padding:     2px 8px;
  background:  var(--bg-overlay);
  border-radius: var(--radius-full);
}

.tag-actions {
  display:     flex;
  align-items: center;
  gap:         2px;
  opacity:     0;
  transition:  opacity var(--transition-fast);
  flex-shrink: 0;
}
.tag-row:hover .tag-actions { opacity: 1; }

.tag-action-btn {
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
.tag-action-btn:hover          { color: var(--text-primary); background: var(--bg-overlay); }
.tag-action-btn--danger:hover  { color: var(--danger); background: var(--danger-muted); }

/* Tag edit form */
.tag-edit-form {
  display:     flex;
  align-items: center;
  gap:         12px;
  flex:        1;
}
.tag-edit-input-wrap {
  position:    relative;
  flex:        1;
  display:     flex;
  align-items: center;
}
.tag-edit-icon {
  position:  absolute;
  left:      10px;
  width:     14px;
  height:    14px;
  color:     var(--text-tertiary);
  pointer-events: none;
}
.tag-edit-input {
  width:         100%;
  height:        36px;
  padding:       0 12px 0 32px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-focus);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  outline:       none;
}
.tag-edit-actions {
  display:     flex;
  align-items: center;
  gap:         6px;
  flex-shrink: 0;
}

/* Skeleton row */
.tag-row-skeleton {
  display:     flex;
  align-items: center;
  padding:     14px 20px;
}
.tag-row-skeleton:not(:last-child) { border-bottom: 1px solid var(--border-default); }

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
