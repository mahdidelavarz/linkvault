'use client';

import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/note';
import { useAutoSave } from '@/hooks/useNote';
import Input from '@/components/ui/Input';

interface NoteEditorProps {
  note: Note;
  onUpdate: () => void;
}

export default function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { autoSave, isSaving } = useAutoSave(note.id);

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]); // Only reset when note ID changes

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    autoSave(content, newTitle);
    setLastSaved(new Date());
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    autoSave(newContent);
    setLastSaved(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <Input
        label=""
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title..."
        className="text-2xl font-bold border-none px-0 focus:ring-0"
      />

      {/* Auto-save indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {isSaving ? (
          <span className="flex items-center gap-1">
            <span className="animate-spin">⚙️</span> Saving...
          </span>
        ) : lastSaved ? (
          <span>✅ Saved at {lastSaved.toLocaleTimeString()}</span>
        ) : null}
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing... (Markdown supported)"
        rows={20}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
      />
    </div>
  );
}