"""Extract the base64 PNG from the most recent MCP tool-results dump and save to a target path."""
import sys, re, base64, pathlib, glob

RESULTS_DIR = pathlib.Path(r"C:\Users\Laversannem\.claude\projects\C--project-CI5-sherlock\6e3e74d6-a5a3-41bd-878e-1eb9b34c2a44\tool-results")

def main(out_path: str) -> None:
    candidates = sorted(glob.glob(str(RESULTS_DIR / "mcp-plugin_chrome-devtools-mcp_chrome-devtools-evaluate_script-*.txt")))
    if not candidates:
        raise SystemExit("no tool-results files found")
    latest = pathlib.Path(candidates[-1])
    src = latest.read_text(encoding="utf-8", errors="ignore")
    m = re.search(r"data:image/png;base64,([A-Za-z0-9+/=]+)", src)
    if not m:
        raise SystemExit(f"no data URL in {latest}")
    png = base64.b64decode(m.group(1))
    out = pathlib.Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(png)
    print(f"{out}: {len(png)} bytes (source: {latest.name})")

if __name__ == "__main__":
    main(sys.argv[1])
