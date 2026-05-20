import { Link } from './link';
import { Note } from './note';
import { Snippet } from './snippet';

export interface SearchResult {
  type: 'link' | 'note' | 'snippet';
  id: number;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  category?: {
    id: number;
    name: string;
  };
  tags?: Array<{
    id: number;
    name: string;
  }>;
  updatedAt: string;
}

export interface SearchResults {
  results: {
    links: SearchResult[];
    notes: SearchResult[];
    snippets: SearchResult[];
  };
  totalResults: number;
  query: string;
  filters: {
    categoryId?: number;
    tagIds?: number[];
    type?: string;
  };
}

export interface SearchFilters {
  query: string;
  type?: 'link' | 'note' | 'snippet' | 'all';
  categoryId?: number;
  tagIds: number[];
}