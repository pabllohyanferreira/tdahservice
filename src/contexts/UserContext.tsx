import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Storage from '../utils/storage';

interface UserData {
  name: string;
  age: string;
  gender: 'masculino' | 'feminino' | 'outro' | '';
}

interface UserContextData {
  userData: UserData | null;
  isLoading: boolean;
  isOnboardingCompleted: boolean;
  loadUserData: () => Promise<void>;
  saveUserData: (data: UserData) => Promise<void>;
  markOnboardingCompleted: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Verificar se o onboarding foi completado
      const onboardingCompleted = await Storage.getItem('@TDAHService:onboardingCompleted');
      setIsOnboardingCompleted(onboardingCompleted === 'true');
      
      // Carregar dados do usuário se existirem
      const storedUserData = await Storage.getItem('@TDAHService:userData');
      if (storedUserData) {
        setUserData(storedUserData);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (data: UserData) => {
    try {
      await Storage.setItem('@TDAHService:userData', data);
      setUserData(data);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
      throw error;
    }
  };

  const markOnboardingCompleted = async () => {
    try {
      await Storage.setItem('@TDAHService:onboardingCompleted', 'true');
      setIsOnboardingCompleted(true);
    } catch (error) {
      console.error('❌ Erro ao marcar onboarding como completado:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    try {
      await Storage.removeItem('@TDAHService:onboardingCompleted');
      await Storage.removeItem('@TDAHService:userData');
      setIsOnboardingCompleted(false);
      setUserData(null);
    } catch (error) {
      console.error('❌ Erro ao resetar onboarding:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        isLoading,
        isOnboardingCompleted,
        loadUserData,
        saveUserData,
        markOnboardingCompleted,
        resetOnboarding,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }
  return context;
} 