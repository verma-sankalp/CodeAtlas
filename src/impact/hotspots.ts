import { execSync } from 'child_process';
import * as path from 'path';

export interface HotspotResult {
  file: string;
  commits: number;
}

export class HotspotAnalyzer {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir);
  }

  public analyze(limit: number = 10): HotspotResult[] {
    try {
      // Run git log to get modified files across commits
      const stdout = execSync('git log --pretty=format: --name-only -n 200', {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });

      const fileCounts: Record<string, number> = {};
      const lines = stdout.split(/\r?\n/);

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const normalized = trimmed.split(path.sep).join('/');
        fileCounts[normalized] = (fileCounts[normalized] || 0) + 1;
      }

      const sorted = Object.entries(fileCounts)
        .map(([file, commits]) => ({ file, commits }))
        .sort((a, b) => b.commits - a.commits);

      return sorted.slice(0, limit);
    } catch (e) {
      // If git is not initialized or git log fails, return empty
      return [];
    }
  }
}
