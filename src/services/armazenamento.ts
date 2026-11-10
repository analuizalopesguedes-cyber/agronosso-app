import AsyncStorage from '@react-native-async-storage/async-storage';

/** Tudo fica salvo no próprio celular, para funcionar sem internet. */
const CHAVES = {
  boasVindas: 'agronosso:boas-vindas-vista',
  documentos: 'agronosso:documentos',
  duvidas: 'agronosso:duvidas',
} as const;

async function ler<T>(chave: string, padrao: T): Promise<T> {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

async function gravar(chave: string, valor: unknown) {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Se não conseguir gravar, o app continua funcionando com os dados em memória.
  }
}

export const armazenamento = {
  boasVindasVista: () => ler<boolean>(CHAVES.boasVindas, false),
  marcarBoasVindas: () => gravar(CHAVES.boasVindas, true),
  lerDocumentos: <T>() => ler<T[]>(CHAVES.documentos, []),
  gravarDocumentos: (v: unknown[]) => gravar(CHAVES.documentos, v),
  lerDuvidas: <T>() => ler<T[]>(CHAVES.duvidas, []),
  gravarDuvidas: (v: unknown[]) => gravar(CHAVES.duvidas, v),
};
