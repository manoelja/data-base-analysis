"""
ml/export_docs.py
=================
Gera em `public/docs/` as documentações do projeto em **PDF** e **PNG**.

Fontes usadas (Windows): Segoe UI / Arial (corpo) e Consolas (código).
Saída para cada doc:
  public/docs/<nome>.pdf  → documento paginado (A4, 150 DPI)
  public/docs/<nome>.png  → documento inteiro em uma única imagem (páginas empilhadas)

Executar:  python ml/export_docs.py
Regenera os arquivos (não editar manualmente).

Regras de renderização (evitam os problemas de layout):
- Cada bloco (título, parágrafo, lista, citação, código) tem a ALTURA total
  calculada ANTES de desenhar — se não couber, quebra de página. Assim nada
  ultrapassa o limite inferior e não há sobreposição com o rodapé.
- Palavras mais largas que a linha são quebradas (nada passa da margem direita).
- Blocos de código ficam DENTRO das margens (sem estourar lateralmente).
- Ao final, uma verificação confirma que as faixas de margem/rodapé estão limpas.
"""

from __future__ import annotations

import os
import re
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFont

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "docs")

# ---------------------------------------------------------------- fontes
FONT_DIR = "C:/Windows/Fonts"


def _pick(*names: str) -> str:
    for n in names:
        p = os.path.join(FONT_DIR, n)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"Nenhuma fonte encontrada em {names}")


FONT_BODY = _pick("segoeui.ttf", "arial.ttf")
FONT_BOLD = _pick("segoeuib.ttf", "arialbd.ttf", "arial.ttf")
FONT_CODE = _pick("consola.ttf", "cour.ttf", "arial.ttf")

# ---------------------------------------------------------------- cores
BG = (255, 255, 255)
INK = (26, 26, 46)          # texto principal (azul-escuro)
ACCENT = (233, 30, 138)     # rosa da marca
GRAY = (107, 91, 123)       # texto secundário
CODE_BG = (245, 244, 250)
RULE = (226, 217, 235)
CODE_INK = (60, 58, 80)

# ---------------------------------------------------------------- página
DPI = 150.0
PAGE_W = int(8.27 * DPI)   # A4 largura  (1240)
PAGE_H = int(11.69 * DPI)  # A4 altura   (1754)
MARGIN = int(0.55 * DPI)   # margem lateral (~82px)
TOP = int(0.6 * DPI)
BOTTOM = PAGE_H - int(0.6 * DPI)
MAX_W = PAGE_W - 2 * MARGIN

FS_H1 = int(0.58 * DPI)
FS_H2 = int(0.44 * DPI)
FS_H3 = int(0.34 * DPI)
FS_H4 = int(0.28 * DPI)
FS_BODY = int(0.23 * DPI)
FS_CODE = int(0.21 * DPI)
FS_META = int(0.2 * DPI)
LINE = 1.5


def font(size: int, bold: bool = False, code: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_CODE if code else (FONT_BOLD if bold else FONT_BODY), size)


# ---------------------------------------------------------------- markdown leve
def inline(s: str) -> str:
    s = re.sub(r"`([^`]*)`", r"\1", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)
    s = re.sub(r"\*([^*]+)\*", r"\1", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)
    s = s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    return s


