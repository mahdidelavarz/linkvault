'use client';

import { useState } from 'react';
import { useLinks } from '@/hooks/useLinks';
import { Link } from '@/types/link';
import LinkCard from '@/components/links/LinkCard';
import LinkForm from '@/components/links/LinkForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function LinksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: links, isLoading } = useLinks({
    search: searchTerm || undefined
  });

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Links</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage your saved links
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Add Link
          </Button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading links...</p>
        </div>
      ) : links && links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            {searchTerm ? 'No links found matching your search' : 'No links yet'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsModalOpen(true)}>
              Add your first link
            </Button>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <LinkForm link={editingLink} onClose={handleClose} />
      </Modal>
    </div>
  );
}