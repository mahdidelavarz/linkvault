import { AppDataSource } from '../config/database';
import { UserVault } from '../entities/UserVault';
import { SecureField } from '../entities/SecureField';

export class VaultService {
    private vaultRepository = AppDataSource.getRepository(UserVault);
    private fieldRepository = AppDataSource.getRepository(SecureField);

    // ─── Vault setup & status ────────────────────────────────────────────────────

    async getStatus(userId: number): Promise<{ isEnabled: boolean }> {
        const vault = await this.vaultRepository.findOne({ where: { userId } });
        return { isEnabled: vault?.isEnabled ?? false };
    }

    async setup(userId: number, encryptedVaultKey: string): Promise<UserVault> {
        let vault = await this.vaultRepository.findOne({ where: { userId } });
        if (!vault) {
            vault = this.vaultRepository.create({ userId });
        }
        vault.encryptedVaultKey = encryptedVaultKey;
        vault.isEnabled = true;
        vault.enabledAt = new Date();
        return await this.vaultRepository.save(vault);
    }

    async getEncryptedKey(userId: number): Promise<{ encryptedVaultKey: string | null }> {
        const vault = await this.vaultRepository.findOne({ where: { userId } });
        if (!vault || !vault.isEnabled) throw new Error('Vault not enabled');
        return { encryptedVaultKey: vault.encryptedVaultKey };
    }

    async disable(userId: number): Promise<void> {
        // Delete all secure fields first, then disable the vault
        await this.fieldRepository.delete({ userId });
        await this.vaultRepository.update({ userId }, { isEnabled: false, encryptedVaultKey: null });
    }

    // ─── Secure fields ───────────────────────────────────────────────────────────

    async upsertField(
        userId: number,
        data: { module: string; recordId: string; fieldName: string; encryptedValue: string; iv: string }
    ): Promise<SecureField> {
        let field = await this.fieldRepository.findOne({
            where: { userId, module: data.module, recordId: data.recordId, fieldName: data.fieldName }
        });
        if (!field) {
            field = this.fieldRepository.create({ userId, ...data });
        } else {
            field.encryptedValue = data.encryptedValue;
            field.iv = data.iv;
        }
        return await this.fieldRepository.save(field);
    }

    async getFields(userId: number, module: string, recordId: string): Promise<SecureField[]> {
        return await this.fieldRepository.find({
            where: { userId, module, recordId },
            select: ['id', 'module', 'recordId', 'fieldName', 'encryptedValue', 'iv', 'updatedAt'],
        });
    }

    async deleteField(userId: number, module: string, recordId: string, fieldName: string): Promise<void> {
        await this.fieldRepository.delete({ userId, module, recordId, fieldName });
    }

    async batchUpsertFields(
        userId: number,
        fields: { module: string; recordId: string; fieldName: string; encryptedValue: string; iv: string }[]
    ): Promise<SecureField[]> {
        return await Promise.all(fields.map(f => this.upsertField(userId, f)));
    }
}
