import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { Note, CreateNoteDto, UpdateNoteDto } from '@/types/note';
import { useCallback, useRef } from 'react';

type Page<T> = { items: T[]; total: number; page: number; limit: number; hasMore: boolean };

// Fetch all notes (paginated)
export const useNotes = (filters?: {
  search?: string;
  categoryId?: number;
  isPinned?: boolean;
  tagIds?: number[];
}) => {
  return useInfiniteQuery<Page<Note>>({
    queryKey: ['notes', filters],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters?.isPinned) params.append('isPinned', 'true');
      if (filters?.tagIds) params.append('tagIds', filters.tagIds.join(','));
      params.append('page', String(pageParam));
      params.append('limit', '20');
      const { data } = await api.get(`/notes?${params.toString()}`);
      return data as Page<Note>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
};

// Fetch single note
export const useNote = (id: number) => {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const { data } = await api.get(`/notes/${id}`);
      return data.note as Note;
    },
    enabled: !!id,
  });
};

// Create note
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData: CreateNoteDto) => {
      const { data } = await api.post('/notes', noteData);
      return data.note as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

// Update note
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...noteData }: UpdateNoteDto & { id: number }) => {
      const { data } = await api.put(`/notes/${id}`, noteData);
      return data.note as Note;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] });
    },
  });
};

// Delete note
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

// Toggle pin
export const useTogglePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/notes/${id}/pin`);
      return data.note as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

// Auto-save hook
export const useAutoSave = (noteId: number, delay: number = 2000) => {
  const updateNote = useUpdateNote();
  const timerRef = useRef<NodeJS.Timeout>(undefined);

  const autoSave = useCallback((content: string, title?: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      updateNote.mutate({ id: noteId, content, ...(title && { title }) });
    }, delay);
  }, [noteId, delay, updateNote]);

  return { autoSave, isSaving: updateNote.isPending };
};