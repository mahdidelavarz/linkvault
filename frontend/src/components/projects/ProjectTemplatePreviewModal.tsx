"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { type ProjectTemplate } from "@/lib/projectTemplates";
import { PROJECT_COLOR_CSS } from "@/types/project";
import { useCreateProject, useAddToProject } from "@/hooks/useProjects";
import { useCreateLink } from "@/hooks/useLinks";
import { useCreateNote } from "@/hooks/useNote";
import { useCreateSnippet } from "@/hooks/useSnippet";
import { useCreatePrompt } from "@/hooks/usePrompt";
import { useCreateInfrastructure } from "@/hooks/useInfrastructure";
import Button from "@/components/ui/Button";
import { LucideBox, LucideCodeXml, LucideFileText, LucideGlobe, LucideKeyRound, LucideSparkles, LucideX } from "@/Icons/Icons";

const ITEM_ICONS: Record<string, React.ComponentType<{ width?: number }>> = {
    link: LucideGlobe,
    note: LucideFileText,
    snippet: LucideCodeXml,
    prompt: LucideSparkles,
    infrastructure: LucideKeyRound,
};

interface ProjectTemplatePreviewModalProps {
    isOpen: boolean;
    template: ProjectTemplate | null;
    onClose: () => void;
}

export default function ProjectTemplatePreviewModal({ isOpen, template, onClose }: ProjectTemplatePreviewModalProps) {
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [projectTitle, setProjectTitle] = useState('');

    useEffect(() => { setProjectTitle(''); }, [template?.id]);

    const createProject = useCreateProject();
    const addToProject = useAddToProject();
    const createLink = useCreateLink();
    const createNote = useCreateNote();
    const createSnippet = useCreateSnippet();
    const createPrompt = useCreatePrompt();
    const createInfra = useCreateInfrastructure();

    if (!isOpen || !template || typeof document === 'undefined') return null;

    const accentColor = PROJECT_COLOR_CSS[template.color] ?? 'var(--cyan-400)';
    const title = projectTitle.trim() || template.title;

    const handleCreate = async () => {
        setCreating(true);
        try {
            const project = await createProject.mutateAsync({
                title,
                description: template.description,
                color: template.color,
                emoji: template.emoji,
            });

            for (const tItem of template.items) {
                let createdId: number | null = null;

                if (tItem.type === 'link' && tItem.url) {
                    const item = await createLink.mutateAsync({ url: tItem.url, title: tItem.title, description: tItem.description });
                    createdId = item.id;
                } else if (tItem.type === 'note') {
                    const item = await createNote.mutateAsync({ title: tItem.title, content: tItem.content });
                    createdId = item.id;
                } else if (tItem.type === 'snippet') {
                    const item = await createSnippet.mutateAsync({
                        title: tItem.title,
                        content: tItem.content ?? '',
                        language: tItem.language,
                        snippetType: 'code',
                    });
                    createdId = item.id;
                } else if (tItem.type === 'prompt') {
                    const item = await createPrompt.mutateAsync({
                        title: tItem.title,
                        content: tItem.content ?? '',
                        description: tItem.description,
                        promptType: 'custom',
                    });
                    createdId = item.id;
                } else if (tItem.type === 'infrastructure' && tItem.infraType) {
                    const item = await createInfra.mutateAsync({
                        title: tItem.title,
                        infraType: tItem.infraType as any,
                        content: tItem.content ?? '',
                        description: tItem.description,
                    });
                    createdId = item.id;
                }

                if (createdId !== null) {
                    await addToProject.mutateAsync({ projectId: project.id, itemType: tItem.type, itemId: createdId });
                }
            }

            onClose();
            router.push(`/projects/${project.id}`);
        } finally {
            setCreating(false);
        }
    };

    return createPortal(
        <>
            <style>{CSS}</style>
            <div className="tpm-backdrop" onClick={onClose} />
            <div className="tpm-modal" role="dialog" aria-modal aria-label={`Preview: ${template.title}`}
                style={{ '--tpm-accent': accentColor } as React.CSSProperties}>
                <div className="tpm-accent-strip" />
                <div className="tpm-head">
                    <div className="tpm-head-info">
                        <span className="tpm-emoji">{template.emoji}</span>
                        <div>
                            <h2 className="tpm-title">{template.title}</h2>
                            <p className="tpm-subtitle">{template.description}</p>
                        </div>
                    </div>
                    <button className="tpm-close" onClick={onClose}><LucideX width={14} /></button>
                </div>

                <div className="tpm-rename">
                    <label className="tpm-label">Project name</label>
                    <input
                        className="tpm-input"
                        placeholder={template.title}
                        value={projectTitle}
                        onChange={e => setProjectTitle(e.target.value)}
                        disabled={creating}
                    />
                </div>

                <div className="tpm-section-label">
                    <LucideBox width={12} />
                    {template.items.length} items will be created
                </div>

                <div className="tpm-items">
                    {template.items.map((item, i) => {
                        const Icon = ITEM_ICONS[item.type] ?? LucideBox;
                        return (
                            <div key={i} className="tpm-item">
                                <div className="tpm-item-icon"><Icon width={13} /></div>
                                <div className="tpm-item-info">
                                    <span className="tpm-item-title">{item.title}</span>
                                    <span className="tpm-item-type">{item.type}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="tpm-footer">
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={creating}>Cancel</Button>
                    <Button size="sm" onClick={handleCreate} isLoading={creating}>
                        {creating ? 'Setting up…' : 'Create project'}
                    </Button>
                </div>
            </div>
        </>,
        document.body
    );
}

const CSS = `
.tpm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(3px);
    z-index: 520;
}
.tpm-modal {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 521;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: 14px;
    width: min(440px, 94vw);
    max-height: 85vh;
    display: flex; flex-direction: column;
    overflow: hidden;
    box-shadow: var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.4));
}
.tpm-accent-strip {
    height: 3px;
    background: var(--tpm-accent, var(--cyan-400));
    flex-shrink: 0;
}
.tpm-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; padding: 16px 16px 12px;
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
}
.tpm-head-info { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
.tpm-emoji { font-size: 28px; flex-shrink: 0; line-height: 1.2; }
.tpm-title { font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0 0 3px; }
.tpm-subtitle { font-size: var(--text-xs); color: var(--text-secondary); margin: 0; line-height: 1.5; }
.tpm-close {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; flex-shrink: 0;
    background: transparent; border: none; border-radius: var(--radius-sm);
    color: var(--text-tertiary); cursor: pointer;
    transition: color var(--transition-fast), background var(--transition-fast);
}
.tpm-close:hover { color: var(--text-primary); background: var(--bg-overlay); }

.tpm-rename {
    padding: 12px 16px 0;
    flex-shrink: 0;
}
.tpm-label { display: block; font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; }
.tpm-input {
    width: 100%; box-sizing: border-box;
    padding: 7px 10px;
    background: var(--bg-overlay); border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-sm); color: var(--text-primary);
    font-family: var(--font-sans);
    transition: border-color var(--transition-fast);
    outline: none;
}
.tpm-input:focus { border-color: var(--accent); }
.tpm-input::placeholder { color: var(--text-muted); }

.tpm-section-label {
    display: flex; align-items: center; gap: 5px;
    padding: 12px 16px 6px;
    font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary);
    flex-shrink: 0;
}

.tpm-items {
    flex: 1; overflow-y: auto; padding: 0 16px 8px;
    display: flex; flex-direction: column; gap: 4px;
}
.tpm-items::-webkit-scrollbar { width: 4px; }
.tpm-items::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

.tpm-item {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 10px;
    background: var(--bg-overlay); border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
}
.tpm-item-icon {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; flex-shrink: 0;
    background: var(--accent-muted); border-radius: var(--radius-sm);
    color: var(--tpm-accent, var(--cyan-400));
}
.tpm-item-info { flex: 1; min-width: 0; }
.tpm-item-title {
    display: block; font-size: var(--text-xs); font-weight: 500; color: var(--text-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tpm-item-type { font-size: 10px; color: var(--text-muted); text-transform: capitalize; }

.tpm-footer {
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--border-subtle);
    flex-shrink: 0;
}
`;
