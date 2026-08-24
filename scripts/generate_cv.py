from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Guillaume_de_Cadoudal_CV_AI_Python_Engineer.pdf"

NAVY = HexColor("#07111F")
PANEL = HexColor("#0D1B2C")
INK = HexColor("#F2F6FA")
MUTED = HexColor("#A8B7C7")
ACCENT = HexColor("#72E6D4")
LINE = HexColor("#294057")


styles = {
    "section": ParagraphStyle(
        "section", fontName="Courier-Bold", fontSize=8.0, leading=9.8,
        textColor=ACCENT, spaceAfter=3.6 * mm, uppercase=True,
    ),
    "role": ParagraphStyle(
        "role", fontName="Helvetica-Bold", fontSize=9.8, leading=12,
        textColor=INK, spaceAfter=0.9 * mm,
    ),
    "meta": ParagraphStyle(
        "meta", fontName="Courier", fontSize=6.8, leading=8.6,
        textColor=ACCENT, spaceAfter=1.4 * mm,
    ),
    "body": ParagraphStyle(
        "body", fontName="Helvetica", fontSize=7.8, leading=10.2,
        textColor=MUTED, alignment=TA_LEFT, spaceAfter=1.5 * mm,
    ),
    "bullet": ParagraphStyle(
        "bullet", fontName="Helvetica", fontSize=7.55, leading=9.9,
        textColor=MUTED, leftIndent=3 * mm, firstLineIndent=-2.2 * mm,
        bulletIndent=0, spaceAfter=0.7 * mm,
    ),
    "skill": ParagraphStyle(
        "skill", fontName="Helvetica", fontSize=7.7, leading=10.1,
        textColor=MUTED, spaceAfter=1.5 * mm,
    ),
    "small": ParagraphStyle(
        "small", fontName="Helvetica", fontSize=7.3, leading=9.5,
        textColor=MUTED, spaceAfter=1.2 * mm,
    ),
}


class Column:
    def __init__(self, pdf, x, y, width, bottom=13 * mm):
        self.pdf = pdf
        self.x = x
        self.y = y
        self.width = width
        self.bottom = bottom

    def paragraph(self, html, style="body", gap=0):
        paragraph = Paragraph(html, styles[style])
        _, height = paragraph.wrap(self.width, self.y - self.bottom)
        if self.y - height < self.bottom:
            raise RuntimeError(f"CV content overflow in column at: {html[:80]}")
        self.y -= height
        paragraph.drawOn(self.pdf, self.x, self.y)
        self.y -= gap

    def space(self, size):
        self.y -= size

    def rule(self):
        self.y -= 1.2 * mm
        self.pdf.setStrokeColor(LINE)
        self.pdf.setLineWidth(0.4)
        self.pdf.line(self.x, self.y, self.x + self.width, self.y)
        self.y -= 3.2 * mm


def label(pdf, text, x, y):
    pdf.setFont("Courier-Bold", 7.3)
    pdf.setFillColor(ACCENT)
    pdf.drawString(x, y, text.upper())


