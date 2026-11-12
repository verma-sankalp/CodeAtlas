import test from 'node:test';
import assert from 'node:assert';
import * as path from 'path';
import * as fs from 'fs';
import { Scanner } from '../src/scanner/scanner.js';
import { Detector } from '../src/detectors/detector.js';
import { Parser } from '../src/parsers/parser.js';
import { DependencyGraph } from '../src/graph/graph.js';
import { Locator } from '../src/locator/locator.js';
import { ImpactAnalyzer } from '../src/impact/impact.js';

test('CodeAtlas Scanner and Detector test', () => {
  const rootDir = process.cwd();
  const scanner = new Scanner({ rootDir });
  const files = scanner.scan();
  assert.ok(files.length > 0, 'Scanner should find files in the project');

  const detector = new Detector(rootDir, files);
  const profile = detector.detect();
  assert.ok(profile.languages.includes('TypeScript'), 'Should detect TypeScript');
});

test('CodeAtlas Parser and Locator test', () => {
  const sampleFile = {
    absolutePath: __filename,
    relativePath: 'tests/sample.test.ts',
    extension: '.ts',
    size: 100,
    mtime: Date.now()
  };

  const parser = new Parser();
  // Create temporary test file for parsing
  const testFilePath = path.join(process.cwd(), 'tests', 'temp_sample.ts');
  fs.writeFileSync(testFilePath, 'export function loginUser() { return true; }\nexport class AuthManager {}', 'utf8');

  try {
    const fileObj = {
      absolutePath: testFilePath,
      relativePath: 'tests/temp_sample.ts',
      extension: '.ts',
      size: 50,
      mtime: Date.now()
    };
    const parsed = parser.parseFile(fileObj);
    assert.ok(parsed.entities.length >= 1);
    assert.strictEqual(parsed.entities[0].name, 'loginUser');

    const locator = new Locator([parsed]);
    const location = locator.locate('loginUser');
    assert.ok(location.matches.length >= 1);
    assert.ok(location.matches.some(m => m.entity.name === 'loginUser'));
  } finally {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
});
