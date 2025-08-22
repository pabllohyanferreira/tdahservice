// Configuração da API do backend
const POSSIBLE_ENDPOINTS = [
  // URL de produção (backend deployado)
  'https://tdah-service-backend.onrender.com/api',
  // URLs de desenvolvimento (apenas para testes)
  'http://localhost:3000/api',
  'http://192.168.1.84:3000/api',
  'http://10.0.2.2:3000/api', // Android Emulator
];

// Adicionar função para permitir configuração manual do endpoint
export const setCustomApiEndpoint = (endpoint: string) => {
  if (endpoint && endpoint.trim() !== '') {
    detectedEndpoint = endpoint.trim();
    return true;
  }
  return false;
};

let detectedEndpoint: string | null = null;

// Função para detectar o endpoint disponível
const detectAvailableEndpoint = async (): Promise<string> => {
  if (detectedEndpoint) {
    return detectedEndpoint;
  }

  for (const endpoint of POSSIBLE_ENDPOINTS) {
    try {
      // Implementar timeout com AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${endpoint.replace('/api', '')}`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        detectedEndpoint = endpoint;
        return endpoint;
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback para localhost se nenhum funcionar
  detectedEndpoint = POSSIBLE_ENDPOINTS[0];
  return detectedEndpoint;
};

// Função para obter a URL base da API
export const getApiBaseUrl = async (): Promise<string> => {
  return await detectAvailableEndpoint();
};

export const API_CONFIG = {
  // URL base da API (será detectada automaticamente)
  get BASE_URL() {
    return detectedEndpoint || POSSIBLE_ENDPOINTS[0];
  },

  // Função para inicializar a detecção de endpoint
  async initialize() {
    await detectAvailableEndpoint();
  },

  // Endpoints de autenticação
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
  },
  
  // Endpoints de lembretes
  REMINDERS: {
    LIST: '/reminders',
    CREATE: '/reminders',
    UPDATE: (id: string) => `/reminders/${id}`,
    DELETE: (id: string) => `/reminders/${id}`,
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout das requisições (em ms)
  TIMEOUT: 10000,
};

// Função para obter headers com autenticação
export const getAuthHeaders = async (token?: string) => {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Função para fazer requisições à API com detecção automática
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    const response = await fetch(url, {
    ...options,
      signal: controller.signal,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    },
    });
  
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout na requisição');
    }
    throw error;
  }
};

// Função para testar conectividade
export const testConnection = async (): Promise<boolean> => {
  try {
    const baseUrl = await getApiBaseUrl();
    
    // Implementar timeout com AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(baseUrl.replace('/api', ''), {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};