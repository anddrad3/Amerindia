/* PESQUISADORES — 5 distintos */
(function () {
const researchers = {
  davi_kopenawa: {
    name:'Davi Kopenawa & Bruce Albert', photo:'DK',
    affiliation:'Hutukara Associação Yanomami · IRD (Institut de Recherche pour le Développement)',
    bio:'Davi Kopenawa é xamã e liderança Yanomami, presidente da Hutukara, indicado ao Nobel da Paz e laureado com o Right Livelihood Award (2019). Bruce Albert é antropólogo francês do IRD/CNRS que conviveu com os Yanomami por mais de 40 anos, atuando como tradutor e organizador da palavra de Davi.',
    research:{ title:'A Queda do Céu: Palavras de um Xamã Yanomami', meta:'Companhia das Letras, 2015 · 768 páginas · Livro-testemunho',
      summary:'Memória, cosmologia e crítica do "povo da mercadoria" transmitidas por Davi Kopenawa e registradas por Bruce Albert ao longo de 30 anos. O livro aborda os espíritos xapiri, a iniciação xamânica, a chegada dos garimpeiros e a iminência da queda do céu — metáfora Yanomami para o colapso ecológico.',
      links:[{icon:'fa-book',label:'Companhia das Letras',url:''},{icon:'fa-graduation-cap',label:'Google Scholar',url:''},{icon:'fa-globe',label:'Hutukara.org',url:''},{icon:'fa-newspaper',label:'Resenha N+1',url:''}]
    }
  },
  alcida_ramos: {
    name:'Alcida Rita Ramos', photo:'AR',
    affiliation:'Universidade de Brasília — Antropologia Social',
    bio:'Antropóloga brasileira pioneira nos estudos Yanomami, professora emérita da UnB. Iniciou pesquisa de campo entre os Sanumá (subgrupo Yanomami) em 1968 e participou ativamente da Comissão pela Criação do Parque Yanomami. É uma das principais teóricas do "indigenismo" brasileiro.',
    research:{ title:'Memórias Sanumá: Espaço e Tempo em uma Sociedade Yanomami', meta:'Marco Zero, 1990 · 372 páginas · Etnografia',
      summary:'Etnografia clássica dos Sanumá baseada em 22 anos de pesquisa de campo. Aborda a organização social, sistema de parentesco e cosmologia do subgrupo Yanomami que habita as cabeceiras do rio Auaris, em Roraima.',
      links:[{icon:'fa-book',label:'Marco Zero',url:''},{icon:'fa-graduation-cap',label:'UnB Repositório',url:''},{icon:'fa-file-pdf',label:'JSTOR',url:''}]
    }
  },
  carlo_zacquini: {
    name:'Carlo Zacquini', photo:'CZ',
    affiliation:'Missionários Consolata · Cofundador da CCPY',
    bio:'Missionário italiano da Consolata, no Brasil desde 1965. Conviveu com os Yanomami por mais de 50 anos. Cofundou em 1978 a Comissão pela Criação do Parque Yanomami (CCPY) com Claudia Andujar e Bruce Albert — articulação que levou à demarcação histórica de 1992.',
    research:{ title:'Yanomami: A Todos os Povos da Terra', meta:'Hutukara/ISA, 2012 · 320 páginas · Crônica histórica',
      summary:'Memória pessoal e crônica histórica da campanha de demarcação dos territórios Yanomami. Reúne documentos, cartas, denúncias e fotografias acumuladas ao longo de quatro décadas de militância indigenista.',
      links:[{icon:'fa-book',label:'ISA Loja',url:''},{icon:'fa-globe',label:'Consolata Brasil',url:''},{icon:'fa-newspaper',label:'Folha de S.Paulo',url:''}]
    }
  },
  claudia_andujar: {
    name:'Claudia Andujar', photo:'CA',
    affiliation:'Fotógrafa · Cofundadora da CCPY',
    bio:'Fotógrafa suíço-brasileira nascida em 1931, sobrevivente do Holocausto. Iniciou trabalho com os Yanomami em 1971 e dedicou décadas a documentá-los — produzindo o registro fotográfico mais completo do povo. Cofundou a CCPY em 1978 e foi central na campanha que levou à demarcação de 1992.',
    research:{ title:'Marcados', meta:'Cosac Naify, 2009 · 200 páginas · Livro de fotografias',
      summary:'Série fotográfica feita durante campanhas de vacinação dos Yanomami: cada Yanomami era fotografado com um número pendurado no pescoço. Andujar inverte a lógica genocida da numeração — usada nos campos de concentração — para preservar identidades, criando um arquivo de salvamento.',
      links:[{icon:'fa-book',label:'Cosac Naify',url:''},{icon:'fa-image',label:'IMS Acervo',url:''},{icon:'fa-globe',label:'Tate Modern',url:''}]
    }
  },
  mpf_relatorio: {
    name:'Ministério Público Federal', photo:'MPF',
    affiliation:'6ª Câmara · Populações Indígenas e Minorias',
    bio:'A 6ª Câmara de Coordenação e Revisão do MPF coordena ações relacionadas a povos indígenas. Produziu o relatório técnico que fundamentou a Operação Yanomami de 2023, primeiro caso julgado como genocídio no Brasil (Massacre de Haximú, 2006) e diversas ações contra o garimpo ilegal.',
    research:{ title:'Relatório Técnico Yanomami: Crise Sanitária e Garimpo Ilegal', meta:'MPF · Ministério da Justiça, 2023 · 196 páginas · Documento oficial',
      summary:'Relatório técnico-jurídico que embasou a declaração de emergência em saúde pública na Terra Indígena Yanomami e a operação federal de retirada de mais de 20.000 garimpeiros. Documenta contaminação por mercúrio, surtos de malária resistente e desnutrição infantil em escala genocida.',
      links:[{icon:'fa-file-pdf',label:'PDF MPF',url:''},{icon:'fa-globe',label:'Ministério da Justiça',url:''},{icon:'fa-newspaper',label:'G1 Cobertura',url:''}]
    }
  }
};

/* MARKERS GLOBAIS */
const placesData = [
  { id:'yanomami', lon:-63.5, lat:2.0, name:'Yanomami', region:'Brasil · AM/RR', population:'≈ 31.000',
    previewImage:'https://images.unsplash.com/photo-1542640244-7e672d6cb466?q=80&w=600&auto=format&fit=crop',
    previewQuote:'Onde a floresta ainda fala mais alto que tudo',
    sourceKey:'davi_kopenawa', complete:true,
    answers:{
      intro:`Os **Yanomami** podem ser apresentados, antes de tudo, como uma sociedade de floresta cuja territorialidade combina parentesco, roças, caça, caminhos, memória dos mortos e relações xamânicas com os *xapiri*. Em vez de descrevê-los como um “grupo isolado”, é mais preciso falar em redes de comunidades com diferentes histórias de contato e forte autonomia política.

A Terra Indígena Yanomami, homologada em 1992, reúne aproximadamente **9,6 milhões de hectares** entre Roraima e Amazonas. O território não é apenas uma área física: é condição de reprodução social, linguística, alimentar e cosmológica.

**Fontes-base:** Davi Kopenawa & Bruce Albert, *A Queda do Céu*; Alcida Rita Ramos, estudos Sanumá/Yanomami; ISA/Hutukara; relatórios públicos do MPF. Toque nos selos verdes do board para abrir as fontes verificadas.`,
      history:`A história recente Yanomami precisa ser lida como uma sucessão de frentes de contato e intrusão: missões, projetos de integração nacional, abertura da Perimetral Norte nos anos 1970, garimpo, epidemias e mobilização política indígena e indigenista.

Na literatura antropológica, esses eventos não aparecem como “acidentes do progresso”, mas como transformações violentas impostas a um sistema social que já tinha suas próprias formas de circulação, aliança, conflito e cuidado da floresta. A campanha pela demarcação da terra contínua, consolidada em 1992, foi resultado de articulações entre lideranças Yanomami, pesquisadores, fotógrafos, missionários e organizações de defesa territorial.

**Fontes-base:** Kopenawa & Albert; Alcida Ramos; Carlo Zacquini/CCPY; Claudia Andujar; documentos do MPF sobre Haximú e garimpo.`,
      territory:`Para os Yanomami, território não é somente “posse” ou “recurso”: é a malha de casas coletivas, roças, rios, trilhas, cemitérios, sítios de caça e lugares espiritualmente habitados. A noção jurídica de Terra Indígena tenta proteger essa continuidade, mas não a esgota.

A **Terra Indígena Yanomami** foi homologada em 25 de maio de 1992 e abrange cerca de **9,6 milhões de hectares**. A pressão do garimpo ilegal reintroduz uma lógica externa de extração que rompe rios, alimentos, deslocamentos e saúde coletiva.

**Fontes-base:** Constituição Federal de 1988; homologação da TI Yanomami; ISA/Hutukara; MPF; Kopenawa & Albert.`,
      culture:`A vida social Yanomami é frequentemente descrita a partir do *shabono*, das relações de parentesco, das festas, dos ciclos de roça, da caça e da mediação xamânica. Mas esses elementos não devem ser tratados como folclore: são instituições vivas de produção de pessoa, memória e território.

Na fala de Davi Kopenawa registrada por Bruce Albert, os *xapiri* não são “crenças” no sentido fraco do termo; são agentes de conhecimento, cura e equilíbrio cosmológico. Essa é uma chave importante para compreender por que a destruição da floresta é também entendida como ameaça ao céu, aos rios e aos corpos.

**Fontes-base:** *A Queda do Céu*; Alcida Ramos; etnografias Sanumá/Yanomami; acervos e registros de Claudia Andujar.`,
      current:`A situação contemporânea dos Yanomami combina reconhecimento jurídico, protagonismo político e vulnerabilidade produzida por invasões. A crise sanitária associada ao garimpo ilegal tornou visíveis a contaminação dos rios, a malária, a desnutrição e a ruptura de sistemas locais de cuidado.

O ponto central, em linguagem antropológica, é que a crise não é apenas “humanitária”: é territorial, ecológica, histórica e política. A resposta pública precisa considerar saúde, retirada de invasores, proteção permanente, fortalecimento de organizações Yanomami e escuta das próprias lideranças.

**Fontes-base:** Hutukara Associação Yanomami; relatórios do MPF e órgãos federais; Kopenawa & Albert; ISA. O board organiza os principais marcos e permite conferir cada fonte.`
    } },
  { id:'inuit', lon:-94, lat:67, name:'Inuit', region:'Ártico · CA/GL/US', population:'≈ 180.000', previewImage:'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?q=80&w=600&auto=format&fit=crop', previewQuote:'No silêncio do gelo escuta-se a respiração do tempo' },
  { id:'navajo', lon:-109, lat:36, name:'Navajo (Diné)', region:'EUA · AZ/NM/UT', population:'≈ 400.000', previewImage:'https://images.unsplash.com/photo-1541336544-bedb7af8d3a4?q=80&w=600&auto=format&fit=crop', previewQuote:'Na quarta criação encontramos o Mundo Brilhante' },
  { id:'cherokee', lon:-83, lat:35, name:'Cherokee', region:'EUA · OK/NC', population:'≈ 380.000', previewImage:'https://images.unsplash.com/photo-1518184781720-e0fc34d23818?q=80&w=600&auto=format&fit=crop', previewQuote:'Mesmo nas cinzas da Trilha, a língua sobrevive' },
  { id:'maya', lon:-89, lat:17, name:'Maya', region:'México · Guatemala', population:'≈ 7 milhões', previewImage:'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=600&auto=format&fit=crop', previewQuote:'Os deuses fizeram os homens de milho' },
  { id:'quechua', lon:-72, lat:-13, name:'Quechua', region:'Andes · PE/BO/EC', population:'≈ 8 milhões', previewImage:'https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?q=80&w=600&auto=format&fit=crop', previewQuote:'Pachamama escuta os passos no caminho do Inca' },
  { id:'mapuche', lon:-71, lat:-38, name:'Mapuche', region:'Chile · Argentina', population:'≈ 1,7 milhão', previewImage:'https://images.unsplash.com/photo-1547283716-3b5b7d3e3a72?q=80&w=600&auto=format&fit=crop', previewQuote:'Somos a gente da terra, e a terra é nossa fala' },
  { id:'sami', lon:23, lat:69, name:'Sámi', region:'Sápmi · NO/SE/FI/RU', population:'≈ 100.000', previewImage:'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?q=80&w=600&auto=format&fit=crop', previewQuote:'A rena conhece o caminho que esquecemos' },
  { id:'maasai', lon:36, lat:-3, name:'Maasai', region:'Quênia · Tanzânia', population:'≈ 1,5 milhão', previewImage:'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=600&auto=format&fit=crop', previewQuote:'O gado é o sangue que alimenta o sangue' },
  { id:'san', lon:22, lat:-22, name:'San (Bushmen)', region:'África Austral', population:'≈ 100.000', previewImage:'https://images.unsplash.com/photo-1535930749574-1399327ce78f?q=80&w=600&auto=format&fit=crop', previewQuote:'Carregamos histórias mais antigas que a humanidade' },
  { id:'amazigh', lon:-7, lat:31, name:'Amazigh (Berbere)', region:'Norte da África', population:'≈ 30 milhões', previewImage:'https://images.unsplash.com/photo-1539020140153-e479b8c5c655?q=80&w=600&auto=format&fit=crop', previewQuote:'Antes de árabes, antes de fenícios, já estávamos aqui' },
  { id:'bayaka', lon:18, lat:2, name:'BaYaka', region:'Bacia do Congo', population:'≈ 500.000', previewImage:'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600&auto=format&fit=crop', previewQuote:'A floresta canta junto, ou não canta' },
  { id:'ainu', lon:142, lat:43, name:'Ainu', region:'Japão · Hokkaido', population:'≈ 25.000', previewImage:'https://images.unsplash.com/photo-1545569310-0bea1ed25690?q=80&w=600&auto=format&fit=crop', previewQuote:'Os deuses se escondem nos olhos do urso' },
  { id:'adivasi', lon:80, lat:22, name:'Adivasi', region:'Índia · cinturão tribal', population:'≈ 104 milhões', previewImage:'https://images.unsplash.com/photo-1590767187868-b2cd1b4f6d2c?q=80&w=600&auto=format&fit=crop', previewQuote:'Jal-jangal-jameen — água, floresta, terra — não se vende' },
  { id:'hmong', lon:104, lat:22, name:'Hmong', region:'Sudeste Asiático', population:'≈ 6 milhões', previewImage:'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop', previewQuote:'Subimos as montanhas para preservar quem somos' },
  { id:'aborigene', lon:134, lat:-25, name:'Aborígenes Australianos', region:'Austrália', population:'≈ 800.000', previewImage:'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=600&auto=format&fit=crop', previewQuote:'O Tempo do Sonho não passou — sustenta o mundo agora' },
  { id:'maori', lon:174, lat:-41, name:'Māori', region:'Aotearoa · Nova Zelândia', population:'≈ 850.000', previewImage:'https://images.unsplash.com/photo-1604357209793-fca5dca89f97?q=80&w=600&auto=format&fit=crop', previewQuote:'Eu sou o rio, e o rio sou eu' },
  { id:'papua', lon:145, lat:-6, name:'Povos da Papua', region:'Nova Guiné', population:'≈ 11 milhões', previewImage:'https://images.unsplash.com/photo-1597212624086-fe9b8b1bd11a?q=80&w=600&auto=format&fit=crop', previewQuote:'Mil línguas, mil mundos numa só ilha' },
  { id:'havaiano', lon:-157, lat:21, name:'Kānaka Maoli', region:'Havaí · EUA', population:'≈ 690.000', previewImage:'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=600&auto=format&fit=crop', previewQuote:'Mauna Kea é a montanha onde nascem os ancestrais' },
  { id:'xingu', lon:-52.5, lat:-11.5, name:'Povos do Xingu', region:'Brasil · MT', population:'≈ 7.000', previewImage:'https://images.unsplash.com/photo-1603504849646-68b31a89c7ff?q=80&w=600&auto=format&fit=crop', previewQuote:'Quatorze povos, um único território de cuidado' },
  { id:'pataxo', lon:-39.0, lat:-16.5, name:'Pataxó', region:'Brasil · BA', population:'≈ 13.000', previewImage:'https://images.unsplash.com/photo-1604739542036-ed45eb7985fc?q=80&w=600&auto=format&fit=crop', previewQuote:'Os primeiros olhos a ver as caravelas ainda estão aqui' }
];

/* BOARD YANOMAMI — agora com sourceKey por card */
const yanomamiBoard = [
  { id:'y1968', year:1968, title:'Primeiros antropólogos', desc:'Bruce Albert e Alcida Ramos iniciam pesquisa sistemática.', tag:'contato',
    image:'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=400&auto=format&fit=crop', sourceKey:'alcida_ramos' },
  { id:'y1973', year:1973, title:'Perimetral Norte', desc:'Estrada militar BR-210 corta o território, abre acesso e doenças.', tag:'colonial',
    image:'https://images.unsplash.com/photo-1518558997970-ba7e1ae44477?q=80&w=400&auto=format&fit=crop', sourceKey:'alcida_ramos' },
  { id:'y1978', year:1978, title:'Fundação da CCPY', desc:'Comissão pela Criação do Parque Yanomami inicia campanha internacional.', tag:'mobilização',
    image:'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=400&auto=format&fit=crop', sourceKey:'carlo_zacquini' },
  { id:'y1987', year:1987, title:'Corrida do garimpo', desc:'40 mil garimpeiros invadem o território — auge da crise sanitária.', tag:'tragédia',
    image:'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=400&auto=format&fit=crop', sourceKey:'claudia_andujar' },
  { id:'y1992', year:1992, title:'Demarcação histórica', desc:'9,6 milhões de hectares homologados durante a ECO-92.', tag:'demarcação',
    image:'https://images.unsplash.com/photo-1542640244-7e672d6cb466?q=80&w=400&auto=format&fit=crop', sourceKey:'carlo_zacquini',
    media:[{type:'video', id:'demarcacao_video_sim', label:'Vídeo simulado · mapas e demarcação'}] },
  { id:'y1993', year:1993, title:'Massacre de Haximú', desc:'16 Yanomami assassinados por garimpeiros — primeiro caso julgado como genocídio.', tag:'tragédia',
    image:'https://images.unsplash.com/photo-1518558997970-ba7e1ae44477?q=80&w=400&auto=format&fit=crop', sourceKey:'mpf_relatorio' },
  { id:'y2004', year:2004, title:'Hutukara Associação', desc:'Davi Kopenawa funda a primeira associação Yanomami.', tag:'institucional',
    image:'https://images.unsplash.com/photo-1604739542036-ed45eb7985fc?q=80&w=400&auto=format&fit=crop', sourceKey:'davi_kopenawa' },
  { id:'y2015', year:2015, title:'A Queda do Céu', desc:'Livro de Davi Kopenawa e Bruce Albert traduzido para 8 idiomas.', tag:'mobilização',
    image:'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop', sourceKey:'davi_kopenawa',
    media:[{type:'audio', id:'voz_yanomami_sim', label:'Áudio simulado · saudação yanomami'}] },
  { id:'y2019', year:2019, title:'Right Livelihood Award', desc:'Davi Kopenawa recebe o "Nobel Alternativo" pela Hutukara.', tag:'mobilização',
    image:'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop', sourceKey:'davi_kopenawa' },
  { id:'y2023', year:2023, title:'Operação federal', desc:'Lula declara emergência. Início da maior operação de retirada de garimpeiros.', tag:'institucional',
    image:'https://images.unsplash.com/photo-1518558997970-ba7e1ae44477?q=80&w=400&auto=format&fit=crop', sourceKey:'mpf_relatorio',
    media:[{type:'doc', label:'Documento técnico'}, {type:'photo', label:'Galeria de campo'}] }
];

/* TIMELINE EVENTS */
const eventsTimeline = {
  1500:'Cabral em Porto Seguro', 1755:'Diretório dos Índios', 1900:'Virada do século — primeiras expedições',
  1910:'Fundação do SPI por Cândido Rondon', 1943:'Expedição Roncador-Xingu', 1961:'Criação do Parque Indígena do Xingu',
  1967:'Extinção do SPI e criação da FUNAI', 1973:'Perimetral Norte e Estatuto do Índio',
  1988:'Constituição reconhece direitos originários', 1992:'Demarcação da Terra Yanomami',
  2007:'Declaração da ONU sobre Povos Indígenas', 2023:'STF rejeita marco temporal',
  2026:'Demarcações e lutas atuais'
};

window.AmerindiaData = {
  researchers,
  placesData,
  yanomamiBoard,
  eventsTimeline
};
})();
