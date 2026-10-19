# Operação editorial

Todos os comandos são executados no servidor, por uma pessoa autorizada, com acesso ao diretório privado. No Windows deste projeto substitua `php` por `.tools/php/php.exe`.

## Receber, ler e decidir

```sh
php bin/console.php submissions:list
php bin/console.php submissions:show PROTOCOLO
```

O segundo comando contém dados pessoais; não cole a saída em canais públicos. Ele identifica os anexos em `storage/uploads/`, tamanhos e hashes. Examine os arquivos em ambiente protegido com leitor e antivírus atualizados; nunca os execute ou os disponibilize publicamente antes de revisar.

Na pesquisa, confira: identidade e correspondência dos signatários; assinatura e integridade do PDF original no [VALIDAR](https://validar.iti.gov.br/); autorização dos demais titulares; fontes; créditos; licenças; direitos de imagem; informações sensíveis e conhecimentos coletivos. Não altere o termo assinado nem aplique sanitização que invalide sua assinatura. Mantenha o original privado; uma cópia de leitura deve ser tratada separadamente.

```sh
php bin/console.php submissions:review PROTOCOLO approved "Conferência editorial, de direitos, assinatura e segurança concluída" --signature-checked --files-scanned
php bin/console.php submissions:review PROTOCOLO rejected "Motivo específico e orientação de correção"
php bin/console.php submissions:review PROTOCOLO resolved "Retificação ou contato analisado e respondido"
```

As flags são um registro da diligência humana, não uma verificação automática. Não as use para contornar a análise. Pesquisas recebem approved/rejected; contatos e correções recebem resolved/rejected. A decisão não publica anexos.

## Publicar uma referência revisada

Crie um JSON com os campos do exemplo abaixo. Para material enviado, indique o protocolo aprovado. Se a autoria não foi informada, obtenha consentimento específico antes de publicar uma classificação; não atribua origem étnica por inferência.

```json
{
  "id": "identificador-unico",
  "title": "Título revisado",
  "author": "Autoria confirmada",
  "voice": "coautoria",
  "people": "Povo ou povos relacionados",
  "region": "Norte",
  "period": "Contemporâneo",
  "topic": "Território e demarcação",
  "year": 2026,
  "summary": "Resumo editorial aprovado.",
  "url": "https://seu-dominio.example/publicacoes/material-revisado.pdf"
}
```

```sh
php bin/console.php research:import referencia.json --editorial-reviewed --submission PROTOCOLO
```

Para referência bibliográfica externa independente, omita `--submission`; isso é uma ação de curadoria do administrador, não um caminho público. `voice` aceita `indigena`, `nao-indigena`, `coautoria`, `institucional`. Não se exige que uma instituição seja classificada etnicamente.

O link deve ser HTTPS. Um PDF de pesquisa próprio, após aprovação e exame de segurança, pode ser publicado por um operador em `public/publicacoes/` com nome estável e metadados revisados. Nunca copie o termo assinado, documentos de contato ou anexos brutos indiscriminadamente para essa pasta. A primeira versão não automatiza a publicação de arquivos nem inclui uma tela web administrativa.

### Fichas de autoria e downloads

O importador de pesquisa aceita `authors` como lista de objetos `{name,bio,url}` com fonte HTTPS. Para oferecer download, adicione `download_url`, `download_label`, `rights_note` e `download_authorized: true` **após** conferir autorização/licença. Esses metadados ficam em `research_details`, no SQLite. Sem download autorizado, a ficha mostra apenas a referência original. As fichas aparecem no acervo e nos cards relacionados do board.

As biografias iniciais foram resumidas a partir das fontes indicadas em cada perfil. O PDF da CNV é aberto diretamente no Arquivo Nacional; a informação de reprodução com citação consta na página de créditos do volume II. Nenhum anexo privado recebido é transformado automaticamente em download.

## Importar um mapa temporal

Importe uma **Feature** GeoJSON WGS84 (longitude, latitude), Polygon ou MultiPolygon. Ela deve conter `id`, `name`, `people`, `region`, `description`, `official_status`, `source_url` HTTPS, `source_date`, `retrieved_at` AAAA-MM-DD, `valid_from` e `valid_to` inteiros. Os períodos são inclusivos. Uma terra pode ter vários recortes, mas intervalos sobrepostos são recusados.

```sh
php bin/console.php territories:import recorte-documentado.geojson
```

O importador verifica estrutura, limites de coordenadas, fechamento dos anéis, tamanho e sobreposição temporal. Ainda é indispensável revisão cartográfica: não verifica topologia, autenticidade ou fundamento histórico. Não preencha períodos retroativamente só porque a homologação ocorreu naquela data. O perímetro pode ter mudado.

O controle temporal atual vai de 1500 a 2026. Para períodos futuros, ajuste seu máximo na página e a seleção padrão. As áreas iniciais foram consultadas em 2026; a data original de atualização de cada geometria aparece nos detalhes.

## Materiais preservados do protótipo

`database/editorial/` guarda os pesquisadores, povos, eventos e board originais, como rascunhos. Há links vazios, afirmações a conferir e imagens externas que não estabelecem direitos de publicação. Eles não são servidos pelo site nem usados como fontes verificadas. A versão anterior completa permanece no histórico Git.

## Retenção e direitos

`privacy:prune` faz simulação; `privacy:prune --apply` elimina registros pendentes, recusados e resolvidos com mais de 180 dias, incluindo os anexos. Revise necessidade legal de conservação antes de aplicar. Registros aprovados/publicados exigem revisão anual de retenção e tratamento individual de pedidos. Não há e-mail automático: acompanhe a fila e responda pelo canal institucional quando ele for configurado.
