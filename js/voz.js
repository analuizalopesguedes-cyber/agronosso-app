/* Áudio do AgroNosso.
   1) Se existir uma gravação de voz humana para aquele trecho (pasta audio/, lista em js/audios.js), toca a gravação.
   2) Se não existir, usa a voz do próprio celular, escolhendo a mais natural disponível.
   Só um áudio por vez. Sempre dá para parar. */
(function () {
  const sintese = 'speechSynthesis' in window ? window.speechSynthesis : null;
  const CHAVE = 'agronosso.v1.voz';
  let atual = null;
  let fila = [];
  let tocador = null;
  let aoMudar = () => {};
  let vozes = [];
  let vozForcada = null; // usada só no botão Testar

  const lerPref = () => { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } };
  const gravarPref = (p) => { try { localStorage.setItem(CHAVE, JSON.stringify(p)); } catch (e) { /* sem acesso */ } };
  let pref = Object.assign({ voz: null, velocidade: 1 }, lerPref());

  /* ---------- Escolha da voz mais natural ---------- */
  // Vozes "naturais/neurais/aprimoradas" soam bem menos robóticas que as básicas.
  const BOAS = /natural|neural|online|enhanced|premium|aprimorad|melhorad|wavenet|studio/i;
  const CONHECIDAS = /luciana|felipe|francisca|antonio|ant[oô]nio|thalita|brenda|donato|elza|fabio|giovanna|humberto|leila|leticia|manuela|nicolau|valerio|yara|google/i;
  const RUINS = /compact|eloquence|espeak|robot|novelty|grandma|grandpa|rocko|shelley|flo|reed|sandy/i;

  function nota(v) {
    let n = 0;
    if (/pt[-_]BR/i.test(v.lang)) n += 100;
    else if (/^pt/i.test(v.lang)) n += 40;
    else return -1;
    if (BOAS.test(v.name)) n += 50;
    if (CONHECIDAS.test(v.name)) n += 20;
    if (RUINS.test(v.name)) n -= 60;
    if (!v.localService) n += 5; // vozes online costumam ser mais naturais
    return n;
  }

  function carregarVozes() {
    if (!sintese) return [];
    vozes = sintese.getVoices().filter((v) => nota(v) >= 0).sort((a, b) => nota(b) - nota(a));
    return vozes;
  }
  if (sintese) {
    carregarVozes();
    sintese.addEventListener ? sintese.addEventListener('voiceschanged', carregarVozes) : (sintese.onvoiceschanged = carregarVozes);
  }

  function vozEscolhida() {
    if (!vozes.length) carregarVozes();
    return vozes.find((v) => v.voiceURI === pref.voz) || vozes[0] || null;
  }

  /* ---------- Texto mais fácil de ouvir ---------- */
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const ORDINAIS = { 1: 'primeira', 2: 'segunda', 3: 'terceira', 4: 'quarta', 5: 'quinta', 6: 'sexta', 7: 'sétima', 8: 'oitava', 9: 'nona', 10: 'décima' };

  function paraFala(t) {
    return String(t)
      // R$ 6.000,00 → 6000 reais | R$ 1.240,50 → 1240 reais e 50 centavos
      .replace(/R\$ ?(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{2}))?/g, (_, inteiro, cent) => {
        const r = inteiro.replace(/\./g, '');
        const c = cent && cent !== '00' ? ` e ${Number(cent)} centavos` : '';
        return `${r} ${r === '1' ? 'real' : 'reais'}${c}`;
      })
      // 01/03/2027 → 1 de março de 2027 | 30/06 → 30 de junho
      .replace(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g, (m, d, mes, ano) => {
        const nm = MESES[Number(mes) - 1];
        if (!nm) return m;
        return `${Number(d)} de ${nm}${ano ? ' de ' + ano : ''}`;
      })
      .replace(/(\d+(?:,\d+)?)\s?%/g, '$1 por cento')
      .replace(/Cl[áa]usula (\d+)[ªºa°]?/gi, (_, n) => `Cláusula ${ORDINAIS[n] || n}`)
      .replace(/\b(\d+) ?ha\b/g, '$1 hectares')
      .replace(/\bITR\b/g, 'I T R')
      .replace(/\bCPF\b/g, 'C P F')
      .replace(/\bIGP-M\b/gi, 'I G P M')
      .replace(/\bIPCA\b/g, 'I P C A')
      .replace(/\bATER\b/g, 'Áter')
      .replace(/\bnº\b/gi, 'número')
      .replace(/\s*[–—]\s*/g, ', ')
      .replace(/[“”"*]/g, '')
      .replace(/\(([^)]*)\)/g, ', $1,')
      .replace(/\s+,/g, ',')
      .replace(/,\s*,/g, ',')
      .replace(/\s{2,}/g, ' ');
  }

  /* Frases curtas: soa mais natural e evita cortes no meio em alguns celulares. */
  function pedacos(texto) {
    return paraFala(texto)
      .split(/(?<=[.!?;:])\s+/)
      .reduce((acc, f) => {
        const ultimo = acc[acc.length - 1];
        if (ultimo && (ultimo + ' ' + f).length < 160) acc[acc.length - 1] = ultimo + ' ' + f;
        else acc.push(f);
        return acc;
      }, [])
      .map((f) => f.trim())
      .filter(Boolean);
  }

  /* ---------- Reprodução ---------- */
  function falarProximo(id) {
    if (atual !== id) return;
    const trecho = fila.shift();
    if (!trecho) return terminar(id);
    const u = new SpeechSynthesisUtterance(trecho);
    const v = (vozForcada && vozes.find((x) => x.voiceURI === vozForcada)) || vozEscolhida();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'pt-BR';
    u.rate = pref.velocidade;
    u.pitch = 1;
    u.onend = () => setTimeout(() => falarProximo(id), 120); // pausa curta entre frases
    u.onerror = () => terminar(id);
    sintese.speak(u);
  }

  function terminar(id) {
    if (atual === id) {
      atual = null;
      fila = [];
      aoMudar(null);
    }
  }

  function gravacao(id) {
    const lista = window.AgroAudios || {};
    return lista[id] || null;
  }

  const Voz = {
    disponivel: () => !!sintese || !!window.Audio,
    temPortugues: () => !!vozEscolhida(),
    falando: () => atual,
    aoMudar: (fn) => { aoMudar = fn; },
    vozes: () => carregarVozes(),
    vozAtual: () => vozEscolhida(),
    preferencias: () => Object.assign({}, pref),
    escolherVoz(uri) { pref.voz = uri; gravarPref(pref); },
    escolherVelocidade(v) { pref.velocidade = v; gravarPref(pref); },
    paraFala,

    falar(id, texto, uriTeste) {
      Voz.parar();
      vozForcada = uriTeste || null;
      atual = id;
      aoMudar(id);
      const arquivo = uriTeste ? null : gravacao(id);
      if (arquivo && window.Audio) {
        tocador = new Audio(arquivo);
        tocador.playbackRate = pref.velocidade;
        tocador.onended = () => terminar(id);
        tocador.onerror = () => { tocador = null; if (atual === id) usarSintese(id, texto); };
        tocador.play().catch(() => { if (atual === id) usarSintese(id, texto); });
        return true;
      }
      return usarSintese(id, texto);
    },

    parar() {
      const id = atual;
      atual = null;
      fila = [];
      if (tocador) { tocador.pause(); tocador = null; }
      if (sintese) sintese.cancel();
      if (id) aoMudar(null);
    },
  };

  function usarSintese(id, texto) {
    if (!sintese) { terminar(id); return false; }
    sintese.cancel();
    fila = pedacos(texto);
    // pequeno atraso: alguns navegadores ignoram fala logo após cancel()
    setTimeout(() => falarProximo(id), 80);
    return true;
  }

  window.Voz = Voz;
})();
