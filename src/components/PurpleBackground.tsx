import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface PurpleBackgroundProps {
  children: React.ReactNode;
  showPattern?: boolean;
  patternOpacity?: number;
}

export const PurpleBackground: React.FC<PurpleBackgroundProps> = ({
  children,
  showPattern = true,
  patternOpacity = 0.08,
}) => {
  return (
    <View style={styles.container}>
      {/* Gradiente de fundo principal */}
      <LinearGradient
        colors={['#E6E6FA', '#D8BFD8']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Formas orgânicas/onduladas como na imagem */}
      {showPattern && (
        <View style={styles.patternContainer}>
          {/* Formas onduladas orgânicas */}
          {Array.from({ length: 15 }).map((_, index) => (
            <View
              key={`wave-${index}`}
              style={[
                styles.organicShape,
                {
                  top: (index * height) / 15,
                  left: ((index % 3) * width) / 3,
                  width: 80 + (index % 4) * 20,
                  height: 60 + (index % 3) * 15,
                  opacity: patternOpacity * (0.5 + (index % 3) * 0.2),
                  transform: [{ rotate: `${(index % 4) * 45}deg` }],
                },
              ]}
            />
          ))}
          
          {/* Formas circulares orgânicas */}
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              key={`circle-${index}`}
              style={[
                styles.organicCircle,
                {
                  top: (index * height) / 8,
                  left: ((index % 4) * width) / 4,
                  width: 40 + (index % 3) * 15,
                  height: 40 + (index % 3) * 15,
                  opacity: patternOpacity * (0.3 + (index % 2) * 0.2),
                },
              ]}
            />
          ))}
          
          {/* Formas elípticas */}
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={`ellipse-${index}`}
              style={[
                styles.organicEllipse,
                {
                  top: (index * height) / 6,
                  left: ((index % 3) * width) / 3,
                  width: 100 + (index % 2) * 30,
                  height: 50 + (index % 2) * 20,
                  opacity: patternOpacity * (0.4 + (index % 2) * 0.3),
                  transform: [{ rotate: `${(index % 3) * 30}deg` }],
                },
              ]}
            />
          ))}
        </View>
      )}
      
      {/* Conteúdo */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  organicShape: {
    position: 'absolute',
    backgroundColor: '#9370DB',
    borderRadius: 50,
  },
  organicCircle: {
    position: 'absolute',
    backgroundColor: '#8A2BE2',
    borderRadius: 50,
  },
  organicEllipse: {
    position: 'absolute',
    backgroundColor: '#9932CC',
    borderRadius: 50,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
}); 