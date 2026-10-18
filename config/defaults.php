<?php
declare(strict_types=1);
return [
    'environment' => 'development',
    'origin' => 'http://127.0.0.1:8080',
    'storage' => dirname(__DIR__) . '/storage',
    'operator_name' => '',
    'contact_email' => '',
    'legal_reviewed' => false,
    'max_file_bytes' => 5 * 1024 * 1024,
    'max_storage_bytes' => 500 * 1024 * 1024,
    'submissions_per_hour' => 5,
];
