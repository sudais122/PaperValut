// Server/config/fileStore.js
const fs   = require('fs');
const path = require('path');

// Build absolute path to any file inside /data/
const dataPath = (filename) =>
  path.join(__dirname, '..', 'data', filename);

// ── READ ──────────────────────────────────────
// Reads a JSON file and returns a parsed array.
// Returns [] if the file is missing or empty.
const readFile = (filename) => {
  try {
    const raw = fs.readFileSync(dataPath(filename), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// ── WRITE ─────────────────────────────────────
// Writes data back to the JSON file, pretty-printed.
// Returns true on success, false on failure.
const writeFile = (filename, data) => {
  try {
    fs.writeFileSync(
      dataPath(filename),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    return true;
  } catch (err) {
    console.error(`❌ Write error (${filename}):`, err.message);
    return false;
  }
};

module.exports = { readFile, writeFile };