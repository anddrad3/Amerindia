<header class="site-header">
  <div class="brand-mark"><a class="brand" href="/" aria-label="Ameríndia, início"><img class="brand-logo" src="/assets/brand/amerindia-logo.png" width="150" height="50" alt="Ameríndia"></a><button id="site-menu-toggle" class="site-menu-toggle" aria-label="Abrir menu" aria-controls="site-menu" aria-expanded="false"><span></span><span></span><span></span></button></div>
  <nav class="main-nav" aria-label="Navegação principal">
    <?php foreach (['/territorios'=>'Territórios','/acervo'=>'Acervo & vozes','/sobre'=>'O projeto'] as $href=>$label): ?>
      <a href="<?= e($href) ?>" <?= $path === $href ? 'aria-current="page"' : '' ?>><?= e($label) ?></a>
    <?php endforeach; ?>
  </nav>
  <div class="header-actions"><button id="theme-toggle" class="icon-button" aria-label="Ativar tema claro" aria-pressed="false"><span aria-hidden="true">☀</span></button><button class="icon-button search-trigger" aria-label="Buscar no acervo"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button><a class="button small contribute-link" href="/contribuir">Contribuir <span aria-hidden="true">↗</span></a></div>
</header>
