import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, elevacao, fonts, radius, space, TOQUE_MIN } from '../theme';

/**
 * Aviso curto na parte de baixo da tela: confirma ações ("Documento salvo")
 * e oferece "Desfazer" depois de excluir (Nielsen 1 e 3).
 */
type Aviso = { texto: string; acao?: { rotulo: string; executar: () => void } };
type AvisoCtx = { avisar: (a: Aviso) => void };

const Ctx = createContext<AvisoCtx>({ avisar: () => {} });

export function AvisoProvider({ children }: { children: React.ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const opacidade = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const esconder = useCallback(() => {
    Animated.timing(opacidade, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => setAviso(null));
  }, [opacidade]);

  const avisar = useCallback(
    (a: Aviso) => {
      if (timer.current) clearTimeout(timer.current);
      setAviso(a);
      AccessibilityInfo.announceForAccessibility(a.texto);
      Animated.timing(opacidade, { toValue: 1, duration: 160, useNativeDriver: true }).start();
      timer.current = setTimeout(esconder, a.acao ? 6000 : 3500);
    },
    [esconder, opacidade],
  );

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <Ctx.Provider value={{ avisar }}>
      {children}
      {aviso && (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.camada, { bottom: insets.bottom + 96, opacity: opacidade }]}
        >
          <View style={styles.aviso} accessibilityLiveRegion="polite">
            <Ionicons name="checkmark-circle" size={24} color={colors.papel} />
            <Text style={styles.texto}>{aviso.texto}</Text>
            {aviso.acao && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  aviso.acao?.executar();
                  esconder();
                }}
                style={styles.acao}
                hitSlop={8}
              >
                <Text style={styles.acaoTexto}>{aviso.acao.rotulo}</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </Ctx.Provider>
  );
}

export const useAviso = () => useContext(Ctx);

const styles = StyleSheet.create({
  camada: { position: 'absolute', left: space.s3, right: space.s3 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    minHeight: TOQUE_MIN,
    backgroundColor: colors.verde,
    borderRadius: radius.medio,
    paddingLeft: space.s2,
    paddingRight: space.s1,
    paddingVertical: space.s1,
    ...elevacao.flutuante,
  },
  texto: { flex: 1, color: colors.papel, fontFamily: fonts.texto, fontSize: 16, lineHeight: 22 },
  acao: {
    minHeight: 48,
    paddingHorizontal: space.s2,
    justifyContent: 'center',
    borderRadius: radius.pequeno,
    backgroundColor: colors.acafrao,
  },
  acaoTexto: { color: colors.carvao, fontFamily: fonts.botao, fontSize: 16 },
});
