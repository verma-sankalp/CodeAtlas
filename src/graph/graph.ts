import { ParseResult } from '../parsers/parser.js';

export interface DependencyNode {
  file: string;
  imports: string[];
  exports: string[];
  referencedBy: string[];
  references: string[];
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();

  public build(parseResults: ParseResult[]): void {
    // Initialize nodes
    for (const res of parseResults) {
      this.nodes.set(res.file, {
        file: res.file,
        imports: res.imports,
        exports: res.exports,
        referencedBy: [],
        references: []
      });
    }

    // Resolve references between files
    for (const res of parseResults) {
      const node = this.nodes.get(res.file);
      if (!node) continue;

      for (const imp of res.imports) {
        // Try to match import string to other files
        for (const otherRes of parseResults) {
          if (res.file === otherRes.file) continue;

          const baseName = otherRes.file.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
          if (imp.includes(baseName) || imp.includes(otherRes.file)) {
            if (!node.references.includes(otherRes.file)) {
              node.references.push(otherRes.file);
            }
            const otherNode = this.nodes.get(otherRes.file);
            if (otherNode && !otherNode.referencedBy.includes(res.file)) {
              otherNode.referencedBy.push(res.file);
            }
          }
        }
      }
    }
  }

  public getGraphData(): Record<string, DependencyNode> {
    const obj: Record<string, DependencyNode> = {};
    for (const [k, v] of this.nodes.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  public generateMermaidDiagram(): string {
    let mermaid = 'graph TD\n';
    const addedEdges = new Set<string>();

    for (const [file, node] of this.nodes.entries()) {
      const cleanName = file.replace(/[^a-zA-Z0-9_]/g, '_');
      mermaid += `  ${cleanName}["${file}"]\n`;

      for (const ref of node.references) {
        const cleanRef = ref.replace(/[^a-zA-Z0-9_]/g, '_');
        const edgeKey = `${cleanName}-->${cleanRef}`;
        if (!addedEdges.has(edgeKey)) {
          addedEdges.add(edgeKey);
          mermaid += `  ${cleanName} --> ${cleanRef}\n`;
        }
      }
    }

    if (addedEdges.size === 0) {
      // Fallback if few references detected
      for (const [file] of this.nodes.entries()) {
        const cleanName = file.replace(/[^a-zA-Z0-9_]/g, '_');
        mermaid += `  root --> ${cleanName}\n`;
      }
    }

    return mermaid;
  }
}
