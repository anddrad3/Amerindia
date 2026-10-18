<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
require dirname(__DIR__).'/src/bootstrap.php';
use Amerindia\Service\Import;
$command=$argv[1]??'help';
function requiredArg(array $args,int $index): string {if(!isset($args[$index]))throw new InvalidArgumentException('Argumento obrigatório ausente. Consulte help.');return $args[$index];}
try {
    switch($command){
        case 'doctor':
            foreach(['pdo_sqlite','fileinfo','mbstring'] as $extension)if(!extension_loaded($extension))throw new RuntimeException('Extensão ausente: '.$extension);
            echo 'PHP '.PHP_VERSION.' | SQLite '.$db->pdo->query('SELECT sqlite_version()')->fetchColumn().PHP_EOL;
            echo 'Ambiente: '.$config['environment'].PHP_EOL;
            echo 'Terras: '.$db->pdo->query('SELECT COUNT(*) FROM territories')->fetchColumn().PHP_EOL;
            echo 'Referências: '.$db->pdo->query('SELECT COUNT(*) FROM research')->fetchColumn().PHP_EOL;
            echo 'Recebimento público: '.($config['environment']==='production' && $config['legal_reviewed'] && $config['operator_name'] && filter_var($config['contact_email'],FILTER_VALIDATE_EMAIL)?'configurado':'aguarda configuração/revisão').PHP_EOL;
            break;
        case 'submissions:list':
            echo json_encode($db->pdo->query('SELECT id,kind,title,status,created_at FROM submissions ORDER BY created_at DESC')->fetchAll(),JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE).PHP_EOL;break;
        case 'submissions:show':
            $id=requiredArg($argv,2);$q=$db->pdo->prepare('SELECT * FROM submissions WHERE id=?');$q->execute([$id]);$entry=$q->fetch();
            if(!$entry)throw new InvalidArgumentException('Protocolo não encontrado.');
            $q=$db->pdo->prepare('SELECT kind,stored_name,bytes,sha256 FROM attachments WHERE submission_id=?');$q->execute([$id]);$entry['attachments']=$q->fetchAll();
            echo json_encode($entry,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE).PHP_EOL;break;
        case 'submissions:review':
            $id=requiredArg($argv,2);$decision=requiredArg($argv,3);$note=requiredArg($argv,4);
            if(!in_array($decision,['approved','rejected','resolved'],true)||mb_strlen($note)<10)throw new InvalidArgumentException('Decisão ou justificativa inválida.');
            $q=$db->pdo->prepare('SELECT * FROM submissions WHERE id=?');$q->execute([$id]);$entry=$q->fetch();
            if(!$entry)throw new InvalidArgumentException('Protocolo não encontrado.');
            if($entry['status']!=='pending')throw new InvalidArgumentException('Apenas envios pendentes podem receber esta decisão.');
            $signature=null;
            if($entry['kind']==='research' && $decision==='resolved')throw new InvalidArgumentException('Pesquisas precisam ser aprovadas ou recusadas.');
            if($entry['kind']!=='research' && $decision==='approved')throw new InvalidArgumentException('Use resolved para contato/retificação.');
            if($entry['kind']==='research' && $decision==='approved'){
                if(!in_array('--signature-checked',$argv,true)||!in_array('--files-scanned',$argv,true))throw new InvalidArgumentException('Confira identidade e integridade no ITI e examine os arquivos em ambiente protegido. Registre --signature-checked e --files-scanned somente após essas etapas.');
                $signature=date(DATE_ATOM);
            }
            $db->pdo->prepare('UPDATE submissions SET status=?,reviewed_at=?,signature_verified_at=?,reviewer_note=? WHERE id=?')->execute([$decision,date(DATE_ATOM),$signature,$note,$id]);
            echo "Decisão registrada. Isso não publica anexos.\n";break;
        case 'territories:import':(new Import($db))->territory(requiredArg($argv,2));echo "Recorte importado.\n";break;
        case 'research:import':
            if(!in_array('--editorial-reviewed',$argv,true))throw new InvalidArgumentException('Use --editorial-reviewed após conferir autoria, referências e direitos.');
            $submissionId=null;$position=array_search('--submission',$argv,true);if($position!==false)$submissionId=requiredArg($argv,$position+1);
            (new Import($db))->research(requiredArg($argv,2),$submissionId);echo "Referência publicada.\n";break;
        case 'privacy:prune':
            $q=$db->pdo->prepare("SELECT id FROM submissions WHERE status IN ('pending','rejected','resolved') AND created_at<?");$q->execute([date(DATE_ATOM,strtotime('-180 days'))]);$ids=$q->fetchAll(PDO::FETCH_COLUMN);
            echo count($ids)." envios antigos elegíveis.\n";
            if(!in_array('--apply',$argv,true)){echo "Simulação. Use --apply após revisar retenções legais.\n";break;}
            foreach($ids as $id){$q=$db->pdo->prepare('SELECT stored_name FROM attachments WHERE submission_id=?');$q->execute([$id]);foreach($q->fetchAll(PDO::FETCH_COLUMN) as $name){$file=$config['storage'].'/uploads/'.$name;if(is_file($file)&&!unlink($file))throw new RuntimeException('Falha ao excluir anexo.');}$db->pdo->prepare('DELETE FROM submissions WHERE id=?')->execute([$id]);}
            $db->pdo->prepare('DELETE FROM rate_limits WHERE bucket<?')->execute([(int)floor(time()/3600)-24]);echo "Limpeza concluída.\n";break;
        default:echo "Ameríndia — administração local (não expor na web)\n\n".
            "doctor\nsubmissions:list\nsubmissions:show PROTOCOLO\n".
            "submissions:review PROTOCOLO approved|rejected|resolved \"justificativa\" [--signature-checked --files-scanned]\n".
            "territories:import arquivo.geojson\nresearch:import arquivo.json --editorial-reviewed [--submission PROTOCOLO]\n".
            "privacy:prune [--apply]\n";
    }
}catch(Throwable $error){fwrite(STDERR,$error->getMessage().PHP_EOL);exit(1);}
