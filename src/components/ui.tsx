import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConexao } from '../hooks/useConexao';
import { colors, elevacao, fonts, radius, space, type, TOQUE_MIN } from '../theme';
import { NivelAtencao } from '../types';

type IconeNome = keyof typeof Ionicons.glyphMap;

/* ------------------------------------------------------------------ */
/* Tela: fundo Papel, área segura e rolagem                            */
/* ------------------------------------------------------------------ */
export function Tela({
  children,
  rolar = true,
  rodape,
  cabecalho,
}: {
  children: React.ReactNode;
  rolar?: boolean;
  rodape?: React.ReactNode;
  cabecalho?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.tela} edges={['top', 'left', 'right']}>
      {cabecalho}
      <AvisoConexao />
      {rolar ? (
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.conteudo, { flex: 1 }]}>{children}</View>
      )}
      {rodape && <View style={[styles.rodape, { paddingBottom: space.s3 + insets.bottom }]}>{rodape}</View>}
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Cabeçalho de telas internas: Voltar sempre visível (Nielsen 3)       */
/* ------------------------------------------------------------------ */
export function Cabecalho({
  titulo,
  aoVoltar,
  rotuloVoltar = 'Voltar',
  direita,
}: {
  titulo?: string;
  aoVoltar?: () => void;
  rotuloVoltar?: string;
  direita?: React.ReactNode;
}) {
  return (
    <View style={styles.cabecalho}>
      {aoVoltar ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rotuloVoltar}
          onPress={aoVoltar}
          hitSlop={8}
          style={styles.voltar}
        >
          <Ionicons name="arrow-back" size={24} color={colors.verde} />
          <Text style={styles.voltarTexto}>{rotuloVoltar}</Text>
        </Pressable>
      ) : (
        <View />
      )}
      {titulo ? (
        <Text style={styles.cabecalhoTitulo} numberOfLines={1} accessibilityRole="header">
          {titulo}
        </Text>
      ) : null}
      <View style={styles.cabecalhoDireita}>{direita}</View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Aviso de conexão (status do sistema)                                */
