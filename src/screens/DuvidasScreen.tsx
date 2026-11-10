import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { BotaoOuvir } from '../components/BotaoOuvir';
import { TopoApp } from '../components/TopoApp';
import { CampoTexto, Cartao, EstadoVazio, Tela } from '../components/ui';
import { useAviso } from '../context/AvisoContext';
import { useDados } from '../context/DadosContext';
import { TelaAba } from '../navigation/tipos';
import { colors, fonts, radius, space, type } from '../theme';
import { Duvida } from '../types';

/**
 * Lista de dúvidas para levar ao técnico, ao banco ou ao advogado.
 * Ajuda a identificar o que perguntar e a compartilhar com alguém de confiança.
 */
export function DuvidasScreen({ navigation }: TelaAba<'Duvidas'>) {
  const { duvidas, guardarDuvida, alternarDuvida, excluirDuvida, restaurarDuvida } = useDados();
  const { avisar } = useAviso();
  const [texto, setTexto] = useState('');

  const pendentes = duvidas.filter((d) => !d.resolvida);
  const resolvidas = duvidas.filter((d) => d.resolvida);

  const excluir = (d: Duvida) => {
    const removida = excluirDuvida(d.id);
    if (removida)
      avisar({ texto: 'Dúvida excluída.', acao: { rotulo: 'Desfazer', executar: () => restaurarDuvida(removida) } });
  };

  const compartilhar = () =>
    Share.share({
      message: [
        'Minhas dúvidas (anotadas no AgroNosso):',
        '',
        ...pendentes.map((d, i) => `${i + 1}. ${d.texto}${d.documentoTitulo ? ` (sobre: ${d.documentoTitulo})` : ''}`),
      ].join('\n'),
    }).catch(() => {});

  const Item = ({ d }: { d: Duvida }) => (
    <View style={styles.item}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: d.resolvida }}
        accessibilityLabel={`${d.texto}. ${d.resolvida ? 'Já respondida' : 'Para perguntar'}`}
        accessibilityHint={d.resolvida ? 'Toque para marcar como não respondida' : 'Toque para marcar como respondida'}
        onPress={() => alternarDuvida(d.id)}
        style={styles.itemToque}
      >
        <Ionicons
          name={d.resolvida ? 'checkmark-circle' : 'ellipse-outline'}
          size={30}
          color={d.resolvida ? colors.verde : colors.oliva}
        />
        <View style={{ flex: 1, gap: space.s1 }}>
          <Text style={[type.leitura, d.resolvida && styles.riscado]}>{d.texto}</Text>
          {d.documentoTitulo && <Text style={type.auxiliar}>Sobre: {d.documentoTitulo}</Text>}
          <Text style={styles.estado}>{d.resolvida ? 'Já respondida' : 'Para perguntar'}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Excluir dúvida: ${d.texto}`}
        onPress={() => excluir(d)}
        hitSlop={4}
        style={styles.excluir}
      >
        <Ionicons name="trash-outline" size={22} color={colors.oliva} />
      </Pressable>
    </View>
  );

  return (
    <Tela cabecalho={<TopoApp />}>
      <View style={{ gap: space.s1 }}>
        <Text style={type.tituloTela} accessibilityRole="header">
          Minhas dúvidas
        </Text>
        <Text style={type.corpo}>
          Anote o que você quer perguntar. Leve esta lista quando for falar com o técnico, o banco ou o advogado.
        </Text>
      </View>

      <Cartao>
        <CampoTexto
          rotulo="Nova dúvida"
          value={texto}
          onChangeText={setTexto}
          placeholder="Ex.: Posso pagar antes do prazo?"
          multiline
        />
        <Botao
          variante="primario"
          icone="add"
          rotulo="Guardar dúvida"
          desabilitado={!texto.trim()}
          onPress={() => {
            guardarDuvida(texto);
            setTexto('');
            avisar({ texto: 'Dúvida guardada.' });
          }}
        />
      </Cartao>

      {duvidas.length === 0 ? (
        <EstadoVazio
          icone="chatbubble-ellipses-outline"
          titulo="Nenhuma dúvida anotada"
          texto="Ao ler a explicação de um documento, toque em “Guardar” nas perguntas que quiser fazer."
        >
          <Botao variante="secundario" rotulo="Ver meus documentos" onPress={() => navigation.navigate('Documentos')} />
        </EstadoVazio>
      ) : (
        <>
          {pendentes.length > 0 && (
            <View style={{ gap: space.s2 }}>
              <Text style={type.tituloSecao} accessibilityRole="header">
                Para perguntar ({pendentes.length})
              </Text>
              {pendentes.map((d) => (
                <Item key={d.id} d={d} />
              ))}
              <View style={styles.acoes}>
                <BotaoOuvir
                  id="minhas-duvidas"
                  rotulo="Ouvir minhas dúvidas"
                  texto={pendentes.map((d, i) => `Dúvida ${i + 1}: ${d.texto}`).join('. ')}
                />
              </View>
              <Botao variante="secundario" icone="share-social" rotulo="Enviar para alguém de confiança" onPress={compartilhar} />
            </View>
          )}

          {resolvidas.length > 0 && (
            <View style={{ gap: space.s2 }}>
              <Text style={type.tituloSecao} accessibilityRole="header">
                Já respondidas ({resolvidas.length})
              </Text>
              {resolvidas.map((d) => (
                <Item key={d.id} d={d} />
              ))}
            </View>
          )}
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.papelClaro,
    borderRadius: radius.grande,
  },
  itemToque: {
    flex: 1,
    flexDirection: 'row',
    gap: space.s2,
    paddingVertical: space.s2,
    paddingLeft: space.s3,
    alignItems: 'flex-start',
  },
  riscado: { textDecorationLine: 'line-through', color: colors.oliva },
  estado: { fontFamily: fonts.botao, fontSize: 14, color: colors.oliva },
  excluir: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: space.s1, marginRight: space.s1 },
  acoes: { flexDirection: 'row' },
});
