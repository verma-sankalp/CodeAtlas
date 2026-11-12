# GitHub Copilot & Codex Instructions for CodeAtlas

## Core Philosophy
"Understand any codebase. Find anything. Change with confidence."

## Instructions for Copilot / Codex Agents:
1. **Repository Discovery:** When asked to explain or navigate a project, check for `.codemap/` or run `npx codeatlas scan`.
2. **Code Location:** Use `npx codeatlas locate <query>` to find functions, components, and routes.
3. **Change Impact:** Use `npx codeatlas impact <file>` before suggesting modifications to check dependents and risks.
4. **Safety:** Never delete project files or modify source files without user permission.
