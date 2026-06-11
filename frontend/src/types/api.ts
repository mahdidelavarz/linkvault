import { Tag } from "./tag";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth2';

export interface ApiEndpoint {
  id: number;
  title: string;
  url: string;
  method: HttpMethod;
  description?: string;
  headers?: KeyValue[];
  queryParams?: KeyValue[];
  body?: string;
  bodyType?: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'none';
  authType: AuthType;
  authData?: AuthData;
  collectionId?: number;
  isFavorite: boolean;
  categoryId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  lastResponse?: ApiResponse;
  exampleResponse?: ApiResponse;
  collection?: ApiCollection;
  category?: { id: number; name: string };
  tags?: Tag[];
}

export interface KeyValue {
  id?: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthData {
  // Bearer
  token?: string;
  // Basic
  username?: string;
  password?: string;
  // API Key
  apiKey?: string;
  apiKeyHeader?: string;
  // OAuth2
  oauth2Token?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number; // ms
  size: number; // bytes
  timestamp: string;
}

export interface ApiCollection {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  endpoints?: ApiEndpoint[];
  _count?: { endpoints: number };
}

export interface Environment {
  id: number;
  name: string;
  variables: KeyValue[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEndpointDto {
  title: string;
  url: string;
  method: HttpMethod;
  description?: string;
  headers?: KeyValue[];
  queryParams?: KeyValue[];
  body?: string;
  bodyType?: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'none';
  authType?: AuthType;
  authData?: AuthData;
  collectionId?: number;
  isFavorite?: boolean;
  categoryId?: number;
  tagIds?: number[];
  exampleResponse?: ApiResponse;
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
}

export interface CreateEnvironmentDto {
  name: string;
  variables: KeyValue[];
}

export interface TestRequestDto {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  bodyType?: string;
}

export interface TestResponseDto {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: number;
  size: number;
}

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-green-500',
  POST: 'bg-blue-500',
  PUT: 'bg-orange-500',
  PATCH: 'bg-yellow-500',
  DELETE: 'bg-red-500',
  HEAD: 'bg-purple-500',
  OPTIONS: 'bg-gray-500',
};

export const AUTH_TYPES: { value: AuthType; label: string; icon: string }[] = [
  { value: 'none', label: 'No Auth', icon: '🔓' },
  { value: 'bearer', label: 'Bearer Token', icon: '🔑' },
  { value: 'basic', label: 'Basic Auth', icon: '👤' },
  { value: 'api-key', label: 'API Key', icon: '🗝️' },
  { value: 'oauth2', label: 'OAuth 2.0', icon: '🔐' },
];