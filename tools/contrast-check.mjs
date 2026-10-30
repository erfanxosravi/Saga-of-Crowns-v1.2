#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(__dirname, '../src/index.css');
const css = fs.readFileSync(cssPath, 'utf8');

function extractBlockVars(cssText, blockHeaderRegex) {
  const match = blockHeaderRegex.exec(cssText);
  if (!match) return {};
  const startIdx = cssText.indexOf('{', match.index);
  let depth = 0;
  let endIdx = startIdx;
  for (let i = startIdx; i < cssText.length; i++) {
    if (cssText[i] === '{') depth++;
    else if (cssText[i] === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  const body = cssText.slice(startIdx + 1, endIdx);
  const vars = {};
  const re = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    vars[m[1].trim()] = m[2].trim();
  }
  return vars;
}

function parseHex(hexStr) {
  const clean = (hexStr || '').trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relLuminance([r, g, b]) {
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hex1, hex2) {
  const rgb1 = parseHex(hex1);
  const rgb2 = parseHex(hex2);
  if (!rgb1 || !rgb2) return null;
  const l1 = relLuminance(rgb1);
  const l2 = relLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const themeBlock = extractBlockVars(css, /@theme\s*\{/);
const lightVars = {
  ...themeBlock,
  ...extractBlockVars(css, /:root,\s*html\[data-theme="light"\]/),
};
const darkVars = {
  ...themeBlock,
  ...extractBlockVars(css, /html\[data-theme="dark"\]/),
};

const CORE_SURFACES = [
  '--surface-canvas',
  '--surface-elevated',
  '--surface-card',
  '--surface-secondary',
  '--surface-interactive',
];

const CORE_TEXTS = [
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--text-accent-amber',
  '--text-accent-amber-strong',
  '--text-accent-ice',
  '--text-accent-emerald',
  '--text-accent-crimson',
  '--text-accent-violet',
];

const TINT_AND_BOUNDARY_PAIRS = [
  // Saga Mode & Amber-tinted cards
  { text: '--text-primary', bg: '--surface-amber-tint', min: 4.5, note: 'Primary ink on amber tint' },
  { text: '--text-secondary', bg: '--surface-amber-tint', min: 4.5, note: 'Secondary ink on amber tint' },
  { text: '--text-muted', bg: '--surface-amber-tint', min: 4.5, note: 'Muted ink on amber tint' },
  { text: '--text-accent-amber', bg: '--surface-amber-tint', min: 4.5, note: 'Amber accent on amber tint' },
  { text: '--text-accent-amber-strong', bg: '--surface-amber-tint', min: 4.5, note: 'Strong amber accent on amber tint' },
  // Crimson-tinted cards
  { text: '--text-primary', bg: '--surface-crimson-tint', min: 4.5, note: 'Primary ink on crimson tint' },
  { text: '--text-secondary', bg: '--surface-crimson-tint', min: 4.5, note: 'Secondary ink on crimson tint' },
  { text: '--text-accent-crimson', bg: '--surface-crimson-tint', min: 4.5, note: 'Crimson accent on crimson tint' },
  // Emerald-tinted cards
  { text: '--text-primary', bg: '--surface-emerald-tint', min: 4.5, note: 'Primary ink on emerald tint' },
  { text: '--text-secondary', bg: '--surface-emerald-tint', min: 4.5, note: 'Secondary ink on emerald tint' },
  { text: '--text-accent-emerald', bg: '--surface-emerald-tint', min: 4.5, note: 'Emerald accent on emerald tint' },
  // Ice-tinted cards & hover
  { text: '--text-primary', bg: '--surface-ice-tint', min: 4.5, note: 'Primary ink on ice tint' },
  { text: '--text-secondary', bg: '--surface-ice-tint', min: 4.5, note: 'Secondary ink on ice tint' },
  { text: '--text-accent-ice', bg: '--surface-ice-tint', min: 4.5, note: 'Ice accent on ice tint' },
  { text: '--text-primary', bg: '--surface-ice-hover', min: 4.5, note: 'Primary ink on ice hover' },
  { text: '--text-accent-ice', bg: '--surface-ice-hover', min: 4.5, note: 'Ice accent on ice hover' },
  // Violet-tinted cards
  { text: '--text-primary', bg: '--surface-violet-tint', min: 4.5, note: 'Primary ink on violet tint' },
  { text: '--text-secondary', bg: '--surface-violet-tint', min: 4.5, note: 'Secondary ink on violet tint' },
  { text: '--text-accent-violet', bg: '--surface-violet-tint', min: 4.5, note: 'Violet accent on violet tint' },
  // Disabled state ("why it's disabled" text legibility)
  { text: '--text-disabled', bg: '--surface-disabled', min: 4.5, note: 'Disabled ink on disabled surface' },
  // Non-text boundaries that carry meaning (>= 3.0:1)
  { text: '--border-strong', bg: '--surface-card', min: 3.0, note: 'Meaningful control border on card' },
  { text: '--border-amber-subtle', bg: '--surface-amber-tint', min: 3.0, note: 'Amber semantic border on amber tint' },
  { text: '--border-crimson-subtle', bg: '--surface-crimson-tint', min: 3.0, note: 'Crimson semantic border on crimson tint' },
];

const FIXED_CTA_PAIRS = [
  {
    name: 'Hall of Legends CTA (cta-copper)',
    fgVar: '--color-cta-ink-light',
    fgFallback: '#fffdf9',
    bgVar: '--color-cta-copper',
    bgFallback: '#b85a16',
    min: 4.5,
  },
  {
    name: 'Faith Conversion CTA (cta-violet)',
    fgVar: '--color-cta-violet-ink',
    fgFallback: '#ffffff',
    bgVar: '--color-cta-violet',
    bgFallback: '#8655f4',
    min: 4.5,
  },
  {
    name: 'Hire Skald CTA (cta-terracotta)',
    fgVar: '--color-nordic-950',
    fgFallback: '#0b1118',
    bgVar: '--color-cta-terracotta',
    bgFallback: '#e07a2f',
    min: 4.5,
  },
  {
    name: 'Primary Gold CTA (gold-500)',
    fgVar: '--color-nordic-950',
    fgFallback: '#0b1118',
    bgVar: '--color-gold-500',
    bgFallback: '#f59e0b',
    min: 4.5,
  },
  {
    name: 'Primary Blood CTA (blood-600)',
    fgVar: '--color-cta-violet-ink',
    fgFallback: '#ffffff',
    bgVar: '--color-blood-600',
    bgFallback: '#dc2626',
    min: 4.5,
  },
  {
    name: 'Sea Voyage CTA (cta-ice)',
    fgVar: '--color-cta-violet-ink',
    fgFallback: '#ffffff',
    bgVar: '--color-cta-ice',
    bgFallback: '#0277b5',
    min: 4.5,
  },
];

let failures = 0;

function checkTheme(themeName, vars) {
  console.log(`\n=== THEME: ${themeName.toUpperCase()} ===`);
  console.log(
    `${'Text / Border Token'.padEnd(28)} | ${'FG Hex'.padEnd(8)} | ${'Surface Token'.padEnd(24)} | ${'BG Hex'.padEnd(8)} | ${'Ratio'.padEnd(7)} | Status`
  );
  console.log('-'.repeat(94));

  for (const bgKey of CORE_SURFACES) {
    const bgHex = vars[bgKey];
    for (const fgKey of CORE_TEXTS) {
      const fgHex = vars[fgKey];
      const ratio = contrastRatio(fgHex, bgHex);
      const min = 4.5;
      const pass = ratio !== null && ratio >= min;
      if (!pass) failures++;
      console.log(
        `${fgKey.padEnd(28)} | ${(fgHex || 'N/A').padEnd(8)} | ${bgKey.padEnd(24)} | ${(bgHex || 'N/A').padEnd(8)} | ${(ratio ? ratio.toFixed(2) + ':1' : 'ERR').padEnd(7)} | ${pass ? 'PASS (AA)' : `FAIL (<${min}:1)`}`
      );
    }
  }

  console.log('\n--- Tinted, Disabled & Meaningful Boundary Pairs ---');
  for (const pair of TINT_AND_BOUNDARY_PAIRS) {
    const fgHex = vars[pair.text];
    const bgHex = vars[pair.bg];
    const ratio = contrastRatio(fgHex, bgHex);
    const pass = ratio !== null && ratio >= pair.min;
    if (!pass) failures++;
    const tag = pair.min === 3.0 ? 'PASS (3:1)' : 'PASS (AA)';
    console.log(
      `${pair.text.padEnd(28)} | ${(fgHex || 'N/A').padEnd(8)} | ${pair.bg.padEnd(24)} | ${(bgHex || 'N/A').padEnd(8)} | ${(ratio ? ratio.toFixed(2) + ':1' : 'ERR').padEnd(7)} | ${pass ? tag : `FAIL (<${pair.min}:1)`} (${pair.note})`
    );
  }
}

checkTheme('light (Daylight)', lightVars);
checkTheme('dark (Night)', darkVars);

console.log('\n=== THEME-INVARIANT CTA BUTTONS ===');
console.log(
  `${'Button / Token'.padEnd(36)} | ${'Text Hex'.padEnd(8)} | ${'Bg Hex'.padEnd(8)} | ${'Ratio'.padEnd(7)} | Status`
);
console.log('-'.repeat(76));
for (const cta of FIXED_CTA_PAIRS) {
  const fgHex = lightVars[cta.fgVar] || cta.fgFallback;
  const bgHex = lightVars[cta.bgVar] || cta.bgFallback;
  const ratio = contrastRatio(fgHex, bgHex);
  const pass = ratio !== null && ratio >= cta.min;
  if (!pass) failures++;
  console.log(
    `${cta.name.padEnd(36)} | ${fgHex.padEnd(8)} | ${bgHex.padEnd(8)} | ${(ratio ? ratio.toFixed(2) + ':1' : 'ERR').padEnd(7)} | ${pass ? 'PASS (AA)' : `FAIL (<${cta.min}:1)`}`
  );
}

console.log(`\nTotal Failures: ${failures}`);
if (failures > 0) {
  process.exit(1);
}
