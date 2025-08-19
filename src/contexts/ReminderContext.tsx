import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Storage from "../utils/storage";
import { Reminder, CreateReminderData } from "../types/reminder";
import { getApiBaseUrl, API_CONFIG } from "../config/api";
import { useNotifications } from "./NotificationContext";
import {
  validateReminder,
  validateId,
  sanitizeString,
} from "../utils/validation";
import {
  handleApiError,
  handleJSError,
  showError,
  withErrorHandling,
} from "../utils/errorHandler";

interface ReminderContextData {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (reminder: CreateReminderData) => Promise<boolean>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  toggleReminder: (id: string) => Promise<boolean>;
}

const ReminderContext = createContext<ReminderContextData>(
  {} as ReminderContextData
);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminders must be used within a ReminderProvider");
  }
  return context;
};

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { scheduleReminderNotification, cancelReminderNotification } =
    useNotifications();

  // Carrega lembretes do backend ou local
  useEffect(() => {
    let isMounted = true;
    
    const fetchReminders = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        const token = await Storage.getItem("@TDAHService:token");
        if (!token) {
          const storedReminders = await Storage.getItem(
            "@TDAHService:reminders"
          );
          setReminders(Array.isArray(storedReminders) ? storedReminders : []);
          return;
        }
        const apiBaseUrl = await getApiBaseUrl();
        console.log(`📋 Carregando lembretes de: ${apiBaseUrl}`);

        const response = await fetch(`${apiBaseUrl}/reminders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          const remindersArray = Array.isArray(data)
            ? data
            : Array.isArray(data.reminders)
            ? data.reminders
            : [];
          const mappedReminders = remindersArray.map((reminder: any) => {
            let dateTime;
            if (
              !reminder.dateTime ||
              isNaN(new Date(reminder.dateTime).getTime())
            ) {
              dateTime = new Date();
            } else {
              dateTime =
                reminder.dateTime instanceof Date
                  ? reminder.dateTime
                  : new Date(reminder.dateTime);
            }

            // Garantir que sempre temos um ID válido
            const reminderId =
              reminder._id ||
              reminder.id ||
              Math.random().toString(36).substr(2, 9);

            return {
              id: reminderId,
              title: reminder.title,
              description: reminder.description || "",
              dateTime,
              isCompleted:
                reminder.status === "completed" ||
                reminder.isCompleted ||
                false,
              userId: reminder.userId,
              createdAt: reminder.createdAt
                ? new Date(reminder.createdAt)
                : new Date(),
              updatedAt: reminder.updatedAt
                ? new Date(reminder.updatedAt)
                : new Date(),
            };
          });
          if (isMounted) {
            setReminders(mappedReminders);
            await Storage.setItem("@TDAHService:reminders", mappedReminders);
          }
        } else {
          if (isMounted) {
            setReminders([]);
          }
        }
      } catch (error) {
        if (isMounted) {
          setReminders([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchReminders();
    
    return () => {
      isMounted = false;
    };
  }, [scheduleReminderNotification, cancelReminderNotification]);

  // Adiciona lembrete
  const addReminder = useCallback(
    async (reminderData: CreateReminderData): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Validação dos dados de entrada
        const validation = validateReminder(reminderData);
        if (!validation.isValid) {
          const error = handleJSError(
            new Error(validation.errors.join(", ")),
            "Criar Lembrete - Validação"
          );
          showError(error, "Dados Inválidos");
          return false;
        }

        // Sanitizar dados
        const sanitizedData = {
          ...reminderData,
          title: sanitizeString(reminderData.title),
          description: reminderData.description
            ? sanitizeString(reminderData.description)
            : undefined,
          dateTime:
            reminderData.dateTime instanceof Date
              ? reminderData.dateTime
              : new Date(reminderData.dateTime),
        };

        const token = await Storage.getItem("@TDAHService:token");
        if (!token) {
          // Modo offline
          const newReminder: Reminder = {
            ...sanitizedData,
            id: Date.now().toString(),
            isCompleted: false,
            userId: "local",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setReminders((prev) => [...prev, newReminder]);
          await Storage.setItem(
            "@TDAHService:reminders",
            (reminders: Reminder[] | null) => [
              ...(reminders || []),
              newReminder,
            ]
          );

          // Agendar notificação para o novo lembrete
          await scheduleReminderNotification(newReminder);

          return true;
        }

        // Modo online
        const apiBaseUrl = await getApiBaseUrl();
        console.log(`➕ Criando lembrete em: ${apiBaseUrl}`);

        const response = await fetch(`${apiBaseUrl}/reminders`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedData),
        });

        if (response.ok) {
          const backendReminder = await response.json();

          // Validar resposta do backend
          if (!backendReminder || !backendReminder.title) {
            const error = handleJSError(
              new Error("Resposta inválida do servidor"),
              "Criar Lembrete - Resposta"
            );
            showError(error, "Erro no Servidor");
            return false;
          }

          // Mapear o lembrete do backend para o formato do frontend
          const newReminder: Reminder = {
            id:
              backendReminder._id ||
              backendReminder.id ||
              Math.random().toString(36).substr(2, 9),
            title: backendReminder.title,
            description: backendReminder.description || "",
            dateTime:
              backendReminder.dateTime instanceof Date
                ? backendReminder.dateTime
                : new Date(backendReminder.dateTime),
            isCompleted:
              backendReminder.status === "completed" ||
              backendReminder.isCompleted ||
              false,
            userId: backendReminder.userId,
            createdAt: backendReminder.createdAt
              ? new Date(backendReminder.createdAt)
              : new Date(),
            updatedAt: backendReminder.updatedAt
              ? new Date(backendReminder.updatedAt)
              : new Date(),
          };

          setReminders((prev) => [...prev, newReminder]);
          await Storage.setItem(
            "@TDAHService:reminders",
            (reminders: Reminder[] | null) => [
              ...(reminders || []),
              newReminder,
            ]
          );

          // Agendar notificação
          await scheduleReminderNotification(newReminder);

          return true;
        } else {
          const error = await handleApiError(response, "Criar Lembrete");
          showError(error, "Erro ao Criar Lembrete");
          return false;
        }
      } catch (error) {
        const appError = handleJSError(
          error as Error,
          "Criar Lembrete - Conectividade"
        );
        showError(appError, "Erro de Conexão");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [scheduleReminderNotification]
  );

  // Atualiza lembrete
  const updateReminder = useCallback(
    async (id: string, updates: Partial<Reminder>): Promise<boolean> => {
      setIsLoading(true);
      try {
        const token = await Storage.getItem("@TDAHService:token");
        if (!token) {
          setReminders((prev) =>
            prev.map((reminder) =>
              reminder.id === id ? { ...reminder, ...updates } : reminder
            )
          );
          await Storage.setItem(
            "@TDAHService:reminders",
            (reminders: Reminder[] | null) =>
              (reminders || []).map((reminder: Reminder) =>
                reminder.id === id ? { ...reminder, ...updates } : reminder
              )
          );
          return true;
        }
        const apiBaseUrl = await getApiBaseUrl();
        console.log(`✏️ Atualizando lembrete em: ${apiBaseUrl}`);

        const response = await fetch(`${apiBaseUrl}/reminders/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });
        if (response.ok) {
          const backendReminder = await response.json();

          // Mapear o lembrete do backend para o formato do frontend
          const updatedReminder: Reminder = {
            id: backendReminder._id || backendReminder.id || id,
            title: backendReminder.title,
            description: backendReminder.description || "",
            dateTime:
              backendReminder.dateTime instanceof Date
                ? backendReminder.dateTime
                : new Date(backendReminder.dateTime),
            isCompleted:
              backendReminder.status === "completed" ||
              backendReminder.isCompleted ||
              false,
            userId: backendReminder.userId,
            createdAt: backendReminder.createdAt
              ? new Date(backendReminder.createdAt)
              : new Date(),
            updatedAt: backendReminder.updatedAt
              ? new Date(backendReminder.updatedAt)
              : new Date(),
          };

          setReminders((prev) =>
            prev.map((reminder) =>
              reminder.id === id ? updatedReminder : reminder
            )
          );
          await Storage.setItem(
            "@TDAHService:reminders",
            (reminders: Reminder[] | null) =>
              (reminders || []).map((reminder: Reminder) =>
                reminder.id === id ? updatedReminder : reminder
              )
          );
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Deleta lembrete
  const deleteReminder = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const token = await Storage.getItem("@TDAHService:token");
      if (!token) {
        setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
        await Storage.setItem(
          "@TDAHService:reminders",
          (reminders: Reminder[] | null) =>
            (reminders || []).filter((reminder: Reminder) => reminder.id !== id)
        );
        return true;
      }
      const apiBaseUrl = await getApiBaseUrl();
      console.log(`🗑️ Deletando lembrete em: ${apiBaseUrl}`);

      const response = await fetch(`${apiBaseUrl}/reminders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
        await Storage.setItem(
          "@TDAHService:reminders",
          (reminders: Reminder[] | null) =>
            (reminders || []).filter((reminder: Reminder) => reminder.id !== id)
        );
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Alterna lembrete concluído
  const toggleReminder = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Validação do ID
        const idValidation = validateId(id);
        if (!idValidation.isValid) {
          const error = handleJSError(
            new Error(idValidation.errors.join(", ")),
            "Toggle Lembrete - ID Inválido"
          );
          showError(error, "ID Inválido");
          setIsLoading(false);
          return false;
        }

        const token = await Storage.getItem("@TDAHService:token");

        // Busca o lembrete atual no estado mais recente
        const currentReminders = [...reminders]; // Criar cópia para evitar problemas de referência
        const found = currentReminders.find((r) => r.id === id);

        if (!found) {
          // Log mais detalhado para debug
          console.warn(
            `Lembrete não encontrado para toggle. ID buscado: ${id}`
          );
          console.log(
            "Available IDs:",
            reminders.map((r) => ({ id: r.id }))
          );

          // Tentar buscar novamente do backend antes de falhar
          if (token) {
            try {
              // Refetch reminders from the API
              const apiBaseUrl = await getApiBaseUrl();
              const response = await fetch(`${apiBaseUrl}/reminders`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              if (response.ok) {
                const data = await response.json();
                const remindersArray = Array.isArray(data)
                  ? data
                  : Array.isArray(data.reminders)
                  ? data.reminders
                  : [];
                const mappedReminders = remindersArray.map((reminder: any) => ({
                  id:
                    reminder._id ||
                    reminder.id ||
                    Math.random().toString(36).substr(2, 9),
                  title: reminder.title,
                  description: reminder.description || "",
                  dateTime: new Date(reminder.dateTime),
                  isCompleted:
                    reminder.status === "completed" ||
                    reminder.isCompleted ||
                    false,
                  userId: reminder.userId,
                  createdAt: reminder.createdAt
                    ? new Date(reminder.createdAt)
                    : new Date(),
                  updatedAt: reminder.updatedAt
                    ? new Date(reminder.updatedAt)
                    : new Date(),
                }));
                setReminders(mappedReminders);
                await Storage.setItem(
                  "@TDAHService:reminders",
                  mappedReminders
                );
              }
              // Tentar encontrar novamente após atualização
              const updatedFound = reminders.find((r) => r.id === id);
              if (!updatedFound) {
                throw new Error(
                  `Lembrete com ID ${id} não encontrado mesmo após atualização`
                );
              }
              // Continuar com o lembrete encontrado
              return toggleReminder(id);
            } catch (refreshError) {
              const error = handleJSError(
                new Error(`Lembrete com ID ${id} não encontrado`),
                "Toggle Lembrete - Não Encontrado"
              );
              showError(error, "Lembrete Não Encontrado");
              setIsLoading(false);
              return false;
            }
          }

          const error = handleJSError(
            new Error(`Lembrete com ID ${id} não encontrado`),
            "Toggle Lembrete - Não Encontrado"
          );
          showError(error, "Lembrete Não Encontrado");
          setIsLoading(false);
          return false;
        }

        const newCompletedStatus = !found.isCompleted;

        // Atualização otimista - atualiza a UI imediatamente
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === id
              ? {
                  ...reminder,
                  isCompleted: newCompletedStatus,
                  updatedAt: new Date(),
                }
              : reminder
          )
        );

        if (!token) {
          // Modo offline - salva no storage local
          await Storage.setItem(
            "@TDAHService:reminders",
            (reminders: Reminder[] | null) =>
              (reminders || []).map((reminder: Reminder) =>
                reminder.id === id
                  ? {
                      ...reminder,
                      isCompleted: newCompletedStatus,
                      updatedAt: new Date(),
                    }
                  : reminder
              )
          );
          setIsLoading(false);
          return true;
        }

        // Modo online - sincroniza com backend
        try {
          const apiBaseUrl = await getApiBaseUrl();
          console.log(`🔄 Alternando status do lembrete em: ${apiBaseUrl}`);

          // No método toggleReminder, ao enviar para o backend:
          const response = await fetch(`${apiBaseUrl}/reminders/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: newCompletedStatus ? "completed" : "pending",
              // Removido o campo isCompleted que estava causando problemas de validação
            }),
          });

          if (response.ok) {
            const backendReminder = await response.json();
            console.log("✅ Lembrete atualizado com sucesso no backend");

            // Validar resposta do backend
            if (!backendReminder || !backendReminder.title) {
              const error = handleJSError(
                new Error("Resposta inválida do servidor"),
                "Toggle Lembrete - Resposta"
              );
              showError(error, "Erro no Servidor");
              setIsLoading(false);
              return false;
            }

            // Mapear o lembrete do backend para o formato do frontend
            const updatedReminder: Reminder = {
              id: backendReminder._id || backendReminder.id || id,
              title: backendReminder.title,
              description: backendReminder.description || "",
              dateTime:
                backendReminder.dateTime instanceof Date
                  ? backendReminder.dateTime
                  : new Date(backendReminder.dateTime),
              isCompleted:
                backendReminder.status === "completed" ||
                backendReminder.isCompleted ||
                false,
              userId: backendReminder.userId,
              createdAt: backendReminder.createdAt
                ? new Date(backendReminder.createdAt)
                : new Date(),
              updatedAt: backendReminder.updatedAt
                ? new Date(backendReminder.updatedAt)
                : new Date(),
            };

            // Atualiza com dados do backend
            setReminders((prev) =>
              prev.map((reminder) =>
                reminder.id === id ? updatedReminder : reminder
              )
            );

            await Storage.setItem(
              "@TDAHService:reminders",
              (reminders: Reminder[] | null) =>
                (reminders || []).map((reminder: Reminder) =>
                  reminder.id === id ? updatedReminder : reminder
                )
            );

            setIsLoading(false);
            return true;
          } else {
            const error = await handleApiError(response, "Toggle Lembrete");

            // Reverte a mudança otimista
            setReminders((prev) =>
              prev.map((reminder) =>
                reminder.id === id
                  ? { ...reminder, isCompleted: found.isCompleted }
                  : reminder
              )
            );

            showError(error, "Erro ao Atualizar Lembrete");
            setIsLoading(false);
            return false;
          }
        } catch (apiError) {
          const error = handleJSError(
            apiError as Error,
            "Toggle Lembrete - Conectividade"
          );
          console.error("❌ Erro de rede ao atualizar lembrete:", error);

          // Mantém a mudança local mesmo com erro de rede
          await Storage.setItem(
            "@TDAHService:reminders",
            (reminders: Reminder[] | null) =>
              (reminders || []).map((reminder: Reminder) =>
                reminder.id === id
                  ? {
                      ...reminder,
                      isCompleted: newCompletedStatus,
                      updatedAt: new Date(),
                    }
                  : reminder
              )
          );

          // Não mostrar erro para problemas de rede - mantém funcionamento offline
          setIsLoading(false);
          return true; // Retorna true porque a mudança local foi feita
        }
      } catch (error) {
        const appError = handleJSError(
          error as Error,
          "Toggle Lembrete - Geral"
        );
        showError(appError, "Erro Inesperado");
        setIsLoading(false);
        return false;
      }
    },
    [reminders]
  );

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        isLoading,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};
