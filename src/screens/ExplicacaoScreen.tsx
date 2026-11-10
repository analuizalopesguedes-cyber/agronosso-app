import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { BotaoOuvir } from '../components/BotaoOuvir';
import { Cabecalho, CampoTexto, Cartao, EstadoVazio, formatarData, IconeRedondo, Secao, SeloAtencao, Tela } from '../components/ui';
import { useAviso } from '../context/AvisoContext';
import { useDados } from '../context/DadosContext';
import { useFala } from '../context/FalaContext';
import { TelaRaiz } from '../navigation/tipos';
import { colors, fonts, radius, space, type } from '../theme';
import { DocumentoExplicado, PontoImportante } from '../types';

const ICONE_PONTO: Record<PontoImportante['tipo'], keyof typeof Ionicons.glyphMap> = {
  prazo: 'calendar',
  valor: 'cash',
  obrigacao: 'clipboard',
  direito: 'shield-checkmark',
};

function textoCompleto(d: DocumentoExplicado) {
  return [
    `${d.titulo}.`,
    `Em poucas palavras: ${d.resumo}`,
    `O que é este documento: ${d.oQueE}`,
    `O que é importante: ${d.pontos.map((p) => `${p.titulo}: ${p.texto}`).join(' ')}`,
    `Confira com atenção: ${d.atencao.join(' ')}`,
    `Quando buscar ajuda: ${d.buscarAjuda.quando.join(' ')}`,
  ].join(' ');
}

function textoParaCompartilhar(d: DocumentoExplicado) {
  return [
    `${d.titulo}`,
    `(No papel: ${d.nomeOficial})`,
    '',
    `Em poucas palavras: ${d.resumo}`,
    '',
    'O que é importante:',
    ...d.pontos.map((p) => `• ${p.titulo}: ${p.texto}`),
    '',
    'Confira com atenção:',
    ...d.atencao.map((a) => `• ${a}`),
    '',
    'Quem pode ajudar:',
    ...d.buscarAjuda.quem.map((q) => `• ${q.nome} – ${q.porque}`),
    '',
    'Explicação feita pelo AgroNosso. Não substitui a orientação de um profissional.',
  ].join('\n');
}

