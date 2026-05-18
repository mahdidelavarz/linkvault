import { AppDataSource } from '../config/database';
import { Note } from '../entities/Note';
import { Taggable } from '../entities/Taggable';

export class NoteService {
    private noteRepository = AppDataSource.getRepository(Note);
    private taggableRepository = AppDataSource.getRepository(Taggable);

    async findAll(userId: number, filters?: {
        search?: string;
        categoryId?: number;
        isPinned?: boolean;
        tagIds?: number[];
    }) {
        const queryBuilder = this.noteRepository.createQueryBuilder('note')
            .leftJoinAndSelect('note.category', 'category')
            .where('note.userId = :userId', { userId });

        if (filters?.search) {
            queryBuilder.andWhere(
                '(note.title LIKE :search OR note.content LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        if (filters?.categoryId) {
            queryBuilder.andWhere('note.categoryId = :categoryId', { categoryId: filters.categoryId });
        }

        if (filters?.isPinned !== undefined) {
            queryBuilder.andWhere('note.isPinned = :isPinned', { isPinned: filters.isPinned });
        }

        const notes = await queryBuilder.orderBy('note.isPinned', 'DESC')
            .addOrderBy('note.updatedAt', 'DESC')
            .getMany();

        return await this.loadTagsForNotes(notes);
    }

    async findOne(id: number, userId: number) {
        const note = await this.noteRepository.findOne({
            where: { id, userId },
            relations: ['category']
        });

        if (!note) return null;

        const notesWithTags = await this.loadTagsForNotes([note]);
        return notesWithTags[0] || null;
    }

    async create(userId: number, data: {
        title: string;
        content?: string;
        isPinned?: boolean;
        categoryId?: number;
        tagIds?: number[];
    }) {
        const note = new Note();
        note.title = data.title;
        note.content = data.content || '';
        note.isPinned = data.isPinned || false;
        note.userId = userId;

        if (data.categoryId) {
            note.categoryId = data.categoryId;
        }

        const savedNote = await this.noteRepository.save(note);

        // Handle tags
        if (data.tagIds && data.tagIds.length > 0) {
            await this.syncTags(savedNote.id, data.tagIds);
        }

        return await this.findOne(savedNote.id, userId);
    }

    async update(id: number, userId: number, data: {
        title?: string;
        content?: string;
        isPinned?: boolean;
        categoryId?: number;
        tagIds?: number[];
    }) {
        const note = await this.noteRepository.findOne({ where: { id, userId } });

        if (!note) {
            throw new Error('Note not found');
        }

        if (data.title !== undefined) note.title = data.title;
        if (data.content !== undefined) note.content = data.content;
        if (data.isPinned !== undefined) note.isPinned = data.isPinned;
        if (data.categoryId !== undefined) {
            note.categoryId = data.categoryId;
        }

        await this.noteRepository.save(note);

        // Handle tags
        if (data.tagIds) {
            await this.syncTags(id, data.tagIds);
        }

        return await this.findOne(id, userId);
    }

    async delete(id: number, userId: number) {
        const note = await this.noteRepository.findOne({ where: { id, userId } });

        if (!note) {
            throw new Error('Note not found');
        }

        // Delete related taggables
        await this.taggableRepository.delete({
            taggableId: id,
            taggableType: 'note'
        });

        await this.noteRepository.remove(note);
        return { message: 'Note deleted successfully' };
    }

    async togglePin(id: number, userId: number) {
        const note = await this.noteRepository.findOne({ where: { id, userId } });

        if (!note) {
            throw new Error('Note not found');
        }

        note.isPinned = !note.isPinned;
        await this.noteRepository.save(note);

        return await this.findOne(id, userId);
    }

    private async syncTags(noteId: number, tagIds: number[]) {
        // Remove existing tags
        await this.taggableRepository.delete({
            taggableId: noteId,
            taggableType: 'note'
        });

        // Add new tags
        if (tagIds.length > 0) {
            const taggablesToSave: Taggable[] = [];

            for (const tagId of tagIds) {
                const taggable = new Taggable();
                taggable.tagId = tagId;
                taggable.taggableId = noteId;
                taggable.taggableType = 'note';
                taggablesToSave.push(taggable);
            }

            await this.taggableRepository.save(taggablesToSave);
        }
    }

    private async loadTagsForNotes(notes: Note[]): Promise<any[]> {
        const notesWithTags = [];

        for (const note of notes) {
            const taggables = await this.taggableRepository.find({
                where: {
                    taggableId: note.id,
                    taggableType: 'note'
                },
                relations: ['tag']
            });

            notesWithTags.push({
                ...note,
                tags: taggables.map(t => t.tag)
            });
        }

        return notesWithTags;
    }
}