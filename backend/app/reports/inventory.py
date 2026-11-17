"""Generování dokumentu „Inventarizace“ (seznam používaných chemikálií oddělení) do PDF a DOCX."""

import datetime
import decimal
import io
from dataclasses import dataclass
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Department, DepartmentSubstance, Substance

BASE_DIR = Path(__file__).parent
ASSETS_DIR = BASE_DIR / "assets"
TEMPLATES_DIR = BASE_DIR / "templates"

PIPED_GAS_FORM = "plynná"
PIPED_GAS_TEXT = "Rozvod v trubkách"
NO_PROPERTIES_TEXT = "Nemá"
FOOTER_NOTE = (
    "V případě nákupu a používání nových chemických látek a směsí, které nejsou uvedeny "
    "v seznamu pro vaše pracoviště, mě prosím o tomto ihned informujte a zašlete bezpečnostní list."
)


@dataclass(frozen=True)
class LegendColumn:
    title: str
    color: str
    classes: list[str]
    restrictions: list[str]
    note: list[str]


LEGEND: list[LegendColumn] = [
    LegendColumn(
        "VYSOCE TOXICKÉ",
        "#F4801F",
        ["Acute Tox.1", "Acute Tox.2"],
        ["Nesmí s nimi těhotné", "Kategorie práce 2"],
        ["NUTNÉ ŠKOLENÍ !"],
    ),
    LegendColumn(
        "TOXICKÉ",
        "#FFF200",
        ["Carc., Muta., Repr.", "1A či 1B"],
        ["Nesmí s nimi těhotné ani mladiství"],
        ["Kategorie práce 2"],
    ),
    LegendColumn(
        "TOXICKÉ",
        "#FFF200",
        ["Acute Tox. 3", "STOT SE 1", "STOT RE 1"],
        ["Nesmí s nimi těhotné"],
        ["U STOT SE 1", "je kategorie práce 2"],
    ),
    LegendColumn(
        "ŽÍRAVÉ",
        "#C0C0C0",
        ["Skin Corr. 1A", "Skin Corr. 1B", "Skin Corr. 1C"],
        [],
        [],
    ),
    LegendColumn(
        "OSTATNÍ",
        "#EFEFEF",
        ["Resp. Sens. 1, Skin. Sens. 1", "Carc. 2,  Muta. 2,  Repr. 2", "STOT SE  2"],
        ["Nesmí s nimi těhotné a kromě STOT SE 2 ani mladiství"],
        ["U Resp. Sens. a Skin. Sens. je kategorie práce 2"],
    ),
]


@dataclass(frozen=True)
class InventoryRow:
    name: str
    amount: str
    properties: str


@dataclass(frozen=True)
class InventoryReport:
    year: int
    department_label: str
    responsible_employee: str
    date: datetime.date
    performed_by: str
    contact: str
    rows: list[InventoryRow]

    @property
    def date_label(self) -> str:
        return f"{self.date.day}. {self.date.month}. {self.date.year}"


def format_amount(amount: decimal.Decimal, unit: str | None, physical_form: str | None) -> str:
    if amount == 0 and physical_form == PIPED_GAS_FORM:
        return PIPED_GAS_TEXT
    number = f"{amount.normalize():f}".replace(".", ",")
    return f"{number} {unit}" if unit else number


def format_properties(substance: Substance) -> str:
    parts = []
    for prop in sorted(substance.properties, key=lambda p: p.id):
        text = f"{prop.name}{prop.category_name or ''}"
        if prop.exposure_route_name:
            text += f" ({prop.exposure_route_name})"
        parts.append(text)
    return ", ".join(parts) if parts else NO_PROPERTIES_TEXT


def department_label(department: Department) -> str:
    name = department.name.upper()
    return f"{department.code}. {name}" if department.code is not None else name


def build_report(
    db: Session,
    department: Department,
    year: int,
    responsible_employee: str,
    date: datetime.date,
    performed_by: str,
    contact: str,
) -> InventoryReport:
    records = db.scalars(
        select(DepartmentSubstance)
        .where(DepartmentSubstance.department_id == department.id, DepartmentSubstance.year == year)
        .options(selectinload(DepartmentSubstance.substance).selectinload(Substance.properties))
    ).all()

    rows = [
        InventoryRow(
            name=r.substance.name.strip(),
            amount=format_amount(r.amount, r.substance.unit_name, r.substance.physical_form_name),
            properties=format_properties(r.substance),
        )
        for r in records
    ]
    rows.sort(key=lambda row: row.name.casefold())

    return InventoryReport(
        year=year,
        department_label=department_label(department),
        responsible_employee=responsible_employee,
        date=date,
        performed_by=performed_by,
        contact=contact,
        rows=rows,
    )


# ---------------------------------------------------------------- PDF

_jinja = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html"]),
)


def render_pdf(report: InventoryReport) -> bytes:
    from weasyprint import HTML  # import až zde: vyžaduje systémové knihovny (pango)

    html = _jinja.get_template("inventory.html").render(
        report=report, legend=LEGEND, footer_note=FOOTER_NOTE
    )
    return HTML(string=html, base_url=str(ASSETS_DIR)).write_pdf()


# ---------------------------------------------------------------- DOCX

FONT_NAME = "Times New Roman"


def _shade(cell, hex_color: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color.lstrip("#"))
    tc_pr.append(shd)


def _repeat_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    tr_pr.append(el)


CONTENT_WIDTH_CM = 17.4


