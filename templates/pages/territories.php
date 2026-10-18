<div class="map-workspace">
  <aside class="territory-sidebar" aria-labelledby="territory-title"><div class="sidebar-intro"><p class="eyebrow">Cartografias de pertencimento</p><h1 id="territory-title">Territórios<span class="brand-dot">.</span></h1><p>Escolha uma terra. Descubra suas relações.</p><label class="sr-only" for="territory-search">Buscar terra ou povo</label><input id="territory-search" type="search" placeholder="Buscar terra ou povo…" maxlength="120"><button id="locate-me" class="button location-button"><span aria-hidden="true">⌖</span> Encontrar terras perto de mim</button><p class="microcopy">Sua localização é usada só neste dispositivo, após sua permissão. Não é enviada ao nosso servidor.</p><p id="location-status" role="status" class="microcopy"></p></div>
    <div id="territory-list" class="territory-list" aria-label="Terras cadastradas"><p>Carregando territórios…</p></div>
    <div class="sidebar-note">Uma terra pode reunir vários povos. Os limites oficiais não abrangem todas as formas de territorialidade indígena.</div>
  </aside>
  <section class="map-stage" aria-label="Mapa dos territórios indígenas"><div id="map" aria-label="Mapa interativo; use também a lista de territórios para navegar"></div>
    <div class="map-top-label"><span class="status-dot"></span> Terras cadastradas <span class="separator">/</span> Brasil</div>
    <div id="map-status" class="map-message" role="status" hidden></div><button id="retry-map" class="button map-retry" hidden>Recarregar mapa de fundo</button>
    <aside id="territory-detail" class="territory-detail" aria-live="polite" hidden></aside>
    <div class="map-timeline"><div class="timeline-title"><div><p class="eyebrow">Camadas do tempo</p><label for="map-year">Consultar o recorte de <output id="year-output" for="map-year">2026</output></label></div><button class="text-link" id="reset-year">Ver recorte disponível ↗</button></div><input id="map-year" type="range" min="1500" max="2026" value="2026" step="1"><div class="timeline-scale"><span>1500</span><span>1750</span><span>2000</span><span>2026</span></div><p id="timeline-note">Consulta à base da Funai em 18/10/2026. Deslize para consultar outros anos.</p></div>
  </section>
</div>
