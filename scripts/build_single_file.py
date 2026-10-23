"""Inline css/ and js/ into one self-contained HTML file at dist/linear-algebra-lab.html.

Usage: python3 scripts/build_single_file.py
Handy for sharing the page as a single file or publishing it somewhere that takes one file.
"""
import os
import re

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()

def read(path):
    return open(os.path.join(root, path), encoding='utf-8').read()

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: '<style>\n' + read(m.group(1)) + '\n</style>', html)
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
bundle = '\n'.join(read(s) for s in scripts)
html = re.sub(r'<!-- core engine -->.*?(?=</body>)', lambda m: '<script>\n(function(){\n\'use strict\';\n' + bundle + '\n})();\n</script>\n', html, flags=re.S)

out = os.path.join(root, 'dist')
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'linear-algebra-lab.html'), 'w', encoding='utf-8').write(html)
print('wrote dist/linear-algebra-lab.html', len(html), 'bytes')
