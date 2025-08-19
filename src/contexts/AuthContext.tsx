import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
// @ts-ignore
import Storage from "../utils/storage";
import { googleAuthSimple, GoogleUser } from "../utils/googleAuthSimple";
import { getApiBaseUrl, API_CONFIG } from "../config/api";
import { testConnection } from "../config/api"; // Importação separada para garantir que seja carregada corretamente
import {
  validateLoginData,
  validateSignupData,
  sanitizeString,
} from "../utils/validation";
import {
  handleApiError,
  handleJSError,
  showError,
  withErrorHandling,
} from "../utils/errorHandler";

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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const loadStoredUser = useCallback(async () => {
    try {
      const storedUser = await Storage.getItem("@TDAHService:user");
      const storedToken = await Storage.getItem("@TDAHService:token");

      if (storedUser && storedToken) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (isAuthenticating) {
        return false; // Evita múltiplas requisições
      }
      
      try {
        setIsAuthenticating(true);
        setIsLoading(true);

        // Validação dos dados de entrada
        const validation = validateLoginData(email, password);
        if (!validation.isValid) {
          const error = handleJSError(
            new Error(validation.errors.join(", ")),
            "Login - Validação"
          );
          showError(error, "Dados Inválidos");
          return false;
        }

        // Sanitizar dados
        const sanitizedEmail = sanitizeString(email).toLowerCase();
        const sanitizedPassword = password; // Não sanitizar senha
        
        // Validar se senha não está vazia
        if (!sanitizedPassword || sanitizedPassword.trim().length === 0) {
          const error = handleJSError(
            new Error("Senha não pode estar vazia"),
            "Login - Validação"
          );
          showError(error, "Dados Inválidos");
          return false;
        }

        const apiBaseUrl = await getApiBaseUrl();
        console.log(`🔐 Tentando login em: ${apiBaseUrl}`);

        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sanitizedEmail,
            password: sanitizedPassword,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Login realizado com sucesso");

          // Validar dados recebidos do servidor
          if (!data.token || !data.user) {
            const error = handleJSError(
              new Error("Resposta inválida do servidor"),
              "Login - Resposta"
            );
            showError(error, "Erro no Login");
            return false;
          }

          // Salvar token e dados do usuário
          await Storage.setItem("@TDAHService:token", data.token);
          await Storage.setItem("@TDAHService:user", data.user);
          setUser(data.user);
          return true;
        } else {
          const error = await handleApiError(response, "Login");
          showError(error, "Erro no Login");
          return false;
        }
      } catch (error) {
        const appError = handleJSError(error as Error, "Login - Conectividade");
        showError(appError, "Erro de Conexão");
        return false;
              } finally {
          setIsAuthenticating(false);
          setIsLoading(false);
        }
      },
      [isAuthenticating]
    );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        // Validação dos dados de entrada
        const validation = validateSignupData(name, email, password);
        if (!validation.isValid) {
          const error = handleJSError(
            new Error(validation.errors.join(", ")),
            "Cadastro - Validação"
          );
          showError(error, "Dados Inválidos");
          return false;
        }

        // Sanitizar dados
        const sanitizedName = sanitizeString(name);
        const sanitizedEmail = sanitizeString(email).toLowerCase();
        const sanitizedPassword = password; // Não sanitizar senha

        const apiBaseUrl = await getApiBaseUrl();
        console.log(`📝 Tentando cadastro em: ${apiBaseUrl}`);

        const response = await fetch(`${apiBaseUrl}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: sanitizedName,
            email: sanitizedEmail,
            password: sanitizedPassword,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Cadastro realizado com sucesso");

          // Validar dados recebidos do servidor
          if (!data.token || !data.user) {
            const error = handleJSError(
              new Error("Resposta inválida do servidor"),
              "Cadastro - Resposta"
            );
            showError(error, "Erro no Cadastro");
            return false;
          }

          // Salvar token e dados do usuário
          await Storage.setItem("@TDAHService:token", data.token);
          await Storage.setItem("@TDAHService:user", data.user);
          setUser(data.user);
          return true;
        } else {
          const error = await handleApiError(response, "Cadastro");
          showError(error, "Erro no Cadastro");
          return false;
        }
      } catch (error) {
        const appError = handleJSError(
          error as Error,
          "Cadastro - Conectividade"
        );
        showError(appError, "Erro de Conexão");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Verificar conectividade antes de tentar login
      try {
        const isConnected = await testConnection();
        if (!isConnected) {
          const error = handleJSError(
            new Error("Sem conexão com a internet"),
            "Google Login - Conectividade"
          );
          showError(error, "Erro de Conexão");
          return false;
        }
      } catch (connectionError) {
        // Se testConnection lançar um erro, tratamos como falha de conexão
        const error = handleJSError(
          new Error("Sem conexão com a internet"),
          "Google Login - Conectividade"
        );
        showError(error, "Erro de Conexão");
        return false;
      }

      const googleUser = await googleAuthSimple.signInWithGoogle();

      if (!googleUser) {
        const error = handleJSError(
          new Error("Login com Google cancelado"),
          "Google Login - Cancelado"
        );
        // Não mostrar erro para cancelamento
        return false;
      }

      // Validar dados do Google
      if (!googleUser.id || !googleUser.email || !googleUser.name) {
        const error = handleJSError(
          new Error("Dados incompletos do Google"),
          "Google Login - Dados"
        );
        showError(error, "Erro no Login Google");
        return false;
      }

      const apiBaseUrl = await getApiBaseUrl();
      console.log(`🔐 Tentando login Google em: ${apiBaseUrl}`);

      // Sanitizar dados do Google
      const sanitizedData = {
        googleId: sanitizeString(googleUser.id),
        name: sanitizeString(googleUser.name),
        email: sanitizeString(googleUser.email).toLowerCase(),
        picture: googleUser.picture
          ? sanitizeString(googleUser.picture)
          : undefined,
      };

      const response = await fetch(`${apiBaseUrl}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Login Google realizado com sucesso");

        // Validar dados recebidos do servidor
        if (!data.token || !data.user) {
          const error = handleJSError(
            new Error("Resposta inválida do servidor"),
            "Google Login - Resposta"
          );
          showError(error, "Erro no Login Google");
          return false;
        }

        // Salvar token e dados do usuário
        await Storage.setItem("@TDAHService:token", data.token);
        await Storage.setItem("@TDAHService:user", data.user);
        setUser(data.user);
        return true;
      } else {
        const error = await handleApiError(response, "Google Login");
        showError(error, "Erro no Login Google");
        return false;
      }
    } catch (error) {
      const appError = handleJSError(
        error as Error,
        "Google Login - Conectividade"
      );
      showError(appError, "Erro de Conexão");
      console.error("Detalhes completos do erro:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await Storage.removeItem("@TDAHService:user");
      await Storage.removeItem("@TDAHService:token");
      await googleAuthSimple.signOut();
      setUser(null);
      console.log("✅ Logout realizado com sucesso");
    } catch (error) {
      const appError = handleJSError(error as Error, "Logout");
      console.error("❌ Erro no logout:", appError);
      // Mesmo com erro, limpar o estado local
      setUser(null);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signInWithGoogle, signUp, signOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
