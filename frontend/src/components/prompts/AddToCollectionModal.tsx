"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
    usePromptCollections,
    useCreatePromptCollection,
    useAddToPromptCollection,
    useRemoveFromPromptCollection,
    usePromptCollectionMembership,
} from "@/hooks/usePromptCollections";
import { PROJECT_COLOR_CSS } from "@/types/project";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LucideCheck, LucideLayers, LucidePlus, LucideX } from "@/Icons/Icons";

interface AddToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    promptId: number;
}

export default function AddToCollectionModal({ isOpen, onClose, promptId }: AddToCollectionModalProps) {
    const { data: allCollections } = usePromptCollections();
    const { data: membership, isLoading: membershipLoading } = usePromptCollectionMembership(promptId);
    const addTo = useAddToPromptCollection();
    const removeFrom = useRemoveFromPromptCollection();
    const createCollection = useCreatePromptCollection();
    const [newTitle, setNewTitle] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const memberIds = new Set((membership ?? []).map(c => c.id));

    const toggle = (collectionId: number) => {
        if (memberIds.has(collectionId)) {
            removeFrom.mutate({ collectionId, promptId });
        } else {
            addTo.mutate({ collectionId, promptId });
        }
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        const c = await createCollection.mutateAsync({ title: newTitle.trim() });
        addTo.mutate({ collectionId: c.id, promptId });
        setNewTitle('');
        setShowCreate(false);
    };

    if (!isOpen || typeof document === 'undefined') return null;
    return createPortal(
        <>
            <style>{CSS}</style>
            <div className="atcm-backdrop" onClick={onClose} />
            <div className="atcm-modal" role="dialog" aria-modal aria-label="Add to collection">
                <div className="atcm-head">
                    <span className="atcm-title">Add to collection</span>
                    <button className="atcm-close" onClick={onClose}><LucideX width={14} /></button>
                </div>
                <div className="atcm-list">
                    {(allCollections ?? []).length === 0 && !membershipLoading && (
                        <div className="atcm-empty">No collections yet</div>
                    )}
                    {(allCollections ?? []).map(c => {
                        const checked = memberIds.has(c.id);
                        const accent = PROJECT_COLOR_CSS[c.color ?? ''] ?? 'var(--cyan-400)';
                        return (
                            <button key={c.id} className={['atcm-row', checked ? 'atcm-row--checked' : ''].filter(Boolean).join(' ')}
                                onClick={() => toggle(c.id)}>
                                <div className="atcm-color" style={{ background: accent }} />
                                <LucideLayers width={14} className="atcm-row-icon" />
                                <span className="atcm-row-title">{c.title}</span>
                                <div className={['atcm-check', checked ? 'atcm-check--on' : ''].filter(Boolean).join(' ')}>
                                    {checked && <LucideCheck width={11} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="atcm-footer">
                    {showCreate ? (
                        <div className="atcm-create-row">
                            <Input
                                placeholder="Collection name"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
                                autoFocus
                            />
                            <Button size="sm" onClick={handleCreate} isLoading={createCollection.isPending} disabled={!newTitle.trim()}>
                                Create
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                        </div>
                    ) : (
                        <button className="atcm-new-btn" onClick={() => setShowCreate(true)}>
                            <LucidePlus width={13} />
                            New collection
                        </button>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}

const CSS = `
.atcm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);
    z-index: 500;
}
.atcm-modal {
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
.atcm-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--border-subtle);
}
.atcm-title { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
.atcm-close {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px;
    background: transparent; border: none; border-radius: var(--radius-sm);
    color: var(--text-tertiary); cursor: pointer;
    transition: color var(--transition-fast), background var(--transition-fast);
}
.atcm-close:hover { color: var(--text-primary); background: var(--bg-overlay); }
.atcm-list { flex: 1; overflow-y: auto; padding: 8px 0; }
.atcm-empty { padding: 20px; text-align: center; font-size: var(--text-sm); color: var(--text-tertiary); }
.atcm-row {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 9px 16px;
    background: transparent; border: none; cursor: pointer; text-align: left;
    transition: background var(--transition-fast);
}
.atcm-row:hover { background: var(--bg-overlay); }
.atcm-row--checked { background: var(--accent-muted); }
.atcm-color { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.atcm-row-icon { color: var(--text-tertiary); flex-shrink: 0; }
.atcm-row-title { flex: 1; font-size: var(--text-sm); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.atcm-check {
    width: 18px; height: 18px; flex-shrink: 0;
    border: 2px solid var(--border-strong); border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    background: transparent; transition: background var(--transition-fast), border-color var(--transition-fast);
}
.atcm-check--on { background: var(--accent); border-color: var(--accent); color: #fff; }
.atcm-footer {
    padding: 10px 16px;
    border-top: 1px solid var(--border-subtle);
}
.atcm-create-row { display: flex; gap: 6px; align-items: center; }
.atcm-create-row > *:first-child { flex: 1; }
.atcm-new-btn {
    display: flex; align-items: center; gap: 6px;
    background: transparent; border: none;
    font-size: var(--text-sm); color: var(--text-accent); cursor: pointer;
    padding: 4px 0;
    transition: opacity var(--transition-fast);
}
.atcm-new-btn:hover { opacity: 0.8; }
`;
