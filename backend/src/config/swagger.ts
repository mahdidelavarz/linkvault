import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import type { OpenAPIV3 } from 'openapi-types';

const spec: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
        title: 'LinkVault API',
        version: '1.0.0',
        description:
            'Use **POST /auth/login** to get a Bearer token, then click **Authorize** above and paste it.',
    },
    servers: [{ url: '/api', description: 'Dev (via Next.js proxy on :3000)' }, { url: 'http://localhost:5000/api', description: 'Direct backend (:5000)' }],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            // ── Shared ────────────────────────────────────────────────────
            Tag: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    color: { type: 'string' },
                },
            },
            Category: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    icon: { type: 'string' },
                    color: { type: 'string' },
                },
            },
            // ── Prompts ──────────────────────────────────────────────────
            PromptVariable: {
                type: 'object',
                required: ['name', 'defaultValue'],
                properties: {
                    name: { type: 'string' },
                    defaultValue: { type: 'string' },
                    description: { type: 'string' },
                },
            },
            PromptVersion: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    description: { type: 'string' },
                    promptType: { type: 'string' },
                    targetAI: { type: 'string' },
                    expectedOutput: { type: 'string' },
                    variables: { type: 'array', items: { $ref: '#/components/schemas/PromptVariable' } },
                    savedAt: { type: 'string', format: 'date-time' },
                },
            },
            Prompt: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    description: { type: 'string' },
                    promptType: { type: 'string', enum: ['text', 'code', 'chat', 'image', 'other'] },
                    targetAI: { type: 'string' },
                    expectedOutput: { type: 'string' },
                    isFavorite: { type: 'boolean' },
                    usageCount: { type: 'integer' },
                    variables: { type: 'array', items: { $ref: '#/components/schemas/PromptVariable' } },
                    versions: { type: 'array', items: { $ref: '#/components/schemas/PromptVersion' } },
                    category: { $ref: '#/components/schemas/Category', nullable: true },
                    tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            CreatePromptBody: {
                type: 'object',
                required: ['title', 'content', 'promptType'],
                properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    description: { type: 'string' },
                    promptType: { type: 'string', enum: ['text', 'code', 'chat', 'image', 'other'] },
                    targetAI: { type: 'string' },
                    expectedOutput: { type: 'string' },
                    isFavorite: { type: 'boolean' },
                    categoryId: { type: 'integer' },
                    tagIds: { type: 'array', items: { type: 'integer' } },
                    variables: { type: 'array', items: { $ref: '#/components/schemas/PromptVariable' } },
                },
            },
            // ── Links ────────────────────────────────────────────────────
            Link: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    url: { type: 'string' },
                    description: { type: 'string' },
                    isFavorite: { type: 'boolean' },
                    category: { $ref: '#/components/schemas/Category', nullable: true },
                    tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            // ── Notes ────────────────────────────────────────────────────
            Note: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    isFavorite: { type: 'boolean' },
                    category: { $ref: '#/components/schemas/Category', nullable: true },
                    tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            // ── Snippets ─────────────────────────────────────────────────
            Snippet: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    language: { type: 'string' },
                    description: { type: 'string' },
                    isFavorite: { type: 'boolean' },
                    category: { $ref: '#/components/schemas/Category', nullable: true },
                    tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            // ── Auth ─────────────────────────────────────────────────────
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            // ── Pagination ───────────────────────────────────────────────
            Pagination: {
                type: 'object',
                properties: {
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    hasMore: { type: 'boolean' },
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    paths: {
        // ═══════════════════════════════════════════════════════════════
        // AUTH
        // ═══════════════════════════════════════════════════════════════
        '/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password', 'name'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 8 },
                                    name: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'User created' },
                    '409': { description: 'Email already in use' },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login — returns accessToken + refreshToken',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username', 'password'],
                                properties: {
                                    username: { type: 'string', format: 'username', example: 'username' },
                                    password: { type: 'string', example: 'password123' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        accessToken: { type: 'string' },
                                        refreshToken: { type: 'string' },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Invalid credentials' },
                },
            },
        },
        '/auth/refresh': {
            post: {
                tags: ['Auth'],
                summary: 'Refresh access token',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refreshToken'],
                                properties: { refreshToken: { type: 'string' } },
                            },
                        },
                    },
                },
                responses: { '200': { description: 'New accessToken issued' }, '401': { description: 'Invalid / expired refresh token' } },
            },
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Logout (invalidates refresh token)',
                responses: { '200': { description: 'OK' } },
            },
        },
        '/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current user profile',
                responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } },
            },
        },
        // ═══════════════════════════════════════════════════════════════
        // PROMPTS
        // ═══════════════════════════════════════════════════════════════
        '/prompts': {
            get: {
                tags: ['Prompts'],
                summary: 'List prompts (paginated)',
                parameters: [
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
                    { name: 'promptType', in: 'query', schema: { type: 'string' } },
                    { name: 'targetAI', in: 'query', schema: { type: 'string' } },
                    { name: 'isFavorite', in: 'query', schema: { type: 'boolean' } },
                    { name: 'tagIds', in: 'query', schema: { type: 'string' }, description: 'Comma-separated tag IDs' },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                ],
                responses: {
                    '200': {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/Pagination' },
                                        { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Prompt' } } } },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Prompts'],
                summary: 'Create a prompt',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePromptBody' } } } },
                responses: { '201': { description: 'Created', content: { 'application/json': { schema: { type: 'object', properties: { prompt: { $ref: '#/components/schemas/Prompt' } } } } } } },
            },
        },
        '/prompts/{id}': {
            get: {
                tags: ['Prompts'],
                summary: 'Get a single prompt (includes versions & variables)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { prompt: { $ref: '#/components/schemas/Prompt' } } } } } }, '404': { description: 'Not found' } },
            },
            put: {
                tags: ['Prompts'],
                summary: 'Update a prompt (auto-snapshots current state into versions)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePromptBody' } } } },
                responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { prompt: { $ref: '#/components/schemas/Prompt' } } } } } }, '404': { description: 'Not found' } },
            },
            delete: {
                tags: ['Prompts'],
                summary: 'Delete a prompt',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' } },
            },
        },
        '/prompts/{id}/favorite': {
            patch: {
                tags: ['Prompts'],
                summary: 'Toggle favorite',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'OK' } },
            },
        },
        '/prompts/{id}/use': {
            patch: {
                tags: ['Prompts'],
                summary: 'Increment usage counter',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'OK' } },
            },
        },
        '/prompts/{id}/versions': {
            get: {
                tags: ['Prompts'],
                summary: 'Debug — raw DB versions & variables (no TypeORM layer)',
                description: 'Returns the raw JSONB values directly from PostgreSQL. Use this to verify that versions are actually being saved after a PUT.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer' },
                                        title: { type: 'string' },
                                        versions: { type: 'array', items: { $ref: '#/components/schemas/PromptVersion' } },
                                        variables: { type: 'array', items: { $ref: '#/components/schemas/PromptVariable' } },
                                    },
                                },
                            },
                        },
                    },
                    '404': { description: 'Not found' },
                },
            },
        },
        // ═══════════════════════════════════════════════════════════════
        // LINKS
        // ═══════════════════════════════════════════════════════════════
        '/links': {
            get: { tags: ['Links'], summary: 'List links', parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            post: { tags: ['Links'], summary: 'Create a link', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title', 'url'], properties: { title: { type: 'string' }, url: { type: 'string' }, description: { type: 'string' }, categoryId: { type: 'integer' }, tagIds: { type: 'array', items: { type: 'integer' } } } } } } }, responses: { '201': { description: 'Created' } } },
        },
        '/links/{id}': {
            get: { tags: ['Links'], summary: 'Get a link', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
            put: { tags: ['Links'], summary: 'Update a link', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'OK' } } },
            delete: { tags: ['Links'], summary: 'Delete a link', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        },
        '/links/{id}/favorite': { patch: { tags: ['Links'], summary: 'Toggle favorite', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } } },
        // ═══════════════════════════════════════════════════════════════
        // CATEGORIES
        // ═══════════════════════════════════════════════════════════════
        '/categories': {
            get: { tags: ['Categories'], summary: 'List categories', responses: { '200': { description: 'OK' } } },
            post: { tags: ['Categories'], summary: 'Create category', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, icon: { type: 'string' }, color: { type: 'string' } } } } } }, responses: { '201': { description: 'Created' } } },
        },
        '/categories/{id}': {
            get: { tags: ['Categories'], summary: 'Get category', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            put: { tags: ['Categories'], summary: 'Update category', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'OK' } } },
            delete: { tags: ['Categories'], summary: 'Delete category', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        },
        // ═══════════════════════════════════════════════════════════════
        // TAGS
        // ═══════════════════════════════════════════════════════════════
        '/tags': {
            get: { tags: ['Tags'], summary: 'List tags', responses: { '200': { description: 'OK' } } },
            post: { tags: ['Tags'], summary: 'Create tag', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, color: { type: 'string' } } } } } }, responses: { '201': { description: 'Created' } } },
        },
        '/tags/{id}': {
            get: { tags: ['Tags'], summary: 'Get tag', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            put: { tags: ['Tags'], summary: 'Update tag', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'OK' } } },
            delete: { tags: ['Tags'], summary: 'Delete tag', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        },
        // ═══════════════════════════════════════════════════════════════
        // NOTES
        // ═══════════════════════════════════════════════════════════════
        '/notes': {
            get: { tags: ['Notes'], summary: 'List notes', parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            post: { tags: ['Notes'], summary: 'Create note', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title', 'content'], properties: { title: { type: 'string' }, content: { type: 'string' }, categoryId: { type: 'integer' }, tagIds: { type: 'array', items: { type: 'integer' } } } } } } }, responses: { '201': { description: 'Created' } } },
        },
        '/notes/{id}': {
            get: { tags: ['Notes'], summary: 'Get note', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            put: { tags: ['Notes'], summary: 'Update note', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'OK' } } },
            delete: { tags: ['Notes'], summary: 'Delete note', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        },
        '/notes/{id}/favorite': { patch: { tags: ['Notes'], summary: 'Toggle favorite', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } } },
        // ═══════════════════════════════════════════════════════════════
        // SNIPPETS
        // ═══════════════════════════════════════════════════════════════
        '/snippets': {
            get: { tags: ['Snippets'], summary: 'List snippets', parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'language', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            post: { tags: ['Snippets'], summary: 'Create snippet', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title', 'content', 'language'], properties: { title: { type: 'string' }, content: { type: 'string' }, language: { type: 'string' }, description: { type: 'string' }, categoryId: { type: 'integer' }, tagIds: { type: 'array', items: { type: 'integer' } } } } } } }, responses: { '201': { description: 'Created' } } },
        },
        '/snippets/{id}': {
            get: { tags: ['Snippets'], summary: 'Get snippet', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            put: { tags: ['Snippets'], summary: 'Update snippet', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'OK' } } },
            delete: { tags: ['Snippets'], summary: 'Delete snippet', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        },
        '/snippets/{id}/favorite': { patch: { tags: ['Snippets'], summary: 'Toggle favorite', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } } },
        // ═══════════════════════════════════════════════════════════════
        // SEARCH
        // ═══════════════════════════════════════════════════════════════
        '/search': {
            get: {
                tags: ['Search'],
                summary: 'Full-text search across all modules',
                parameters: [
                    { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
                    { name: 'types', in: 'query', schema: { type: 'string' }, description: 'Comma-separated: link,note,snippet,prompt,api-client,infrastructure' },
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                ],
                responses: { '200': { description: 'OK' } },
            },
        },
        // ═══════════════════════════════════════════════════════════════
        // DASHBOARD
        // ═══════════════════════════════════════════════════════════════
        '/dashboard': {
            get: { tags: ['Dashboard'], summary: 'Stats summary (counts, recent items)', responses: { '200': { description: 'OK' } } },
        },
        // ═══════════════════════════════════════════════════════════════
        // API CLIENT
        // ═══════════════════════════════════════════════════════════════
        '/api-client': {
            get: { tags: ['API Client'], summary: 'List saved API requests', responses: { '200': { description: 'OK' } } },
            post: { tags: ['API Client'], summary: 'Save an API request', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '201': { description: 'Created' } } },
        },
        '/api-client/{id}': {
            get: { tags: ['API Client'], summary: 'Get saved request', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            put: { tags: ['API Client'], summary: 'Update saved request', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'OK' } } },
            delete: { tags: ['API Client'], summary: 'Delete saved request', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        },
        // ═══════════════════════════════════════════════════════════════
        // INFRASTRUCTURE
        // ═══════════════════════════════════════════════════════════════
        '/infrastructure': {
            get: { tags: ['Infrastructure'], summary: 'List infrastructure items', responses: { '200': { description: 'OK' } } },
            post: { tags: ['Infrastructure'], summary: 'Create infrastructure item', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '201': { description: 'Created' } } },
        },
        '/infrastructure/{id}': {
            get: { tags: ['Infrastructure'], summary: 'Get infrastructure item', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
            put: { tags: ['Infrastructure'], summary: 'Update infrastructure item', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'OK' } } },
            delete: { tags: ['Infrastructure'], summary: 'Delete infrastructure item', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        },
        // ═══════════════════════════════════════════════════════════════
        // HEALTH
        // ═══════════════════════════════════════════════════════════════
        '/health': {
            get: { tags: ['Health'], summary: 'Health check', security: [], responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, timestamp: { type: 'string', format: 'date-time' } } } } } } } },
        },
    },
};

// Use a Router with explicit GET '/' so Express 5 handles the path correctly.
// When mounted at /api/docs, req.url inside the router is always '/' for the root request.
const docsRouter = Router();
docsRouter.use((_req, res, next) => { res.removeHeader('Content-Security-Policy'); next(); });
docsRouter.use('/', swaggerUi.serve);
docsRouter.get('/', swaggerUi.setup(spec, {
    customSiteTitle: 'LinkVault API Docs',
    swaggerOptions: { persistAuthorization: true },
}));

export default docsRouter;
