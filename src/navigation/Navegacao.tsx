import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AjudaScreen } from '../screens/AjudaScreen';
import { BoasVindasScreen } from '../screens/BoasVindasScreen';
import { DocumentosScreen } from '../screens/DocumentosScreen';
import { DuvidasScreen } from '../screens/DuvidasScreen';
import { ExplicacaoScreen } from '../screens/ExplicacaoScreen';
import { FotografarScreen } from '../screens/FotografarScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { LendoScreen } from '../screens/LendoScreen';
import { colors, fonts } from '../theme';
import { AbasParams, RaizParams } from './tipos';

const Pilha = createNativeStackNavigator<RaizParams>();
const Abas = createBottomTabNavigator<AbasParams>();

const tema = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.papel, card: colors.papelClaro, primary: colors.verde, text: colors.carvao },
};

type IconeNome = keyof typeof Ionicons.glyphMap;
const ICONES: Record<keyof AbasParams, [IconeNome, IconeNome]> = {
  Inicio: ['home', 'home-outline'],
  Documentos: ['document-text', 'document-text-outline'],
  Duvidas: ['chatbubble-ellipses', 'chatbubble-ellipses-outline'],
  Ajuda: ['help-circle', 'help-circle-outline'],
};

function AbasPrincipais() {
  const insets = useSafeAreaInsets();
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.verde,
        tabBarInactiveTintColor: colors.oliva,
        // Aba ativa: ícone cheio + fundo suave, não só cor (acessibilidade)
        tabBarActiveBackgroundColor: colors.verdeSuave,
        tabBarLabelStyle: { fontFamily: fonts.botao, fontSize: 14, marginBottom: 4 },
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 4, marginVertical: 6 },
        tabBarStyle: {
          backgroundColor: colors.papelClaro,
          borderTopColor: colors.linha,
          height: 76 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarIcon: ({ focused, color }) => (
          <Ionicons name={ICONES[route.name][focused ? 0 : 1]} size={26} color={color} />
        ),
      })}
    >
      <Abas.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início' }} />
      <Abas.Screen name="Documentos" component={DocumentosScreen} options={{ title: 'Documentos' }} />
      <Abas.Screen name="Duvidas" component={DuvidasScreen} options={{ title: 'Dúvidas' }} />
      <Abas.Screen name="Ajuda" component={AjudaScreen} options={{ title: 'Ajuda' }} />
    </Abas.Navigator>
  );
}

export function Navegacao({ mostrarBoasVindas }: { mostrarBoasVindas: boolean }) {
  return (
    <NavigationContainer theme={tema}>
      <Pilha.Navigator
        initialRouteName={mostrarBoasVindas ? 'BoasVindas' : 'Abas'}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.papel }, animation: 'slide_from_right' }}
      >
        <Pilha.Screen name="BoasVindas" component={BoasVindasScreen} options={{ animation: 'fade' }} />
        <Pilha.Screen name="Abas" component={AbasPrincipais} />
        <Pilha.Screen name="Fotografar" component={FotografarScreen} />
        <Pilha.Screen name="Lendo" component={LendoScreen} options={{ gestureEnabled: false }} />
        <Pilha.Screen name="Explicacao" component={ExplicacaoScreen} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
