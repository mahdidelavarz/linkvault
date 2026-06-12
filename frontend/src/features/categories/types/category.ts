export interface Category {
  id: number;
  name: string;
  parentId?: number;
  userId: number;
  createdAt: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    links: number;
    notes: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  parentId?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  parentId?: number;
}