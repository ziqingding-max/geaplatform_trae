
const fs = require('fs');
const path = require('path');

const portalDir = '/Users/simonprivate/Documents/Trae/geaplatform_trae/client/src/pages/portal';

fs.readdirSync(portalDir).forEach(file =&gt; {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(portalDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('from "@/lib/i18n')) {
      content = content.replace(/from "@\/lib\/i18n"/g, 'from "@/contexts/i18n"');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${file}`);
    }
  }
});

console.log('Done!');

