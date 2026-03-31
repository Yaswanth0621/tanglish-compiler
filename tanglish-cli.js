#!/usr/bin/env node
/**
 * TanglishScript CLI
 * Usage:
 *   node tanglish-cli.js build examples/app.tang
 *   node tanglish-cli.js run   examples/app.tang
 *   node tanglish-cli.js check examples/app.tang
 */

const fs = require('fs');
const path = require('path');
const { Lexer } = require('./compiler/lexer');
const { Parser } = require('./compiler/parser');
const { Transpiler } = require('./compiler/transpiler');

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const MAGENTA= '\x1b[35m';

function banner() {
  console.log(`
${CYAN}${BOLD}╔════════════════════════════════════════╗
║  🟡 TanglishScript Compiler  v1.0.0   ║
║  The Telugu-English Web Language      ║
╚════════════════════════════════════════╝${RESET}
`);
}

function info(msg)    { console.log(`${CYAN}  ℹ  ${RESET}${msg}`); }
function success(msg) { console.log(`${GREEN}  ✓  ${RESET}${msg}`); }
function warn(msg)    { console.log(`${YELLOW}  ⚠  ${RESET}${msg}`); }
function error(msg)   { console.log(`${RED}  ✗  ${RESET}${msg}`); }
function label(msg)   { console.log(`${MAGENTA}${BOLD}${msg}${RESET}`); }

function compile(sourceFile) {
  const source = fs.readFileSync(sourceFile, 'utf-8');
  info(`Reading: ${sourceFile}`);

  // Lex
  const lexer = new Lexer(source);
  let tokens;
  try {
    tokens = lexer.tokenize();
    success(`Lexed ${tokens.length - 1} tokens`);
  } catch (e) {
    error(`Lexer error: ${e.message}`);
    process.exit(1);
  }

  // Parse
  const parser = new Parser(tokens);
  let ast;
  try {
    ast = parser.parseProgram();
    success(`Parsed ${ast.body.length} top-level nodes`);
  } catch (e) {
    error(`Parser error: ${e.message}`);
    process.exit(1);
  }

  // Transpile
  const transpiler = new Transpiler(ast);
  let result;
  try {
    result = transpiler.transpile();
    success(`Transpiled: HTML=${result.html.length}B, CSS=${result.css.length}B, JS=${result.js.length}B`);
  } catch (e) {
    error(`Transpiler error: ${e.message}`);
    process.exit(1);
  }

  return { source, ast, ...result };
}

function buildCommand(sourceFile, outDir) {
  banner();
  label('▶ BUILDING...\n');

  if (!sourceFile) { error('Usage: tanglish-cli.js build <file.tang> [outDir]'); process.exit(1); }
  if (!fs.existsSync(sourceFile)) { error(`File not found: ${sourceFile}`); process.exit(1); }

  const result = compile(sourceFile);
  const outputDirectory = outDir || path.join(path.dirname(sourceFile), '..', 'build');

  // Ensure build directory exists
  fs.mkdirSync(outputDirectory, { recursive: true });

  // Write runtime into build
  const runtimeSrc = path.join(__dirname, 'runtime', 'browser.js');
  let runtimeCode = '';
  if (fs.existsSync(runtimeSrc)) {
    runtimeCode = fs.readFileSync(runtimeSrc, 'utf-8');
  }

  // Write files
  const htmlFile = path.join(outputDirectory, 'index.html');
  const cssFile  = path.join(outputDirectory, 'style.css');
  const jsFile   = path.join(outputDirectory, 'app.js');

  fs.writeFileSync(htmlFile, result.html, 'utf-8');
  fs.writeFileSync(cssFile,  result.css || '/* No styles defined */', 'utf-8');
  fs.writeFileSync(jsFile,   (runtimeCode ? runtimeCode + '\n\n' : '') + (result.js || '// No scripts defined'), 'utf-8');

  console.log('');
  label('▶ OUTPUT\n');
  success(`index.html  →  ${htmlFile}`);
  success(`style.css   →  ${cssFile}`);
  success(`app.js      →  ${jsFile}`);
  console.log('');
  console.log(`${GREEN}${BOLD}Build complete! Open ${path.join(outputDirectory, 'index.html')} in your browser.${RESET}\n`);
}

