'use client';

import { Note } from '@/types/note';
import { useTogglePin, useDeleteNote } from '@/hooks/useNote';
import Button from '@/components/ui/Button';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  isActive?: boolean;
}

export default function NoteCard({ note, onEdit, isActive }: NoteCardProps) {
  const togglePin = useTogglePin();
  const deleteNote = useDeleteNote();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(note.id);
    }
  };

  const preview = note.content
    ? note.content.substring(0, 150).replace(/[#*`]/g, '')
    : 'Empty note...';

  return (
    <div
      className={`
        p-4 rounded-lg cursor-pointer transition-all duration-200 border
        ${isActive 
          ? 'bg-blue-50 border-blue-300 shadow-md' 
          : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
        }
      `}
      onClick={() => onEdit(note)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 truncate flex-1">
          {note.isPinned && '📌 '}
          {note.title || 'Untitled Note'}
        </h3>
        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin.mutate(note.id);
            }}
            className="text-gray-400 hover:text-yellow-500"
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            {note.isPinned ? '📌' : '📌'}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 line-clamp-3 mb-3">
        {preview}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {note.category && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            📁 {note.category.name}
          </span>
        )}
        {note.tags && note.tags.slice(0, 3).map((tag: any) => (
          <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {tag.name}
          </span>
        ))}
        {note.tags && note.tags.length > 3 && (
          <span className="text-xs text-gray-400">
            +{note.tags.length - 3}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-red-400 hover:text-red-600"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}