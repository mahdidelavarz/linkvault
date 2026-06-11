export interface Link {
  id: number;
  url: string;
  title: string;
  description?: string;
  username?: string;
  passwordEncrypted?: string;
  email?: string;
  phone?: string;
  isFavorite: boolean;
  categoryId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface CreateLinkDto {
  url: string;
  title: string;
  description?: string;
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  isFavorite?: boolean;
  categoryId?: number;
  tagIds?: number[];
}

export interface UpdateLinkDto extends Partial<CreateLinkDto> {
  id: number;
}