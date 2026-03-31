/**
 * TanglishScript Transpiler
 * Walks the AST and emits three outputs: HTML, CSS, and JavaScript.
 */

class Transpiler {
  constructor(ast) {
    this.ast = ast;
    this.html = [];      // HTML element strings
    this.css = [];       // CSS rule strings
    this.js = [];        // JS code strings
    this.indent = 0;
  }

  tabs(extra = 0) {
    return '  '.repeat(this.indent + extra);
  }

  // ─── Entry Point ─────────────────────────────────────────────────────────────
  transpile() {
    for (const node of this.ast.body) {
      this.visitTopLevel(node);
    }

    const htmlOutput = this.buildHTML();
    const cssOutput = this.css.join('\n');
    const jsOutput = this.js.join('\n');

    return { html: htmlOutput, css: cssOutput, js: jsOutput };
  }

  buildHTML() {
    const htmlContent = this.html.join('\n');
    const hasCss = this.css.length > 0;
    const hasJs = this.js.length > 0;

    return `<!DOCTYPE html>
<html lang="te">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TanglishScript App</title>
  ${hasCss ? '<link rel="stylesheet" href="style.css">' : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
${htmlContent}
${hasJs ? '  <script src="app.js"></script>' : ''}
</body>
</html>`;
  }

  // ─── Top-Level Dispatch ──────────────────────────────────────────────────────
  visitTopLevel(node) {
    if (!node) return;
    switch (node.type) {
      case 'HtmlElement':   this.html.push(this.genHtml(node, 0)); break;
      case 'CssBlock':      this.css.push(this.genCss(node)); break;
      case 'ClassDecl':     this.js.push(this.genClass(node)); break;
      case 'FunctionDecl':  this.js.push(this.genFunction(node)); break;
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

  // ─── HTML Generation ────────────────────────────────────────────────────────
  genHtml(node, depth) {
    const pad = '  '.repeat(depth);
    const childPad = '  '.repeat(depth + 1);

    // Build opening tag attributes
    let attrs = '';
    if (node.id) attrs += ` id="${node.id}"`;
    if (node.className) attrs += ` class="${node.className}"`;
    if (node.attributes) {
      node.attributes.forEach(attr => {
        let val = '';
        if (attr.value.type === 'StringLiteral') val = attr.value.value;
        else if (attr.value.type === 'NumberLiteral' || attr.value.type === 'BooleanLiteral') val = attr.value.value;
        else val = `\${${this.genExpr(attr.value)}}`; // template string fallback
        attrs += ` ${attr.name}="${val}"`;
      });
    }
    if (node.clickHandler) {
      const args = node.clickHandler.args.map(a => this.genExpr(a)).join(', ');
      attrs += ` onclick="${node.clickHandler.name}(${args})"`;
    }

    const tag = this.sanitizeTag(node.tag);
    const openTag = `${pad}<${tag}${attrs}>`;
    const closeTag = `${pad}</${tag}>`;

    if (node.children.length === 0) {
      return `${openTag}</${tag}>`;
    }

    const childrenHtml = node.children.map(child => {
      if (child.type === 'TextContent') {
        return `${childPad}${this.genExprAsText(child.value)}`;
      } else if (child.type === 'HtmlElement') {
        return this.genHtml(child, depth + 1);
      }
      return '';
    }).filter(Boolean).join('\n');

    return `${openTag}\n${childrenHtml}\n${closeTag}`;
  }

  sanitizeTag(tag) {
    // Allow standard HTML tags, default to div
    const validTags = [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'section', 'article', 'main', 'header', 'footer', 'nav',
      'button', 'input', 'textarea', 'form', 'label', 'select', 'option',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
      'img', 'a', 'strong', 'em', 'pre', 'code', 'br', 'hr',
      'canvas', 'video', 'audio', 'iframe',
      // Aliases
      'page', 'container', 'box', 'card', 'row', 'col', 'column',
    ];
    const aliasMap = { page: 'div', container: 'div', box: 'div', card: 'div', row: 'div', col: 'div', column: 'div' };
    if (aliasMap[tag]) return aliasMap[tag];
    return validTags.includes(tag) ? tag : 'div';
  }

  genExprAsText(expr) {
    if (expr.type === 'StringLiteral') return expr.value;
    if (expr.type === 'NumberLiteral') return String(expr.value);
    if (expr.type === 'BooleanLiteral') return String(expr.value);
    // For dynamic values, embed a placeholder span (injected by JS at runtime)
    const id = `_tl_${Math.random().toString(36).slice(2, 8)}`;
    this.js.push(`document.getElementById('${id}') && (document.getElementById('${id}').textContent = ${this.genExpr(expr)});`);
    return `<span id="${id}"></span>`;
  }

  // ─── CSS Generation ──────────────────────────────────────────────────────────
  genCss(node) {
    const props = node.properties.map(({ prop, value }) => {
      const cssProp = this.toCssProp(prop, value);
      return `  ${cssProp.prop}: ${cssProp.value};`;
    }).join('\n');
    return `${node.selector} {\n${props}\n}`;
  }

  toCssProp(prop, value) {
    // Map Tanglish shorthand to CSS
    const map = {
      size: (v) => ({ prop: 'font-size', value: v }),
      color: (v) => ({ prop: 'color', value: v }),
      background: (v) => ({ prop: 'background', value: v }),
      bg: (v) => ({ prop: 'background', value: v }),
      width: (v) => ({ prop: 'width', value: v }),
      height: (v) => ({ prop: 'height', value: v }),
      margin: (v) => ({ prop: 'margin', value: v }),
      padding: (v) => ({ prop: 'padding', value: v }),
      border: (v) => ({ prop: 'border', value: v }),
      radius: (v) => ({ prop: 'border-radius', value: v }),
      shadow: (v) => ({ prop: 'box-shadow', value: v }),
      flex: (v) => ({ prop: 'display', value: 'flex' }),
      align: (v) => ({ prop: 'align-items', value: v }),
      justify: (v) => ({ prop: 'justify-content', value: v }),
      font: (v) => ({ prop: 'font-family', value: v }),
      weight: (v) => ({ prop: 'font-weight', value: v }),
      opacity: (v) => ({ prop: 'opacity', value: v }),
      display: (v) => ({ prop: 'display', value: v }),
      position: (v) => ({ prop: 'position', value: v }),
      overflow: (v) => ({ prop: 'overflow', value: v }),
      cursor: (v) => ({ prop: 'cursor', value: v }),
    };
    if (map[prop]) return map[prop](value);
    // camelCase to kebab-case for unknown props
    const kebab = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    return { prop: kebab, value };
  }

  // ─── JavaScript Generation ───────────────────────────────────────────────────
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
    // Generate ES6 import statement
    if (node.specifiers && node.specifiers.length > 0) {
      return `import { ${node.specifiers.join(', ')} } from '${node.source}';`;
    } else if (node.source) {
      return `import '${node.source}';`;
    }
    return '';
  }

  genExport(node) {
    // Generate ES6 export statement
    if (node.exports && node.exports.length > 0) {
      return `export { ${node.exports.join(', ')} };`;
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
      // HTML/CSS inside functions are inlined as DOM manipulation
      case 'HtmlElement': return `${pad}/* HTML: use getElementById or appendChild for '${node.tag}' */`;
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
        out += ` else ${this.genIf(node.alternate, depth)}`;
      } else {
        out += ` else {\n${this.genBlock(node.alternate, depth + 1)}\n${pad}}`;
      }
    }
    return out;
  }

