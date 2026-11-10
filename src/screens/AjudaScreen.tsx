import React from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { BotaoOuvir } from '../components/BotaoOuvir';
import { TopoApp } from '../components/TopoApp';
import { Cartao, IconeRedondo, Secao, Tela } from '../components/ui';
import { TelaAba } from '../navigation/tipos';
import { colors, space, type } from '../theme';

const PERGUNTAS: { icone: any; pergunta: string; resposta: string }[] = [
  {
    icone: 'camera',
    pergunta: 'Como tirar uma boa foto do documento?',
    resposta:
      'Coloque o papel em uma mesa, em lugar com boa luz. Deixe a folha inteira aparecendo e segure o celular parado. Fotografe uma página por vez.',
  },
  {
    icone: 'volume-high',
    pergunta: 'Como ouvir a explicação?',
    resposta:
      'Toque no botão com o desenho de alto-falante. Para parar, toque de novo. Cada parte da explicação tem seu próprio botão de ouvir.',
  },
  {
    icone: 'people',
    pergunta: 'O AgroNosso substitui um técnico ou advogado?',
    resposta:
      'Não. O AgroNosso ajuda você a entender o documento e a anotar suas dúvidas. Para decidir, assinar ou contestar, converse com um profissional.',
  },
  {
    icone: 'lock-closed',
    pergunta: 'Onde ficam meus documentos?',
    resposta:
      'Ficam guardados no seu celular. Você pode ver os documentos salvos mesmo sem internet e pode excluir quando quiser.',
  },
  {
    icone: 'share-social',
    pergunta: 'Posso mostrar a explicação para alguém da família?',
    resposta:
      'Pode. Na explicação, toque em “Enviar para alguém de confiança” e escolha por onde mandar, como o WhatsApp.',
  },
];

const QUEM_AJUDA = [
  { icone: 'leaf', nome: 'Técnico da assistência rural (Emater ou ATER)', texto: 'Projetos de safra, crédito, CAR e seguro.' },
  { icone: 'home', nome: 'Sindicato rural ou cooperativa', texto: 'Acompanha você no banco e em renegociações.' },
  { icone: 'calculator', nome: 'Contador', texto: 'Impostos, como o ITR, e declarações.' },
  { icone: 'shield-checkmark', nome: 'Defensoria Pública ou advogado', texto: 'Cobranças, contratos e risco de perder bens.' },
] as const;

export function AjudaScreen({ navigation }: TelaAba<'Ajuda'>) {
  return (
    <Tela cabecalho={<TopoApp />}>
      <View style={{ gap: space.s1 }}>
        <Text style={type.tituloTela} accessibilityRole="header">
          Ajuda
        </Text>
        <Text style={type.corpo}>Respostas rápidas para as dúvidas mais comuns.</Text>
      </View>

      <View style={{ gap: space.s2 }}>
        {PERGUNTAS.map((p) => (
          <Secao key={p.pergunta} titulo={p.pergunta} icone={p.icone}>
            <Text style={type.leitura}>{p.resposta}</Text>
            <BotaoOuvir id={`ajuda-${p.pergunta}`} texto={`${p.pergunta} ${p.resposta}`} />
          </Secao>
        ))}
      </View>

      <Cartao>
        <Text style={type.tituloSecao} accessibilityRole="header">
          Quem pode orientar você
        </Text>
        {QUEM_AJUDA.map((q) => (
          <View key={q.nome} style={styles.quem}>
            <IconeRedondo nome={q.icone} />
            <View style={{ flex: 1, gap: space.s1 }}>
              <Text style={type.subtitulo}>{q.nome}</Text>
              <Text style={type.corpo}>{q.texto}</Text>
            </View>
          </View>
        ))}
        <BotaoOuvir id="quem-ajuda" texto={QUEM_AJUDA.map((q) => `${q.nome}: ${q.texto}`).join(' ')} />
      </Cartao>

      <View style={{ gap: space.s2 }}>
        <Botao
          variante="secundario"
          icone="share-social"
          rotulo="Indicar o AgroNosso para alguém"
          onPress={() =>
            Share.share({
              message: 'Conheça o AgroNosso: um aplicativo que explica documentos do campo em palavras simples.',
            }).catch(() => {})
          }
        />
        <Botao
          variante="texto"
          icone="play-circle"
          rotulo="Ver as boas-vindas de novo"
          onPress={() => navigation.navigate('BoasVindas')}
        />
      </View>
      <Text style={[type.auxiliar, { textAlign: 'center', color: colors.oliva }]}>
        AgroNosso · tecnologia feita para quem vive no campo
      </Text>
    </Tela>
  );
}

const styles = StyleSheet.create({
  quem: { flexDirection: 'row', alignItems: 'flex-start', gap: space.s2 },
});
