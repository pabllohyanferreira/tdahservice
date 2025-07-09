import { useState, useCallback } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  email?: boolean;
  match?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validateField = useCallback((value: string, rules: ValidationRules, fieldName: string): ValidationResult => {
    const fieldErrors: string[] = [];

    // Validação obrigatória
    if (rules.required && !value.trim()) {
      fieldErrors.push(`${fieldName} é obrigatório`);
    }

    // Validação de comprimento mínimo
    if (rules.minLength && value.length < rules.minLength) {
      fieldErrors.push(`${fieldName} deve ter pelo menos ${rules.minLength} caracteres`);
    }

    // Validação de email
    if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      fieldErrors.push('Email inválido');
    }

    return {
      isValid: fieldErrors.length === 0,
      errors: fieldErrors,
    };
  }, []);

  const validateForm = useCallback((values: Record<string, string>, rules: Record<string, ValidationRules>): boolean => {
    const newErrors: Record<string, string[]> = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const value = values[fieldName] || '';
      const fieldRules = rules[fieldName];
      const validation = validateField(value, fieldRules, fieldName);

      if (!validation.isValid) {
        newErrors[fieldName] = validation.errors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
  };
}; 