  genFor(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const init = node.init ? `let ${node.init.name} = ${this.genExpr(node.init.init)}` : '';
    const cond = this.genExpr(node.condition);
    const update = this.genExpr(node.update);
    const body = this.genBlock(node.body, depth + 1);
    return `for (${init}; ${cond}; ${update}) {\n${body}\n${pad}}`;
  }

  genForEach(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const item = node.item;
    const iterable = this.genExpr(node.iterable);
    const body = this.genBlock(node.body, depth + 1);
    return `for (let ${item} of ${iterable}) {\n${body}\n${pad}}`;
  }

  genTryCatch(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const tryBody = this.genBlock(node.tryBlock, depth + 1);
    let out = `try {\n${tryBody}\n${pad}}`;
    if (node.catchClause) {
      const param = node.catchClause.param;
      const catchBody = this.genBlock(node.catchClause.body, depth + 1);
      out += ` catch (${param}) {\n${catchBody}\n${pad}}`;
    }
    return out;
  }

  genWhile(node, depth = 0) {
    const pad = '  '.repeat(depth);
    const cond = this.genExpr(node.condition);
    const body = this.genBlock(node.body, depth + 1);
    return `while (${cond}) {\n${body}\n${pad}}`;
  }

  // ─── Expression Code Gen ─────────────────────────────────────────────────────
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

module.exports = { Transpiler };
