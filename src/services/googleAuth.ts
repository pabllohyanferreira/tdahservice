import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { checkInternetConnection } from '../utils/networkUtils';
import { Alert } from 'react-native';

export const initializeGoogleSignIn = () => {
  try {
    GoogleSignin.configure({
      // Substitua pelo seu Web Client ID do Google Cloud Console
      webClientId: 'seu-client-id-aqui.apps.googleusercontent.com',
      offlineAccess: true
    });
  } catch (error) {
    console.error('Erro ao inicializar Google Sign-In:', error);
  }
};

export const handleGoogleSignIn = async () => {
  try {
    const isConnected = await checkInternetConnection();
    
    if (!isConnected) {
      throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
    }

    // Verifica se os Google Play Services estão disponíveis
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Tenta realizar o login
    const userInfo = await GoogleSignin.signIn();
    return userInfo;
    
  } catch (error) {
    console.error('Erro durante o login:', error);
    
    let mensagemErro = 'Ocorreu um erro durante o login.';
    
    if (error instanceof Error) {
      mensagemErro = error.message;
    }
    
    Alert.alert(
      'Erro no Login',
      mensagemErro,
      [{ text: 'OK' }]
    );
    
    throw error;
  }
};