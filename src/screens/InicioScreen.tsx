import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { CartaoDocumento } from '../components/CartaoDocumento';
import { TopoApp } from '../components/TopoApp';
import { Cartao, IconeRedondo, Tela } from '../components/ui';
import { useDados } from '../context/DadosContext';
import { EXEMPLOS } from '../data/exemplos';
import { TelaAba } from '../navigation/tipos';
import { colors, fonts, radius, space, type } from '../theme';

export function InicioScreen({ navigation }: TelaAba<'Inicio'>) {
  const { documentos, duvidas } = useDados();
  const recentes = documentos.slice(0, 3);
  const pendentes = duvidas.filter((d) => !d.resolvida).length;

  return (
    <Tela cabecalho={<TopoApp />}>
      <Text style={type.tituloTela} accessibilityRole="header">
        Que documento você quer entender hoje?
      </Text>

      {/* Ponto focal único da tela: fotografar */}
      <Cartao escuro estilo={styles.heroi}>
        <View style={styles.passos} accessibilityLabel="Como funciona: fotografe, a gente lê e explica em palavras simples">
          {[
            { i: 'camera' as const, t: 'Fotografe' },
            { i: 'scan' as const, t: 'A gente lê' },
            { i: 'chatbubbles' as const, t: 'E explica' },
          ].map((p, n) => (
            <React.Fragment key={p.t}>
              <View style={styles.passo}>
                <IconeRedondo nome={p.i} cor={colors.papel} fundo="rgba(244, 239, 228, 0.14)" />
                <Text style={styles.passoTexto}>{p.t}</Text>
              </View>
              {n < 2 && <Ionicons name="arrow-forward" size={20} color={colors.papel} style={{ marginTop: space.s2 }} />}
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.heroiTexto}>
          Tire uma foto do documento. Em poucos segundos você recebe uma explicação em palavras simples.
        </Text>
        <Botao
          variante="destaque"
          icone="camera"
          rotulo="Fotografar documento"
          onPress={() => navigation.navigate('Fotografar')}
        />
      </Cartao>

      {pendentes > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Duvidas')}
          style={({ pressed }) => [styles.lembrete, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.carvao} />
          <Text style={styles.lembreteTexto}>
            Você tem {pendentes} {pendentes === 1 ? 'dúvida anotada' : 'dúvidas anotadas'} para perguntar.
          </Text>
          <Ionicons name="chevron-forward" size={22} color={colors.carvao} />
        </Pressable>
      )}

      <View style={styles.grupo}>
        <View style={styles.linhaTitulo}>
          <Text style={type.tituloSecao} accessibilityRole="header">
            Documentos recentes
          </Text>
          {documentos.length > 3 && (
            <Botao variante="texto" rotulo="Ver todos" onPress={() => navigation.navigate('Documentos')} />
          )}
        </View>

        {recentes.length > 0 ? (
          recentes.map((d) => (
            <CartaoDocumento key={d.id} doc={d} aoAbrir={() => navigation.navigate('Explicacao', { id: d.id })} />
          ))
        ) : (
          <Cartao>
            <Text style={type.subtitulo}>Ainda não tem nenhum documento aqui.</Text>
            <Text style={type.corpo}>Quer ver como funciona? Escolha um exemplo:</Text>
            {EXEMPLOS.map((e) => (
              <Pressable
                key={e.chave}
                accessibilityRole="button"
                accessibilityLabel={`Exemplo: ${e.descricaoCurta}`}
                onPress={() => navigation.navigate('Lendo', { exemploChave: e.chave })}
                style={({ pressed }) => [styles.exemplo, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="document-text-outline" size={24} color={colors.oliva} />
                <Text style={styles.exemploTexto}>{e.descricaoCurta}</Text>
                <Ionicons name="chevron-forward" size={22} color={colors.verde} />
              </Pressable>
            ))}
          </Cartao>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('Ajuda')}
        style={({ pressed }) => [styles.ajuda, pressed && { opacity: 0.85 }]}
      >
        <IconeRedondo nome="people" />
        <View style={{ flex: 1, gap: space.s1 }}>
          <Text style={type.subtitulo}>Quando procurar ajuda?</Text>
          <Text style={type.auxiliar}>Veja quem pode orientar você em cada caso.</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.verde} />
      </Pressable>
    </Tela>
  );
}

const styles = StyleSheet.create({
  heroi: { gap: space.s3 },
  passos: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  passo: { flex: 1, alignItems: 'center', gap: space.s1 },
  passoTexto: { fontFamily: fonts.texto, fontSize: 14, color: colors.papel, textAlign: 'center' },
  heroiTexto: { fontFamily: fonts.texto, fontSize: 18, lineHeight: 28, color: colors.papel },
  lembrete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingVertical: space.s2,
    paddingHorizontal: space.s3,
    minHeight: 64,
    borderRadius: radius.medio,
    backgroundColor: colors.olivaSuave,
  },
  lembreteTexto: { flex: 1, fontFamily: fonts.botao, fontSize: 16, lineHeight: 22, color: colors.carvao },
  grupo: { gap: space.s2 },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exemplo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    minHeight: 56,
    paddingHorizontal: space.s2,
    borderRadius: radius.medio,
    borderWidth: 1,
    borderColor: colors.linha,
  },
  exemploTexto: { flex: 1, fontFamily: fonts.botao, fontSize: 16, color: colors.carvao },
  ajuda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingVertical: space.s2,
    paddingHorizontal: space.s3,
    borderRadius: radius.grande,
    borderWidth: 1,
    borderColor: colors.linha,
  },
});
