import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { space } from '../theme';
import { Logo } from './Logo';

/** Cabeçalho das telas principais: logo no canto superior esquerdo, levando ao Início. */
export function TopoApp({ direita }: { direita?: React.ReactNode }) {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.topo}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="AgroNosso, ir para o início"
        onPress={() => navigation.navigate('Abas', { screen: 'Inicio' })}
        hitSlop={4}
      >
        <Logo largura={96} />
      </Pressable>
      {direita}
    </View>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.s1,
  },
});
