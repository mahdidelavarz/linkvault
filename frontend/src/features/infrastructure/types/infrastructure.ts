export type InfraType = 'env' | 'server' | 'docker' | 'deployment' | 'config';

export interface Infrastructure {
  id: number;
  title: string;
  infraType: InfraType;
  description?: string;
  content: string; // Primary content (env vars, docker compose, etc.)
  metadata?: InfraMetadata;
  isFavorite: boolean;
  categoryId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface InfraMetadata {
  // Server
  host?: string;
  port?: number;
  username?: string;
  authType?: 'password' | 'key' | 'key-passphrase';
  sshKey?: string;
  
  // Docker
  composeVersion?: string;
  services?: string[];
  
  // Deployment
  platform?: string;
  steps?: string[];
  rollbackPlan?: string;
  
  // ENV
  environment?: string; // development, staging, production
  variables?: { key: string; value: string; masked: boolean }[];

  // Config (database)
  engine?: string;
  database?: string;
}

export interface CreateInfraDto {
  title: string;
  infraType: InfraType;
  description?: string;
  content: string;
  metadata?: InfraMetadata;
  isFavorite?: boolean;
  categoryId?: number;
  tagIds?: number[];
}

export const INFRA_TYPES: Record<InfraType, {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  env: {
    label: 'Environment',
    icon: '🔐',
    color: 'bg-green-600',
    description: 'Environment variables and configuration'
  },
  server: {
    label: 'Server',
    icon: '🖥️',
    color: 'bg-blue-600',
    description: 'SSH connections and server details'
  },
  docker: {
    label: 'Docker',
    icon: '🐳',
    color: 'bg-cyan-600',
    description: 'Docker Compose and Dockerfiles'
  },
  deployment: {
    label: 'Deployment',
    icon: '🚀',
    color: 'bg-purple-600',
    description: 'Deployment runbooks and notes'
  },
  config: {
    label: 'Config',
    icon: '⚙️',
    color: 'bg-gray-600',
    description: 'Project configurations and settings'
  },
};