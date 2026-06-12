import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('user_vaults')
export class UserVault {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', unique: true })
    userId!: number;

    @Column({ type: 'text', name: 'encrypted_vault_key', nullable: true })
    encryptedVaultKey!: string | null;

    @Column({ name: 'is_enabled', default: false })
    isEnabled!: boolean;

    @Column({ type: 'timestamp', name: 'enabled_at', nullable: true })
    enabledAt!: Date | null;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
