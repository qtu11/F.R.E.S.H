const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'extracted_doc.txt');
const content = fs.readFileSync(filePath, 'utf-8');

function findKeyword(kw) {
  console.log(`=== SEARCHING FOR: ${kw} ===`);
  const lines = content.split('\n');
  let count = 0;
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(kw.toLowerCase())) {
      count++;
      console.log(`Line ${idx + 1}: ${line}`);
      for (let i = 1; i <= 40; i++) {
        if (lines[idx + i] !== undefined) {
          console.log(`  [+${i}] ${lines[idx + i]}`);
        }
      }
      console.log('-----------------------------------');
    }
  });
  console.log(`Found ${count} occurrences.`);
}

findKeyword(process.argv[2] || 'rủi ro');
