/**
 * Tema AgroNosso
 * Paleta, tipografia e espaçamento oficiais da marca.
 * Contrastes conferidos (WCAG AA):
 *  - Carvão sobre Papel ........ 12,6:1  (texto principal)
 *  - Verde profundo sobre Papel . 9,9:1  (títulos e botão primário)
 *  - Papel sobre Verde profundo . 9,9:1
 *  - Oliva escuro sobre Papel ... 5,1:1  (texto secundário e ícones)
 *  - Carvão sobre Açafrão ....... 6,6:1  (botão de destaque)
 *  - Açafrão sobre Papel ........ 1,9:1  -> NUNCA usar como texto/ícone sobre Papel
 */

export const colors = {
  // Oficiais
  verde: '#263F35', // Verde profundo
  oliva: '#5F693B', // Oliva escuro
  acafrao: '#E7A044', // Açafrão
  papel: '#F4EFE4', // Papel
  carvao: '#292A24', // Carvão

  // Variações derivadas das cores oficiais (tons e transparências)
  papelClaro: '#FBF8F2', // Papel clareado, para cards
  verdeSuave: 'rgba(38, 63, 53, 0.08)', // fundo de seleção / ícone
  olivaSuave: 'rgba(95, 105, 59, 0.14)', // fundo de selo / ícone
  acafraoSuave: 'rgba(231, 160, 68, 0.22)', // fundo de alerta (com texto Carvão)
  linha: 'rgba(41, 42, 36, 0.14)', // bordas e divisórias
  sombra: '#292A24',
  veu: 'rgba(41, 42, 36, 0.55)', // fundo escurecido de modais
} as const;

export const fonts = {
  titulo: 'SourceSans3_700Bold', // títulos de tela
  subtitulo: 'SourceSans3_600SemiBold', // subtítulos e seções
  texto: 'Lexend_400Regular', // textos principais e auxiliares
  botao: 'Lexend_500Medium', // botões e chamadas interativas
} as const;

/** Escala tipográfica: título de tela > seção > subtítulo > corpo > auxiliar */
export const type = {
  tituloTela: { fontFamily: fonts.titulo, fontSize: 30, lineHeight: 36, color: colors.verde },
  tituloSecao: { fontFamily: fonts.subtitulo, fontSize: 22, lineHeight: 28, color: colors.verde },
  subtitulo: { fontFamily: fonts.subtitulo, fontSize: 19, lineHeight: 26, color: colors.carvao },
  leitura: { fontFamily: fonts.texto, fontSize: 18, lineHeight: 28, color: colors.carvao },
  corpo: { fontFamily: fonts.texto, fontSize: 16, lineHeight: 24, color: colors.carvao },
  auxiliar: { fontFamily: fonts.texto, fontSize: 16, lineHeight: 24, color: colors.oliva },
  botao: { fontFamily: fonts.botao, fontSize: 18, lineHeight: 24 },
} as const;

/** Espaçamento em múltiplos de 8 */
export const space = {
  s1: 8,
  s2: 16,
  s3: 24,
  s4: 32,
  s5: 40,
  s6: 48,
} as const;

export const radius = {
  pequeno: 12,
  medio: 16,
  grande: 24,
  pilula: 999,
} as const;

/** Alvo de toque mínimo (prevenção de erros) */
export const TOQUE_MIN = 56;

export const elevacao = {
  card: {
    shadowColor: colors.sombra,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  flutuante: {
    shadowColor: colors.sombra,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;
