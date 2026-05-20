import { Response, NextFunction } from 'express';
import { ApiService } from '../services/Api.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseParamId } from '../utils/parsParamId';


const apiService = new ApiService();

export class ApiController {
    // Collections
    async getCollections(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const collections = await apiService.getCollections(req.userId!);
            res.json({ collections });
        } catch (error) { next(error); }
    }

    async createCollection(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const collection = await apiService.createCollection(req.userId!, req.body);
            res.status(201).json({ collection });
        } catch (error) { next(error); }
    }

    async deleteCollection(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await apiService.deleteCollection(parseParamId(req.params.id)!, req.userId!);
            res.json(result);
        } catch (error) { next(error); }
    }

    // Endpoints
    async getEndpoints(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { collectionId, categoryId, search, method, isFavorite } = req.query;
            const filters: any = {};
            if (collectionId) filters.collectionId = parseInt(collectionId as string);
            if (categoryId) filters.categoryId = parseInt(categoryId as string);
            if (search) filters.search = search;
            if (method) filters.method = method;
            if (isFavorite) filters.isFavorite = isFavorite === 'true';

            const endpoints = await apiService.getEndpoints(req.userId!, filters);
            res.json({ endpoints });
        } catch (error) { next(error); }
    }

    async getEndpoint(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const endpoint = await apiService.getEndpoint(parseParamId(req.params.id)!, req.userId!);
            res.json({ endpoint });
        } catch (error) { next(error); }
    }

    async createEndpoint(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const endpoint = await apiService.createEndpoint(req.userId!, req.body);
            res.status(201).json({ endpoint });
        } catch (error) { next(error); }
    }

    async updateEndpoint(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const endpoint = await apiService.updateEndpoint(parseParamId(req.params.id)!, req.userId!, req.body);
            res.json({ endpoint });
        } catch (error) { next(error); }
    }

    async deleteEndpoint(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await apiService.deleteEndpoint(parseParamId(req.params.id)!, req.userId!);
            res.json(result);
        } catch (error) { next(error); }
    }

    async testEndpoint(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await apiService.testEndpoint(req.userId!, req.body);
            res.json(result);
        } catch (error) { next(error); }
    }
}