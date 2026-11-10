# AgroNosso – aplicativo (React Native + Expo)

Aplicativo que ajuda pessoas do campo a entender documentos: a pessoa fotografa o papel,
o AgroNosso lê o texto (OCR), explica em linguagem simples (IA), destaca prazos e valores,
traduz palavras difíceis, ajuda a anotar dúvidas e mostra quando procurar orientação especializada.

## Como rodar

```bash
npm install
npx expo install --fix   # alinha as versões com a sua versão do Expo
npx expo start
```

Abra no celular com o app **Expo Go** (lendo o QR Code) ou rode em emulador (`a` para Android, `i` para iOS).

Sem configuração, o app roda em **modo demonstração**, com três documentos de exemplo fictícios
(contrato de crédito rural, aviso de ITR e recibo do CAR).

### Conectar ao servidor de IA

1. Copie `.env.example` para `.env`.
2. Preencha `EXPO_PUBLIC_AGRONOSSO_API_URL` com o endereço do servidor.
3. O app envia `POST {URL}/explicar` (multipart, campo `documento` com a foto) e espera um JSON
   no formato `DocumentoExplicado` (veja `src/types.ts`). Resposta `422` = foto ilegível.

As chaves de IA e de OCR ficam **no servidor**. Nunca coloque chaves dentro do aplicativo.

## Telas

| Tela | O que faz |
|---|---|
| Boas-vindas | Logo centralizado + 4 passos curtos, com áudio, "Pular" e "Voltar" |
| Início | Logo no topo à esquerda, uma ação principal (Fotografar), recentes, exemplos, lembrete de dúvidas |
| Fotografar | Passo 1 de 3, dicas de luz e enquadramento, câmera ou galeria, conferência da foto |
| Lendo | Passo 2 de 3, etapas visíveis da leitura, cancelar, mensagens de erro simples |
| Explicação | Resumo, ouvir tudo, pontos importantes, palavras difíceis, o que conferir, dúvidas, quando buscar ajuda, texto original, compartilhar |
| Documentos | Lista salva no celular (funciona sem internet), busca, excluir com confirmação e "Desfazer" |
| Dúvidas | Lista de perguntas para levar ao técnico/banco/advogado, marcar como respondida, ouvir, compartilhar |
| Ajuda | Perguntas frequentes com áudio e quem pode orientar |

## Estrutura

```
App.tsx                     fontes, splash e provedores
src/theme/                  paleta, tipografia, espaçamento e logo oficial (SVG sem alterações)
src/components/             Botao, BotaoOuvir, Logo, TopoApp, CartaoDocumento, ui (Tela, Cartao, Secao, Etapas…)
src/context/                Dados (documentos e dúvidas), Fala (áudio), Aviso (confirmações + desfazer)
src/services/               explicador (OCR + IA / demonstração), armazenamento (AsyncStorage)
src/screens/                telas
src/data/exemplos.ts        documentos fictícios do modo demonstração
```

## Decisões de design (skill Design e UX AgroNosso)

- **Identidade:** só as 5 cores oficiais e derivações; logo oficial em SVG inalterado, mínimo 96px,
  respiro de 1/4 da altura, Carvão sobre Papel; Source Sans 3 (títulos) e Lexend (texto e botões).
- **Contraste conferido (WCAG AA):** Carvão/Papel 12,6:1 · Verde/Papel 9,9:1 · Oliva/Papel 5,1:1 ·
  Carvão/Açafrão 6,6:1. Açafrão nunca é usado como texto sobre Papel.
- **Ponto focal:** o botão Açafrão aparece uma vez por tela (Fotografar, Abrir câmera, Usar esta foto…).
- **Nielsen:** etapas e progresso visíveis (1), vocabulário do campo e termo oficial explicado ao lado (2),
  Voltar/Cancelar/Desfazer/Parar áudio em todo lugar (3), um só conjunto de componentes e termos (4),
  dicas de foto, conferência da imagem e confirmação antes de excluir (5), rótulos sempre visíveis
  e documentos recentes (6), busca e exemplos rápidos (7), seções expansíveis (8), erros que dizem
  o que houve e como resolver (9), ajuda contextual com áudio (10).
- **Gestalt:** espaçamento em múltiplos de 8, cards como região comum, stepper ligando as etapas,
  um ponto focal por tela, padrões familiares (lupa, lixeira, alto-falante, compartilhar).
- **Acessibilidade:** alvos de toque ≥ 48–56px, rótulos para leitor de tela, estado nunca só por cor
  (ícone + texto), todo conteúdo importante em texto **e** áudio, respeito ao "reduzir movimento".
