// Utilitário para gerenciar storage local
// Por enquanto, vamos usar um storage em memória para desenvolvimento
let memoryStorage = {};

const Storage = {
  async getItem(key) {
    try {
      // Para desenvolvimento, usar storage em memória
      return memoryStorage[key] || null;
    } catch (error) {
      console.error('Erro ao ler do storage:', error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      // Para desenvolvimento, usar storage em memória
      memoryStorage[key] = value;
      return true;
    } catch (error) {
      console.error('Erro ao salvar no storage:', error);
      return false;
    }
  },

  async removeItem(key) {
    try {
      // Para desenvolvimento, usar storage em memória
      delete memoryStorage[key];
      return true;
    } catch (error) {
      console.error('Erro ao remover do storage:', error);
      return false;
    }
  }
};

export default Storage; 