def parse_md(text: str) -> list[dict]:
    lines = text.split("\n")
    blocks: list[dict] = []
    i, n = 0, len(lines)

    # YAML front matter (--- ... ---)
    if lines and lines[0].strip() == "---":
        i = 1
        while i < n and lines[i].strip() != "---":
            i += 1
        i += 1

    in_code = False
    code_buf: list[str] = []
    table_buf: list[str] = []

    def flush_code():
        nonlocal code_buf
        if code_buf:
            blocks.append({"type": "code", "text": "\n".join(code_buf)})
            code_buf = []

    def flush_table():
        nonlocal table_buf
        if table_buf:
            rows = [
                r for r in table_buf
                if "|" in r and not re.match(r"^\s*\|?[\s:|-]+\|?\s*$", r)
            ]
            if rows:
                blocks.append({"type": "code", "text": "\n".join(r.strip() for r in rows)})
            table_buf = []

    while i < n:
        raw = lines[i]
        s = raw.strip()
        if s.startswith("```"):
            if in_code:
                flush_code()
                in_code = False
            else:
                flush_table()
                in_code = True
                code_buf = []
            i += 1
            continue
        if in_code:
            code_buf.append(raw)
            i += 1
            continue
        if "|" in raw:
            table_buf.append(raw)
            i += 1
            continue
        if table_buf:
            flush_table()
        if not s:
            blocks.append({"type": "blank", "text": ""})
        elif s.startswith("#"):
            level = len(s) - len(s.lstrip("#"))
            blocks.append({"type": f"h{min(level, 4)}", "text": inline(s.lstrip("#").strip())})
        elif s.startswith(">"):
            blocks.append({"type": "quote", "text": inline(s.lstrip(">").strip())})
        elif re.match(r"^(\*\*\*|---|___)\s*$", s):
            blocks.append({"type": "hr", "text": ""})
        elif re.match(r"^[-*+]\s+", s):
            blocks.append({"type": "bullet", "text": inline(re.sub(r"^[-*+]\s+", "", s))})
        elif re.match(r"^\d+[.)]\s+", s):
            blocks.append({"type": "num", "text": inline(re.sub(r"^\d+[.)]\s+", "", s))})
        elif s.startswith("<div") or s.startswith("</div"):
            pass  # ignora tags de layout do HTML
        else:
            blocks.append({"type": "body", "text": inline(s)})
        i += 1
    flush_code()
    flush_table()
    return blocks