function checkCommand(sourceFile) {
  banner();
  label('▶ CHECKING...\n');

  if (!sourceFile) { error('Usage: tanglish-cli.js check <file.tang>'); process.exit(1); }
  if (!fs.existsSync(sourceFile)) { error(`File not found: ${sourceFile}`); process.exit(1); }

  const result = compile(sourceFile);

  console.log('');
  label('▶ AST SUMMARY\n');
  result.ast.body.forEach((node, i) => {
    info(`[${i}] ${node.type}${node.name ? ': ' + node.name : ''}`);
  });
  console.log('');
  success('No errors found. File is valid TanglishScript!');
  console.log('');
}

function runCommand(sourceFile) {
  banner();
  label('▶ RUNNING (Quick Preview Mode)...\n');

  if (!sourceFile) { error('Usage: tanglish-cli.js run <file.tang>'); process.exit(1); }

  // Build first into a temp directory
  const tmpDir = path.join(require('os').tmpdir(), 'tanglish-preview-' + Date.now());
  buildCommand(sourceFile, tmpDir);

  // Try to open in browser
  const htmlPath = path.join(tmpDir, 'index.html');
  const { exec } = require('child_process');
  const platform = process.platform;

  let openCmd;
  if (platform === 'win32') openCmd = `start "" "${htmlPath}"`;
  else if (platform === 'darwin') openCmd = `open "${htmlPath}"`;
  else openCmd = `xdg-open "${htmlPath}"`;

  exec(openCmd, (err) => {
    if (err) {
      warn('Could not auto-open browser. Open this file manually:');
      info(htmlPath);
    } else {
      success('Opened in default browser!');
    }
  });
}

function showHelp() {
  banner();
  console.log(`${BOLD}USAGE${RESET}`);
  console.log(`  node tanglish-cli.js <command> <file.tang> [options]\n`);
  console.log(`${BOLD}COMMANDS${RESET}`);
  console.log(`  ${CYAN}build${RESET} <file.tang> [outDir]   Compile to HTML + CSS + JS`);
  console.log(`  ${CYAN}run${RESET}   <file.tang>             Build and open in browser`);
  console.log(`  ${CYAN}check${RESET} <file.tang>             Validate syntax and show AST`);
  console.log(`  ${CYAN}help${RESET}                          Show this help message\n`);
  console.log(`${BOLD}EXAMPLES${RESET}`);
  console.log(`  node tanglish-cli.js build examples/app.tang`);
  console.log(`  node tanglish-cli.js run   examples/complete.tang`);
  console.log(`  node tanglish-cli.js check examples/app.tang\n`);
  console.log(`${BOLD}KEYWORDS${RESET} (TanglishScript → JavaScript)`);
  const map = [
    ['idigo', 'let'], ['cheppu', 'console.log'], ['unte', 'if'],
    ['lekapothe', 'else'], ['malli', 'for'], ['varaku', 'while'],
    ['pani', 'function'], ['pampu', 'return'], ['aipoindi', ';'],
    ['nijam', 'true'], ['abaddam', 'false'], ['petti', 'HTML tag'],
    ['raayi', 'text content'], ['alankaram', 'CSS'], ['click ayithe', 'onclick'],
  ];
  map.forEach(([k, v]) => console.log(`  ${YELLOW}${k.padEnd(16)}${RESET}→  ${v}`));
  console.log('');
}

// ─── Main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];
const file = args[1];
const outDir = args[2];

switch (command) {
  case 'build': buildCommand(file, outDir); break;
  case 'run':   runCommand(file); break;
  case 'check': checkCommand(file); break;
  case 'help':
  case '--help':
  case '-h':
  default:
    showHelp();
    break;
}
