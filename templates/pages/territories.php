<div class="map-workspace" id="map-workspace">
  <section class="map-stage" aria-label="Mapa dos territórios indígenas">
    <div id="map" aria-label="Mapa interativo centrado no Brasil; use também a lista de povos para navegar"></div>
    <div class="map-toolbar">
      <button id="toggle-people" class="button small" aria-controls="people-panel" aria-expanded="false">Povos <span aria-hidden="true">↗</span></button>
      <button id="reset-brazil" class="button small" aria-label="Voltar ao enquadramento do Brasil">⌖ Brasil</button>
      <button id="reopen-board" class="button small" hidden>Reabrir board ↗</button>
    </div>
    <aside class="territory-sidebar" id="people-panel" aria-labelledby="territory-title" hidden>
      <div class="sidebar-intro"><div class="panel-heading"><p class="eyebrow">Povos & territórios</p><button id="close-people" class="icon-button" aria-label="Fechar lista de povos">×</button></div><h1 id="territory-title">Encontre conexões<span class="brand-dot">.</span></h1><p>Escolha uma terra para abrir seu mapa mental.</p><button id="locate-me" class="button location-button">⌖ Encontrar terras perto de mim</button><p class="microcopy">Localização opcional, calculada neste dispositivo. Não é enviada ao nosso servidor.</p><p id="location-status" role="status" class="microcopy"></p></div>
      <div id="territory-list" class="territory-list" aria-label="Terras cadastradas"><p>Carregando territórios…</p></div>
      <p class="sidebar-note">Os pins localizam povos ou conjuntos de povos a partir das terras cadastradas em 2026; não representam aldeias. Permanecem como referência atual ao mudar o período. Uma terra pode reunir vários povos e um povo pode ter diversas terras.</p>
    </aside>
    <div id="map-status" class="map-message" role="status" hidden></div><button id="retry-map" class="button map-retry" hidden>Recarregar mapa de fundo</button>
    <div class="map-bottom">
      <details class="map-timeline"><summary>Camadas do tempo <span id="timeline-summary-year">2026</span><span aria-hidden="true">⌃</span></summary><div class="timeline-body"><div class="timeline-title"><label for="map-year">Recorte de <output id="year-output" for="map-year">2026</output></label><button class="text-link" id="reset-year">Ver recorte disponível ↗</button></div><input id="map-year" type="range" min="1500" max="2026" value="2026" step="1"><div class="timeline-scale"><span>1500</span><span>1750</span><span>2000</span><span>2026</span></div><p id="timeline-note" role="status">Consulta à base da Funai em 18/10/2026.</p></div></details>
      <form class="floating-search" id="territory-search-form" role="search"><span aria-hidden="true">⌕</span><label class="sr-only" for="territory-search">Buscar terra ou povo</label><input id="territory-search" type="search" placeholder="Encontrar povos, territórios, conexões…" maxlength="120" autocomplete="off"><button aria-label="Mostrar povos encontrados">↗</button></form>
    </div>
  </section>
  <div id="pane-divider" class="pane-divider" role="separator" aria-label="Redimensionar mapa e board" aria-orientation="vertical" aria-valuemin="35" aria-valuemax="65" aria-valuenow="50" tabindex="0" hidden><span aria-hidden="true">⋮</span></div>
  <?php require ROOT . '/templates/partials/board.php'; ?>
</div>
