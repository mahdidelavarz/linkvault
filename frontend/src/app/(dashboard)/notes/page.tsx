"use client";

import { useState, useRef, useCallback } from "react";
import { useNotes, useNote } from "@/hooks/useNote";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCategories } from "@/hooks/useCategories";
import { type Note } from "@/types/note";
import NoteCard from "@/components/notes/NoteCard";
import NoteEditor from "@/components/notes/NoteEditor";
import NoteForm from "@/components/notes/NoteForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import {
  LucideArrowLeft,
  LucideChevronDown,
  LucideFileText,
  LucidePin,
  LucidePlus,
  LucideSearch,
  LucideSearchX,
  LucideX,
} from "@/Icons/Icons";

export default function NotesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showPinned, setShowPinned] = useState(false);
  // Mobile: show editor panel instead of list
  const [mobileView, setMobileView] = useState<"list" | "editor">("list");

  const sidebarRef = useRef<HTMLElement>(null);
  const { data: categories } = useCategories();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotes({
    search: search || undefined,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    isPinned: showPinned || undefined,
  });
  const notes = data?.pages.flatMap((p) => p.items) ?? [];
  const { data: selectedNote } = useNote(selectedId ?? 0);

  const onReach = useCallback(() => { if (hasNextPage) fetchNextPage(); }, [hasNextPage, fetchNextPage]);
  const sentinelRef = useInfiniteScroll(onReach, !!hasNextPage && !isLoading, sidebarRef.current);

  const hasFilters = !!(search || categoryId || showPinned);
  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setShowPinned(false);
  };

  const openCreate = () => {
    setEditingNote(null);
    setFormOpen(true);
  };
  const openEditDetails = (note: Note) => {
    setEditingNote(note);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingNote(null);
  };

  const selectNote = (note: Note) => {
    setSelectedId(note.id);
    setMobileView("editor");
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="notes-page">
        {/* ── Page header ── */}
        <PageHeader
          title="Notes"
          subtitle="Markdown-powered, auto-save"
          action={<Button leftIcon={LucidePlus} onClick={openCreate}>New Note</Button>}
        />

        {/* ── Main layout: sidebar + editor ── */}
        <div className="notes-layout">
          {/* ── Sidebar (list) ── */}
          <aside
            ref={sidebarRef}
            className={[
              "notes-sidebar",
              mobileView === "editor" ? "notes-sidebar--hidden" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Filters */}
            <div className="notes-filters">
              <div className="nf-search-wrap">
                <LucideSearch className="nf-search-icon" />
                <input
                  className="nf-search"
                  type="text"
                  placeholder="Search notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="nf-search-clear"
                    onClick={() => setSearch("")}
                  >
                    <LucideX width={11} />
                  </button>
                )}
              </div>

              <div className="nf-row">
                <div className="nf-select-wrap">
                  <select
                    className="nf-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">All categories</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <LucideChevronDown className="nf-select-chevron" />
                </div>

                <button
                  className={[
                    "nf-pin-toggle",
                    showPinned ? "nf-pin-toggle--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setShowPinned((p) => !p)}
                  aria-label="Show pinned only"
                >
                  <LucidePin width={13} />
                  Pinned
                </button>
              </div>

              {hasFilters && (
                <button className="nf-clear" onClick={clearFilters}>
                  <LucideX width={12} />
                  Clear filters
                </button>
              )}
            </div>

            {/* Note list */}
            <div className="notes-list">
              {isLoading ? (
                [...Array(5)].map((_, i) => <NoteCardSkeleton key={i} />)
              ) : notes.length > 0 ? (
                <>
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isActive={selectedId === note.id}
                      onSelect={() => selectNote(note)}
                      onEditDetails={() => openEditDetails(note)}
                    />
                  ))}
                  <div ref={sentinelRef} style={{ height: 1 }} />
                  {isFetchingNextPage && [...Array(2)].map((_, i) => <NoteCardSkeleton key={i} />)}
                </>
              ) : (
                <div className="notes-empty-list">
                  {hasFilters ? (
                    <LucideSearchX width={20} />
                  ) : (
                    <LucideFileText width={20} />
                  )}
                  <p>{hasFilters ? "No notes found" : "No notes yet"}</p>
                  {!hasFilters && (
                    <button className="notes-empty-create" onClick={openCreate}>
                      Create your first note
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* ── Editor panel ── */}
          <div
            className={[
              "notes-editor-panel",
              mobileView === "list" ? "notes-editor-panel--hidden" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Mobile back button */}
            <button
              className="notes-back-btn"
              onClick={() => setMobileView("list")}
            >
              <LucideArrowLeft width={14} />
              All notes
            </button>

            {selectedNote ? (
              <NoteEditor
                key={selectedNote.id}
                note={selectedNote}
                onEditDetails={() => openEditDetails(selectedNote)}
              />
            ) : (
              <div className="notes-no-selection">
                <div className="notes-no-selection-icon">
                  <LucideFileText width={28} />
                </div>
                <p className="notes-no-selection-title">No note selected</p>
                <p className="notes-no-selection-sub">
                  Choose a note from the list or create a new one
                </p>
                <Button leftIcon={LucidePlus} onClick={openCreate}>
                  New Note
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingNote ? "Edit note details" : "New note"}
        size="md"
      >
        <NoteForm note={editingNote} onClose={closeForm} />
      </Modal>
    </>
  );
}

function NoteCardSkeleton() {
  return (
    <div className="note-skeleton">
      <div
        className="skeleton"
        style={{ height: 16, width: "75%", marginBottom: 8 }}
      />
      <div
        className="skeleton"
        style={{ height: 12, width: "100%", marginBottom: 4 }}
      />
      <div
        className="skeleton"
        style={{ height: 12, width: "80%", marginBottom: 12 }}
      />
      <div style={{ display: "flex", gap: 6 }}>
        <div
          className="skeleton"
          style={{ height: 18, width: 60, borderRadius: 99 }}
        />
        <div
          className="skeleton"
          style={{ height: 18, width: 45, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

const CSS = `
.notes-page   { display: flex; flex-direction: column; height: calc(100dvh - 58px); gap:10px; }

/* ── Layout ── */
.notes-layout {
  display:   flex;
  gap:       0;
  flex:      1;
  min-height: 0;
  background: var(--bg-surface);
  border:    1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow:  hidden;
}

/* ── Sidebar ── */
.notes-sidebar {
  display:        flex;
  flex-direction: column;
  width:          280px;
  flex-shrink:    0;
  border-right:   1px solid var(--border-default);
  overflow:       hidden;
}
@media (max-width: 767px) {
  .notes-sidebar         { width: 100%; border-right: none; }
  .notes-sidebar--hidden { display: none; }
}

/* Filters */
.notes-filters {
  display:        flex;
  flex-direction: column;
  gap:            8px;
  padding:        12px;
  border-bottom:  1px solid var(--border-subtle);
  flex-shrink:    0;
}
.nf-search-wrap { position: relative; display: flex; align-items: center; }
.nf-search-icon {
  position:       absolute;
  left:           9px;
  width:          13px;
  height:         13px;
  color:          var(--text-tertiary);
  pointer-events: none;
}
.nf-search {
  width:         100%;
  height:        32px;
  padding:       0 26px 0 30px;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  outline:       none;
  transition:    border-color var(--transition-fast);
}
.nf-search::placeholder { color: var(--text-tertiary); }
.nf-search:focus         { border-color: var(--border-focus); }
.nf-search-clear {
  position:      absolute;
  right:         7px;
  display:       flex;
  align-items:   center;
  justify-content: center;
  width:         16px;
  height:        16px;
  background:    var(--bg-overlay);
  border:        none;
  border-radius: 50%;
  color:         var(--text-tertiary);
  cursor:        pointer;
}
.nf-row { display: flex; gap: 6px; align-items: center; }

.nf-select-wrap { position: relative; flex: 1; }
.nf-select-chevron {
  position:       absolute;
  right:          7px;
  top:            50%;
  transform:      translateY(-50%);
  width:          11px;
  height:         11px;
  color:          var(--text-tertiary);
  pointer-events: none;
}
.nf-select {
  width:            100%;
  height:           30px;
  padding:          0 22px 0 8px;
  background:       var(--bg-elevated);
  border:           1px solid var(--border-default);
  border-radius:    var(--radius-md);
  color:            var(--text-secondary);
  font-family:      var(--font-sans);
  font-size:        var(--text-xs);
  outline:          none;
  cursor:           pointer;
  appearance:       none;
  -webkit-appearance: none;
  transition:       border-color var(--transition-fast);
}
.nf-select:focus { border-color: var(--border-focus); }
.nf-select option { background: var(--bg-elevated); }

.nf-pin-toggle {
  display:       flex;
  align-items:   center;
  gap:           5px;
  height:        30px;
  padding:       0 10px;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-xs);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  white-space:   nowrap;
  flex-shrink:   0;
  transition:    background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.nf-pin-toggle:hover         { border-color: var(--border-strong); }
.nf-pin-toggle--active       { background: var(--accent-muted); border-color: var(--accent-border); color: var(--cyan-300); }

.nf-clear {
  display:     flex;
  align-items: center;
  gap:         5px;
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
  background:  transparent;
  border:      none;
  cursor:      pointer;
  padding:     2px 0;
  transition:  color var(--transition-fast);
  font-family: var(--font-sans);
}
.nf-clear:hover { color: var(--danger); }

/* Note list */
.notes-list {
  flex:       1;
  overflow-y: auto;
  padding:    8px;
  display:    flex;
  flex-direction: column;
  gap:        4px;
}
.notes-list::-webkit-scrollbar { width: 0; }

.note-skeleton {
  padding:       12px;
  border-radius: var(--radius-md);
  border:        1px solid var(--border-subtle);
}

.notes-empty-list {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            8px;
  padding:        40px 16px;
  color:          var(--text-tertiary);
  text-align:     center;
  font-size:      var(--text-sm);
}
.notes-empty-create {
  color:      var(--text-accent);
  background: transparent;
  border:     none;
  font-size:  var(--text-sm);
  font-family: var(--font-sans);
  cursor:     pointer;
  font-weight: 500;
  transition: color var(--transition-fast);
}
.notes-empty-create:hover { color: var(--accent-hover); }

/* ── Editor panel ── */
.notes-editor-panel {
  flex:           1;
  display:        flex;
  flex-direction: column;
  min-width:      0;
  overflow:       hidden;
}
@media (max-width: 767px) {
  .notes-editor-panel--hidden { display: none; }
  .notes-editor-panel         { width: 100%; }
}

/* Mobile back button */
.notes-back-btn {
  display:     none;
  align-items: center;
  gap:         6px;
  padding:     10px 14px;
  background:  transparent;
  border:      none;
  border-bottom: 1px solid var(--border-subtle);
  color:       var(--text-secondary);
  font-size:   var(--text-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor:      pointer;
  transition:  color var(--transition-fast);
  flex-shrink: 0;
}
.notes-back-btn:hover { color: var(--text-primary); }
@media (max-width: 767px) {
  .notes-back-btn { display: flex; }
}

/* No selection */
.notes-no-selection {
  flex:            1;
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             12px;
  padding:         40px 24px;
  text-align:      center;
}
.notes-no-selection-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           56px;
  height:          56px;
  background:      var(--bg-overlay);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  color:           var(--text-tertiary);
}
.notes-no-selection-title { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.notes-no-selection-sub   { font-size: var(--text-sm); color: var(--text-tertiary); }
`;