export function ExplicacaoScreen({ navigation, route }: TelaRaiz<'Explicacao'>) {
  const { documentos, guardarDuvida, duvidaGuardada } = useDados();
  const { avisar } = useAviso();
  const { parar } = useFala();
  const [novaDuvida, setNovaDuvida] = useState('');
  const doc = documentos.find((d) => d.id === route.params.id);

  useEffect(() => () => parar(), [parar]); // para o áudio ao sair da tela

  const voltar = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Abas', { screen: 'Inicio' }));

  if (!doc) {
    return (
      <Tela cabecalho={<Cabecalho aoVoltar={voltar} />}>
        <EstadoVazio icone="document-text-outline" titulo="Documento não encontrado" texto="Ele pode ter sido excluído.">
          <Botao rotulo="Ir para o início" onPress={() => navigation.navigate('Abas', { screen: 'Inicio' })} />
        </EstadoVazio>
      </Tela>
    );
  }

  const compartilhar = () => Share.share({ message: textoParaCompartilhar(doc) }).catch(() => {});

  const guardar = (texto: string) => {
    guardarDuvida(texto, doc);
    avisar({ texto: 'Dúvida guardada em Dúvidas.' });
  };

  return (
    <Tela
      cabecalho={
        <Cabecalho
          aoVoltar={voltar}
          direita={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartilhar explicação"
              onPress={compartilhar}
              hitSlop={8}
              style={styles.iconeBotao}
            >
              <Ionicons name="share-social" size={24} color={colors.verde} />
            </Pressable>
          }
        />
      }
    >
      {doc.demonstracao && (
        <View style={styles.demo}>
          <Ionicons name="flask" size={20} color={colors.carvao} />
          <Text style={styles.demoTexto}>Exemplo de demonstração. Os dados são fictícios.</Text>
        </View>
      )}

      <View style={{ gap: space.s1 }}>
        <SeloAtencao nivel={doc.nivelAtencao} />
        <Text style={type.tituloTela} accessibilityRole="header">
          {doc.titulo}
        </Text>
        <Text style={type.auxiliar}>No papel está escrito: {doc.nomeOficial}</Text>
        <Text style={type.auxiliar}>Lido em {formatarData(doc.criadoEm)}</Text>
      </View>

      {/* Ponto focal: o resumo + ouvir */}
      <Cartao>
        <Text style={type.tituloSecao}>Em poucas palavras</Text>
        <Text style={type.leitura}>{doc.resumo}</Text>
        <BotaoOuvir id={`tudo-${doc.id}`} texto={textoCompleto(doc)} rotulo="Ouvir explicação completa" grande />
      </Cartao>

      <Secao titulo="O que é importante" icone="star" abertaInicial>
        {doc.pontos.map((p) => (
          <View key={p.titulo} style={styles.ponto}>
            <IconeRedondo nome={ICONE_PONTO[p.tipo]} />
            <View style={{ flex: 1, gap: space.s1 }}>
              <Text style={type.subtitulo}>{p.titulo}</Text>
              <Text style={type.leitura}>{p.texto}</Text>
            </View>
          </View>
        ))}
        <BotaoOuvir
          id={`pontos-${doc.id}`}
          texto={doc.pontos.map((p) => `${p.titulo}: ${p.texto}`).join(' ')}
        />
      </Secao>

      <Secao titulo="O que é este documento" icone="document-text">
        <Text style={type.leitura}>{doc.oQueE}</Text>
        <BotaoOuvir id={`oque-${doc.id}`} texto={doc.oQueE} />
      </Secao>

      <Secao titulo="Palavras difíceis" icone="book">
        {doc.palavras.map((p) => (
          <View key={p.termo} style={styles.palavra}>
            <Text style={styles.termo}>{p.termo}</Text>
            <Text style={type.leitura}>{p.significado}</Text>
          </View>
        ))}
        <BotaoOuvir id={`palavras-${doc.id}`} texto={doc.palavras.map((p) => `${p.termo}: ${p.significado}`).join(' ')} />
      </Secao>

      <Secao titulo="Confira com atenção" icone="eye">
        {doc.atencao.map((a) => (
          <View key={a} style={styles.item}>
            <View style={styles.iconeLinha}><Ionicons name="alert-circle" size={22} color={colors.oliva} /></View>
            <Text style={[type.leitura, { flex: 1 }]}>{a}</Text>
          </View>
        ))}
        <BotaoOuvir id={`atencao-${doc.id}`} texto={doc.atencao.join(' ')} />
      </Secao>

      <Secao titulo="Dúvidas que você pode ter" icone="help-circle">
        <Text style={type.auxiliar}>Guarde as perguntas para fazer ao banco, ao técnico ou ao advogado.</Text>
        {doc.perguntas.map((p) => {
          const guardada = duvidaGuardada(p, doc.id);
          return (
            <View key={p} style={styles.pergunta}>
              <Text style={[type.leitura, { flex: 1 }]}>{p}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={guardada ? `Dúvida já guardada: ${p}` : `Guardar dúvida: ${p}`}
                accessibilityState={{ disabled: guardada }}
                disabled={guardada}
                onPress={() => guardar(p)}
                style={({ pressed }) => [styles.guardar, guardada && styles.guardada, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name={guardada ? 'checkmark' : 'bookmark-outline'} size={20} color={guardada ? colors.papel : colors.verde} />
                <Text style={[styles.guardarTexto, guardada && { color: colors.papel }]}>
                  {guardada ? 'Guardada' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          );
        })}
        <CampoTexto
          rotulo="Tem outra dúvida?"
          ajuda="Escreva do seu jeito."
          value={novaDuvida}
          onChangeText={setNovaDuvida}
          placeholder="Ex.: Posso pagar em parcelas?"
          multiline
          returnKeyType="done"
        />
        <Botao
          variante="secundario"
          icone="bookmark"
          rotulo="Guardar minha dúvida"
          desabilitado={!novaDuvida.trim()}
          onPress={() => {
            guardar(novaDuvida);
            setNovaDuvida('');
          }}
        />
      </Secao>

      {/* Quando buscar orientação especializada */}
      <Cartao escuro>
        <View style={styles.linha}>
          <Ionicons name="people" size={28} color={colors.papel} />
          <Text style={[type.tituloSecao, { color: colors.papel, flex: 1 }]}>Quando buscar ajuda especializada</Text>
        </View>
        {doc.buscarAjuda.quando.map((q) => (
          <View key={q} style={styles.item}>
            <View style={styles.iconeLinha}><Ionicons name="arrow-forward-circle" size={22} color={colors.papel} /></View>
            <Text style={[type.leitura, { color: colors.papel, flex: 1 }]}>{q}</Text>
          </View>
        ))}
        <Text style={[type.subtitulo, { color: colors.papel, marginTop: space.s2 }]}>Quem pode ajudar</Text>
        {doc.buscarAjuda.quem.map((q) => (
          <View key={q.nome} style={styles.especialista}>
            <Text style={[styles.especialistaNome]}>{q.nome}</Text>
            <Text style={[type.corpo, { color: colors.papel }]}>{q.porque}</Text>
          </View>
        ))}
        <BotaoOuvir
          id={`ajuda-${doc.id}`}
          invertido
          texto={`Quando buscar ajuda: ${doc.buscarAjuda.quando.join(' ')} Quem pode ajudar: ${doc.buscarAjuda.quem
            .map((q) => `${q.nome}. ${q.porque}`)
            .join(' ')}`}
        />
      </Cartao>

      <Secao titulo="Ver o texto original" icone="reader">
        <Text style={[type.corpo, styles.original]}>{doc.textoOriginal}</Text>
      </Secao>

      <Botao variante="primario" icone="share-social" rotulo="Enviar para alguém de confiança" onPress={compartilhar} />

      <View style={styles.aviso}>
        <Ionicons name="information-circle" size={22} color={colors.oliva} />
        <Text style={[type.auxiliar, { flex: 1 }]}>
          O AgroNosso ajuda você a entender o documento, mas não substitui a orientação de um profissional.
        </Text>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  iconeBotao: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    paddingVertical: space.s2,
    paddingHorizontal: space.s3,
    borderRadius: radius.medio,
    backgroundColor: colors.olivaSuave,
  },
  demoTexto: { flex: 1, fontFamily: fonts.texto, fontSize: 16, color: colors.carvao },
  ponto: { flexDirection: 'row', gap: space.s2, alignItems: 'flex-start' },
  palavra: { gap: space.s1, paddingBottom: space.s2, borderBottomWidth: 1, borderBottomColor: colors.linha },
  termo: { fontFamily: fonts.subtitulo, fontSize: 19, color: colors.verde },
  item: { flexDirection: 'row', gap: space.s1, alignItems: 'flex-start' },
  iconeLinha: { height: 28, justifyContent: 'center' }, // mesma altura da linha de leitura (28)
  linha: { flexDirection: 'row', alignItems: 'center', gap: space.s1 },
  pergunta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingVertical: space.s2,
    borderBottomWidth: 1,
    borderBottomColor: colors.linha,
  },
  guardar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    minHeight: 48,
    paddingHorizontal: space.s2,
    borderRadius: radius.pilula,
    borderWidth: 2,
    borderColor: colors.verde,
  },
  guardada: { backgroundColor: colors.verde },
  guardarTexto: { fontFamily: fonts.botao, fontSize: 16, color: colors.verde },
  especialista: {
    gap: space.s1,
    padding: space.s2,
    borderRadius: radius.medio,
    backgroundColor: 'rgba(244, 239, 228, 0.10)',
  },
  especialistaNome: { fontFamily: fonts.subtitulo, fontSize: 18, lineHeight: 24, color: colors.papel },
  original: { fontStyle: 'normal', color: colors.carvao },
  aviso: { flexDirection: 'row', gap: space.s1, alignItems: 'flex-start' },
});
