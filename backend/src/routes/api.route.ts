import { Router } from 'express';
import { ApiController } from '../controllers/Api.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const apiController = new ApiController();

router.use(authMiddleware);

// Collections
router.get('/collections', apiController.getCollections);
router.post('/collections', apiController.createCollection);
router.delete('/collections/:id', apiController.deleteCollection);

// Endpoints
router.get('/endpoints', apiController.getEndpoints);
router.post('/endpoints', apiController.createEndpoint);
router.get('/endpoints/:id', apiController.getEndpoint);
router.put('/endpoints/:id', apiController.updateEndpoint);
router.delete('/endpoints/:id', apiController.deleteEndpoint);

// Test
router.post('/test', apiController.testEndpoint);

export default router;