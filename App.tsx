import React, { useEffect, useState } from 'react';
import { Splash } from './src/screens/Splash';
import MainApp from './src/screens/MainApp';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5500);
    return () => clearTimeout(timer);
  }, []);

  return showSplash ? <Splash /> : <MainApp />;
}
