import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao, Etapas, IconeRedondo, Tela } from '../components/ui';
import { useAviso } from '../context/AvisoContext';
import { useDados } from '../context/DadosContext';
import { useConexao } from '../hooks/useConexao';
import { TelaRaiz } from '../navigation/tipos';
import { ErroLeitura, explicarDocumento, MENSAGENS_ERRO, modoDemonstracao, TipoErro } from '../services/explicador';
import { colors, fonts, space, type } from '../theme';
import { EtapaLeitura } from '../types';

const ETAPAS: { chave: EtapaLeitura; texto: string }[] = [
  { chave: 'lendo', texto: 'Lendo as letras do documento' },
  { chave: 'simplificando', texto: 'Trocando palavras difíceis por simples' },
  { chave: 'preparando', texto: 'Separando prazos, valores e dúvidas' },
];

/** Tarefa demorada: mostra cada etapa e permite cancelar (Nielsen 1 e 3). */
export function LendoScreen({ navigation, route }: TelaRaiz<'Lendo'>) {
  const { imagemUri, exemploChave } = route.params;
  const { salvarDocumento } = useDados();
  const { avisar } = useAviso();
  const online = useConexao();
  const [etapa, setEtapa] = useState<EtapaLeitura>('lendo');
  const [erro, setErro] = useState<TipoErro | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const controle = useRef<AbortController | null>(null);
  const pulso = useRef(new Animated.Value(1)).current;

  // Animação suave, respeitando "reduzir movimento"
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduzir) => {
      if (reduzir) return;
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulso, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(pulso, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      );
      anim.start();
    });
    return () => anim?.stop();
  }, [pulso]);

  const iniciar = useCallback(async () => {
    setErro(null);
    setEtapa('lendo');
    if (!online && !modoDemonstracao && !exemploChave) {
      setErro('sem-internet');
      return;
    }
    const c = new AbortController();
    controle.current = c;
    try {
      const doc = await explicarDocumento({ imagemUri, exemploChave }, setEtapa, c.signal);
      if (c.signal.aborted) return;
      salvarDocumento(doc);
      avisar({ texto: 'Pronto! O documento foi salvo em Documentos.' });
      navigation.replace('Explicacao', { id: doc.id });
    } catch (e) {
      if (c.signal.aborted) return;
      setErro(e instanceof ErroLeitura ? e.tipo : 'servidor');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagemUri, exemploChave, tentativa]);

  useEffect(() => {
    iniciar();
    return () => controle.current?.abort();
  }, [iniciar]);

  useEffect(() => {
    const t = ETAPAS.find((e) => e.chave === etapa)?.texto;
    if (t && !erro) AccessibilityInfo.announceForAccessibility(t);
  }, [etapa, erro]);

  const cancelar = () => {
    controle.current?.abort();
    navigation.goBack();
  };

  const indice = ETAPAS.findIndex((e) => e.chave === etapa);

  if (erro) {
    const m = MENSAGENS_ERRO[erro];
    return (
      <Tela
        rodape={
          <>
            <Botao variante="destaque" icone="refresh" rotulo="Tentar de novo" onPress={() => setTentativa((n) => n + 1)} />
            <Botao
              variante="secundario"
              icone="camera"
              rotulo="Tirar outra foto"
              onPress={() => navigation.replace('Fotografar')}
            />
            <Botao
              variante="texto"
              rotulo="Voltar ao início"
              onPress={() => navigation.navigate('Abas', { screen: 'Inicio' })}
            />
          </>
        }
      >
        <View style={styles.centro} accessibilityRole="alert">
          <IconeRedondo nome={erro === 'sem-internet' ? 'cloud-offline' : 'alert-circle'} tamanho={48} />
          <Text style={[type.tituloTela, styles.textoCentro]}>{m.titulo}</Text>
          <Text style={[type.leitura, styles.textoCentro]}>{m.texto}</Text>
        </View>
      </Tela>
    );
  }

  return (
    <Tela rodape={<Botao variante="secundario" icone="close" rotulo="Cancelar" onPress={cancelar} />}>
      <Etapas atual={1} passos={['Fotografar', 'Ler', 'Explicar']} />

      <View style={styles.centro}>
        <Animated.View style={{ transform: [{ scale: pulso }] }}>
          <IconeRedondo nome="document-text" tamanho={56} cor={colors.verde} fundo={colors.verdeSuave} />
        </Animated.View>
        <Text style={[type.tituloTela, styles.textoCentro]} accessibilityRole="header">
          Lendo seu documento…
        </Text>
        <Text style={[type.leitura, styles.textoCentro]}>Isso pode levar alguns segundos. Pode deixar o celular parado.</Text>
      </View>

      <Cartao>
        {ETAPAS.map((e, i) => {
          const feito = i < indice;
          const ativo = i === indice;
          return (
            <View key={e.chave} style={styles.etapa}>
              <View style={styles.etapaIcone}>
                {feito ? (
                  <Ionicons name="checkmark-circle" size={28} color={colors.verde} />
                ) : ativo ? (
                  <ActivityIndicator color={colors.verde} />
                ) : (
                  <Ionicons name="ellipse-outline" size={28} color={colors.oliva} />
                )}
              </View>
              <Text style={[styles.etapaTexto, ativo && styles.etapaAtiva, feito && { color: colors.carvao }]}>
                {e.texto}
                {feito ? ' — feito' : ativo ? ' — agora' : ''}
              </Text>
            </View>
          );
        })}
      </Cartao>

      {(modoDemonstracao || exemploChave) && (
        <Text style={[type.auxiliar, styles.textoCentro]}>
          Modo demonstração: a explicação usa um documento de exemplo.
        </Text>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', gap: space.s2, paddingVertical: space.s3 },
  textoCentro: { textAlign: 'center' },
  etapa: { flexDirection: 'row', alignItems: 'center', gap: space.s2, minHeight: 48 },
  etapaIcone: { width: 32, alignItems: 'center' },
  etapaTexto: { flex: 1, fontFamily: fonts.texto, fontSize: 16, lineHeight: 22, color: colors.oliva },
  etapaAtiva: { fontFamily: fonts.botao, color: colors.verde },
});
