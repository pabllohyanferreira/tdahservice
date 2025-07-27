// Sistema centralizado de tratamento de erros
import { Alert } from 'react-native';

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Classificar erro baseado no tipo
  public classifyError(error: any): ErrorType {
    if (!error) return ErrorType.UNKNOWN;

    // Erro de rede
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ErrorType.NETWORK;
    }

    // Erro de validação
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
      return ErrorType.VALIDATION;
    }

    // Erro HTTP baseado no status
    if (error.status || error.statusCode) {
      const status = error.status || error.statusCode;
      if (status === 401) return ErrorType.AUTHENTICATION;
      if (status === 403) return ErrorType.AUTHORIZATION;
      if (status === 404) return ErrorType.NOT_FOUND;
      if (status >= 500) return ErrorType.SERVER;
      if (status >= 400) return ErrorType.VALIDATION;
    }

    // Erro de autenticação
    if (error.message?.includes('token') || error.message?.includes('auth')) {
      return ErrorType.AUTHENTICATION;
    }

    return ErrorType.UNKNOWN;
  }

  // Criar objeto de erro padronizado
  public createError(
    type: ErrorType,
    message: string,
    originalError?: Error,
    statusCode?: number,
    details?: any
  ): AppError {
    const appError: AppError = {
      type,
      message,
      originalError,
      statusCode,
      details,
      timestamp: new Date()
    };

    // Log do erro
    this.logError(appError);

    return appError;
  }

  // Log de erros
  private logError(error: AppError): void {
    console.error('🚨 Erro capturado:', {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp.toISOString(),
      details: error.details,
      originalError: error.originalError
    });

    // Manter apenas os últimos 50 erros
    this.errorLog.push(error);
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }
  }

  // Obter mensagem amigável para o usuário
  public getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Problema de conexão. Verifique sua internet e tente novamente.';
      
      case ErrorType.VALIDATION:
        return error.message || 'Dados inválidos. Verifique as informações e tente novamente.';
      
      case ErrorType.AUTHENTICATION:
        return 'Sessão expirada. Faça login novamente.';
      
      case ErrorType.AUTHORIZATION:
        return 'Você não tem permissão para realizar esta ação.';
      
      case ErrorType.NOT_FOUND:
        return 'Recurso não encontrado. Pode ter sido removido ou não existe.';
      
      case ErrorType.SERVER:
        return 'Erro no servidor. Tente novamente em alguns minutos.';
      
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  // Processar erro de resposta HTTP
  public async processHttpError(response: Response, context?: string): Promise<AppError> {
    let errorMessage = 'Erro na requisição';
    let details: any = {};

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      details = errorData;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    const errorType = this.classifyError({ status: response.status });
    
    return this.createError(
      errorType,
      errorMessage,
      undefined,
      response.status,
      { ...details, context }
    );
  }

  // Processar erro de rede/JavaScript
  public processJavaScriptError(error: Error, context?: string): AppError {
    const errorType = this.classifyError(error);
    
    return this.createError(
      errorType,
      error.message,
      error,
      undefined,
      { context }
    );
  }

  // Mostrar erro para o usuário
  public showErrorToUser(error: AppError, title: string = 'Erro'): void {
    const userMessage = this.getUserFriendlyMessage(error);
    
    Alert.alert(
      title,
      userMessage,
      [
        { 
          text: 'OK', 
          style: 'default' 
        }
      ]
    );
  }

  // Mostrar erro com opção de retry
  public showErrorWithRetry(
    error: AppError, 
    onRetry: () => void,
    title: string = 'Erro'
  ): void {
    const userMessage = this.getUserFriendlyMessage(error);
    
    Alert.alert(
      title,
      userMessage,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        { 
          text: 'Tentar Novamente', 
          style: 'default',
          onPress: onRetry
        }
      ]
    );
  }

  // Obter log de erros (para debug)
  public getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Limpar log de erros
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  // Verificar se é erro crítico
  public isCriticalError(error: AppError): boolean {
    return error.type === ErrorType.SERVER ||
           error.type === ErrorType.AUTHENTICATION ||
           (error.statusCode !== undefined && error.statusCode >= 500);
  }

  // Verificar se deve fazer retry automático
  public shouldRetry(error: AppError, attemptCount: number = 0): boolean {
    if (attemptCount >= 3) return false; // Máximo 3 tentativas
    
    return error.type === ErrorType.NETWORK ||
           (error.statusCode !== undefined && error.statusCode >= 500);
  }
}

// Instância singleton
export const errorHandler = ErrorHandler.getInstance();

// Funções utilitárias
export const handleApiError = async (response: Response, context?: string): Promise<AppError> => {
  return errorHandler.processHttpError(response, context);
};

export const handleJSError = (error: Error, context?: string): AppError => {
  return errorHandler.processJavaScriptError(error, context);
};

export const showError = (error: AppError, title?: string): void => {
  errorHandler.showErrorToUser(error, title);
};

export const showErrorWithRetry = (error: AppError, onRetry: () => void, title?: string): void => {
  errorHandler.showErrorWithRetry(error, onRetry, title);
};

// Wrapper para funções async com tratamento de erro
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleJSError(error as Error, context);
      showError(appError);
      return null;
    }
  };
};

// Wrapper para funções async com retry automático
export const withRetry = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  maxAttempts: number = 3,
  context?: string
) => {
  return async (...args: T): Promise<R | null> => {
    let lastError: AppError | null = null;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = handleJSError(error as Error, context);
        
        if (!errorHandler.shouldRetry(lastError, attempt)) {
          break;
        }
        
        // Delay exponencial: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (lastError) {
      showError(lastError);
    }
    
    return null;
  };
};