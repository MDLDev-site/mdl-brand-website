# docs-generator/

Documentation pack builder — converts Markdown files into a single, styled HTML document with Mermaid diagram rendering.

## Usage

```bash
node docs-generator/build.js
```

Output: `Docs-Output/documentation-pack.html`

## Configuration

### manifest.json

Defines the document structure. Edit `manifest.json` to:
- Set `documentPack.project` — used as the title throughout the HTML pack
- Add files to `sections[].files` arrays — paths relative to `Docs/`

### doc-pack-template.html

HTML template with CSS styling. Uses MDL design tokens:
- Brand blue: `#2F34FE`
- Font: Inter
- Template variables: `{{PROJECT_NAME}}`, `{{GENERATION_DATE}}`, `{{TABLE_OF_CONTENTS}}`, `{{MAIN_CONTENT}}`, `{{TOTAL_SECTIONS}}`, `{{TOTAL_DOCUMENTS}}`

### Mermaid Diagrams

Mermaid code blocks in Markdown are automatically rendered to inline SVG during build. Requires `npx mmdc` (mermaid-cli).

## Dependencies

```bash
cd docs-generator && npm install
```
