import { DependencyGraph } from '../graph/graph.js';
import { ParseResult } from '../parsers/parser.js';

export interface ImpactReport {
  targetPath: string;
  affectedFiles: string[];
  dependents: string[];
  sharedComponentRisk: boolean;
  recommendedSteps: string[];
  testsToCheck: string[];
}

export class ImpactAnalyzer {
  private graph: DependencyGraph;
  private parseResults: ParseResult[];

  constructor(graph: DependencyGraph, parseResults: ParseResult[]) {
    this.graph = graph;
    this.parseResults = parseResults;
  }

  public analyze(targetPath: string): ImpactReport {
    const graphData = this.graph.getGraphData();
    const normalizedTarget = targetPath.split('\\').join('/');
    const node = graphData[normalizedTarget] || Object.values(graphData).find(n => n.file.includes(normalizedTarget));

    const affectedFiles: string[] = [];
    const dependents: string[] = [];

    if (node) {
      affectedFiles.push(node.file);
      dependents.push(...node.referencedBy);

      // Recursive dependents
      const queue = [...node.referencedBy];
      const visited = new Set<string>([node.file, ...node.referencedBy]);

      while (queue.length > 0) {
        const current = queue.shift()!;
        const currNode = graphData[current];
        if (currNode) {
          for (const refBy of currNode.referencedBy) {
            if (!visited.has(refBy)) {
              visited.add(refBy);
              dependents.push(refBy);
              queue.push(refBy);
            }
          }
        }
      }
    } else {
      affectedFiles.push(normalizedTarget);
    }

    const sharedComponentRisk = dependents.length > 3 || normalizedTarget.includes('common') || normalizedTarget.includes('shared') || normalizedTarget.includes('components/');

    const recommendedSteps: string[] = [
      `1. Inspect target file: ${normalizedTarget}`,
      `2. Review ${dependents.length} dependent file(s) that import or rely on this target.`,
      `3. Make targeted changes ensuring interface contracts and exports remain intact.`,
      `4. Run unit tests and verification checks before committing.`
    ];

    const testsToCheck = this.parseResults
      .map(r => r.file)
      .filter(f => f.includes('test') || f.includes('spec'))
      .slice(0, 5);

    return {
      targetPath: normalizedTarget,
      affectedFiles: Array.from(new Set(affectedFiles)),
      dependents: Array.from(new Set(dependents)),
      sharedComponentRisk,
      recommendedSteps,
      testsToCheck
    };
  }
}
