const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'extracted_doc.txt');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const startLine = 1500;
const endLine = lines.length;

console.log(`=== SHOWING LINES ${startLine} TO ${endLine} ===`);
for (let i = startLine - 1; i < endLine; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
