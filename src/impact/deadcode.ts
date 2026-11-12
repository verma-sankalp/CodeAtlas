import { DependencyGraph } from '../graph/graph.js';
import { ParseResult } from '../parsers/parser.js';
import { ScannedFile } from '../scanner/scanner.js';

export interface DeadCodeReport {
  orphanFiles: string[];
  unusedExports: { file: string; name: string }[];
}

export class DeadCodeAnalyzer {
  private graph: DependencyGraph;
  private parseResults: ParseResult[];
  private files: ScannedFile[];

  constructor(graph: DependencyGraph, parseResults: ParseResult[], files: ScannedFile[]) {
    this.graph = graph;
    this.parseResults = parseResults;
    this.files = files;
  }

  public analyze(): DeadCodeReport {
    const graphData = this.graph.getGraphData();
    const orphanFiles: string[] = [];
    const unusedExports: { file: string; name: string }[] = [];

    // Identify orphan files (no incoming references)
    for (const [file, node] of Object.entries(graphData)) {
      const lower = file.toLowerCase();
      // Skip entry points, tests, configs, index files
      const isExempt =
        lower.includes('index') ||
        lower.includes('main') ||
        lower.includes('app') ||
        lower.includes('test') ||
        lower.includes('config') ||
        lower.includes('cli') ||
        lower.includes('bin') ||
        lower.endsWith('.json') ||
        lower.endsWith('.md');

      if (!isExempt && node.referencedBy.length === 0) {
        orphanFiles.push(file);
      }
    }

    return {
      orphanFiles,
      unusedExports
    };
  }
}
