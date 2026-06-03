import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Category } from './Category';

@Entity('notes')
@Index(['userId', 'updatedAt'])
export class Note {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    content!: string;

    @Index()
    @Column({ type: 'boolean', default: false, name: 'is_pinned' })
    isPinned!: boolean;

    @ManyToOne(() => Category, category => category.notes, { nullable: true })
    @JoinColumn({ name: 'category_id' })
    category!: Category;

    @Index()
    @Column({ type: 'int', nullable: true, name: 'category_id' })
    categoryId!: number;

    @ManyToOne(() => User, user => user.notes)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Index()
    @Column({ type: 'int', name: 'user_id' })
    userId!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
