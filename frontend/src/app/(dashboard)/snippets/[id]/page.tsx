"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSnippet, useDeleteSnippet, useToggleSnippetFavorite } from "@/features/snippets/hooks/useSnippet";
import { useItemMembership } from "@/features/projects/hooks/useProjects";
import { useProjectAwareEdit } from "@/features/shared/hooks/useProjectAwareEdit";
import { type Snippet, type SnippetType, SNIPPET_TYPES } from "@/features/snippets/types/snippet";
import { getLanguageName } from "@/features/snippets/utils/languageDetector";
import { testRegex, getMatchParts } from "@/features/snippets/utils/snippetUtils";
import PageLayout from "@/features/shared/layout/PageLayout";
import EmptyState from "@/features/shared/ui/EmptyState";
import Badge from "@/features/shared/ui/Badge";
import Button from "@/features/shared/ui/Button";
import CodeBlock from "@/features/shared/ui/CodeBlock";
import CopyButton from "@/features/shared/components/CopyButton";
import TagSection from "@/features/shared/components/TagSection";
import ConfirmDeleteModal from "@/features/shared/components/ConfirmDeleteModal";
import MultiProjectEditWarning from "@/features/projects/components/MultiProjectEditWarning";
import Modal from "@/features/shared/ui/Modal";
import {
  LucideChevronRight,
  LucideCodeXml,
  LucideStar,
  LucidePencil,
  LucideTrash2,
  LucideLayers,
} from "@/Icons/Icons";
import SnippetForm from "@/features/snippets/components/SnippetForm";

const LANG_COLORS: Record<string, string> = {
  js: 'orange', jsx: 'orange', ts: 'cyan', tsx: 'cyan',
  py: 'cyan', go: 'cyan', rs: 'orange', java: 'orange',
  sql: 'purple', json: 'success', yaml: 'warning',
  html: 'orange', css: 'purple', sh: 'default', bash: 'default',
  regex: 'pink', curl: 'warning', md: 'default',
};

const FLAG_TITLES: Record<string, string> = {
  g: 'Global', i: 'Case insensitive', m: 'Multiline', s: 'Dot matches newline', u: 'Unicode',
};

const FILE_BASENAME: Record<SnippetType, string> = {
  code: 'snippet', sql: 'query', regex: 'pattern', command: 'command',
  curl: 'request', json: 'data', script: 'script',
};

