
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../client/src/contexts/i18n.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let currentLang = null;
const seenKeys = {
  en: new Set(),
  zh: new Set()
};
const duplicateLines = [];

// Regex to match key-value pairs like: "key": "value",
const keyRegex = /^\s*"([^"]+)"\s*:\s*/;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Detect start of language blocks
  if (trimmed === 'en: {') {
    currentLang = 'en';
    continue;
  }
  if (trimmed === 'zh: {') {
    currentLang = 'zh';
    continue;
  }

  // Detect end of language blocks
  if ((currentLang === 'en' || currentLang === 'zh') && trimmed === '},') {
    currentLang = null;
    continue;
  }

  if (currentLang) {
    // Check for comments
    if (trimmed.startsWith('//')) continue;

    const match = line.match(keyRegex);
    if (match) {
      const key = match[1];
      if (seenKeys[currentLang].has(key)) {
        console.log(`Duplicate found in ${currentLang}: ${key} at line ${i + 1}`);
        duplicateLines.push(i);
      } else {
        seenKeys[currentLang].add(key);
      }
    }
  }
}

console.log(`Total duplicates found: ${duplicateLines.length}`);

// If we want to fix it, we can filter out the duplicate lines
if (duplicateLines.length > 0) {
    const newLines = lines.filter((_, index) => !duplicateLines.includes(index));
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log('Fixed duplicates and wrote back to file.');
}
