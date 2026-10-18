<?php
$titles = ['home'=>'Territórios, histórias e vozes','territories'=>'Territórios','research'=>'Acervo e vozes','contribute'=>'Contribuir','privacy'=>'Privacidade','about'=>'Sobre o projeto','error'=>'Página indisponível'];
$title = $titles[$page] ?? 'Ameríndia';
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f6f6f2">
  <meta name="description" content="Um espaço de encontro entre territórios, histórias, pesquisas e vozes indígenas.">
  <title><?= e($title) ?> · Ameríndia</title>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <link rel="stylesheet" href="/assets/css/<?= e($page === 'territories' ? 'map' : 'pages') ?>.css">
  <?php if ($page === 'territories'): ?><link rel="stylesheet" href="/vendor/leaflet/leaflet.css"><script src="/vendor/leaflet/leaflet.js" defer></script><?php endif; ?>
  <script type="module" src="/assets/js/app.js"></script>
</head>
<body data-page="<?= e($page) ?>">
<a class="skip-link" href="#main">Pular para o conteúdo</a>
<?php require ROOT . '/templates/partials/header.php'; ?>
<main id="main"><?php require ROOT . '/templates/pages/' . $page . '.php'; ?></main>
<?php if ($page !== 'territories') { require ROOT . '/templates/partials/footer.php'; } ?>
<?php require ROOT . '/templates/partials/search.php'; ?>
<div id="announcement" class="sr-only" role="status" aria-live="polite"></div>
</body>
</html>
