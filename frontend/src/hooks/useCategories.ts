import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/category';

// Fetch all categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.categories as Category[];
    },
  });
};

// Fetch category tree
export const useCategoryTree = () => {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      const { data } = await api.get('/categories/tree');
      return data.tree as Category[];
    },
  });
};

// Fetch single category
export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data } = await api.get(`/categories/${id}`);
      return data.category as Category;
    },
    enabled: !!id,
  });
};

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: CreateCategoryDto) => {
      const { data } = await api.post('/categories', categoryData);
      return data.category as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: UpdateCategoryDto & { id: number }) => {
      const { data } = await api.put(`/categories/${id}`, categoryData);
      return data.category as Category;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};