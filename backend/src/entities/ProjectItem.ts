import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Project } from './Project';

@Entity('project_items')
@Index(['projectId', 'sortOrder'])
@Index(['itemType', 'itemId'])
@Unique(['projectId', 'itemType', 'itemId'])
export class ProjectItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Project, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project!: Project;

    @Index()
    @Column({ type: 'int', name: 'project_id' })
    projectId!: number;

    @Column({ type: 'varchar', length: 30, name: 'item_type' })
    itemType!: string;

    @Column({ type: 'int', name: 'item_id' })
    itemId!: number;

    @Column({ type: 'int', name: 'sort_order', default: 0 })
    sortOrder!: number;

    @CreateDateColumn({ name: 'added_at' })
    addedAt!: Date;
}
