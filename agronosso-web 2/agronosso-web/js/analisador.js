/* Motor de leitura do AgroNosso.
   1) OCR no próprio celular (Tesseract.js): a foto NÃO sai do aparelho.
   2) Explicação por regras: acha valor, prazo, quem paga, como sair, venda da terra,
      melhorias, multa e garantia, e traduz palavras difíceis.
   É uma explicação para ajudar a entender. Não é decisão nem conselho jurídico. */
(function (raiz) {
  const D = () => raiz.AgroDados;

  /* ---------------- utilidades ---------------- */
  const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function normalizar(texto) {
    return String(texto || '')
      .replace(/\r/g, '')
      .replace(/R\s*\$\s*/g, 'R$ ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .replace(/-\n(\p{L})/gu, '$1') // palavra quebrada no fim da linha
      .replace(/\n/g, ' ')
      .trim();
  }

  function frases(texto) {
    return texto
      .split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9§])|(?=Cl[áa]usula\s)/)
      .map((f) => f.trim())
      .filter((f) => f.length > 3);
  }

  const contem = (f, termos) => {
    const n = semAcento(f);
    return termos.some((t) => n.includes(semAcento(t)));
  };
  const achar = (lista, termos) => lista.filter((f) => contem(f, termos));

  const EXTENSO = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, doze: 12, quinze: 15, trinta: 30, sessenta: 60, noventa: 90 };

  function duracoes(f) {
    const res = [];
    const re = /(\d+|\b(?:um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|doze|quinze|trinta|sessenta|noventa)\b)\s*(?:\([^)]*\)\s*)?(anos?\s+agr[ií]colas?|anos?|meses|m[eê]s|dias|safras?)/gi;
    let m;
    while ((m = re.exec(f))) {
      const bruto = semAcento(m[1]);
      const n = /^\d+$/.test(bruto) ? Number(bruto) : EXTENSO[bruto];
      if (!n) continue;
      const u = semAcento(m[2]);
      const unidade = u.startsWith('ano') ? 'anos' : u.startsWith('mes') ? 'meses' : u.startsWith('dia') ? 'dias' : 'safras';
      res.push({ n, unidade, texto: m[0] });
    }
    return res;
  }

  const RE_DINHEIRO = /R\$ ?\d{1,3}(?:\.\d{3})*(?:,\d{2})?|R\$ ?\d+(?:,\d{2})?/g;
  const RE_DATA = /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b|\b\d{1,2} de (?:janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?: de \d{4})?/gi;
  const RE_PORC = /\d{1,3}(?:,\d+)?\s?%/g;

  const tem = (f, re) => (f.match(re) || []).length > 0;
  const valorNum = (s) => Number(s.replace(/[R$\s.]/g, '').replace(',', '.'));
  const real = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const unico = (arr) => [...new Set(arr)];
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
  const emDias = (d) => (d.unidade === 'dias' ? d.n : d.unidade === 'meses' ? d.n * 30 : d.unidade === 'anos' ? d.n * 365 : d.n * 180);

  /* ---------------- tipo de papel ---------------- */
  function detectarTipo(texto) {
    const n = semAcento(texto);
    let melhor = 'outro';
    let pontos = 0;
    for (const [chave, t] of Object.entries(D().TIPOS)) {
      const p = t.chaves.reduce((s, c) => s + (n.split(semAcento(c)).length - 1), 0);
      if (p > pontos) {
        pontos = p;
        melhor = chave;
      }
    }
    return melhor;
  }

  /* ---------------- leitura dos pontos que pesam ---------------- */
  function analisar(textoBruto, papel) {
    const texto = normalizar(textoBruto);
    const lista = frases(texto);
    const tipo = detectarTipo(texto);
    const ehTerra = tipo === 'arrendamento' || tipo === 'parceria' || tipo === 'comodato';
    const alertas = [];
    const pontos = [];

    /* PRAZO */
    const fPrazo = achar(lista, ['prazo', 'vigência', 'vigencia', 'término', 'termino', 'início', 'inicio', 'duração', 'vencimento', 'indeterminado', 'anos agrícolas']);
    let anos = null;
    let tPrazo = '';
    let fUsada = null;
    for (const f of fPrazo) {
      fUsada = f;
      if (contem(f, ['indeterminado'])) {
        tPrazo = 'O papel diz que o acordo é por tempo indeterminado, ou seja, sem data para acabar.';
        if (ehTerra) tPrazo += ' Nesse caso, a lei do campo costuma considerar no mínimo 3 anos.';
        break;
      }
      const d = duracoes(f).find((x) => x.unidade === 'anos' || x.unidade === 'meses' || x.unidade === 'safras');
      if (d && (contem(f, ['prazo', 'vigência', 'vigencia', 'duração', 'pelo período', 'anos agrícolas']))) {
        anos = d.unidade === 'anos' ? d.n : d.unidade === 'meses' ? d.n / 12 : d.n;
        const datas = f.match(RE_DATA) || [];
        tPrazo = `O acordo vale por ${d.texto.replace(/\s*\([^)]*\)/, '')}.`;
        if (datas.length >= 2) tPrazo += ` Começa em ${datas[0]} e termina em ${datas[1]}.`;
        break;
      }
    }
    if (!tPrazo) {
      const fVenc = fPrazo.find((f) => contem(f, ['vencimento']) && tem(f, RE_DATA));
      if (fVenc) {
        fUsada = fVenc;
        const datas = unico(fVenc.match(RE_DATA) || []);
        tPrazo = `A data para pagar é ${datas.join(' e ')}${contem(fVenc, ['parcela única', 'parcela unica']) ? ', tudo de uma vez' : ''}.`;
      }
    }
    const tituloPrazo = tipo === 'credito' ? 'Até quando pagar' : 'Por quanto tempo vale';
    if (tPrazo) {
      const p = { id: 'prazo', icone: 'calendario', titulo: tituloPrazo, texto: tPrazo, trechos: fUsada ? [fUsada] : [] };
      if (ehTerra && tipo !== 'comodato' && anos !== null && anos < 3) {
        p.alerta = `O prazo é menor que 3 anos. Para lavoura de ciclo curto, a lei do campo costuma pedir no mínimo 3 anos. Vale confirmar com o sindicato antes de assinar.`;
        alertas.push('prazo-curto');
      }
      pontos.push(p);
    } else {
      pontos.push({ id: 'prazo', icone: 'calendario', titulo: tituloPrazo, faltando: true, texto: 'Não achamos no papel até quando o acordo vale. Sem data, fica mais difícil saber os seus direitos.', pergunta: 'Até quando vale o acordo? Dá para colocar a data no papel?' });
      if (ehTerra) alertas.push('sem-prazo');
    }

    /* VALOR */
    const fValor = achar(lista, ['R$', 'preço', 'preco', 'valor', 'pagamento', 'parcela', 'partilha', 'proporção', 'proporcao', '%']).filter((f) => tem(f, RE_DINHEIRO) || tem(f, RE_PORC) || contem(f, ['partilha']));
    if (fValor.length) {
      const valores = unico(fValor.join(' ').match(RE_DINHEIRO) || []);
      const porcentagens = unico((fValor.filter((f) => contem(f, ['partilha', 'proporção', 'proporcao', 'produção', 'producao', 'colheita'])).join(' ').match(RE_PORC)) || []);
      let t = '';
      let resumoValor = '';
      if (valores.length) {
        t += valores.length === 1 ? `O valor que aparece no papel é ${valores[0]}.` : `No papel aparecem estes valores: ${valores.slice(0, 4).join(', ')}.`;
        resumoValor = `O valor que aparece é ${valores[0]}.`;
      }
      const fAno = fValor.find((f) => contem(f, ['por ano', 'anual', 'ao ano']) && tem(f, RE_DINHEIRO));
      if (fAno && !contem(fAno, ['juros'])) {
        const v = valorNum(fAno.match(RE_DINHEIRO)[0]);
        t = valores.length > 1 ? t + ` São ${real(v)} por ano.` : `São ${real(v)} por ano.`;
        resumoValor = `Custa ${real(v)} por ano.`;
        if (anos && anos >= 1) t += ` Em ${plural(anos, 'ano', 'anos')}, dá cerca de ${real(v * anos)} no total${contem(fAno, ['reajust']) ? ', fora o aumento do reajuste' : ''}.`;
      }
      if (porcentagens.length && (tipo === 'parceria' || contem(fValor.join(' '), ['partilha']))) {
        const metade = porcentagens.length === 1 && porcentagens[0].replace(/\s/g, '') === '50%';
        const div = metade ? 'metade para cada um (50%)' : porcentagens.join(' e ');
        t += ` A colheita é dividida assim: ${div}.`;
        resumoValor = `A colheita é dividida: ${div}.`;
      }
      const parcelas = fValor.find((f) => contem(f, ['parcela']));
      if (parcelas) {
        const datas = parcelas.match(RE_DATA) || [];
        if (datas.length) t += ` Datas de pagamento: ${unico(datas).join(' e ')}.`;
      }
      const fReaj = achar(lista, ['reajust', 'igp-m', 'igpm', 'ipca', 'correção', 'correcao']);
      if (fReaj.length) t += ' Atenção: o valor pode subir com o tempo (reajuste).';
      const fJuros = lista.find((f) => contem(f, ['juros']) && !contem(f, ['mora', 'atraso', 'inadimpl']));
      if (fJuros) {
        const pj = (fJuros.match(RE_PORC) || [])[0];
        const per = contem(fJuros, ['ao mês', 'ao mes', 'a.m']) ? 'ao mês' : 'ao ano';
        t += pj ? ` Tem juros de ${pj.replace(/\s/g, '')} ${per}.` : ' Tem juros.';
      }
      pontos.push({ id: 'valor', icone: 'dinheiro', titulo: tipo === 'parceria' ? 'Como a colheita é dividida' : 'Quanto custa', texto: t.trim() || 'O papel fala de pagamento, mas não conseguimos ler os números com clareza.', resumo: resumoValor, trechos: fValor.slice(0, 2) });
      const fDesconto = achar(lista, ['descontad', 'abatid', 'deduzid']);
      if (fDesconto.length) {
        pontos[pontos.length - 1].alerta = 'Algumas despesas são descontadas da sua parte. Peça para anotar quanto foi gasto em cada coisa, para conferir na hora da divisão.';
        alertas.push('desconto');
      }
    } else {
      pontos.push({ id: 'valor', icone: 'dinheiro', titulo: 'Quanto custa', faltando: true, texto: 'Não achamos valor nem porcentagem no papel.', pergunta: 'Quanto é, no total, e em que datas paga?' });
    }

    /* QUEM PAGA O QUÊ */
    const fPaga = achar(lista, ['por conta d', 'a cargo d', 'pagos pelo', 'pago pelo', 'pagas pelo', 'pela parte', 'despesas', 'arcará', 'arcara', 'responsável pelo', 'responsavel pelo', 'serão pagos', 'serao pagos', 'custeado', 'itr']);
    if (fPaga.length) {
      pontos.push({ id: 'paga', icone: 'balanca', titulo: 'Quem paga o quê', texto: 'O papel diz quem paga algumas despesas. Leia o trecho abaixo e confira se é o que foi combinado de boca.', trechos: fPaga.slice(0, 3) });
    } else if (tipo !== 'credito') {
      pontos.push({ id: 'paga', icone: 'balanca', titulo: 'Quem paga o quê', faltando: true, texto: 'O papel não diz quem paga as despesas (adubo, luz, água, imposto da terra).', pergunta: 'Quem paga o quê: adubo, semente, luz, água e imposto da terra?' });
    }

    /* COMO SAIR */
    const fSair = achar(lista, ['rescis', 'rescind', 'denúncia', 'denuncia', 'aviso prévio', 'aviso previo', 'notificação', 'notificacao', 'a qualquer tempo', 'retomada', 'retomar', 'deixar a', 'desistência', 'desistencia', 'extinção', 'extincao']);
    if (fSair.length) {
      const f = fSair[0];
      const d = duracoes(f).find((x) => x.unidade === 'dias' || x.unidade === 'meses');
      let t = 'O papel diz como o acordo pode acabar antes do tempo.';
      if (d) t += ` O aviso é de ${d.texto.replace(/\s*\([^)]*\)/, '')} antes.`;
      const p = { id: 'sair', icone: 'porta', titulo: 'Como sair do acordo', texto: t, trechos: fSair.slice(0, 2) };
      const donoPode = contem(f, ['arrendador poderá', 'arrendador podera', 'outorgante poderá', 'outorgante podera', 'proprietário poderá', 'proprietario podera', 'a qualquer tempo']);
      if (donoPode && ehTerra && (!d || emDias(d) < 180)) {
        p.alerta = papel === 'cede'
          ? 'Pelo papel, você pode pedir a terra de volta com pouco aviso. Para quem usa a terra, isso pesa muito. Vale conversar para ficar justo para os dois.'
          : `Pelo papel, o dono pode pedir a terra ${d ? `com só ${d.texto.replace(/\s*\([^)]*\)/, '')} de aviso` : 'a qualquer momento'}. Isso pode não dar tempo de colher. Em geral, a lei do campo pede aviso de 6 meses antes do fim. Leve isso ao sindicato.`;
        alertas.push('saida-rapida');
      }
      pontos.push(p);
    } else if (tipo !== 'credito' && tipo !== 'compra') {
      pontos.push({ id: 'sair', icone: 'porta', titulo: 'Como sair do acordo', faltando: true, texto: 'O papel não diz como o acordo pode acabar nem com quanto tempo de aviso.', pergunta: 'Se alguém precisar sair do acordo, com quanto tempo de aviso fica combinado?' });
    }

    /* SE A TERRA FOR VENDIDA */
    if (ehTerra || tipo === 'outro') {
      const fVenda = achar(lista, ['alienação', 'alienacao', 'venda do imóvel', 'venda do imovel', 'vender', 'adquirente', 'preferência', 'preferencia', 'herdeiro', 'sucessor']);
      if (fVenda.length) {
        pontos.push({ id: 'venda', icone: 'planta', titulo: 'Se a terra for vendida', texto: 'O papel fala do que acontece se a terra for vendida ou passar para outra pessoa.', trechos: fVenda.slice(0, 2), alerta: contem(fVenda.join(' '), ['até o fim do ano', 'ate o fim do ano', 'até o final do ano']) ? 'Pelo papel, quem comprar só respeita o acordo até o fim da safra atual. Pergunte sobre os anos seguintes.' : undefined });
        if (contem(fVenda.join(' '), ['até o fim do ano', 'ate o fim do ano'])) alertas.push('venda');
      } else if (ehTerra) {
        pontos.push({ id: 'venda', icone: 'planta', titulo: 'Se a terra for vendida', faltando: true, texto: 'O papel não diz o que acontece se a terra for vendida ou passar para um parente do dono.', pergunta: 'Se a terra for vendida ou passar para outra pessoa, o que acontece com o acordo e com o plantio?' });
      }
    }

    /* MELHORIAS NA TERRA */
    if (ehTerra) {
      const fBenf = achar(lista, ['benfeitoria', 'poço', 'poco', 'cerca', 'irrigação', 'irrigacao', 'construç', 'construc', 'indeniza']);
      if (fBenf.length) {
        const semPagar = contem(fBenf.join(' '), ['sem direito a indeniza', 'sem indeniza', 'incorporad', 'não serão indenizad', 'nao serao indenizad']);
        const p = { id: 'melhoria', icone: 'ferramenta', titulo: 'O que você colocar na terra', texto: semPagar ? 'Pelo papel, o que for construído ou plantado na terra fica para o dono no fim, sem pagamento.' : contem(fBenf.join(' '), ['serão indenizad', 'serao indenizad', 'será indenizad', 'sera indenizad', 'direito a indeniza']) ? 'Pelo papel, as melhorias feitas na terra (como poço, cerca e irrigação) serão pagas no fim do acordo. Guarde as notas do que você gastar.' : 'O papel fala das melhorias feitas na terra, como poço, cerca e irrigação.', trechos: fBenf.slice(0, 2) };
        if (semPagar && papel !== 'cede') {
          p.alerta = 'Se você vai fazer poço, cerca ou irrigação, isso fica para o dono sem você receber. Em geral, a lei do campo dá direito a receber pelas melhorias úteis e necessárias. Pergunte ao sindicato antes de assinar.';
          alertas.push('benfeitoria');
        }
        pontos.push(p);
      } else {
        pontos.push({ id: 'melhoria', icone: 'ferramenta', titulo: 'O que você colocar na terra', faltando: true, texto: 'O papel não diz como fica o que for construído ou plantado (poço, cerca, bananeira, café).', pergunta: 'O que for feito na terra (poço, cerca, irrigação) fica como no fim do acordo?' });
      }
    }

    /* ATRASO, MULTA E JUROS */
    const fMulta = achar(lista, ['multa', 'juros de mora', 'mora', 'inadimpl', 'atraso']);
    if (fMulta.length) {
      const junto = fMulta.join(' ');
      const mMulta = junto.match(/multa de (\d{1,3}(?:,\d+)?\s?%)/i);
      const mJuros = junto.match(/juros(?: de mora)? de (\d{1,3}(?:,\d+)?\s?%)\s*(ao m[eê]s|ao ano|a\.m\.?|a\.a\.?)?/i);
      const partes = [];
      if (mMulta) partes.push(`multa de ${mMulta[1].replace(/\s/g, '')}`);
      if (mJuros) partes.push(`juros de ${mJuros[1].replace(/\s/g, '')}${mJuros[2] ? ' ' + mJuros[2].replace(/a\.m\.?/i, 'ao mês').replace(/a\.a\.?/i, 'ao ano') : ''}`);
      pontos.push({ id: 'multa', icone: 'alerta', titulo: 'Se atrasar ou não cumprir', texto: `Se atrasar, tem cobrança a mais${partes.length ? ': ' + partes.join(' e ') : ''}. Por isso, vale ter o dinheiro separado antes da data.`, trechos: fMulta.slice(0, 2) });
    }

    /* GARANTIA */
    const fGar = achar(lista, ['penhor', 'hipoteca', 'garantia', 'avalista', 'fiador', 'alienação fiduciária']);
    if (fGar.length) {
      const p = { id: 'garantia', icone: 'cadeado', titulo: 'O que fica como garantia', texto: 'Tem um bem prometido para cobrir a dívida. Se não pagar, esse bem pode ser tomado.', trechos: fGar.slice(0, 2) };
      if (contem(fGar.join(' '), ['hipoteca', 'imóvel', 'imovel'])) {
        p.alerta = 'A terra ou a casa pode ficar como garantia. Isso é sério: converse com o sindicato ou com a Defensoria antes de assinar.';
        alertas.push('hipoteca');
      }
      pontos.push(p);
    }

    /* CLÁUSULAS QUE TIRAM DIREITOS */
    const fRisco = achar(lista, ['renuncia', 'renúncia', 'irrevogável', 'irrevogavel', 'irretratável', 'irretratavel', 'abre mão', 'abre mao', 'sem direito']);
    const riscos = fRisco.filter((f) => !pontos.some((p) => (p.trechos || []).includes(f)));
    if (riscos.length) {
      pontos.push({ id: 'risco', icone: 'alerta', titulo: 'Partes que tiram direitos', texto: 'Estas partes dizem que alguém abre mão de um direito ou que não dá para voltar atrás.', trechos: riscos.slice(0, 2), alerta: 'Antes de assinar, peça para alguém de confiança ler estas partes com você.' });
      alertas.push('renuncia');
    }

    /* PALAVRAS DIFÍCEIS */
    const n = semAcento(texto);
    const vistos = new Set();
    const palavras = [];
    for (const [termo, sig] of D().GLOSSARIO) {
      if (n.includes(semAcento(termo)) && !vistos.has(sig)) {
        vistos.add(sig);
        const sigla = ['igp-m', 'ipca', 'proagro', 'itr'].includes(termo);
        palavras.push({ termo: sigla ? termo.toUpperCase() : termo.charAt(0).toUpperCase() + termo.slice(1), significado: sig });
      }
    }

    /* PERGUNTAS PRONTAS: primeiro as do que faltou no papel */
    const faltou = pontos.filter((p) => p.faltando && p.pergunta).map((p) => p.pergunta);
    const base = D().PERGUNTAS[ehTerra ? (papel === 'cede' ? 'cede' : papel === 'usa' ? 'usa' : 'usa') : 'outro'];
    const perguntas = unico([...faltou, ...base]).slice(0, 8);

    /* QUANDO BUSCAR AJUDA */
    const MOTIVOS = {
      'prazo-curto': 'O prazo é curto para o tipo de lavoura.',
      'sem-prazo': 'O papel não tem data para acabar.',
      'saida-rapida': 'O dono pode pedir a terra com pouco aviso.',
      benfeitoria: 'O que você construir fica sem pagamento.',
      hipoteca: 'A terra ou a casa fica como garantia.',
      renuncia: 'Tem partes em que alguém abre mão de direitos.',
      venda: 'Se a terra for vendida, o acordo pode não continuar.',
      desconto: 'Despesas são descontadas da sua parte da colheita.',
    };
    const quando = unico(alertas).map((a) => MOTIVOS[a]).filter(Boolean);
    quando.push('Sempre que algum valor ou prazo for diferente do que foi falado de boca.');

    const nivel = alertas.length >= 2 ? 'alto' : alertas.length === 1 ? 'medio' : 'baixo';

    /* RESUMO */
    const tipoInfo = D().TIPOS[tipo];
    const pPrazo = pontos.find((p) => p.id === 'prazo' && !p.faltando);
    const pValor = pontos.find((p) => p.id === 'valor' && !p.faltando);
    let resumo = tipo === 'outro' ? 'Lemos o seu papel.' : `Parece ser um ${tipoInfo.nome.charAt(0).toLowerCase() + tipoInfo.nome.slice(1)}.`;
    if (pPrazo) resumo += ' ' + pPrazo.texto.split(/\.\s/)[0].replace(/\.$/, '') + '.';
    if (pValor && pValor.resumo) resumo += ' ' + pValor.resumo;
    const nAlertas = unico(alertas).length;
    resumo += nAlertas ? ` Encontramos ${plural(nAlertas, 'ponto que pede', 'pontos que pedem')} atenção.` : ' Não achamos nenhum ponto muito preocupante, mas confira cada parte.';

    return {
      tipo,
      tipoNome: tipoInfo.nome,
      oQueE: tipoInfo.oQueE,
      lei: tipoInfo.lei,
      nivel,
      resumo,
      pontos,
      palavras,
      perguntas,
      quando,
      texto,
      lido: lista.length,
    };
  }

  /* ---------------- OCR (leitura das letras da foto) ---------------- */
  const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

  function carregarScript(src) {
    return new Promise((ok, erro) => {
      if (raiz.Tesseract) return ok();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => ok();
      s.onerror = () => erro(new Error('sem-internet'));
      document.head.appendChild(s);
    });
  }

  /* Diminui fotos muito grandes para ler mais rápido e gastar menos memória */
  function prepararImagem(arquivo) {
    return new Promise((ok) => {
      const img = new Image();
      const url = URL.createObjectURL(arquivo);
      img.onload = () => {
        const max = 2000;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * escala);
        c.height = Math.round(img.height * escala);
        const ctx = c.getContext('2d');
        ctx.filter = 'grayscale(1) contrast(1.2)';
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok(c);
      };
      img.onerror = () => ok(arquivo);
      img.src = url;
    });
  }

  let cancelado = false;
  let trabalhador = null;

  async function lerFoto(arquivo, aoProgredir) {
    cancelado = false;
    aoProgredir({ etapa: 'preparando', progresso: 0 });
    await carregarScript(TESSERACT_URL);
    if (cancelado) throw new Error('cancelado');
    const imagem = await prepararImagem(arquivo);
    trabalhador = await raiz.Tesseract.createWorker('por', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') aoProgredir({ etapa: 'lendo', progresso: m.progress });
        else if (/language|traineddata/i.test(m.status)) aoProgredir({ etapa: 'baixando', progresso: m.progress || 0 });
        else aoProgredir({ etapa: 'preparando', progresso: m.progress || 0 });
      },
    });
    if (cancelado) throw new Error('cancelado');
    const { data } = await trabalhador.recognize(imagem);
    await trabalhador.terminate();
    trabalhador = null;
    if (cancelado) throw new Error('cancelado');
    const texto = (data.text || '').trim();
    if (texto.replace(/\s/g, '').length < 40 || (data.confidence || 0) < 35) throw new Error('foto-ruim');
    return texto;
  }

  function cancelarLeitura() {
    cancelado = true;
    if (trabalhador) trabalhador.terminate().catch(() => {});
    trabalhador = null;
  }

  const api = { analisar, lerFoto, cancelarLeitura, normalizar, frases, detectarTipo, duracoes };
  raiz.Analisador = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
