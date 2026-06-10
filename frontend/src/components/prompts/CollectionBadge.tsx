"use client";

import { useState } from "react";
import { usePromptCollectionMembership } from "@/hooks/usePromptCollections";
import { PROJECT_COLOR_CSS } from "@/types/project";
import AddToCollectionModal from "./AddToCollectionModal";
import { LucideLayers } from "@/Icons/Icons";

interface CollectionBadgeProps {
    promptId: number;
}

export default function CollectionBadge({ promptId }: CollectionBadgeProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const { data: collections, isLoading } = usePromptCollectionMembership(promptId);

    if (isLoading || !collections) return null;

    const accentColor = collections[0]
        ? PROJECT_COLOR_CSS[collections[0].color ?? ''] ?? 'var(--cyan-400)'
        : 'var(--text-muted)';

    const label = collections.length === 0
        ? null
        : collections.length === 1
            ? collections[0].title
            : `${collections.length} collections`;

    return (
        <>
            <button
                className="cbadge"
                onClick={e => { e.stopPropagation(); setModalOpen(true); }}
                title={collections.length === 0 ? 'Add to collection' : `In: ${collections.map(c => c.title).join(', ')}`}
                style={{ '--cbadge-color': accentColor } as React.CSSProperties}
                type="button"
            >
                <style>{CSS}</style>
                <LucideLayers width={11} />
                {label && <span className="cbadge-label">{label}</span>}
            </button>

            <AddToCollectionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                promptId={promptId}
            />
        </>
    );
}

const CSS = `
.cbadge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px;
    background: transparent;
    border: 1px solid var(--border-subtle);
    border-radius: 99px;
    font-size: 10px; font-weight: 500;
    color: var(--cbadge-color, var(--text-muted));
    cursor: pointer;
    white-space: nowrap; max-width: 120px;
    transition: background var(--transition-fast), border-color var(--transition-fast);
    vertical-align: middle;
}
.cbadge:hover { background: var(--bg-elevated); border-color: var(--border-default); }
.cbadge-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;
