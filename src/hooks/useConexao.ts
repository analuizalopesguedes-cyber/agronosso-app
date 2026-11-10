import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/** Mostra se o celular está com internet (status do sistema, Nielsen 1). */
export function useConexao() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const parar = NetInfo.addEventListener((estado) => {
      // isInternetReachable pode vir null enquanto testa; nesse caso confiamos em isConnected.
      const alcancavel = estado.isInternetReachable ?? estado.isConnected ?? true;
      setOnline(Boolean(estado.isConnected) && Boolean(alcancavel));
    });
    return () => parar();
  }, []);

  return online;
}
