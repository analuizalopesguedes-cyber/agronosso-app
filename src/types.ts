export type NivelAtencao = 'baixo' | 'medio' | 'alto';

export type PontoImportante = {
  tipo: 'prazo' | 'valor' | 'obrigacao' | 'direito';
  titulo: string;
  texto: string;
};

export type PalavraDificil = {
  termo: string;
  significado: string;
};

export type Especialista = {
  nome: string;
  porque: string;
};

export type DocumentoExplicado = {
  id: string;
  titulo: string; // nome simples: "Contrato de empréstimo rural"
  nomeOficial: string; // nome no papel: "Cédula Rural Pignoratícia"
  criadoEm: string; // ISO
  imagemUri?: string;
  demonstracao?: boolean;
  nivelAtencao: NivelAtencao;
  resumo: string; // "Em poucas palavras"
  oQueE: string;
  pontos: PontoImportante[];
  palavras: PalavraDificil[];
  atencao: string[]; // pontos para conferir
  perguntas: string[]; // dúvidas que a pessoa pode ter
  buscarAjuda: {
    quando: string[];
    quem: Especialista[];
  };
  textoOriginal: string;
};

export type Duvida = {
  id: string;
  texto: string;
  documentoId?: string;
  documentoTitulo?: string;
  resolvida: boolean;
  criadaEm: string;
};

export type EtapaLeitura = 'lendo' | 'simplificando' | 'preparando';
