'use client';

import { useState } from 'react';
import { useNotes, useNote } from '@/hooks/useNote';
import { useCategories } from '@/hooks/useCategories';
import { Note } from '@/types/note';
import NoteCard from '@/components/notes/NoteCard';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteForm from '@/components/notes/NoteForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function NotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showPinned, setShowPinned] = useState(false);

  const { data: categories } = useCategories();
  const { data: notes, isLoading } = useNotes({
    search: searchTerm || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
    isPinned: showPinned || undefined,
  });

  const { data: selectedNote } = useNote(selectedNoteId || 0);

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  const handleEditDetails = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowPinned(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory || showPinned;

  return (
    <div className="h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
          <p className="text-sm text-gray-600">Markdown-powered notes with auto-save</p>
        </div>
        <Button onClick={handleCreateNew}>+ New Note</Button>
      </div>

      <div className="flex gap-6 h-full">
        {/* Notes List Sidebar */}
        <div className="w-80 flex-shrink-0 overflow-y-auto">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-3 mb-4 space-y-3">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={showPinned}
                  onChange={(e) => setShowPinned(e.target.checked)}
                  className="w-3.5 h-3.5"
                />
                Pinned
              </label>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-red-600">
                Clear filters
              </button>
            )}
          </div>

          {/* Notes List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => handleSelectNote(note)}
                  isActive={selectedNoteId === note.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No notes found</p>
              {!hasActiveFilters && (
                <Button variant="outline" onClick={handleCreateNew} className="mt-3 text-sm">
                  Create your first note
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Note Editor */}
        <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto">
          {selectedNote ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEditDetails(selectedNote)}>
                    ✏️ Edit Details
                  </Button>
                </div>
                <div className="text-xs text-gray-400">
                  Created: {new Date(selectedNote.createdAt).toLocaleDateString()}
                </div>
              </div>
              <NoteEditor
                key={selectedNote.id}
                note={selectedNote}
                onUpdate={() => {}}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-6xl mb-4">📝</p>
                <p className="text-lg">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note Form Modal */}
      <Modal isOpen={isFormOpen} onClose={handleFormClose}>
        <NoteForm note={editingNote} onClose={handleFormClose} />
      </Modal>
    </div>
  );
}