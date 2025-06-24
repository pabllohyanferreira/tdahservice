import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { hideAsync } from 'expo-splash-screen'; 
import { AV } from 'expo-av/build/AV';

export function Splash() {

  const [lastStatus, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);

  function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    if(status.isLoaded){
      if (lastStatus.isLoaded !==  status.isLoaded) {
        hideAsync();
      }

      if (status.didJustFinish){

      }
    }
  }

  return (
    <Video
      source={require('../../assets/Splash.mp4')}
      isLooping={false}
      shouldPlay={true}
      resizeMode={ResizeMode.COVER}
      style={StyleSheet.absoluteFill}
      onPlaybackStatusUpdate={onPlaybackStatusUpdate}
    />
  );
}
