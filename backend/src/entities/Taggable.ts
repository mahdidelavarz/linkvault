import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tag } from './Tag';

@Entity('taggables')
@Index(['taggableId', 'taggableType'])
export class Taggable {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @Column({ type: 'int', name: 'tag_id' })
    tagId!: number;

    @Column({ type: 'int', name: 'taggable_id' })
    taggableId!: number;

    @Column({ type: 'varchar', length: 20, name: 'taggable_type' })
    taggableType!: string;

    @ManyToOne(() => Tag, { eager: true })
    @JoinColumn({ name: 'tag_id' })
    tag!: Tag;
}
