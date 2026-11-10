import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Botao } from '../components/Botao';
import { CartaoDocumento } from '../components/CartaoDocumento';
import { TopoApp } from '../components/TopoApp';
import { EstadoVazio, Tela } from '../components/ui';
import { useAviso } from '../context/AvisoContext';
import { useDados } from '../context/DadosContext';
import { TelaAba } from '../navigation/tipos';
import { colors, fonts, radius, space, type, TOQUE_MIN } from '../theme';
import { DocumentoExplicado } from '../types';

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function DocumentosScreen({ navigation }: TelaAba<'Documentos'>) {
  const { documentos, excluirDocumento, restaurarDocumento } = useDados();
  const { avisar } = useAviso();
  const [busca, setBusca] = useState('');

  const lista = useMemo(() => {
    const q = semAcento(busca.trim());
    if (!q) return documentos;
    return documentos.filter((d) => semAcento(`${d.titulo} ${d.nomeOficial} ${d.resumo}`).includes(q));
  }, [busca, documentos]);

  const confirmarExclusao = (d: DocumentoExplicado) =>
    Alert.alert(
      'Excluir este documento?',
      `“${d.titulo}” e a explicação vão sair do seu celular. As dúvidas anotadas continuam em Dúvidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const removido = excluirDocumento(d.id);
            if (removido)
              avisar({
                texto: 'Documento excluído.',
                acao: { rotulo: 'Desfazer', executar: () => restaurarDocumento(removido) },
              });
          },
        },
      ],
    );

  return (
    <Tela cabecalho={<TopoApp />}>
      <View style={{ gap: space.s1 }}>
        <Text style={type.tituloTela} accessibilityRole="header">
          Meus documentos
        </Text>
        <Text style={type.auxiliar}>
          {documentos.length === 0
            ? 'Os documentos que você fotografar ficam guardados aqui.'
            : `${documentos.length} ${documentos.length === 1 ? 'documento salvo' : 'documentos salvos'} neste celular.`}
        </Text>
      </View>

      {documentos.length > 0 && (
        <View style={{ gap: space.s1 }}>
          <Text style={styles.rotulo}>Buscar documento</Text>
          <View style={styles.busca}>
            <Ionicons name="search" size={22} color={colors.oliva} />
            <TextInput
              accessibilityLabel="Buscar documento"
              value={busca}
              onChangeText={setBusca}
              placeholder="Ex.: banco, imposto, CAR"
              placeholderTextColor={colors.oliva}
              style={styles.buscaCampo}
              returnKeyType="search"
            />
            {busca.length > 0 && (
              <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setBusca('')} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color={colors.oliva} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {documentos.length === 0 ? (
        <EstadoVazio
          icone="folder-open-outline"
          titulo="Nenhum documento ainda"
          texto="Fotografe um documento e a explicação fica salva aqui, mesmo sem internet."
        >
          <Botao variante="destaque" icone="camera" rotulo="Fotografar documento" onPress={() => navigation.navigate('Fotografar')} />
        </EstadoVazio>
      ) : lista.length === 0 ? (
        <EstadoVazio icone="search" titulo="Nada encontrado" texto={`Não achamos documentos com “${busca}”. Tente outra palavra.`} />
      ) : (
        <View style={{ gap: space.s2 }}>
          {lista.map((d) => (
            <CartaoDocumento
              key={d.id}
              doc={d}
              aoAbrir={() => navigation.navigate('Explicacao', { id: d.id })}
              aoExcluir={() => confirmarExclusao(d)}
            />
          ))}
        </View>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  rotulo: { fontFamily: fonts.subtitulo, fontSize: 18, color: colors.carvao },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    minHeight: TOQUE_MIN,
    paddingHorizontal: space.s2,
    borderRadius: radius.pilula,
    borderWidth: 2,
    borderColor: colors.linha,
    backgroundColor: colors.papelClaro,
  },
  buscaCampo: { flex: 1, fontFamily: fonts.texto, fontSize: 18, color: colors.carvao, paddingVertical: space.s1 },
});
