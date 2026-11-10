import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, elevacao, fonts, radius, space } from '../theme';
import { DocumentoExplicado } from '../types';
import { formatarData, IconeRedondo, SeloAtencao } from './ui';

type Props = {
  doc: DocumentoExplicado;
  aoAbrir: () => void;
  aoExcluir?: () => void;
};

/** Mesmo container para todo documento listado (região comum + similaridade). */
export function CartaoDocumento({ doc, aoAbrir, aoExcluir }: Props) {
  return (
    <View style={styles.cartao}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${doc.titulo}. ${formatarData(doc.criadoEm)}`}
        accessibilityHint="Abre a explicação"
        onPress={aoAbrir}
        style={({ pressed }) => [styles.toque, pressed && { opacity: 0.85 }]}
      >
        <IconeRedondo nome="document-text" />
        <View style={styles.textos}>
          <Text style={styles.titulo} numberOfLines={2}>
            {doc.titulo}
          </Text>
          <Text style={styles.data}>{formatarData(doc.criadoEm)}</Text>
          <SeloAtencao nivel={doc.nivelAtencao} />
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.verde} />
      </Pressable>
      {aoExcluir && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${doc.titulo}`}
          onPress={aoExcluir}
          hitSlop={4}
          style={({ pressed }) => [styles.excluir, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="trash-outline" size={20} color={colors.oliva} />
          <Text style={styles.excluirTexto}>Excluir</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { backgroundColor: colors.papelClaro, borderRadius: radius.grande, ...elevacao.card, overflow: 'hidden' },
  toque: { flexDirection: 'row', alignItems: 'center', gap: space.s2, paddingHorizontal: space.s3, paddingVertical: space.s2, minHeight: 88 },
  textos: { flex: 1, gap: space.s1 },
  titulo: { fontFamily: fonts.subtitulo, fontSize: 19, lineHeight: 24, color: colors.carvao },
  data: { fontFamily: fonts.texto, fontSize: 16, color: colors.oliva },
  excluir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    alignSelf: 'flex-end',
    minHeight: 48,
    paddingHorizontal: space.s2,
    marginRight: space.s1,
    marginBottom: space.s1,
  },
  excluirTexto: { fontFamily: fonts.botao, fontSize: 16, color: colors.oliva },
});
