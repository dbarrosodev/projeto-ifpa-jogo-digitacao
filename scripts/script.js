// Banco de frases para o jogo
const BANCO_FRASES = [
  "O objetivo principal é digitar as palavras ou frases exibidas na tela de forma rápida e correta antes que o tempo acabe...",
  "Desenvolver software vai muito além de escrever linhas de código, envolve lógica, persistência e muita criatividade.",
  "O sucesso não é o resultado de um jogo, mas sim o reflexo da constância e do aprendizado diário na nossa jornada.",
  "Estruturas de dados organizadas e algoritmos bem otimizados transformam linhas de código em soluções de alto impacto.",
  "A tecnologia avança em passos largos e aprender a programar abre portas para criar o futuro que imaginamos.",
  "A inteligência artificial está mudando o mercado de trabalho globalmente.",
];

// Inicialização do Placar no LocalStorage como VAZIO se não existir
if (!localStorage.getItem("placarJogo")) {
  localStorage.setItem("placarJogo", JSON.stringify([]));
}

// Identifica qual página está aberta e inicializa a função correta
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const pagina = path.substring(path.lastIndexOf("/") + 1);

  // Antes: pagina === "/telas/jogo.html"  ❌
  // Agora: pagina === "jogo.html"         ✅

  if (pagina === "jogo.html") {
    inicializarJogo();
  } else if (pagina === "resultado.html") {
    inicializarResultados();
  } else if (pagina === "placar.html") {
    exibirPlacar();
  }
});

/* =========================================================
   LÓGICA DA TELA DE JOGO (jogo.html)
========================================================= */
function inicializarJogo() {
  const elementoTempo = document.querySelector(".neon-tempo");
  const elementoPontos = document.querySelector(".neon-pontos");
  const caixaFrase = document.querySelector(".caixa-frase");
  const inputJogo = document.querySelector(".input-jogo");

  if (!elementoTempo || !elementoPontos || !caixaFrase || !inputJogo) return;

  // Garante que o input começa limpo e sem a classe de erro fixada no HTML
  inputJogo.value = "";
  inputJogo.classList.remove("input-erro-efeito");

  // Seleciona uma frase aleatória do banco
  const fraseAlvo =
    BANCO_FRASES[Math.floor(Math.random() * BANCO_FRASES.length)];

  let tempoRestante = 60;
  let pontos = 0;
  let jogoAtivo = true;

  // Desenha a frase inicial no ecrã
  atualizarVisualFrase(caixaFrase, fraseAlvo, "");

  // Cronómetro (Contagem decrescente)
  const cronometro = setInterval(() => {
    if (!jogoAtivo) return;

    tempoRestante--;
    elementoTempo.textContent = `${tempoRestante}s`;

    if (tempoRestante <= 0) {
      clearInterval(cronometro);
      jogoAtivo = false;
      finalizarPartida(pontos, fraseAlvo, inputJogo.value);
    }
  }, 1000);

  // Escuta a digitação do jogador
  inputJogo.addEventListener("input", () => {
    if (!jogoAtivo) return;

    const textoDigitado = inputJogo.value;

    // Verifica se o texto digitado coincide com o início da frase alvo
    if (fraseAlvo.startsWith(textoDigitado)) {
      inputJogo.classList.remove("input-erro-efeito");

      // Pontuação dinâmica: 10 pontos por caractere correto
      pontos = textoDigitado.length * 10;
      elementoPontos.textContent = String(pontos).padStart(4, "0");

      // Atualiza o visual (letras certas ficam azuis)
      atualizarVisualFrase(caixaFrase, fraseAlvo, textoDigitado);

      // Se completou a frase inteira antes do tempo acabar
      if (textoDigitado === fraseAlvo) {
        clearInterval(cronometro);
        jogoAtivo = false;
        // Bónus de velocidade: +100 pontos por cada segundo restante
        pontos += tempoRestante * 100;
        finalizarPartida(pontos, fraseAlvo, textoDigitado);
      }
    } else {
      // Se errou, aplica a classe visual de erro (borda vermelha)
      inputJogo.classList.add("input-erro-efeito");

      // Destaca em vermelho o caractere onde ocorreu o erro
      atualizarVisualFraseComErro(caixaFrase, fraseAlvo, textoDigitado);
    }
  });
}

function atualizarVisualFrase(container, frase, digitado) {
  container.innerHTML = "";
  for (let i = 0; i < frase.length; i++) {
    const span = document.createElement("span");
    span.textContent = frase[i];
    if (i < digitado.length) {
      span.classList.add("letra-certa");
    }
    container.appendChild(span);
  }
}

function atualizarVisualFraseComErro(container, frase, digitado) {
  container.innerHTML = "";
  let indiceErro = 0;
  while (
    indiceErro < digitado.length &&
    frase[indiceErro] === digitado[indiceErro]
  ) {
    indiceErro++;
  }

  for (let i = 0; i < frase.length; i++) {
    const span = document.createElement("span");
    span.textContent = frase[i];
    if (i < indiceErro) {
      span.classList.add("letra-certa");
    } else if (i === indiceErro) {
      span.classList.add("letra-erro");
    }
    container.appendChild(span);
  }
}

