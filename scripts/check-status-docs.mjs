import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const requiredStatusSnippets = [
  '# VirtualCDU Status',
  'Last updated:',
  '## Automated Baseline',
  '## Current Commit',
  '## Validation Caveats',
  'PMDG/MSFS live round-trip validation requires a Windows + MSFS + PMDG environment',
];

const status = read('docs/STATUS.md');
const failures = [];

for (const snippet of requiredStatusSnippets) {
  if (!status.includes(snippet)) {
    failures.push(`docs/STATUS.md is missing required text: ${snippet}`);
  }
}

const forbiddenPatterns = [
  {
    file: 'docs/IMPLEMENTATION_STATUS.md',
    patterns: [
      /## Verification Results \(Latest Run\)/,
      /-\s*Unit tests:\s*\d+/i,
      /-\s*E2E tests:\s*\d+/i,
      /all\s+\d+\s+unit tests pass/i,
      /\d+\s+E2E tests pass/i,
      /-\s*Test Coverage:\s*\d/i,
      /Build:\s*successful\s*\([^)]*\)/i,
    ],
  },
  {
    file: 'docs/TEST_MATRIX.md',
    patterns: [
      /## Current Automated Baseline/,
      /\|\s*Unit\/regression tests\s*\|[^|\n]*\|\s*\d+\/\d+/i,
      /\|\s*Playwright E2E\s*\|[^|\n]*\|\s*\d+\s+passed/i,
    ],
  },
  {
    file: 'docs/METRICS.md',
    patterns: [
      /\|\s*Unit tests\s*\|[^|\n]*\|\s*\d+\/\d+/i,
      /\|\s*E2E tests\s*\|[^|\n]*\|\s*\d+\/\d+/i,
      /\|\s*Build\s*\|[^|\n]*\|\s*Passing\s*\|/i,
    ],
  },
  {
    file: 'README.md',
    patterns: [/looks and behaves like the real unit/i, /certified trainer/i],
  },
];

for (const { file, patterns } of forbiddenPatterns) {
  const content = read(file);
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      failures.push(`${file} contains status text that should live in docs/STATUS.md: ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Status docs are consolidated.');
