import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
// @ts-ignore
import Storage from '../utils/storage';
import { googleAuthSimple, GoogleUser } from '../utils/googleAuthSimple';

// Configuração da API
const API_BASE_URL = 'http://192.168.1.84:3000/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredUser = useCallback(async () => {
    try {
      const storedUser = await Storage.getItem('@TDAHService:user');
      const storedToken = await Storage.getItem('@TDAHService:token');
      
      if (storedUser && storedToken) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Salvar token e dados do usuário
        await Storage.setItem('@TDAHService:token', data.token);
        await Storage.setItem('@TDAHService:user', data.user);
        setUser(data.user);
        return true;
      } else {
        console.error('Erro no login:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Salvar token e dados do usuário
        await Storage.setItem('@TDAHService:token', data.token);
        await Storage.setItem('@TDAHService:user', data.user);
        setUser(data.user);
        return true;
      } else {
        console.error('Erro no cadastro:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const googleUser = await googleAuthSimple.signInWithGoogle();
      
      if (googleUser) {
        // Enviar dados do Google para o backend
        const response = await fetch(`${API_BASE_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: googleUser.id,
            name: googleUser.name,
            email: googleUser.email,
            picture: googleUser.picture
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Salvar token e dados do usuário
          await Storage.setItem('@TDAHService:token', data.token);
          await Storage.setItem('@TDAHService:user', data.user);
          setUser(data.user);
          return true;
        } else {
          console.error('Erro no login com Google:', data.message);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login com Google:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await Storage.removeItem('@TDAHService:user');
      await Storage.removeItem('@TDAHService:token');
      await googleAuthSimple.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  }), [user, isLoading, signIn, signInWithGoogle, signUp, signOut]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 