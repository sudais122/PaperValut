const fs   = require('fs');
const path = require('path');

// ── Build absolute path to any data file ──────────────
const dataPath = (filename) =>
  path.join(__dirname, '..', 'data', filename);

// ── Read a JSON file and return parsed array ──────────
const readFile = (filename) => {
  try {
    const raw = fs.readFileSync(dataPath(filename), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    // If file missing or empty, return empty array
    return [];
  }
};

// ── Write data array back to JSON file ────────────────
const writeFile = (filename, data) => {
  try {
    fs.writeFileSync(
      dataPath(filename),
      JSON.stringify(data, null, 2),  // pretty print
      'utf-8'
    );
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    return false;
  }
};

module.exports = { readFile, writeFile };