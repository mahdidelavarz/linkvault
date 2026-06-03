import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Link } from './Link';
import { Note } from './Note';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @ManyToOne(() => Category, category => category.children, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent!: Category;

    @Index()
    @Column({ type: 'int', nullable: true, name: 'parent_id' })
    parentId!: number;

    @OneToMany(() => Category, category => category.parent)
    children!: Category[];

    @OneToMany(() => Link, link => link.category)
    links!: Link[];

    @OneToMany(() => Note, note => note.category)
    notes!: Note[];

    @ManyToOne(() => User, user => user.categories)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Index()
    @Column({ type: 'int', name: 'user_id' })
    userId!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
