"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLink, useDeleteLink, useToggleFavorite } from "@/features/links/hooks/useLinks";
import { useItemMembership } from "@/features/projects/hooks/useProjects";
import { useProjectAwareEdit } from "@/features/shared/hooks/useProjectAwareEdit";
import { type Link as LinkType } from "@/features/links/types/link";
import { CredentialsSection } from "@/features/links/components/LinkCredentials";
import PageLayout from "@/features/shared/layout/PageLayout";
import EmptyState from "@/features/shared/ui/EmptyState";
import Badge from "@/features/shared/ui/Badge";
import Button from "@/features/shared/ui/Button";
import CopyButton from "@/features/shared/components/CopyButton";
import TagSection from "@/features/shared/components/TagSection";
import ConfirmDeleteModal from "@/features/shared/components/ConfirmDeleteModal";
import MultiProjectEditWarning from "@/features/projects/components/MultiProjectEditWarning";
import Modal from "@/features/shared/ui/Modal";
import {
  LucideChevronRight,
  LucideExternalLink,
  LucideLink2,
  LucidePencil,
  LucideStar,
  LucideTrash2,
} from "@/Icons/Icons";
import LinkForm from "@/features/links/components/LinkForm";

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);

  const { data: link, isLoading } = useLink(id);
  const toggleFav = useToggleFavorite();
  const deleteLink = useDeleteLink();
  const { data: projects } = useItemMembership('link', id);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { handleEdit, confirmEdit, cancelEdit, isWarnOpen, projectNames } =
    useProjectAwareEdit<LinkType>({
      itemType: 'link',
      itemId: id,
      onEdit: (l) => { setEditingLink(l); setFormOpen(true); },
    });

  const closeForm = () => { setFormOpen(false); setEditingLink(null); };

  if (isLoading) {
    return (
      <PageLayout top={<div className="lkd-skeleton-block lkd-skeleton-head" />}>
        <div className="lkd-layout">
          <div className="lkd-main">
            <div className="lkd-skeleton-block" style={{ height: 200 }} />
          </div>
          <div className="lkd-sidebar">
            <div className="lkd-skeleton-block" style={{ height: 120 }} />
            <div className="lkd-skeleton-block" style={{ height: 100 }} />
          </div>
        </div>
        <style>{CSS}</style>
      </PageLayout>
    );
  }

  if (!link) {
    return (
      <PageLayout top={null}>
        <EmptyState
          icon={LucideLink2}
          title="Link not found"
          subtitle="This link may have been deleted."
          action={<Button onClick={() => router.push('/links')}>Back to links</Button>}
        />
        <style>{CSS}</style>
      </PageLayout>
    );
  }

  const hostname = (() => {
    try { return new URL(link.url).hostname.replace("www.", ""); }
    catch { return link.url; }
  })();
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  const hasCredentials = link.username || link.email || link.phone || link.passwordEncrypted;

  return (
    <>
      <style>{CSS}</style>
      <PageLayout
        top={
          <>
            <nav className="lkd-crumbs">
              <Link href="/links">Links</Link>
              <LucideChevronRight width={12} />
              <span className="lkd-crumb-current">{link.title}</span>
            </nav>

            <div className="lkd-head">
              <div className="lkd-head-main">
                <div className="lkd-head-badges">
                  {link.category && <Badge variant="default">{link.category.name}</Badge>}
                  <button
                    className={['lkd-fav-chip', link.isFavorite ? 'lkd-fav-chip--active' : ''].filter(Boolean).join(' ')}
                    onClick={() => toggleFav.mutate(link.id)}
                    disabled={toggleFav.isPending}
                    type="button"
                  >
                    <LucideStar width={13} />
                    {link.isFavorite ? 'Favorite' : 'Add to favorites'}
                  </button>
                </div>
                <h1 className="lkd-title">{link.title}</h1>
                <div className="lkd-url-row">
                  <img src={faviconUrl} alt="" width={16} height={16} className="lkd-favicon"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="lkd-url" title={link.url}>
                    {hostname}
                  </a>
                </div>
                {link.description && <p className="lkd-desc">{link.description}</p>}
              </div>

              <div className="lkd-actions">
                <CopyButton text={link.url} label="Copy URL" />
                <Button variant="secondary" leftIcon={LucideExternalLink} onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}>Open</Button>
                <Button variant="secondary" leftIcon={LucidePencil} onClick={() => handleEdit(link)}>Edit</Button>
                <Button variant="danger" leftIcon={LucideTrash2} onClick={() => setConfirmDelete(true)}>Delete</Button>
              </div>
            </div>
          </>
        }
      >
        <div className="lkd-layout">
          {/* ── Left column ── */}
          <div className="lkd-main">
            <div className="lkd-panel">
              <h3 className="lkd-panel-title">Credentials</h3>
              {hasCredentials
                ? <CredentialsSection link={link} />
                : <p className="lkd-empty-text">No credentials saved for this link.</p>}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lkd-sidebar">
            <div className="lkd-meta-card">
              <h3 className="lkd-meta-title">Details</h3>
              {link.category && (
                <div className="lkd-meta-row">
                  <span className="lkd-meta-key">Category</span>
                  <span className="lkd-meta-val">{link.category.name}</span>
                </div>
              )}
              <div className="lkd-meta-row">
                <span className="lkd-meta-key">Created</span>
                <span className="lkd-meta-val">{new Date(link.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="lkd-meta-row">
                <span className="lkd-meta-key">Updated</span>
                <span className="lkd-meta-val">{new Date(link.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {!!link.tags?.length && (
              <div className="lkd-meta-card">
                <h3 className="lkd-meta-title">Tags</h3>
                <TagSection tags={link.tags} />
              </div>
            )}

            {!!projects?.length && (
              <div className="lkd-meta-card">
                <h3 className="lkd-meta-title">In projects</h3>
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="lkd-project-row">
                    <span>{p.emoji || '📁'}</span>
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageLayout>

      {/* ── Modals ── */}
      <Modal isOpen={formOpen} onClose={closeForm} title="Edit Link" size="lg">
        <LinkForm link={editingLink} onClose={closeForm} />
      </Modal>

      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        itemName={link.title}
        isLoading={deleteLink.isPending}
        onConfirm={() => deleteLink.mutate(link.id, { onSuccess: () => router.push('/links') })}
      />

      <MultiProjectEditWarning
        isOpen={isWarnOpen}
        projectNames={projectNames}
        onConfirm={confirmEdit}
        onCancel={cancelEdit}
      />
    </>
  );
}

const CSS = `
/* Breadcrumb */
.lkd-crumbs {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-xs); color: var(--text-tertiary);
}
.lkd-crumbs a { color: var(--text-tertiary); text-decoration: none; transition: color var(--transition-fast); }
.lkd-crumbs a:hover { color: var(--text-primary); }
.lkd-crumbs svg { flex-shrink: 0; opacity: 0.6; }
.lkd-crumb-current {
  color: var(--text-secondary); font-weight: 500;
  max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Head */
.lkd-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.lkd-head-main { display: flex; flex-direction: column; gap: 8px; min-width: 0; flex: 1; }
.lkd-head-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lkd-fav-chip {
  display: flex; align-items: center; gap: 5px;
  height: 24px; padding: 0 10px;
  background: var(--bg-overlay); border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  color: var(--text-tertiary); font-size: var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor: pointer; transition: all var(--transition-fast);
}
.lkd-fav-chip:hover { border-color: var(--border-strong); color: var(--text-secondary); }
.lkd-fav-chip--active { background: var(--warning-muted); border-color: rgba(245,158,11,0.3); color: #fbbf24; }
.lkd-title { font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); margin: 0; }
.lkd-url-row { display: flex; align-items: center; gap: 8px; }
.lkd-favicon { border-radius: var(--radius-sm); }
.lkd-url { font-size: var(--text-sm); color: var(--text-tertiary); text-decoration: none; transition: color var(--transition-fast); }
.lkd-url:hover { color: var(--text-accent); }
.lkd-desc  { font-size: var(--text-sm); color: var(--text-secondary); margin: 0; line-height: var(--leading-relaxed); }
.lkd-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }

/* Layout */
.lkd-layout {
  display: grid;
  grid-template-columns: minmax(0,1fr) 290px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 860px) {
  .lkd-layout { grid-template-columns: 1fr; }
}

.lkd-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

/* Panels */
.lkd-panel {
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: var(--radius-lg); padding: 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.lkd-panel-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin: 0; }
.lkd-empty-text { font-size: var(--text-sm); color: var(--text-tertiary); margin: 0; }

/* Sidebar */
.lkd-sidebar { display: flex; flex-direction: column; gap: 16px; }
.lkd-meta-card {
  background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
}
.lkd-meta-title {
  font-size: var(--text-xs); font-weight: 600; color: var(--text-tertiary);
  text-transform: uppercase; letter-spacing: 0.06em; margin: 0;
}
.lkd-meta-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: var(--text-sm); }
.lkd-meta-key { color: var(--text-tertiary); }
.lkd-meta-val { color: var(--text-primary); font-weight: 500; text-align: right; }

.lkd-project-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px; border-radius: var(--radius-md);
  color: var(--text-secondary); font-size: var(--text-sm); text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.lkd-project-row:hover { background: var(--bg-overlay); color: var(--text-primary); }

/* Skeleton */
.lkd-skeleton-head  { height: 90px; }
.lkd-skeleton-block {
  background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
  animation: lkd-skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes lkd-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;
