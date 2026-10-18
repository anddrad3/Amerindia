<?php
declare(strict_types=1);
namespace Amerindia\Service;
final class GeometryValidator {
    public static function validate(array $geometry): void {
        $type=$geometry['type'] ?? '';
        if (!in_array($type,['Polygon','MultiPolygon'],true) || !is_array($geometry['coordinates'] ?? null)) {
            throw new \InvalidArgumentException('Use Polygon ou MultiPolygon em WGS84 (longitude, latitude).');
        }
        $polygons=$type==='Polygon'?[$geometry['coordinates']]:$geometry['coordinates'];
        if (!$polygons) { throw new \InvalidArgumentException('Geometria vazia.'); }
        $count=0;
        foreach ($polygons as $polygon) {
            if (!is_array($polygon) || !$polygon) { throw new \InvalidArgumentException('Polígono vazio.'); }
            foreach ($polygon as $ring) {
                if (!is_array($ring) || count($ring)<4 || $ring[0]!==$ring[count($ring)-1]) { throw new \InvalidArgumentException('Anéis precisam ser fechados e ter pelo menos 4 pontos.'); }
                foreach ($ring as $point) {
                    if (++$count>250000 || !is_array($point) || count($point)!==2 || !is_numeric($point[0]) || !is_numeric($point[1]) || !is_finite((float)$point[0]) || !is_finite((float)$point[1]) || abs((float)$point[0])>180 || abs((float)$point[1])>90) { throw new \InvalidArgumentException('Coordenada inválida ou geometria grande demais.'); }
                }
            }
        }
    }
}
