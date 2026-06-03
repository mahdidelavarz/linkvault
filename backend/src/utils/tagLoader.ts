import { In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Taggable } from '../entities/Taggable';

export async function loadTagsForItems<T extends { id: number }>(
    items: T[],
    taggableType: string,
): Promise<(T & { tags: any[] })[]> {
    if (items.length === 0) return items.map(i => ({ ...i, tags: [] }));

    const ids = items.map(i => i.id);
    const taggables = await AppDataSource.getRepository(Taggable).find({
        where: { taggableId: In(ids), taggableType },
        relations: ['tag'],
    });

    const tagMap = new Map<number, any[]>();
    for (const t of taggables) {
        const arr = tagMap.get(t.taggableId) ?? [];
        arr.push(t.tag);
        tagMap.set(t.taggableId, arr);
    }

    return items.map(item => ({ ...item, tags: tagMap.get(item.id) ?? [] }));
}
