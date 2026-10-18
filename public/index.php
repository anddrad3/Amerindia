<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
use Amerindia\{HttpError,Security};
use Amerindia\Repository\Catalog;
use Amerindia\Service\Submission;
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$isApi = str_starts_with((string)$path, '/api/');
try {
    Security::start($config);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($path === '/api/submissions' && $method === 'POST') {
        jsonResponse((new Submission($db,$config))->create(),201);
    }
    if (!in_array($method,['GET','HEAD'],true)) { header('Allow: GET, HEAD'); throw new HttpError(405,'Método não permitido.'); }
    $catalog = new Catalog($db);
    if ($path === '/api/catalog') { jsonResponse(['research'=>$catalog->research(),'territories'=>$catalog->territories()]); }
    if ($path === '/api/territories') {
        $rawYear = $_GET['year'] ?? '2026';
        if (!is_string($rawYear) || !preg_match('/^\d{4}$/D',$rawYear) || (int)$rawYear < 1500 || (int)$rawYear > 2100) { throw new HttpError(422,'Ano inválido.'); }
        jsonResponse($catalog->geometry((int)$rawYear));
    }
    $routes = ['/' => 'home','/territorios'=>'territories','/acervo'=>'research','/contribuir'=>'contribute','/privacidade'=>'privacy','/sobre'=>'about'];
    if (!isset($routes[$path])) { throw new HttpError(404,'Página não encontrada.'); }
    render($routes[$path], ['config'=>$config,'path'=>$path,'csrf'=>$_SESSION['csrf'],'catalog'=>$catalog]);
} catch (HttpError $error) {
    if ($isApi) { jsonResponse(['error'=>$error->getMessage()],$error->status); }
    http_response_code($error->status);
    render('error',['config'=>$config,'path'=>$path,'error'=>$error->getMessage()]);
} catch (Throwable $error) {
    error_log('Amerindia: ' . get_class($error) . ': ' . $error->getMessage());
    if ($isApi) { jsonResponse(['error'=>'Não foi possível completar a operação. Tente novamente.'],500); }
    http_response_code(500);
    echo 'Não foi possível carregar esta página. Tente novamente.';
}
