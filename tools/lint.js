#!/usr/bin/env node
/* Fast structural checks. No browser, no dependencies.
 *
 *   node tools/lint.js
 *
 * - every scene file registers the id it is named after, and main.js loads it
 * - no Math.random in source (scenes are reproducible: use kit.rng / world.R)
 * - no em dashes in source, docs or captions (house style: commas, colons, parentheses)
 * - no network URLs in source except caption sources
 * - every caption with a fact card names a source
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const rel = (f) => path.relative(root, f);
const walk = (d, out = []) => {
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
};

// Scenes and main.js.
const sceneDir = path.join(root, 'src', 'scenes');
const main = fs.readFileSync(path.join(root, 'src', 'main.js'), 'utf8');
for (const f of fs.readdirSync(sceneDir)) {
  if (!f.endsWith('.js') || f.startsWith('_')) continue;
  const id = f.replace(/\.js$/, '');
  const src = fs.readFileSync(path.join(sceneDir, f), 'utf8');
  if (!new RegExp("id:\\s*'" + id + "'").test(src)) errors.push(`src/scenes/${f}: does not register id '${id}'`);
  if (!main.includes(`./scenes/${id}.js`)) errors.push(`src/main.js: does not load scene '${id}'`);
}

// Source rules.
const srcFiles = walk(path.join(root, 'src')).filter((f) => /\.(js|css|html)$/.test(f));
for (const f of srcFiles) {
  const s = fs.readFileSync(f, 'utf8');
  const lines = s.split('\n');
  lines.forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '');
    if (/Math\.random\s*\(/.test(code)) errors.push(`${rel(f)}:${i + 1}: Math.random (use kit.rng or world.R)`);
    if (line.includes('—')) errors.push(`${rel(f)}:${i + 1}: em dash`);
    const urls = code.match(/https?:\/\/[^'"\s)]+/g) || [];
    for (const u of urls) {
      const ok = /source\s*:/.test(line) || /\bsource\b/.test(lines[i - 1] || '') || /github\.com\/ChaseHendrick/.test(u) || /www\.w3\.org/.test(u);
      if (!ok && !/^\s*(\*|\/\*)/.test(line)) errors.push(`${rel(f)}:${i + 1}: network URL outside a caption source: ${u}`);
    }
  });
  // Fact cards need sources.
  const re = /body:\s*'/g;
  let m;
  while ((m = re.exec(s))) {
    const window = s.slice(m.index, m.index + 2000);
    const end = window.indexOf('})');
    const block = end > 0 ? window.slice(0, end) : window;
    if (!/source:\s*['[]/.test(block)) errors.push(`${rel(f)}: a caption with a body has no source (near offset ${m.index})`);
  }
}

// Prose: no em dashes in docs and top-level markdown.
const prose = walk(path.join(root, 'docs')).concat(fs.readdirSync(root).filter((f) => f.endsWith('.md') || f === 'llms.txt').map((f) => path.join(root, f)));
for (const f of prose) {
  if (!/\.(md|txt)$/.test(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  s.split('\n').forEach((line, i) => { if (line.includes('—')) errors.push(`${rel(f)}:${i + 1}: em dash`); });
}

if (errors.length) {
  console.error(errors.length + ' problem' + (errors.length === 1 ? '' : 's') + ':\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('lint: ok (' + srcFiles.length + ' source files, ' + prose.length + ' documents)');
