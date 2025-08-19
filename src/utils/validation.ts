// Utilitários de validação para o frontend
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationError extends Error {
  public errors: string[];
  
  constructor(errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Validação de email
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email é obrigatório');
  } else {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      errors.push('Email deve ter um formato válido');
    }
    
    if (trimmedEmail.length > 254) {
      errors.push('Email deve ter no máximo 254 caracteres');
    }
    
    // Validações adicionais
    if (trimmedEmail.includes('..')) {
      errors.push('Email não pode conter pontos consecutivos');
    }
    
    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      errors.push('Email não pode começar ou terminar com ponto');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de senha
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Senha é obrigatória');
  } else {
    if (password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
    if (password.length > 128) {
      errors.push('Senha deve ter no máximo 128 caracteres');
    }
    if (!/(?=.*[a-zA-Z])/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de nome
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Nome é obrigatório');
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    if (trimmedName.length > 100) {
      errors.push('Nome deve ter no máximo 100 caracteres');
    }
    // Regex melhorada para nomes brasileiros
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      errors.push('Nome deve conter apenas letras e espaços');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de título de lembrete
export const validateReminderTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!title) {
    errors.push('Título é obrigatório');
  } else {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1) {
      errors.push('Título não pode estar vazio');
    }
    if (trimmedTitle.length > 100) {
      errors.push('Título deve ter no máximo 100 caracteres');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de descrição de lembrete
export const validateReminderDescription = (description?: string): ValidationResult => {
  const errors: string[] = [];
  
  if (description && description.length > 500) {
    errors.push('Descrição deve ter no máximo 500 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação de data/hora
export const validateDateTime = (dateTime: Date | string): ValidationResult => {
  const errors: string[] = [];
  
  if (!dateTime) {
    errors.push('Data e hora são obrigatórias');
    return { isValid: false, errors };
  }
  
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
  
  if (isNaN(date.getTime())) {
    errors.push('Data e hora devem ser válidas');
  } else {
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 1, 0, 1); // 1 ano atrás
    const maxDate = new Date(now.getFullYear() + 10, 11, 31); // 10 anos no futuro
    
    if (date < minDate) {
      errors.push('Data não pode ser muito antiga');
    }
    if (date > maxDate) {
      errors.push('Data não pode ser muito distante no futuro');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação completa de lembrete
export const validateReminder = (data: {
  title: string;
  description?: string;
  dateTime: Date | string;
}): ValidationResult => {
  const allErrors: string[] = [];
  
  const titleValidation = validateReminderTitle(data.title);
  const descriptionValidation = validateReminderDescription(data.description);
  const dateTimeValidation = validateDateTime(data.dateTime);
  
  allErrors.push(...titleValidation.errors);
  allErrors.push(...descriptionValidation.errors);
  allErrors.push(...dateTimeValidation.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Validação de dados de login
export const validateLoginData = (email: string, password: string): ValidationResult => {
  const allErrors: string[] = [];
  
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  
  allErrors.push(...emailValidation.errors);
  allErrors.push(...passwordValidation.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Validação de dados de cadastro
export const validateSignupData = (name: string, email: string, password: string): ValidationResult => {
  const allErrors: string[] = [];
  
  const nameValidation = validateName(name);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  
  allErrors.push(...nameValidation.errors);
  allErrors.push(...emailValidation.errors);
  allErrors.push(...passwordValidation.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Sanitização de strings
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços para um só
    .replace(/[<>]/g, ''); // Remove caracteres perigosos
};

// Validação de ID
export const validateId = (id: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!id) {
    errors.push('ID é obrigatório');
  } else if (typeof id !== 'string') {
    errors.push('ID deve ser uma string');
  } else if (id.trim().length === 0) {
    errors.push('ID não pode estar vazio');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};