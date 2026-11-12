#!/usr/bin/env python3
"""Package a complete Next static export with a strict 50,000,000-byte upload cap."""
import argparse
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
LIMIT = 50_000_000


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    source = ROOT / 'out'
    output = args.output.resolve()
    if not (source / 'index.html').is_file():
        parser.error('Run npm run build first; out/index.html is missing.')
    if output.exists():
        parser.error('Output already exists; use a new path to preserve the prior package.')
    if output.is_relative_to(source):
        parser.error('The ZIP must be outside out/.')
    files = sorted(p for p in source.rglob('*') if p.is_file())
    if any(p.is_symlink() for p in files):
        parser.error('Symlinks are not allowed in the deployment archive.')
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for file in files:
            archive.write(file, file.relative_to(source))
    with zipfile.ZipFile(output) as archive:
        if archive.testzip() is not None:
            raise SystemExit('ZIP integrity check failed.')
    result = {
        'archive': str(output),
        'files': len(files),
        'zip_bytes': output.stat().st_size,
        'unpacked_bytes': sum(p.stat().st_size for p in files),
        'upload_limit_bytes': LIMIT,
        'within_upload_limit': output.stat().st_size < LIMIT,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not result['within_upload_limit']:
        raise SystemExit('Archive exceeds the 50 MB upload cap; do not upload it.')


if __name__ == '__main__':
    main()
