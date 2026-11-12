import { ParseResult, CodeEntity } from '../parsers/parser.js';

export interface LocationResult {
  query: string;
  matches: {
    file: string;
    entity: CodeEntity;
    score: number;
  }[];
}

export class Locator {
  private parseResults: ParseResult[];

  constructor(parseResults: ParseResult[]) {
    this.parseResults = parseResults;
  }

  public locate(query: string): LocationResult {
    const lowerQuery = query.toLowerCase().trim();
    const keywords = lowerQuery.split(/\s+/);
    const matches: { file: string; entity: CodeEntity; score: number }[] = [];

    for (const res of this.parseResults) {
      for (const entity of res.entities) {
        let score = 0;
        const entityNameLower = entity.name.toLowerCase();
        const snippetLower = (entity.snippet || '').toLowerCase();
        const fileLower = res.file.toLowerCase();

        // Exact name match
        if (entityNameLower === lowerQuery || entityNameLower.includes(lowerQuery)) {
          score += 50;
        }

        // Keyword matches in entity name, file path or snippet
        for (const kw of keywords) {
          if (entityNameLower.includes(kw)) score += 20;
          if (fileLower.includes(kw)) score += 10;
          if (snippetLower.includes(kw)) score += 5;
        }

        // Semantic intent matching
        if (lowerQuery.includes('login') || lowerQuery.includes('auth')) {
          if (entityNameLower.includes('login') || entityNameLower.includes('auth') || entityNameLower.includes('signin') || fileLower.includes('auth') || fileLower.includes('login')) {
            score += 40;
          }
        }
        if (lowerQuery.includes('nav') || lowerQuery.includes('navbar') || lowerQuery.includes('header')) {
          if (entityNameLower.includes('nav') || entityNameLower.includes('header') || fileLower.includes('nav')) {
            score += 40;
          }
        }
        if (lowerQuery.includes('database') || lowerQuery.includes('db') || lowerQuery.includes('connection')) {
          if (entityNameLower.includes('db') || entityNameLower.includes('connect') || fileLower.includes('db') || fileLower.includes('database')) {
            score += 40;
          }
        }
        if (lowerQuery.includes('dashboard') || lowerQuery.includes('home')) {
          if (entityNameLower.includes('dashboard') || entityNameLower.includes('home') || fileLower.includes('dashboard')) {
            score += 40;
          }
        }

        if (score > 0) {
          matches.push({
            file: res.file,
            entity,
            score
          });
        }
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return {
      query,
      matches: matches.slice(0, 15) // top 15 matches
    };
  }
}
