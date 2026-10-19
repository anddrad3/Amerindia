<aside id="research-board" class="research-board" aria-labelledby="board-title" hidden>
  <header class="board-header"><div><p class="eyebrow">Board de pesquisa</p><h2 id="board-title">Conexões do território</h2></div><div class="board-header-actions"><button id="board-expand" class="icon-button" aria-label="Expandir board" aria-pressed="false">⛶</button><button id="board-close" class="icon-button" aria-label="Fechar board">×</button></div></header>
  <p id="board-description" class="board-description">Arraste os cards, explore conexões e consulte as fontes.</p>
  <div class="board-jump"><label class="sr-only" for="board-card-select">Navegar pelos cards</label><select id="board-card-select"><option value="">Navegar pelos cards…</option></select></div>
  <div id="board-viewport" class="board-viewport" tabindex="0" aria-label="Mapa mental interativo" aria-describedby="board-help">
    <div id="board-canvas" class="board-canvas"><svg id="board-connections" class="board-connections" aria-hidden="true"></svg><div id="board-cards" class="board-cards"></div></div>
  </div>
  <div class="board-bottom"><p id="board-help">Arraste o fundo para navegar. Nos títulos dos cards, use as setas para mover.</p><div class="board-controls" role="group" aria-label="Controles do mapa mental"><button id="board-zoom-out" aria-label="Diminuir zoom do board">−</button><output id="board-zoom" aria-live="polite">100%</output><button id="board-zoom-in" aria-label="Aumentar zoom do board">+</button><button id="board-fit" aria-label="Enquadrar todos os cards">⌖</button><button id="board-reset" aria-label="Restaurar posições dos cards">↺</button></div></div>
  <p id="board-status" class="sr-only" role="status"></p>
</aside>
