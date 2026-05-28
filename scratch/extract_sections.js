const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'extracted_doc.txt');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log("=== LIST OF POTENTIAL SECTION HEADERS ===");
lines.forEach((line, idx) => {
  const trimmed = line.trim();
  if (/^[0-9]+\.\s+/.test(trimmed) || /^[a-z]\.\s+/.test(trimmed) || /^[0-9]\.[0-9]\.[0-9]/.test(trimmed)) {
    console.log(`Line ${idx + 1}: ${trimmed}`);
  }
});
