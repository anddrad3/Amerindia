<?php
declare(strict_types=1);
namespace Amerindia\Repository;
use Amerindia\Database;
final class Catalog {
    public function __construct(private Database $db) {}
    public function research(): array {
        return $this->db->pdo->query("SELECT id,title,author,voice,people,region,period,topic,year,summary,url FROM research WHERE status='published' ORDER BY year DESC,title")->fetchAll();
    }
    public function territories(): array {
        $items = $this->db->pdo->query('SELECT * FROM territories ORDER BY name')->fetchAll();
        $query = $this->db->pdo->prepare('SELECT id,valid_from,valid_to,source_date,retrieved_at,source_url FROM territory_snapshots WHERE territory_id=? ORDER BY valid_from');
        foreach ($items as &$item) { $query->execute([$item['id']]); $item['snapshots'] = $query->fetchAll(); }
        return $items;
    }
    public function geometry(int $year): array {
        $query = $this->db->pdo->prepare('SELECT t.*,s.source_url AS source_url,s.geometry,s.source_date,s.retrieved_at,s.valid_from,s.valid_to FROM territories t JOIN territory_snapshots s ON t.id=s.territory_id WHERE s.valid_from<=? AND s.valid_to>=? ORDER BY t.name');
        $query->execute([$year,$year]);
        $features = [];
        foreach ($query as $row) {
            $geometry = json_decode($row['geometry'], true, 512, JSON_THROW_ON_ERROR);
            unset($row['geometry']);
            $features[] = ['type'=>'Feature','id'=>$row['id'],'properties'=>$row,'geometry'=>$geometry];
        }
        return ['type'=>'FeatureCollection','features'=>$features,'year'=>$year];
    }
}
