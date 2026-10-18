# Segurança: controles implementados e limites

Não existe base técnica para prometer "99% dos ataques". Estes controles reduzem riscos concretos; não substituem atualização, revisão independente, configuração segura e monitoramento.

## Controles

| Risco | Medida |
| --- | --- |
| Injeção SQL | PDO com parâmetros; IDs e filtros validados; sem SQL construído a partir dos formulários |
| XSS | Saída PHP escapada; DOM com `textContent`; links HTTPS validados; nenhum HTML de contribuição é renderizado |
| CSRF | Token imprevisível por sessão, validade, comparação constante, conferência de origem e Fetch Metadata |
| Sessão | Cookies HttpOnly, SameSite e Secure em HTTPS; modo estrito; regeneração inicial e na renovação do token |
| Clickjacking e conteúdo ativo | CSP, frame-ancestors none, X-Frame-Options DENY, nosniff e object-src none |
| Upload inseguro | Até dois PDFs de 5 MB; validação de extensão, MIME, cabeçalho, tamanho e origem PHP do upload; nomes aleatórios; SHA-256 registrado |
| Exposição de documentos | Anexos e SQLite fora do document root; nenhuma rota pública para baixar submissões |
| Abuso de formulários | Limite de cinco tentativas por IP/hora, honeypot, teto de 500 envios pendentes e 500 MB de anexos |
| Traversal / inclusão de arquivos | Rotas fixas; template escolhido por whitelist; arquivos de upload recebem nomes gerados internamente |
| SSRF | Links informados são armazenados, não baixados pelo servidor; importadores consomem arquivos locais administrados |
| Publicação indevida | Fila privada; revisão registrada; aprovação de pesquisa exige declarações administrativas de verificação da assinatura e exame dos arquivos |
| Privacidade | Não se envia localização ao backend; classificação étnica voluntária com consentimento específico; dados privados fora do Git |
| Dependência externa | Leaflet fixado em 1.9.4 e servido localmente com licença; runtime PHP obtido de fonte oficial e SHA conferido |

O CSP permite estilos inline porque o Leaflet usa atributos de estilo para posicionar elementos; scripts inline e eval não são permitidos. Os importadores são ferramentas de administração por terminal, sob as permissões do sistema operacional; não são endpoints de usuários.

## Limites relevantes

- Validar MIME e `%PDF-` não prova que um PDF é seguro ou que está assinado. Os arquivos ficam em quarentena privada. A análise de malware e a conferência no VALIDAR/ITI são etapas humanas documentadas; não há scanner ou serviço de verificação criptográfica conectado.
- Não há painel administrativo público, senha padrão, reset de senha nem contas de visitantes. A identificação do remetente no formulário não é autenticação. O revisor deve verificar identidade, coautoria, direitos e correspondência com a assinatura antes de aprovar.
- Limite por IP na aplicação não impede botnets ou DDoS e não substitui limites do servidor, WAF ou capacidade de infraestrutura. Requisições muito grandes devem ser barradas no proxy antes de chegar ao PHP.
- Limites de quota baseiam-se nos anexos registrados; monitorar disco também protege contra sessões, logs e arquivos órfãos após falhas do sistema.
- SQLite não criptografa o banco neste projeto. Proteja armazenamento, ACLs, backups, máquina e credenciais de operação.
- O portal do ITI é externo; a aplicação não se apresenta como gov.br e nunca pede sua senha.
- O recebimento público fica bloqueado enquanto faltar identificação do controlador, contato, HTTPS e confirmação da revisão jurídica. O modo de desenvolvimento é limitado a loopback.
- Os testes são regressões específicas, não pentest completo ou certificação de segurança.

Referência de implementação: [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html). Consulte também [implantação](DEPLOYMENT.md) para limites e proteção no servidor.
