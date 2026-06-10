import type { Prompt } from './prompt';

export interface PromptCollection {
    id: number;
    title: string;
    description?: string;
    color?: string;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PromptCollectionItemEntry {
    promptId: number;
    sortOrder: number;
    addedAt: string;
    prompt: Prompt | null;
}

export interface PromptCollectionDetail extends PromptCollection {
    items: PromptCollectionItemEntry[];
}

export interface CreatePromptCollectionDto {
    title: string;
    description?: string;
    color?: string;
}
