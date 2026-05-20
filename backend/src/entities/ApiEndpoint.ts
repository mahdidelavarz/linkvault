import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { ApiCollection } from './ApiCollection';

@Entity('api_endpoints')
export class ApiEndpoint {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'varchar', length: 2048 })
    url!: string;

    @Column({ type: 'varchar', length: 10 })
    method!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'simple-json', nullable: true })
    headers?: { key: string; value: string; enabled: boolean }[];

    @Column({ type: 'simple-json', nullable: true, name: 'query_params' })
    queryParams?: { key: string; value: string; enabled: boolean }[];

    @Column({ type: 'text', nullable: true })
    body?: string;

    @Column({ type: 'varchar', length: 50, nullable: true, name: 'body_type' })
    bodyType?: string;

    @Column({ type: 'varchar', length: 20, default: 'none', name: 'auth_type' })
    authType!: string;

    @Column({ type: 'simple-json', nullable: true, name: 'auth_data' })
    authData?: any;

    @Column({ type: 'bit', default: false, name: 'is_favorite' })
    isFavorite!: boolean;

    @ManyToOne(() => ApiCollection, collection => collection.endpoints, { nullable: true })
    @JoinColumn({ name: 'collection_id' })
    collection?: ApiCollection;

    @Column({ type: 'int', nullable: true, name: 'collection_id' })
    collectionId?: number;

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