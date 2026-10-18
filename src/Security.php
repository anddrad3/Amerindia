<?php
declare(strict_types=1);
namespace Amerindia;
final class Security {
    public static function start(array $config): void {
        $isHttps = ($_SERVER['HTTPS'] ?? '') === 'on';
        $local = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1','::1'], true);
        if ($config['environment'] !== 'production' && !$local) {
            throw new HttpError(503, 'Configure o ambiente de produção antes de abrir o acesso público.');
        }
        if ($config['environment'] === 'production' && !$isHttps) {
            throw new HttpError(503, 'Esta aplicação requer HTTPS.');
        }
        header("Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://tile.openstreetmap.org; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'");
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=()');
        header('Cache-Control: no-store');
        if ($isHttps) { header('Strict-Transport-Security: max-age=31536000'); }
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        session_save_path($config['storage'] . '/sessions');
        session_name('amerindia_session');
        session_set_cookie_params(['httponly'=>true,'secure'=>$isHttps,'samesite'=>'Lax','path'=>'/']);
        session_start();
        if (!isset($_SESSION['csrf']) || ($_SESSION['csrf_expires'] ?? 0) < time()) {
            session_regenerate_id(true);
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            $_SESSION['csrf_expires'] = time() + 7200;
        }
    }
    public static function validatePost(array $config): void {
        if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 12 * 1024 * 1024) {
            throw new HttpError(413, 'O envio ultrapassa 12 MB. Cada PDF pode ter até 5 MB.');
        }
        $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
        if (($origin !== null && $origin !== $config['origin']) || ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
            throw new HttpError(403, 'Origem do envio não autorizada.');
        }
        $token = $_POST['csrf'] ?? null;
        if (!is_string($token) || !hash_equals($_SESSION['csrf'], $token)) {
            throw new HttpError(403, 'Sua sessão expirou. Recarregue a página e tente novamente.');
        }
    }
    public static function rateLimit(Database $db, array $config): void {
        $secret = $db->pdo->query("SELECT value FROM settings WHERE name='rate_secret'")->fetchColumn();
        // Never trust arbitrary X-Forwarded-For values. Configure the trusted proxy at the server.
        $key = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', $secret);
        $bucket = (int)floor(time() / 3600);
        $db->pdo->exec('BEGIN IMMEDIATE');
        try {
            $db->pdo->prepare('DELETE FROM rate_limits WHERE bucket < ?')->execute([$bucket - 24]);
            $db->pdo->prepare('INSERT INTO rate_limits VALUES(?,?,1) ON CONFLICT(key,bucket) DO UPDATE SET attempts=attempts+1')->execute([$key,$bucket]);
            $q = $db->pdo->prepare('SELECT attempts FROM rate_limits WHERE key=? AND bucket=?');
            $q->execute([$key,$bucket]);
            $count = (int)$q->fetchColumn();
            $db->pdo->exec('COMMIT');
        } catch (\Throwable $error) { $db->pdo->exec('ROLLBACK'); throw $error; }
        if ($count > $config['submissions_per_hour']) {
            header('Retry-After: 3600');
            throw new HttpError(429, 'Limite de envios atingido. Tente novamente em uma hora.');
        }
    }
}
