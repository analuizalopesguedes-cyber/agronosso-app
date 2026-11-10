import * as Speech from 'expo-speech';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/**
 * Áudio para acessibilidade: lê qualquer texto em voz alta (pt-BR).
 * Só um áudio toca por vez. Sempre existe "Parar" (controle e liberdade).
 */
type Fala = {
  falandoId: string | null;
  falar: (id: string, texto: string) => void;
  parar: () => void;
};

const Ctx = createContext<Fala>({ falandoId: null, falar: () => {}, parar: () => {} });

export function FalaProvider({ children }: { children: React.ReactNode }) {
  const [falandoId, setFalandoId] = useState<string | null>(null);
  const atual = useRef<string | null>(null);

  const terminar = useCallback((id: string) => {
    if (atual.current === id) {
      atual.current = null;
      setFalandoId(null);
    }
  }, []);

  const falar = useCallback(
    (id: string, texto: string) => {
      Speech.stop();
      atual.current = id;
      setFalandoId(id);
      Speech.speak(texto, {
        language: 'pt-BR',
        rate: 0.92,
        onDone: () => terminar(id),
        onStopped: () => terminar(id),
        onError: () => terminar(id),
      });
    },
    [terminar],
  );

  const parar = useCallback(() => {
    atual.current = null;
    setFalandoId(null);
    Speech.stop();
  }, []);

  useEffect(() => () => void Speech.stop(), []);

  return <Ctx.Provider value={{ falandoId, falar, parar }}>{children}</Ctx.Provider>;
}

export const useFala = () => useContext(Ctx);
