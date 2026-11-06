"""Generate the short, shareable Portuguese presentation of Ameríndia."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/amerindia-resumo-da-plataforma.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
FONT_DIR = Path('C:/Windows/Fonts')
pdfmetrics.registerFont(TTFont('Segoe', str(FONT_DIR / 'segoeui.ttf')))
pdfmetrics.registerFont(TTFont('SegoeBold', str(FONT_DIR / 'segoeuib.ttf')))
pdfmetrics.registerFontFamily('Segoe', normal='Segoe', bold='SegoeBold')
INK = colors.HexColor('#202126')
MUTED = colors.HexColor('#5D626B')
ORANGE = colors.HexColor('#D94E08')
styles = {
    'title': ParagraphStyle('title', fontName='SegoeBold', fontSize=25, leading=29, textColor=INK, spaceAfter=10),
    'intro': ParagraphStyle('intro', fontName='Segoe', fontSize=11, leading=16, textColor=MUTED, spaceAfter=15),
    'section': ParagraphStyle('section', fontName='SegoeBold', fontSize=10, leading=14, textColor=ORANGE, spaceBefore=8, spaceAfter=9),
    'bullet': ParagraphStyle('bullet', fontName='Segoe', fontSize=10.3, leading=14.5, textColor=INK, leftIndent=12, firstLineIndent=0, bulletIndent=0, spaceAfter=8),
    'note': ParagraphStyle('note', fontName='Segoe', fontSize=9, leading=13, textColor=MUTED, spaceAfter=5),
}
sections = [
    ('PROPÓSITO E EXPERIÊNCIA', [
        '<b>Conhecimento e memória.</b> Reunir histórias, pesquisas e fontes sobre os povos indígenas, conectando território, memória e diferentes perspectivas de autoria.',
        '<b>Mapa interativo.</b> Explorar o Brasil por pins dos povos e limites das terras cadastradas. A seleção abre informações e referências relacionadas; os pins não representam aldeias.',
        '<b>Mapa mental de pesquisas.</b> Navegar por cards conectados e arrastáveis, abrir fichas, conhecer a autoria e acessar materiais para download quando houver autorização.',
        '<b>Vozes e temas.</b> Consultar produções indígenas, não indígenas, em coautoria e institucionais. Filtrar por período, região, povo e tema, incluindo mulheres indígenas e ditadura.',
        '<b>Proximidade e tempo.</b> Com permissão, encontrar a terra cadastrada mais próxima. A linha do tempo permite consultar os recortes cartográficos documentados no acervo.',
        '<b>Navegação acessível.</b> Página de abertura, busca textual, menu animado, temas claro e escuro e adaptação para celular, com identidade visual minimalista em preto, cinza e laranja.',
    ]),
    ('PARTICIPAÇÃO E CUIDADO EDITORIAL', [
        '<b>Construção colaborativa.</b> Estrutura para enviar pesquisas, entrar em contato e solicitar correções. As contribuições passam por análise editorial antes de eventual publicação.',
        '<b>Autoria e direitos.</b> Termo em PDF e orientações para assinatura pelo gov.br, com declaração de autoria, fontes, créditos e autorizações de uso de imagens e outros materiais.',
        '<b>Privacidade e proteção.</b> Localização calculada no dispositivo, anexos recebidos em área privada e medidas de segurança. A base técnica utiliza PHP e SQLite, com código modular.',
    ]),
]

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#E3E4E7'))
    canvas.line(44, 42, A4[0]-44, 42)
    canvas.setFont('Segoe', 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(44, 28, 'AMERÍNDIA  |  Apresentação do projeto  |  06/11/2026')
    canvas.drawRightString(A4[0]-44, 28, str(doc.page))
    canvas.restoreState()

story = []
logo = Image(str(ROOT / 'public/assets/brand/amerindia-logo.png'), width=162, height=54)
logo.hAlign = 'LEFT'
story += [logo, Spacer(1, 8), Paragraph('A plataforma em resumo', styles['title']),
          Paragraph('Um acervo digital em construção para conhecer territórios indígenas, compartilhar pesquisas e ampliar a escuta de diferentes vozes.', styles['intro'])]
for heading, bullets in sections:
    story.append(Paragraph(heading, styles['section']))
    for text in bullets:
        story.append(Paragraph(text, styles['bullet'], bulletText='•'))
story.append(KeepTogether([
    Paragraph('O QUE AINDA ESTÁ EM CONSTRUÇÃO', styles['section']),
    Paragraph('Ampliação do acervo e das camadas históricas, além de futura busca com IA. O cadastro inicial reúne quatro terras e quatro referências. A abertura dos envios públicos depende da configuração do responsável, contato e revisão dos documentos.', styles['note']),
]))
doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=44, leftMargin=44,
                        topMargin=25, bottomMargin=56, title='Ameríndia - Resumo da plataforma', author='Ameríndia')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
