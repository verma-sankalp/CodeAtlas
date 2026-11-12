import * as fs from 'fs';
import * as path from 'path';
import ignore from 'ignore';

export interface ScannedFile {
  absolutePath: string;
  relativePath: string;
  extension: string;
  size: number;
  mtime: number;
}

export interface ScannerOptions {
  rootDir: string;
  maxFileSize?: number; // bytes, default 1MB
  customIgnores?: string[];
}

const DEFAULT_IGNORES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.output',
  'vendor',
  '.codemap',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.DS_Store',
  'Thumbs.db'
];

export class Scanner {
  private rootDir: string;
  private maxFileSize: number;
  private ig: ReturnType<typeof ignore>;

  constructor(options: ScannerOptions) {
    this.rootDir = path.resolve(options.rootDir);
    this.maxFileSize = options.maxFileSize || 1024 * 1024; // 1MB default
    this.ig = ignore();
    this.ig.add(DEFAULT_IGNORES);

    if (options.customIgnores) {
      this.ig.add(options.customIgnores);
    }

    this.loadGitignore();
  }

  private loadGitignore(): void {
    const gitignorePath = path.join(this.rootDir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      try {
        const content = fs.readFileSync(gitignorePath, 'utf8');
        this.ig.add(content);
      } catch (err) {
        // ignore error reading gitignore
      }
    }
  }

  public scan(): ScannedFile[] {
    const results: ScannedFile[] = [];
    this.walk(this.rootDir, '', results);
    return results;
  }

  private walk(currentDir: string, relativeCurrentDir: string, results: ScannedFile[]): void {
    let entries: string[];
    try {
      entries = fs.readdirSync(currentDir);
    } catch (err) {
      return;
    }

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry);
      const relativePath = relativeCurrentDir ? path.join(relativeCurrentDir, entry) : entry;
      const normalizedRelativePath = relativePath.split(path.sep).join('/');

      // Check ignore
      if (this.ig.ignores(normalizedRelativePath)) {
        continue;
      }

      let stats: fs.Stats;
      try {
        stats = fs.statSync(absolutePath);
      } catch (err) {
        continue;
      }

      if (stats.isDirectory()) {
        this.walk(absolutePath, relativePath, results);
      } else if (stats.isFile()) {
        if (stats.size > this.maxFileSize) {
          // Skip oversized files
          continue;
        }

        const ext = path.extname(entry).toLowerCase();
        results.push({
          absolutePath,
          relativePath: normalizedRelativePath,
          extension: ext,
          size: stats.size,
          mtime: stats.mtimeMs
        });
      }
    }
  }
}
