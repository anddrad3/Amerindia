<?php
declare(strict_types=1);
namespace Amerindia\Service;
use Amerindia\Database;
final class Import {
    public function __construct(private Database $db) {}
    private function read(string $path): array {
        if (!is_file($path) || filesize($path)>25*1024*1024) { throw new \InvalidArgumentException('JSON local ausente ou maior que 25 MB.'); }
        return json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);
    }
    private function text(array $data,string $key,int $max=500): string {
        $value=$data[$key]??null;
        if(!is_string($value) || trim($value)==='' || mb_strlen($value)>$max)throw new \InvalidArgumentException('Campo inválido: '.$key);
        return trim($value);
    }
    private function url(string $url): void {
        if(!filter_var($url,FILTER_VALIDATE_URL) || parse_url($url,PHP_URL_SCHEME)!=='https')throw new \InvalidArgumentException('A fonte deve ter endereço HTTPS.');
    }
    public function territory(string $path): void {
        $feature=$this->read($path);
        if(($feature['type']??'')!=='Feature')throw new \InvalidArgumentException('Importe uma Feature GeoJSON por vez.');
        $p=$feature['properties']??[];
        $id=$this->text($p,'id',80);
        if(!preg_match('/^[a-z0-9-]+$/D',$id))throw new \InvalidArgumentException('ID inválido.');
        $from=$p['valid_from']??null;$to=$p['valid_to']??null;
        if(!is_int($from)||!is_int($to)||$from<1500||$to>2100||$to<$from)throw new \InvalidArgumentException('Período inválido.');
        $url=$this->text($p,'source_url');$this->url($url);
        $sourceDate=$this->text($p,'source_date',120);
        $retrieved=$this->text($p,'retrieved_at',10);
        if(!preg_match('/^\d{4}-\d{2}-\d{2}$/D',$retrieved))throw new \InvalidArgumentException('Use retrieved_at no formato AAAA-MM-DD.');
        GeometryValidator::validate($feature['geometry']??[]);
        $values=[$id,$this->text($p,'name',180),$this->text($p,'people',1000),$this->text($p,'region',100),$this->text($p,'description',2000),$url,$this->text($p,'official_status',120)];
        $this->db->pdo->beginTransaction();
        try {
            $overlap=$this->db->pdo->prepare('SELECT COUNT(*) FROM territory_snapshots WHERE territory_id=? AND valid_from<=? AND valid_to>=?');
            $overlap->execute([$id,$to,$from]);
            if($overlap->fetchColumn())throw new \InvalidArgumentException('Já existe um recorte sobreposto. Revise os períodos; nenhuma camada foi substituída.');
            $this->db->pdo->prepare('INSERT INTO territories VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING')->execute($values);
            $this->db->pdo->prepare('INSERT INTO territory_snapshots VALUES(?,?,?,?,?,?,?,?)')->execute([$id.'-'.$from.'-'.$to,$id,$from,$to,$sourceDate,$retrieved,$url,json_encode($feature['geometry'],JSON_THROW_ON_ERROR)]);
            $this->db->pdo->commit();
        }catch(\Throwable $e){$this->db->pdo->rollBack();throw $e;}
    }
    public function research(string $path,?string $submissionId): void {
        $item=$this->read($path);$fields=['id','title','author','voice','people','region','period','topic'];$values=[];
        foreach($fields as $field)$values[]=$this->text($item,$field,$field==='id'?80:500);
        if(!preg_match('/^[a-z0-9-]+$/D',$item['id']))throw new \InvalidArgumentException('ID inválido.');
        if(!in_array($item['voice'],['indigena','nao-indigena','coautoria','institucional'],true))throw new \InvalidArgumentException('Categoria inválida.');
        $year=$item['year']??null;if($year!==null && (!is_int($year)||$year<1500||$year>2100))throw new \InvalidArgumentException('Ano inválido.');
        $values[]=$year;$values[]=$this->text($item,'summary',3000);$url=$this->text($item,'url');$this->url($url);$values[]=$url;
        $this->db->pdo->beginTransaction();
        try {
            if($submissionId){
                $q=$this->db->pdo->prepare("SELECT * FROM submissions WHERE id=? AND kind='research' AND status='approved' AND signature_verified_at IS NOT NULL");$q->execute([$submissionId]);$submission=$q->fetch();
                if(!$submission)throw new \InvalidArgumentException('A submissão precisa estar aprovada e ter assinatura conferida.');
                if($submission['voice']!==$item['voice'] || !$submission['voice_consent'])throw new \InvalidArgumentException('Categoria pública não autorizada na submissão. Solicite autorização antes de classificar.');
            }
            $this->db->pdo->prepare('INSERT INTO research(id,title,author,voice,people,region,period,topic,year,summary,url) VALUES(?,?,?,?,?,?,?,?,?,?,?)')->execute($values);
            if($submissionId)$this->db->pdo->prepare("UPDATE submissions SET status='published',reviewed_at=? WHERE id=?")->execute([date(DATE_ATOM),$submissionId]);
            $this->db->pdo->commit();
        }catch(\Throwable $e){$this->db->pdo->rollBack();throw $e;}
    }
}
