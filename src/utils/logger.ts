// Utilitário de logging para produção
export const logger = {
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(message, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(message, error);
  },
  warn: (message: string, data?: any) => {
    if (__DEV__) {
      console.warn(message, data);
    }
  },
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`🔍 DEBUG: ${message}`, data);
    }
  }
}; 