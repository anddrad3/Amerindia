# Implantação e manutenção

## Requisitos

- PHP 8.4 atualizado, extensões PDO SQLite, fileinfo e mbstring.
- HTTPS em produção; PHP-FPM atrás de Nginx ou Apache corretamente configurado.
- `public/` como document root. `src/`, `database/`, `storage/`, `.git` e `config/` nunca são públicos.
- Código somente leitura para o usuário do serviço. Permissão de escrita apenas no diretório de dados privado, fora do document root.
- Atualizações de sistema, PHP e bibliotecas; limite de requisições no proxy; backup protegido do banco e dos anexos.

## Configuração

Copie `config/local.example.php` para `config/local.php`. Preencha `environment=production`, origem exata HTTPS (sem barra final), nome do responsável, e-mail de contato e caminho absoluto de armazenamento. Só marque `legal_reviewed` após a revisão jurídica/editorial e a adequação dos documentos. O nome e o contato foram deixados configuráveis por decisão do usuário.

Não configure a origem a partir de um Host enviado pelo visitante. O servidor deve aceitar apenas o domínio esperado. A aplicação não confia em `X-Forwarded-For` nem em `X-Forwarded-Proto` arbitrários. Se houver proxy com TLS terminado antes do PHP, configure a indicação HTTPS no servidor **somente para o proxy confiável**; não remova a exigência de HTTPS da aplicação.

Configuração PHP recomendada:

```ini
display_errors=Off
log_errors=On
expose_php=Off
upload_max_filesize=5M
post_max_size=12M
max_file_uploads=2
memory_limit=128M
session.use_strict_mode=1
session.use_only_cookies=1
```

Exemplo de bloco Nginx (adaptar domínio, certificado e socket):

```nginx
server {
    listen 443 ssl;
    server_name seu-dominio.example;
    root /srv/amerindia/public;
    index index.php;
    client_max_body_size 12m;
    # ssl_certificate e ssl_certificate_key definidos pelo administrador.

    location / { try_files $uri $uri/ /index.php?$query_string; }
    location = /index.php {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/index.php;
        fastcgi_param HTTPS on;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    }
    location ~ \.php$ { return 404; }
    location ~ /\. { deny all; }
    location ~* \.(css|js|png|jpg|svg|woff2)$ {
        try_files $uri =404;
        add_header X-Content-Type-Options nosniff always;
    }
}
```

O bloco `HTTPS on` acima só é apropriado ao servidor TLS mostrado. Acrescente limites de conexões e de requisições por IP ao proxy, em especial para `/api/submissions`. Redirecione HTTP para HTTPS no servidor de borda. Não coloque um CDN que cacheie respostas de formulários ou sessões.

Apache: habilite mod_rewrite e permita o `.htaccess` de `public/`. O `.htaccess` da raiz nega acesso por defesa adicional; num VirtualHost com document root em `public/`, permita o acesso a essa pasta explicitamente. Não use a raiz do projeto como atalho de hospedagem.

## Dados e operação

- Execute `php bin/console.php doctor` com o mesmo usuário e configuração do serviço.
- O schema inicial é aplicado com transação; a tabela `schema_versions` evita reimportar o seed. Mudanças posteriores no seed não modificam um banco já iniciado: use importadores ou uma migração versionada.
- Configure uma rotina diária de `php bin/console.php privacy:prune` para listar registros elegíveis. Depois de definir o processo de retenção legal, execute `privacy:prune --apply` para remover os registros com mais de 180 dias. Não use a limpeza automática em registros que precisem ser preservados; mantenha-os sob política de retenção documentada.
- Faça backups consistentes com a API de backup do SQLite ou com o serviço parado. Preserve também anexos e configuração, criptografe as cópias e teste uma restauração. Não copie apenas o `.sqlite` de um banco ativo ignorando WAL/SHM.
- Restrinja leitura dos dados à equipe. Em Linux, diretório 0700 e arquivos 0600; em Windows, aplique ACLs NTFS equivalentes. `chmod` sozinho não impõe todas as ACLs no Windows.
- Não habilite download público de anexos recebidos. Use ambiente protegido e antivírus atualizado na revisão. Um PDF pode conter conteúdo ativo mesmo que tenha MIME e cabeçalho válidos.
- Configure monitoramento de espaço, backups, erros e disponibilidade. Redija a política de logs do servidor (endereços IP e retenção), pois ela é adicional à política da aplicação.
- Contatos são gravados no banco. Não há SMTP, confirmação de e-mail ou notificações automáticas configurados.

## Mapa gratuito

O mapa de fundo utiliza `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, com atribuição e referrer preservados. Não há pré-download, raspagem ou modo offline de tiles. Respeite a política do serviço; volume elevado exige um provedor apropriado ou infraestrutura própria. O código da biblioteca está local, mas imagens de fundo ainda dependem da rede. Os polígonos cadastrados continuam disponíveis quando o provedor falha.
