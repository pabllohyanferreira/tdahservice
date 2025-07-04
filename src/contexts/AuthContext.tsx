import React, { createContext, useContext, useState, useEffect } from 'react';
import Storage from '../utils/storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
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

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await Storage.getItem('@TDAHService:user');
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Buscar usuário cadastrado
      const users = await Storage.getItem('@TDAHService:users');
      const usersList = users || [];
      
      const foundUser = usersList.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
        };
        
        await Storage.setItem('@TDAHService:user', userData);
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Verificar se usuário já existe
      const users = await Storage.getItem('@TDAHService:users');
      const usersList = users || [];
      
      const userExists = usersList.find((u: any) => u.email === email);
      if (userExists) {
        return false; // Usuário já existe
      }
      
      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
      };
      
      usersList.push(newUser);
      await Storage.setItem('@TDAHService:users', usersList);
      
      // Fazer login automaticamente
      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
      
      await Storage.setItem('@TDAHService:user', userData);
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await Storage.removeItem('@TDAHService:user');
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}; 