function finalizarPartida(pontosTotais, fraseAlvo, textoFinal) {
  const caracteresCorretos = Math.min(textoFinal.length, fraseAlvo.length);
  const progressoPorcentagem = Math.min(
    Math.round((caracteresCorretos / fraseAlvo.length) * 100),
    100
  );

  // Guarda os dados da sessão atual para exibir na página de resultados
  const dadosPartida = {
    pontos: pontosTotais,
    progresso: progressoPorcentagem,
    caracteres: caracteresCorretos,
  };
  sessionStorage.setItem("ultimaPartida", JSON.stringify(dadosPartida));

  // Redireciona para o ecrã de resultados
  window.location.href = "resultado.html";
}

/* =========================================================
   LÓGICA DA TELA DE RESULTADOS (resultado.html)
========================================================= */
function inicializarResultados() {
  const dados = JSON.parse(sessionStorage.getItem("ultimaPartida")) || {
    pontos: 0,
    progresso: 0,
    caracteres: 0,
  };

  // Atualiza os pontos e a barra de progresso no HTML
  const elementoPontosGrandes = document.querySelector(".pontos-grandes");
  if (elementoPontosGrandes)
    elementoPontosGrandes.textContent = dados.pontos.toLocaleString("pt-BR");

  const progressBar = document.getElementById("progresso-frase");
  if (progressBar) {
    progressBar.value = dados.progresso;
    progressBar.textContent = `${dados.progresso}%`;
    if (progressBar.previousElementSibling) {
      progressBar.previousElementSibling.textContent = `Conclusão da frase: ${dados.progresso}%`;
    }
  }

  // Atualiza a lista de estatísticas
  const listaEstatistica = document.querySelectorAll(
    ".detalhes-container ul li"
  );
  if (listaEstatistica.length >= 3) {
    listaEstatistica[0].innerHTML = `⏱️ <strong>Tempo limite:</strong> 60 segundos`;
    listaEstatistica[1].innerHTML = `⌨️ <strong>Caracteres digitados:</strong> ${dados.caracteres}`;
    listaEstatistica[2].innerHTML = `✅ <strong>Aproveitamento:</strong> ${dados.progresso}%`;
  }

  // Configura o clique para salvar o Nickname no ranking
  const btnEnviar = document.querySelector(".salvar-nick-container .btn");
  const inputNick = document.getElementById("nome-jogador");

  if (btnEnviar && inputNick) {
    btnEnviar.addEventListener("click", (e) => {
      e.preventDefault();
      const nome = inputNick.value.trim() || "Anónimo";

      let placar = JSON.parse(localStorage.getItem("placarJogo")) || [];
      placar.push({ nome: nome, pontos: dados.pontos });

      // Ordena do maior para o menor resultado
      placar.sort((a, b) => b.pontos - a.pontos);

      // Guarda apenas o Top 5
      placar = placar.slice(0, 5);
      localStorage.setItem("placarJogo", JSON.stringify(placar));

      // Vai para a tela de classificação
      window.location.href = "placar.html";
    });
  }
}

/* =========================================================
   LÓGICA DA TELA DE PLACAR (placar.html)
========================================================= */
function exibirPlacar() {
  const placar = JSON.parse(localStorage.getItem("placarJogo")) || [];
  const tabelaCorpo = document.querySelector(".tabela-placar tbody");

  if (!tabelaCorpo) return;
  tabelaCorpo.innerHTML = "";

  // Se ninguém tiver jogado/salvado ainda, mostra mensagem amigável
  if (placar.length === 0) {
    const trVazia = document.createElement("tr");
    const tdMensagem = document.createElement("td");
    tdMensagem.setAttribute("colspan", "3");
    tdMensagem.style.textAlign = "center";
    tdMensagem.style.color = "var(--txt-secundario)";
    tdMensagem.style.padding = "20px";
    tdMensagem.textContent =
      "Nenhum recorde registrado ainda. Seja o primeiro!";

    trVazia.appendChild(tdMensagem);
    tabelaCorpo.appendChild(trVazia);
    return;
  }

  // Popula a tabela apenas com quem jogou de verdade
  placar.forEach((jogador, index) => {
    const tr = document.createElement("tr");

    const tdPosicao = document.createElement("td");
    tdPosicao.textContent = `${index + 1}º`;

    const tdNome = document.createElement("td");
    tdNome.textContent = jogador.nome;

    const tdPontos = document.createElement("td");
    tdPontos.textContent = jogador.pontos.toLocaleString("pt-BR");

    tr.appendChild(tdPosicao);
    tr.appendChild(tdNome);
    tr.appendChild(tdPontos);
    tabelaCorpo.appendChild(tr);
  });
}
