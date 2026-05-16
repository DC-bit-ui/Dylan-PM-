#!/usr/bin/env python3
"""
Extract text from the four objection-handling source docs Ben + Hobbs
produced, write markdown distillates that the BRAIN + ASK tabs can use.

Output:
  shared-growth-memory/team-brain/objection-plays/<slug>.md  (extracted text)
  shared-growth-memory/team-brain/objection-plays/<slug>.<ext>  (original)
  shared-growth-memory/team-brain/objection-plays/INDEX.md  (catalogue)

Run from anywhere; paths are absolute.
"""
import os, re, sys, shutil, subprocess, zipfile
import xml.etree.ElementTree as ET

BUS_ROOT = r'C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory'
LOCAL_PM = r'C:\Dylan PM\shared-growth-memory'
OUT_DIR_NAME = os.path.join('team-brain', 'objection-plays')

SOURCE_DOCS = [
    {
        'file': '220107 Sales FAQs (1).docx',
        'slug': 'agriprove-sales-faqs-2022',
        'title': 'AgriProve Sales FAQs',
        'author': 'AgriProve team',
        'date': '2022-01-07',
        'description': 'Foundational FAQ covering the most common landholder questions on carbon projects, methodology, and pricing.',
    },
    {
        'file': 'AgriProve Farmer Objection Handbook (HM 26Nov25).docx',
        'slug': 'hobbs-farmer-objection-handbook',
        'title': 'Hobbs Farmer Objection Handbook',
        'author': 'Hobbs Magaret',
        'date': '2025-11-26',
        'description': 'Hobbs-authored playbook for the objections he hears most on-farm. Verbatim language for each.',
    },
    {
        'file': 'AgriProve Objection Handling Guide.docx',
        'slug': 'agriprove-objection-handling-guide',
        'title': 'AgriProve Objection Handling Guide',
        'author': 'AgriProve team',
        'date': 'undated',
        'description': 'General objection-handling guide. Bookend to the Hobbs handbook — broader framings, more conservative tone.',
    },
    {
        'file': 'AgriProve_Storm Boy Current Cold_Call_Script (1).pdf',
        'slug': 'storm-boy-cold-call-script',
        'title': 'Storm Boy Cold-Call Script',
        'author': 'AgriProve Storm Boy team',
        'date': 'current',
        'description': 'Current cold-call script template for Storm Boy outreach. Reference for the opening + early-objection patterns reps are expected to deploy.',
    },
]

# Word namespace for document.xml
W_NS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

def extract_docx_text(path):
    """Pull paragraph text from a .docx by reading word/document.xml."""
    parts = []
    with zipfile.ZipFile(path) as z:
        with z.open('word/document.xml') as f:
            tree = ET.parse(f)
    body = tree.getroot().find(W_NS + 'body')
    if body is None:
        return ''
    for elem in body.iter():
        tag = elem.tag
        if tag == W_NS + 'p':
            # New paragraph
            runs = []
            for t in elem.iter(W_NS + 't'):
                if t.text:
                    runs.append(t.text)
            text = ''.join(runs).strip()
            if text:
                parts.append(text)
            else:
                parts.append('')  # preserve paragraph break
        elif tag == W_NS + 'tbl':
            # Table — render as plain rows with | separator
            for row in elem.iter(W_NS + 'tr'):
                cells = []
                for cell in row.iter(W_NS + 'tc'):
                    cell_text = ''.join(t.text or '' for t in cell.iter(W_NS + 't')).strip()
                    cells.append(cell_text)
                if any(cells):
                    parts.append('| ' + ' | '.join(cells) + ' |')
    return '\n\n'.join(p for p in parts if p is not None)

def extract_pdf_text(path):
    """Shell to pdftotext (available in git-bash via poppler)."""
    out = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if out.returncode != 0:
        return f'[pdftotext failed: {out.stderr[:200]}]'
    return out.stdout

def slug_filename(file):
    return os.path.splitext(file)[0]

def build_markdown(meta, body):
    return f"""# {meta['title']}

**Author:** {meta['author']}
**Date:** {meta['date']}
**Source file:** `{meta['file']}`
**Description:** {meta['description']}

---

{body.strip()}
"""

def process(target_dir):
    out_dir = os.path.join(target_dir, OUT_DIR_NAME)
    os.makedirs(out_dir, exist_ok=True)

    index_rows = []
    for meta in SOURCE_DOCS:
        src = os.path.join(target_dir, meta['file'])
        if not os.path.exists(src):
            print(f'  [skip] {meta["file"]} not found in {target_dir}')
            continue
        ext = os.path.splitext(meta['file'])[1].lower()
        try:
            if ext == '.docx':
                body = extract_docx_text(src)
            elif ext == '.pdf':
                body = extract_pdf_text(src)
            else:
                body = '[unsupported format]'
        except Exception as e:
            body = f'[extraction failed: {e}]'

        md_out = os.path.join(out_dir, meta['slug'] + '.md')
        bin_out = os.path.join(out_dir, meta['file'])
        with open(md_out, 'w', encoding='utf-8') as f:
            f.write(build_markdown(meta, body))
        # Move original next to extracted version
        shutil.copy2(src, bin_out)
        print(f'  [ok]   {meta["file"]} -> {os.path.relpath(md_out, target_dir)} ({len(body)} chars)')

        index_rows.append(f'- **[{meta["title"]}]({meta["slug"]}.md)** · {meta["author"]} · {meta["date"]} — {meta["description"]}')

    index_md = f"""# Objection plays — source documents

Captured from Ben (2026-05-13 chat) and Hobbs's own SharePoint-stored writings. The .md files are the extracted text content readable by the dashboard's ASK + BRAIN tabs. The original .docx / .pdf files sit alongside for human review.

## Catalogue

{chr(10).join(index_rows)}

## How the dashboard uses these

- **ASK tab** loads the extracted markdown into the team brain context (alongside profiles + distillates). Reps asking "how do we handle X objection?" pull answers from these directly with verbatim citations.
- **BRAIN tab** surfaces them as cards in the distillates grid (planned next iteration).
- **Phase 2:** structured per-objection cards — one card per objection (the 25%, "I'm just a grazier", privacy concerns, etc.) with Hobbs's verbatim response, alternative responses, and which transcripts validate it.

## Provenance

Originals copied from `shared-growth-memory/` root (where Dylan dropped them after a 2026-05-13 chat with Ben). Moved into this folder so they're co-located with the rest of `team-brain/` and ASK can find them deterministically.

## Re-extraction

If a source doc is updated, re-run `stormboy-tracker/coaching/tools/extract-objection-docs.py`. Idempotent — overwrites the .md files with fresh extraction.
"""
    with open(os.path.join(out_dir, 'INDEX.md'), 'w', encoding='utf-8') as f:
        f.write(index_md)
    print(f'  [ok]   wrote INDEX.md')

if __name__ == '__main__':
    for target in (BUS_ROOT, LOCAL_PM):
        if os.path.exists(target):
            print(f'\n=== Processing {target} ===')
            process(target)
        else:
            print(f'\n=== Skipping {target} (not found) ===')
