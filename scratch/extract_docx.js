const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function extract() {
  const docxPath = path.join(__dirname, '..', 'docs', 'DỰ ÁN FRESH-FINAL-09.05.docx');
  console.log('Extracting from:', docxPath);
  try {
    const result = await mammoth.extractRawText({ path: docxPath });
    const text = result.value; // The raw text
    const outputPath = path.join(__dirname, 'extracted_doc.txt');
    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log('Successfully extracted raw text to:', outputPath);
  } catch (err) {
    console.error('Error extracting docx:', err);
  }
}

extract();
