<?php
declare(strict_types=1);
define('ROOT', dirname(__DIR__));
spl_autoload_register(static function (string $class): void {
    if (str_starts_with($class, 'Amerindia\\')) {
        $path = ROOT . '/src/' . str_replace('\\', '/', substr($class, 10)) . '.php';
        if (is_file($path)) { require $path; }
    }
});
require __DIR__ . '/helpers.php';
$config = require ROOT . '/config/defaults.php';
if (is_file(ROOT . '/config/local.php')) {
    $config = array_replace($config, require ROOT . '/config/local.php');
}
// A separate location lets integration tests run without touching real submissions.
if (PHP_SAPI === 'cli' || PHP_SAPI === 'cli-server') {
    if ($testStorage = getenv('AMERINDIA_STORAGE')) { $config['storage'] = $testStorage; }
}
date_default_timezone_set('America/Sao_Paulo');
ini_set('display_errors', '0');
ini_set('log_errors', '1');
umask(0077);
foreach (['', '/uploads', '/sessions'] as $directory) {
    if (!is_dir($config['storage'] . $directory)) {
        mkdir($config['storage'] . $directory, 0700, true);
    }
}
$db = new Amerindia\Database($config['storage'] . '/amerindia.sqlite');
