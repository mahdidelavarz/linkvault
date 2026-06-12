import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Category } from './Category';

@Entity('infrastructures')
@Index(['userId', 'updatedAt'])
export class Infrastructure {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Index()
    @Column({ type: 'varchar', length: 50, name: 'infra_type' })
    infraType!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'text' })
    content!: string;

    @Column({ type: 'simple-json', nullable: true })
    metadata?: any;

    @Index()
    @Column({ type: 'boolean', default: false, name: 'is_favorite' })
    isFavorite!: boolean;

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
