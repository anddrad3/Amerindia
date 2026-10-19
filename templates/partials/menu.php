<dialog id="site-menu" class="site-menu" aria-label="Menu principal">
  <div class="menu-top"><a href="/" class="menu-brand">AMERÍNDIA <span aria-hidden="true">●</span></a><button id="site-menu-close" class="menu-close" aria-label="Fechar menu">×</button></div>
  <nav aria-label="Todas as páginas"><ul class="site-menu-list">
    <?php foreach (['/'=>'Início','/territorios'=>'Povos & territórios','/acervo'=>'Acervo & vozes','/sobre'=>'Sobre o site','/contribuir'=>'Contribuir'] as $href=>$label): ?>
    <li><a class="site-menu-item" href="<?= e($href) ?>" aria-label="<?= e($label) ?>" data-text="<?= e($label) ?>" <?= $path === $href ? 'aria-current="page"' : '' ?>><?= e($label) ?></a></li>
    <?php endforeach; ?>
  </ul></nav>
  <p class="menu-caption">Território. Memória. Conexões.</p>
</dialog>