/* ------------------------------------------------------------------ */
export function AvisoConexao() {
  const online = useConexao();
  if (online) return null;
  return (
    <View style={styles.offline} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Ionicons name="cloud-offline" size={22} color={colors.papel} />
      <Text style={styles.offlineTexto}>Sem internet. Seus documentos salvos continuam aqui.</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Cartão: região comum para agrupar conteúdo relacionado              */
/* ------------------------------------------------------------------ */
export function Cartao({ children, estilo, escuro }: { children: React.ReactNode; estilo?: ViewStyle; escuro?: boolean }) {
  return <View style={[styles.cartao, escuro && styles.cartaoEscuro, estilo]}>{children}</View>;
}

/* ------------------------------------------------------------------ */
/* Ícone em círculo (Oliva escuro sobre fundo suave)                    */
/* ------------------------------------------------------------------ */
export function IconeRedondo({ nome, tamanho = 24, cor = colors.oliva, fundo = colors.olivaSuave }: {
  nome: IconeNome;
  tamanho?: number;
  cor?: string;
  fundo?: string;
}) {
  const d = tamanho + 24;
  return (
    <View
      style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: fundo, alignItems: 'center', justifyContent: 'center' }}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <Ionicons name={nome} size={tamanho} color={cor} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Selo de nível de atenção: ícone + texto, nunca só cor               */
/* ------------------------------------------------------------------ */
const NIVEIS: Record<NivelAtencao, { rotulo: string; icone: IconeNome; fundo: string; cor: string }> = {
  baixo: { rotulo: 'Pouca atenção', icone: 'checkmark-circle', fundo: colors.verdeSuave, cor: colors.carvao },
  medio: { rotulo: 'Atenção', icone: 'alert-circle', fundo: colors.olivaSuave, cor: colors.carvao },
  alto: { rotulo: 'Muita atenção', icone: 'warning', fundo: colors.acafraoSuave, cor: colors.carvao },
};

export function SeloAtencao({ nivel }: { nivel: NivelAtencao }) {
  const n = NIVEIS[nivel];
  return (
    <View style={[styles.selo, { backgroundColor: n.fundo }]} accessibilityLabel={`Nível: ${n.rotulo}`}>
      <Ionicons name={n.icone} size={18} color={n.cor} />
      <Text style={[styles.seloTexto, { color: n.cor }]}>{n.rotulo}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Etapas do fluxo (conexão entre elementos + onde estou)              */
/* ------------------------------------------------------------------ */
export function Etapas({ atual, passos }: { atual: number; passos: string[] }) {
  return (
    <View
      style={styles.etapas}
      accessibilityRole="progressbar"
      accessibilityLabel={`Passo ${atual + 1} de ${passos.length}: ${passos[atual]}`}
    >
      {passos.map((p, i) => {
        const feito = i < atual;
        const ativo = i === atual;
        return (
          <React.Fragment key={p}>
            <View style={styles.etapa}>
              <View style={[styles.etapaBola, (feito || ativo) && styles.etapaBolaAtiva]}>
                {feito ? (
                  <Ionicons name="checkmark" size={18} color={colors.papel} />
                ) : (
                  <Text style={[styles.etapaNum, ativo && { color: colors.papel }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.etapaTexto, ativo && styles.etapaTextoAtivo]}>{p}</Text>
            </View>
            {i < passos.length - 1 && <View style={[styles.etapaLinha, feito && styles.etapaLinhaFeita]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Seção expansível (divulgação progressiva, Nielsen 8)                */
/* ------------------------------------------------------------------ */
export function Secao({
  titulo,
  icone,
  children,
  abertaInicial = false,
  acao,
}: {
  titulo: string;
  icone: IconeNome;
  children: React.ReactNode;
  abertaInicial?: boolean;
  acao?: React.ReactNode;
}) {
  const [aberta, setAberta] = useState(abertaInicial);
  return (
    <Cartao estilo={{ padding: 0 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: aberta }}
        accessibilityLabel={titulo}
        accessibilityHint={aberta ? 'Toque para fechar' : 'Toque para abrir'}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setAberta((a) => !a);
        }}
        style={styles.secaoTopo}
      >
        <IconeRedondo nome={icone} />
        <Text style={styles.secaoTitulo}>{titulo}</Text>
        <Ionicons name={aberta ? 'chevron-up' : 'chevron-down'} size={24} color={colors.verde} />
      </Pressable>
      {aberta && (
        <View style={styles.secaoCorpo}>
          {acao}
          {children}
        </View>
      )}
    </Cartao>
  );
}

/* ------------------------------------------------------------------ */
/* Campo de texto com rótulo sempre visível (Nielsen 6)                */
/* ------------------------------------------------------------------ */
export function CampoTexto({ rotulo, ajuda, ...props }: TextInputProps & { rotulo: string; ajuda?: string }) {
  const [foco, setFoco] = useState(false);
  return (
    <View style={{ gap: space.s1 }}>
      <Text style={styles.campoRotulo}>{rotulo}</Text>
      {ajuda && <Text style={type.auxiliar}>{ajuda}</Text>}
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={colors.oliva}
        onFocus={(e) => {
          setFoco(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFoco(false);
          props.onBlur?.(e);
        }}
        style={[styles.campo, foco && styles.campoFoco]}
        {...props}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Estado vazio                                                         */
/* ------------------------------------------------------------------ */
export function EstadoVazio({ icone, titulo, texto, children }: {
  icone: IconeNome;
  titulo: string;
  texto: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.vazio}>
      <IconeRedondo nome={icone} tamanho={40} />
      <Text style={[type.subtitulo, { textAlign: 'center' }]}>{titulo}</Text>
      <Text style={[type.corpo, { textAlign: 'center' }]}>{texto}</Text>
      {children}
    </View>
  );
}

export function formatarData(iso: string) {
  const d = new Date(iso);
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.papel },
  conteudo: { paddingHorizontal: space.s3, paddingTop: space.s2, paddingBottom: space.s6, gap: space.s4 },
  rodape: {
    paddingHorizontal: space.s3,
    paddingTop: space.s2,
    paddingBottom: space.s3,
    gap: space.s2,
    backgroundColor: colors.papel,
    borderTopWidth: 1,
    borderTopColor: colors.linha,
  },

  cabecalho: {
    minHeight: TOQUE_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.s2,
    gap: space.s1,
  },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: space.s1, minHeight: 48, paddingHorizontal: space.s1 },
  voltarTexto: { fontFamily: fonts.botao, fontSize: 16, color: colors.verde },
  cabecalhoTitulo: { flex: 1, textAlign: 'center', fontFamily: fonts.subtitulo, fontSize: 18, color: colors.carvao },
  cabecalhoDireita: { minWidth: 48, alignItems: 'flex-end' },

  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    backgroundColor: colors.carvao,
    paddingHorizontal: space.s3,
    paddingVertical: space.s1,
  },
  offlineTexto: { flex: 1, color: colors.papel, fontFamily: fonts.texto, fontSize: 16, lineHeight: 22 },

  cartao: {
    backgroundColor: colors.papelClaro,
    borderRadius: radius.grande,
    padding: space.s3,
    gap: space.s2,
    ...elevacao.card,
  },
  cartaoEscuro: { backgroundColor: colors.verde },

  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    alignSelf: 'flex-start',
    paddingHorizontal: space.s2,
    paddingVertical: space.s1,
    borderRadius: radius.pilula,
  },
  seloTexto: { fontFamily: fonts.botao, fontSize: 16 },

  etapas: { flexDirection: 'row', alignItems: 'flex-start' },
  etapa: { alignItems: 'center', gap: space.s1, width: 88 },
  etapaBola: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.verde,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.papel,
  },
  etapaBolaAtiva: { backgroundColor: colors.verde },
  etapaNum: { fontFamily: fonts.botao, fontSize: 16, color: colors.verde },
  etapaTexto: { fontFamily: fonts.texto, fontSize: 14, lineHeight: 18, color: colors.oliva, textAlign: 'center' },
  etapaTextoAtivo: { fontFamily: fonts.botao, color: colors.verde },
  etapaLinha: { flex: 1, height: 2, backgroundColor: colors.linha, marginTop: 19 },
  etapaLinhaFeita: { backgroundColor: colors.verde },

  secaoTopo: { flexDirection: 'row', alignItems: 'center', gap: space.s2, paddingHorizontal: space.s3, paddingVertical: space.s2, minHeight: 72 },
  secaoTitulo: { flex: 1, fontFamily: fonts.subtitulo, fontSize: 20, lineHeight: 26, color: colors.verde },
  secaoCorpo: { paddingHorizontal: space.s3, paddingBottom: space.s3, gap: space.s2 },

  campoRotulo: { fontFamily: fonts.subtitulo, fontSize: 18, color: colors.carvao },
  campo: {
    minHeight: TOQUE_MIN,
    borderWidth: 2,
    borderColor: colors.linha,
    borderRadius: radius.medio,
    paddingHorizontal: space.s2,
    paddingVertical: space.s1,
    fontFamily: fonts.texto,
    fontSize: 18,
    color: colors.carvao,
    backgroundColor: colors.papelClaro,
  },
  campoFoco: { borderColor: colors.verde },

  vazio: { alignItems: 'center', gap: space.s2, paddingVertical: space.s5, paddingHorizontal: space.s2 },
});
