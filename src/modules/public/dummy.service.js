const fs = require('fs').promises;
const path = require('path');

const dataDir = path.resolve(__dirname, '../../../data/dummy');
const cache = new Map();

async function loadJson(fileName) {
  if (cache.has(fileName)) {
    return cache.get(fileName);
  }

  const filePath = path.join(dataDir, fileName);
  const raw = await fs.readFile(filePath, 'utf-8');
  const payload = JSON.parse(raw);
  cache.set(fileName, payload);
  return payload;
}

module.exports = { loadJson };
