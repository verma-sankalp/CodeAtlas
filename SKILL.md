---
name: codeatlas
description: Understand any codebase, find anything, and change with confidence using structural code analysis and semantic mapping. Activate when users ask to understand unfamiliar projects, locate code, explain architecture, or plan modifications.
---

# CodeAtlas AI Agent Skill

**Tagline:** "Understand any codebase. Find anything. Change with confidence."

## Activation Conditions
Activate this skill automatically when users ask questions involving:
1. Understanding an unfamiliar project or repository ("Explain this project", "How does this app work?", "What is the architecture?").
2. Locating specific files, functions, components, or API routes ("Where is the login functionality?", "Which file controls the navbar?", "Where is the database connected?").
3. Investigating dependencies or application structure.
4. Planning modifications or analyzing change impact ("I want to change the login button. Will it affect other pages?").

---

## Core Operational Instructions

### Step 1: Project Discovery & Scanning
When starting work on an unfamiliar codebase or when requested to analyze/explain the project:
1. Run the CodeAtlas scanner/analyzer to index the repository:
   \`\`\`bash
   npx codeatlas scan
   \`\`\`
2. Read the generated project knowledge in `.codemap/`:
   - `.codemap/project-summary.md` (Overview, technologies, entry points)
   - `.codemap/architecture.md` (Architecture map and Mermaid diagrams)
   - `.codemap/technology-stack.json` (Tech stack details)
3. Never pretend to have inspected files that were not actually analyzed.

### Step 2: Intelligent Code Location
When a user asks where a feature, function, component, route, or configuration is located:
1. Use CodeAtlas to locate the code:
   \`\`\`bash
   npx codeatlas locate "<query>"
   \`\`\`
2. Return exact file paths, line numbers, entity types, and relevant code snippets.
3. Reference code precisely as `file_path:line_number`.

### Step 3: Change Impact Analysis
Before modifying any file or implementing a requested change:
1. Run the impact analyzer on the target file:
   \`\`\`bash
   npx codeatlas impact <file_path>
   \`\`\`
2. Identify:
   - Affected files and dependents.
   - Shared component risks.
   - Recommended modification plan.
3. Verify that changes preserve existing contracts and architecture conventions.

---

## Safety & Reliability Rules
- **Never modify source files** without explicit user permission.
- **Never delete project files.**
- **Never expose API keys, passwords, or secrets** in generated documentation or responses.
- **Distinguish verified findings** from inferred relationships.
- **Verify file paths** before recommending modifications.
