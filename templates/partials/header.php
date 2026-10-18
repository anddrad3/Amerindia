<header class="site-header">
  <a class="brand" href="/" aria-label="Ameríndia, início"><span class="brand-symbol" aria-hidden="true">a</span>ameríndia<span class="brand-dot">.</span></a>
  <nav class="main-nav" aria-label="Navegação principal">
    <?php foreach (['/territorios'=>'Territórios','/acervo'=>'Acervo & vozes','/sobre'=>'O projeto'] as $href=>$label): ?>
      <a href="<?= e($href) ?>" <?= $path === $href ? 'aria-current="page"' : '' ?>><?= e($label) ?></a>
    <?php endforeach; ?>
  </nav>
  <div class="header-actions"><button class="icon-button search-trigger" aria-label="Buscar no acervo"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button><a class="button small" href="/contribuir">Contribuir <span aria-hidden="true">↗</span></a></div>
</header>
