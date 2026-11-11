/* Áudio: lê o texto em voz alta, em português, usando a voz do próprio celular (não gasta internet).
   Só um áudio por vez. Sempre dá para parar. */
(function () {
  const sintese = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let atual = null;
  let fila = [];
  let aoMudar = () => {};

  function vozPortugues() {
    if (!sintese) return null;
    const vozes = sintese.getVoices();
    return (
      vozes.find((v) => /pt[-_]BR/i.test(v.lang)) ||
      vozes.find((v) => /^pt/i.test(v.lang)) ||
      null
    );
  }
  if (sintese) sintese.onvoiceschanged = () => {};

  /* Divide em frases curtas: alguns celulares cortam falas longas no meio. */
  function pedacos(texto) {
    return String(texto)
      .replace(/R\$ ?/g, 'reais ')
      .replace(/(\d+)%/g, '$1 por cento')
      .split(/(?<=[.!?;:])\s+/)
      .reduce((acc, f) => {
        const ultimo = acc[acc.length - 1];
        if (ultimo && (ultimo + ' ' + f).length < 180) acc[acc.length - 1] = ultimo + ' ' + f;
        else acc.push(f);
        return acc;
      }, [])
      .filter(Boolean);
  }

  /* "reais 6.000,00" soa estranho; corrige para "6.000,00 reais" */
  function ajustarDinheiro(t) {
    return t.replace(/reais (\d[\d.,]*)/g, '$1 reais');
  }

  function falarProximo(id) {
    if (atual !== id) return;
    const trecho = fila.shift();
    if (!trecho) {
      terminar(id);
      return;
    }
    const u = new SpeechSynthesisUtterance(ajustarDinheiro(trecho));
    u.lang = 'pt-BR';
    const v = vozPortugues();
    if (v) u.voice = v;
    u.rate = 0.92;
    u.onend = () => falarProximo(id);
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

  const Voz = {
    disponivel: () => !!sintese,
    temPortugues: () => !!vozPortugues(),
    falando: () => atual,
    aoMudar: (fn) => { aoMudar = fn; },
    falar(id, texto) {
      if (!sintese) return false;
      sintese.cancel();
      atual = id;
      fila = pedacos(texto);
      aoMudar(id);
      // pequeno atraso: alguns navegadores ignoram fala logo após cancel()
      setTimeout(() => falarProximo(id), 60);
      return true;
    },
    parar() {
      if (!sintese) return;
      const id = atual;
      atual = null;
      fila = [];
      sintese.cancel();
      if (id) aoMudar(null);
    },
  };

  window.Voz = Voz;
})();
