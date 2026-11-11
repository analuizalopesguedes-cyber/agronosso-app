/* Conteúdo do AgroNosso: tipos de papel, palavras difíceis, perguntas prontas e exemplos.
   Linguagem: curta, do dia a dia do campo, sem juridiquês e sem tratar a pessoa como leiga. */
(function () {
  const TIPOS = {
    arrendamento: {
      nome: 'Contrato de arrendamento (aluguel da terra)',
      chaves: ['arrendamento', 'arrendante', 'arrendador', 'arrendatári'],
      oQueE:
        'É o papel do aluguel da terra. Uma pessoa deixa a outra plantar ou criar na terra dela e recebe um valor certo em troca, em dinheiro ou em produto. Esse valor é o mesmo, dê a safra muito ou pouco.',
      lei: [
        'Quando não tem prazo, a lei do campo costuma considerar que o arrendamento vale por no mínimo 3 anos.',
        'Para lavoura de ciclo curto (milho, feijão, hortaliça), o prazo mínimo costuma ser de 3 anos. Para culturas que levam anos, pode ser maior.',
        'Quem é dono da terra precisa avisar com antecedência (em geral 6 meses antes do fim) se não quiser renovar.',
        'Se a terra for vendida, quem arrenda costuma ter preferência para comprar, pagando o mesmo preço que outro pagaria.',
        'Melhorias úteis e necessárias feitas na terra, como poço e cerca, em geral dão direito a ser pagas no fim do contrato.',
      ],
    },
    parceria: {
      nome: 'Contrato de parceria (meação, terça, quarta)',
      chaves: ['parceria', 'parceiro outorgante', 'parceiro outorgado', 'meeiro', 'meação', 'meacao', 'partilha da produção', 'partilha da colheita'],
      oQueE:
        'É o papel em que o dono da terra e quem trabalha nela dividem o que a terra der. Cada um entra com uma parte (terra, trabalho, adubo, semente) e a colheita é repartida em porcentagem. Se a safra for ruim, os dois perdem juntos.',
      lei: [
        'Se o prazo não estiver combinado, a parceria costuma valer por no mínimo 3 anos pela lei do campo.',
        'A lei limita quanto o dono da terra pode ficar da colheita. Esse limite depende do que ele coloca (só a terra, casa, máquinas, adubo).',
        'Combinado de boca também vale, mas é difícil provar depois. Por isso vale anotar.',
      ],
    },
    comodato: {
      nome: 'Empréstimo da terra de graça (comodato)',
      chaves: ['comodato', 'comodante', 'comodatári'],
      oQueE:
        'É o papel em que uma pessoa empresta a terra para outra usar sem cobrar nada. Como é de graça, o dono costuma poder pedir a terra de volta com mais facilidade.',
      lei: ['Veja com atenção o aviso que o dono precisa dar para pedir a terra de volta e o que acontece com o que você plantar ou construir.'],
    },
    credito: {
      nome: 'Contrato de empréstimo do banco (crédito rural)',
      chaves: ['cédula', 'cedula', 'pronaf', 'crédito rural', 'credito rural', 'financiamento', 'custeio', 'pignoratícia', 'pignoraticia', 'hipotecária'],
      oQueE:
        'É o papel do empréstimo que o banco ou a cooperativa faz para a safra ou para comprar algo. Diz quanto você recebe, quanto vai pagar, até quando e o que fica como garantia.',
      lei: ['Pergunte se o contrato tem seguro da lavoura (como o Proagro) e o que fazer se perder a safra.'],
    },
    compra: {
      nome: 'Contrato de compra e venda',
      chaves: ['compra e venda', 'promitente', 'compromisso de compra', 'escritura', 'vendedor', 'comprador'],
      oQueE:
        'É o papel de compra ou venda de terra, lote, animal ou máquina. Diz o preço, como e quando pagar e quando a coisa passa para o nome de quem compra.',
      lei: ['Compra de terra só fica completa com a escritura registrada no cartório.'],
    },
    outro: {
      nome: 'Papel ou contrato',
      chaves: [],
      oQueE: 'Não conseguimos saber com certeza que tipo de papel é este. Abaixo estão as partes que encontramos e o que vale perguntar.',
      lei: [],
    },
  };

  /* Palavras difíceis: termo (como aparece) → explicação do dia a dia */
  const GLOSSARIO = [
    ['arrendante', 'Quem é dono da terra e aluga para outra pessoa usar.'],
    ['arrendador', 'Quem é dono da terra e aluga para outra pessoa usar.'],
    ['arrendatário', 'Quem aluga a terra do outro para plantar ou criar.'],
    ['outorgante', 'Quem dá ou cede alguma coisa no contrato. Em geral, o dono da terra.'],
    ['outorgado', 'Quem recebe alguma coisa no contrato. Em geral, quem vai usar a terra.'],
    ['meeiro', 'Quem trabalha na terra do outro e divide a colheita com o dono.'],
    ['comodato', 'Empréstimo de alguma coisa de graça, com obrigação de devolver.'],
    ['benfeitoria', 'Melhoria feita na terra: poço, cerca, curral, irrigação, casa, plantação que dura anos.'],
    ['benfeitorias úteis', 'Melhorias que deixam a terra melhor de usar, como irrigação ou um curral novo.'],
    ['benfeitorias necessárias', 'Consertos e obras para a terra não estragar, como arrumar uma cerca caída.'],
    ['voluptuária', 'Melhoria só de enfeite ou conforto. Em geral, não é paga no fim do contrato.'],
    ['indenização', 'Dinheiro pago para compensar um prejuízo ou o que a pessoa investiu.'],
    ['rescisão', 'Quando o contrato acaba antes do tempo.'],
    ['rescindir', 'Acabar o contrato antes do tempo.'],
    ['denúncia', 'Neste caso, é o aviso de que uma das partes quer acabar o contrato.'],
    ['notificação', 'Aviso por escrito que uma parte manda para a outra.'],
    ['aviso prévio', 'Aviso dado com antecedência antes de sair ou de pedir a terra.'],
    ['prorrogação', 'Quando o contrato continua por mais tempo do que o combinado.'],
    ['prorrogado', 'O contrato continua por mais tempo do que o combinado.'],
    ['renovação', 'Fazer um novo período do mesmo contrato.'],
    ['preferência', 'Direito de ser o primeiro a poder comprar ou renovar, pelo mesmo preço.'],
    ['alienação', 'Venda ou passagem da terra para outra pessoa.'],
    ['cláusula', 'Cada parte ou regra do contrato.'],
    ['foro', 'A cidade onde vai correr um processo, se houver briga na justiça.'],
    ['multa', 'Valor a pagar como castigo por não cumprir uma regra do contrato.'],
    ['mora', 'Atraso no pagamento.'],
    ['juros', 'Valor a mais cobrado pelo tempo que o dinheiro fica emprestado ou atrasado.'],
    ['encargos', 'Juros, taxas e outros valores que somam ao principal.'],
    ['inadimplência', 'Quando a pessoa não paga ou não cumpre o combinado na data.'],
    ['inadimplemento', 'Quando a pessoa não paga ou não cumpre o combinado na data.'],
    ['penhor', 'Um bem (colheita, animal, máquina) que fica como garantia. Se não pagar, pode ser tomado.'],
    ['hipoteca', 'A terra ou a casa fica como garantia da dívida. Se não pagar, pode ser tomada.'],
    ['garantia', 'O que fica prometido para cobrir a dívida se ela não for paga.'],
    ['avalista', 'Pessoa que promete pagar a dívida se quem pegou o dinheiro não pagar.'],
    ['fiador', 'Pessoa que promete pagar se quem fez o contrato não pagar.'],
    ['irrevogável', 'Que não pode ser desfeito depois de assinado.'],
    ['irretratável', 'Que não dá para voltar atrás depois de assinado.'],
    ['renuncia', 'Abre mão de um direito. Atenção: depois pode não ter como pedir.'],
    ['renúncia', 'Abrir mão de um direito. Atenção: depois pode não ter como pedir.'],
    ['subarrendamento', 'Quando quem aluga a terra aluga para uma terceira pessoa.'],
    ['cessão', 'Passar para outra pessoa um direito ou o uso de alguma coisa.'],
    ['ano agrícola', 'O período de uma safra, do preparo da terra até a colheita.'],
    ['estatuto da terra', 'A lei principal do campo, que dá regras para arrendamento e parceria.'],
    ['reajuste', 'Mudança no valor ao longo do tempo, em geral para cima.'],
    ['igp-m', 'Um índice que mede a subida dos preços. Usado para aumentar o valor do aluguel.'],
    ['ipca', 'Um índice que mede a subida dos preços. Usado para aumentar valores.'],
    ['vencimento', 'A data em que um pagamento precisa ser feito.'],
    ['quitação', 'Prova de que a dívida foi paga por completo.'],
    ['ônus', 'Um peso ou obrigação. Por exemplo: a terra ter uma dívida ligada a ela.'],
    ['matrícula', 'O número de registro da terra no cartório. É como a identidade da terra.'],
    ['posse', 'Quem está usando e cuidando da terra, mesmo sem ser o dono no papel.'],
    ['reconhecimento de firma', 'O cartório confirma que a assinatura é mesmo da pessoa.'],
    ['testemunhas', 'Pessoas que assinam para confirmar que viram o acordo ser feito.'],
    ['proagro', 'Seguro do governo que cobre parte do prejuízo se a safra for perdida por seca, chuva forte ou praga.'],
    ['custeio', 'Dinheiro para as despesas da plantação: semente, adubo, remédio, mão de obra.'],
  ];

  /* Perguntas prontas, em tom neutro: "o que todo mundo pergunta", sem soar como desconfiança */
  const PERGUNTAS = {
    usa: [
      'Até quando vale o nosso acordo? Dá para colocar a data no papel?',
      'Quanto eu pago no total, em quantas vezes e em que datas?',
      'O valor pode subir? Se subir, como e quando?',
      'Quem paga o quê: adubo, semente, luz, água, imposto da terra?',
      'Se o senhor precisar da terra de volta, com quanto tempo de aviso fica combinado?',
      'Se a terra for vendida ou passar para outra pessoa, o que acontece com o meu plantio?',
      'O que eu colocar na terra (poço, cerca, irrigação, bananeira) fica como? Eu recebo por isso no fim?',
      'Posso plantar o que leva anos, como café ou banana?',
    ],
    cede: [
      'Por quanto tempo você precisa da terra? Podemos colocar a data no papel?',
      'Quanto você vai pagar, em quantas vezes e em que datas?',
      'O que você pretende plantar ou criar? Vai fazer alguma obra na terra?',
      'Quem paga o imposto da terra (ITR), a luz e a água?',
      'Se eu precisar da terra de volta, com quanto tempo de aviso fica combinado?',
      'No fim, como fica o que você plantar ou construir aqui?',
      'Se acontecer alguma coisa comigo, como fica o acordo com os meus filhos?',
    ],
    outro: [
      'Qual é o valor total, contando juros e taxas?',
      'Até quando vale e quais são as datas de pagamento?',
      'O que acontece se eu atrasar ou não conseguir pagar?',
      'Como faço para sair do acordo, se precisar?',
      'O que fica como garantia?',
    ],
  };

  /* Exemplos fictícios para testar o app sem foto. São lidos pelo mesmo motor de leitura. */
  const EXEMPLOS = [
    {
      chave: 'arrendamento',
      titulo: 'Contrato de arrendamento de terra',
      descricao: 'Aluguel de 5 hectares para hortaliças',
      texto:
        'CONTRATO DE ARRENDAMENTO RURAL. ARRENDADOR: Antônio Mendes. ARRENDATÁRIO: José Carlos Pereira. ' +
        'Cláusula 1ª – O arrendador cede ao arrendatário a área de 5 (cinco) hectares do Sítio Boa Vista, para exploração de lavoura temporária (hortaliças e feijão). ' +
        'Cláusula 2ª – O prazo do arrendamento é de 2 (dois) anos, com início em 01/03/2027 e término em 28/02/2029. ' +
        'Cláusula 3ª – O preço do arrendamento é de R$ 6.000,00 (seis mil reais) por ano, pagos em 2 (duas) parcelas de R$ 3.000,00, com vencimento em 30/06 e 30/12 de cada ano, reajustado anualmente pelo IGP-M. ' +
        'Cláusula 4ª – Ficam por conta do arrendatário as despesas com energia elétrica, água, insumos e o ITR do imóvel. ' +
        'Cláusula 5ª – As benfeitorias realizadas pelo arrendatário, inclusive poço e sistema de irrigação, ficarão incorporadas ao imóvel, sem direito a indenização. ' +
        'Cláusula 6ª – O arrendador poderá rescindir o contrato a qualquer tempo, mediante notificação com 30 (trinta) dias de antecedência. ' +
        'Cláusula 7ª – Em caso de atraso, incidirá multa de 10% sobre o valor da parcela e juros de mora de 1% ao mês. ' +
        'Cláusula 8ª – É vedado o subarrendamento. Fica eleito o foro da comarca de Viçosa/MG.',
    },
    {
      chave: 'parceria',
      titulo: 'Contrato de parceria agrícola (meação)',
      descricao: 'Divisão da colheita de café',
      texto:
        'CONTRATO DE PARCERIA AGRÍCOLA. PARCEIRO OUTORGANTE: Fazenda Santa Luzia, representada por Carlos Andrade. PARCEIRO OUTORGADO: Sebastião Lima, meeiro. ' +
        'Cláusula 1ª – O parceiro outorgante entrega ao parceiro outorgado 3 (três) hectares de lavoura de café formada, para cultivo e colheita. ' +
        'Cláusula 2ª – A produção será partilhada na proporção de 50% (cinquenta por cento) para cada parte, após a secagem. ' +
        'Cláusula 3ª – O adubo e os defensivos serão pagos pelo parceiro outorgante e descontados da parte do parceiro outorgado na partilha. ' +
        'Cláusula 4ª – O prazo é de 3 (três) anos agrícolas, renovável por acordo entre as partes. ' +
        'Cláusula 5ª – O parceiro outorgado poderá deixar a parceria ao final de cada ano agrícola, mediante aviso prévio de 6 (seis) meses. ' +
        'Cláusula 6ª – Em caso de alienação do imóvel, o adquirente respeitará este contrato até o fim do ano agrícola em curso.',
    },
    {
      chave: 'credito',
      titulo: 'Contrato de empréstimo para a safra',
      descricao: 'Crédito rural do banco (Pronaf custeio)',
      texto:
        'CÉDULA RURAL PIGNORATÍCIA – PRONAF CUSTEIO. Emitente: Maria das Dores Souza. Credor: Banco Cooperativo Exemplo S.A. ' +
        'Valor: R$ 12.000,00 (doze mil reais), destinado ao custeio da lavoura de milho e feijão, safra 2026/2027. ' +
        'Encargos financeiros: juros de 3% ao ano. Vencimento: 15/05/2027, em parcela única. ' +
        'Em garantia, a emitente dá ao credor, em penhor cedular, a produção agrícola financiada. ' +
        'Em caso de inadimplemento, incidirão juros de mora de 1% ao mês e multa de 2% sobre o saldo devedor. ' +
        'O empreendimento está amparado pelo PROAGRO. Fica eleito o foro da comarca de Campina Grande/PB.',
    },
  ];

  const QUEM_AJUDA = [
    { icone: 'pessoas', nome: 'Sindicato dos trabalhadores rurais', texto: 'Explica contratos de terra e acompanha você na conversa. Para associados, costuma ser de graça.' },
    { icone: 'planta', nome: 'Técnico da assistência rural (Emater ou ATER)', texto: 'Ajuda com projeto de safra, crédito, seguro e cadastro da terra.' },
    { icone: 'casa', nome: 'Cooperativa ou associação', texto: 'Conhece os valores da região e pode orientar sobre o que é justo.' },
    { icone: 'prancheta', nome: 'Cartório', texto: 'Registra o contrato, reconhece assinatura e informa sobre a terra.' },
    { icone: 'escudo', nome: 'Defensoria Pública ou advogado', texto: 'Quando há risco de perder a terra, cobrança que parece errada ou briga.' },
  ];

  window.AgroDados = { TIPOS, GLOSSARIO, PERGUNTAS, EXEMPLOS, QUEM_AJUDA };
})();
