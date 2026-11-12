# CodeAtlas Engine Architecture Reference

CodeAtlas is built around a modular pipeline:

1. **Scanner (`src/scanner/`)**: File system traversal with `.gitignore` and ignore list filtering.
2. **Detector (`src/detectors/`)**: Manifest inspection (`package.json`, `requirements.txt`, etc.) and file extension analysis for language and framework identification.
3. **Parser (`src/parsers/`)**: Structured extraction of code entities (functions, classes, React components, API routes) with line numbers and snippets.
4. **Dependency Graph (`src/graph/`)**: Reference resolution and Mermaid diagram generation.
5. **Locator (`src/locator/`)**: Scoring-based natural language query matcher for fast code location.
6. **Impact Analyzer (`src/impact/`)**: Transitive dependent traversal and safety risk assessment.
7. **Knowledge Manager (`src/knowledge/`)**: Persistence layer for `.codemap/` insights.
