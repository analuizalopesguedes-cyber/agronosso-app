import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { BotaoOuvir } from '../components/BotaoOuvir';
import { Cabecalho, Cartao, Etapas, IconeRedondo, Tela } from '../components/ui';
import { EXEMPLOS } from '../data/exemplos';
import { TelaRaiz } from '../navigation/tipos';
import { colors, fonts, radius, space, type } from '../theme';

const PASSOS_FLUXO = ['Fotografar', 'Ler', 'Explicar'];

const DICAS: { icone: keyof typeof Ionicons.glyphMap; texto: string }[] = [
  { icone: 'sunny', texto: 'Fique em um lugar com boa luz, sem sombra em cima do papel.' },
  { icone: 'scan', texto: 'Deixe a folha inteira aparecendo na foto.' },
  { icone: 'hand-left', texto: 'Segure o celular parado até a foto ficar nítida.' },
  { icone: 'copy', texto: 'Uma página por vez. Se tiver mais, fotografe depois.' },
];

const TEXTO_DICAS = 'Para a foto sair boa: ' + DICAS.map((d) => d.texto).join(' ');

export function FotografarScreen({ navigation }: TelaRaiz<'Fotografar'>) {
  const [foto, setFoto] = useState<string | null>(null);
  const [semPermissao, setSemPermissao] = useState<'camera' | 'galeria' | null>(null);

  const abrir = async (origem: 'camera' | 'galeria') => {
    setSemPermissao(null);
    const perm =
      origem === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setSemPermissao(origem);
      return;
    }
    const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, allowsEditing: true };
    const r = origem === 'camera' ? await ImagePicker.launchCameraAsync(opcoes) : await ImagePicker.launchImageLibraryAsync(opcoes);
    if (!r.canceled && r.assets?.[0]?.uri) setFoto(r.assets[0].uri);
  };

  return (
    <Tela
      cabecalho={<Cabecalho aoVoltar={() => navigation.goBack()} rotuloVoltar="Cancelar" titulo="Fotografar documento" />}
      rodape={
        foto ? (
          <>
            <Botao
              variante="destaque"
              icone="checkmark"
              rotulo="Usar esta foto"
              onPress={() => navigation.replace('Lendo', { imagemUri: foto })}
            />
            <Botao variante="secundario" icone="camera-reverse" rotulo="Tirar outra foto" onPress={() => abrir('camera')} />
          </>
        ) : (
          <>
            <Botao variante="destaque" icone="camera" rotulo="Abrir câmera" onPress={() => abrir('camera')} />
            <Botao variante="secundario" icone="images" rotulo="Escolher da galeria" onPress={() => abrir('galeria')} />
          </>
        )
      }
    >
      <Etapas atual={0} passos={PASSOS_FLUXO} />

      {semPermissao && (
        <Cartao estilo={styles.alerta}>
          <View style={styles.linha}>
            <Ionicons name="lock-closed" size={24} color={colors.carvao} />
            <Text style={[type.subtitulo, { flex: 1 }]}>
              {semPermissao === 'camera' ? 'Precisamos usar a câmera' : 'Precisamos ver suas fotos'}
            </Text>
          </View>
          <Text style={type.corpo}>
            Para continuar, permita o acesso nas configurações do celular. Depois é só voltar aqui.
          </Text>
          <Botao variante="secundario" icone="settings" rotulo="Abrir configurações" onPress={() => Linking.openSettings()} />
        </Cartao>
      )}

      {foto ? (
        <View style={{ gap: space.s2 }}>
          <Text style={type.tituloSecao} accessibilityRole="header">
            A foto ficou boa?
          </Text>
          <Image
            source={{ uri: foto }}
            style={styles.previa}
            resizeMode="contain"
            accessibilityLabel="Foto do documento que você tirou"
          />
          <Text style={type.corpo}>Confira se dá para ler as letras. Se estiver escura ou cortada, tire outra.</Text>
        </View>
      ) : (
        <>
          <Cartao>
            <View style={styles.linhaTitulo}>
              <Text style={[type.tituloSecao, { flex: 1 }]} accessibilityRole="header">
                Para a foto sair boa
              </Text>
            </View>
            <BotaoOuvir id="dicas-foto" texto={TEXTO_DICAS} rotulo="Ouvir dicas" />
            {DICAS.map((d) => (
              <View key={d.icone} style={styles.dica}>
                <IconeRedondo nome={d.icone} />
                <Text style={[type.corpo, { flex: 1 }]}>{d.texto}</Text>
              </View>
            ))}
          </Cartao>

          <View style={{ gap: space.s2 }}>
            <Text style={type.subtitulo}>Não está com o documento agora?</Text>
            <Text style={type.auxiliar}>Veja como funciona com um exemplo:</Text>
            {EXEMPLOS.map((e) => (
              <Pressable
                key={e.chave}
                accessibilityRole="button"
                accessibilityLabel={`Exemplo: ${e.descricaoCurta}`}
                onPress={() => navigation.replace('Lendo', { exemploChave: e.chave })}
                style={({ pressed }) => [styles.exemplo, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="document-text-outline" size={24} color={colors.oliva} />
                <Text style={styles.exemploTexto}>{e.descricaoCurta}</Text>
                <Ionicons name="chevron-forward" size={22} color={colors.verde} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  alerta: { backgroundColor: colors.acafraoSuave },
  linha: { flexDirection: 'row', alignItems: 'center', gap: space.s1 },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center' },
  dica: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  previa: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.grande,
    backgroundColor: colors.papelClaro,
    borderWidth: 1,
    borderColor: colors.linha,
  },
  exemplo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    minHeight: 56,
    paddingHorizontal: space.s2,
    borderRadius: radius.medio,
    backgroundColor: colors.papelClaro,
    borderWidth: 1,
    borderColor: colors.linha,
  },
  exemploTexto: { flex: 1, fontFamily: fonts.botao, fontSize: 16, color: colors.carvao },
});
