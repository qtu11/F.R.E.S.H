const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function extract() {
  const docxPath = path.join(__dirname, '..', 'docs', 'DỰ ÁN FRESH-FINAL-09.05.docx');
  console.log('Extracting HTML from:', docxPath);
  try {
    const result = await mammoth.convertToHtml({ path: docxPath });
    const html = result.value;
    const outputPath = path.join(__dirname, 'extracted_doc.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log('Successfully extracted HTML to:', outputPath);
  } catch (err) {
    console.error('Error extracting HTML:', err);
  }
}

extract();
