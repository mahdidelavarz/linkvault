"use client";

import { useState } from "react";
import {
  usePromptCollections,
  useCreatePromptCollection,
  useUpdatePromptCollection,
  useDeletePromptCollection,
} from "@/hooks/usePromptCollections";
import { PROJECT_COLORS, PROJECT_COLOR_CSS } from "@/types/project";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { LucideLayers, LucidePencil, LucideTrash2, LucidePlus, LucideCheck, LucideX } from "@/Icons/Icons";

interface ManageCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageCollectionsModal({ isOpen, onClose }: ManageCollectionsModalProps) {
  const { data: collections, isLoading } = usePromptCollections();
  const createCollection = useCreatePromptCollection();
  const updateCollection = useUpdatePromptCollection();
  const deleteCollection = useDeletePromptCollection();

  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("cyan");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createCollection.mutate({ title: newTitle.trim(), color: newColor });
    setNewTitle("");
  };

  const startEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = (id: number) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    updateCollection.mutate({ id, title: editTitle.trim() });
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this collection? Prompts inside it will not be deleted.")) return;
    deleteCollection.mutate(id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Collections" size="md">
      <style>{CSS}</style>
      <div className="mcm-wrapper">
        <div className="mcm-content">
          {isLoading ? (
            <div className="mcm-empty">Loading…</div>
          ) : (collections ?? []).length === 0 ? (
            <div className="mcm-empty">
              <LucideLayers width={28} />
              <p>No collections yet — create one below to start grouping related prompts.</p>
            </div>
          ) : (
            <div className="mcm-list">
              {(collections ?? []).map((c) => {
                const accent = PROJECT_COLOR_CSS[c.color ?? ""] ?? "var(--cyan-400)";
                return (
                  <div key={c.id} className="mcm-row">
                    <div className="mcm-color" style={{ background: accent }} />
                    {editingId === c.id ? (
                      <>
                        <Input
                          className="mcm-edit-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(c.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                        <button className="mcm-icon-btn" onClick={() => saveEdit(c.id)} title="Save">
                          <LucideCheck width={14} />
                        </button>
                        <button className="mcm-icon-btn" onClick={() => setEditingId(null)} title="Cancel">
                          <LucideX width={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="mcm-title">{c.title}</span>
                        <span className="mcm-count">{c.itemCount} {c.itemCount === 1 ? "prompt" : "prompts"}</span>
                        <button className="mcm-icon-btn" onClick={() => startEdit(c.id, c.title)} title="Rename">
                          <LucidePencil width={13} />
                        </button>
                        <button className="mcm-icon-btn mcm-icon-btn--danger" onClick={() => handleDelete(c.id)} title="Delete">
                          <LucideTrash2 width={13} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mcm-footer">
          <div className="mcm-colors">
            {PROJECT_COLORS.map((col) => (
              <button
                key={col.value}
                type="button"
                className={["mcm-color-swatch", newColor === col.value ? "mcm-color-swatch--active" : ""].filter(Boolean).join(" ")}
                style={{ "--color": col.css } as React.CSSProperties}
                onClick={() => setNewColor(col.value)}
                title={col.label}
                aria-label={col.label}
              />
            ))}
          </div>
          <div className="mcm-create-row">
            <Input
              placeholder="New collection name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            />
            <Button leftIcon={LucidePlus} onClick={handleCreate} isLoading={createCollection.isPending} disabled={!newTitle.trim()}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const CSS = `
.mcm-wrapper {
  display: flex;
  flex-direction: column;
  height: 70dvh;
  max-height: 560px;
}
.mcm-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px;
}
.mcm-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 40px 20px; text-align: center;
  color: var(--text-tertiary); font-size: var(--text-sm); line-height: 1.6;
}
.mcm-list { display: flex; flex-direction: column; gap: 4px; }
.mcm-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}
.mcm-row:hover { background: var(--bg-overlay); }
.mcm-color { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.mcm-title {
  flex: 1; font-size: var(--text-sm); font-weight: 500; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mcm-count { font-size: var(--text-xs); color: var(--text-tertiary); white-space: nowrap; }
.mcm-edit-input { flex: 1; }
.mcm-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; flex-shrink: 0;
  background: transparent; border: none; border-radius: var(--radius-sm);
  color: var(--text-tertiary); cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.mcm-icon-btn:hover { background: var(--bg-elevated); color: var(--text-primary); }
.mcm-icon-btn--danger:hover { color: var(--danger); background: var(--danger-muted); }

.mcm-footer {
  border-top: 1px solid var(--border-subtle);
  padding: 12px 10px;
  display: flex; flex-direction: column; gap: 10px;
}
.mcm-colors { display: flex; flex-wrap: wrap; gap: 8px; }
.mcm-color-swatch {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--color);
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.mcm-color-swatch:hover { transform: scale(1.15); }
.mcm-color-swatch--active {
  border-color: var(--color);
  box-shadow: 0 0 0 2px var(--bg-elevated), 0 0 0 4px var(--color);
  transform: scale(1.1);
}
.mcm-create-row { display: flex; gap: 8px; align-items: center; }
.mcm-create-row > *:first-child { flex: 1; }
`;
