"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useProjects, useProject, useAddToProject, useRemoveFromProject, useItemMembership } from "@/hooks/useProjects";
import { useCreateProject } from "@/hooks/useProjects";
import { type ProjectItemType, PROJECT_COLOR_CSS } from "@/types/project";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LucideCheck, LucideFolderOpen, LucidePlus, LucideX } from "@/Icons/Icons";

interface AddToProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** When provided (item badge flow): shows checkboxes for all projects */
    itemType?: ProjectItemType;
    itemId?: number;
    /** When provided (dashboard "Add items" flow): search and add existing items */
    projectId?: number;
}

export default function AddToProjectModal({ isOpen, onClose, itemType, itemId, projectId }: AddToProjectModalProps) {
    const isDashboardFlow = !!projectId && !itemType;
    const isBadgeFlow = !!itemType && !!itemId;

    return isDashboardFlow
        ? <AddItemsToDashboard isOpen={isOpen} onClose={onClose} projectId={projectId!} />
        : isBadgeFlow
            ? <ItemProjectPicker isOpen={isOpen} onClose={onClose} itemType={itemType!} itemId={itemId!} />
            : null;
}

// ─── Badge flow: pick which projects this item belongs to ─────────────────────

function ItemProjectPicker({ isOpen, onClose, itemType, itemId }: { isOpen: boolean; onClose: () => void; itemType: ProjectItemType; itemId: number }) {
    const { data: allProjects } = useProjects();
    const { data: membership, isLoading: membershipLoading } = useItemMembership(itemType, itemId);
    const addTo = useAddToProject();
    const removeFrom = useRemoveFromProject();
    const createProject = useCreateProject();
    const [newTitle, setNewTitle] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const memberIds = new Set((membership ?? []).map(p => p.id));

    const toggle = (projectId: number) => {
        if (memberIds.has(projectId)) {
            removeFrom.mutate({ projectId, itemType, itemId });
        } else {
            addTo.mutate({ projectId, itemType, itemId });
        }
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        const p = await createProject.mutateAsync({ title: newTitle.trim() });
        addTo.mutate({ projectId: p.id, itemType, itemId });
        setNewTitle('');
        setShowCreate(false);
    };

    if (!isOpen || typeof document === 'undefined') return null;
    return createPortal(
        <>
            <style>{CSS}</style>
            <div className="atpm-backdrop" onClick={onClose} />
            <div className="atpm-modal" role="dialog" aria-modal aria-label="Add to projects">
                <div className="atpm-head">
                    <span className="atpm-title">Add to project</span>
                    <button className="atpm-close" onClick={onClose}><LucideX width={14} /></button>
                </div>
                <div className="atpm-list">
                    {(allProjects ?? []).length === 0 && !membershipLoading && (
                        <div className="atpm-empty">No projects yet</div>
                    )}
                    {(allProjects ?? []).map(p => {
                        const checked = memberIds.has(p.id);
                        const accent = PROJECT_COLOR_CSS[p.color ?? ''] ?? 'var(--cyan-400)';
                        return (
                            <button key={p.id} className={['atpm-row', checked ? 'atpm-row--checked' : ''].filter(Boolean).join(' ')}
                                onClick={() => toggle(p.id)}>
                                <div className="atpm-color" style={{ background: accent }} />
                                <span className="atpm-row-emoji">{p.emoji || '📁'}</span>
                                <span className="atpm-row-title">{p.title}</span>
                                <div className={['atpm-check', checked ? 'atpm-check--on' : ''].filter(Boolean).join(' ')}>
                                    {checked && <LucideCheck width={11} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="atpm-footer">
                    {showCreate ? (
                        <div className="atpm-create-row">
                            <Input
                                placeholder="Project name"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
                                autoFocus
                            />
                            <Button size="sm" onClick={handleCreate} isLoading={createProject.isPending} disabled={!newTitle.trim()}>
                                Create
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                        </div>
                    ) : (
                        <button className="atpm-new-btn" onClick={() => setShowCreate(true)}>
                            <LucidePlus width={13} />
                            New project
                        </button>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}

// ─── Dashboard flow: add existing items by searching ──────────────────────────
// Simple flow: shows search box + type tabs. User finds items and clicks to add.
// For now this just opens a simple modal showing a "browse by type" hint.
// Full implementation would require a cross-module search endpoint.

function AddItemsToDashboard({ isOpen, onClose, projectId }: { isOpen: boolean; onClose: () => void; projectId: number }) {
    const addTo = useAddToProject();
    const { data: project } = useProject(projectId);
    const [tab, setTab] = useState<ProjectItemType>('link');
    const existingIds = new Set(
        (project?.items ?? []).filter(pi => pi.itemType === tab).map(pi => pi.itemId)
    );

    if (!isOpen) return null;

    const tabs: { type: ProjectItemType; label: string }[] = [
        { type: 'link', label: 'Links' },
        { type: 'note', label: 'Notes' },
        { type: 'snippet', label: 'Snippets' },
        { type: 'prompt', label: 'Prompts' },
        { type: 'infrastructure', label: 'Infra' },
    ];

    return (
        <div className="atpm-overlay-simple">
            <style>{CSS}</style>
            <div className="atpm-backdrop" onClick={onClose} />
            <div className="atpm-modal atpm-modal--wide" role="dialog" aria-modal aria-label="Add items">
                <div className="atpm-head">
                    <span className="atpm-title">Add items to project</span>
                    <button className="atpm-close" onClick={onClose}><LucideX width={14} /></button>
                </div>
                <div className="atpm-hint">
                    <LucideFolderOpen width={32} />
                    <p>Open the module pages (Links, Notes, Snippets…) and use the <strong>📁</strong> badge on any card to add it here.</p>
                    <Button onClick={onClose}>Got it</Button>
                </div>
            </div>
        </div>
    );
}

const CSS = `
.atpm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);
    z-index: 500;
}
.atpm-modal {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 501;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: 14px;
    width: min(360px, 92vw);
    max-height: 80vh;
    display: flex; flex-direction: column;
    box-shadow: var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.4));
}
.atpm-modal--wide { width: min(420px, 92vw); }
.atpm-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--border-subtle);
}
.atpm-title { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
.atpm-close {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px;
    background: transparent; border: none; border-radius: var(--radius-sm);
    color: var(--text-tertiary); cursor: pointer;
    transition: color var(--transition-fast), background var(--transition-fast);
}
.atpm-close:hover { color: var(--text-primary); background: var(--bg-overlay); }
.atpm-list { flex: 1; overflow-y: auto; padding: 8px 0; }
.atpm-empty { padding: 20px; text-align: center; font-size: var(--text-sm); color: var(--text-tertiary); }
.atpm-row {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 9px 16px;
    background: transparent; border: none; cursor: pointer; text-align: left;
    transition: background var(--transition-fast);
}
.atpm-row:hover { background: var(--bg-overlay); }
.atpm-row--checked { background: var(--accent-muted); }
.atpm-color { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.atpm-row-emoji { font-size: 16px; flex-shrink: 0; }
.atpm-row-title { flex: 1; font-size: var(--text-sm); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.atpm-check {
    width: 18px; height: 18px; flex-shrink: 0;
    border: 2px solid var(--border-strong); border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    background: transparent; transition: background var(--transition-fast), border-color var(--transition-fast);
}
.atpm-check--on { background: var(--accent); border-color: var(--accent); color: #fff; }
.atpm-footer {
    padding: 10px 16px;
    border-top: 1px solid var(--border-subtle);
}
.atpm-create-row { display: flex; gap: 6px; align-items: center; }
.atpm-create-row > *:first-child { flex: 1; }
.atpm-new-btn {
    display: flex; align-items: center; gap: 6px;
    background: transparent; border: none;
    font-size: var(--text-sm); color: var(--text-accent); cursor: pointer;
    padding: 4px 0;
    transition: opacity var(--transition-fast);
}
.atpm-new-btn:hover { opacity: 0.8; }
.atpm-hint {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    padding: 24px 20px; text-align: center;
    color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.6;
}
.atpm-hint svg { color: var(--text-muted); }
.atpm-overlay-simple { position: fixed; inset: 0; z-index: 498; }
`;
