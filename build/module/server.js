const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── TanglishScript Node.js Runtime Helpers ───
const T = {
  // Server helpers
  listen(port, callback) {
    app.listen(port, callback);
  },

  // Routing helpers
  get(path, handler) {
    app.get(path, handler);
  },

  post(path, handler) {
    app.post(path, handler);
  },

  put(path, handler) {
    app.put(path, handler);
  },

  delete(path, handler) {
    app.delete(path, handler);
  },

  // JSON responses
  json(data) {
    return (req, res) => res.json(data);
  },

  // File I/O
  readFile(filePath) {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  },

  writeFile(filePath, content) {
    fs.writeFileSync(path.join(__dirname, filePath), content);
  },

  exists(filePath) {
    return fs.existsSync(path.join(__dirname, filePath));
  },

  // Logging
  log(...args) {
    console.log('[TanglishScript]', ...args);
  },

  // Error handling
  error(msg) {
    console.error('[TanglishScript Error]', msg);
  }
};

function add(a, b) {
  return (a + b);
}
function multiply(a, b) {
  return (a * b);
}
function divide(a, b) {
  return (a / b);
}
function power(base, exponent) {
  return (base * null);
  exponent;
}
module.exports = { add, multiply, divide, power };

app.listen(PORT, () => {
  console.log(`🟡 TanglishScript Server running on http://localhost:${PORT}`);
});