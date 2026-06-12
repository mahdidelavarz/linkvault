import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

@Entity('secure_fields')
@Index(['userId', 'module', 'recordId', 'fieldName'], { unique: true })
export class SecureField {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: number;

    @Column()
    module!: string;  // 'infrastructure' | 'api_endpoint' | 'link'

    @Column({ name: 'record_id' })
    recordId!: string;

    @Column({ name: 'field_name' })
    fieldName!: string;

    @Column({ type: 'text', name: 'encrypted_value' })
    encryptedValue!: string;  // base64 AES-GCM ciphertext

    @Column({ type: 'text' })
    iv!: string;  // base64 initialization vector — unique per encryption

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
