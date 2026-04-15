import { describe, test, expect } from 'bun:test';
import { COMMAND_DESCRIPTIONS } from '../browse/src/commands';
import { SNAPSHOT_FLAGS } from '../browse/src/snapshot';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(import.meta.dir, '..');
const MAX_SKILL_DESCRIPTION_LENGTH = 1024;

function extractDescription(content: string): string {
  const fmEnd = content.indexOf('\n---', 4);
  if (fmEnd < 0) return '';
  const frontmatter = content.slice(4, fmEnd);
  for (const line of frontmatter.split('\n')) {
    if (line.match(/^description:\s*\S/)) return line.replace(/^description:\s*/, '').trim();
  }
  return '';
}

describe('gen-skill-docs', () => {
  test('generated SKILL.md contains all command categories', () => {
    const content = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    const categories = new Set(Object.values(COMMAND_DESCRIPTIONS).map(d => d.category));
    for (const cat of categories) {
      expect(content).toContain(`### ${cat}`);
    }
  });

  test('generated SKILL.md contains all commands', () => {
    const content = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    for (const [cmd, meta] of Object.entries(COMMAND_DESCRIPTIONS)) {
      const display = meta.usage || cmd;
      expect(content).toContain(display);
    }
  });

  test('generated header is present in SKILL.md', () => {
    const content = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    expect(content).toContain('AUTO-GENERATED from SKILL.md.tmpl');
    expect(content).toContain('Regenerate: bun run gen:skill-docs');
  });

  test('generated header is present in browse/SKILL.md', () => {
    const content = fs.readFileSync(path.join(ROOT, 'browse', 'SKILL.md'), 'utf-8');
    expect(content).toContain('AUTO-GENERATED from SKILL.md.tmpl');
  });

  test('snapshot flags section contains all flags', () => {
    const content = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    for (const flag of SNAPSHOT_FLAGS) {
      expect(content).toContain(flag.short);
      expect(content).toContain(flag.description);
    }
  });

  test('every generated SKILL.md has valid YAML frontmatter', () => {
    for (const file of ['SKILL.md', path.join('browse', 'SKILL.md')]) {
      const content = fs.readFileSync(path.join(ROOT, file), 'utf-8').replace(/\r\n/g, '\n');
      expect(content.startsWith('---\n')).toBe(true);
      expect(content).toContain('name:');
      expect(content).toContain('description:');
    }
  });

  test('SKILL.md description stays within length limit', () => {
    const content = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    const description = extractDescription(content);
    expect(description.length).toBeLessThanOrEqual(MAX_SKILL_DESCRIPTION_LENGTH);
  });

  test('package.json version matches VERSION file', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
    const version = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf-8').trim();
    expect(pkg.version).toBe(version);
  });

  test('generated files are fresh (match --dry-run)', () => {
    const result = Bun.spawnSync(['bun', 'run', 'scripts/gen-skill-docs.ts', '--dry-run'], {
      cwd: ROOT,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString();
    expect(output).toContain('FRESH: SKILL.md');
    expect(output).not.toContain('STALE');
  });

  test('no unresolved placeholders in generated files', () => {
    for (const file of ['SKILL.md', path.join('browse', 'SKILL.md')]) {
      const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
      const unresolved = content.match(/\{\{[A-Z_]+\}\}/g);
      expect(unresolved).toBeNull();
    }
  });

  test('templates contain required placeholders', () => {
    const rootTmpl = fs.readFileSync(path.join(ROOT, 'SKILL.md.tmpl'), 'utf-8');
    expect(rootTmpl).toContain('{{COMMAND_REFERENCE}}');
    expect(rootTmpl).toContain('{{PREAMBLE}}');

    const browseTmpl = fs.readFileSync(path.join(ROOT, 'browse', 'SKILL.md.tmpl'), 'utf-8');
    expect(browseTmpl).toContain('{{COMMAND_REFERENCE}}');
    expect(browseTmpl).toContain('{{PREAMBLE}}');
  });
});

describe('no compiled binaries in git', () => {
  test('git tracks no Mach-O or ELF binaries', () => {
    const result = Bun.spawnSync(
      ['git', 'ls-files', '-z', 'browse/dist', 'design/dist'],
      { cwd: ROOT, stdout: 'pipe' }
    );
    const files = result.stdout.toString().split('\0').filter(Boolean);
    expect(files.filter(f => !f.endsWith('.version'))).toHaveLength(0);
  });

  test('git tracks no files larger than 2MB', () => {
    const result = Bun.spawnSync(
      ['git', 'ls-files', '--error-unmatch', '-z'],
      { cwd: ROOT, stdout: 'pipe', stderr: 'pipe' }
    );
    const files = result.stdout.toString().split('\0').filter(Boolean);
    const oversized = files.filter(f => {
      try {
        return fs.statSync(path.join(ROOT, f)).size > 2 * 1024 * 1024;
      } catch {
        return false;
      }
    });
    expect(oversized).toHaveLength(0);
  });
});