export default function SnippetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);

  const { data: snippet, isLoading } = useSnippet(id);
  const toggleFav = useToggleSnippetFavorite();
  const deleteSnip = useDeleteSnippet();
  const { data: projects } = useItemMembership('snippet', id);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [duplicateFrom, setDuplicateFrom] = useState<Snippet | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState('');
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (snippet && !seeded) {
      setTestString(snippet.metadata?.testString ?? '');
      setFlags(snippet.metadata?.flags ?? '');
      setSeeded(true);
    }
  }, [snippet, seeded]);

  const { handleEdit, confirmEdit, cancelEdit, isWarnOpen, projectNames } =
    useProjectAwareEdit<Snippet>({
      itemType: 'snippet',
      itemId: id,
      onEdit: (s) => { setEditingSnippet(s); setDuplicateFrom(null); setFormOpen(true); },
    });

  const openClone = (s: Snippet) => { setEditingSnippet(null); setDuplicateFrom(s); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditingSnippet(null); setDuplicateFrom(null); };
  const toggleFlag = (f: string) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, '') : prev + f);
  };

  if (isLoading) {
    return (
      <PageLayout top={<div className="sd-skeleton-block sd-skeleton-head" />}>
        <div className="sd-layout">
          <div className="sd-main">
            <div className="sd-skeleton-block" style={{ height: 320 }} />
          </div>
          <div className="sd-sidebar">
            <div className="sd-skeleton-block" style={{ height: 160 }} />
            <div className="sd-skeleton-block" style={{ height: 100 }} />
          </div>
        </div>
        <style>{CSS}</style>
      </PageLayout>
    );
  }

  if (!snippet) {
    return (
      <PageLayout top={null}>
        <EmptyState
          icon={LucideCodeXml}
          title="Snippet not found"
          subtitle="This snippet may have been deleted."
          action={<Button onClick={() => router.push('/snippets')}>Back to snippets</Button>}
        />
        <style>{CSS}</style>
      </PageLayout>
    );
  }

  const typeConfig = SNIPPET_TYPES[snippet.snippetType];
  const langName = getLanguageName(snippet.language);
  const langColor = (LANG_COLORS[snippet.language] ?? 'default') as any;
  const codeBarLabel = `${FILE_BASENAME[snippet.snippetType]}.${snippet.language}`;

  const metaRows: { key: string; value: string }[] = [];
  if (snippet.snippetType === 'regex' && snippet.metadata?.flags) metaRows.push({ key: 'Flags', value: snippet.metadata.flags });
  if (snippet.snippetType === 'sql' && snippet.metadata?.databaseType) metaRows.push({ key: 'Database', value: snippet.metadata.databaseType });
  if (snippet.snippetType === 'command' && snippet.metadata?.shellType) metaRows.push({ key: 'Shell', value: snippet.metadata.shellType });
  if (snippet.snippetType === 'curl' && snippet.metadata?.curlMethod) metaRows.push({ key: 'Method', value: snippet.metadata.curlMethod });
  if (snippet.snippetType === 'script' && snippet.metadata?.scriptLanguage) metaRows.push({ key: 'Script language', value: snippet.metadata.scriptLanguage });

  const { matches } = testString ? testRegex(snippet.content, testString, flags) : { matches: [] };
  const matchParts = testString ? getMatchParts(testString, snippet.content, flags) : [];

  return (
    <>
      <style>{CSS}</style>
      <PageLayout
        top={
          <>
            <nav className="sd-crumbs">
              <Link href="/snippets">Snippets</Link>
              <LucideChevronRight width={12} />
              <span>{typeConfig?.label}</span>
              <LucideChevronRight width={12} />
              <span className="sd-crumb-current">{snippet.title}</span>
            </nav>

            <div className="sd-head">
              <div className="sd-head-main">
                <div className="sd-head-badges">
                  <Badge variant={langColor}>{typeConfig?.label}</Badge>
                  <button
                    className={['sd-fav-chip', snippet.isFavorite ? 'sd-fav-chip--active' : ''].filter(Boolean).join(' ')}
                    onClick={() => toggleFav.mutate(snippet.id)}
                    disabled={toggleFav.isPending}
                    type="button"
                  >
                    <LucideStar width={13} />
                    {snippet.isFavorite ? 'Favorite' : 'Add to favorites'}
                  </button>
                </div>
                <h1 className="sd-title">{snippet.title}</h1>
                {snippet.description && <p className="sd-desc">{snippet.description}</p>}
              </div>

              <div className="sd-actions">
                <CopyButton text={snippet.content} label="Copy" />
                <Button variant="secondary" leftIcon={LucideLayers} onClick={() => openClone(snippet)}>Clone</Button>
                <Button variant="secondary" leftIcon={LucidePencil} onClick={() => handleEdit(snippet)}>Edit</Button>
                <Button variant="danger" leftIcon={LucideTrash2} onClick={() => setConfirmDelete(true)}>Delete</Button>
              </div>
            </div>
          </>
        }
      >
        <div className="sd-layout">
          {/* ── Left column ── */}
          <div className="sd-main">
            <div className="sd-code-block">
              <div className="sd-code-bar">
                <span className="sd-code-bar-label">{codeBarLabel}</span>
                <CopyButton text={snippet.content} size="sm" />
              </div>
              <div className="sd-code-scroll">
                <CodeBlock code={snippet.content} language={snippet.language} />
              </div>
            </div>

            {snippet.snippetType === 'regex' && (
              <div className="sd-panel">
                <h3 className="sd-panel-title">Regex tester</h3>

                <div className="sd-field">
                  <span className="sd-field-label">Test string</span>
                  <textarea
                    className="sd-input"
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter a string to test against the pattern…"
                  />
                </div>

                <div className="sd-field">
                  <span className="sd-field-label">Flags</span>
                  <div className="sd-flags">
                    {['g', 'i', 'm', 's', 'u'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={['sd-flag', flags.includes(f) ? 'sd-flag--on' : ''].filter(Boolean).join(' ')}
                        title={FLAG_TITLES[f]}
                        onClick={() => toggleFlag(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sd-field">
                  <div className="sd-field-label-row">
                    <span className="sd-field-label">Result</span>
                    {testString && (
                      <span className="sd-match-count">
                        {matches.length} match{matches.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  <div className="sd-match-result">
                    {matchParts.length === 0
                      ? <span className="sd-faint">No test string yet</span>
                      : matchParts.map((p, i) =>
                          p.match
                            ? <mark key={i} className="sd-regex-match">{p.text}</mark>
                            : <span key={i}>{p.text}</span>
                        )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="sd-sidebar">
            <div className="sd-meta-card">
              <h3 className="sd-meta-title">Details</h3>
              <div className="sd-meta-row">
                <span className="sd-meta-key">Type</span>
                <span className="sd-meta-val">{typeConfig?.label}</span>
              </div>
              <div className="sd-meta-row">
                <span className="sd-meta-key">Language</span>
                <span className="sd-meta-val">{langName}</span>
              </div>
              {snippet.category && (
                <div className="sd-meta-row">
                  <span className="sd-meta-key">Category</span>
                  <span className="sd-meta-val">{snippet.category.name}</span>
                </div>
              )}
              {metaRows.map((row) => (
                <div className="sd-meta-row" key={row.key}>
                  <span className="sd-meta-key">{row.key}</span>
                  <span className="sd-meta-val">{row.value}</span>
                </div>
              ))}
              <div className="sd-meta-row">
                <span className="sd-meta-key">Created</span>
                <span className="sd-meta-val">{new Date(snippet.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="sd-meta-row">
                <span className="sd-meta-key">Updated</span>
                <span className="sd-meta-val">{new Date(snippet.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {!!snippet.tags?.length && (
              <div className="sd-meta-card">
                <h3 className="sd-meta-title">Tags</h3>
                <TagSection tags={snippet.tags} />
              </div>
            )}

            {!!projects?.length && (
              <div className="sd-meta-card">
                <h3 className="sd-meta-title">In projects</h3>
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="sd-project-row">
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
      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingSnippet ? "Edit Snippet" : "Duplicate Snippet"}
        size="xl"
      >
        <SnippetForm
          snippet={editingSnippet}
          initialValues={duplicateFrom ?? undefined}
          onClose={closeForm}
        />
      </Modal>

      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        itemName={snippet.title}
        isLoading={deleteSnip.isPending}
        onConfirm={() => deleteSnip.mutate(snippet.id, { onSuccess: () => router.push('/snippets') })}
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
.sd-crumbs {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-xs); color: var(--text-tertiary);
}
.sd-crumbs a { color: var(--text-tertiary); text-decoration: none; transition: color var(--transition-fast); }
.sd-crumbs a:hover { color: var(--text-primary); }
.sd-crumbs svg { flex-shrink: 0; opacity: 0.6; }
.sd-crumb-current {
  color: var(--text-secondary); font-weight: 500;
  max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Head */
.sd-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.sd-head-main { display: flex; flex-direction: column; gap: 8px; min-width: 0; flex: 1; }
.sd-head-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sd-fav-chip {
  display: flex; align-items: center; gap: 5px;
  height: 24px; padding: 0 10px;
  background: var(--bg-overlay); border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  color: var(--text-tertiary); font-size: var(--text-xs); font-family: var(--font-sans); font-weight: 500;
  cursor: pointer; transition: all var(--transition-fast);
}
.sd-fav-chip:hover { border-color: var(--border-strong); color: var(--text-secondary); }
.sd-fav-chip--active { background: var(--warning-muted); border-color: rgba(245,158,11,0.3); color: #fbbf24; }
.sd-title { font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); margin: 0; }
.sd-desc  { font-size: var(--text-sm); color: var(--text-secondary); margin: 0; line-height: var(--leading-relaxed); }
.sd-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }

/* Layout */
.sd-layout {
  display: grid;
  grid-template-columns: minmax(0,1fr) 290px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 860px) {
  .sd-layout { grid-template-columns: 1fr; }
}

.sd-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

/* Code block */
.sd-code-block {
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: var(--radius-lg); overflow: hidden;
}
.sd-code-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
}
.sd-code-bar-label { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-tertiary); }
.sd-code-scroll { max-height: 60vh; overflow-y: auto; }
.sd-code-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.sd-code-scroll::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

/* Regex tester panel */
.sd-panel {
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: var(--radius-lg); padding: 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.sd-panel-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin: 0; }

.sd-field { display: flex; flex-direction: column; gap: 6px; }
.sd-field-label { font-size: var(--text-xs); font-weight: 500; color: var(--text-tertiary); }
.sd-field-label-row { display: flex; align-items: center; justify-content: space-between; }
.sd-input {
  width: 100%; min-height: 70px; padding: 10px 12px; resize: vertical;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md);
  color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-xs);
  line-height: var(--leading-relaxed); outline: none;
  transition: border-color var(--transition-fast);
}
.sd-input:focus { border-color: var(--border-focus); }

.sd-flags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sd-flag {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-sm);
  color: var(--text-tertiary); font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700;
  cursor: pointer; transition: all var(--transition-fast);
}
.sd-flag:hover    { border-color: var(--border-strong); color: var(--text-secondary); }
.sd-flag--on      { background: var(--accent-subtle); border-color: var(--accent-border); color: var(--cyan-300); }

.sd-match-count { font-size: var(--text-xs); font-weight: 500; color: #86efac; }
.sd-match-result {
  font-size: var(--text-xs); font-family: var(--font-mono); line-height: var(--leading-relaxed);
  color: var(--text-secondary); word-break: break-all; white-space: pre-wrap;
  padding: 10px 12px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  min-height: 40px;
}
.sd-regex-match { background: rgba(244,114,182,.18); color: #f472b6; border-radius: 2px; padding: 0 1px; }
.sd-faint       { color: var(--text-tertiary); }

/* Sidebar */
.sd-sidebar { display: flex; flex-direction: column; gap: 16px; }
.sd-meta-card {
  background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
}
.sd-meta-title {
  font-size: var(--text-xs); font-weight: 600; color: var(--text-tertiary);
  text-transform: uppercase; letter-spacing: 0.06em; margin: 0;
}
.sd-meta-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: var(--text-sm); }
.sd-meta-key { color: var(--text-tertiary); }
.sd-meta-val { color: var(--text-primary); font-weight: 500; text-align: right; }

.sd-project-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px; border-radius: var(--radius-md);
  color: var(--text-secondary); font-size: var(--text-sm); text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.sd-project-row:hover { background: var(--bg-overlay); color: var(--text-primary); }

/* Skeleton */
.sd-skeleton-head  { height: 90px; }
.sd-skeleton-block {
  background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
  animation: sd-skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes sd-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;
