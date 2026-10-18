<?php
declare(strict_types=1);
namespace Amerindia\Service;
use Amerindia\HttpError;
final class Upload {
    public static function inspect(string $field, array $config): array {
        $file = $_FILES[$field] ?? null;
        if (!is_array($file) || !is_int($file['error'] ?? null) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new HttpError(422, 'Anexe os dois PDFs: a pesquisa e o termo assinado. Cada um pode ter até 5 MB.');
        }
        if (!is_string($file['name']) || !is_string($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new HttpError(422, 'Arquivo inválido.');
        }
        $bytes = filesize($file['tmp_name']);
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        $head = file_get_contents($file['tmp_name'], false, null, 0, 5);
        if ($bytes < 16 || $bytes > $config['max_file_bytes'] || strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'pdf' || $mime !== 'application/pdf' || $head !== '%PDF-') {
            throw new HttpError(422, 'Formato não aceito. Envie arquivos PDF de até 5 MB.');
        }
        // PDFs remain quarantined. MIME/header checks do not prove safety or validate a signature.
        return ['tmp'=>$file['tmp_name'],'bytes'=>$bytes,'sha256'=>hash_file('sha256',$file['tmp_name']),'kind'=>$field];
    }
    public static function store(array $file, string $directory): array {
        $file['stored_name'] = bin2hex(random_bytes(24)) . '.pdf';
        $path = $directory . '/' . $file['stored_name'];
        if (!move_uploaded_file($file['tmp'], $path)) { throw new \RuntimeException('Cannot store upload'); }
        chmod($path, 0600);
        return $file;
    }
}
