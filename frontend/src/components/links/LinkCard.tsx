'use client';

import { Link as LinkType } from '@/types/link';
import { useToggleFavorite, useDeleteLink } from '@/hooks/useLinks';
import Button from '@/components/ui/Button';

interface LinkCardProps {
  link: LinkType;
  onEdit: (link: LinkType) => void;
}

export default function LinkCard({ link, onEdit }: LinkCardProps) {
  const toggleFavorite = useToggleFavorite();
  const deleteLink = useDeleteLink();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      deleteLink.mutate(link.id);
    }
  };

  const openLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            <button 
              onClick={openLink}
              className="hover:text-blue-600 transition-colors text-left"
            >
              {link.title}
            </button>
          </h3>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 truncate block"
          >
            {link.url}
          </a>
        </div>
        
        <button
          onClick={() => toggleFavorite.mutate(link.id)}
          className="ml-2 text-2xl hover:scale-110 transition-transform"
          title={link.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {link.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {link.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {link.description}
        </p>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 flex-wrap">
        {link.username && <span>👤 {link.username}</span>}
        {link.email && <span>📧 {link.email}</span>}
        {link.phone && <span>📱 {link.phone}</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {link.category && (
          <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            📁 {link.category.name}
          </span>
        )}

        {link.tags && link.tags.length > 0 && link.tags.map((tag: any) => (
          <span key={tag.id} className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            🏷️ {tag.name}
          </span>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t">
        <Button variant="outline" onClick={() => onEdit(link)}>
          Edit
        </Button>
        <Button variant="secondary" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}