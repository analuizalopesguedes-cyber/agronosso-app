# AgroNosso – app web

App que ajuda pequenos produtores rurais a entender papéis e contratos de terra (arrendamento, parceria, meação, empréstimo do banco) em **palavras simples**, com **áudio** e **passo a passo**.

Feito só com **HTML + CSS + JavaScript**. Não precisa instalar nada nem compilar. Funciona no navegador do celular, pode ser **instalado na tela inicial** (PWA) e abre **sem internet** depois da primeira vez.

Projeto acadêmico · CitizenTech / FIAP · Design Digital.

## O que o app faz

| Função | Como funciona |
|---|---|
| **Entender um papel** | 4 passos com indicador: quem é você no acordo → foto (com dicas numeradas) → leitura → explicação |
| **Leitura da foto (OCR)** | Feita **no próprio celular** com [Tesseract.js](https://github.com/naptha/tesseract.js). A foto não é enviada para nenhum servidor |
| **Explicação simples** | Encontra no texto: quanto custa, por quanto tempo vale, quem paga o quê, como sair do acordo, o que acontece se a terra for vendida, melhorias (poço, cerca), multa e garantia. Mostra o trecho do papel, o que falta e o que pede atenção |
| **Palavras difíceis** | Mais de 50 termos traduzidos para o dia a dia (arrendatário, benfeitoria, rescisão, penhor…) |
| **Perguntas prontas** | Em tom neutro, de acordo com quem a pessoa é no acordo (quem usa a terra ou quem é dono). Dá para guardar e marcar como respondida |
| **Combinado de boca** | Uma pergunta por tela (9 no total). No fim, gera um resumo para enviar pelo WhatsApp e pedir "De acordo" |
| **Guia passo a passo** | Tela "Como usar", com 8 assuntos numerados, áudio em cada um e um treino com papel de exemplo |
| **Acessibilidade** | Botão **Ouvir** em todo conteúdo (voz do próprio celular), botão **Letra maior**, alvos de toque grandes, contraste WCAG AA, leitor de tela |
| **Modo escuro** | Chave liga/desliga na tela inicial |
| **Ajustes** (engrenagem no topo) | **Aparência** (Claro, Escuro ou Igual ao celular), **tamanho da letra** (Normal, Grande, Muito grande), **velocidade da voz** (5 níveis) e **Libras** |
| **Velocidade da voz** | Também muda direto no botão "Velocidade", ao lado dos botões grandes de Ouvir |
| **Libras** | Botão azul **Libras** sempre visível no canto da tela. Abre o tradutor VLibras, gratuito, do Governo Federal. Precisa de internet |
| **Privacidade** | Tudo fica no `localStorage` do celular. Tem opção "Apagar tudo deste celular" |

> A explicação é feita por regras e serve para ajudar a entender. Não é conselho jurídico e não decide pela pessoa.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (por exemplo, `agronosso`).
2. Envie **o conteúdo desta pasta** para a raiz do repositório:
   ```bash
   git init
   git add .
   git commit -m "AgroNosso: app web"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/agronosso.git
   git push -u origin main
   ```
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**, branch **main** e pasta **/ (root)**. Salve.
5. Em 1 ou 2 minutos, o app fica em `https://SEU-USUARIO.github.io/agronosso/`.

O arquivo `.nojekyll` já está incluído para o GitHub Pages servir os arquivos sem alteração.

## Testar no computador

O service worker e a câmera precisam de `http://localhost` ou `https`. Na pasta do projeto:

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```

Para testar no celular, use o link do GitHub Pages (já é `https`).

## Estrutura

```
index.html              casca do app (topo, menu de baixo, área das telas)
manifest.webmanifest    nome, ícones e cores para instalar na tela do celular
sw.js                   service worker: guarda os arquivos para abrir sem internet
css/estilo.css          identidade visual AgroNosso (paleta, tipografia, grade de 8px)
js/icones.js            ícones em SVG embutidos (funcionam sem internet)
js/dados.js             tipos de papel, palavras difíceis, perguntas prontas, exemplos
js/analisador.js        OCR no celular + leitura por regras (valor, prazo, saída…)
js/voz.js               leitura em voz alta (Web Speech API, pt-BR)
js/app.js               telas, rotas (#/inicio, #/entender, #/guia…) e ações
assets/                 logo oficial (SVG sem alteração) e ícones do app
```

## Internet e dados

- Na **primeira leitura de foto**, o app baixa o leitor de letras (alguns MB). Depois fica guardado e não gasta dados de novo.
- As fontes (Lexend e Source Sans 3) vêm do Google Fonts. Sem internet, o app usa a fonte do celular.
- Exemplos, colar texto, guia, perguntas e combinados funcionam **sem internet**.

## Voz mais natural

O áudio usa a voz do próprio celular (Web Speech API). Para soar menos robótico:

- **Escolha automática:** o app procura primeiro as vozes em português do Brasil marcadas como natural, neural, online, aprimorada ou premium.
- **Tela "Voz do app"** (`#/voz`, link no guia e em "Quem pode ajudar"): a pessoa testa as vozes do celular, escolhe a que preferir e ajusta a velocidade. Também tem o passo a passo para baixar uma voz melhor no Android e no iPhone.
- **Texto ajustado para a fala:** "R$ 6.000,00" vira "6000 reais", "01/03/2027" vira "1 de março de 2027", "Cláusula 3ª" vira "Cláusula terceira", "ha" vira "hectares". Frases curtas, com pausa entre elas.

### Gravar uma voz de verdade (opcional)

Para os textos que não mudam (boas-vindas, dicas de foto, guia, perguntas do combinado), dá para usar uma **gravação de voz humana**, por exemplo de alguém da região com sotaque do interior, ou um áudio gerado por uma voz neural. O app toca a gravação no lugar da voz do celular.

1. Grave cada trecho em MP3 e coloque na pasta `audio/`.
2. Registre em `js/audios.js`, por exemplo: `'dicas-foto': 'audio/dicas-foto.mp3'`.
3. Adicione os arquivos à lista `CASCA` do `sw.js` para funcionarem sem internet.

Códigos dos trechos fixos:

| Código | Trecho |
|---|---|
| `bv-0` a `bv-4` | As 5 telas de boas-vindas |
| `quem` | "Quem é você neste acordo?" |
| `dicas-foto` | Passos para tirar a foto |
| `conferir` | "A foto ficou boa?" |
| `como-ler` | Como ler a explicação |
| `guia-tudo` | Guia inteiro |
| `guia-comecar`, `guia-instalar`, `guia-entender`, `guia-perguntas`, `guia-familia`, `guia-combinado`, `guia-ajuda`, `guia-dados` | Cada assunto do guia |
| `comb-intro`, `comb-0` a `comb-8` | Introdução e as 9 perguntas do combinado de boca |
| `comb-passos` | O que fazer depois do combinado |
| `quem-ajuda` | Lista de quem pode ajudar |
| `dados` | Quem está por trás e os seus dados |

As explicações dos papéis mudam a cada documento, então continuam com a voz do celular.

## Modo escuro

- Segue a versão invertida da marca: **Papel sobre Verde profundo**, com o logo em Papel (`assets/logo-agronosso-claro.svg`, só o preenchimento trocado).
- O cartão de destaque usa Carvão; o botão principal continua Açafrão com texto Carvão.
- Contrastes no escuro: Papel/Verde 9,9:1 · Papel/superfície 8,2:1 · texto secundário 6,7:1 · Papel sobre alerta 6,9:1.
- As cores ficam em variáveis (`--c-fundo`, `--c-texto`, `--c-acento`…) em `css/estilo.css`. O tema é aplicado antes da tela aparecer, para não piscar.

## Libras (VLibras)

- Um botão azul **Libras**, com o desenho de mão, fica sempre no canto de baixo da tela. O azul segue o padrão do VLibras, que as pessoas surdas já reconhecem (texto branco sobre azul: 7,3:1).
- Ao tocar, o app abre o [VLibras](https://www.vlibras.gov.br/doc/widget/installation/webpageintegration.html), tradutor gratuito do Governo Federal. A pessoa toca em qualquer texto e o personagem traduz em Libras. Precisa de internet; sem internet, o botão avisa.
- O script do VLibras é carregado em segundo plano alguns segundos depois de abrir o app, para a tradução abrir rápido. O botão próprio do VLibras fica escondido para não aparecer repetido.
- Quem não quiser o botão desliga em **Ajustes › Libras**.

## Modo escuro na tela inicial

A chave **Modo escuro** fica logo abaixo do título da tela inicial. Em **Ajustes › Aparência** também dá para escolher **Igual ao celular**.

## Identidade visual

- Cores: Verde profundo `#263F35`, Oliva escuro `#5F693B`, Açafrão `#E7A044`, Papel `#F4EFE4`, Carvão `#292A24`.
- Contrastes conferidos: Carvão/Papel 12,6:1 · Verde/Papel 9,9:1 · Oliva/Papel 5,1:1 · Carvão/Açafrão 6,6:1.
- Açafrão só como fundo do botão principal (um por tela), nunca como texto sobre Papel.
- Títulos em Source Sans 3; textos e botões em Lexend; corpo de leitura com 18px.
- Logo oficial usado sem alteração, com área de respiro, no topo à esquerda levando ao início.

## Base na pesquisa

As decisões vêm das personas (Zé, arrendatário com acordo de boca; Dona Dora, arrendante), dos mapas de empatia, da jornada atual e das 12 entrevistas:

- Foco no que pesa: **valor, prazo, quem paga, como sair** e o que acontece se a terra for vendida.
- **Áudio** em tudo, mas com texto para rever ("só ouvir eu esqueço").
- **Quem está por trás e o destino dos dados** antes de qualquer foto.
- **Perguntas prontas em tom neutro**, para não soar como desconfiança.
- Fácil de **mandar para a família** decidir junto.
- **Uso leve**: poucos passos, pouco consumo de dados, funciona sem sinal.
