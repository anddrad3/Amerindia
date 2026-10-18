<?php
// Development only. Production document root MUST be /public.
declare(strict_types=1);
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/',PHP_URL_PATH) ?: '/');
$root = realpath(__DIR__.'/public');
$file = realpath($root . $path);
if ($file && str_starts_with($file,$root . DIRECTORY_SEPARATOR) && is_file($file) && preg_match('/\.(?:css|js|png|jpg|svg|ico|pdf|woff2)$/D',$file)) {
    return false;
}
require __DIR__.'/public/index.php';
