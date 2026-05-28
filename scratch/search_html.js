const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'extracted_doc.html');
const content = fs.readFileSync(filePath, 'utf-8');

function search(kw) {
  console.log(`=== SEARCHING HTML FOR: ${kw} ===`);
  let index = 0;
  let count = 0;
  while ((index = content.indexOf(kw, index)) !== -1) {
    count++;
    console.log(`Match ${count} at index ${index}:`);
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + 500);
    console.log(content.slice(start, end));
    console.log('-----------------------------------');
    index += kw.length;
  }
  console.log(`Found ${count} matches.`);
}

search(process.argv[2] || 'khoa học');
