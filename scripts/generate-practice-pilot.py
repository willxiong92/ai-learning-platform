"""Build the practice pilot only; never regenerate pending course content."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

REPO = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = Path.home() / "Desktop/业务主线/A-部门项目/AI学习站/sources/practice/meeting-skill"

def generate(source):
    content = json.loads((source / "content.json").read_text())
    if content["id"] != "meeting-skill" or len(content["steps"]) != 6:
        raise ValueError("Unexpected practice identity or steps")
    bundles = {}
    # Validate every source before replacing any generated file.
    for group in ("starter", "reference", "transfer"):
        files = sorted(p for p in (source / group).rglob("*") if p.is_file())
        if not files or not (source / group / "README.md").is_file():
            raise ValueError(f"Missing {group} materials")
        bundles[group] = [(p.relative_to(source / group).as_posix(), p.read_bytes()) for p in files]
    target = REPO / "public/practice/meeting-skill"
    target.mkdir(parents=True, exist_ok=True)
    manifest = {"version": content["version"], "files": {}}
    for group, files in bundles.items():
        output = target / f"{group}.zip"
        temporary = output.with_suffix(".zip.tmp")
        with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED) as archive:
            for name, body in files:
                info = zipfile.ZipInfo(name, date_time=(2026, 9, 20, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, body)
                manifest["files"][f"{group}/{name}"] = hashlib.sha256(body).hexdigest()
        temporary.replace(output)
    data_target = REPO / "src/lib/ai-learning/practice-pilot.json"
    data_target.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n")
    (target / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Generated {len(manifest['files'])} materials in 3 bundles; course files untouched.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    generate(parser.parse_args().source)
