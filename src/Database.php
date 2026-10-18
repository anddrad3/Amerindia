<?php
declare(strict_types=1);
namespace Amerindia;
final class Database {
    public readonly \PDO $pdo;
    public function __construct(string $path) {
        $this->pdo = new \PDO('sqlite:' . $path, null, null, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);
        $this->pdo->exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;');
        $this->pdo->exec(file_get_contents(ROOT . '/database/schema.sql'));
        $this->pdo->exec('BEGIN IMMEDIATE');
        try {
            if (!$this->pdo->query('SELECT version FROM schema_versions WHERE version=1')->fetchColumn()) {
                $this->seed();
                $this->pdo->exec('INSERT INTO schema_versions VALUES(1)');
            }
            $this->pdo->exec('COMMIT');
        } catch (\Throwable $error) {
            $this->pdo->exec('ROLLBACK');
            throw $error;
        }
    }
    private function seed(): void {
        $research = json_decode(file_get_contents(ROOT . '/database/seed/research.json'), true, 512, JSON_THROW_ON_ERROR);
        $statement = $this->pdo->prepare('INSERT INTO research(id,title,author,voice,people,region,period,topic,year,summary,url) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
        foreach ($research as $row) { $statement->execute(array_values($row)); }
        $catalog = json_decode(file_get_contents(ROOT . '/database/seed/territories.json'), true, 512, JSON_THROW_ON_ERROR);
        $territory = $this->pdo->prepare('INSERT INTO territories VALUES(?,?,?,?,?,?,?)');
        $snapshot = $this->pdo->prepare('INSERT INTO territory_snapshots VALUES(?,?,?,?,?,?,?,?)');
        foreach ($catalog['features'] as $feature) {
            $p = $feature['properties'];
            $territory->execute([$p['id'],$p['name'],$p['people'],$p['region'],$p['description'],$p['source_url'],$p['official_status']]);
            $snapshot->execute([$p['id'].'-2026',$p['id'],2026,2026,$p['source_date'],$p['retrieved_at'],$p['source_url'],json_encode($feature['geometry'], JSON_THROW_ON_ERROR)]);
        }
        $this->pdo->prepare('INSERT INTO settings VALUES(?,?)')->execute(['rate_secret', bin2hex(random_bytes(32))]);
    }
}
