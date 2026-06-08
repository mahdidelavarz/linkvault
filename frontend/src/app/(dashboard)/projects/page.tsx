"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { type Project } from "@/types/project";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CardGrid from "@/components/shared/CardGrid";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectTemplateCard from "@/components/projects/ProjectTemplateCard";
import ProjectTemplatePreviewModal from "@/components/projects/ProjectTemplatePreviewModal";
import { type ProjectTemplate, PROJECT_TEMPLATES } from "@/lib/projectTemplates";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { LucideFolderOpen, LucidePlus, LucideSparkles } from "@/Icons/Icons";

export default function ProjectsPage() {
    const [formOpen, setFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [templateOpen, setTemplateOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

    const { data, isLoading } = useProjects();
    const projects = data ?? [];

    const openCreate = () => { setEditingProject(null); setFormOpen(true); };
    const openEdit = (p: Project) => { setEditingProject(p); setFormOpen(true); };
    const closeForm = () => { setFormOpen(false); setEditingProject(null); };

    const openTemplate = (t: ProjectTemplate) => { setSelectedTemplate(t); setTemplateOpen(true); };
    const closeTemplate = () => { setTemplateOpen(false); setSelectedTemplate(null); };

    return (
        <>
            <PageLayout
                top={
                    <PageHeader
                        title="Projects"
                        subtitle={isLoading ? '…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
                        action={
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button variant="ghost" onClick={() => setTemplateOpen(true)}>
                                    <LucideSparkles width={14} />
                                    Templates
                                </Button>
                                <Button onClick={openCreate}>
                                    <LucidePlus width={14} />
                                    New project
                                </Button>
                            </div>
                        }
                    />
                }
            >
                {/* Template strip */}
                <div className="pp-templates">
                    <div className="pp-templates-label">
                        <LucideSparkles width={12} />
                        Start from a template
                    </div>
                    <div className="pp-templates-row">
                        {PROJECT_TEMPLATES.map(t => (
                            <ProjectTemplateCard key={t.id} template={t} onUse={() => openTemplate(t)} />
                        ))}
                    </div>
                </div>

                {/* Projects grid */}
                {isLoading ? (
                    <CardGrid>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="pp-skeleton" />
                        ))}
                    </CardGrid>
                ) : projects.length > 0 ? (
                    <CardGrid>
                        {projects.map(p => (
                            <ProjectCard key={p.id} project={p} onEdit={openEdit} />
                        ))}
                    </CardGrid>
                ) : (
                    <EmptyState
                        icon={LucideFolderOpen}
                        title="No projects yet"
                        subtitle="Create a project to group related links, notes, snippets, and more in one place."
                        action={
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button variant="ghost" onClick={() => openTemplate(PROJECT_TEMPLATES[0])}>
                                    <LucideSparkles width={14} />
                                    Use a template
                                </Button>
                                <Button onClick={openCreate}>
                                    <LucidePlus width={14} />
                                    New project
                                </Button>
                            </div>
                        }
                    />
                )}
            </PageLayout>

            <Modal isOpen={formOpen} onClose={closeForm} title={editingProject ? 'Edit project' : 'New project'}>
                <ProjectForm project={editingProject} onClose={closeForm} />
            </Modal>

            <ProjectTemplatePreviewModal
                isOpen={templateOpen}
                template={selectedTemplate}
                onClose={closeTemplate}
            />

            <style>{CSS}</style>
        </>
    );
}

const CSS = `
.pp-templates {
    margin-bottom: 8px;
}
.pp-templates-label {
    display: flex; align-items: center; gap: 5px;
    font-size: var(--text-xs); font-weight: 600; color: var(--text-tertiary);
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 10px;
}
.pp-templates-label svg { color: var(--cyan-400); }
.pp-templates-row {
    display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px;
    scrollbar-width: none;
}
.pp-templates-row::-webkit-scrollbar { display: none; }
.pp-skeleton {
    height: 90px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
`;
