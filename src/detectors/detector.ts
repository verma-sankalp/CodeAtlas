import * as fs from 'fs';
import * as path from 'path';
import { ScannedFile } from '../scanner/scanner.js';

export interface ProjectProfile {
  languages: string[];
  frameworks: string[];
  entryPoints: string[];
  manifests: string[];
  directories: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    tests?: string[];
    config?: string[];
  };
}

export class Detector {
  private rootDir: string;
  private files: ScannedFile[];

  constructor(rootDir: string, files: ScannedFile[]) {
    this.rootDir = path.resolve(rootDir);
    this.files = files;
  }

  public detect(): ProjectProfile {
    const languagesSet = new Set<string>();
    const frameworksSet = new Set<string>();
    const entryPoints: string[] = [];
    const manifests: string[] = [];

    const frontendDirs: string[] = [];
    const backendDirs: string[] = [];
    const dbDirs: string[] = [];
    const testDirs: string[] = [];
    const configDirs: string[] = [];

    // Check file extensions for languages
    const extMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript (React)',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript (React)',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.rs': 'Rust',
      '.c': 'C',
      '.cpp': 'C++',
      '.cs': 'C#',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sql': 'SQL'
    };

    for (const file of this.files) {
      if (extMap[file.extension]) {
        languagesSet.add(extMap[file.extension]);
      }

      // Detect entry points
      const lowerName = path.basename(file.relativePath).toLowerCase();
      if (
        ['index.js', 'index.ts', 'main.py', 'app.py', 'server.js', 'server.ts', 'main.go', 'main.java', 'pom.xml', 'manage.py'].includes(lowerName) ||
        file.relativePath === 'src/index.ts' || file.relativePath === 'src/main.ts' || file.relativePath === 'src/App.tsx'
      ) {
        entryPoints.push(file.relativePath);
      }

      // Detect manifests
      if (
        ['package.json', 'requirements.txt', 'pyproject.toml', 'pom.xml', 'build.gradle', 'go.mod', 'composer.json', 'cargo.toml', 'dockerfile', 'docker-compose.yml'].includes(lowerName)
      ) {
        manifests.push(file.relativePath);
      }

      // Categorize directories / file paths
      const segments = file.relativePath.split('/');
      if (segments.length > 1) {
        const topDir = segments[0].toLowerCase();
        if (['components', 'pages', 'app', 'views', 'public', 'src/components', 'frontend'].includes(topDir) || segments.includes('components')) {
          if (!frontendDirs.includes(topDir)) frontendDirs.push(topDir);
        }
        if (['controllers', 'routes', 'models', 'services', 'api', 'backend', 'server'].includes(topDir) || segments.includes('controllers') || segments.includes('routes')) {
          if (!backendDirs.includes(topDir)) backendDirs.push(topDir);
        }
        if (['db', 'database', 'migrations', 'prisma', 'models'].includes(topDir)) {
          if (!dbDirs.includes(topDir)) dbDirs.push(topDir);
        }
        if (['tests', '__tests__', 'test', 'spec'].includes(topDir) || segments.includes('test') || segments.includes('tests')) {
          if (!testDirs.includes(topDir)) testDirs.push(topDir);
        }
        if (['config', 'configs', '.github'].includes(topDir)) {
          if (!configDirs.includes(topDir)) configDirs.push(topDir);
        }
      }
    }

    // Inspect package.json if present
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkgContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...(pkgContent.dependencies || {}), ...(pkgContent.devDependencies || {}) };

        if (deps['react']) frameworksSet.add('React');
        if (deps['next']) frameworksSet.add('Next.js');
        if (deps['express']) frameworksSet.add('Express');
        if (deps['vue']) frameworksSet.add('Vue.js');
        if (deps['@angular/core']) frameworksSet.add('Angular');
        if (deps['fastify']) frameworksSet.add('Fastify');
        if (deps['nest'] || deps['@nestjs/core']) frameworksSet.add('NestJS');
        if (deps['tailwindcss']) frameworksSet.add('Tailwind CSS');
        if (deps['prisma'] || deps['@prisma/client']) frameworksSet.add('Prisma');
        if (deps['mongoose']) frameworksSet.add('Mongoose');
      } catch (e) {
        // ignore parse error
      }
    }

    // Inspect requirements.txt or pyproject.toml
    const reqPath = path.join(this.rootDir, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      try {
        const reqContent = fs.readFileSync(reqPath, 'utf8').toLowerCase();
        if (reqContent.includes('django')) frameworksSet.add('Django');
        if (reqContent.includes('fastapi')) frameworksSet.add('FastAPI');
        if (reqContent.includes('flask')) frameworksSet.add('Flask');
        if (reqContent.includes('sqlalchemy')) frameworksSet.add('SQLAlchemy');
      } catch (e) {}
    }

    // Inspect pom.xml or build.gradle
    const pomPath = path.join(this.rootDir, 'pom.xml');
    if (fs.existsSync(pomPath)) {
      frameworksSet.add('Spring Boot');
    }

    // Inspect go.mod
    const goModPath = path.join(this.rootDir, 'go.mod');
    if (fs.existsSync(goModPath)) {
      frameworksSet.add('Go Modules');
    }

    // Determine languages array
    const languages = Array.from(languagesSet);
    if (languages.length === 0) {
      languages.push('Unknown / Generic');
    }

    return {
      languages,
      frameworks: Array.from(frameworksSet),
      entryPoints,
      manifests,
      directories: {
        frontend: frontendDirs.length ? frontendDirs : undefined,
        backend: backendDirs.length ? backendDirs : undefined,
        database: dbDirs.length ? dbDirs : undefined,
        tests: testDirs.length ? testDirs : undefined,
        config: configDirs.length ? configDirs.includes('.github') ? ['.github'] : undefined : undefined
      }
    };
  }
}
