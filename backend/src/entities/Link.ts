import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Category } from './Category';

@Entity('links')
@Index(['userId', 'updatedAt'])
export class Link {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 2048 })
    url!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    username?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_encrypted' })
    passwordEncrypted?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

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
