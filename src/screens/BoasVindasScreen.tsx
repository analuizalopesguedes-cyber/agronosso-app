import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '../components/Botao';
import { BotaoOuvir } from '../components/BotaoOuvir';
import { Logo } from '../components/Logo';
import { IconeRedondo } from '../components/ui';
import { useFala } from '../context/FalaContext';
import { TelaRaiz } from '../navigation/tipos';
import { armazenamento } from '../services/armazenamento';
import { colors, space, type } from '../theme';

type Passo = { icone?: keyof typeof Ionicons.glyphMap; titulo: string; texto: string };

const PASSOS: Passo[] = [
  {
    titulo: 'Olá! Que bom ter você aqui.',
    texto: 'O AgroNosso ajuda você a entender documentos do dia a dia no campo, em palavras simples.',
  },
  {
    icone: 'camera',
    titulo: 'Fotografe o documento',
    texto: 'Contrato do banco, aviso de imposto, cadastro da terra. É só tirar uma foto.',
  },
  {
    icone: 'chatbubbles',
    titulo: 'Entenda o que importa',
    texto: 'A gente mostra prazos, valores e o que quer dizer cada palavra difícil. Você também pode ouvir.',
  },
  {
    icone: 'people',
    titulo: 'Saiba quando pedir ajuda',
    texto: 'Avisamos quando vale falar com um técnico, o sindicato, o banco ou um advogado.',
  },
];

/** Abertura com logo centralizado + boas-vindas curtas (ajuda e documentação). */
export function BoasVindasScreen({ navigation }: TelaRaiz<'BoasVindas'>) {
  const [i, setI] = useState(0);
  const { parar } = useFala();
  const passo = PASSOS[i];
  const ultimo = i === PASSOS.length - 1;

  const concluir = async () => {
    parar();
    await armazenamento.marcarBoasVindas();
    navigation.reset({ index: 0, routes: [{ name: 'Abas', params: { screen: 'Inicio' } }] });
  };

  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.topo}>
        {i > 0 ? (
          <Botao variante="texto" icone="arrow-back" rotulo="Voltar" onPress={() => { parar(); setI(i - 1); }} />
        ) : (
          <View />
        )}
        {!ultimo && <Botao variante="texto" rotulo="Pular" onPress={concluir} dica="Vai direto para o início" />}
      </View>

      <View style={styles.centro}>
        {passo.icone ? (
          <IconeRedondo nome={passo.icone} tamanho={56} cor={colors.verde} fundo={colors.verdeSuave} />
        ) : (
          <Logo largura={200} />
        )}
        <Text style={[type.tituloTela, styles.textoCentro]} accessibilityRole="header">
          {passo.titulo}
        </Text>
        <Text style={[type.leitura, styles.textoCentro]}>{passo.texto}</Text>
        <View style={{ alignSelf: 'center' }}>
          <BotaoOuvir id={`boas-vindas-${i}`} texto={`${passo.titulo} ${passo.texto}`} />
        </View>
      </View>

      <View style={styles.rodape}>
        <View
          style={styles.pontos}
          accessible
          accessibilityLabel={`Tela ${i + 1} de ${PASSOS.length}`}
        >
          {PASSOS.map((_, n) => (
            <View key={n} style={[styles.ponto, n === i && styles.pontoAtivo]} />
          ))}
        </View>
        <Text style={[type.auxiliar, styles.textoCentro]}>
          {i + 1} de {PASSOS.length}
        </Text>
        <Botao
          variante="destaque"
          rotulo={ultimo ? 'Começar' : 'Continuar'}
          icone={ultimo ? 'checkmark' : 'arrow-forward'}
          onPress={() => {
            parar();
            ultimo ? concluir() : setI(i + 1);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.papel },
  topo: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.s1, minHeight: 56 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.s3, gap: space.s3 },
  textoCentro: { textAlign: 'center', maxWidth: 420 },
  rodape: { paddingHorizontal: space.s3, paddingBottom: space.s3, gap: space.s2 },
  pontos: { flexDirection: 'row', justifyContent: 'center', gap: space.s1 },
  ponto: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.linha },
  pontoAtivo: { width: 32, backgroundColor: colors.verde },
});
