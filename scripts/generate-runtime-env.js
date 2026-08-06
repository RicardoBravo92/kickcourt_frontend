const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || '';

const content = `// Auto-generated during build. Do not edit.
window.__env = {
  apiUrl: '${apiUrl}',
};
`;

const outputPath = path.join(__dirname, '..', 'public', 'runtime-env.js');
fs.writeFileSync(outputPath, content);

console.log(`Generated runtime-env.js with apiUrl: ${apiUrl}`);