def _set_widths(table, widths_cm: tuple[float, ...]) -> None:
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:type"), "dxa")
    tbl_w.set(qn("w:w"), str(int(sum(widths_cm) * 567)))
    layout = OxmlElement("w:tblLayout")
    layout.set(qn("w:type"), "fixed")
    tbl_pr.append(layout)
    for col, width in zip(table.columns, widths_cm, strict=True):
        col.width = Cm(width)
    for row in table.rows:
        for cell, width in zip(row.cells, widths_cm, strict=True):
            cell.width = Cm(width)


def _set_borders(table) -> None:
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "8")
        el.set(qn("w:color"), "000000")
        borders.append(el)
    tbl_pr.append(borders)


def _par(
    container,
    text: str = "",
    *,
    size: float = 12,
    bold: bool = False,
    underline: bool = False,
    align=None,
    space_after: float = 0,
):
    p = container.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    if align is not None:
        p.alignment = align
    if text:
        run = p.add_run(text)
        run.font.size = Pt(size)
        run.bold = bold
        run.underline = underline
    return p


def _cell_text(
    cell,
    lines: list[str],
    *,
    size: float = 10,
    bold: bool = False,
    underline: bool = False,
    align=WD_ALIGN_PARAGRAPH.CENTER,
) -> None:
    first = cell.paragraphs[0]
    for i, line in enumerate(lines):
        p = first if i == 0 else cell.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(line)
        run.font.size = Pt(size)
        run.bold = bold
        run.underline = underline


def render_docx(report: InventoryReport) -> bytes:
    doc = Document()
    section = doc.sections[0]
    section.page_width, section.page_height = Cm(21), Cm(29.7)
    section.left_margin = section.right_margin = Cm(1.8)
    section.top_margin = section.bottom_margin = Cm(1.5)

    normal = doc.styles["Normal"]
    normal.font.name = FONT_NAME
    normal.element.rPr.rFonts.set(qn("w:eastAsia"), FONT_NAME)
    normal.font.size = Pt(12)

    # Hlavička s logy
    hp = _par(doc, space_after=6)
    hp.paragraph_format.tab_stops.add_tab_stop(Cm(CONTENT_WIDTH_CM), WD_TAB_ALIGNMENT.RIGHT)
    hp.add_run().add_picture(str(ASSETS_DIR / "logo_company.png"), height=Cm(2.2))
    hp.add_run("\t")
    hp.add_run().add_picture(str(ASSETS_DIR / "logo_sak.png"), height=Cm(2.2))
    hp.add_run("   ")
    hp.add_run().add_picture(str(ASSETS_DIR / "logo_iso.png"), height=Cm(2.2))

    _par(doc, f"Inventarizace {report.year}", space_after=6)
    _par(doc, "Aktuální seznam používaných", size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    _par(
        doc,
        "chemikálií, roztoků, plynů a dezinfekčních prostředků",
        size=14,
        bold=True,
        align=WD_ALIGN_PARAGRAPH.CENTER,
        space_after=12,
    )

    p = _par(doc)
    p.add_run("Pracoviště: ")
    r = p.add_run(report.department_label)
    r.bold = True
    r.font.size = Pt(14)
    _par(doc, f"Zodpovědný pracovník: {report.responsible_employee}", space_after=10)

    # Legenda
    legend = doc.add_table(rows=1, cols=len(LEGEND))
    legend.alignment = WD_TABLE_ALIGNMENT.CENTER
    _set_borders(legend)
    for cell, col in zip(legend.rows[0].cells, LEGEND, strict=True):
        _shade(cell, col.color)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
        _cell_text(cell, [col.title], size=11, bold=True, underline=True)
        for block in (col.classes, col.restrictions, col.note):
            if block:
                cell.add_paragraph().paragraph_format.space_after = Pt(0)
                for line in block:
                    p = cell.add_paragraph()
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p.paragraph_format.space_after = Pt(0)
                    run = p.add_run(line)
                    run.bold = True
                    run.font.size = Pt(9)
                    if line.startswith("NUTNÉ"):
                        run.font.size = Pt(11)
    _set_widths(legend, (3.9, 3.7, 3.7, 2.4, 3.7))
    _par(doc, space_after=6)

    # Tabulka látek
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    _set_borders(table)
    head = table.rows[0]
    _repeat_header(head)
    _cell_text(head.cells[0], ["Název"], size=11, bold=True, align=WD_ALIGN_PARAGRAPH.LEFT)
    _cell_text(head.cells[1], ["Množství", "Kg/L/Ks"], size=11, bold=True)
    _cell_text(head.cells[2], ["Nebezpečné vlastnosti"], size=11, bold=True)
    for row in report.rows:
        cells = table.add_row().cells
        _cell_text(cells[0], [row.name], size=11, align=WD_ALIGN_PARAGRAPH.LEFT)
        _cell_text(cells[1], [row.amount], size=11)
        _cell_text(cells[2], [row.properties], size=11)
    _set_widths(table, (6.2, 3.2, 8.0))

    _par(doc, space_after=6)
    _par(doc, f"Datum: {report.date_label}")
    _par(doc, f"Inventarizaci provedl: {report.performed_by}", space_after=10)
    _par(doc, FOOTER_NOTE, size=11, space_after=10)
    for line in report.contact.splitlines():
        p = _par(doc, line, size=11)
        if "@" in line:
            p.runs[0].font.color.rgb = RGBColor(0x21, 0x40, 0x9A)

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()
