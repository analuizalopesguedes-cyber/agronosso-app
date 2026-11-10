import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius, space, TOQUE_MIN } from '../theme';

type Variante = 'destaque' | 'primario' | 'secundario' | 'texto';

type Props = {
  rotulo: string;
  onPress: () => void;
  variante?: Variante;
  icone?: keyof typeof Ionicons.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
  dica?: string; // accessibilityHint
  estilo?: ViewStyle;
};

/**
 * Botão único do app (consistência e similaridade).
 * - destaque: Açafrão + texto Carvão. Use UM por tela (ponto focal).
 * - primario: Verde profundo + texto Papel.
 * - secundario: contorno Verde profundo.
 * - texto: ação terciária.
 */
export function Botao({
  rotulo,
  onPress,
  variante = 'primario',
  icone,
  carregando,
  desabilitado,
  dica,
  estilo,
}: Props) {
  const cores = CORES[variante];
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: !!inativo, busy: !!carregando }}
      disabled={inativo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: cores.fundo, borderColor: cores.borda },
        variante === 'texto' && styles.semBorda,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        inativo && styles.inativo,
        estilo,
      ]}
    >
      <View style={styles.conteudo}>
        {carregando ? (
          <ActivityIndicator color={cores.texto} />
        ) : (
          icone && <Ionicons name={icone} size={24} color={cores.texto} />
        )}
        <Text style={[styles.rotulo, { color: cores.texto }]}>{rotulo}</Text>
      </View>
    </Pressable>
  );
}

const CORES: Record<Variante, { fundo: string; borda: string; texto: string }> = {
  destaque: { fundo: colors.acafrao, borda: colors.acafrao, texto: colors.carvao },
  primario: { fundo: colors.verde, borda: colors.verde, texto: colors.papel },
  secundario: { fundo: 'transparent', borda: colors.verde, texto: colors.verde },
  texto: { fundo: 'transparent', borda: 'transparent', texto: colors.verde },
};

const styles = StyleSheet.create({
  base: {
    minHeight: TOQUE_MIN,
    borderRadius: radius.pilula,
    borderWidth: 2,
    paddingHorizontal: space.s3,
    justifyContent: 'center',
  },
  semBorda: { paddingHorizontal: space.s2 },
  conteudo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s1 },
  rotulo: { fontFamily: fonts.botao, fontSize: 18, lineHeight: 24, textAlign: 'center' },
  inativo: { opacity: 0.45 },
});
