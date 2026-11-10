import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useFala } from '../context/FalaContext';
import { colors, fonts, radius, space } from '../theme';

type Props = {
  id: string;
  texto: string;
  rotulo?: string;
  /** Versão grande, para a explicação completa. */
  grande?: boolean;
  /** Sobre fundo Verde profundo. */
  invertido?: boolean;
};

/** Ouvir / Parar. Ícone de alto-falante reconhecível (Nielsen 2) e texto sempre junto. */
export function BotaoOuvir({ id, texto, rotulo = 'Ouvir', grande, invertido }: Props) {
  const { falandoId, falar, parar } = useFala();
  const tocando = falandoId === id;
  const corTexto = invertido ? colors.papel : colors.verde;
  const fundo = tocando ? (invertido ? colors.papel : colors.verde) : invertido ? 'transparent' : colors.verdeSuave;
  const corAtiva = invertido ? colors.verde : colors.papel;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tocando ? 'Parar áudio' : rotulo}
      accessibilityState={{ selected: tocando }}
      onPress={() => (tocando ? parar() : falar(id, texto))}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        grande && styles.grande,
        { backgroundColor: fundo, borderColor: invertido ? colors.papel : 'transparent' },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Ionicons
        name={tocando ? 'stop-circle' : 'volume-high'}
        size={grande ? 28 : 22}
        color={tocando ? corAtiva : corTexto}
      />
      <Text style={[styles.rotulo, grande && styles.rotuloGrande, { color: tocando ? corAtiva : corTexto }]}>
        {tocando ? 'Parar' : rotulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.s1,
    paddingHorizontal: space.s2,
    borderRadius: radius.pilula,
    borderWidth: 2,
  },
  grande: { minHeight: 56, paddingHorizontal: space.s3, alignSelf: 'stretch', justifyContent: 'center' },
  rotulo: { fontFamily: fonts.botao, fontSize: 16 },
  rotuloGrande: { fontSize: 18 },
});
