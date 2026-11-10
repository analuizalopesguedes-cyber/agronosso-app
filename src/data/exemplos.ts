import { DocumentoExplicado } from '../types';

/**
 * Documentos de exemplo usados no modo demonstração.
 * Nomes, valores e datas são fictícios.
 */
export type Exemplo = Omit<DocumentoExplicado, 'id' | 'criadoEm'> & { chave: string; descricaoCurta: string };

export const EXEMPLOS: Exemplo[] = [
  {
    chave: 'credito-rural',
    descricaoCurta: 'Empréstimo do banco para a safra',
    demonstracao: true,
    titulo: 'Contrato de empréstimo para a safra',
    nomeOficial: 'Cédula Rural Pignoratícia – Pronaf Custeio',
    nivelAtencao: 'alto',
    resumo:
      'É um empréstimo de R$ 18.000,00 para custear a safra de milho. Você precisa pagar tudo até 15 de maio de 2027. Se não pagar, o banco pode ficar com a colheita que foi dada como garantia.',
    oQueE:
      'É o papel que confirma o empréstimo que você pegou no banco para plantar. Ele diz quanto você recebeu, quanto vai pagar, até quando e o que fica como garantia caso a dívida não seja paga.',
    pontos: [
      { tipo: 'valor', titulo: 'Quanto você recebeu', texto: 'R$ 18.000,00, liberados em duas partes.' },
      { tipo: 'valor', titulo: 'Juros', texto: '3% ao ano. Em um ano, isso dá cerca de R$ 540,00 a mais.' },
      { tipo: 'prazo', titulo: 'Data para pagar', texto: '15 de maio de 2027, em uma parcela só.' },
      {
        tipo: 'obrigacao',
        titulo: 'Garantia',
        texto: 'A colheita de milho fica como garantia. Você não pode vender essa colheita sem avisar o banco.',
      },
      {
        tipo: 'direito',
        titulo: 'Seguro da lavoura',
        texto: 'O contrato tem seguro (Proagro). Se a safra for perdida por seca ou chuva forte, você pode pedir cobertura.',
      },
    ],
    palavras: [
      { termo: 'Cédula', significado: 'O documento do empréstimo. Vale como uma promessa de pagamento.' },
      { termo: 'Pignoratícia', significado: 'Quer dizer que existe um bem dado como garantia, como a colheita ou um animal.' },
      { termo: 'Custeio', significado: 'Dinheiro para as despesas da plantação: semente, adubo, defensivo.' },
      { termo: 'Encargos', significado: 'Os juros e as taxas que somam ao valor emprestado.' },
      { termo: 'Inadimplência', significado: 'Quando a pessoa não paga a dívida na data combinada.' },
    ],
    atencao: [
      'Confira se o valor e a data de pagamento são os mesmos que o gerente falou.',
      'Veja se existe multa por atraso e qual é o valor.',
      'Guarde o comprovante do seguro (Proagro) junto com este documento.',
      'Não venda a colheita dada como garantia sem falar com o banco antes.',
    ],
    perguntas: [
      'Posso pagar antes da data e pagar menos juros?',
      'O que acontece se a safra der menos do que o esperado?',
      'Como peço o seguro se perder a lavoura?',
      'Posso dividir o pagamento em parcelas?',
    ],
    buscarAjuda: {
      quando: [
        'Antes de assinar, se algum valor estiver diferente do combinado.',
        'Se você perceber que não vai conseguir pagar na data.',
        'Se perder a safra e precisar pedir o seguro.',
      ],
      quem: [
        { nome: 'Técnico da assistência rural (Emater ou ATER)', porque: 'Ajuda a entender o projeto da safra e o seguro.' },
        { nome: 'Sindicato rural ou cooperativa', porque: 'Orienta sobre renegociação e acompanha você no banco.' },
        { nome: 'Defensoria Pública ou advogado', porque: 'Se houver cobrança que você acha errada ou risco de perder bens.' },
      ],
    },
    textoOriginal:
      'CÉDULA RURAL PIGNORATÍCIA Nº 000123/2026. Emitente: José da Silva, CPF ***.***.***-**. Credor: Banco Cooperativo Exemplo S.A. Valor: R$ 18.000,00 (dezoito mil reais), destinado ao custeio agrícola da cultura de milho, safra 2026/2027, no âmbito do PRONAF. Encargos financeiros: taxa efetiva de juros de 3% a.a. Vencimento: 15/05/2027, em parcela única. Em garantia, o emitente dá ao credor, em penhor cedular de primeiro grau, a produção agrícola financiada... Em caso de inadimplemento, incidirão juros moratórios de 1% a.m. e multa de 2% sobre o saldo devedor... O empreendimento está amparado pelo PROAGRO.',
  },
  {
    chave: 'itr',
    descricaoCurta: 'Aviso de imposto da terra',
    demonstracao: true,
    titulo: 'Aviso de cobrança do imposto da terra',
    nomeOficial: 'Notificação de Lançamento – ITR',
    nivelAtencao: 'alto',
    resumo:
      'A Receita Federal está cobrando R$ 1.240,00 de imposto da terra (ITR), porque achou diferença na área informada. Você tem 30 dias para pagar ou para contestar, se achar que a cobrança está errada.',
    oQueE:
      'É um aviso da Receita Federal. Ele diz que, depois de conferir a declaração do imposto da sua terra, encontraram uma diferença e calcularam um valor a pagar.',
    pontos: [
      { tipo: 'valor', titulo: 'Valor cobrado', texto: 'R$ 1.240,00, já com multa e juros.' },
      { tipo: 'prazo', titulo: 'Prazo', texto: '30 dias a partir do dia em que você recebeu este aviso.' },
      { tipo: 'obrigacao', titulo: 'O que fazer', texto: 'Pagar o valor ou entrar com contestação no prazo.' },
      {
        tipo: 'direito',
        titulo: 'Seu direito',
        texto: 'Você pode contestar se a área ou o valor da terra estiverem errados. Isso se chama impugnação.',
      },
    ],
    palavras: [
      { termo: 'ITR', significado: 'Imposto sobre a Propriedade Territorial Rural. É o imposto anual da terra no campo.' },
      { termo: 'Lançamento', significado: 'Quando a Receita calcula e registra um imposto a ser pago.' },
      { termo: 'Impugnação', significado: 'Pedido formal para dizer que você não concorda com a cobrança.' },
      { termo: 'VTN', significado: 'Valor da Terra Nua: o valor da terra sem casas, cercas ou plantações.' },
    ],
    atencao: [
      'Anote a data em que você recebeu este aviso. O prazo começa a contar daí.',
      'Confira se a área da terra está igual à da escritura e do CAR.',
      'Não jogue fora este aviso. Ele é necessário para pagar ou contestar.',
    ],
    perguntas: [
      'Por que a área ficou diferente da que eu declarei?',
      'Como faço para contestar a cobrança?',
      'Se eu pagar agora, ainda posso contestar depois?',
    ],
    buscarAjuda: {
      quando: [
        'Se você não concorda com a área ou com o valor da terra.',
        'Se o prazo de 30 dias estiver perto de acabar.',
        'Se não tiver condições de pagar o valor de uma vez.',
      ],
      quem: [
        { nome: 'Contador', porque: 'Confere a declaração e prepara a contestação, se for o caso.' },
        { nome: 'Sindicato rural', porque: 'Muitos oferecem ajuda com o ITR para associados.' },
        { nome: 'Atendimento da Receita Federal', porque: 'Informa como pagar, parcelar ou contestar.' },
      ],
    },
    textoOriginal:
      'MINISTÉRIO DA FAZENDA – SECRETARIA ESPECIAL DA RECEITA FEDERAL DO BRASIL. NOTIFICAÇÃO DE LANÇAMENTO – IMPOSTO SOBRE A PROPRIEDADE TERRITORIAL RURAL. Exercício: 2025. Contribuinte: José da Silva. Imóvel: Sítio Boa Esperança. Em procedimento de revisão da DITR, constatou-se divergência na área tributável declarada e no Valor da Terra Nua (VTN)... Fica o contribuinte intimado a recolher o crédito tributário de R$ 1.240,00, acrescido de multa de ofício e juros de mora, ou apresentar impugnação no prazo de 30 (trinta) dias, contados da ciência desta notificação...',
  },
  {
    chave: 'car',
    descricaoCurta: 'Cadastro ambiental da propriedade',
    demonstracao: true,
    titulo: 'Recibo do cadastro ambiental do sítio',
    nomeOficial: 'Recibo de Inscrição no CAR – Cadastro Ambiental Rural',
    nivelAtencao: 'medio',
    resumo:
      'Este papel mostra que o seu sítio está no Cadastro Ambiental Rural (CAR). Mas a situação está como “pendente”: o órgão ambiental pediu para corrigir a área de mata perto do córrego.',
    oQueE:
      'É o comprovante de que sua propriedade foi registrada no CAR, um cadastro obrigatório que mostra onde ficam as matas, os rios e as áreas de plantio. O CAR é pedido, por exemplo, para conseguir crédito rural.',
    pontos: [
      { tipo: 'obrigacao', titulo: 'Situação', texto: 'Pendente. Falta corrigir uma informação no cadastro.' },
      { tipo: 'obrigacao', titulo: 'O que corrigir', texto: 'A área de mata na beira do córrego (APP) está menor do que o exigido.' },
      { tipo: 'prazo', titulo: 'Prazo', texto: 'O aviso pede a correção em até 60 dias.' },
      { tipo: 'direito', titulo: 'Seu direito', texto: 'Você pode aderir a um programa de regularização (PRA) para ajustar aos poucos.' },
    ],
    palavras: [
      { termo: 'CAR', significado: 'Cadastro Ambiental Rural. Registro com o mapa da propriedade e das áreas de mata.' },
      { termo: 'APP', significado: 'Área de Preservação Permanente: mata na beira de rios, nascentes e morros.' },
      { termo: 'Reserva Legal', significado: 'Parte da propriedade que deve manter vegetação nativa.' },
      { termo: 'PRA', significado: 'Programa de Regularização Ambiental: um plano para recuperar áreas aos poucos.' },
    ],
    atencao: [
      'Guarde o número do recibo. Ele é pedido no banco e em outros cadastros.',
      'Confira se o mapa do sítio no cadastro está igual ao que existe de verdade.',
      'Veja quem fez o cadastro da primeira vez. Essa pessoa pode ajudar a corrigir.',
    ],
    perguntas: [
      'Ficar com o CAR pendente atrapalha meu crédito no banco?',
      'Quanto de mata eu preciso manter na beira do córrego?',
      'Quem pode corrigir o cadastro para mim?',
    ],
    buscarAjuda: {
      quando: [
        'Para corrigir o mapa ou as áreas do cadastro.',
        'Se o banco pedir o CAR regularizado para liberar crédito.',
      ],
      quem: [
        { nome: 'Técnico da assistência rural (Emater ou ATER)', porque: 'Costuma ajudar pequenos produtores a fazer e corrigir o CAR.' },
        { nome: 'Órgão ambiental do seu estado', porque: 'É quem analisa o cadastro e explica a pendência.' },
        { nome: 'Sindicato rural', porque: 'Pode indicar quem faz a correção e acompanhar o processo.' },
      ],
    },
    textoOriginal:
      'RECIBO DE INSCRIÇÃO DO IMÓVEL RURAL NO CAR. Registro: XX-0000000-0000.0000.0000.0000.0000.0000.0000.0000. Nome do imóvel: Sítio Boa Esperança. Área total: 18,4 ha. Situação do cadastro: PENDENTE. Análise: identificada sobreposição/insuficiência de Área de Preservação Permanente em faixa marginal de curso d’água... O proprietário deverá retificar as informações no prazo de 60 dias, podendo aderir ao Programa de Regularização Ambiental – PRA...',
  },
];
