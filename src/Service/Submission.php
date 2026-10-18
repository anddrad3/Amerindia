<?php
declare(strict_types=1);
namespace Amerindia\Service;
use Amerindia\{Database,HttpError,Security};
final class Submission {
    public function __construct(private Database $db, private array $config) {}
    private function field(string $name, int $min, int $max): string {
        $value = $_POST[$name] ?? '';
        if (!is_string($value) || !mb_check_encoding($value,'UTF-8')) { throw new HttpError(422, 'Campo inválido: ' . $name); }
        $value = trim($value);
        if (mb_strlen($value) < $min || mb_strlen($value) > $max || str_contains($value,"\0")) {
            throw new HttpError(422, 'Confira o preenchimento e o tamanho do campo: ' . $name);
        }
        return $value;
    }
    public function create(): array {
        Security::validatePost($this->config);
        Security::rateLimit($this->db, $this->config);
        if ($this->config['environment'] === 'production' && (!$this->config['legal_reviewed'] || !$this->config['operator_name'] || !filter_var($this->config['contact_email'],FILTER_VALIDATE_EMAIL))) {
            throw new HttpError(503, 'O recebimento de materiais será aberto após a conclusão da configuração editorial e de privacidade.');
        }
        if ($this->field('website',0,200) !== '') { throw new HttpError(422, 'Não foi possível receber este envio.'); }
        $kind = $this->field('kind',1,20);
        if (!in_array($kind,['research','correction','contact'],true)) { throw new HttpError(422,'Selecione o tipo de envio.'); }
        $name = $this->field('name',2,120);
        $email = $this->field('email',3,254);
        if (!filter_var($email,FILTER_VALIDATE_EMAIL)) { throw new HttpError(422,'Informe um e-mail válido.'); }
        $title = $this->field('title',3,180);
        $message = $this->field('message',20,12000);
        $url = $this->field('reference_url',0,500);
        if ($url !== '' && (!filter_var($url,FILTER_VALIDATE_URL) || !in_array(parse_url($url,PHP_URL_SCHEME),['https','http'],true))) {
            throw new HttpError(422,'Informe um endereço http ou https válido.');
        }
        if (($_POST['privacy'] ?? '') !== '1') { throw new HttpError(422,'É necessário concordar com o tratamento dos dados para este envio.'); }
        $voice = 'nao-informada';
        $voiceConsent = 0;
        $files = [];
        if ($kind === 'research') {
            if (($_POST['responsibility'] ?? '') !== '1' || ($_POST['adult'] ?? '') !== '1') {
                throw new HttpError(422,'Confirme a maioridade e a declaração de autoria e direitos.');
            }
            $voice = $this->field('voice',1,30);
            if (!in_array($voice,['indigena','nao-indigena','coautoria','nao-informada'],true)) { throw new HttpError(422,'Categoria de autoria inválida.'); }
            if ($voice !== 'nao-informada') {
                if (($_POST['voice_consent'] ?? '') !== '1') { throw new HttpError(422,'Autorize especificamente a classificação da autoria ou escolha não informar.'); }
                $voiceConsent = 1;
            }
            $files = [Upload::inspect('paper',$this->config),Upload::inspect('declaration',$this->config)];
        }
        $id = bin2hex(random_bytes(16));
        $stored = [];
        $this->db->pdo->exec('BEGIN IMMEDIATE');
        try {
            $used = (int)$this->db->pdo->query('SELECT COALESCE(SUM(bytes),0) FROM attachments')->fetchColumn();
            $pending = (int)$this->db->pdo->query("SELECT COUNT(*) FROM submissions WHERE status='pending'")->fetchColumn();
            if ($used + array_sum(array_column($files,'bytes')) > $this->config['max_storage_bytes'] || $pending >= 500) {
                throw new HttpError(503,'A fila editorial está temporariamente cheia. Tente novamente mais tarde.');
            }
            $q = $this->db->pdo->prepare('INSERT INTO submissions(id,kind,name,email,title,message,voice,voice_consent,reference_url,terms_version,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
            $q->execute([$id,$kind,$name,$email,$title,$message,$voice,$voiceConsent,$url,'2026-10-18-v1',date(DATE_ATOM)]);
            $attachment = $this->db->pdo->prepare('INSERT INTO attachments VALUES(?,?,?,?,?,?)');
            foreach ($files as $file) {
                $saved = Upload::store($file,$this->config['storage'].'/uploads');
                $stored[] = $saved['stored_name'];
                $attachment->execute([bin2hex(random_bytes(16)),$id,$saved['kind'],$saved['stored_name'],$saved['bytes'],$saved['sha256']]);
            }
            $this->db->pdo->exec('COMMIT');
        } catch (\Throwable $error) {
            $this->db->pdo->exec('ROLLBACK');
            foreach ($stored as $filename) { unlink($this->config['storage'].'/uploads/'.$filename); }
            throw $error;
        }
        return ['protocol'=>$id,'message'=>'Recebido para análise editorial. Guarde o protocolo; o envio não significa publicação nem validação da assinatura.'];
    }
}
