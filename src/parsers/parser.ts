import * as fs from 'fs';
import * as ts from 'typescript';
import { ScannedFile } from '../scanner/scanner.js';

export interface CodeEntity {
  name: string;
  type: 'function' | 'class' | 'component' | 'interface' | 'route' | 'variable';
  line: number;
  snippet?: string;
  exported: boolean;
}

export interface ParseResult {
  file: string;
  entities: CodeEntity[];
  imports: string[];
  exports: string[];
}

export class Parser {
  public parseFile(file: ScannedFile): ParseResult {
    let content = '';
    try {
      content = fs.readFileSync(file.absolutePath, 'utf8');
    } catch (e) {
      return { file: file.relativePath, entities: [], imports: [], exports: [] };
    }

    const lines = content.split(/\r?\n/);
    const entities: CodeEntity[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    if (file.extension === '.ts' || file.extension === '.tsx' || file.extension === '.js' || file.extension === '.jsx') {
      try {
        this.parseWithTSCompiler(file.relativePath, content, entities, imports, exports);
        if (entities.length > 0 || imports.length > 0) {
          return { file: file.relativePath, entities, imports, exports };
        }
      } catch (e) {
        // Fallback to regex parser if AST fails
      }
    }

    // Fallback or other languages
    if (file.extension === '.py') {
      this.parsePython(lines, entities, imports, exports);
    } else if (file.extension === '.java') {
      this.parseJava(lines, entities, imports, exports);
    } else if (file.extension === '.go') {
      this.parseGo(lines, entities, imports, exports);
    } else {
      this.parseJSOrTSFallback(lines, entities, imports, exports);
    }

    return {
      file: file.relativePath,
      entities,
      imports,
      exports
    };
  }

  private parseWithTSCompiler(filePath: string, content: string, entities: CodeEntity[], imports: string[], exports: string[]): void {
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const isExportedNode = (node: ts.Node): boolean => {
      const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
      return !!mods?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
    };

    const visit = (node: ts.Node) => {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const lineNum = line + 1;
      const text = node.getText(sourceFile);

      // Imports
      if (ts.isImportDeclaration(node)) {
        imports.push(text.trim());
      }

      // Exports
      if (
        ts.isExportDeclaration(node) ||
        ts.isExportAssignment(node) ||
        isExportedNode(node)
      ) {
        exports.push(text.trim().split('\n')[0]);
      }

      // Functions
      if (ts.isFunctionDeclaration(node) && node.name) {
        const name = node.name.text;
        const isComponent = /^[A-Z]/.test(name);
        const isExported = isExportedNode(node);
        entities.push({
          name,
          type: isComponent ? 'component' : 'function',
          line: lineNum,
          snippet: text.split('\n')[0].trim(),
          exported: isExported
        });
      }

      // Classes & Interfaces
      if (ts.isClassDeclaration(node) && node.name) {
        const name = node.name.text;
        const isExported = isExportedNode(node);
        entities.push({
          name,
          type: 'class',
          line: lineNum,
          snippet: text.split('\n')[0].trim(),
          exported: isExported
        });
      }

      if (ts.isInterfaceDeclaration(node) && node.name) {
        const name = node.name.text;
        const isExported = isExportedNode(node);
        entities.push({
          name,
          type: 'interface',
          line: lineNum,
          snippet: text.split('\n')[0].trim(),
          exported: isExported
        });
      }

      // Variable statements (arrow functions / const components)
      if (ts.isVariableStatement(node)) {
        const isExported = isExportedNode(node);
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            const name = declaration.name.text;
            const isArrow = declaration.initializer && (
              ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)
            );
            if (isArrow) {
              const isComponent = /^[A-Z]/.test(name);
              entities.push({
                name,
                type: isComponent ? 'component' : 'function',
                line: lineNum,
                snippet: text.split('\n')[0].trim(),
                exported: !!isExported
              });
            }
          }
        }
      }

      // API Routes (express: app.get / router.post)
      if (ts.isCallExpression(node)) {
        const expr = node.expression;
        if (ts.isPropertyAccessExpression(expr)) {
          const propName = expr.name.text;
          if (['get', 'post', 'put', 'delete', 'patch'].includes(propName)) {
            if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
              const routePath = node.arguments[0].text;
              entities.push({
                name: routePath,
                type: 'route',
                line: lineNum,
                snippet: text.split('\n')[0].trim(),
                exported: false
              });
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  private parseJSOrTSFallback(lines: string[], entities: CodeEntity[], imports: string[], exports: string[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      if (line.trim().startsWith('import ') || line.trim().includes('require(')) imports.push(line.trim());
      if (line.trim().startsWith('export ')) exports.push(line.trim());

      const fnMatch = line.match(/(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(/);
      if (fnMatch) {
        entities.push({
          name: fnMatch[1],
          type: /^[A-Z]/.test(fnMatch[1]) ? 'component' : 'function',
          line: lineNum,
          snippet: line.trim(),
          exported: line.includes('export')
        });
      }
    }
  }

  private parsePython(lines: string[], entities: CodeEntity[], imports: string[], exports: string[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) imports.push(line.trim());
      const defMatch = line.match(/^def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (defMatch) {
        entities.push({ name: defMatch[1], type: 'function', line: lineNum, snippet: line.trim(), exported: !defMatch[1].startsWith('_') });
      }
      const classMatch = line.match(/^class\s+([a-zA-Z0-9_]+)/);
      if (classMatch) {
        entities.push({ name: classMatch[1], type: 'class', line: lineNum, snippet: line.trim(), exported: true });
      }
    }
  }

  private parseJava(lines: string[], entities: CodeEntity[], imports: string[], exports: string[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      if (line.trim().startsWith('import ')) imports.push(line.trim());
      const classMatch = line.match(/(?:public|private|protected)?\s*class\s+([a-zA-Z0-9_]+)/);
      if (classMatch) {
        entities.push({ name: classMatch[1], type: 'class', line: lineNum, snippet: line.trim(), exported: line.includes('public') });
      }
    }
  }

  private parseGo(lines: string[], entities: CodeEntity[], imports: string[], exports: string[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      if (line.includes('"')) imports.push(line.trim());
      const funcMatch = line.match(/^func\s+([a-zA-Z0-9_]+)\s*\(/);
      if (funcMatch) {
        entities.push({ name: funcMatch[1], type: 'function', line: lineNum, snippet: line.trim(), exported: /^[A-Z]/.test(funcMatch[1]) });
      }
    }
  }
}
