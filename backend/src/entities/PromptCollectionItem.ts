import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { PromptCollection } from './PromptCollection';

@Entity('prompt_collection_items')
@Index(['collectionId', 'sortOrder'])
@Unique(['collectionId', 'promptId'])
export class PromptCollectionItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => PromptCollection, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'collection_id' })
    collection!: PromptCollection;

    @Index()
    @Column({ type: 'int', name: 'collection_id' })
    collectionId!: number;

    @Column({ type: 'int', name: 'prompt_id' })
    promptId!: number;

    @Column({ type: 'int', name: 'sort_order', default: 0 })
    sortOrder!: number;

    @CreateDateColumn({ name: 'added_at' })
    addedAt!: Date;
}
