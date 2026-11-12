# CodeAtlas Usage Example

This example demonstrates how CodeAtlas analyzes a React/Node.js project.

## 1. Scanning
\`\`\`bash
codeatlas scan ./my-project
\`\`\`
Output: Scans 142 files, detects TypeScript, React, Express, and generates `.codemap/`.

## 2. Locating Code
\`\`\`bash
codeatlas locate "login"
\`\`\`
Output:
- [COMPONENT] LoginForm in src/components/LoginForm.tsx:14
- [ROUTE] /api/login in src/routes/auth.js:42

## 3. Change Impact Analysis
\`\`\`bash
codeatlas impact src/components/Button.tsx
\`\`\`
Output:
- Affected Files: src/components/Button.tsx
- Dependents: 12 files (High shared component risk)
- Recommended Modification Plan: Inspect contract, update props safely, run unit tests.
