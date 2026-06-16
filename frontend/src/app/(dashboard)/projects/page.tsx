"use client";

import { useState } from "react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { type Project } from "@/features/projects/types/project";
import PageLayout from "@/features/shared/layout/PageLayout";
import PageHeader from "@/features/shared/ui/PageHeader";
import EmptyState from "@/features/shared/ui/EmptyState";
import CardGrid from "@/features/shared/components/CardGrid";
import ProjectCard from "@/features/projects/components/ProjectCard";
import ProjectForm from "@/features/projects/components/ProjectForm";
import ProjectTemplateCard from "@/features/projects/components/ProjectTemplateCard";
import ProjectTemplatePreviewModal from "@/features/projects/components/ProjectTemplatePreviewModal";
import { type ProjectTemplate, PROJECT_TEMPLATES } from "@/features/projects/template/projectTemplates";
import Modal from "@/features/shared/ui/Modal";
import Button from "@/features/shared/ui/Button";
import { LucideFolderOpen, LucidePlus, LucideSearch, LucideSparkles, LucideX } from "@/Icons/Icons";

export default function ProjectsPage() {
    const [formOpen, setFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
    const [templateOpen, setTemplateOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useProjects();
    const projects = data ?? [];
    const filteredProjects = projects.filter(p =>
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase())
    );

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
                                <Button variant="ghost" onClick={() => setTemplateGalleryOpen(true)}>
                                    <LucideSparkles width={16} />
                                    Templates
                                </Button>
                                <Button onClick={openCreate}>
                                    <LucidePlus width={20} />
                                    New project
                                </Button>
                            </div>
                        }
                    />
                }
            >
                {/* Search */}
                <div className="pp-filters-bar">
                    <div className="pp-search-wrap">
                        <LucideSearch className="pp-search-icon" />
                        <input
                            className="pp-search"
                            type="text"
                            placeholder="Search projects…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="pp-search-clear" onClick={() => setSearch("")} aria-label="Clear">
                                <LucideX width={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Projects grid */}
                {isLoading ? (
                    <CardGrid>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="pp-skeleton" />
                        ))}
                    </CardGrid>
                ) : filteredProjects.length > 0 ? (
                    <CardGrid>
                        {filteredProjects.map(p => (
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
                        hasFilters={!!search}
                        filteredTitle="No projects found"
                        onClearFilters={() => setSearch("")}
                    />
                )}
            </PageLayout>

            <Modal isOpen={formOpen} onClose={closeForm} title={editingProject ? 'Edit project' : 'New project'}>
                <ProjectForm project={editingProject} onClose={closeForm} />
            </Modal>

            <Modal
                isOpen={templateGalleryOpen}
                onClose={() => setTemplateGalleryOpen(false)}
                title="Project Templates"
                size="lg"
            >
                <div className="pp-tgallery">
                    <p className="pp-tgallery-sub">Pick a template to get started instantly</p>
                    <div className="pp-tgallery-grid">
                        {PROJECT_TEMPLATES.map(t => (
                            <ProjectTemplateCard
                                key={t.id}
                                template={t}
                                onUse={() => { setTemplateGalleryOpen(false); openTemplate(t); }}
                            />
                        ))}
                    </div>
                </div>
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
.pp-filters-bar {
    display:        flex;
    flex-direction: column;
    gap:            8px;
    padding:        14px 16px;
    background:     var(--bg-surface);
    border:         1px solid var(--border-default);
    border-radius:  var(--radius-lg);
    margin-bottom:  10px;
}
.pp-search-wrap {
    position:    relative;
    display:     flex;
    align-items: center;
}
.pp-search-icon {
    position: absolute;
    left:     10px;
    width:    14px;
    height:   14px;
    color:    var(--text-tertiary);
    pointer-events: none;
}
.pp-search {
    width:         100%;
    height:        34px;
    padding:       0 30px 0 32px;
    background:    var(--bg-subtle);
    border:        1px solid var(--border-default);
    border-radius: var(--radius-md);
    color:         var(--text-primary);
    font-family:   var(--font-sans);
    font-size:     var(--text-sm);
    outline:       none;
    transition:    border-color var(--transition-fast), background var(--transition-fast);
}
.pp-search::placeholder { color: var(--text-tertiary); }
.pp-search:focus { border-color: var(--border-focus); background: var(--bg-elevated); }
.pp-search-clear {
    position:    absolute;
    right:       8px;
    display:     flex;
    align-items: center;
    justify-content: center;
    width:       18px;
    height:      18px;
    background:  var(--bg-overlay);
    border:      none;
    border-radius: 50%;
    color:       var(--text-tertiary);
    cursor:      pointer;
}
.pp-tgallery {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.pp-tgallery-sub {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
}
.pp-tgallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
}
.pp-tgallery-grid .ptcard {
    min-width: 0;
    max-width: none;
    width: 100%;
    flex-shrink: 1;
}
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
