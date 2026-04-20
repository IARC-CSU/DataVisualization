"""Walk findings/cancers/*.json and emit a JSON work-plan: list of {filename, url, cancer, id}."""
import json, pathlib, re

BASE = pathlib.Path(r"C:\project\CI5 sherlock")
CANCERS_DIR = BASE / "findings" / "cancers"
OUT = BASE / ".tmp" / "svg" / "jobs.json"

def slugify(cancer_file: str) -> str:
    # e.g. "10_oesophagus.json" → "oesophagus"
    m = re.match(r"\d+_(.+)\.json$", cancer_file)
    return m.group(1) if m else cancer_file.replace(".json", "")

def main() -> None:
    jobs = []
    for f in sorted(CANCERS_DIR.glob("*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        slug = data.get("slug") or slugify(f.name)
        for sec in data.get("sections", []):
            for fd in sec.get("findings", []):
                url = (fd.get("ci5_url") or "").strip()
                fid = (fd.get("id") or "").strip()
                if not url or not fid:
                    continue
                filename = f"{slug}/{fid}.png"
                jobs.append({"filename": filename, "url": url, "cancer": f.name, "id": fid})
    OUT.write_text(json.dumps(jobs, indent=2), encoding="utf-8")
    print(f"wrote {len(jobs)} jobs to {OUT}")

if __name__ == "__main__":
    main()
