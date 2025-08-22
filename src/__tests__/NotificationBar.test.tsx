import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationBar } from '../components/NotificationBar';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ReminderProvider } from '../contexts/ReminderContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock do expo-notifications
jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('test-notification-id')),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

// Mock do expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <NotificationProvider>
      <ReminderProvider>
        {children}
      </ReminderProvider>
    </NotificationProvider>
  </ThemeProvider>
);

describe('NotificationBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar corretamente', () => {
    const { getByText } = render(
      <TestWrapper>
        <NotificationBar />
      </TestWrapper>
    );

    expect(getByText('🔔 Notificações')).toBeTruthy();
  });

  it('deve mostrar badge quando há lembretes pendentes', async () => {
    const mockReminders = [
      {
        id: '1',
        title: 'Teste',
        description: 'Descrição teste',
        dateTime: new Date(Date.now() + 60000), // 1 minuto no futuro
        isCompleted: false,
        userId: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Mock do contexto de lembretes
    jest.spyOn(require('../contexts/ReminderContext'), 'useReminders').mockReturnValue({
      reminders: mockReminders,
      isLoading: false,
      addReminder: jest.fn(),
      updateReminder: jest.fn(),
      deleteReminder: jest.fn(),
      toggleReminder: jest.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <NotificationBar showBadge={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('1')).toBeTruthy(); // Badge com número 1
    });
  });

  it('deve chamar onNotificationPress quando notificação é clicada', () => {
    const mockOnNotificationPress = jest.fn();

    const { getByText } = render(
      <TestWrapper>
        <NotificationBar onNotificationPress={mockOnNotificationPress} />
      </TestWrapper>
    );

    const verButton = getByText('📋 Ver');
    fireEvent.press(verButton);

    expect(mockOnNotificationPress).toHaveBeenCalled();
  });

  it('deve enviar notificação de teste quando botão é pressionado', async () => {
    const mockSendTestNotification = jest.fn(() => Promise.resolve());

    jest.spyOn(require('../contexts/NotificationContext'), 'useNotifications').mockReturnValue({
      isEnabled: true,
      isLoading: false,
      expoPushToken: 'test-token',
      enableNotifications: jest.fn(),
      disableNotifications: jest.fn(),
      scheduleReminderNotification: jest.fn(),
      cancelReminderNotification: jest.fn(),
      sendTestNotification: mockSendTestNotification,
      checkPermissions: jest.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <NotificationBar />
      </TestWrapper>
    );

    const testButton = getByText('🧪 Teste');
    fireEvent.press(testButton);

    await waitFor(() => {
      expect(mockSendTestNotification).toHaveBeenCalled();
    });
  });

  it('deve criar lembrete rápido quando botão é pressionado', async () => {
    const mockScheduleReminderNotification = jest.fn(() => Promise.resolve('test-id'));

    jest.spyOn(require('../contexts/NotificationContext'), 'useNotifications').mockReturnValue({
      isEnabled: true,
      isLoading: false,
      expoPushToken: 'test-token',
      enableNotifications: jest.fn(),
      disableNotifications: jest.fn(),
      scheduleReminderNotification: mockScheduleReminderNotification,
      cancelReminderNotification: jest.fn(),
      sendTestNotification: jest.fn(),
      checkPermissions: jest.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <NotificationBar />
      </TestWrapper>
    );

    const quickButton = getByText('⚡ Rápido');
    fireEvent.press(quickButton);

    await waitFor(() => {
      expect(mockScheduleReminderNotification).toHaveBeenCalled();
    });
  });

  it('deve mostrar alerta quando notificações estão desabilitadas', async () => {
    const mockAlert = jest.spyOn(require('react-native'), 'Alert').mockImplementation(() => ({}));

    jest.spyOn(require('../contexts/NotificationContext'), 'useNotifications').mockReturnValue({
      isEnabled: false,
      isLoading: false,
      expoPushToken: null,
      enableNotifications: jest.fn(),
      disableNotifications: jest.fn(),
      scheduleReminderNotification: jest.fn(),
      cancelReminderNotification: jest.fn(),
      sendTestNotification: jest.fn(),
      checkPermissions: jest.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <NotificationBar />
      </TestWrapper>
    );

    const testButton = getByText('🧪 Teste');
    fireEvent.press(testButton);

    await waitFor(() => {
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Notificações Desabilitadas',
        'Ative as notificações nas configurações para testar.'
      );
    });
  });

  it('deve configurar listeners de notificação corretamente', () => {
    const mockAddNotificationReceivedListener = require('expo-notifications').addNotificationReceivedListener;
    const mockAddNotificationResponseReceivedListener = require('expo-notifications').addNotificationResponseReceivedListener;

    render(
      <TestWrapper>
        <NotificationBar />
      </TestWrapper>
    );

    expect(mockAddNotificationReceivedListener).toHaveBeenCalled();
    expect(mockAddNotificationResponseReceivedListener).toHaveBeenCalled();
  });

  it('deve aplicar tema corretamente', () => {
    const { getByText } = render(
      <TestWrapper>
        <NotificationBar />
      </TestWrapper>
    );

    const title = getByText('🔔 Notificações');
    expect(title).toBeTruthy();
  });

  it('deve lidar com auto-hide corretamente', async () => {
    jest.useFakeTimers();

    const { getByText, queryByText } = render(
      <TestWrapper>
        <NotificationBar autoHide={true} autoHideDelay={1000} />
      </TestWrapper>
    );

    expect(getByText('🔔 Notificações')).toBeTruthy();

    // Simular tempo passando
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      // A barra deve desaparecer após o delay
      expect(queryByText('🔔 Notificações')).toBeNull();
    });

    jest.useRealTimers();
  });

  it('deve mostrar preview de notificação quando recebida', async () => {
    const mockNotification = {
      request: {
        content: {
          title: 'Teste de Notificação',
          body: 'Corpo da notificação de teste',
        },
      },
    };

    const { getByText } = render(
      <TestWrapper>
        <NotificationBar />
      </TestWrapper>
    );

    // Simular recebimento de notificação
    const mockListener = require('expo-notifications').addNotificationReceivedListener.mock.calls[0][0];
    mockListener(mockNotification);

    await waitFor(() => {
      expect(getByText('Teste de Notificação')).toBeTruthy();
      expect(getByText('Corpo da notificação de teste')).toBeTruthy();
    });
  });
}); 