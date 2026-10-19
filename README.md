# Ameríndia

Plataforma editorial em **PHP 8.4 + SQLite**, com páginas renderizadas no servidor e módulos JavaScript sem etapa de build. O diretório público é exclusivamente `public/`.

## Executar no Windows

O PHP portátil já foi preparado em `.tools/php/` nesta máquina. Para outro computador, execute `powershell -File scripts/install-php.ps1` (fonte oficial e SHA-256 conferido). Alternativamente, instale PHP 8.4 com `pdo_sqlite`, `fileinfo` e `mbstring`.

```powershell
powershell -File scripts/start.ps1
```

Abra **http://127.0.0.1:8080**. O primeiro acesso cria o banco e importa quatro terras da Funai e quatro referências editoriais. `storage/`, configurações privadas e ferramentas locais não entram no Git.

Linux/macOS, com PHP instalado:

```sh
php -S 127.0.0.1:8080 -t public router.php
```

O servidor embutido é apenas para desenvolvimento. Não execute com a raiz do repositório como document root. **GitHub Pages não executa PHP nem SQLite**; o repositório contém o código, não uma implantação pública.

## O que está implementado

- Abertura e páginas de território, acervo, contribuição, privacidade e método com a paleta original preta/cinza/laranja, temas claro e escuro e menu circular animado. O tema escolhido é lembrado neste navegador.
- Leaflet 1.9.4 servido localmente; mapa de fundo OpenStreetMap, créditos visíveis, aviso de indisponibilidade e recarga. Não existe promessa de SLA do fornecedor gratuito.
- Quatro polígonos oficiais: Yanomami, Parque do Xingu, Barra Velha e Barra Velha do Monte Pascoal. Clique, foco e passagem do mouse destacam a terra.
- Pins identificam os povos a partir das terras do cadastro atual: Yanomami, Pataxó (duas terras no mesmo pin) e o conjunto de povos do Xingu. Não são aldeias nem localização histórica; o recorte de referência dos pins é 2026.
- Logotipo original fornecido pelo projeto no cabeçalho e no rodapé, preservado sem alterações no arquivo PNG.
- Cards abrem fichas com informações e autoria. Downloads aparecem apenas quando há fonte autorizada cadastrada; o relatório da CNV inclui um PDF oficial. Os livros sem licença não são copiados.
- O mapa abre enquadrado no Brasil, com limite de afastamento e deslocamento ao seu recorte geográfico. O botão Brasil restaura o enquadramento; países vizinhos podem aparecer nas bordas da tela.
- Selecionar uma terra abre o board em mapa mental: cards conectados, arraste, navegação pelo fundo, zoom, enquadramento, expansão e divisor redimensionável. Posições ficam no navegador, por terra. Setas movem o card pelo título; um seletor centraliza cada card para leitura, também no celular.
- Cards usam os dados publicados do catálogo e a fonte do recorte temporal escolhido. Conexões representam relações editoriais, não limites geográficos; o desenho territorial é uma miniatura ilustrativa da geometria cadastrada. Não há respostas simuladas de IA ou selos de verificação inventados.
- Localização solicitada por clique; distância calculada no dispositivo até os limites das terras cadastradas, incluindo polígonos com ilhas ou furos. Não compara todas as terras brasileiras, não fornece rota nem autorização de entrada.
- Linha do tempo consulta recortes documentados. O conjunto inicial representa a consulta de 2026; anos sem mapas são explicitamente identificados. A importação de outros recortes já funciona.
- Catálogo filtrável por período, região, povo, tema e autoria. Instituições e coautorias têm categorias próprias. A autoria indígena não é inferida de nome ou aparência.
- Busca textual com lupa, incluindo autores, temas, povos e territórios. A IA é uma extensão futura identificada na interface, sem simular respostas de IA.
- Formulários persistentes para pesquisas, correções e contato; protocolo de recebimento, anexos privados e revisão administrativa.
- Termo preenchível em PDF, inventário de direitos, instruções gov.br e referências legais. A assinatura é conferida pela equipe no ITI, não automaticamente pela aplicação.

## Antes da abertura pública

O usuário solicitou manter o nome e o e-mail **configuráveis**. Copie `config/local.example.php` para `config/local.php` e preencha a origem HTTPS, responsável e contato. A abertura pública de submissões exige `legal_reviewed=true` depois da adequação real do termo e da política. O desenvolvimento local permite testar a fila sem esses dados; nenhum e-mail é enviado.

Veja [implantação](docs/DEPLOYMENT.md), [segurança](docs/SECURITY.md), [operação editorial](docs/EDITORIAL.md) e [fontes](docs/SOURCES.md).

## Organização

| Diretório | Responsabilidade |
| --- | --- |
| `public/` | Único conteúdo exposto pela web; entrada PHP, estilos, módulos, biblioteca e termo |
| `src/` | Bootstrap, cabeçalhos, sessões, SQLite, repositório e serviços |
| `templates/` | Layout, componentes PHP e páginas |
| `database/schema.sql` | Esquema e restrições |
| `database/seed/` | Importação inicial rastreável |
| `database/editorial/` | Conteúdo original preservado, ainda não validado para republicação |
| `bin/` | Administração por terminal, sem painel público |
| `scripts/` | Ambiente local, conversão cartográfica e geração do PDF |
| `tests/` | Testes de geometria, localização, HTTP, segurança e revisão |
| `storage/` | Banco, sessões e anexos privados, ignorados pelo Git |

Os arquivos monolíticos do protótipo foram substituídos. Seus dados foram preservados em JSONs editoriais separados; o código e HTML originais continuam no histórico Git anterior à migração. Os selos antigos de verificação e PDFs simulados não foram transportados como evidência de validação.

## Verificações

```powershell
.tools/php/php.exe bin/console.php doctor
node --test tests/geometry.test.mjs tests/location.test.mjs tests/board.test.mjs
python tests/integration.py
```

Os testes HTTP iniciam outro servidor e usam um diretório temporário isolado. Não inserem registros no banco do projeto. Fixtures cartográficas de teste nunca são publicadas.

Para regenerar o termo: `python scripts/generate_term.py` com ReportLab e pypdf instalados. Renderize o PDF para revisão visual após alterações. Para atualizar polígonos, consulte o procedimento documentado nas fontes; não atribua datas históricas a geometrias atuais sem documentação.
