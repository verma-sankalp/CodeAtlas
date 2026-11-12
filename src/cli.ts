import * as path from 'path';
import { Scanner } from './scanner/scanner.js';
import { Detector } from './detectors/detector.js';
import { Parser, ParseResult } from './parsers/parser.js';
import { DependencyGraph } from './graph/graph.js';
import { Locator } from './locator/locator.js';
import { ImpactAnalyzer } from './impact/impact.js';
import { KnowledgeManager } from './knowledge/knowledge.js';

function printHelp() {
  console.log(`
CodeAtlas — Understand any codebase. Find anything. Change with confidence.

Usage:
  codeatlas scan [dir]               Scan repository and generate .codemap/ knowledge
  codeatlas locate <query> [dir]     Find files or code entities matching query
  codeatlas impact <file> [dir]      Analyze impact of changing a specific file
  codeatlas explain [dir]            Print project summary and architecture overview
  codeatlas help                     Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const targetDir = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();

  switch (command) {
    case 'scan': {
      console.log(`🔍 Scanning repository at ${targetDir}...`);
      const scanner = new Scanner({ rootDir: targetDir });
      const files = scanner.scan();
      console.log(`📂 Found ${files.length} files.`);

      console.log(`🔎 Detecting languages and frameworks...`);
      const detector = new Detector(targetDir, files);
      const profile = detector.detect();
      console.log(`✨ Languages: ${profile.languages.join(', ')}`);
      console.log(`✨ Frameworks: ${profile.frameworks.join(', ') || 'None'}`);

      console.log(`⚙️ Parsing source files & building dependency graph...`);
      const parser = new Parser();
      const parseResults: ParseResult[] = files.map(f => parser.parseFile(f));
      const graph = new DependencyGraph();
      graph.build(parseResults);

      console.log(`💾 Saving knowledge to .codemap/...`);
      const km = new KnowledgeManager(targetDir);
      km.saveKnowledge(files, profile, parseResults, graph);

      console.log(`✅ CodeAtlas scan complete! Knowledge saved in .codemap/`);
      break;
    }
    case 'locate': {
      const query = args[1];
      if (!query) {
        console.error('❌ Error: Please specify a search query.');
        process.exit(1);
      }
      const scanDir = args[2] || targetDir;
      const scanner = new Scanner({ rootDir: scanDir });
      const files = scanner.scan();
      const parser = new Parser();
      const parseResults = files.map(f => parser.parseFile(f));
      const locator = new Locator(parseResults);
      const result = locator.locate(query);

      console.log(`\n🎯 Search results for "${query}":`);
      if (result.matches.length === 0) {
        console.log('  No matching code entities found.');
      } else {
        for (const m of result.matches) {
          console.log(`  - [${m.entity.type.toUpperCase()}] ${m.entity.name} in ${m.file}:${m.entity.line}`);
          if (m.entity.snippet) {
            console.log(`    Snippet: ${m.entity.snippet}`);
          }
        }
      }
      break;
    }
    case 'impact': {
      const targetFile = args[1];
      if (!targetFile) {
        console.error('❌ Error: Please specify a target file path.');
        process.exit(1);
      }
      const scanDir = args[2] || targetDir;
      const scanner = new Scanner({ rootDir: scanDir });
      const files = scanner.scan();
      const parser = new Parser();
      const parseResults = files.map(f => parser.parseFile(f));
      const graph = new DependencyGraph();
      graph.build(parseResults);

      const analyzer = new ImpactAnalyzer(graph, parseResults);
      const report = analyzer.analyze(targetFile);

      console.log(`\n⚡ Impact Analysis for ${report.targetPath}:`);
      console.log(`  - Affected Files (${report.affectedFiles.length}): ${report.affectedFiles.join(', ')}`);
      console.log(`  - Dependent Files (${report.dependents.length}): ${report.dependents.join(', ') || 'None'}`);
      console.log(`  - Shared Component Risk: ${report.sharedComponentRisk ? '⚠️ High' : '✅ Low'}`);
      console.log(`\n  Recommended Modification Plan:`);
      for (const step of report.recommendedSteps) {
        console.log(`    ${step}`);
      }
      break;
    }
    case 'explain': {
      const scanDir = targetDir;
      const km = new KnowledgeManager(scanDir);
      if (!km.hasKnowledge()) {
        console.log(`ℹ️ No existing .codemap/ found. Running scan first...`);
        const scanner = new Scanner({ rootDir: scanDir });
        const files = scanner.scan();
        const detector = new Detector(scanDir, files);
        const profile = detector.detect();
        const parser = new Parser();
        const parseResults = files.map(f => parser.parseFile(f));
        const graph = new DependencyGraph();
        graph.build(parseResults);
        km.saveKnowledge(files, profile, parseResults, graph);
      }

      const summaryPath = path.join(scanDir, '.codemap', 'project-summary.md');
      const archPath = path.join(scanDir, '.codemap', 'architecture.md');

      if (path.resolve(scanDir) !== path.resolve(targetDir)) {
        // handled
      }
      const fs = await import('fs');
      if (fs.existsSync(summaryPath)) {
        console.log(fs.readFileSync(summaryPath, 'utf8'));
      }
      if (fs.existsSync(archPath)) {
        console.log('\n' + fs.readFileSync(archPath, 'utf8'));
      }
      break;
    }
    case 'help':
    default:
      printHelp();
      break;
  }
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
