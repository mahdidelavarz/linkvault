export interface Tag {
  id: number;
  name: string;
  userId: number;
}

export interface CreateTagDto {
  name: string;
}