"use client";

import { useRef, useState } from "react";
import { LucideGripVertical, LucideX } from "@/Icons/Icons";

interface ProjectItemWrapperProps {
    children: React.ReactNode;
    onRemove: () => void;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    onDragEnd?: () => void;
}

export default function ProjectItemWrapper({
    children,
    onRemove,
    isDragging = false,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: ProjectItemWrapperProps) {
    return (
        <>
            <style>{CSS}</style>
            <div
                className={['piw', isDragging ? 'piw--dragging' : ''].filter(Boolean).join(' ')}
                draggable
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
            >
                <div className="piw-grip" title="Drag to reorder">
                    <LucideGripVertical width={14} />
                </div>
                <button
                    className="piw-remove"
                    onClick={e => { e.stopPropagation(); onRemove(); }}
                    title="Remove from project"
                    type="button"
                    aria-label="Remove from project"
                >
                    <LucideX width={12} />
                </button>
                {children}
            </div>
        </>
    );
}

const CSS = `
.piw {
    position: relative;
}
.piw--dragging {
    opacity: 0.4;
}
.piw-grip {
    position: absolute;
    top: 10px; left: 6px;
    z-index: 2;
    color: var(--text-muted);
    opacity: 0;
    cursor: grab;
    padding: 4px;
    border-radius: var(--radius-sm);
    background: var(--bg-overlay);
    display: flex; align-items: center;
    transition: opacity var(--transition-fast);
    pointer-events: none;
}
.piw:hover .piw-grip { opacity: 1; pointer-events: auto; }
.piw-grip:active { cursor: grabbing; }
.piw-remove {
    position: absolute;
    top: 8px; right: 8px;
    z-index: 2;
    display: flex; align-items: center; justify-content: center;
    width: 22px; height: 22px;
    background: var(--bg-overlay);
    border: 1px solid var(--border-subtle);
    border-radius: 50%;
    color: var(--text-tertiary);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
}
.piw:hover .piw-remove { opacity: 1; }
.piw-remove:hover { color: var(--danger); background: var(--danger-muted); border-color: rgba(239,68,68,0.3); }
`;