# ---------------------------------------------------------------- wrap
def wrap(text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    """Empacota o texto em linhas de até max_w px, quebrando palavras longas."""
    words = text.split(" ")
    out: list[str] = []
    cur = ""
    for w in words:
        # Quebra palavras maiores que a linha (ex.: URLs longas)
        while w and fnt.getlength(w) > max_w:
            hi, lo = len(w), 0
            while lo < hi:
                mid = (lo + hi + 1) // 2
                if fnt.getlength(w[:mid]) <= max_w:
                    lo = mid
                else:
                    hi = mid - 1
            cut = max(lo, 1)
            if cur:
                out.append(cur)
                cur = ""
            out.append(w[:cut])
            w = w[cut:]
        if not w:
            continue
        trial = (cur + " " + w).strip()
        if fnt.getlength(trial) <= max_w or not cur:
            cur = trial
        else:
            out.append(cur)
            cur = w
    if cur:
        out.append(cur)
    return out


# ---------------------------------------------------------------- render
def render_doc(
    title: str,
    subtitle: str,
    blocks: list[dict],
) -> list[Image.Image]:
    pages: list[Image.Image] = []
    img = Image.new("RGB", (PAGE_W, PAGE_H), BG)
    d = ImageDraw.Draw(img)
    y = TOP

    f_h1 = font(FS_H1, bold=True)
    f_h2 = font(FS_H2, bold=True)
    f_h3 = font(FS_H3, bold=True)
    f_h4 = font(FS_H4, bold=True)
    f_body = font(FS_BODY)
    f_code = font(FS_CODE, code=True)
    f_meta = font(FS_META)

    # ---- cabeçalho da primeira página (título e subtítulo quebrados, nunca saem da margem)
    for ln in wrap(title, f_h1, MAX_W):
        d.text((MARGIN, y), ln, font=f_h1, fill=ACCENT)
        y += int(f_h1.size * 1.15)
    y += int(FS_META * 0.2)
    for ln in wrap(subtitle, f_meta, MAX_W):
        d.text((MARGIN, y), ln, font=f_meta, fill=GRAY)
        y += int(FS_META * 1.4)
    d.line([(MARGIN, y), (PAGE_W - MARGIN, y)], fill=RULE, width=3)
    y += int(0.35 * DPI)

    def new_page():
        nonlocal img, d, y
        pages.append(img)
        img = Image.new("RGB", (PAGE_W, PAGE_H), BG)
        d = ImageDraw.Draw(img)
        # rodapé com número de página (anchor="rt": o topo do dígito fica na linha
        # do rodapé, descendo — nunca invade a faixa do conteúdo acima)
        d.text((PAGE_W - MARGIN, PAGE_H - int(0.4 * DPI)), str(len(pages) + 1),
               font=f_meta, fill=GRAY, anchor="rt")
        d.text((MARGIN, PAGE_H - int(0.4 * DPI)), title, font=f_meta, fill=GRAY, anchor="la")
        d.line([(MARGIN, int(0.28 * DPI)), (PAGE_W - MARGIN, int(0.28 * DPI))], fill=RULE, width=1)
        y = int(0.6 * DPI)

    def ensure_space(needed: int):
        nonlocal y
        if y + needed > BOTTOM:
            new_page()

    for b in blocks:
        t = b["type"]
        text = b["text"]

        if t == "blank":
            y += int(FS_BODY * 0.8)
            continue

        if t == "hr":
            ensure_space(int(0.5 * DPI))
            y += int(0.25 * DPI)
            d.line([(MARGIN, y), (PAGE_W - MARGIN, y)], fill=RULE, width=2)
            y += int(0.35 * DPI)
            continue

        if t.startswith("h"):
            level = int(t[1])
            fnt = {1: f_h1, 2: f_h2, 3: f_h3, 4: f_h4}[level]
            lines = wrap(text, fnt, MAX_W)
            lh = int(fnt.size * 1.25)
            needed = int(fnt.size * 0.5) + len(lines) * lh + int(FS_BODY * 0.45)
            ensure_space(needed)
            y += int(fnt.size * 0.5)
            for ln in lines:
                d.text((MARGIN, y), ln, font=fnt, fill=ACCENT if level <= 2 else INK)
                y += lh
            y += int(FS_BODY * 0.45)
            continue

        if t == "code":
            rendered_lines: list[str] = []
            for cl in text.split("\n"):
                rendered_lines.extend(wrap(cl if cl else " ", f_code, MAX_W - int(0.5 * DPI)))
            line_h = int(FS_CODE * 1.4)
            block_h = len(rendered_lines) * line_h + int(0.3 * DPI)
            ensure_space(block_h)
            # bloco dentro das margens (sem estourar lateralmente)
            d.rounded_rectangle(
                [MARGIN, y, PAGE_W - MARGIN, y + block_h - int(0.12 * DPI)],
                radius=10, fill=CODE_BG,
            )
            cy = y + int(0.15 * DPI)
            for ln in rendered_lines:
                d.text((MARGIN + int(0.1 * DPI), cy), ln, font=f_code, fill=CODE_INK)
                cy += line_h
            y = cy + int(0.12 * DPI)
            continue

        if t == "quote":
            lines = wrap(text, f_body, MAX_W - int(0.4 * DPI))
            lh = int(FS_BODY * LINE)
            needed = lh * len(lines) + int(FS_BODY * 0.4)
            ensure_space(needed)
            d.line([(MARGIN, y), (MARGIN, y + lh * len(lines) - 4)], fill=ACCENT, width=4)
            cy = y
            for ln in lines:
                d.text((MARGIN + int(0.3 * DPI), cy), ln, font=f_body, fill=GRAY)
                cy += lh
            y = cy + int(FS_BODY * 0.4)
            continue

        if t in ("bullet", "num"):
            lines = wrap(text, f_body, MAX_W - int(0.45 * DPI))
            lh = int(FS_BODY * LINE)
            needed = lh * len(lines) + int(FS_BODY * 0.25)
            ensure_space(needed)
            if t == "bullet":
                d.text((MARGIN, y), "•", font=f_body, fill=ACCENT)
            cy = y
            for ln in lines:
                d.text((MARGIN + int(0.35 * DPI), cy), ln, font=f_body, fill=INK)
                cy += lh
            y = cy + int(FS_BODY * 0.25)
            continue

        # body
        lines = wrap(text, f_body, MAX_W)
        lh = int(FS_BODY * LINE)
        needed = lh * len(lines) + int(FS_BODY * 0.35)
        ensure_space(needed)
        cy = y
        for ln in lines:
            d.text((MARGIN, cy), ln, font=f_body, fill=INK)
            cy += lh
        y = cy + int(FS_BODY * 0.35)

    pages.append(img)
    return pages


def band_clean(im: Image.Image, x0: int, y0: int, x1: int, y1: int) -> bool:
    """True se a faixa (x0,y0)-(x1,y1) estiver 100% branca (sem texto/overflow)."""
    band = im.crop((x0, y0, x1, y1))
    diff = ImageChops.difference(band, Image.new("RGB", band.size, BG))
    return diff.getbbox() is None


def verify_pages(pages: list[Image.Image], name: str) -> None:
    """Confere margens laterais e a faixa entre o conteúdo e o rodapé.

    Pontos legítimos na borda (excluídos da checagem):
    - réguas e o número de página terminam em x = MARGIN + MAX_W (borda exata);
    - o rodapé (título + número) começa em y = PAGE_H - 0.4*DPI.
    """
    footer_y = PAGE_H - int(0.4 * DPI)
    right_x = MARGIN + MAX_W  # onde o conteúdo termina (borda exata)
    bad = []
    for i, im in enumerate(pages, 1):
        # 1) faixa entre o fim do conteúdo (BOTTOM) e o topo do rodapé:
        #    se houver pixel aqui, é overflow do conteúdo sobre o rodapé.
        if not band_clean(im, 0, BOTTOM + 1, PAGE_W, footer_y - 1):
            bad.append(f"pág {i}: texto na faixa do rodapé")
        # 2) margem direita ALÉM da largura máxima de conteúdo (x > right_x)
        if not band_clean(im, right_x + 1, 0, PAGE_W, PAGE_H):
            bad.append(f"pág {i}: texto na margem direita")
    if bad:
        print(f"  ⚠ {name}: {', '.join(bad)}")
    else:
        print(f"  ✔ {name}: margens e rodapé limpos ({len(pages)} páginas)")


# ---------------------------------------------------------------- fontes de entrada
SOURCES = [
    {
        "name": "README",
        "title": "Data Base Analysis — README",
        "subtitle": "Visão geral do projeto · limpeza dos dados · Machine Learning no navegador",
        "file": os.path.join(ROOT, "README.md"),
    },
    {
        "name": "Referencia_Tecnica",
        "title": "Referência Técnica",
        "subtitle": "Resumo em uma página · linguagem simples",
        "file": os.path.join(ROOT, "ml", "resumos", "referencia_tecnica.md"),
    },
    {
        "name": "Plano_ML",
        "title": "Plano de ML",
        "subtitle": "Resumo em uma página · linguagem simples",
        "file": os.path.join(ROOT, "ml", "resumos", "plano_ml.md"),
    },
]


def save_pdf(pages: list[Image.Image], path: str) -> None:
    """Escreve um PDF multi-página manualmente (FlateDecode/zlib)."""
    import zlib

    scale = 72.0 / DPI
    page_w = PAGE_W * scale
    page_h = PAGE_H * scale

    bodies: list[bytes] = []
    img_nums: list[int] = []
    content_nums: list[int] = []

    for im in pages:
        comp = zlib.compress(im.tobytes(), 6)
        body = (
            b"<< /Type /XObject /Subtype /Image /Width " + str(im.width).encode()
            + b" /Height " + str(im.height).encode()
            + b" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length "
            + str(len(comp)).encode() + b" >>\nstream\n" + comp + b"\nendstream"
        )
        img_nums.append(len(bodies) + 1)
        bodies.append(body)

    for _ in pages:
        cs = (
            b"q\n"
            + str(round(page_w, 2)).encode() + b" 0 0 " + str(round(page_h, 2)).encode() + b" 0 0 cm\n"
            + b"/Im0 Do\nQ\n"
        )
        body = b"<< /Length " + str(len(cs)).encode() + b" >>\nstream\n" + cs + b"\nendstream"
        content_nums.append(len(bodies) + 1)
        bodies.append(body)

    # Ordem dos objetos: imagens (1..n), contents (n+1..2n), páginas (2n+1..3n),
    # árvore de páginas (3n+1), catálogo (3n+2). /Parent aponta p/ árvore (3n+1).
    n = len(pages)
    pages_tree_num = 3 * n + 1
    page_nums: list[int] = []
    for i in range(n):
        body = (
            b"<< /Type /Page /Parent " + str(pages_tree_num).encode() + b" 0 R /MediaBox [0 0 "
            + str(round(page_w, 2)).encode() + b" " + str(round(page_h, 2)).encode()
            + b"] /Resources << /XObject << /Im0 " + str(img_nums[i]).encode()
            + b" 0 R >> >> /Contents " + str(content_nums[i]).encode() + b" 0 R >>"
        )
        page_nums.append(len(bodies) + 1)
        bodies.append(body)

    pages_tree = (
        b"<< /Type /Pages /Kids [ "
        + b" ".join(str(num).encode() + b" 0 R" for num in page_nums)
        + b" ] /Count " + str(len(page_nums)).encode() + b" >>"
    )
    pages_num = len(bodies) + 1
    bodies.append(pages_tree)

    catalog_body = b"<< /Type /Catalog /Pages " + str(pages_num).encode() + b" 0 R >>"
    catalog_num = len(bodies) + 1
    bodies.append(catalog_body)

    out = bytearray(b"%PDF-1.4\n")
    offsets: list[int] = []
    for body in bodies:
        offsets.append(len(out))
        num = len(offsets)
        out.extend(f"{num} 0 obj\n".encode())
        out.extend(body)
        out.extend(b"\nendobj\n")

    xref_pos = len(out)
    n_objects = len(bodies) + 1  # +1 = objeto livre (id 0)
    out.extend(f"xref\n0 {n_objects}\n".encode())
    out.extend(b"0000000000 65535 f \n")
    for off in offsets:
        out.extend(f"{off:010d} 00000 n \n".encode())
    out.extend(
        f"trailer\n<< /Size {n_objects} /Root {catalog_num} 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode()
    )

    with open(path, "wb") as f:
        f.write(out)


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for src in SOURCES:
        with open(src["file"], "r", encoding="utf-8") as f:
            raw = f.read()
        blocks = parse_md(raw)
        pages = render_doc(src["title"], src["subtitle"], blocks)

        pdf_path = os.path.join(OUT_DIR, f"{src['name']}.pdf")
        png_path = os.path.join(OUT_DIR, f"{src['name']}.png")

        save_pdf(pages, pdf_path)

        # PNG (páginas empilhadas em uma única imagem)
        gap = int(0.15 * DPI)
        tall = Image.new("RGB", (PAGE_W, sum(p.height for p in pages) + gap * (len(pages) - 1)), BG)
        yy = 0
        for p in pages:
            tall.paste(p, (0, yy))
            yy += p.height + gap
        tall.save(png_path)

        print(f"OK -> {pdf_path}  ({len(pages)} páginas, {os.path.getsize(pdf_path)//1024} KB)")
        print(f"OK -> {png_path}  ({tall.width}x{tall.height}, {os.path.getsize(png_path)//1024} KB)")
        verify_pages(pages, src["name"])


if __name__ == "__main__":
    main()
