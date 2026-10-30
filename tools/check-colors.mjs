#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function walk(dir) {
  const res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) res.push(...walk(full));
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) res.push(full);
  }
  return res;
}

const files = [
  ...walk(path.join(rootDir, 'src/components')),
  path.join(rootDir, 'src/App.tsx'),
];

const FORBIDDEN_RE =
  /(?<=[\s"'`])(?:[a-z0-9-]+:)*(?:bg|text|border|from|via|to|ring|divide)-(?:\[#[0-9a-fA-F]{3,8}\](?:\/[0-9]+)?|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}(?:\/[0-9]+)?)(?=[\s"'`}]|$)/g;

let totalViolations = 0;

for (const file of files) {
  const rel = path.relative(rootDir, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    const matches = line.match(FORBIDDEN_RE);
    if (matches) {
      totalViolations += matches.length;
      console.error(`${rel}:${idx + 1} -> ${matches.join(', ')}`);
    }
  });
}

if (totalViolations > 0) {
  console.error(
    `\nFAILED: Found ${totalViolations} hard-coded hex or Tailwind palette color class(es). Use semantic tokens from src/index.css (@theme).`
  );
  process.exit(1);
}

console.log(
  `PASS: 0 hard-coded hex or Tailwind palette color classes found across ${files.length} component files.`
);
