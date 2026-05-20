import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Category } from './Category';

@Entity('prompts')
export class Prompt {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text' })
    content!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 50, name: 'prompt_type' })
    promptType!: string;

    @Column({ type: 'varchar', length: 50, nullable: true, name: 'target_ai' })
    targetAI?: string;

    @Column({ type: 'text', nullable: true, name: 'expected_output' })
    expectedOutput?: string;

    @Column({ type: 'int', default: 0, name: 'usage_count' })
    usageCount!: number;

    @Column({ type: 'datetime', nullable: true, name: 'last_used_at' })
    lastUsedAt?: Date;

    @Column({ type: 'bit', default: false, name: 'is_favorite' })
    isFavorite!: boolean;

    @ManyToOne(() => Category, { nullable: true })
    @JoinColumn({ name: 'category_id' })
    category?: Category;

    @Column({ type: 'int', nullable: true, name: 'category_id' })
    categoryId?: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'int', name: 'user_id' })
    userId!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}