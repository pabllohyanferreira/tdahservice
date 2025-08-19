import { validateEmail, validatePassword, validateName, validateReminder } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should validate email with subdomain', () => {
      const result = validateEmail('user@subdomain.example.com');
      expect(result.isValid).toBe(true);
    });
    
    it('should reject invalid email without @', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email deve ter um formato válido');
    });
    
    it('should reject email with consecutive dots', () => {
      const result = validateEmail('test..user@example.com');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email não pode conter pontos consecutivos');
    });
    
    it('should reject email starting with dot', () => {
      const result = validateEmail('.test@example.com');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email não pode começar ou terminar com ponto');
    });
    
    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email é obrigatório');
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
    });
    
    it('should reject password too short', () => {
      const result = validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve ter pelo menos 6 caracteres');
    });
    
    it('should reject password without letters', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra');
    });
    
    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha é obrigatória');
    });
  });

  describe('validateName', () => {
    it('should validate correct name', () => {
      const result = validateName('João Silva');
      expect(result.isValid).toBe(true);
    });
    
    it('should validate name with accents', () => {
      const result = validateName('José Antônio');
      expect(result.isValid).toBe(true);
    });
    
    it('should reject name too short', () => {
      const result = validateName('A');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome deve ter pelo menos 2 caracteres');
    });
    
    it('should reject name with numbers', () => {
      const result = validateName('João123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome deve conter apenas letras e espaços');
    });
    
    it('should reject empty name', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome é obrigatório');
    });
  });

  describe('validateReminder', () => {
    it('should validate correct reminder data', () => {
      const reminderData = {
        title: 'Test Reminder',
        description: 'Test description',
        dateTime: new Date(Date.now() + 60000) // 1 minute from now
      };
      
      const result = validateReminder(reminderData);
      expect(result.isValid).toBe(true);
    });
    
    it('should reject reminder without title', () => {
      const reminderData = {
        title: '',
        description: 'Test description',
        dateTime: new Date(Date.now() + 60000)
      };
      
      const result = validateReminder(reminderData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título é obrigatório');
    });
    
    it('should reject reminder with invalid date', () => {
      const reminderData = {
        title: 'Test Reminder',
        description: 'Test description',
        dateTime: 'invalid-date'
      };
      
      const result = validateReminder(reminderData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data e hora devem ser válidas');
    });
  });
}); 