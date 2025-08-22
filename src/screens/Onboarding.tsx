import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { ThemeBackground } from '../components/ThemeBackground';

const { width } = Dimensions.get('window');

interface OnboardingProps {
  navigation: any;
}

interface UserData {
  name: string;
  age: string;
  gender: 'masculino' | 'feminino' | 'outro' | '';
}

export default function Onboarding({ navigation }: OnboardingProps) {
  const { theme } = useTheme();
  const { saveUserData, markOnboardingCompleted } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    age: '',
    gender: '',
  });

  const steps = [
    {
      title: 'Bem-vindo ao TDAH Service!',
      subtitle: 'Vamos conhecer você melhor para personalizar sua experiência',
      icon: 'person-circle-outline',
    },
    {
      title: 'Como você se chama?',
      subtitle: 'Digite seu nome completo',
      icon: 'person-outline',
    },
    {
      title: 'Qual sua idade?',
      subtitle: 'Isso nos ajuda a adaptar as funcionalidades',
      icon: 'calendar-outline',
    },
    {
      title: 'Qual seu gênero?',
      subtitle: 'Para personalização do conteúdo',
      icon: 'heart-outline',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    // Validação dos dados
    if (!userData.name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, digite seu nome.');
      setCurrentStep(1);
      return;
    }

    if (!userData.age.trim() || isNaN(Number(userData.age)) || Number(userData.age) < 1 || Number(userData.age) > 120) {
      Alert.alert('Idade inválida', 'Por favor, digite uma idade válida entre 1 e 120 anos.');
      setCurrentStep(2);
      return;
    }

    if (!userData.gender) {
      Alert.alert('Gênero obrigatório', 'Por favor, selecione seu gênero.');
      setCurrentStep(3);
      return;
    }

    try {
      // Salvar dados do usuário usando o contexto
      await saveUserData(userData);
      await markOnboardingCompleted();
      
      // Navegar para o Dashboard
      navigation.replace('Dashboard');
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.');
    }
  };

  const updateUserData = (field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Ionicons 
              name="rocket-outline" 
              size={80} 
              color={theme.action.primary} 
              style={styles.stepIcon}
            />
            <Text style={[styles.stepTitle, { color: theme.text.primary }]}>
              {steps[currentStep].title}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.text.secondary }]}>
              {steps[currentStep].subtitle}
            </Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color={theme.action.success} />
                <Text style={[styles.featureText, { color: theme.text.primary }]}>
                  Organize seus lembretes
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color={theme.action.success} />
                <Text style={[styles.featureText, { color: theme.text.primary }]}>
                  Visualize no calendário
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color={theme.action.success} />
                <Text style={[styles.featureText, { color: theme.text.primary }]}>
                  Anote suas ideias
                </Text>
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Ionicons 
              name={steps[currentStep].icon as any} 
              size={60} 
              color={theme.action.primary} 
              style={styles.stepIcon}
            />
            <Text style={[styles.stepTitle, { color: theme.text.primary }]}>
              {steps[currentStep].title}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.text.secondary }]}>
              {steps[currentStep].subtitle}
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.card,
                color: theme.text.primary,
                borderColor: theme.action.primary
              }]}
              placeholder="Digite seu nome completo"
              placeholderTextColor={theme.text.muted}
              value={userData.name}
              onChangeText={(text) => updateUserData('name', text)}
              autoFocus
              autoCapitalize="words"
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Ionicons 
              name={steps[currentStep].icon as any} 
              size={60} 
              color={theme.action.primary} 
              style={styles.stepIcon}
            />
            <Text style={[styles.stepTitle, { color: theme.text.primary }]}>
              {steps[currentStep].title}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.text.secondary }]}>
              {steps[currentStep].subtitle}
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background.card,
                color: theme.text.primary,
                borderColor: theme.action.primary
              }]}
              placeholder="Digite sua idade"
              placeholderTextColor={theme.text.muted}
              value={userData.age}
              onChangeText={(text) => updateUserData('age', text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={3}
              autoFocus
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Ionicons 
              name={steps[currentStep].icon as any} 
              size={60} 
              color={theme.action.primary} 
              style={styles.stepIcon}
            />
            <Text style={[styles.stepTitle, { color: theme.text.primary }]}>
              {steps[currentStep].title}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.text.secondary }]}>
              {steps[currentStep].subtitle}
            </Text>
            <View style={styles.genderContainer}>
              {[
                { label: 'Masculino', value: 'masculino', icon: 'male' },
                { label: 'Feminino', value: 'feminino', icon: 'female' },
                { label: 'Outro', value: 'outro', icon: 'person' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor: userData.gender === option.value 
                        ? theme.action.primary 
                        : theme.background.card,
                      borderColor: theme.action.primary,
                    }
                  ]}
                  onPress={() => updateUserData('gender', option.value)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={userData.gender === option.value ? '#fff' : theme.action.primary} 
                  />
                  <Text style={[
                    styles.genderText,
                    { 
                      color: userData.gender === option.value ? '#fff' : theme.text.primary 
                    }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return userData.name.trim().length > 0;
      case 2:
        return userData.age.trim().length > 0 && !isNaN(Number(userData.age));
      case 3:
        return userData.gender !== '';
      default:
        return false;
    }
  };

  return (
    <ThemeBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header com progresso */}
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: index <= currentStep 
                        ? theme.action.primary 
                        : theme.text.muted,
                    }
                  ]}
                />
              ))}
            </View>
            {currentStep > 0 && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Conteúdo do step */}
          {renderStepContent()}

          {/* Botões de navegação */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                {
                  backgroundColor: canProceed() 
                    ? theme.action.primary 
                    : theme.text.muted,
                }
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
              </Text>
              <Ionicons 
                name={currentStep === steps.length - 1 ? "checkmark" : "arrow-forward"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 60, // Aumentado de 40 para 60 para descer as bolinhas
    marginTop: 20, // Adicionado margem superior para descer as bolinhas
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  backButton: {
    padding: 8,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 60, // Adicionado margem inferior para subir o conteúdo
  },
  stepIcon: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginTop: 20,
  },
  genderContainer: {
    width: '100%',
    gap: 16,
    marginTop: 20,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20, // Reduzido de 40 para 20 para subir o botão
    alignItems: 'center',
    marginBottom: 40, // Adicionado margem inferior para melhor espaçamento
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 