def build_cv():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    width, height = A4
    pdf = canvas.Canvas(str(OUTPUT), pagesize=A4)
    pdf.setTitle("Guillaume de Cadoudal - AI & Python Engineer")
    pdf.setAuthor("Guillaume de Cadoudal")
    pdf.setSubject("Curriculum vitae - AI, Python, Data Engineering")

    pdf.setFillColor(NAVY)
    pdf.rect(0, 0, width, height, stroke=0, fill=1)
    pdf.setFillColor(PANEL)
    pdf.rect(0, height - 58 * mm, width, 58 * mm, stroke=0, fill=1)
    pdf.setFillColor(ACCENT)
    pdf.rect(0, height - 58 * mm, 3 * mm, 58 * mm, stroke=0, fill=1)

    left = 14 * mm
    top = height - 15 * mm
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(left, top, "GUILLAUME DE CADOUDAL")
    pdf.setFillColor(ACCENT)
    pdf.setFont("Courier-Bold", 10.5)
    pdf.drawString(left, top - 9 * mm, "AI ENGINEER / PYTHON ENGINEER")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 7.7)
    tagline = "LLM - RAG - AI agents - MCP - FastAPI - Data - Docker - CI/CD"
    pdf.drawString(left, top - 15 * mm, tagline)

    contact_y = top - 26 * mm
    contact = [
        ("EMAIL", "guillaumedecadoudal@gmail.com"),
        ("LINKEDIN", "linkedin.com/in/guillaume2cadoudal"),
        ("GITHUB", "github.com/kaa-serpent"),
        ("MOBILITE", "Haute-Savoie / remote"),
    ]
    x = left
    for heading, value in contact:
        label(pdf, heading, x, contact_y)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica", 7.1)
        pdf.drawString(x, contact_y - 4 * mm, value)
        x += stringWidth(value, "Helvetica", 7.1) + 19 * mm

    body_top = height - 67 * mm
    gap = 10 * mm
    left_width = 58 * mm
    right_x = left + left_width + gap
    right_width = width - right_x - 14 * mm
    left_col = Column(pdf, left, body_top, left_width)
    right_col = Column(pdf, right_x, body_top, right_width)

    left_col.paragraph("PROFIL", "section")
    left_col.paragraph(
        "Ingenieur logiciel specialise en <b>Python, Data et IA generative</b>. "
        "Je conçois des applications, API, pipelines, RAG et agents avec une approche "
        "software engineering : architecture, integration, tests et industrialisation."
    )
    left_col.rule()

    left_col.paragraph("COMPETENCES", "section")
    left_col.paragraph("<b><font color='#F2F6FA'>IA generative</font></b><br/>LLM, RAG, agents IA, Codex, Claude, MCP, skills, Ollama, prompt engineering", "skill")
    left_col.paragraph("<b><font color='#F2F6FA'>Backend & Data</font></b><br/>Python, FastAPI, OpenAPI, Pandas, SQL/PostgreSQL, ETL, Airflow, Dataiku", "skill")
    left_col.paragraph("<b><font color='#F2F6FA'>DevOps & qualite</font></b><br/>Docker, Linux, Git, GitHub Actions, GitLab CI, CI/CD, Pytest, Agile/Jira", "skill")
    left_col.paragraph("<b><font color='#F2F6FA'>Interfaces & maker</font></b><br/>React, PyQt/PySide, vision par ordinateur, IoT, CircuitPython, impression 3D, CNC", "skill")
    left_col.rule()

    left_col.paragraph("FORMATION", "section")
    left_col.paragraph("<b><font color='#F2F6FA'>H3 Hitema</font></b><br/>Responsable Projet Informatique (IoT), Master 2<br/><font color='#72E6D4'>2020 - 2023</font>", "small")
    left_col.paragraph("<b><font color='#F2F6FA'>L'ESTIAM</font></b><br/>Informatique, RNCP niveau 5<br/><font color='#72E6D4'>2018 - 2020</font>", "small")
    left_col.rule()

    left_col.paragraph("LANGUES & INTERETS", "section")
    left_col.paragraph("<b><font color='#F2F6FA'>Français</font></b> natif<br/><b><font color='#F2F6FA'>Anglais</font></b> professionnel", "small")
    left_col.paragraph("Canyoning, speleologie, conception et impression 3D, IoT, electronique, CNC", "small")
    left_col.paragraph("<b><font color='#F2F6FA'>Engagement scout</font></b><br/>Encadrement, securite, pedagogie et coordination de groupes de 2017 a 2021.", "small")
    left_col.rule()
    left_col.paragraph("METHODE", "section")
    left_col.paragraph("- Partir du probleme et des sources verifiables", "bullet")
    left_col.paragraph("- Separer architecture, implementation, tests et revue", "bullet")
    left_col.paragraph("- Documenter les limites, les risques et les decisions", "bullet")

    right_col.paragraph("EXPERIENCES", "section")
    experiences = [
        ("2026 - aujourd'hui", "Data Engineer / Consultant - ANSC via SCALIAN", [
            "Support et analyse applicative sur le programme NexSIS dans un environnement metier critique.",
            "Exploration d'un RAG local reliant donnees, base, historique et code ETL pour l'investigation support.",
        ]),
        ("2025 - 2026", "Ingenieur logiciel freelance", [
            "Solutions Python d'automatisation, traitement et structuration de donnees ; scripts, API et workflows.",
            "Interfaces web, IoT, vision par ordinateur et agents IA integres aux processus de developpement.",
        ]),
        ("2024 - 2025", "Consultant Data Engineer / Analyst - ALTEN", [
            "Automatisations a grande echelle, traitements robustes, analyses et interfaces decisionnelles.",
            "Coordination Agile entre equipes techniques et operationnelles.",
        ]),
        ("2024", "Consultant en gestion de donnees - Orange", [
            "Fiabilisation, collecte automatisee, consolidation et documentation des flux et modeles.",
        ]),
        ("2020 - 2023", "Developpeur / Data Engineer - Ministere de l'Economie et des Finances", [
            "Applications internes, pipelines d'integration et evolution d'outils critiques.",
            "Nettoyage, controle de coherence, tests unitaires, CI/CD et documentation de projets confidentiels et Open Data.",
        ]),
    ]
    for period, role, bullets in experiences:
        right_col.paragraph(period.upper(), "meta")
        right_col.paragraph(role, "role")
        for item in bullets:
            right_col.paragraph(f"- {item}", "bullet")
        right_col.space(1.8 * mm)

    right_col.rule()
    right_col.paragraph("PROJETS SELECTIONNES", "section")
    projects = [
        ("TOKTRIM", "Serveur MCP Windows qui filtre les sorties terminal et renvoie un JSON compact. Benchmarks du depot : 45 % a 98 % de tokens economises selon la commande.", "Python - MCP - Claude - CLI"),
        ("SUPPORT RAG (CONFIDENTIEL)", "Assistant local reliant donnees, base, historique et code ETL pour soutenir des investigations verifiables dans les sources.", "Python - RAG - SQL - ETL"),
        ("AI DELIVERY SYSTEM (CONFIDENTIEL)", "Workflow Codex/Claude separant architecture, implementation, tests et revue, avec outils MCP, skills et validation humaine.", "Codex - Claude - MCP - CI/CD"),
        ("KNOWLEDGELOCK", "Pipeline local de collecte, normalisation Markdown, indexation PageIndex et interrogation d'un corpus specialise avec Ollama.", "Python - RAG - PageIndex - Ollama"),
        ("OLLAMA MCP GUI", "Application desktop de chat et d'analyse de fichiers avec modeles locaux ; service FastAPI isole dans Docker.", "Python - PyQt - FastAPI - Docker"),
        ("ROTARYCAM", "Moteur CAM volumetrique 4 axes : trajectoires X/Y/Z/A, simulation du volume balaye, validation des collisions et export bloque tant que le profil machine est incomplet.", "Python - PySide6 - Geometry - CNC"),
    ]
    for title, description, tech in projects:
        right_col.paragraph(title, "meta")
        right_col.paragraph(description, "body")
        right_col.paragraph(f"<font color='#72E6D4'>{tech}</font>", "small")
        right_col.space(0.5 * mm)

    pdf.setStrokeColor(LINE)
    pdf.line(left, 9 * mm, width - left, 9 * mm)
    pdf.setFillColor(MUTED)
    pdf.setFont("Courier", 5.8)
    pdf.drawString(left, 5.3 * mm, "PORTFOLIO : kaa-serpent.github.io/portfolio/")
    pdf.drawRightString(width - left, 5.3 * mm, "CV public - sans numero de telephone")
    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    build_cv()
    print(OUTPUT)
