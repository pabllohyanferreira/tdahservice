// Configuração da API do backend
export const API_CONFIG = {
  // URL base da API
  BASE_URL: 'http://192.168.1.84:3000/api',
  
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

// Função para fazer requisições à API
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('Erro na requisição API:', error);
    throw error;
  }
}; 