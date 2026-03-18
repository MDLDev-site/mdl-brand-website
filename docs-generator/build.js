const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');

// Configuration
const DOCS_DIR = path.join(__dirname, '..', 'Docs');
const OUTPUT_DIR = path.join(__dirname, '..', 'Docs-Output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'documentation-pack.html');
const MANIFEST_FILE = path.join(__dirname, 'manifest.json');

// Statistics
let stats = {
  totalFiles: 0,
  totalDiagrams: 0,
  renderedDiagrams: 0,
  failedDiagrams: 0,
  sections: []
};

console.log('🚀 Starting MDL Documentation Pack Generation...\n');

// Step 1: Read manifest
console.log('📋 Reading document manifest...');
const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
console.log(`   Found ${manifest.sections.length} sections\n`);

// Step 2: Process each section
const htmlSections = [];
let sectionNumber = 0;

manifest.sections.forEach(section => {
  console.log(`\n📦 Processing Section: ${section.title}`);
  console.log('─'.repeat(60));

  const sectionContent = {
    title: section.title,
    number: ++sectionNumber,
    documents: []
  };

  section.files.forEach(filePath => {
    try {
      const fullPath = path.join(DOCS_DIR, filePath);

      if (!fs.existsSync(fullPath)) {
        console.log(`   ⚠️  File not found: ${filePath}`);
        return;
      }

      console.log(`   📄 Processing: ${filePath}`);

      // Read markdown content
      let markdown = fs.readFileSync(fullPath, 'utf-8');
      stats.totalFiles++;

      // Render Mermaid diagrams
      const processedMarkdown = renderMermaidDiagrams(markdown, filePath);

      // Convert to HTML
      const html = marked.parse(processedMarkdown);

      // Extract title from markdown (first H1)
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      const docTitle = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');

      sectionContent.documents.push({
        title: docTitle,
        content: html,
        sourceFile: filePath
      });

    } catch (error) {
      console.log(`   ❌ Error processing ${filePath}: ${error.message}`);
    }
  });

  if (sectionContent.documents.length > 0) {
    htmlSections.push(sectionContent);
    stats.sections.push({
      title: section.title,
      documentCount: sectionContent.documents.length
    });
  }
});

// Step 3: Render Mermaid diagrams function
function renderMermaidDiagrams(markdown, sourceFile) {
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  let processedMarkdown = markdown;
  let diagramCount = 0;
  const matches = [];

  // Find all matches first
  while ((match = mermaidRegex.exec(markdown)) !== null) {
    matches.push({
      fullMatch: match[0],
      mermaidCode: match[1],
      index: match.index
    });
  }

  if (matches.length === 0) return markdown;

  stats.totalDiagrams += matches.length;
  console.log(`      🎨 Found ${matches.length} Mermaid diagram(s)`);

  // Process matches in reverse to maintain string positions
  matches.reverse().forEach(({ fullMatch, mermaidCode }) => {
    diagramCount++;
    const diagramId = `${path.basename(sourceFile, '.md')}-${Date.now()}-${diagramCount}`;

    try {
      // Create temp files
      const tempMmdFile = path.join(__dirname, `temp-${diagramId}.mmd`);
      const tempSvgFile = path.join(__dirname, `temp-${diagramId}.svg`);

      fs.writeFileSync(tempMmdFile, mermaidCode, 'utf-8');

      // Convert to SVG using mmdc CLI
      execSync(`npx mmdc -i "${tempMmdFile}" -o "${tempSvgFile}" -b transparent`, {
        stdio: 'pipe',
        timeout: 30000
      });

      // Read generated SVG
      const svgContent = fs.readFileSync(tempSvgFile, 'utf-8');

      // Clean up temp files
      fs.unlinkSync(tempMmdFile);
      fs.unlinkSync(tempSvgFile);

      // Replace mermaid code block with inline SVG
      processedMarkdown = processedMarkdown.replace(
        fullMatch,
        `<div class="mermaid-diagram">${svgContent}</div>`
      );

      stats.renderedDiagrams++;

    } catch (error) {
      console.log(`      ⚠️  Failed to render diagram ${diagramCount}: ${error.message}`);
      stats.failedDiagrams++;

      // Fallback: keep as code block with warning
      processedMarkdown = processedMarkdown.replace(
        fullMatch,
        `<div class="diagram-error">
          <strong>⚠️ Diagram Rendering Failed</strong>
          <pre><code class="language-mermaid">${mermaidCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>`
      );
    }
  });

  return processedMarkdown;
}

// Step 4: Generate Table of Contents
console.log('\n\n📑 Generating Table of Contents...');
let tocHtml = '<nav class="table-of-contents"><h2>Table of Contents</h2><ul>';

htmlSections.forEach(section => {
  const sectionId = section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  tocHtml += `<li><a href="#section-${sectionId}">${section.number}. ${section.title}</a><ul>`;

  section.documents.forEach((doc, idx) => {
    const docId = `${sectionId}-doc-${idx}`;
    tocHtml += `<li><a href="#${docId}">${section.number}.${idx + 1} ${doc.title}</a></li>`;
  });

  tocHtml += '</ul></li>';
});

tocHtml += '</ul></nav>';

// Step 5: Generate main content HTML
console.log('📝 Generating main content...');
let contentHtml = '';

htmlSections.forEach(section => {
  const sectionId = section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  contentHtml += `
    <section class="doc-section" id="section-${sectionId}">
      <h1 class="section-title">${section.number}. ${section.title}</h1>
  `;

  section.documents.forEach((doc, idx) => {
    const docId = `${sectionId}-doc-${idx}`;
    contentHtml += `
      <article class="document" id="${docId}">
        <h2 class="document-title">${section.number}.${idx + 1} ${doc.title}</h2>
        <div class="document-content">
          ${doc.content}
        </div>
        <div class="document-meta">
          <small>Source: ${doc.sourceFile}</small>
        </div>
      </article>
    `;
  });

  contentHtml += '</section>';
});

// Step 6: Read HTML template
console.log('🎨 Loading HTML template...');
const template = fs.readFileSync(path.join(__dirname, 'doc-pack-template.html'), 'utf-8');

// Step 7: Replace placeholders in template
console.log('🔧 Assembling final document...');
const today = new Date().toISOString().split('T')[0];
const projectName = manifest.documentPack.project || 'MDL Project';
const finalHtml = template
  .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
  .replace('{{GENERATION_DATE}}', today)
  .replace('{{TABLE_OF_CONTENTS}}', tocHtml)
  .replace('{{MAIN_CONTENT}}', contentHtml)
  .replace('{{TOTAL_SECTIONS}}', htmlSections.length)
  .replace('{{TOTAL_DOCUMENTS}}', stats.totalFiles);

// Step 8: Ensure output directory exists and write output
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
fs.writeFileSync(OUTPUT_FILE, finalHtml, 'utf-8');

// Step 9: Generate statistics report
console.log('\n\n✅ Documentation Pack Generated Successfully!\n');
console.log('📊 Generation Statistics:');
console.log('─'.repeat(60));
console.log(`   📁 Total Sections: ${htmlSections.length}`);
console.log(`   📄 Total Documents: ${stats.totalFiles}`);
console.log(`   🎨 Total Mermaid Diagrams: ${stats.totalDiagrams}`);
console.log(`   ✓  Successfully Rendered: ${stats.renderedDiagrams}`);
if (stats.failedDiagrams > 0) {
  console.log(`   ⚠️  Failed to Render: ${stats.failedDiagrams}`);
}
console.log('─'.repeat(60));

console.log('\n📦 Section Breakdown:');
stats.sections.forEach((section, idx) => {
  console.log(`   ${idx + 1}. ${section.title}: ${section.documentCount} document(s)`);
});

console.log(`\n\n💾 Output saved to: ${OUTPUT_FILE}`);
console.log(`📏 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
console.log('\n🎉 Done! Open documentation-pack.html in your browser to view.\n');

// Clean up any remaining temp files
console.log('🧹 Cleaning up temporary files...');
const tempFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('temp-') && (f.endsWith('.mmd') || f.endsWith('.svg')));
tempFiles.forEach(f => {
  try {
    fs.unlinkSync(path.join(__dirname, f));
  } catch (e) {
    // Ignore
  }
});

console.log('✨ All done!\n');
