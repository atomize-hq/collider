#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, re, sys

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'meta/MANIFEST.json').read_text())
errors=[]
checked=[]
for item in manifest['files']:
    p=root/item['path']
    if not p.exists():
        errors.append(f"missing: {item['path']}")
        continue
    b=p.read_bytes()
    sha=hashlib.sha256(b).hexdigest()
    if len(b)!=item['size_bytes']:
        errors.append(f"size mismatch: {item['path']}")
    if sha!=item['sha256']:
        errors.append(f"sha256 mismatch: {item['path']}")
    checked.append(item['path'])

# Canonical structure checks.
oq=(root/'canonical/02-collider-v1-open-architecture-questions.md').read_text()
qids=re.findall(r'^### (C-OQ-\d{3})\b',oq,re.M)
if qids != manifest['open_question_ids']:
    errors.append('open-question id sequence mismatch')
if len(re.findall(r'^\*\*Status:\*\* Open',oq,re.M)) != manifest['open_question_count']:
    errors.append('not all open questions are Open')
found=(root/'canonical/01-collider-v1-foundations.md').read_text()
try:
    sec=found.split('## 16. Foundational Invariants',1)[1].split('## 17.',1)[0]
    inv=len(re.findall(r'^\d+\. \*\*',sec,re.M))
    if inv != manifest['foundation_invariant_count']:
        errors.append('foundation invariant count mismatch')
except Exception:
    errors.append('foundation invariant section missing')

# Check relative markdown links in all markdown payloads. Historical sandbox/http/mailto links are external.
link_re=re.compile(r'\[[^\]]*\]\(([^)]+)\)')
for rel in checked:
    if not rel.endswith('.md'):
        continue
    p=root/rel
    text=p.read_text(errors='replace')
    # Simple fence balance check.
    fences=sum(1 for line in text.splitlines() if line.lstrip().startswith('```'))
    if fences % 2:
        errors.append(f'unbalanced fenced blocks: {rel}')
    for target in link_re.findall(text):
        target=target.strip().split()[0].strip('<>')
        if target.startswith(('http://','https://','mailto:','#','sandbox:')):
            continue
        pathpart=target.split('#',1)[0]
        if not pathpart:
            continue
        dest=(p.parent/pathpart).resolve()
        try:
            dest.relative_to(root.resolve())
        except ValueError:
            errors.append(f'link escapes bundle: {rel} -> {target}')
            continue
        if not dest.exists():
            errors.append(f'broken relative link: {rel} -> {target}')

result={
 'status':'PASS' if not errors else 'FAIL',
 'bundle_id':manifest['bundle_id'],
 'payload_files_checked':len(checked),
 'open_questions':len(qids),
 'foundation_invariants':manifest['foundation_invariant_count'],
 'errors':errors,
 'note':'Integrity and internal-link checks only; not source-code/build/runtime/adoption evidence.'
}
print(json.dumps(result,indent=2))
sys.exit(0 if not errors else 1)
