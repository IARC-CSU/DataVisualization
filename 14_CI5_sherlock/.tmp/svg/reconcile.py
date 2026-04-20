"""Set image_url on each finding when the expected PNG exists on disk, clear it otherwise."""
import json, pathlib, re

PROJECT = pathlib.Path(r"C:\project\CI5 sherlock")
CANCERS = PROJECT / "findings" / "cancers"
IMG_BASE = PROJECT / "site" / "img"

def slugify(name: str) -> str:
    m = re.match(r"\d+_(.+)\.json$", name)
    return m.group(1) if m else name.replace(".json", "")

changed = 0
touched_files = 0
missing = []
for f in sorted(CANCERS.glob("*.json")):
    data = json.loads(f.read_text(encoding="utf-8"))
    slug = data.get("slug") or slugify(f.name)
    file_changed = False
    for sec in data.get("sections", []):
        for fd in sec.get("findings", []):
            fid = (fd.get("id") or "").strip()
            url = (fd.get("ci5_url") or "").strip()
            if not fid or not url:
                continue
            rel = f"img/{slug}/{fid}.png"
            full = IMG_BASE / slug / f"{fid}.png"
            current = fd.get("image_url", "")
            target = rel if full.exists() else ""
            if not full.exists():
                missing.append(f"{f.name}::{fid}")
            if current != target:
                fd["image_url"] = target
                file_changed = True
                changed += 1
    if file_changed:
        f.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        touched_files += 1

print(f"fields updated: {changed}")
print(f"files rewritten: {touched_files}")
print(f"findings still without PNG: {len(missing)}")
for m in missing[:20]:
    print("  -", m)
if len(missing) > 20:
    print(f"  ... and {len(missing) - 20} more")
