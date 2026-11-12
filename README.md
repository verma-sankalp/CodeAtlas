# CodeAtlas 🗺️

> **Understand any codebase. Find anything. Change with confidence.**

CodeAtlas is a powerful AI agent skill and TypeScript analysis engine designed to give developers and AI coding agents a structured, deep understanding of unfamiliar codebases **before** modifying files.

---

## 🚀 Core Philosophy
> *"Understand your codebase before changing it."*

When jumping into a new or sprawling repository, developers and AI agents often waste time searching manually across hundreds of files. CodeAtlas scans, parses, indexes, and maps the entire codebase into a structured knowledge directory (`.codemap/`), enabling instant code location, architecture visualization, and change impact analysis.

---

## ✨ Key Capabilities

1. **Project Understanding & Scanning**
   - Automatically detects programming languages, frameworks (React, Next.js, Express, FastAPI, Django, Spring Boot, etc.), entry points, and manifests.
   - Respects `.gitignore` and ignores generated/build artifacts.

2. **Architecture Mapping**
   - Generates comprehensive architecture summaries and **Mermaid dependency diagrams**.

3. **Intelligent File Finder & Code Locator**
   - Natural language queries ("Where is the login functionality?", "Which file controls the navbar?").
   - Returns exact file paths, line numbers, entity types (functions, React components, classes, API routes), and code snippets.

4. **Change Impact Analyzer**
   - Pre-modification impact assessment.
   - Identifies dependent files, shared component risks, and generates a step-by-step modification plan.

5. **AI Agent Integration (`SKILL.md`)**
   - Seamlessly plugs into AI coding agents supporting the `SKILL.md` convention for autonomous repository navigation and safe editing.

---

## 📦 Installation

### 1. From GitHub / Local Clone
```bash
git clone https://github.com/verma-sankalp/CodeAtlas.git
cd CodeAtlas
npm install
npm run build
```

### 2. Global CLI Installation (Optional)
```bash
npm link
```

---

## 🌐 Universal AI Agent Compatibility

CodeAtlas is built as a **universal agent skill** compatible across all major AI coding agents and assistants:

- **Claude Code / Claude Desktop (`SKILL.md`)**: Automatically activates when placed in project roots or agent skill directories.
- **Cursor / Windsurf (`.cursorrules`)**: Instructs AI IDE agents to scan repositories, locate code, and analyze impact before modifying files.
- **GitHub Copilot / Codex (`.github/copilot-instructions.md`)**: Guides Copilot Workspace and Codex agents to utilize `.codemap/` structured knowledge.
- **Roo Code / Aider / Custom Agents**: CLI tool (`codeatlas scan`, `codeatlas locate`, `codeatlas impact`) can be invoked programmatically or via terminal commands by any agentic workflow.

---

## 🛠️ Usage

### Scan a Repository
Scan your project to generate the `.codemap/` knowledge base:
```bash
codeatlas scan [path]
```

### Locate Code
Find functions, components, or API routes using natural language:
```bash
codeatlas locate "login"
codeatlas locate "navbar"
```

### Analyze Change Impact
Check dependents and risks before modifying a file:
```bash
codeatlas impact src/components/Header.tsx
```

### Explain Project Architecture
Print project summary and architecture overview:
```bash
codeatlas explain
```

### Detect Dead Code & Orphans
Scan for unreferenced files and technical debt:
```bash
codeatlas deadcode
```

### Generate Automated Documentation Site
Create a fully formatted Markdown wiki site in `/docs`:
```bash
codeatlas docs
```

---

## 📂 Project Structure

``` 
CodeAtlas/
├── SKILL.md              # AI Agent skill definition
├── README.md             # Documentation
├── LICENSE               # MIT License
├── package.json          # Dependencies & build scripts
├── tsconfig.json         # TypeScript configuration
├── bin/                  # CLI binary wrapper
├── src/
│   ├── scanner/          # File system scanner & gitignore filter
│   ├── detectors/        # Language & framework detector
│   ├── parsers/          # AST & code entity extractor
│   ├── graph/            # Dependency graph & Mermaid generator
│   ├── locator/          # Intelligent code finder
│   ├── impact/           # Change impact analyzer
│   ├── knowledge/        # .codemap/ knowledge manager
│   ├── utils/            # Shared utilities
│   └── cli.ts            # Command-line interface
├── references/           # Reference materials & guides
├── examples/             # Example output & projects
└── tests/                # Test suite
```

---

## 🛡️ Safety & Reliability
- **Never modifies source files** without explicit user permission.
- **Never deletes project files.**
- **Never exposes API keys or secrets** in generated documentation.
- **Distinguishes verified findings** from inferred relationships.

---

## 📄 License
MIT License © 2026 Sankalp Verma.
