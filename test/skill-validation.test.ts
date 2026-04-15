import { describe, test, expect } from 'bun:test';
import { validateSkill } from './helpers/skill-parser';
import { ALL_COMMANDS, COMMAND_DESCRIPTIONS, READ_COMMANDS, WRITE_COMMANDS, META_COMMANDS } from '../browse/src/commands';
import { SNAPSHOT_FLAGS } from '../browse/src/snapshot';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(import.meta.dir, '..');

// ─── Generated skill validation ──────────────────────────────

describe('SKILL.md command validation', () => {
  test('all $B commands in SKILL.md are valid browse commands', () => {
    const result = validateSkill(path.join(ROOT, 'SKILL.md'));
    expect(result.invalid).toHaveLength(0);
    expect(result.valid.length).toBeGreaterThan(0);
  });

  test('all snapshot flags in SKILL.md are valid', () => {
    const result = validateSkill(path.join(ROOT, 'SKILL.md'));
    expect(result.snapshotFlagErrors).toHaveLength(0);
  });

  test('all $B commands in browse/SKILL.md are valid browse commands', () => {
    const result = validateSkill(path.join(ROOT, 'browse', 'SKILL.md'));
    expect(result.invalid).toHaveLength(0);
    expect(result.valid.length).toBeGreaterThan(0);
  });

  test('all snapshot flags in browse/SKILL.md are valid', () => {
    const result = validateSkill(path.join(ROOT, 'browse', 'SKILL.md'));
    expect(result.snapshotFlagErrors).toHaveLength(0);
  });
});

// ─── 7-Agent sprint stack validation ─────────────────────────

const SPRINT_AGENTS = ['interrogator', 'architect', 'maker', 'auditor', 'breaker', 'releaser', 'archivist'];

describe('7-agent sprint stack', () => {
  test('all 7 agent SKILL.md files exist', () => {
    for (const agent of SPRINT_AGENTS) {
      const skillPath = path.join(ROOT, agent, 'SKILL.md');
      expect(fs.existsSync(skillPath)).toBe(true);
    }
  });

  test('all 7 agent skills have a role and phases', () => {
    for (const agent of SPRINT_AGENTS) {
      const content = fs.readFileSync(path.join(ROOT, agent, 'SKILL.md'), 'utf-8');
      expect(content).toContain(`/${agent}`);
      expect(content.length).toBeGreaterThan(500);
    }
  });

  test('breaker skill references browse binary setup', () => {
    const content = fs.readFileSync(path.join(ROOT, 'breaker', 'SKILL.md'), 'utf-8');
    expect(content).toContain('browse');
    expect(content).toContain('_B');
  });

  test('all $B commands in breaker/SKILL.md are valid browse commands', () => {
    const result = validateSkill(path.join(ROOT, 'breaker', 'SKILL.md'));
    expect(result.invalid).toHaveLength(0);
  });

  test('interrogator has six forcing questions', () => {
    const content = fs.readFileSync(path.join(ROOT, 'interrogator', 'SKILL.md'), 'utf-8');
    expect(content).toContain('Q1');
    expect(content).toContain('Q6');
  });

  test('architect has approval gate', () => {
    const content = fs.readFileSync(path.join(ROOT, 'architect', 'SKILL.md'), 'utf-8');
    expect(content.toLowerCase()).toContain('approval');
    expect(content.toLowerCase()).toContain('blueprint');
  });

  test('auditor has critical pass categories', () => {
    const content = fs.readFileSync(path.join(ROOT, 'auditor', 'SKILL.md'), 'utf-8');
    expect(content.toLowerCase()).toContain('sql');
    expect(content.toLowerCase()).toContain('injection');
  });

  test('releaser is non-interactive', () => {
    const content = fs.readFileSync(path.join(ROOT, 'releaser', 'SKILL.md'), 'utf-8');
    expect(content.toLowerCase()).toContain('non-interactive');
    expect(content.toLowerCase()).toContain('patch');
  });

  test('sprint stack order is documented in AGENTS.md', () => {
    const agents = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf-8');
    for (const agent of SPRINT_AGENTS) {
      expect(agents).toContain(`/${agent}`);
    }
  });
});

// ─── Command registry consistency ────────────────────────────

describe('Command registry consistency', () => {
  test('COMMAND_DESCRIPTIONS covers all commands in sets', () => {
    const allCmds = new Set([...READ_COMMANDS, ...WRITE_COMMANDS, ...META_COMMANDS]);
    const descKeys = new Set(Object.keys(COMMAND_DESCRIPTIONS));
    for (const cmd of allCmds) {
      expect(descKeys.has(cmd)).toBe(true);
    }
  });

  test('COMMAND_DESCRIPTIONS has no extra commands not in sets', () => {
    const allCmds = new Set([...READ_COMMANDS, ...WRITE_COMMANDS, ...META_COMMANDS]);
    for (const key of Object.keys(COMMAND_DESCRIPTIONS)) {
      expect(allCmds.has(key)).toBe(true);
    }
  });

  test('ALL_COMMANDS matches union of all sets', () => {
    const union = new Set([...READ_COMMANDS, ...WRITE_COMMANDS, ...META_COMMANDS]);
    expect(ALL_COMMANDS.size).toBe(union.size);
    for (const cmd of union) {
      expect(ALL_COMMANDS.has(cmd)).toBe(true);
    }
  });

  test('SNAPSHOT_FLAGS option keys are valid SnapshotOptions fields', () => {
    const validKeys = new Set([
      'interactive', 'compact', 'depth', 'selector',
      'diff', 'annotate', 'outputPath', 'cursorInteractive',
      'heatmap',
    ]);
    for (const flag of SNAPSHOT_FLAGS) {
      expect(validKeys.has(flag.optionKey)).toBe(true);
    }
  });
});

// ─── Generated SKILL.md freshness ────────────────────────────

describe('Generated SKILL.md freshness', () => {
  test('no unresolved {{placeholders}} in generated SKILL.md', () => {
    const content = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    const unresolved = content.match(/\{\{\w+\}\}/g);
    expect(unresolved).toBeNull();
  });

  test('no unresolved {{placeholders}} in generated browse/SKILL.md', () => {
    const content = fs.readFileSync(path.join(ROOT, 'browse', 'SKILL.md'), 'utf-8');
    const unresolved = content.match(/\{\{\w+\}\}/g);
    expect(unresolved).toBeNull();
  });

  test('generated SKILL.md has AUTO-GENERATED header', () => {
    const content = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf-8');
    expect(content).toContain('AUTO-GENERATED');
  });
});
