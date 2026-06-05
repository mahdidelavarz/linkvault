export interface SearchResult {
  type: 'link' | 'note' | 'snippet' | 'prompt' | 'infrastructure';
  id: number;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  isFavorite?: boolean;
  category?: { id: number; name: string };
  tags?: Array<{ id: number; name: string; color?: string }>;
  updatedAt: string;
  _score?: number;
}

export interface SearchTotals {
  links: number;
  notes: number;
  snippets: number;
  prompts: number;
  infrastructures: number;
}

export interface SearchResults {
  results: {
    links: SearchResult[];
    notes: SearchResult[];
    snippets: SearchResult[];
    prompts: SearchResult[];
    infrastructures: SearchResult[];
  };
  totals: SearchTotals;
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
  type?: 'link' | 'note' | 'snippet' | 'prompt' | 'infrastructure' | 'all';
  categoryId?: number;
  tagIds: number[];
}
