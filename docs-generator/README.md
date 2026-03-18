# HDD Documentation Pack Generator

This directory contains the automated build system for generating the **Requirements Documentation Pack**.

## Directory Structure

```
docs-generator/          # Build system (permanent, versioned)
├── package.json        # Dependencies
├── build.js            # Build script
├── manifest.json       # Document organization
├── doc-pack-template.html  # HTML template
└── README.md           # This file

Docs/                   # Source documentation (versioned)
└── *.md               # All markdown files

Docs-Output/            # Generated files (git-ignored, cleared on rebuild)
└── documentation-pack.html  # Generated documentation pack
```

## Quick Start

```bash
# From the docs-generator/ directory:

# 1. Install dependencies (first time only)
npm install

# 2. Generate documentation pack
npm run build

# 3. Open the generated file
# The file will be in: ../Docs-Output/documentation-pack.html
# Open it in your web browser
```

## What This Does

The build script automatically:

1. ✅ **Reads all 76 markdown documents** from the `../Docs` directory
2. ✅ **Organizes them into 13 logical sections** based on `manifest.json`
3. ✅ **Renders all 218+ Mermaid diagrams** as SVG graphics (not code blocks)
4. ✅ **Converts markdown to HTML** with proper formatting
5. ✅ **Generates table of contents** with navigation links
6. ✅ **Combines everything** into a single, professional HTML document
7. ✅ **Provides statistics** on processing and diagram rendering

## Files Overview

### Input Files

- **`manifest.json`** - Defines document order and section structure (76 documents, 13 sections)
- **`doc-pack-template.html`** - HTML template with professional CSS styling
- **`../Docs/*.md`** - Source documentation files (automatically read)

### Build Files

- **`build.js`** - Main build script with Mermaid rendering
- **`package.json`** - Dependencies (`marked`, `@mermaid-js/mermaid-cli`)

### Output Files

- **`documentation-pack.html`** - Final documentation pack (generated)

## Requirements

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

## Detailed Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `marked` - Markdown to HTML converter
- `@mermaid-js/mermaid-cli` - Mermaid diagram renderer (includes `mmdc` command)

### Step 2: Generate Documentation Pack

```bash
npm run build
```

Or directly:
```bash
node build.js
```

**What happens during build:**

1. Reads `manifest.json` to determine document order
2. For each section:
   - Reads all markdown files from `../Docs`
   - Finds all ```mermaid code blocks
   - Converts each to SVG using `mmdc` CLI tool
   - Replaces code blocks with rendered SVG graphics
   - Converts markdown to HTML
3. Generates table of contents with section numbers
4. Combines all sections with the HTML template
5. Outputs `documentation-pack.html`

**Expected output:**
```
🚀 Starting Documentation Pack Generation...

📋 Reading document manifest...
   Found 13 sections

📦 Processing Section: Project Overview & Strategic Decisions
────────────────────────────────────────────────────────────
   📄 Processing: 00-START-HERE.md
   📄 Processing: 00-README.md
   ...

✅ Documentation Pack Generated Successfully!

📊 Generation Statistics:
────────────────────────────────────────────────────────────
   📁 Total Sections: 13
   📄 Total Documents: 76
   🎨 Total Mermaid Diagrams: 218+
   ✓  Successfully Rendered: 218+
   ⚠️  Failed to Render: 0
────────────────────────────────────────────────────────────

💾 Output saved to: \Docs-Output\documentation-pack.html
📏 File size: ~15 MB
```

### Step 3: View the Documentation Pack

Open `documentation-pack.html` in any modern web browser:

- **Chrome / Edge** (Recommended for printing)
- **Firefox**
- **Safari**

The document includes:
- Professional styling and typography
- Clickable table of contents
- All Mermaid diagrams rendered as graphics
- Syntax-highlighted code blocks
- Responsive tables

### Step 4: Convert to PDF (Optional)

**Method 1: Browser Print**
1. Open `documentation-pack.html` in Chrome or Edge
2. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
3. Select "Save as PDF" as destination
4. Adjust settings:
   - Layout: Portrait
   - Margins: Default
   - Background graphics: Enabled
5. Click "Save"

**Method 2: Command Line (Puppeteer)**

If you prefer automated PDF generation:

```bash
# Install puppeteer
npm install puppeteer

# Create simple conversion script (pdf.js):
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${path.join(__dirname, 'documentation-pack.html')}`, {
    waitUntil: 'networkidle0'
  });
  await page.pdf({
    path: 'documentation-pack.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
  });
  await browser.close();
  console.log('✅ PDF generated: documentation-pack.pdf');
})();

# Run it
node pdf.js
```

## Customization

### Modify Document Order

Edit `manifest.json` to change section order or add/remove documents:

```json
{
  "sections": [
    {
      "title": "Your Section Title",
      "description": "Section description",
      "files": [
        "Document-01.md",
        "Document-02.md"
      ]
    }
  ]
}
```

### Modify Styling

Edit `doc-pack-template.html` to customize:
- Colors and branding
- Typography
- Layout and spacing
- Print styles

### Regenerate After Changes

Simply run `npm run build` again. The script will:
- Clear any previous output
- Rebuild from scratch
- Show updated statistics

## Troubleshooting

### Issue: "mmdc: command not found"

**Solution:** Ensure `@mermaid-js/mermaid-cli` is installed:
```bash
npm install
```

### Issue: Diagrams not rendering

**Symptoms:** Mermaid diagrams appear as code blocks instead of graphics

**Solution:**
1. Check that `@mermaid-js/mermaid-cli` is installed
2. Ensure Node.js can execute `npx mmdc`
3. Check build script output for specific diagram errors
4. Run: `npx mmdc --version` to verify installation

### Issue: File not found errors

**Symptoms:** "File not found: Document-Name.md"

**Solution:**
1. Verify the file exists in `../Docs` directory
2. Check the path in `manifest.json` is correct
3. Ensure filename matches exactly (case-sensitive on Linux/Mac)

### Issue: Build is slow

**Reason:** Rendering 218+ Mermaid diagrams takes time (2-5 minutes typically)

**Solution:** This is normal. The script shows progress as it processes each document.

### Issue: Large file size

**Reason:** SVG diagrams embed directly in HTML (increases file size but ensures portability)

**Solution:** This is by design. The single HTML file is self-contained and portable. Expected size: 10-20 MB.

## Project Structure

```
Docs-Output/
├── README.md                     # This file
├── package.json                  # Dependencies
├── manifest.json                 # Document order/structure
├── build.js                      # Build script
├── doc-pack-template.html        # HTML template
└── documentation-pack.html       # Generated output ✨
```

## Statistics

- **Total Sections:** 13
- **Total Documents:** 76
- **Mermaid Diagrams:** 218+
- **Approximate Build Time:** 2-5 minutes
- **Output File Size:** ~15 MB

## Support

For issues or questions:
1. Check this README
2. Review `manifest.json` for document structure
3. Check build script output for specific errors
4. Ensure all dependencies are installed (`npm install`)

## Version History

- **v1.0** (2025-11-10) - Initial release
  - Automated processing of 76 documents
  - Mermaid diagram rendering
  - Professional HTML template
  - 13 organized sections

---

**Generated:** November 10, 2025
**Project:** HappyDooda.co.za Phase 1 Documentation Pack
**Status:** Phase 1 Complete ✅
