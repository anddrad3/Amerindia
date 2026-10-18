# Fontes, proveniência e decisões

Consulta e implementação: **18/10/2026**. O desenho é original. O ISA foi consultado como referência documental e historiográfica, não como modelo visual ou parceiro do projeto.

## Cartografia

- [GeoServer da Funai](https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas/geoserver-funai), camada `Funai:tis_poligonais`. O GetCapabilities informa reprodução permitida com citação da fonte, exceto conteúdos com condições próprias. Não foram importadas coordenadas de aldeias ou pontos sensíveis.
- Requisição WFS 1.0.0 `GetFeature` em `https://geoserver.funai.gov.br/geoserver/ows`, `typeName=Funai:tis_poligonais`, `outputFormat=application/json`, `srsName=EPSG:4326`, filtro `terrai_nome IN ('Yanomami','Parque do Xingu','Barra Velha','Barra Velha do Monte Pascoal')`.
- O arquivo `database/seed/territories.json` conserva as geometrias retornadas, com nomes, situação, datas e crédito. O GeoJSON é um recorte de consulta em 2026; não implica que a geometria só existia em 2026, nem que corresponde a qualquer ano anterior.
- `scripts/prepare_data.py` converte uma resposta baixada para `tmp/funai-territories.json` e gera a ilustração da abertura. Essa ilustração usa contorno reduzido para apresentação; os círculos de fundo são gráficos decorativos, não curvas de nível reais.
- [OpenStreetMap: política de tiles](https://operations.osmfoundation.org/policies/tiles/) e [atribuição](https://www.openstreetmap.org/copyright).
- [Leaflet: distribuição oficial](https://leafletjs.com/download.html), versão estável 1.9.4, licença BSD-2-Clause conservada em `public/vendor/leaflet/LICENSE`.

O problema relatado do mapa não foi reproduzido como uma indisponibilidade permanente: os endpoints antigos de OpenLayers e CARTO responderam HTTP 200 na inspeção. O protótipo dependia de bibliotecas externas e não tratava erros de tiles. A nova versão serve a biblioteca localmente, usa o endpoint padrão do OpenStreetMap e apresenta estado de falha recuperável.

## Acervo inicial

- [A queda do céu, Companhia das Letras](https://www.companhiadasletras.com.br/9788535926200-a-queda-do-ceu-3640/p): referência da edição brasileira de 2015; Davi Kopenawa e Bruce Albert, em coautoria.
- [ANMIGA](https://anmiga.org/): portal da Articulação Nacional das Mulheres Indígenas Guerreiras da Ancestralidade; link para a própria organização, sem reproduzir suas publicações.
- [Comissão Nacional da Verdade / Arquivo Nacional](https://www.gov.br/memoriasreveladas/pt-br/assuntos/comissoes-da-verdade/cnv): referência institucional do relatório final de 2014, com o volume II sobre textos temáticos.
- [Terras Indígenas no Brasil / ISA](https://www.ti.socioambiental.org/pt-br): referência institucional externa. O mapa de [dezembro de 2022](https://acervo.socioambiental.org/acervo/mapas-e-cartas-topograficas/brasil/terras-indigenas-no-brasil-dezembro-2022) ilustra a importância de indicar o período do documento, sem assumir que disponibiliza um GeoJSON histórico pronto para uso.

Não foram reproduzidas fotos sem licença, atribuídas falas novas a lideranças, inventados depoimentos nem atribuída identidade étnica a autores individuais desconhecidos. A categoria de vozes não indígenas começa disponível para contribuições futuras; fontes institucionais não são automaticamente tratadas como autores não indígenas.

## Termo e privacidade

O PDF é um **modelo inicial**, não um parecer jurídico. Ele exige declaração de autoria e direitos ou licenças suficientes, créditos, inventário de materiais e autorizações; não promete isenção do projeto nem cria punições por contrato. A configuração de produção exige adequação do operador e confirmação de revisão.

- [Lei 9.610/1998](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm): direitos autorais; textos e fotografias; direitos morais, autorização, limites legais e consequências civis.
- [Código Civil](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm): direitos da personalidade, atos ilícitos e reparação, em especial arts. 20, 186, 187 e 927.
- [Código Penal](https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm): art. 184; aplicação depende dos requisitos legais da hipótese, sem penalidade automática pelo termo.
- [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm): necessidade, finalidade, consentimento, dados étnicos sensíveis, direitos dos titulares e segurança.
- [MP 2.200-2/2001](https://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm): art. 10, § 2º, comprovação de autoria e integridade aceita pelas partes; não se afirma validade irrestrita em todo contexto.
- [Serviço de assinatura gov.br](https://www.gov.br/governodigital/pt-br/identidade/assinatura-eletronica/assinatura-eletronica/): conta prata ou ouro, download do documento assinado e validação no ITI.
- [VALIDAR / ITI](https://validar.iti.gov.br/): conferência humana da assinatura e integridade no fluxo editorial.

## Segurança

[OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html): defesa em camadas, lista de tipos, verificação independente de MIME, nomes gerados, limites e armazenamento privado. Consulte os limites reais em `SECURITY.md`.
