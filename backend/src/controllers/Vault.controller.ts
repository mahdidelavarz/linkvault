import { Response, NextFunction } from 'express';
import { VaultService, VaultAlreadyEnabledError } from '../services/Vault.service';
import { AuthRequest } from '../middleware/auth.middleware';

const vaultService = new VaultService();

const BASE64_RE = /^[A-Za-z0-9+/=]+$/;
// encryptedVaultKey is stored as "base64iv:base64ciphertext"
const WRAPPED_KEY_RE = /^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/;

function isValidBase64(s: unknown): s is string {
    return typeof s === 'string' && s.length > 0 && BASE64_RE.test(s);
}

function isValidWrappedKey(s: unknown): s is string {
    return typeof s === 'string' && s.length > 0 && WRAPPED_KEY_RE.test(s);
}

export class VaultController {
    async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const status = await vaultService.getStatus(req.userId!);
            res.json(status);
        } catch (error) { next(error); }
    }

    async setup(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { encryptedVaultKey } = req.body;
            if (!isValidWrappedKey(encryptedVaultKey)) {
                return res.status(400).json({ message: 'encryptedVaultKey must be a non-empty base64 string' });
            }
            const vault = await vaultService.setup(req.userId!, encryptedVaultKey);
            res.status(201).json({ isEnabled: vault.isEnabled, enabledAt: vault.enabledAt });
        } catch (error) {
            if (error instanceof VaultAlreadyEnabledError) {
                return res.status(409).json({ message: error.message });
            }
            next(error);
        }
    }

    async getEncryptedKey(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await vaultService.getEncryptedKey(req.userId!);
            res.json(result);
        } catch (error) { next(error); }
    }

    async disable(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await vaultService.disable(req.userId!);
            res.json({ success: true });
        } catch (error) { next(error); }
    }

    async upsertField(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { module, recordId, fieldName, encryptedValue, iv } = req.body;
            if (!module || !recordId || !fieldName) {
                return res.status(400).json({ message: 'module, recordId, and fieldName are required' });
            }
            if (!isValidBase64(encryptedValue) || !isValidBase64(iv)) {
                return res.status(400).json({ message: 'encryptedValue and iv must be non-empty base64 strings' });
            }
            const field = await vaultService.upsertField(req.userId!, { module, recordId, fieldName, encryptedValue, iv });
            res.status(201).json({ field });
        } catch (error) { next(error); }
    }

    async getFields(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const module = req.params.module as string;
            const recordId = req.params.recordId as string;
            const fields = await vaultService.getFields(req.userId!, module, recordId);
            res.json({ fields });
        } catch (error) { next(error); }
    }

    async deleteField(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const module = req.params.module as string;
            const recordId = req.params.recordId as string;
            const fieldName = req.params.fieldName as string;
            await vaultService.deleteField(req.userId!, module, recordId, fieldName);
            res.json({ success: true });
        } catch (error) { next(error); }
    }

    async batchUpsertFields(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { fields } = req.body;
            if (!Array.isArray(fields) || fields.length === 0) {
                return res.status(400).json({ message: 'fields must be a non-empty array' });
            }
            for (const f of fields) {
                if (!f.module || !f.recordId || !f.fieldName) {
                    return res.status(400).json({ message: 'Each field requires module, recordId, and fieldName' });
                }
                if (!isValidBase64(f.encryptedValue) || !isValidBase64(f.iv)) {
                    return res.status(400).json({ message: 'encryptedValue and iv must be non-empty base64 strings' });
                }
            }
            const result = await vaultService.batchUpsertFields(req.userId!, fields);
            res.status(201).json({ fields: result });
        } catch (error) { next(error); }
    }
}
