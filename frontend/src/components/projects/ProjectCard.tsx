"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Project, PROJECT_COLOR_CSS } from "@/types/project";
import { useDeleteProject } from "@/hooks/useProjects";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";
import ActionButtons from "@/components/shared/ActionButtons";
import { LucideFolder } from "@/Icons/Icons";

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
    const router = useRouter();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const deleteProject = useDeleteProject();

    const accentColor = PROJECT_COLOR_CSS[project.color ?? ''] ?? 'var(--cyan-400)';

    const handleClick = () => router.push(`/projects/${project.id}`);

    return (
        <>
            <style>{CSS}</style>
            <div className="pcard" onClick={handleClick} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
                style={{ '--pcard-accent': accentColor } as React.CSSProperties}>
                <div className="pcard-accent" />

                <div className="pcard-body">
                    <div className="pcard-header">
                        <span className="pcard-emoji">{project.emoji || '📁'}</span>
                        <div className="pcard-info">
                            <h3 className="pcard-title">{project.title}</h3>
                            {project.description && (
                                <p className="pcard-desc">{project.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="pcard-footer">
                        <span className="pcard-count">
                            <LucideFolder width={11} />
                            {project.itemCount} {project.itemCount === 1 ? 'item' : 'items'}
                        </span>
                        <span className="pcard-date">
                            {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <ActionButtons
                            onEdit={() => onEdit(project)}
                            onDelete={() => setConfirmDelete(true)}
                        />
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                itemName={project.title}
                isLoading={deleteProject.isPending}
                onConfirm={() => deleteProject.mutate(project.id, { onSuccess: () => setConfirmDelete(false) })}
            />
        </>
    );
}

const CSS = `
.pcard {
    display: flex;
    flex-direction: row;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
    position: relative;
    min-height: 90px;
}
.pcard:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.pcard:active { transform: scale(0.99); }
.pcard-accent {
    width: 4px;
    flex-shrink: 0;
    background: var(--pcard-accent, var(--cyan-400));
}
.pcard-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 14px 12px;
    min-width: 0;
}
.pcard-header { display: flex; align-items: flex-start; gap: 10px; }
.pcard-emoji { font-size: 22px; flex-shrink: 0; line-height: 1.2; }
.pcard-info { flex: 1; min-width: 0; }
.pcard-title {
    font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 0 3px;
}
.pcard-desc {
    font-size: var(--text-xs); color: var(--text-secondary); line-height: var(--leading-snug);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    margin: 0;
}
.pcard-footer {
    display: flex; align-items: center; gap: 8px;
    padding-top: 8px; border-top: 1px solid var(--border-subtle);
}
.pcard-count {
    display: flex; align-items: center; gap: 4px;
    font-size: var(--text-xs); color: var(--text-tertiary);
}
.pcard-count svg { color: var(--text-muted); }
.pcard-date {
    font-size: var(--text-xs); color: var(--text-tertiary);
    margin-left: auto; white-space: nowrap;
}
`;
