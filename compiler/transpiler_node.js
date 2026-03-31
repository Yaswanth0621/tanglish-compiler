/**
 * TanglishScript Node.js Transpiler
 * Walks the AST and generates Node.js server code (Express, file I/O, etc.)
 */

class NodeTranspiler {
  constructor(ast) {
    this.ast = ast;
    this.js = [];
    this.indent = 0;
  }

  tabs(extra = 0) {
    return '  '.repeat(this.indent + extra);
  }

  // ─── Entry Point ─────────────────────────────────────────────────────────────
  transpile() {
    // Add Express and required imports
    this.js.push("const express = require('express');");
    this.js.push("const fs = require('fs');");
    this.js.push("const path = require('path');");
    this.js.push("");
    this.js.push("const app = express();");
    this.js.push("const PORT = process.env.PORT || 3000;");
    this.js.push("");

    // Add runtime helpers
    this.js.push(this.getRuntimeHelpers());
    this.js.push("");

    // Process AST
    for (const node of this.ast.body) {
      this.visitTopLevel(node);
    }

    // Start server
    this.js.push("");
    this.js.push("app.listen(PORT, () => {");
    this.js.push(`  console.log(\`🟡 TanglishScript Server running on http://localhost:\${PORT}\`);`);
    this.js.push("});");

    return this.js.join('\n');
  }

  getRuntimeHelpers() {
    return `// ─── TanglishScript Node.js Runtime Helpers ───
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
};`;
  }

  // ─── Top-Level Dispatch ──────────────────────────────────────────────────────
  visitTopLevel(node) {
    if (!node) return;
    switch (node.type) {
      case 'FunctionDecl':  this.js.push(this.genFunction(node)); break;
      case 'ClassDecl':     this.js.push(this.genClass(node)); break;
      case 'VarDecl':       this.js.push(this.genVarDecl(node)); break;
      case 'Print':         this.js.push(this.genPrint(node)); break;
      case 'IfStmt':        this.js.push(this.genIf(node)); break;
      case 'ForStmt':       this.js.push(this.genFor(node)); break;
      case 'WhileStmt':     this.js.push(this.genWhile(node)); break;
      case 'ExprStmt':      this.js.push(this.genExpr(node.expr) + ';'); break;
      case 'ImportStmt':    this.js.push(this.genImport(node)); break;
      case 'ExportStmt':    this.js.push(this.genExport(node)); break;
      default: break;
    }
  }

  genClass(node) {
    const superClass = node.superClass ? ` extends ${node.superClass}` : '';
    let classBody = [];

    for (const method of node.methods) {
      const params = method.params.join(', ');
      const body = this.genBlock(method.body);
      if (method.isConstructor) {
        classBody.push(`  constructor(${params}) {\n${body}\n  }`);
      } else {
        classBody.push(`  ${method.name}(${params}) {\n${body}\n  }`);
      }
    }

    return `class ${node.name}${superClass} {\n${classBody.join('\n')}\n}`;
  }

  genFunction(node) {
    const params = node.params.join(', ');
    const body = this.genBlock(node.body);
    return `function ${node.name}(${params}) {\n${body}\n}`;
  }

  genImport(node) {
    // For Node.js, use CommonJS require() pattern
    if (node.specifiers && node.specifiers.length > 0) {
      // teesuko { x, y } from "./module" -> const { x, y } = require('./module');
      return `const { ${node.specifiers.join(', ')} } = require('${node.source}');`;
    } else if (node.source) {
      // teesuko "./module" -> require('./module');
      return `require('${node.source}');`;
    }
    return '';
  }

  genExport(node) {
    // For Node.js, use CommonJS module.exports pattern
    if (node.exports && node.exports.length > 0) {
      // ivvu { x, y } -> module.exports = { x, y };
      return `module.exports = { ${node.exports.join(', ')} };`;
    }
    return '';
  }

  genBlock(block, depth = 1) {
    const pad = '  '.repeat(depth);
    return block.body.map(stmt => this.genStmt(stmt, depth)).join('\n');
  }

