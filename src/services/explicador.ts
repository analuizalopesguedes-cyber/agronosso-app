import { EXEMPLOS } from '../data/exemplos';
import { DocumentoExplicado, EtapaLeitura } from '../types';

/**
 * Serviço que lê o documento (OCR) e explica em linguagem simples (IA).
 *
 * - Sem EXPO_PUBLIC_AGRONOSSO_API_URL: modo demonstração, com exemplos prontos.
 * - Com a variável: envia a foto ao servidor da AgroNosso, que faz o OCR e a
 *   simplificação e devolve um JSON no formato de DocumentoExplicado.
 *   As chaves de IA ficam SEMPRE no servidor, nunca no aplicativo.
 */
const API_URL = process.env.EXPO_PUBLIC_AGRONOSSO_API_URL ?? '';

export const modoDemonstracao = API_URL.trim().length === 0;

export type TipoErro = 'foto-ruim' | 'sem-internet' | 'servidor' | 'cancelado';

export class ErroLeitura extends Error {
  tipo: TipoErro;
  constructor(tipo: TipoErro, mensagem: string) {
    super(mensagem);
    this.tipo = tipo;
  }
}

/** Mensagens simples, que dizem o que houve e como resolver (Nielsen 9). */
export const MENSAGENS_ERRO: Record<TipoErro, { titulo: string; texto: string }> = {
  'foto-ruim': {
    titulo: 'Não conseguimos ler a foto',
    texto: 'A foto ficou escura ou tremida. Tente de novo em um lugar com mais luz e segure o celular firme.',
  },
  'sem-internet': {
    titulo: 'Sem internet no momento',
    texto: 'Para explicar um documento novo, o AgroNosso precisa de internet. Seus documentos salvos continuam disponíveis.',
  },
  servidor: {
    titulo: 'Algo deu errado do nosso lado',
    texto: 'Não é culpa sua. Espere um pouco e tente de novo.',
  },
  cancelado: {
    titulo: 'Leitura cancelada',
    texto: 'Você pode fotografar o documento de novo quando quiser.',
  },
};

type Entrada = { imagemUri?: string; exemploChave?: string };

function gerarId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function esperar(ms: number, sinal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (sinal.aborted) return reject(new ErroLeitura('cancelado', 'cancelado'));
    const t = setTimeout(resolve, ms);
    sinal.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new ErroLeitura('cancelado', 'cancelado'));
    });
  });
}

export async function explicarDocumento(
  entrada: Entrada,
  aoMudarEtapa: (etapa: EtapaLeitura) => void,
  sinal: AbortSignal,
): Promise<DocumentoExplicado> {
  if (modoDemonstracao || entrada.exemploChave) {
    return explicarDemonstracao(entrada, aoMudarEtapa, sinal);
  }
  return explicarComServidor(entrada, aoMudarEtapa, sinal);
}

async function explicarDemonstracao(
  entrada: Entrada,
  aoMudarEtapa: (etapa: EtapaLeitura) => void,
  sinal: AbortSignal,
): Promise<DocumentoExplicado> {
  aoMudarEtapa('lendo');
  await esperar(1600, sinal);
  aoMudarEtapa('simplificando');
  await esperar(1800, sinal);
  aoMudarEtapa('preparando');
  await esperar(1000, sinal);

  const exemplo = EXEMPLOS.find((e) => e.chave === entrada.exemploChave) ?? EXEMPLOS[0];
  const { chave: _c, descricaoCurta: _d, ...base } = exemplo;
  return {
    ...base,
    id: gerarId(),
    criadoEm: new Date().toISOString(),
    imagemUri: entrada.imagemUri,
    demonstracao: true,
  };
}

async function explicarComServidor(
  entrada: Entrada,
  aoMudarEtapa: (etapa: EtapaLeitura) => void,
  sinal: AbortSignal,
): Promise<DocumentoExplicado> {
  if (!entrada.imagemUri) throw new ErroLeitura('foto-ruim', 'sem imagem');

  aoMudarEtapa('lendo');
  // O servidor não informa as etapas; avançamos a mensagem para o usuário não achar que travou.
  const avancar = setTimeout(() => aoMudarEtapa('simplificando'), 2500);

  const corpo = new FormData();
  corpo.append('documento', {
    uri: entrada.imagemUri,
    name: 'documento.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  try {
    const resposta = await fetch(`${API_URL.replace(/\/$/, '')}/explicar`, {
      method: 'POST',
      body: corpo,
      signal: sinal,
      headers: { Accept: 'application/json' },
    });
    if (resposta.status === 422) throw new ErroLeitura('foto-ruim', 'texto ilegível');
    if (!resposta.ok) throw new ErroLeitura('servidor', `status ${resposta.status}`);

    aoMudarEtapa('preparando');
    const dados = (await resposta.json()) as Omit<DocumentoExplicado, 'id' | 'criadoEm'>;
    return { ...dados, id: gerarId(), criadoEm: new Date().toISOString(), imagemUri: entrada.imagemUri };
  } catch (e) {
    if (e instanceof ErroLeitura) throw e;
    if (sinal.aborted) throw new ErroLeitura('cancelado', 'cancelado');
    throw new ErroLeitura('sem-internet', String(e));
  } finally {
    clearTimeout(avancar);
  }
}
