'use client';

import { SearchResult } from '@/types/search';
import { useRouter } from 'next/navigation';
import { getLanguageIcon, getLanguageName } from '@/lib/languageDetector';

interface SearchResultCardProps {
  result: SearchResult;
  searchTerm: string;
}

export default function SearchResultCard({ result, searchTerm }: SearchResultCardProps) {
  const router = useRouter();

  const handleClick = () => {
    switch (result.type) {
      case 'link':
        window.open((result as any).url, '_blank');
        break;
      case 'note':
        router.push(`/notes`);
        break;
      case 'snippet':
        router.push(`/snippets`);
        break;
    }
  };

  const highlightText = (text: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
        <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark> : 
        part
    );
  };

  const getTypeIcon = () => {
    switch (result.type) {
      case 'link': return '🔗';
      case 'note': return '📝';
      case 'snippet': return '💻';
    }
  };

  const getPreview = () => {
    if (result.type === 'link') {
      return (result as any).url;
    } else if (result.type === 'note' || result.type === 'snippet') {
      const content = (result as any).content || '';
      const preview = content.substring(0, 200).replace(/[#*`\n]/g, ' ');
      return preview + (content.length > 200 ? '...' : '');
    }
    return '';
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-1">{getTypeIcon()}</span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {result.type}
            </span>
            {result.type === 'snippet' && (result as any).language && (
              <span className="text-xs text-gray-500">
                {getLanguageIcon((result as any).language)} {getLanguageName((result as any).language)}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {highlightText(result.title)}
          </h3>

          {getPreview() && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {highlightText(getPreview())}
            </p>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            {result.category && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📁 {result.category.name}
              </span>
            )}
            {result.tags?.map(tag => (
              <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                🏷️ {tag.name}
              </span>
            ))}
          </div>
        </div>

        <span className="text-xs text-gray-400 flex-shrink-0">
          {new Date(result.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}