  genStmt(node, depth = 1) {
    const pad = '  '.repeat(depth);
    if (!node) return '';
    switch (node.type) {
      case 'VarDecl':     return `${pad}${this.genVarDecl(node)}`;
      case 'Print':       return `${pad}${this.genPrint(node)}`;
      case 'IfStmt':      return `${pad}${this.genIf(node, depth)}`;
      case 'ForStmt':     return `${pad}${this.genFor(node, depth)}`;
      case 'WhileStmt':   return `${pad}${this.genWhile(node, depth)}`;
      case 'ForEachStmt': return `${pad}${this.genForEach(node, depth)}`;
      case 'TryCatchStmt':return `${pad}${this.genTryCatch(node, depth)}`;
      case 'ReturnStmt':  return `${pad}return ${node.value ? this.genExpr(node.value) : ''};`;
      case 'BreakStmt':   return `${pad}break;`;
      case 'ContinueStmt':return `${pad}continue;`;
      case 'ExprStmt':    return `${pad}${this.genExpr(node.expr)};`;
      case 'Block':       return this.genBlock(node, depth);
      default: return `${pad}/* unknown stmt: ${node.type} */`;
    }
  }

  genVarDecl(node) {
    const init = node.init ? ` = ${this.genExpr(node.init)}` : '';
    return `let ${node.name}${init};`;
  }

  genPrint(node) {
    return `console.log(${this.genExpr(node.value)});`;
  }

  genIf(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const childPad = '  '.repeat(depth + 1);
    let out = `if (${this.genExpr(node.condition)}) {\n${this.genBlock(node.consequent, depth + 1)}\n${pad}}`;
    if (node.alternate) {
      if (node.alternate.type === 'IfStmt') {
        out += ` else ${this.genIf(node.alternate, depth).trim()}`;
      } else {
        const altBody = this.genBlock(node.alternate, depth + 1);
        out += ` else {\n${altBody}\n${pad}}`;
      }
    }
    return out;
  }

  genFor(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const init = node.init ? this.genVarDecl(node.init).replace(/^let /, '') : '';
    const cond = this.genExpr(node.condition);
    const update = this.genExpr(node.update);
    const body = this.genBlock(node.body, depth + 1);
    return `for (${init}; ${cond}; ${update}) {\n${body}\n${pad}}`;
  }

  genWhile(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const cond = this.genExpr(node.condition);
    const body = this.genBlock(node.body, depth + 1);
    return `while (${cond}) {\n${body}\n${pad}}`;
  }

  genForEach(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const body = this.genBlock(node.body, depth + 1);
    return `for (const ${node.item} of ${this.genExpr(node.iterable)}) {\n${body}\n${pad}}`;
  }

  genTryCatch(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const tryBody = this.genBlock(node.tryBlock, depth + 1);
    let out = `try {\n${tryBody}\n${pad}}`;
    if (node.catchClause) {
      const catchBody = this.genBlock(node.catchClause.body, depth + 1);
      out += ` catch (${node.catchClause.param}) {\n${catchBody}\n${pad}}`;
    }
    return out;
  }

  genExpr(node) {
    if (!node) return 'undefined';
    switch (node.type) {
      case 'StringLiteral':  return JSON.stringify(node.value);
      case 'NumberLiteral':  return String(node.value);
      case 'BooleanLiteral': return node.value ? 'true' : 'false';
      case 'NullLiteral':    return 'null';
      case 'Identifier':     return node.name;
      case 'ThisExpr':       return 'this';
      case 'NewExpr': {
        const args = node.args.map(a => this.genExpr(a)).join(', ');
        return `new ${node.className}(${args})`;
      }
      case 'FunctionExpr': {
        const params = node.params.join(', ');
        const body = this.genBlock(node.body);
        return `function(${params}) {\n${body}\n}`;
      }
      case 'BinaryExpr':     return `(${this.genExpr(node.left)} ${node.op} ${this.genExpr(node.right)})`;
      case 'UnaryExpr':      return `${node.op}${this.genExpr(node.right)}`;
      case 'PostfixExpr':    return `${this.genExpr(node.expr)}${node.op}`;
      case 'AssignExpr':     return `${this.genExpr(node.left)} = ${this.genExpr(node.right)}`;
      case 'CallExpr': {
        const callee = this.genExpr(node.callee);
        const args = node.args.map(a => this.genExpr(a)).join(', ');
        return `${callee}(${args})`;
      }
      case 'MemberExpr':     return `${this.genExpr(node.object)}.${node.property}`;
      case 'SubscriptExpr':  return `${this.genExpr(node.object)}[${this.genExpr(node.index)}]`;
      case 'ArrayExpr':      return `[${node.elements.map(e => this.genExpr(e)).join(', ')}]`;
      case 'ObjectExpr':     return `{ ${node.properties.map(p => `"${p.key}": ${this.genExpr(p.value)}`).join(', ')} }`;
      default: return '/* ? */';
    }
  }
}

module.exports = { NodeTranspiler };
