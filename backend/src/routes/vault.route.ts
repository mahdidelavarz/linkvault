import { Router } from 'express';
import { VaultController } from '../controllers/Vault.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const vaultController = new VaultController();

router.use(authMiddleware);

// Vault lifecycle
router.get('/status', vaultController.getStatus);
router.post('/setup', vaultController.setup);
router.get('/encrypted-key', vaultController.getEncryptedKey);
router.delete('/disable', vaultController.disable);

// Secure fields
router.post('/fields', vaultController.upsertField);
router.post('/fields/batch', vaultController.batchUpsertFields);
router.get('/fields/:module/:recordId', vaultController.getFields);
router.delete('/fields/:module/:recordId/:fieldName', vaultController.deleteField);

export default router;
