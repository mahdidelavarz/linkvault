export interface Note {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
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

export interface CreateNoteDto {
  title: string;
  content?: string;
  isPinned?: boolean;
  categoryId?: number;
  tagIds?: number[];
}

export interface UpdateNoteDto extends Partial<CreateNoteDto> {
  id: number;
}