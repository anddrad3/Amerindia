"""Generate the editable submission declaration and signing guide (four pages)."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/documents/termo-submissao.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
W,H=A4
INK=HexColor('#263a2f'); MUTED=HexColor('#5c665d'); LINE=HexColor('#d6ded0'); ACCENT=HexColor('#b45734')
c=canvas.Canvas(str(OUT),pagesize=A4)
c.setTitle('Ameríndia - Declaração de autoria e autorização para análise editorial')
c.setAuthor('Projeto Ameríndia')
body=ParagraphStyle('body',fontName='Helvetica',fontSize=10,leading=15,textColor=INK)
small=ParagraphStyle('small',parent=body,fontSize=8,leading=12,textColor=MUTED)
fields=[]

def para(text,y,style=body,x=48,width=W-96):
    p=Paragraph(text,style);_,h=p.wrap(width,H);p.drawOn(c,x,y-h);return y-h-12

def header(number,title,subtitle):
    c.setFillColor(INK);c.rect(0,H-10,W,10,fill=1,stroke=0)
    c.setFont('Helvetica-Bold',13);c.drawString(48,H-48,'ameríndia.')
    c.setFillColor(MUTED);c.setFont('Helvetica',8);c.drawRightString(W-48,H-46,'SUBMISSÃO EDITORIAL / VERSÃO 18.10.2026')
    c.setStrokeColor(LINE);c.line(48,H-65,W-48,H-65)
    c.setFillColor(INK);c.setFont('Helvetica-Bold',22);c.drawString(48,H-103,title)
    para(subtitle,H-117,small)
    c.setFont('Helvetica',8);c.setFillColor(MUTED);c.drawString(48,31,'Modelo para revisão jurídica e adequação antes do lançamento público.')
    c.drawRightString(W-48,31,f'{number} / 4')
    return H-157

def field(name,label,y,height=28,x=48,width=W-96,multiline=False):
    c.setFont('Helvetica',8);c.setFillColor(MUTED);c.drawString(x,y,label)
    c.acroForm.textfield(name=name,tooltip=label,x=x,y=y-height-8,width=width,height=height,
        borderWidth=.7,borderColor=LINE,fillColor=white,textColor=INK,fontName='Helvetica',fontSize=10,
        fieldFlags='multiline' if multiline else '',maxlen=2500 if multiline else 240,forceBorder=True)
    fields.append(name);return y-height-25

def clause(number,title,text,y):
    return para(f'<b>{number}. {title}</b><br/>{text}',y)

y=header(1,'Declaração de autoria','Identificação da pessoa proponente e do material. Preencha os campos antes de assinar o PDF completo.')
y=field('proponente','Nome completo da pessoa proponente',y)
y=field('email','E-mail para contato editorial',y)
y=field('obra','Título completo da obra / pesquisa e versão ou data do arquivo',y,40,multiline=True)
y=field('coautores','Demais autores e vínculo de representação, se houver',y,40,multiline=True)
y=field('responsavel','Responsável pelo projeto destinatário (preenchimento pela equipe antes do uso público)',y)
y=clause('1','Autoria e integridade','Declaro que identifiquei os autores e que o material apresentado é de minha autoria ou foi obtido e utilizado com autorização, licença ou hipótese legal aplicável. As citações e referências estão indicadas. Não apresento como próprio trabalho de terceiros nem omito coautoria. As informações são apresentadas de boa-fé, com suas fontes e limites de verificação.',y)
y=clause('2','Textos, fotografias e outros materiais','Relaciono no inventário da página 3 os materiais de terceiros, seus titulares, fontes, créditos e permissões. Reconheço que mencionar um crédito não substitui a autorização quando ela for necessária. Conservo os comprovantes e os disponibilizarei à equipe, quando solicitados.',y)
assert y>48, y
c.showPage()
y=header(2,'Condições da contribuição','Leia todas as condições. Esta declaração não equivale a uma aprovação editorial nem dispensa análise jurídica.')
clauses=[
('3','Imagem, privacidade e conhecimentos coletivos','Declaro que considerei os direitos de imagem, privacidade e proteção de dados das pessoas retratadas ou citadas. Não encaminho locais sensíveis, conhecimentos restritos ou registros culturais coletivos para divulgação sem as autorizações cabíveis. Minha assinatura individual não substitui direitos de outras pessoas ou comunidades.'),
('4','Permissão limitada de análise e publicação','Autorizo o recebimento, armazenamento e análise pela equipe do projeto. Se a pesquisa for aprovada e os direitos conferidos, autorizo, de modo gratuito e não exclusivo, sua disponibilização no site Ameríndia, com identificação da autoria, enquanto a publicação permanecer no acervo. A autorização abrange apenas os direitos que detenho e os limites das licenças de terceiros. Não cedo a titularidade da obra nem renuncio a direitos morais. Alterações de conteúdo dependem de concordância; ajustes de formato e acessibilidade podem ser realizados sem desvirtuar a obra.'),
('5','Usos não incluídos','Este termo não autoriza venda da obra, sublicenciamento, treinamento de inteligência artificial, supressão de créditos ou exploração fora do site. Esses usos exigem autorização específica. Posso pedir revisão ou retirada pelo canal editorial, observadas obrigações legais, direitos de terceiros e a conservação restrita de registros necessária à defesa de direitos.'),
('6','Responsabilidade e apuração','Reconheço minha responsabilidade pelas declarações e pelos direitos que afirmo possuir. Eventuais violações poderão gerar consequências civis e, quando preenchidos os requisitos legais, penais, apuradas pelos meios competentes, com contraditório e defesa. Este termo não cria pena automática, não presume culpa e não afasta deveres legais ou responsabilidade própria do projeto e de sua equipe.'),
('7','Revisão, correção e não publicação','A equipe poderá pedir comprovantes, esclarecimentos e correções, recusar a submissão ou suspender uma publicação para apuração. O envio não garante publicação, remuneração ou prazo de resposta. Comunicarei erros ou dúvidas relevantes de que tomar conhecimento.'),
('8','Dados e assinatura','Os dados de contato e documentos serão usados para análise, retorno, prova da autorização e exercício de direitos, nos termos da política de privacidade. O termo assinado não é destinado à exibição pública. A classificação de autoria que revele origem étnica é facultativa e depende de consentimento específico no formulário. Concordo com a verificação da autoria e integridade da assinatura eletrônica pelo serviço oficial do ITI.')]
for number,title,text in clauses:y=clause(number,title,text,y)
assert y>48, y
c.showPage()
y=header(3,'Inventário & assinatura','Identifique os materiais incorporados. Se precisar de mais espaço, junte um inventário adicional antes de assinar o documento completo.')
y=field('inventario','Item / página; titular; fonte; licença ou autorização; crédito exigido; autorização de imagem',y,195,multiline=True)
y=field('comprovantes','Localização dos comprovantes e observações (não inclua senhas ou dados desnecessários)',y,70,multiline=True)
y=field('local_data','Local e data',y)
y=field('assinantes','Nome de quem assinará e qualidade: autor(a), coautor(a) ou representante autorizado(a)',y,42,multiline=True)
y=para('<b>Assinatura eletrônica</b><br/>Use o assinador oficial do gov.br após concluir o preenchimento. Cada coautor deve autorizar a publicação: colha as assinaturas cabíveis neste arquivo ou anexe autorização específica de representação. Um nome digitado neste campo não é assinatura gov.br.',y)
c.setStrokeColor(LINE);c.roundRect(48,75,W-96,60,8,stroke=1,fill=0)
c.setFillColor(MUTED);c.setFont('Helvetica',9);c.drawString(64,110,'Área sugerida para o selo visual da assinatura eletrônica.')
c.setFont('Helvetica',8);c.drawString(64,94,'O que comprova a assinatura é a validação criptográfica do arquivo.')
assert y>140,y
c.showPage()
y=header(4,'Como preparar e enviar','Guia de assinatura e referências legais. Esta página faz parte do documento; mantenha-a no arquivo assinado.')
for number,title,text in [
('01','Preencha e confira','Baixe o PDF, preencha os campos em um leitor compatível e salve. Confira nomes, obra, destinatário e inventário. Para pesquisas com coautoria, obtenha a autorização de todos os titulares pertinentes.'),
('02','Assine no serviço oficial','Acesse https://assinador.iti.br com conta gov.br prata ou ouro. Envie o PDF preenchido, escolha a posição da assinatura e conclua a confirmação no ambiente oficial. Nunca compartilhe sua senha com o projeto.'),
('03','Valide sem alterar','Baixe o arquivo assinado. Acesse https://validar.iti.gov.br para verificar autoria e integridade. Não imprima para PDF, edite, comprima ou una arquivos depois de assinar: isso pode invalidar a assinatura. Assinaturas adicionais devem preservar as existentes.'),
('04','Envie os dois arquivos','No formulário de contribuição, anexe a pesquisa e o termo original assinado (até 5 MB cada). Guarde o protocolo. Os documentos entram em fila privada; a equipe precisa conferir a identidade do signatário, os direitos e a segurança dos arquivos antes de publicar.')]:
    y=clause(number,title,text,y)
y=para('<b>Base normativa e fontes oficiais</b>',y)
sources=[
('Lei 9.610/1998: autoria, direitos morais e patrimoniais, uso de obras e fotografias (arts. 7º, 24, 27, 29, 46, 49, 79 e 102).','https://www.planalto.gov.br/ccivil_03/leis/l9610.htm'),
('Código Civil: direitos da personalidade e responsabilidade civil (arts. 20, 186, 187 e 927).','https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm'),
('Código Penal: violação de direitos autorais (art. 184, conforme os requisitos de cada hipótese).','https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm'),
('LGPD (Lei 13.709/2018): finalidade, necessidade, dados sensíveis, direitos do titular e segurança.','https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm'),
('MP 2.200-2/2001, art. 10, § 2º: outros meios de comprovar autoria e integridade aceitos pelas partes.','https://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm'),
('Governo Digital: instruções do serviço de assinatura eletrônica gov.br.','https://www.gov.br/governodigital/pt-br/identidade/assinatura-eletronica/assinatura-eletronica/')]
for label,url in sources:y=para(f'• {label} <link href="{url}" color="#426a4b"><u>Fonte oficial</u></link>',y,small)
y=para('Modelo editorial inicial. A equipe deve identificar o destinatário, adequar os termos à operação real e obter revisão jurídica antes de abrir submissões públicas. Nenhuma cláusula promete imunidade ou transfere obrigações legais indisponíveis.',y,small)
assert y>48,y
c.save()
reader=PdfReader(str(OUT));actual=reader.get_fields()
assert len(reader.pages)==4
assert set(fields)==set(actual)
assert all('/AP' in widget.get_object() for page in reader.pages for widget in page.get('/Annots',[]) if widget.get_object().get('/Subtype')=='/Widget')
print(f'{OUT}: {len(reader.pages)} pages, {len(actual)} editable fields')
