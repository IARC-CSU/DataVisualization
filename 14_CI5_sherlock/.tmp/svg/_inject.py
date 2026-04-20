"""Wrap the raw inline SVG from IACR into a standalone SVG with baked-in styles."""
import sys, pathlib

INJECT_STYLE = """
  .print_only { display: block !important; }
  svg text.svg_title.title_l1 { font-size: 18px; font-weight: 800; fill: #000; }
  svg text.svg_title.title_l2 { font-size: 15px; font-weight: 400; fill: #000; }
  svg text.svg_title.title_l3 { font-size: 13px; font-weight: 400; font-style: italic; fill: #5c5c5c; }
  text { font-family: "Nunito Sans", "Segoe UI", Arial, sans-serif; }
  .path_lines { fill: none; }
  .domain, .tick line { stroke: #000; }
  .grid .domain { stroke: none; }
  .grid .tick line { stroke: #ddd; }
  .grid-minor .tick line { stroke: #f0f0f0; }
  .text_legend { font-size: 12px; fill: #222; }
"""

def main(in_path: str, out_path: str) -> None:
    raw = pathlib.Path(in_path).read_text(encoding="utf-8")
    # raw already has xmlns; inject our style after the opening <style></style> tag
    style_tag = f"<style>{INJECT_STYLE}</style>"
    patched = raw.replace("<style></style>", style_tag, 1)
    if patched == raw:
        # no empty style tag — insert after opening <svg ...>
        i = patched.find(">")
        patched = patched[: i + 1] + style_tag + patched[i + 1 :]
    header = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
    pathlib.Path(out_path).write_text(header + patched, encoding="utf-8")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
