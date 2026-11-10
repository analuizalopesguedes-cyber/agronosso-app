import { Lexend_400Regular, Lexend_500Medium } from '@expo-google-fonts/lexend';
import { SourceSans3_600SemiBold, SourceSans3_700Bold } from '@expo-google-fonts/source-sans-3';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AvisoProvider } from './src/context/AvisoContext';
import { DadosProvider } from './src/context/DadosContext';
import { FalaProvider } from './src/context/FalaContext';
import { Navegacao } from './src/navigation/Navegacao';
import { armazenamento } from './src/services/armazenamento';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontesProntas] = useFonts({
    SourceSans3_700Bold,
    SourceSans3_600SemiBold,
    Lexend_400Regular,
    Lexend_500Medium,
  });
  const [boasVindas, setBoasVindas] = useState<boolean | null>(null);

  useEffect(() => {
    armazenamento.boasVindasVista().then((vista) => setBoasVindas(!vista));
  }, []);

  const pronto = fontesProntas && boasVindas !== null;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync().catch(() => {});
  }, [pronto]);

  if (!pronto) return null; // a tela de abertura (logo centralizado) continua visível

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <DadosProvider>
        <FalaProvider>
          <AvisoProvider>
            <Navegacao mostrarBoasVindas={boasVindas} />
          </AvisoProvider>
        </FalaProvider>
      </DadosProvider>
    </SafeAreaProvider>
  );
}
