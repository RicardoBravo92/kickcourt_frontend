const fs = require('fs');
const path = require('path');

const rawApiUrl = (process.env.API_URL || '').trim().replace(/\/+$/, '');

const apiUrl = rawApiUrl.includes('/api')
  ? rawApiUrl
  : rawApiUrl
    ? `${rawApiUrl}/api`
    : '';

const content = `// Auto-generated during build. Do not edit.
window.__env = {
  apiUrl: '${apiUrl}',
};
`;

const outputPath = path.join(__dirname, '..', 'public', 'runtime-env.js');
fs.writeFileSync(outputPath, content);

console.log(`Generated runtime-env.js with apiUrl: ${apiUrl}`);