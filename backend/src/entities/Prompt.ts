import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Category } from './Category';

@Entity('prompts')
@Index(['userId', 'updatedAt'])
export class Prompt {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text' })
    content!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Index()
    @Column({ type: 'varchar', length: 50, name: 'prompt_type' })
    promptType!: string;

    @Index()
    @Column({ type: 'varchar', length: 50, nullable: true, name: 'target_ai' })
    targetAI?: string;

    @Column({ type: 'text', nullable: true, name: 'expected_output' })
    expectedOutput?: string;

    @Column({ type: 'int', default: 0, name: 'usage_count' })
    usageCount!: number;

    @Column({ type: 'timestamp', nullable: true, name: 'last_used_at' })
    lastUsedAt?: Date;

    @Index()
    @Column({ type: 'boolean', default: false, name: 'is_favorite' })
    isFavorite!: boolean;

    @Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb" })
    variables?: Array<{ name: string; defaultValue: string; description?: string }>;

    @Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb" })
    versions?: Array<{
        title: string;
        content: string;
        description?: string;
        promptType: string;
        targetAI?: string;
        expectedOutput?: string;
        variables?: Array<{ name: string; defaultValue: string; description?: string }>;
        savedAt: string;
    }>;

    @ManyToOne(() => Category, { nullable: true })
    @JoinColumn({ name: 'category_id' })
    category?: Category;

    @Index()
    @Column({ type: 'int', nullable: true, name: 'category_id' })
    categoryId?: number;

    @ManyToOne(() => User)
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
