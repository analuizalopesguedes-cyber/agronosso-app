/* AgroNosso — app web (HTML + CSS + JavaScript, sem dependências de build).
   Telas em rotas com # para funcionar no GitHub Pages. */
(function () {
  'use strict';

  const D = window.AgroDados;
  const A = window.Analisador;
  const V = window.Voz;
  const I = window.Icones.icone;
  const tela = document.getElementById('tela');

  /* =========================================================
     Utilidades
     ========================================================= */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const data = (iso) => { const d = new Date(iso); return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
  const dataCurta = (iso) => new Date(iso).toLocaleDateString('pt-BR');

  /* =========================================================
     Armazenamento: tudo fica só neste celular
     ========================================================= */
  const PREFIXO = 'agronosso.v1.';
  const Banco = {
    ler(chave, padrao) {
      try { const v = localStorage.getItem(PREFIXO + chave); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; }
    },
    gravar(chave, valor) {
      try { localStorage.setItem(PREFIXO + chave, JSON.stringify(valor)); return true; } catch (e) { return false; }
    },
    apagarTudo() {
      try { Object.keys(localStorage).filter((k) => k.startsWith(PREFIXO)).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* sem acesso */ }
    },
  };

  const estado = {
    config: Banco.ler('config', { visto: false, papel: null, letra: false }),
    papeis: Banco.ler('papeis', []),
    perguntas: Banco.ler('perguntas', []),
    combinados: Banco.ler('combinados', []),
    rascunho: Banco.ler('rascunho', null),
  };
  const salvar = (chave) => {
    if (!Banco.gravar(chave, estado[chave])) avisar('Não foi possível guardar no celular. A memória pode estar cheia.');
  };

  /* Fluxo atual de leitura (só em memória) */
  const fluxo = { fotos: [], texto: '', exemplo: null, ativo: false };

  /* =========================================================
     Aviso rápido (confirma ações e oferece Desfazer)
     ========================================================= */
  const caixaAviso = document.getElementById('aviso');
  let timerAviso = null;
  function avisar(texto, acao) {
    clearTimeout(timerAviso);
    caixaAviso.innerHTML = `${I('circulo-certo')}<span class="txt">${esc(texto)}</span>${acao ? `<button type="button">${esc(acao.rotulo)}</button>` : ''}`;
    caixaAviso.hidden = false;
    if (acao) caixaAviso.querySelector('button').onclick = () => { acao.fazer(); caixaAviso.hidden = true; };
    timerAviso = setTimeout(() => { caixaAviso.hidden = true; }, acao ? 7000 : 4000);
  }

  /* =========================================================
     Confirmação (antes de excluir)
     ========================================================= */
  function confirmar({ titulo, texto, sim = 'Excluir', nao = 'Cancelar' }) {
    return new Promise((resolver) => {
      const fundo = document.createElement('div');
      fundo.className = 'modal-fundo';
      fundo.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
          <h2 id="modal-titulo">${esc(titulo)}</h2>
          <p class="leitura">${esc(texto)}</p>
          <button type="button" class="botao primario" data-r="sim">${I('lixeira')}${esc(sim)}</button>
          <button type="button" class="botao secundario" data-r="nao">${esc(nao)}</button>
        </div>`;
      const fechar = (r) => { fundo.remove(); document.removeEventListener('keydown', tecla); resolver(r); };
      const tecla = (e) => { if (e.key === 'Escape') fechar(false); };
      fundo.addEventListener('click', (e) => {
        if (e.target === fundo) fechar(false);
        const b = e.target.closest('[data-r]');
        if (b) fechar(b.dataset.r === 'sim');
      });
      document.addEventListener('keydown', tecla);
      document.body.appendChild(fundo);
      fundo.querySelector('[data-r="nao"]').focus();
    });
  }

  /* =========================================================
     Áudio
     ========================================================= */
  const AUDIOS = {};
  function ouvir(id, texto, rotulo = 'Ouvir', grande = false) {
    AUDIOS[id] = texto;
    const tocando = V.falando() === id;
    return `<button type="button" class="botao-ouvir${grande ? ' grande' : ''}${tocando ? ' tocando' : ''}" data-ouvir="${esc(id)}" data-rotulo="${esc(rotulo)}" aria-pressed="${tocando}">
      ${I(tocando ? 'parar' : 'som')}<span>${tocando ? 'Parar' : esc(rotulo)}</span></button>`;
  }
  V.aoMudar((idAtual) => {
    document.querySelectorAll('[data-ouvir]').forEach((b) => {
      const on = b.dataset.ouvir === idAtual;
      b.classList.toggle('tocando', on);
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = `${I(on ? 'parar' : 'som')}<span>${on ? 'Parar' : esc(b.dataset.rotulo)}</span>`;
    });
  });
  function tocar(id) {
    if (V.falando() === id) return V.parar();
    if (!V.disponivel()) return avisar('Este celular não tem leitura em voz. Peça para alguém ler com você.');
    V.falar(id, AUDIOS[id] || '');
    if (!V.temPortugues()) avisar('Se a voz sair em outra língua, instale a voz em português nas configurações do celular.');
  }

  /* =========================================================
     Pedaços de tela reaproveitados
     ========================================================= */
  const cabecalho = (voltarPara, rotulo = 'Voltar', direita = '') => `
    <div class="cabecalho">
      <a class="botao texto" href="${voltarPara}">${I('voltar')}${esc(rotulo)}</a>
      <div>${direita}</div>
    </div>`;

  const ETAPAS_LEITURA = ['Quem é você', 'Foto', 'Leitura', 'Explicação'];
  function etapas(atual, nomes = ETAPAS_LEITURA) {
    const partes = nomes.map((n, i) => {
      const cls = i < atual ? 'feita' : i === atual ? 'atual' : '';
      const bola = i < atual ? I('certo', 20) : i + 1;
      const li = `<li class="${cls}"${i === atual ? ' aria-current="step"' : ''}><span class="bola">${bola}</span>${esc(n)}</li>`;
      return i < nomes.length - 1 ? li + `<li class="traco${i < atual ? ' feito' : ''}" aria-hidden="true"></li>` : li;
    });
    return `<div class="grupo-justo"><p class="pequeno"><strong>Passo ${atual + 1} de ${nomes.length}:</strong> ${esc(nomes[atual])}</p><ol class="etapas" aria-label="Passos">${partes.join('')}</ol></div>`;
  }

  const instrucoes = (lista) => `<ol class="instrucoes">${lista.map((p) => {
    const [t, sub] = Array.isArray(p) ? p : [p];
    return `<li><div><span class="leitura">${t}</span>${sub ? `<span class="auxiliar">${sub}</span>` : ''}</div></li>`;
  }).join('')}</ol>`;
  const textoDe = (lista) => lista.map((p, i) => `Passo ${i + 1}. ${(Array.isArray(p) ? p.join('. ') : p).replace(/<[^>]+>/g, '')}`).join(' ');

  const SELO = {
    alto: ['alto', 'alerta', 'Pede muita atenção'],
    medio: ['medio', 'info', 'Pede atenção'],
    baixo: ['', 'circulo-certo', 'Pouca coisa para se preocupar'],
  };
  const selo = (nivel) => { const [c, i, t] = SELO[nivel]; return `<span class="selo ${c}">${I(i, 18)}${t}</span>`; };

  const ROTULO_PAPEL = { usa: 'quem usa a terra', cede: 'quem é dono da terra', outro: 'outro tipo de papel' };

  /* =========================================================
     TELAS
     ========================================================= */

  /* ---------- Boas-vindas (primeiro acesso) ---------- */
  let slide = 0;
  const SLIDES = [
    { logo: true, titulo: 'Olá! Que bom ter você aqui.', texto: 'O AgroNosso explica papéis e combinados de terra em palavras simples. Você ouve, entende e decide com calma, junto com quem você confia.' },
    { icone: 'camera', titulo: 'Você tira uma foto do papel', texto: 'Contrato de arrendamento, parceria, meação ou empréstimo do banco. O app lê as letras e explica parte por parte: quanto custa, até quando vale, quem paga o quê e como sair.' },
    { icone: 'som', titulo: 'Você ouve e lê quantas vezes quiser', texto: 'Tudo tem um botão para ouvir. A explicação fica guardada para você rever depois com a família.' },
    { icone: 'escudo', titulo: 'Quem está por trás e os seus dados', texto: 'O AgroNosso é um projeto de estudantes de Design Digital da FIAP. Não é do dono da terra nem do banco. A foto e o texto ficam só no seu celular. Ninguém mais vê, a não ser que você mande.' },
    { icone: 'pessoas', titulo: 'É uma explicação, não uma decisão', texto: 'Quem decide é você e a sua família. Quando o assunto pesa, mostramos quem pode ajudar: sindicato, técnico, cartório ou advogado.' },
  ];
  function telaBoasVindas() {
    const s = SLIDES[slide];
    const ultimo = slide === SLIDES.length - 1;
    return {
      semTopo: true, semAbas: true,
      html: `
      <div class="linha fim">
        ${slide > 0 ? `<button type="button" class="botao texto" data-acao="slide-voltar">${I('voltar')}Voltar</button>` : '<span></span>'}
        ${!ultimo ? `<button type="button" class="botao texto" data-acao="slide-pular">Pular</button>` : '<span></span>'}
      </div>
      <div class="grupo centro" style="padding-top:var(--s3)">
        ${s.logo ? '<img class="logo-central" src="assets/logo-agronosso.svg" alt="AgroNosso" width="200" height="120">' : `<span class="ic verde grande">${I(s.icone, 56)}</span>`}
        <h1>${esc(s.titulo)}</h1>
        <p class="leitura">${esc(s.texto)}</p>
        ${ouvir('bv-' + slide, s.titulo + '. ' + s.texto)}
      </div>
      <div class="grupo">
        <div class="pontinhos" aria-label="Tela ${slide + 1} de ${SLIDES.length}" role="img">${SLIDES.map((_, i) => `<span class="${i === slide ? 'ativo' : ''}"></span>`).join('')}</div>
        <p class="auxiliar centro" style="text-align:center">${slide + 1} de ${SLIDES.length}</p>
        <button type="button" class="botao destaque" data-acao="${ultimo ? 'slide-fim' : 'slide-avancar'}">${ultimo ? I('certo') + 'Começar' : 'Continuar' + I('avancar')}</button>
        ${ultimo ? `<button type="button" class="botao secundario" data-acao="slide-guia">${I('guia')}Ver o passo a passo de como usar</button>` : ''}
      </div>`,
    };
  }

  /* ---------- Início ---------- */
  function telaInicio() {
    const recentes = estado.papeis.slice(0, 3);
    const pendentes = estado.perguntas.filter((p) => !p.resolvida).length;
    return {
      aba: 'inicio',
      html: `
      <div class="grupo-justo">
        <h1>O que você quer fazer hoje?</h1>
        <p class="auxiliar">Escolha uma opção. Cada uma tem o passo a passo.</p>
      </div>

      <section class="cartao escuro" aria-labelledby="t-entender">
        <div class="linha"><span class="ic claro">${I('camera')}</span><h2 id="t-entender" class="t-secao">Entender um papel</h2></div>
        <p class="leitura claro">Tire uma foto do contrato e a gente explica parte por parte, em palavras simples.</p>
        <a class="botao destaque" href="#/entender">${I('camera')}Começar</a>
      </section>

      <div class="opcoes">
        <a class="opcao" href="#/combinado">
          <span class="ic">${I('lapis')}</span>
          <span class="textos"><span class="t-sub">Anotar um combinado de boca</span><span class="auxiliar">Deixe por escrito o que foi falado, para ninguém esquecer.</span></span>
          ${I('seta')}
        </a>
        <a class="opcao" href="#/guia">
          <span class="ic">${I('guia')}</span>
          <span class="textos"><span class="t-sub">Como usar o app</span><span class="auxiliar">Passo a passo, com áudio.</span></span>
          ${I('seta')}
        </a>
        <a class="opcao" href="#/ajuda">
          <span class="ic">${I('pessoas')}</span>
          <span class="textos"><span class="t-sub">Quem pode ajudar</span><span class="auxiliar">Sindicato, técnico, cartório e advogado.</span></span>
          ${I('seta')}
        </a>
      </div>

      ${pendentes ? `<a class="cartao suave linha" href="#/perguntas" style="text-decoration:none;color:var(--carvao);padding:var(--s2) var(--s3)">${I('balao')}<span class="corpo" style="flex:1"><strong>Você tem ${pendentes} ${pendentes === 1 ? 'pergunta guardada' : 'perguntas guardadas'}</strong> para fazer.</span>${I('seta')}</a>` : ''}

      <section class="grupo" aria-labelledby="t-recentes">
        <div class="linha fim"><h2 id="t-recentes">Papéis recentes</h2>${estado.papeis.length > 3 ? '<a class="botao texto" href="#/papeis">Ver todos</a>' : ''}</div>
        ${recentes.length ? recentes.map(itemPapel).join('') : `
          <div class="cartao contorno">
            <p class="corpo">Ainda não tem nenhum papel aqui. Quer ver como funciona? Toque em um exemplo:</p>
            ${D.EXEMPLOS.map((e) => `<button type="button" class="opcao" data-acao="exemplo" data-chave="${e.chave}"><span class="ic">${I('papel')}</span><span class="textos"><span class="t-sub">${esc(e.descricao)}</span><span class="pequeno">Exemplo inventado, só para treinar</span></span>${I('seta')}</button>`).join('')}
          </div>`}
      </section>

      ${blocoInstalar()}

      <a class="botao texto" href="#/ajuda#seus-dados" style="align-self:center">${I('cadeado')}Quem está por trás e os seus dados</a>`,
    };
  }

  function itemPapel(p) {
    const an = p.analise;
    return `<a class="item" href="#/resultado/${p.id}">
      <span class="ic">${I('papel')}</span>
      <span class="textos"><span class="t-sub">${esc(an.tipoNome)}</span><span class="pequeno">Lido em ${data(p.criadoEm)}</span>${selo(an.nivel)}</span>
      <span class="seta">${I('seta')}</span></a>`;
  }

  /* ---------- Entender: passo 1 (quem é você) ---------- */
  function telaEntender() {
    fluxo.ativo = true;
    const p = estado.config.papel;
    const opc = (valor, icone, titulo, sub) => `
      <button type="button" class="opcao" role="radio" aria-checked="${p === valor}" data-acao="escolher-papel" data-valor="${valor}">
        <span class="ic">${I(icone)}</span>
        <span class="textos"><span class="t-sub">${titulo}</span><span class="auxiliar">${sub}</span></span>
        <span class="marca">${p === valor ? I('certo', 18) : ''}</span>
      </button>`;
    return {
      semAbas: true,
      html: `
      ${cabecalho('#/inicio', 'Cancelar')}
      ${etapas(0)}
      <div class="grupo-justo">
        <h1>Quem é você neste acordo?</h1>
        <p class="leitura">Assim a gente explica do seu lado e mostra as perguntas certas para você.</p>
      </div>
      ${ouvir('quem', 'Quem é você neste acordo? Escolha uma opção. Primeira: eu uso a terra de outra pessoa. Segunda: eu sou dono ou dona da terra e cedo para alguém. Terceira: é outro tipo de papel, como empréstimo do banco ou compra.')}
      <div class="opcoes" role="radiogroup" aria-label="Quem é você neste acordo">
        ${opc('usa', 'planta', 'Eu uso a terra de outra pessoa', 'Arrendo, sou parceiro ou meeiro.')}
        ${opc('cede', 'casa', 'Eu sou dono(a) da terra e cedo para alguém', 'Arrendo ou empresto a minha terra.')}
        ${opc('outro', 'papel', 'É outro tipo de papel', 'Empréstimo do banco, compra, venda ou outro.')}
      </div>
      <p class="campo" id="erro-papel" hidden><span class="erro">${I('alerta')}Escolha uma das opções acima para continuar.</span></p>
      <button type="button" class="botao destaque" data-acao="papel-continuar">Continuar${I('avancar')}</button>`,
    };
  }

  /* ---------- Entender: passo 2 (foto) ---------- */
  const PASSOS_FOTO = [
    ['Coloque o papel em cima de uma mesa, bem esticado.'],
    ['Fique perto de uma janela ou de uma luz.', 'Evite sombra em cima do papel.'],
    ['Segure o celular deitado, por cima do papel.', 'Deixe a folha inteira aparecer na tela.'],
    ['Toque em <strong>Abrir câmera</strong> e espere a imagem ficar nítida antes de tirar.'],
    ['Se o papel tiver mais de uma folha, tire uma foto de cada.', 'Depois de tirar a primeira, toque em Adicionar outra folha.'],
  ];
  function telaFoto() {
    if (!estado.config.papel) { location.hash = '#/entender'; return null; }
    fluxo.ativo = true;
    const tem = fluxo.fotos.length > 0;
    if (tem) {
      return {
        semAbas: true,
        html: `
        ${cabecalho('#/entender', 'Voltar')}
        ${etapas(1)}
        <div class="grupo-justo">
          <h1>A foto ficou boa?</h1>
          <p class="leitura">Confira antes de seguir:</p>
        </div>
        <div class="grupo">
          ${fluxo.fotos.map((f, i) => `<figure style="margin:0" class="grupo-justo"><img class="previa" src="${f.url}" alt="Foto da folha ${i + 1}"><figcaption class="pequeno">Folha ${i + 1} de ${fluxo.fotos.length}</figcaption></figure>`).join('')}
        </div>
        <div class="cartao">
          ${instrucoes(['Dá para ler as letras?', 'A folha inteira apareceu?', 'A foto não ficou escura nem tremida?'])}
          <p class="auxiliar">Se a resposta for não, toque em Tirar de novo.</p>
        </div>
        ${ouvir('conferir', 'A foto ficou boa? Confira: dá para ler as letras? A folha inteira apareceu? A foto não ficou escura nem tremida? Se a resposta for não, toque em tirar de novo.')}
        <div class="grupo">
          <button type="button" class="botao destaque" data-acao="ler-fotos">${I('certo')}Sim, ler o papel</button>
          <button type="button" class="botao secundario" data-acao="abrir-camera">${I('mais')}Adicionar outra folha</button>
          <button type="button" class="botao texto" data-acao="refazer-fotos" style="align-self:center">${I('recarregar')}Tirar de novo</button>
        </div>
        ${inputsFoto()}`,
      };
    }
    return {
      semAbas: true,
      html: `
      ${cabecalho('#/entender', 'Voltar')}
      ${etapas(1)}
      <div class="grupo-justo">
        <h1>Tire a foto do papel</h1>
        <p class="leitura">Faça assim, um passo de cada vez:</p>
      </div>
      <div class="cartao">
        ${instrucoes(PASSOS_FOTO)}
        ${ouvir('dicas-foto', 'Como tirar a foto. ' + textoDe(PASSOS_FOTO), 'Ouvir os passos')}
      </div>
      <p class="cartao suave linha" style="padding:var(--s2) var(--s3)">${I('cadeado')}<span class="corpo" style="flex:1">A foto fica só no seu celular. Ela não é mandada para ninguém.</span></p>
      <div class="grupo">
        <button type="button" class="botao destaque" data-acao="abrir-camera">${I('camera')}Abrir câmera</button>
        <button type="button" class="botao secundario" data-acao="abrir-galeria">${I('foto')}Escolher foto da galeria</button>
      </div>
      <div class="grupo">
        <h2>Outras formas</h2>
        <a class="opcao" href="#/entender/texto"><span class="ic">${I('prancheta')}</span><span class="textos"><span class="t-sub">Colar ou digitar o texto</span><span class="auxiliar">Se alguém mandou o texto do papel por mensagem.</span></span>${I('seta')}</a>
        ${D.EXEMPLOS.map((e) => `<button type="button" class="opcao" data-acao="exemplo" data-chave="${e.chave}"><span class="ic">${I('papel')}</span><span class="textos"><span class="t-sub">Testar com um exemplo</span><span class="auxiliar">${esc(e.descricao)}</span></span>${I('seta')}</button>`).join('')}
      </div>
      ${inputsFoto()}`,
    };
  }
  const inputsFoto = () => `
    <input type="file" accept="image/*" capture="environment" id="in-camera" class="sr" tabindex="-1" aria-hidden="true">
    <input type="file" accept="image/*" multiple id="in-galeria" class="sr" tabindex="-1" aria-hidden="true">`;

  /* ---------- Entender: colar texto ---------- */
  function telaTexto() {
    if (!estado.config.papel) { location.hash = '#/entender'; return null; }
    return {
      semAbas: true,
      html: `
      ${cabecalho('#/entender/foto', 'Voltar')}
      ${etapas(1)}
      <div class="grupo-justo">
        <h1>Colar ou digitar o texto</h1>
        <p class="leitura">Use quando alguém mandou o texto do papel por mensagem.</p>
      </div>
      <div class="cartao">
        ${instrucoes(['Abra a mensagem com o texto e segure o dedo em cima dele.', 'Toque em <strong>Copiar</strong>.', 'Volte aqui, segure o dedo no quadro abaixo e toque em <strong>Colar</strong>.'])}
      </div>
      <div class="campo">
        <label for="campo-texto">Texto do papel</label>
        <textarea id="campo-texto" rows="8" placeholder="Cole aqui o texto do contrato">${esc(fluxo.texto)}</textarea>
        <span class="erro" id="erro-texto" hidden>${I('alerta')}O texto está muito curto. Cole o papel inteiro.</span>
      </div>
      <button type="button" class="botao destaque" data-acao="ler-texto">${I('certo')}Explicar este texto</button>`,
    };
  }

  /* ---------- Entender: passo 3 (lendo) ---------- */
  let leituraErro = null;
  function telaLendo() {
    if (leituraErro) return telaErroLeitura(leituraErro);
    return {
      semAbas: true,
      html: `
      ${etapas(2)}
      <div class="grupo centro" style="text-align:center">
        <span class="ic verde grande pulsando">${I('papel', 56)}</span>
        <h1>Lendo o seu papel…</h1>
        <p class="leitura">Isso pode levar até 1 minuto. Pode deixar o celular parado.</p>
      </div>
      <div class="cartao" aria-live="polite">
        <div class="barra" role="progressbar" aria-label="Andamento da leitura" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="barra"></span></div>
        <ul class="grupo" style="list-style:none;padding:0;margin:0" id="etapas-leitura">
          ${[['preparando', 'Preparando a foto'], ['baixando', 'Baixando o leitor de letras (só na primeira vez)'], ['lendo', 'Lendo as letras'], ['explicando', 'Explicando em palavras simples']]
            .map(([k, t]) => `<li class="linha corpo" data-etapa="${k}" style="color:var(--oliva)">${I('circulo', 28)}<span>${t}</span></li>`).join('')}
        </ul>
      </div>
      <p class="auxiliar centro" style="text-align:center">Na primeira vez, o app baixa o leitor de letras (alguns MB). Se puder, use o Wi-Fi de casa. Depois, funciona sem gastar dados de novo.</p>
      <button type="button" class="botao secundario" data-acao="cancelar-leitura">${I('fechar')}Cancelar</button>`,
      montar: iniciarLeitura,
    };
  }

  function atualizarLeitura(etapa, progresso) {
    const ordem = ['preparando', 'baixando', 'lendo', 'explicando'];
    const idx = ordem.indexOf(etapa);
    document.querySelectorAll('#etapas-leitura [data-etapa]').forEach((li) => {
      const i = ordem.indexOf(li.dataset.etapa);
      const feito = i < idx;
      const agora = i === idx;
      li.style.color = feito ? 'var(--carvao)' : agora ? 'var(--verde)' : 'var(--oliva)';
      li.style.fontWeight = agora ? '500' : '400';
      li.querySelector('svg').outerHTML = I(feito ? 'circulo-certo' : agora ? 'relogio' : 'circulo', 28);
    });
    const total = Math.round(((idx + (progresso || 0)) / ordem.length) * 100);
    const barra = document.getElementById('barra');
    if (barra) {
      barra.style.width = total + '%';
      barra.parentElement.setAttribute('aria-valuenow', String(total));
    }
  }

  let lendoAgora = false;
  let resultadoDoFluxo = null;
  async function iniciarLeitura() {
    if (lendoAgora) return;
    lendoAgora = true;
    try {
      let texto = fluxo.texto;
      let origem = 'texto';
      if (fluxo.exemplo) {
        origem = 'exemplo';
        texto = D.EXEMPLOS.find((e) => e.chave === fluxo.exemplo).texto;
        for (const etapa of ['preparando', 'lendo']) {
          atualizarLeitura(etapa, 0.5);
          await esperar(700);
        }
      } else if (fluxo.fotos.length) {
        origem = 'foto';
        if (!navigator.onLine && !window.Tesseract) throw new Error('sem-internet');
        const partes = [];
        for (let i = 0; i < fluxo.fotos.length; i++) {
          partes.push(await A.lerFoto(fluxo.fotos[i].arquivo, ({ etapa, progresso }) => atualizarLeitura(etapa, (i + progresso) / fluxo.fotos.length)));
        }
        texto = partes.join('\n');
      }
      if (!location.hash.startsWith('#/entender/lendo')) return; // a pessoa saiu da tela
      atualizarLeitura('explicando', 0.5);
      await esperar(400);
      const analise = A.analisar(texto, estado.config.papel);
      const doc = { id: novoId(), criadoEm: new Date().toISOString(), papel: estado.config.papel, origem, analise };
      estado.papeis.unshift(doc);
      salvar('papeis');
      limparFluxo();
      resultadoDoFluxo = doc.id;
      avisar('Pronto! O papel foi guardado em Papéis.');
      location.replace('#/resultado/' + doc.id);
    } catch (e) {
      if (e && e.message === 'cancelado') return;
      leituraErro = e && e.message === 'foto-ruim' ? 'foto-ruim' : !navigator.onLine || (e && e.message === 'sem-internet') ? 'sem-internet' : 'geral';
      if (location.hash.startsWith('#/entender/lendo')) desenhar();
    } finally {
      lendoAgora = false;
    }
  }
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  function telaErroLeitura(tipo) {
    const ERROS = {
      'foto-ruim': {
        titulo: 'Não conseguimos ler bem a foto',
        texto: 'Não é culpa sua. Isso acontece quando a foto fica escura, tremida ou cortada.',
        passos: ['Vá para perto de uma janela ou acenda a luz.', 'Estique bem o papel em cima da mesa.', 'Segure o celular parado até a imagem ficar nítida.', 'Tire a foto de novo.'],
      },
      'sem-internet': {
        titulo: 'Sem internet agora',
        texto: 'Na primeira leitura, o app precisa de internet para baixar o leitor de letras. Depois disso, funciona sem internet.',
        passos: ['Conecte no Wi-Fi de casa ou ligue os dados.', 'Toque em Tentar de novo.', 'Se não tiver internet, você pode colar o texto do papel.'],
      },
      geral: {
        titulo: 'Algo deu errado na leitura',
        texto: 'Não é culpa sua. Vamos tentar de novo.',
        passos: ['Toque em Tentar de novo.', 'Se não der certo, tire a foto de novo ou cole o texto do papel.'],
      },
    };
    const m = ERROS[tipo];
    return {
      semAbas: true,
      html: `
      ${etapas(2)}
      <div class="grupo centro" style="text-align:center" role="alert">
        <span class="ic grande">${I(tipo === 'sem-internet' ? 'sem-sinal' : 'alerta', 56)}</span>
        <h1>${m.titulo}</h1>
        <p class="leitura">${m.texto}</p>
      </div>
      <div class="cartao"><h2>O que fazer</h2>${instrucoes(m.passos)}${ouvir('erro', m.titulo + '. ' + m.texto + ' O que fazer: ' + textoDe(m.passos))}</div>
      <div class="grupo">
        ${tipo === 'foto-ruim' ? `<button type="button" class="botao destaque" data-acao="refazer-fotos">${I('camera')}Tirar a foto de novo</button>` : `<button type="button" class="botao destaque" data-acao="tentar-de-novo">${I('recarregar')}Tentar de novo</button>`}
        <a class="botao secundario" href="#/entender/texto">${I('prancheta')}Colar o texto do papel</a>
        <a class="botao texto" href="#/inicio" style="align-self:center">Voltar ao início</a>
      </div>`,
    };
  }

  function limparFluxo() {
    fluxo.fotos.forEach((f) => URL.revokeObjectURL(f.url));
    fluxo.fotos = [];
    fluxo.texto = '';
    fluxo.exemplo = null;
    leituraErro = null;
  }

  /* ---------- Passo 4: explicação ---------- */
  function telaResultado(id) {
    const doc = estado.papeis.find((p) => p.id === id);
    if (!doc) return telaNaoAchou();
    const an = doc.analise;
    const veioDoFluxo = resultadoDoFluxo === id;
    fluxo.ativo = false;
    const papelTxt = ROTULO_PAPEL[doc.papel] || '';
    const ehTerra = ['arrendamento', 'parceria', 'comodato'].includes(an.tipo);

    const PASSOS_LER = [
      'Ouça ou leia o resumo aqui em cima.',
      'Abra cada parte abaixo, uma de cada vez.',
      ['Onde tiver o sinal de <strong>atenção</strong>, leia com calma.', 'É ali que o papel pode pesar para você.'],
      'Guarde as perguntas que você quer fazer.',
      'Mande para alguém de confiança antes de decidir.',
    ];

    const chip = (p) => p.alerta ? `<span class="selo alto">${I('alerta', 18)}Atenção</span>` : p.faltando ? `<span class="selo medio">${I('info', 18)}Não está no papel</span>` : `<span class="selo">${I('certo', 18)}Está no papel</span>`;

    const partes = an.pontos.map((p, i) => {
      const audio = `${p.titulo}. ${p.texto} ${p.alerta || ''} ${p.pergunta ? 'Pergunta para fazer: ' + p.pergunta : ''}`;
      return `
      <details class="acordeao" ${p.alerta ? 'open' : ''}>
        <summary><span class="ic">${I(p.icone)}</span><span class="grupo-justo" style="flex:1"><span class="t-sub" style="color:var(--verde);font-size:1.25rem">${esc(p.titulo)}</span>${chip(p)}</span><span class="seta-acordeao">${I('abaixo')}</span></summary>
        <div class="corpo-acordeao">
          <p class="leitura">${esc(p.texto)}</p>
          ${p.alerta ? `<div class="cartao alerta linha-topo" style="padding:var(--s2) var(--s3)">${I('alerta')}<p class="corpo" style="flex:1">${esc(p.alerta)}</p></div>` : ''}
          ${(p.trechos || []).length ? `<div class="grupo-justo"><p class="pequeno"><strong>No papel está assim:</strong></p>${p.trechos.slice(0, 2).map((t) => `<blockquote class="trecho" style="margin:0">${esc(t)}</blockquote>`).join('')}</div>` : ''}
          ${p.pergunta ? `<div class="grupo-justo"><p class="pequeno"><strong>Pergunta para fazer:</strong></p><p class="leitura">“${esc(p.pergunta)}”</p>${botaoGuardar(p.pergunta, doc)}</div>` : ''}
          ${ouvir(`r-${doc.id}-${i}`, audio)}
        </div>
      </details>`;
    }).join('');

    const textoTudo = [
      an.resumo,
      ...an.pontos.map((p) => `${p.titulo}. ${p.texto} ${p.alerta || ''}`),
      'Quando buscar ajuda: ' + an.quando.join(' '),
    ].join(' ');

    return {
      semAbas: veioDoFluxo,
      html: `
      ${cabecalho(veioDoFluxo ? '#/inicio' : '#/papeis', veioDoFluxo ? 'Início' : 'Voltar', `<button type="button" class="botao-icone" data-acao="compartilhar-papel" data-id="${doc.id}" aria-label="Mandar a explicação">${I('enviar')}</button>`)}
      ${veioDoFluxo ? etapas(3) : ''}
      ${doc.origem === 'exemplo' ? `<p class="cartao suave linha" style="padding:var(--s2) var(--s3)">${I('info')}<span class="corpo" style="flex:1">Este é um exemplo inventado, só para treinar. Os nomes e valores não são de verdade.</span></p>` : ''}

      <div class="grupo-justo">
        ${selo(an.nivel)}
        <h1>${esc(an.tipoNome)}</h1>
        <p class="auxiliar">Lido em ${data(doc.criadoEm)}${papelTxt ? ` · explicado para ${papelTxt}` : ''}</p>
      </div>

      <section class="cartao" aria-labelledby="t-resumo">
        <h2 id="t-resumo">Em poucas palavras</h2>
        <p class="leitura">${esc(an.resumo)}</p>
        ${ouvir('tudo-' + doc.id, textoTudo, 'Ouvir a explicação inteira', true)}
      </section>

      <details class="acordeao">
        <summary><span class="ic verde">${I('guia')}</span><span class="t-sub">Como ler esta explicação</span><span class="seta-acordeao">${I('abaixo')}</span></summary>
        <div class="corpo-acordeao">${instrucoes(PASSOS_LER)}${ouvir('como-ler', 'Como ler esta explicação. ' + textoDe(PASSOS_LER))}</div>
      </details>

      <section class="grupo" aria-labelledby="t-partes">
        <div class="grupo-justo">
          <h2 id="t-partes">As partes que pesam</h2>
          <p class="auxiliar">Toque em cada parte para abrir. As que pedem atenção já estão abertas.</p>
        </div>
        ${partes}
      </section>

      <section class="grupo" aria-labelledby="t-mais">
        <h2 id="t-mais">Para entender melhor</h2>
        <details class="acordeao">
          <summary><span class="ic">${I('papel')}</span><span class="t-sub">O que é este papel</span><span class="seta-acordeao">${I('abaixo')}</span></summary>
          <div class="corpo-acordeao">
            <p class="leitura">${esc(an.oQueE)}</p>
            ${an.lei.length ? `<h3>O que a lei do campo costuma dizer</h3><ul class="grupo" style="margin:0;padding-left:var(--s3)">${an.lei.map((l) => `<li class="corpo">${esc(l)}</li>`).join('')}</ul><p class="pequeno">Cada caso é um caso. Confirme com o sindicato ou com um advogado.</p>` : ''}
            ${ouvir('oque-' + doc.id, an.oQueE + ' ' + an.lei.join(' '))}
          </div>
        </details>
        ${an.palavras.length ? `
        <details class="acordeao">
          <summary><span class="ic">${I('guia')}</span><span class="t-sub">Palavras difíceis (${an.palavras.length})</span><span class="seta-acordeao">${I('abaixo')}</span></summary>
          <div class="corpo-acordeao">
            ${an.palavras.map((w) => `<div class="grupo-justo"><h3 style="color:var(--verde)">${esc(w.termo)}</h3><p class="leitura">${esc(w.significado)}</p></div><hr class="divisor">`).join('')}
            ${ouvir('palavras-' + doc.id, an.palavras.map((w) => `${w.termo}: ${w.significado}`).join(' '))}
          </div>
        </details>` : ''}
        <details class="acordeao">
          <summary><span class="ic">${I('olho')}</span><span class="t-sub">Ver o texto que o app leu</span><span class="seta-acordeao">${I('abaixo')}</span></summary>
          <div class="corpo-acordeao"><p class="corpo" style="white-space:pre-wrap">${esc(an.texto)}</p><p class="pequeno">Se o texto estiver muito diferente do papel, tire a foto de novo com mais luz.</p></div>
        </details>
      </section>

      <section class="cartao" aria-labelledby="t-perguntas">
        <h2 id="t-perguntas">Perguntas para fazer</h2>
        <p class="corpo">${ehTerra ? 'São perguntas que todo mundo faz antes de fechar um acordo de terra. Perguntar não é desconfiança: é cuidar do combinado dos dois lados.' : 'Perguntas que valem a pena fazer antes de assinar.'}</p>
        ${an.perguntas.map((q) => `<div class="grupo-justo" style="padding-bottom:var(--s2);border-bottom:1px solid var(--linha)"><p class="leitura">“${esc(q)}”</p>${botaoGuardar(q, doc)}</div>`).join('')}
        ${ouvir('perg-' + doc.id, 'Perguntas para fazer. ' + an.perguntas.join(' '))}
      </section>

      <section class="cartao escuro" aria-labelledby="t-ajuda">
        <div class="linha"><span class="ic claro">${I('pessoas')}</span><h2 id="t-ajuda" class="t-secao claro">Quando buscar ajuda</h2></div>
        <ul class="grupo" style="margin:0;padding-left:var(--s3)">${an.quando.map((q) => `<li class="leitura claro">${esc(q)}</li>`).join('')}</ul>
        <h3 class="claro">Quem pode ajudar</h3>
        ${D.QUEM_AJUDA.slice(0, 3).map((q) => `<div class="grupo-justo" style="background:rgba(244,239,228,.10);border-radius:var(--r-m);padding:var(--s2) var(--s3)"><strong class="claro">${esc(q.nome)}</strong><span class="corpo claro">${esc(q.texto)}</span></div>`).join('')}
        ${ouvir('ajuda-' + doc.id, 'Quando buscar ajuda. ' + an.quando.join(' ') + ' Quem pode ajudar: ' + D.QUEM_AJUDA.slice(0, 3).map((q) => q.nome + '. ' + q.texto).join(' '))}
        <a class="botao claro-sec" href="#/ajuda">Ver todos que podem ajudar</a>
      </section>

      <div class="grupo">
        <button type="button" class="botao primario" data-acao="compartilhar-papel" data-id="${doc.id}">${I('enviar')}Mandar para alguém da família</button>
        <button type="button" class="botao texto" data-acao="excluir-papel" data-id="${doc.id}" style="align-self:center">${I('lixeira')}Excluir este papel</button>
      </div>
      <p class="linha-topo auxiliar">${I('info')}<span style="flex:1">O AgroNosso ajuda a entender o papel, mas não decide por você e não substitui a orientação de um profissional.</span></p>`,
    };
  }

  function botaoGuardar(texto, doc) {
    const ja = estado.perguntas.some((p) => p.texto === texto && p.docId === (doc && doc.id));
    return `<button type="button" class="botao-ouvir" data-acao="guardar-pergunta" data-texto="${esc(texto)}" data-doc="${doc ? doc.id : ''}" ${ja ? 'disabled aria-disabled="true"' : ''} style="${ja ? 'background:var(--verde);color:var(--papel)' : ''}">${I(ja ? 'certo' : 'marcador')}<span>${ja ? 'Guardada' : 'Guardar esta pergunta'}</span></button>`;
  }

  function textoCompartilhar(doc) {
    const an = doc.analise;
    return [
      `*${an.tipoNome}* (explicado pelo AgroNosso)`,
      '',
      an.resumo,
      '',
      ...an.pontos.map((p) => `• ${p.titulo}: ${p.texto}${p.alerta ? ' ATENÇÃO: ' + p.alerta : ''}`),
      '',
      'Perguntas para fazer:',
      ...an.perguntas.slice(0, 5).map((q) => `- ${q}`),
      '',
      'É uma explicação para ajudar a entender. Não substitui a orientação de um profissional.',
    ].join('\n');
  }

  /* ---------- Combinado de boca (uma pergunta por tela) ---------- */
  const DESPESAS = ['Adubo e semente', 'Luz', 'Água', 'Imposto da terra (ITR)', 'Cerca e manutenção'];
  const QUEM = [['usa', 'Quem usa a terra'], ['dono', 'O dono'], ['dois', 'Os dois'], ['nao', 'Não combinamos']];
  const PERG_COMB = [
    { id: 'papel', titulo: 'Quem é você neste combinado?', ajuda: 'Escolha uma opção.', tipo: 'escolha', opcoes: [['usa', 'Eu uso a terra de outra pessoa'], ['cede', 'Eu sou dono(a) da terra']] },
    { id: 'pessoas', titulo: 'Com quem é o combinado?', ajuda: 'Escreva o nome da outra pessoa. O seu nome é opcional.', tipo: 'campos', campos: [['outra', 'Nome da outra pessoa', 'Ex.: Antônio Mendes'], ['seu', 'Seu nome (opcional)', 'Ex.: José Carlos']] },
    { id: 'terra', titulo: 'Qual é a terra?', ajuda: 'Diga o tamanho e onde fica, do jeito que vocês falam.', tipo: 'campos', campos: [['terra', 'A terra', 'Ex.: 5 hectares do Sítio Boa Vista, perto do córrego']] },
    { id: 'uso', titulo: 'O que vai ser plantado ou criado?', ajuda: 'Pode escrever mais de uma coisa.', tipo: 'campos', campos: [['uso', 'Plantação ou criação', 'Ex.: hortaliças e feijão']] },
    { id: 'pagamento', titulo: 'Como fica o pagamento?', ajuda: 'Escolha uma opção e depois escreva os detalhes.', tipo: 'escolha', opcoes: [['dinheiro', 'Em dinheiro'], ['colheita', 'Com parte da colheita'], ['gratis', 'Sem pagamento (de graça)']], campos: [['detalhe', 'Detalhes do pagamento', 'Ex.: R$ 6.000 por ano, em duas vezes: junho e dezembro']] },
    { id: 'prazo', titulo: 'Por quanto tempo vale?', ajuda: 'Toque em uma opção ou escreva.', tipo: 'atalhos', atalhos: ['1 ano', '3 anos', '5 anos', 'Sem prazo definido'], campos: [['prazo', 'Tempo do combinado', 'Ex.: 3 anos'], ['inicio', 'Começa quando? (opcional)', 'Ex.: março de 2027']] },
    { id: 'despesas', titulo: 'Quem paga cada coisa?', ajuda: 'Para cada despesa, toque em quem paga.', tipo: 'despesas' },
    { id: 'melhorias', titulo: 'E o que for construído ou plantado que dura anos?', ajuda: 'Por exemplo: poço, cerca, curral, irrigação, bananeira, café.', tipo: 'escolha', opcoes: [['paga', 'Fica para o dono e ele paga o valor'], ['fica', 'Fica para o dono, sem pagar'], ['leva', 'Quem usa a terra pode levar ou desmanchar'], ['nao', 'Ainda não combinamos']], campos: [['melhoria', 'Detalhes (opcional)', 'Ex.: o poço que eu fizer, ele paga metade']] },
    { id: 'saida', titulo: 'Se alguém precisar sair, com quanto tempo de aviso?', ajuda: 'Toque em uma opção ou escreva.', tipo: 'atalhos', atalhos: ['3 meses', '6 meses', 'Só depois da colheita', 'Não combinamos'], campos: [['saida', 'Tempo de aviso', 'Ex.: 6 meses antes']] },
  ];

  function rascunho() {
    if (!estado.rascunho) estado.rascunho = { passo: 0, r: { despesas: {} } };
    return estado.rascunho;
  }

  function telaCombinado() {
    const rs = rascunho();
    const q = PERG_COMB[rs.passo];
    const r = rs.r;
    const total = PERG_COMB.length;
    let corpo = '';
    if (q.opcoes) {
      corpo += `<div class="opcoes" role="radiogroup" aria-label="${esc(q.titulo)}">${q.opcoes.map(([v, t]) => `
        <button type="button" class="opcao" role="radio" aria-checked="${r[q.id] === v}" data-acao="comb-opcao" data-campo="${q.id}" data-valor="${v}">
          <span class="textos"><span class="t-sub">${esc(t)}</span></span><span class="marca">${r[q.id] === v ? I('certo', 18) : ''}</span></button>`).join('')}</div>`;
    }
    if (q.atalhos) {
      corpo += `<div class="linha" style="flex-wrap:wrap;gap:var(--s1)">${q.atalhos.map((a) => `<button type="button" class="botao secundario auto" data-acao="comb-atalho" data-campo="${q.campos[0][0]}" data-valor="${esc(a)}">${esc(a)}</button>`).join('')}</div>`;
    }
    if (q.campos) {
      corpo += q.campos.map(([k, rot, ph]) => `<div class="campo"><label for="c-${k}">${esc(rot)}</label><input id="c-${k}" data-campo="${k}" value="${esc(r[k] || '')}" placeholder="${esc(ph)}" autocomplete="off"></div>`).join('');
    }
    if (q.tipo === 'despesas') {
      corpo += DESPESAS.map((d) => `
        <div class="grupo-justo">
          <h3>${esc(d)}</h3>
          <div class="linha" role="radiogroup" aria-label="Quem paga: ${esc(d)}" style="flex-wrap:wrap;gap:var(--s1)">
            ${QUEM.map(([v, t]) => `<button type="button" class="botao auto ${r.despesas[d] === v ? 'primario' : 'secundario'}" role="radio" aria-checked="${r.despesas[d] === v}" data-acao="comb-despesa" data-item="${esc(d)}" data-valor="${v}" style="min-height:3rem;font-size:1rem">${esc(t)}</button>`).join('')}
          </div>
        </div>`).join('');
    }
    const audio = `Pergunta ${rs.passo + 1} de ${total}. ${q.titulo} ${q.ajuda} ${q.opcoes ? 'Opções: ' + q.opcoes.map((o) => o[1]).join('. ') : ''}`;
    return {
      semAbas: true,
      html: `
      ${cabecalho('#/inicio', 'Sair')}
      <div class="grupo-justo">
        <p class="pequeno"><strong>Pergunta ${rs.passo + 1} de ${total}</strong></p>
        <div class="barra" role="progressbar" aria-label="Andamento" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${rs.passo + 1}"><span style="width:${((rs.passo + 1) / total) * 100}%"></span></div>
      </div>
      ${rs.passo === 0 ? `<div class="cartao suave"><h2>Anotar um combinado de boca</h2><p class="corpo">Combinado de boca também vale pela lei do campo, mas depois cada um pode lembrar de um jeito. Vamos anotar juntos, uma pergunta por vez. No fim, você manda o resumo para a outra pessoa conferir.</p>${ouvir('comb-intro', 'Anotar um combinado de boca. Combinado de boca também vale pela lei do campo, mas depois cada um pode lembrar de um jeito. Vamos anotar juntos, uma pergunta por vez. No fim, você manda o resumo para a outra pessoa conferir.')}</div>` : ''}
      <div class="grupo-justo">
        <h1>${esc(q.titulo)}</h1>
        <p class="leitura">${esc(q.ajuda)}</p>
      </div>
      ${ouvir('comb-' + rs.passo, audio, 'Ouvir a pergunta')}
      <div class="grupo">${corpo}</div>
      <div class="grupo">
        <button type="button" class="botao destaque" data-acao="comb-avancar">${rs.passo === total - 1 ? I('certo') + 'Ver o resumo' : 'Continuar' + I('avancar')}</button>
        <div class="linha fim">
          ${rs.passo > 0 ? `<button type="button" class="botao texto" data-acao="comb-voltar">${I('voltar')}Voltar</button>` : '<span></span>'}
          <button type="button" class="botao texto" data-acao="comb-pular">Pular esta pergunta</button>
        </div>
      </div>
      <p class="auxiliar">Suas respostas ficam guardadas aqui no celular enquanto você responde.</p>`,
      montar: () => {
        tela.querySelectorAll('input[data-campo]').forEach((inp) => inp.addEventListener('input', () => {
          rascunho().r[inp.dataset.campo] = inp.value;
          salvar('rascunho');
        }));
      },
    };
  }

  const TXT_PAG = { dinheiro: 'Em dinheiro', colheita: 'Com parte da colheita', gratis: 'Sem pagamento (de graça)' };
  const TXT_MELH = { paga: 'Fica para o dono, e ele paga o valor', fica: 'Fica para o dono, sem pagar', leva: 'Quem usa a terra pode levar ou desmanchar', nao: 'Ainda não combinamos' };
  const TXT_QUEM = { usa: 'quem usa a terra', dono: 'o dono', dois: 'os dois', nao: 'não combinamos' };

  function textoCombinado(c) {
    const r = c.respostas;
    const eu = r.seu ? r.seu : 'Eu';
    const outra = r.outra || 'a outra pessoa';
    const usa = r.papel === 'cede' ? outra : eu;
    const dono = r.papel === 'cede' ? eu : outra;
    const linhas = [
      `*Resumo do nosso combinado*`,
      `Anotado no AgroNosso em ${dataCurta(c.criadoEm)}, para ninguém esquecer o que foi falado.`,
      '',
      `• Quem usa a terra: ${usa}`,
      `• Dono(a) da terra: ${dono}`,
    ];
    if (r.terra) linhas.push(`• Terra: ${r.terra}`);
    if (r.uso) linhas.push(`• Para: ${r.uso}`);
    if (r.pagamento || r.detalhe) linhas.push(`• Pagamento: ${[TXT_PAG[r.pagamento], r.detalhe].filter(Boolean).join('. ')}`);
    if (r.prazo || r.inicio) linhas.push(`• Prazo: ${[r.prazo, r.inicio ? 'começa em ' + r.inicio : ''].filter(Boolean).join(', ')}`);
    const desp = Object.entries(r.despesas || {});
    if (desp.length) linhas.push('• Quem paga:', ...desp.map(([k, v]) => `   - ${k}: ${TXT_QUEM[v]}`));
    if (r.melhorias || r.melhoria) linhas.push(`• O que for construído ou plantado que dura anos: ${[TXT_MELH[r.melhorias], r.melhoria].filter(Boolean).join('. ')}`);
    if (r.saida) linhas.push(`• Aviso para sair do combinado: ${r.saida}`);
    linhas.push('', 'Se estiver tudo certo, responda "De acordo" nesta mensagem. Se algo estiver diferente, me fale para a gente acertar.');
    return linhas.join('\n');
  }

  function telaCombinadoResumo(id) {
    const c = estado.combinados.find((x) => x.id === id);
    if (!c) return telaNaoAchou();
    const txt = textoCombinado(c);
    const faltam = [];
    const r = c.respostas;
    if (!r.prazo) faltam.push('prazo');
    if (!r.pagamento && !r.detalhe) faltam.push('pagamento');
    if (!r.saida || r.saida === 'Não combinamos') faltam.push('aviso para sair');
    if (!r.melhorias || r.melhorias === 'nao') faltam.push('o que acontece com o que for construído');
    const PASSOS = [
      'Ouça o resumo e confira se está tudo certo.',
      'Se algo estiver errado, toque em <strong>Corrigir respostas</strong>.',
      'Toque em <strong>Enviar pelo WhatsApp</strong> e escolha a outra pessoa.',
      ['Peça para ela responder “De acordo”.', 'Guarde essa conversa no celular.'],
      ['Para virar um contrato escrito, leve este resumo ao sindicato ou ao cartório.', 'Lá eles ajudam a fazer o papel do jeito certo.'],
    ];
    return {
      aba: 'papeis',
      html: `
      ${cabecalho('#/papeis', 'Voltar')}
      <div class="grupo-justo">
        <h1>Resumo do combinado</h1>
        <p class="auxiliar">Anotado em ${data(c.criadoEm)}${r.outra ? ' · com ' + esc(r.outra) : ''}</p>
      </div>
      <section class="cartao">
        <p class="corpo" style="white-space:pre-wrap">${esc(txt.replace(/\*/g, ''))}</p>
        ${ouvir('comb-res-' + c.id, txt.replace(/\*/g, ''), 'Ouvir o resumo', true)}
      </section>
      ${faltam.length ? `<div class="cartao alerta linha-topo">${I('alerta')}<div class="grupo-justo" style="flex:1"><h3>Ainda falta combinar</h3><p class="corpo">${esc(faltam.join(', '))}. Sem isso, pode dar confusão depois. Vale conversar sobre esses pontos.</p></div></div>` : ''}
      <section class="cartao">
        <h2>O que fazer agora</h2>
        ${instrucoes(PASSOS)}
        ${ouvir('comb-passos', 'O que fazer agora. ' + textoDe(PASSOS))}
      </section>
      <div class="grupo">
        <a class="botao destaque" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${I('enviar')}Enviar pelo WhatsApp</a>
        <button type="button" class="botao secundario" data-acao="copiar" data-id="${c.id}">${I('copiar')}Copiar o texto</button>
        <button type="button" class="botao secundario" data-acao="comb-corrigir" data-id="${c.id}">${I('lapis')}Corrigir respostas</button>
        <button type="button" class="botao texto" data-acao="excluir-combinado" data-id="${c.id}" style="align-self:center">${I('lixeira')}Excluir este combinado</button>
      </div>
      <p class="linha-topo auxiliar">${I('info')}<span style="flex:1">Este resumo ajuda a lembrar e a conversar. Para ter a mesma força de um contrato escrito e assinado, procure o sindicato ou o cartório.</span></p>`,
    };
  }

  /* ---------- Guia passo a passo ---------- */
  const GUIA = [
    { id: 'comecar', icone: 'info', titulo: 'Antes de começar', passos: [
      'Abra o AgroNosso pelo link ou pelo ícone na tela do celular.',
      ['Se as letras estiverem pequenas, toque em <strong>A+ Letra maior</strong>, lá em cima.', 'Toque de novo para voltar ao normal.'],
      ['Para ouvir qualquer parte, toque no botão <strong>Ouvir</strong>.', 'Para parar, toque de novo no mesmo botão.'],
      ['Embaixo da tela tem o menu: Início, Papéis, Perguntas e Como usar.', 'É por ali que você anda pelo app.'],
    ] },
    { id: 'instalar', icone: 'celular', titulo: 'Colocar o app na tela do celular', passos: [
      ['No Android (Chrome): toque nos três pontinhos no canto de cima.', 'Depois toque em <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.'],
      ['No iPhone (Safari): toque no botão de compartilhar, o quadrado com a seta para cima.', 'Depois toque em <strong>Adicionar à Tela de Início</strong>.'],
      'Pronto. O AgroNosso aparece junto com os outros aplicativos e abre mesmo sem internet.',
    ] },
    { id: 'entender', icone: 'camera', titulo: 'Como entender um papel', passos: [
      'Na tela de início, toque em <strong>Entender um papel</strong> e depois em <strong>Começar</strong>.',
      ['Escolha quem você é no acordo.', 'Por exemplo: “Eu uso a terra de outra pessoa”. Toque em Continuar.'],
      ['Leia ou ouça as dicas de foto.', 'Papel esticado, boa luz e celular parado.'],
      'Toque em <strong>Abrir câmera</strong> e tire a foto do papel.',
      ['Confira se dá para ler as letras.', 'Se não der, toque em Tirar de novo. Se tiver mais folhas, toque em Adicionar outra folha.'],
      ['Toque em <strong>Sim, ler o papel</strong> e espere.', 'Pode levar até 1 minuto. Na primeira vez, use o Wi-Fi se puder.'],
      'Ouça ou leia o resumo em <strong>Em poucas palavras</strong>.',
      ['Abra cada parte: quanto custa, até quando vale, quem paga o quê, como sair.', 'O sinal de <strong>Atenção</strong> mostra o que pode pesar para você.'],
    ] },
    { id: 'perguntas', icone: 'balao', titulo: 'Como guardar perguntas', passos: [
      'Na explicação, desça até <strong>Perguntas para fazer</strong>.',
      'Toque em <strong>Guardar esta pergunta</strong> nas que você quiser fazer.',
      ['Para ver todas, toque em <strong>Perguntas</strong> no menu de baixo.', 'Você também pode escrever as suas.'],
      'Depois da conversa, toque na bolinha da pergunta para marcar que já foi respondida.',
    ] },
    { id: 'familia', icone: 'enviar', titulo: 'Como mandar para a família', passos: [
      'Abra a explicação do papel.',
      'Toque em <strong>Mandar para alguém da família</strong>.',
      ['Escolha o WhatsApp e a pessoa.', 'Ela recebe o resumo e as perguntas por escrito.'],
      'Assim vocês podem conversar e decidir juntos, mesmo de longe.',
    ] },
    { id: 'combinado', icone: 'lapis', titulo: 'Como anotar um combinado de boca', passos: [
      'Na tela de início, toque em <strong>Anotar um combinado de boca</strong>.',
      ['Responda uma pergunta por vez: terra, pagamento, prazo, quem paga o quê.', 'Se não souber, toque em Pular esta pergunta.'],
      'No fim, ouça o resumo e confira.',
      ['Toque em <strong>Enviar pelo WhatsApp</strong> para a outra pessoa.', 'Peça para ela responder “De acordo”.'],
      'Para virar contrato escrito, leve o resumo ao sindicato ou ao cartório.',
    ] },
    { id: 'ajuda', icone: 'pessoas', titulo: 'Quando procurar ajuda', passos: [
      'Quando um valor ou prazo estiver diferente do que foi falado.',
      'Quando o papel disser que o dono pode pedir a terra com pouco aviso.',
      'Quando o que você construir ficar sem pagamento.',
      'Quando a terra ou a casa ficar como garantia de dívida.',
      ['Procure o sindicato dos trabalhadores rurais, o técnico, o cartório ou a Defensoria Pública.', 'Leve o papel e as suas perguntas guardadas.'],
    ] },
    { id: 'dados', icone: 'cadeado', titulo: 'Seus dados e como apagar', passos: [
      'A foto e o texto ficam só neste celular. O AgroNosso não manda para ninguém.',
      ['Só sai do celular o que você mesmo mandar pelo WhatsApp.', ''],
      ['Para apagar tudo, vá em <strong>Quem pode ajudar</strong> e toque em <strong>Apagar tudo deste celular</strong>.', 'Antes de apagar, o app pergunta se você tem certeza.'],
    ] },
  ];

  function telaGuia() {
    const tudo = GUIA.map((s) => `${s.titulo}. ${textoDe(s.passos)}`).join(' ');
    return {
      aba: 'guia',
      html: `
      <div class="grupo-justo">
        <h1>Como usar o AgroNosso</h1>
        <p class="leitura">Siga os passos com calma. Toque em cada assunto para abrir.</p>
      </div>
      ${ouvir('guia-tudo', 'Como usar o AgroNosso. ' + tudo, 'Ouvir o guia inteiro', true)}
      <div class="grupo">
        ${GUIA.map((s, i) => `
        <details class="acordeao" id="guia-${s.id}" ${i === 2 ? 'open' : ''}>
          <summary><span class="ic">${I(s.icone)}</span><span class="t-sub">${esc(s.titulo)}</span><span class="seta-acordeao">${I('abaixo')}</span></summary>
          <div class="corpo-acordeao">
            ${instrucoes(s.passos.map((p) => (Array.isArray(p) && !p[1] ? [p[0]] : p)))}
            ${s.id === 'instalar' ? blocoInstalar(true) : ''}
            ${ouvir('guia-' + s.id, s.titulo + '. ' + textoDe(s.passos))}
          </div>
        </details>`).join('')}
      </div>
      <section class="cartao escuro">
        <h2 class="t-secao claro">Quer treinar?</h2>
        <p class="leitura claro">Faça o passo a passo com um papel de exemplo. Nada é guardado de verdade.</p>
        <button type="button" class="botao destaque" data-acao="treinar">${I('play')}Treinar com um exemplo</button>
      </section>
      <button type="button" class="botao texto" data-acao="rever-boas-vindas" style="align-self:center">${I('recarregar')}Ver as boas-vindas de novo</button>`,
    };
  }

  /* ---------- Papéis ---------- */
  let busca = '';
  function telaPapeis() {
    const sa = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const q = sa(busca.trim());
    const lista = estado.papeis.filter((p) => !q || sa(p.analise.tipoNome + ' ' + p.analise.texto).includes(q));
    const combs = estado.combinados.filter((c) => !q || sa(textoCombinado(c)).includes(q));
    const vazio = !estado.papeis.length && !estado.combinados.length;
    return {
      aba: 'papeis',
      html: `
      <div class="grupo-justo">
        <h1>Meus papéis</h1>
        <p class="auxiliar">Ficam guardados só neste celular e abrem mesmo sem internet.</p>
      </div>
      ${vazio ? `
        <div class="grupo centro" style="text-align:center;padding:var(--s4) 0">
          <span class="ic grande">${I('papel', 56)}</span>
          <h2>Nenhum papel ainda</h2>
          <p class="leitura">Quando você ler um papel ou anotar um combinado, ele aparece aqui.</p>
          <a class="botao destaque" href="#/entender">${I('camera')}Entender um papel</a>
        </div>` : `
        <div class="campo">
          <label for="busca">Procurar</label>
          <input id="busca" type="search" value="${esc(busca)}" placeholder="Ex.: arrendamento, banco, café">
        </div>
        <section class="grupo" aria-labelledby="t-lidos">
          <h2 id="t-lidos">Papéis lidos (${lista.length})</h2>
          ${lista.length ? lista.map(itemPapel).join('') : '<p class="auxiliar">Nada encontrado.</p>'}
        </section>
        <section class="grupo" aria-labelledby="t-comb">
          <h2 id="t-comb">Combinados anotados (${combs.length})</h2>
          ${combs.length ? combs.map((c) => `<a class="item" href="#/combinado/${c.id}"><span class="ic">${I('lapis')}</span><span class="textos"><span class="t-sub">Combinado${c.respostas.outra ? ' com ' + esc(c.respostas.outra) : ''}</span><span class="pequeno">Anotado em ${data(c.criadoEm)}</span></span><span class="seta">${I('seta')}</span></a>`).join('') : `<a class="botao secundario" href="#/combinado">${I('lapis')}Anotar um combinado de boca</a>`}
        </section>`}`,
      montar: () => {
        const b = document.getElementById('busca');
        if (b) b.addEventListener('input', () => {
          busca = b.value;
          const pos = b.selectionStart;
          desenhar();
          const nb = document.getElementById('busca');
          nb.focus();
          try { nb.setSelectionRange(pos, pos); } catch (e) { /* ok */ }
        });
      },
    };
  }

  /* ---------- Perguntas ---------- */
  function telaPerguntas() {
    const pend = estado.perguntas.filter((p) => !p.resolvida);
    const feitas = estado.perguntas.filter((p) => p.resolvida);
    const item = (p) => `
      <div class="item" style="align-items:flex-start;min-height:0">
        <button type="button" class="botao-icone" role="checkbox" aria-checked="${p.resolvida}" aria-label="${p.resolvida ? 'Marcar como não respondida' : 'Marcar como respondida'}: ${esc(p.texto)}" data-acao="alternar-pergunta" data-id="${p.id}" style="color:${p.resolvida ? 'var(--verde)' : 'var(--oliva)'}">${I(p.resolvida ? 'circulo-certo' : 'circulo', 30)}</button>
        <span class="textos">
          <span class="leitura" style="${p.resolvida ? 'text-decoration:line-through;color:var(--oliva)' : ''}">${esc(p.texto)}</span>
          ${p.docTitulo ? `<span class="pequeno">Sobre: ${esc(p.docTitulo)}</span>` : ''}
          <span class="pequeno"><strong>${p.resolvida ? 'Já respondida' : 'Para perguntar'}</strong></span>
        </span>
        <button type="button" class="botao-icone" aria-label="Excluir pergunta: ${esc(p.texto)}" data-acao="excluir-pergunta" data-id="${p.id}" style="color:var(--oliva)">${I('lixeira')}</button>
      </div>`;
    return {
      aba: 'perguntas',
      html: `
      <div class="grupo-justo">
        <h1>Minhas perguntas</h1>
        <p class="leitura">Anote o que você quer perguntar. Leve esta lista na conversa com o dono, o banco, o sindicato ou o cartório.</p>
      </div>
      <div class="cartao">
        <div class="campo">
          <label for="nova-pergunta">Escreva uma pergunta</label>
          <input id="nova-pergunta" placeholder="Ex.: Posso plantar café nessa terra?">
          <span class="erro" id="erro-pergunta" hidden>${I('alerta')}Escreva a pergunta antes de guardar.</span>
        </div>
        <button type="button" class="botao primario" data-acao="nova-pergunta">${I('mais')}Guardar pergunta</button>
      </div>
      ${!estado.perguntas.length ? `
        <div class="grupo centro" style="text-align:center">
          <span class="ic grande">${I('balao', 56)}</span>
          <h2>Nenhuma pergunta guardada</h2>
          <p class="corpo">Na explicação de um papel, toque em “Guardar esta pergunta”.</p>
        </div>` : ''}
      ${pend.length ? `
        <section class="grupo" aria-labelledby="t-pend">
          <h2 id="t-pend">Para perguntar (${pend.length})</h2>
          ${pend.map(item).join('')}
          ${ouvir('minhas-perguntas', pend.map((p, i) => `Pergunta ${i + 1}: ${p.texto}`).join('. '), 'Ouvir minhas perguntas')}
          <button type="button" class="botao secundario" data-acao="compartilhar-perguntas">${I('enviar')}Mandar a lista para alguém</button>
        </section>` : ''}
      ${feitas.length ? `<section class="grupo" aria-labelledby="t-feitas"><h2 id="t-feitas">Já respondidas (${feitas.length})</h2>${feitas.map(item).join('')}</section>` : ''}`,
      montar: () => {
        const inp = document.getElementById('nova-pergunta');
        inp.addEventListener('input', () => { document.getElementById('erro-pergunta').hidden = true; });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') acoes['nova-pergunta'](); });
      },
    };
  }

  /* ---------- Quem pode ajudar + seus dados ---------- */
  function telaAjuda() {
    return {
      aba: 'guia',
      html: `
      ${cabecalho('#/inicio', 'Início')}
      <div class="grupo-justo">
        <h1>Quem pode ajudar</h1>
        <p class="leitura">Quando o papel pesa, converse com quem conhece o assunto. Leve o papel e as suas perguntas.</p>
      </div>
      <div class="grupo">
        ${D.QUEM_AJUDA.map((q) => `<div class="item" style="align-items:flex-start"><span class="ic">${I(q.icone)}</span><span class="textos"><span class="t-sub">${esc(q.nome)}</span><span class="corpo">${esc(q.texto)}</span></span></div>`).join('')}
        ${ouvir('quem-ajuda', D.QUEM_AJUDA.map((q) => q.nome + '. ' + q.texto).join(' '))}
      </div>

      <section class="cartao" id="seus-dados" aria-labelledby="t-dados">
        <div class="linha"><span class="ic verde">${I('escudo')}</span><h2 id="t-dados">Quem está por trás e os seus dados</h2></div>
        <p class="leitura">O AgroNosso é um projeto de estudantes de Design Digital da FIAP (CitizenTech). Não é do dono da terra, nem do banco, nem de nenhuma empresa.</p>
        ${instrucoes([
          'A foto e o texto ficam só neste celular.',
          'O app não pede seu nome, CPF nem senha.',
          'Só sai do celular o que você mesmo mandar.',
          'Você pode apagar tudo quando quiser.',
        ])}
        ${ouvir('dados', 'Quem está por trás e os seus dados. O AgroNosso é um projeto de estudantes de Design Digital da FIAP. Não é do dono da terra, nem do banco. A foto e o texto ficam só neste celular. O app não pede seu nome, CPF nem senha. Só sai do celular o que você mesmo mandar. Você pode apagar tudo quando quiser.')}
        <button type="button" class="botao secundario" data-acao="apagar-tudo">${I('lixeira')}Apagar tudo deste celular</button>
      </section>
      <a class="botao texto" href="#/guia" style="align-self:center">${I('guia')}Ver como usar o app</a>
      <p class="pequeno" style="text-align:center">AgroNosso · versão 1.0</p>`,
    };
  }

  function telaNaoAchou() {
    return {
      html: `<div class="grupo centro" style="text-align:center;padding-top:var(--s5)"><span class="ic grande">${I('papel', 56)}</span><h1>Não encontramos este papel</h1><p class="leitura">Ele pode ter sido excluído.</p><a class="botao destaque" href="#/inicio">Ir para o início</a></div>`,
    };
  }

  /* ---------- Instalar na tela do celular ---------- */
  let pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); pedidoInstalar = e; if (location.hash === '#/inicio') desenhar(); });
  const instalado = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  function blocoInstalar(noGuia) {
    if (instalado()) return noGuia ? '<p class="corpo">O AgroNosso já está na tela do seu celular.</p>' : '';
    if (pedidoInstalar) return `<button type="button" class="botao ${noGuia ? 'primario' : 'secundario'}" data-acao="instalar">${I('celular')}Colocar o AgroNosso na tela do celular</button>`;
    return '';
  }

  /* =========================================================
     Ações (toques em botões)
     ========================================================= */
  const acoes = {
    'slide-avancar': () => { V.parar(); slide++; desenhar(); },
    'slide-voltar': () => { V.parar(); slide = Math.max(0, slide - 1); desenhar(); },
    'slide-pular': () => acoes['slide-fim'](),
    'slide-fim': () => { V.parar(); estado.config.visto = true; salvar('config'); location.hash = '#/inicio'; },
    'slide-guia': () => { estado.config.visto = true; salvar('config'); location.hash = '#/guia'; },
    'rever-boas-vindas': () => { slide = 0; location.hash = '#/boas-vindas'; },

    'escolher-papel': (el) => { estado.config.papel = el.dataset.valor; salvar('config'); desenhar(); const b = tela.querySelector(`[data-valor="${el.dataset.valor}"]`); if (b) b.focus(); },
    'papel-continuar': () => {
      if (!estado.config.papel) { document.getElementById('erro-papel').hidden = false; return; }
      location.hash = '#/entender/foto';
    },
    'abrir-camera': () => document.getElementById('in-camera').click(),
    'abrir-galeria': () => document.getElementById('in-galeria').click(),
    'refazer-fotos': () => { limparFluxo(); location.hash = '#/entender/foto'; desenhar(); },
    'ler-fotos': () => { leituraErro = null; fluxo.exemplo = null; fluxo.texto = ''; location.hash = '#/entender/lendo'; },
    'ler-texto': () => {
      const t = document.getElementById('campo-texto').value.trim();
      if (t.length < 40) { document.getElementById('erro-texto').hidden = false; return; }
      fluxo.texto = t; fluxo.exemplo = null; fluxo.fotos = []; leituraErro = null;
      location.hash = '#/entender/lendo';
    },
    exemplo: (el) => {
      if (!estado.config.papel) { estado.config.papel = el.dataset.chave === 'credito' ? 'outro' : 'usa'; salvar('config'); }
      limparFluxo(); fluxo.ativo = true; fluxo.exemplo = el.dataset.chave;
      location.hash = '#/entender/lendo';
    },
    treinar: () => {
      estado.config.papel = estado.config.papel || 'usa'; salvar('config');
      limparFluxo(); fluxo.ativo = true; fluxo.exemplo = 'arrendamento';
      location.hash = '#/entender/lendo';
    },
    'cancelar-leitura': () => { A.cancelarLeitura(); limparFluxo(); location.hash = '#/entender/foto'; },
    'tentar-de-novo': () => { leituraErro = null; desenhar(); },

    'guardar-pergunta': (el) => {
      const doc = estado.papeis.find((p) => p.id === el.dataset.doc);
      estado.perguntas.unshift({ id: novoId(), texto: el.dataset.texto, docId: doc ? doc.id : null, docTitulo: doc ? doc.analise.tipoNome : null, resolvida: false, criadaEm: new Date().toISOString() });
      salvar('perguntas');
      el.outerHTML = botaoGuardar(el.dataset.texto, doc);
      avisar('Pergunta guardada em Perguntas.');
    },
    'nova-pergunta': () => {
      const inp = document.getElementById('nova-pergunta');
      const t = inp.value.trim();
      if (!t) { document.getElementById('erro-pergunta').hidden = false; inp.focus(); return; }
      estado.perguntas.unshift({ id: novoId(), texto: t, docId: null, docTitulo: null, resolvida: false, criadaEm: new Date().toISOString() });
      salvar('perguntas');
      desenhar();
      avisar('Pergunta guardada.');
    },
    'alternar-pergunta': (el) => {
      const p = estado.perguntas.find((x) => x.id === el.dataset.id);
      if (p) { p.resolvida = !p.resolvida; salvar('perguntas'); desenhar(); }
    },
    'excluir-pergunta': (el) => {
      const i = estado.perguntas.findIndex((x) => x.id === el.dataset.id);
      if (i < 0) return;
      const [rem] = estado.perguntas.splice(i, 1);
      salvar('perguntas'); desenhar();
      avisar('Pergunta excluída.', { rotulo: 'Desfazer', fazer: () => { estado.perguntas.splice(i, 0, rem); salvar('perguntas'); desenhar(); } });
    },
    'compartilhar-perguntas': () => compartilhar(['Minhas perguntas (anotadas no AgroNosso):', '', ...estado.perguntas.filter((p) => !p.resolvida).map((p, i) => `${i + 1}. ${p.texto}`)].join('\n')),

    'compartilhar-papel': (el) => { const d = estado.papeis.find((p) => p.id === el.dataset.id); if (d) compartilhar(textoCompartilhar(d)); },
    'excluir-papel': async (el) => {
      const i = estado.papeis.findIndex((p) => p.id === el.dataset.id);
      if (i < 0) return;
      const ok = await confirmar({ titulo: 'Excluir este papel?', texto: 'A explicação vai sair deste celular. As perguntas guardadas continuam em Perguntas.' });
      if (!ok) return;
      const [rem] = estado.papeis.splice(i, 1);
      salvar('papeis');
      location.hash = '#/papeis';
      avisar('Papel excluído.', { rotulo: 'Desfazer', fazer: () => { estado.papeis.splice(i, 0, rem); salvar('papeis'); desenhar(); } });
    },

    'comb-opcao': (el) => { rascunho().r[el.dataset.campo] = el.dataset.valor; salvar('rascunho'); desenhar(); },
    'comb-atalho': (el) => { rascunho().r[el.dataset.campo] = el.dataset.valor; salvar('rascunho'); desenhar(); },
    'comb-despesa': (el) => { rascunho().r.despesas[el.dataset.item] = el.dataset.valor; salvar('rascunho'); desenhar(); },
    'comb-voltar': () => { const rs = rascunho(); rs.passo = Math.max(0, rs.passo - 1); salvar('rascunho'); desenhar(); },
    'comb-pular': () => acoes['comb-avancar'](true),
    'comb-avancar': () => {
      const rs = rascunho();
      if (rs.passo < PERG_COMB.length - 1) { rs.passo++; salvar('rascunho'); desenhar(); return; }
      const existente = rs.editando && estado.combinados.find((c) => c.id === rs.editando);
      if (existente) existente.respostas = rs.r;
      else estado.combinados.unshift({ id: novoId(), criadoEm: new Date().toISOString(), respostas: rs.r });
      const id = existente ? existente.id : estado.combinados[0].id;
      salvar('combinados');
      estado.rascunho = null; salvar('rascunho');
      avisar('Combinado guardado em Papéis.');
      location.hash = '#/combinado/' + id;
    },
    'comb-corrigir': (el) => {
      const c = estado.combinados.find((x) => x.id === el.dataset.id);
      if (!c) return;
      estado.rascunho = { passo: 0, r: JSON.parse(JSON.stringify(c.respostas)), editando: c.id };
      salvar('rascunho');
      location.hash = '#/combinado';
    },
    'excluir-combinado': async (el) => {
      const i = estado.combinados.findIndex((c) => c.id === el.dataset.id);
      if (i < 0) return;
      if (!(await confirmar({ titulo: 'Excluir este combinado?', texto: 'O resumo vai sair deste celular. O que você já mandou por WhatsApp continua lá.' }))) return;
      const [rem] = estado.combinados.splice(i, 1);
      salvar('combinados');
      location.hash = '#/papeis';
      avisar('Combinado excluído.', { rotulo: 'Desfazer', fazer: () => { estado.combinados.splice(i, 0, rem); salvar('combinados'); desenhar(); } });
    },
    copiar: async (el) => {
      const c = estado.combinados.find((x) => x.id === el.dataset.id);
      if (!c) return;
      try { await navigator.clipboard.writeText(textoCombinado(c)); avisar('Texto copiado. Agora é só colar na mensagem.'); }
      catch (e) { avisar('Não deu para copiar. Use o botão Enviar pelo WhatsApp.'); }
    },

    'apagar-tudo': async () => {
      if (!(await confirmar({ titulo: 'Apagar tudo deste celular?', texto: 'Todos os papéis, perguntas e combinados vão sair deste celular. Isso não pode ser desfeito.', sim: 'Apagar tudo' }))) return;
      Banco.apagarTudo();
      estado.papeis = []; estado.perguntas = []; estado.combinados = []; estado.rascunho = null;
      estado.config = { visto: true, papel: null, letra: estado.config.letra };
      salvar('config');
      avisar('Tudo foi apagado deste celular.');
      location.hash = '#/inicio';
    },
    instalar: async () => {
      if (!pedidoInstalar) return;
      pedidoInstalar.prompt();
      await pedidoInstalar.userChoice.catch(() => {});
      pedidoInstalar = null;
      desenhar();
    },
  };

  async function compartilhar(texto) {
    if (navigator.share) {
      try { await navigator.share({ text: texto }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  }

  tela.addEventListener('click', (e) => {
    const ouv = e.target.closest('[data-ouvir]');
    if (ouv) { tocar(ouv.dataset.ouvir); return; }
    const el = e.target.closest('[data-acao]');
    if (el && acoes[el.dataset.acao]) { e.preventDefault(); acoes[el.dataset.acao](el); }
  });

  tela.addEventListener('change', (e) => {
    if (e.target.id === 'in-camera' || e.target.id === 'in-galeria') {
      const arquivos = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
      arquivos.forEach((f) => fluxo.fotos.push({ arquivo: f, url: URL.createObjectURL(f) }));
      e.target.value = '';
      if (arquivos.length) desenhar();
    }
  });

  /* =========================================================
     Rotas
     ========================================================= */
  function rota() {
    const h = location.hash.replace(/^#/, '').split('#')[0] || '/';
    const partes = h.split('/').filter(Boolean);
    if (!estado.config.visto && partes[0] !== 'boas-vindas' && partes[0] !== 'guia') return ['boas-vindas'];
    return partes.length ? partes : ['inicio'];
  }

  function desenhar() {
    const [r, sub] = rota();
    let v = null;
    if (r === 'boas-vindas') v = telaBoasVindas();
    else if (r === 'inicio') v = telaInicio();
    else if (r === 'entender' && !sub) v = telaEntender();
    else if (r === 'entender' && sub === 'foto') v = telaFoto();
    else if (r === 'entender' && sub === 'texto') v = telaTexto();
    else if (r === 'entender' && sub === 'lendo') v = (fluxo.fotos.length || fluxo.texto || fluxo.exemplo || leituraErro) ? telaLendo() : (location.replace('#/entender/foto'), null);
    else if (r === 'resultado') v = telaResultado(sub);
    else if (r === 'combinado' && sub) v = telaCombinadoResumo(sub);
    else if (r === 'combinado') v = telaCombinado();
    else if (r === 'guia') v = telaGuia();
    else if (r === 'papeis') v = telaPapeis();
    else if (r === 'perguntas') v = telaPerguntas();
    else if (r === 'ajuda') v = telaAjuda();
    else v = telaNaoAchou();
    if (!v) return;

    tela.innerHTML = v.html;
    document.body.classList.toggle('sem-topo', !!v.semTopo);
    document.body.classList.toggle('sem-abas', !!v.semAbas);
    document.querySelectorAll('#abas a').forEach((a) => {
      if (a.dataset.aba === (v.aba || r)) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const h1 = tela.querySelector('h1');
    document.title = h1 ? `${h1.textContent} · AgroNosso` : 'AgroNosso';
    if (v.montar) v.montar();
  }

  let ultimaRota = '';
  window.addEventListener('hashchange', () => {
    const atual = location.hash.split('#').slice(0, 2).join('#');
    if (atual !== ultimaRota) {
      V.parar();
      if (ultimaRota.startsWith('#/entender/lendo')) A.cancelarLeitura();
      if (!atual.startsWith('#/resultado/')) resultadoDoFluxo = null;
      ultimaRota = atual;
      desenhar();
      const ancora = location.hash.split('#')[2];
      const alvo = ancora && document.getElementById(ancora);
      if (alvo) alvo.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
      tela.focus({ preventScroll: true });
    }
  });

  /* =========================================================
     Letra maior, conexão e service worker
     ========================================================= */
  const botaoLetra = document.getElementById('botao-letra');
  function aplicarLetra() {
    document.documentElement.dataset.letra = estado.config.letra ? 'grande' : '';
    botaoLetra.setAttribute('aria-pressed', String(!!estado.config.letra));
  }
  botaoLetra.addEventListener('click', () => { estado.config.letra = !estado.config.letra; salvar('config'); aplicarLetra(); });

  const avisoOffline = document.getElementById('aviso-offline');
  const conexao = () => { avisoOffline.hidden = navigator.onLine; };
  window.addEventListener('online', conexao);
  window.addEventListener('offline', conexao);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  window.Icones.hidratar(document);
  aplicarLetra();
  conexao();
  ultimaRota = location.hash.split('#').slice(0, 2).join('#');
  desenhar();
})();
