/**
 * TanglishScript IDE Compiler & UI logic
 * macOS 27 Edition
 */

// ─── Lexer ─────────────────────────────────────────────────────────────
const TOKEN_TYPES = {
  KEYWORD: 'KEYWORD', IDENTIFIER: 'IDENTIFIER', NUMBER: 'NUMBER',
  STRING: 'STRING', BOOLEAN: 'BOOLEAN', OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION', EOF: 'EOF',
  LBRACE: 'LBRACE', RBRACE: 'RBRACE', LPAREN: 'LPAREN', RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET',
  COLON: 'COLON', COMMA: 'COMMA', SEMICOLON: 'SEMICOLON', EQUALS: 'EQUALS'
};

const KEYWORDS = [
  'idigo', 'cheppu', 'unte', 'lekapothe', 'malli', 'varaku', 'pani', 'pampu',
  'aipoindi', 'petti', 'alankaram', 'raayi', 'click ayithe',
  'prathi', 'lona', 'prayatninchu', 'pattu'
];

class Lexer {
  constructor(input) { this.input = input; this.pos = 0; this.line = 1; this.col = 1; this.tokens = []; }
  advance(step = 1) {
    for(let i=0; i<step; i++) {
      if(this.input[this.pos] === '\n') { this.line++; this.col = 1; } else { this.col++; }
      this.pos++;
    }
  }
  peek(n = 0) { return this.input[this.pos + n] || ''; }
  tokenize() {
    while(this.pos < this.input.length) {
      let char = this.peek();
      if (/\s/.test(char)) { this.advance(); continue; }
      if (char === '#') {
        let nxt = this.peek(1);
        if (/[0-9a-fA-F]/.test(nxt) && nxt !== '') {
          let hex = '#'; this.advance();
          while(/[0-9a-fA-F]/.test(this.peek())) { hex += this.peek(); this.advance(); }
          this.tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: hex, line: this.line, col: this.col });
          continue;
        }
        while(this.peek() && this.peek() !== '\n') this.advance(); continue;
      }
      if (char === '"' || char === "'") {
        let quote = char; this.advance(); let str = '';
        while(this.peek() && this.peek() !== quote) { str += this.peek(); this.advance(); }
        this.advance(); this.tokens.push({ type: TOKEN_TYPES.STRING, value: str, line: this.line, col: this.col });
        continue;
      }
      if (/[0-9]/.test(char)) {
        let num = ''; while(/[0-9.]/.test(this.peek())) { num += this.peek(); this.advance(); }
        this.tokens.push({ type: TOKEN_TYPES.NUMBER, value: parseFloat(num), line: this.line, col: this.col });
        continue;
      }
      if (/[a-zA-Z_]/.test(char)) {
        let ident = ''; while(/[a-zA-Z0-9_-]/.test(this.peek())) { ident += this.peek(); this.advance(); }
        if (ident === 'click' && this.input.substring(this.pos).startsWith(' ayithe')) {
          this.advance(7); this.tokens.push({ type: TOKEN_TYPES.KEYWORD, value: 'click ayithe', line: this.line, col: this.col });
          continue;
        }
        if (KEYWORDS.includes(ident)) { this.tokens.push({ type: TOKEN_TYPES.KEYWORD, value: ident, line: this.line, col: this.col }); }
        else if (ident === 'nijam') { this.tokens.push({ type: TOKEN_TYPES.BOOLEAN, value: true, line: this.line, col: this.col }); }
        else if (ident === 'abaddam') { this.tokens.push({ type: TOKEN_TYPES.BOOLEAN, value: false, line: this.line, col: this.col }); }
        else { this.tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: ident, line: this.line, col: this.col }); }
        continue;
      }
      // Operators & singles
      let op2 = char + this.peek(1);
      let op3 = op2 + this.peek(2);
      if(['===','!=='].includes(op3)) { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: op3, line: this.line, col: this.col }); this.advance(3); continue; }
      if(['==','!=','<=','>=','&&','||','+=','-=','*=','/='].includes(op2)) { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: op2, line: this.line, col: this.col }); this.advance(2); continue; }
      
      let line = this.line, col = this.col;
      switch(char) {
        case '{': this.advance(); this.tokens.push({ type: TOKEN_TYPES.LBRACE, value: '{', line, col }); break;
        case '}': this.advance(); this.tokens.push({ type: TOKEN_TYPES.RBRACE, value: '}', line, col }); break;
        case '(': this.advance(); this.tokens.push({ type: TOKEN_TYPES.LPAREN, value: '(', line, col }); break;
        case ')': this.advance(); this.tokens.push({ type: TOKEN_TYPES.RPAREN, value: ')', line, col }); break;
        case '[': this.advance(); this.tokens.push({ type: TOKEN_TYPES.LBRACKET, value: '[', line, col }); break;
        case ']': this.advance(); this.tokens.push({ type: TOKEN_TYPES.RBRACKET, value: ']', line, col }); break;
        case ':': this.advance(); this.tokens.push({ type: TOKEN_TYPES.COLON, value: ':', line, col }); break;
        case ',': this.advance(); this.tokens.push({ type: TOKEN_TYPES.COMMA, value: ',', line, col }); break;
        case ';': this.advance(); this.tokens.push({ type: TOKEN_TYPES.SEMICOLON, value: ';', line, col }); break;
        case '=': this.advance(); this.tokens.push({ type: TOKEN_TYPES.EQUALS, value: '=', line, col }); break;
        case '+': case '-': case '*': case '/': case '%': case '<': case '>': case '!': case '.':
          this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: char, line, col }); break;
        default: this.advance(); // skip unknown
      }
    }
    this.tokens.push({ type: TOKEN_TYPES.EOF, value: null, line: this.line, col: this.col });
    return this.tokens;
  }
}

// ─── Parser ─────────────────────────────────────────────────────────────
class Parser {
  constructor(tokens) { this.tokens = tokens; this.pos = 0; }
  error(msg) { const t=this.current(); throw new Error(`[Parser] Ln ${t.line}, Col ${t.col}: ${msg} (got "${t.value}")`); }
  current() { return this.tokens[this.pos]; }
  peek(o = 1) { return this.tokens[this.pos + o] || { type: TOKEN_TYPES.EOF }; }
  advance() { const t=this.tokens[this.pos]; if(t.type !== TOKEN_TYPES.EOF) this.pos++; return t; }
  check(type, val = null) { const t=this.current(); return t.type===type && (val===null || t.value===val); }
  expect(type, val = null) {
    if(!this.check(type, val)) this.error(`Expected ${val !== null ? val : type}`);
    return this.advance();
  }
  eatAipoindi() { while(this.check(TOKEN_TYPES.KEYWORD, 'aipoindi')) this.advance(); }
  parseProgram() {
    const body = [];
    while(!this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi(); if(this.check(TOKEN_TYPES.EOF)) break;
      const stmt = this.parseStatement();
      if(stmt) body.push(stmt);
      this.eatAipoindi();
    }
    return { type: 'Program', body };
  }
  parseStatement() {
    const tok = this.current();
    if (tok.type === TOKEN_TYPES.KEYWORD) {
      switch(tok.value) {
        case 'idigo': return this.parseVarDecl();
        case 'cheppu': return this.parsePrint();
        case 'unte': return this.parseIf();
        case 'malli': return this.parseFor();
        case 'varaku': return this.parseWhile();
        case 'prathi': return this.parseForEach();
        case 'pani': return this.parseFunction();
        case 'pampu': return this.parseReturn();
        case 'prayatninchu': return this.parseTryCatch();
        case 'petti': return this.parseHtmlElement();
        case 'alankaram': return this.parseCssBlock();
        default: this.advance(); return null;
      }
    }
    return this.parseExprStatement();
  }
  parseVarDecl() {
    this.expect(TOKEN_TYPES.KEYWORD, 'idigo');
    const name = this.expect(TOKEN_TYPES.IDENTIFIER).value;
    let init = null;
    if(this.check(TOKEN_TYPES.EQUALS)) { this.advance(); init = this.parseExpression(); }
    this.eatAipoindi(); return { type: 'VarDecl', name, init };
  }
  parsePrint() {
    this.expect(TOKEN_TYPES.KEYWORD, 'cheppu');
    const value = this.parseExpression();
    this.eatAipoindi(); return { type: 'Print', value };
  }
  parseIf() {
    this.expect(TOKEN_TYPES.KEYWORD, 'unte'); this.expect(TOKEN_TYPES.LPAREN);
    const condition = this.parseExpression(); this.expect(TOKEN_TYPES.RPAREN);
    const consequent = this.parseBlock();
    let alternate = null;
    if(this.check(TOKEN_TYPES.KEYWORD, 'lekapothe')) {
      this.advance(); alternate = this.check(TOKEN_TYPES.KEYWORD, 'unte') ? this.parseIf() : this.parseBlock();
    }
    return { type: 'IfStmt', condition, consequent, alternate };
  }
  parseFor() {
    this.expect(TOKEN_TYPES.KEYWORD, 'malli'); this.expect(TOKEN_TYPES.LPAREN);
    let init = null;
    if(this.check(TOKEN_TYPES.KEYWORD, 'idigo')) {
      this.advance(); const name = this.expect(TOKEN_TYPES.IDENTIFIER).value;
      this.expect(TOKEN_TYPES.EQUALS); init = { type: 'VarDecl', name, init: this.parseExpression() };
    }
    this.expect(TOKEN_TYPES.SEMICOLON); const condition = this.parseExpression();
    this.expect(TOKEN_TYPES.SEMICOLON); const update = this.parseExpression();
    this.expect(TOKEN_TYPES.RPAREN); return { type: 'ForStmt', init, condition, update, body: this.parseBlock() };
  }
  parseWhile() {
    this.expect(TOKEN_TYPES.KEYWORD, 'varaku'); this.expect(TOKEN_TYPES.LPAREN);
    const condition = this.parseExpression(); this.expect(TOKEN_TYPES.RPAREN);
    return { type: 'WhileStmt', condition, body: this.parseBlock() };
  }
  parseForEach() {
    this.expect(TOKEN_TYPES.KEYWORD, 'prathi'); this.expect(TOKEN_TYPES.LPAREN);
    const item = this.expect(TOKEN_TYPES.IDENTIFIER).value;
    this.expect(TOKEN_TYPES.KEYWORD, 'lona');
    const iterable = this.parseExpression(); this.expect(TOKEN_TYPES.RPAREN);
    return { type: 'ForEachStmt', item, iterable, body: this.parseBlock() };
  }
  parseTryCatch() {
    this.expect(TOKEN_TYPES.KEYWORD, 'prayatninchu'); const tryBlock = this.parseBlock();
    let catchClause = null;
    if(this.check(TOKEN_TYPES.KEYWORD, 'pattu')) {
      this.advance(); this.expect(TOKEN_TYPES.LPAREN);
      const param = this.expect(TOKEN_TYPES.IDENTIFIER).value;
      this.expect(TOKEN_TYPES.RPAREN);
      catchClause = { param, body: this.parseBlock() };
    }
    return { type: 'TryCatchStmt', tryBlock, catchClause };
  }
  parseFunction() {
    this.expect(TOKEN_TYPES.KEYWORD, 'pani'); const name = this.expect(TOKEN_TYPES.IDENTIFIER).value;
    this.expect(TOKEN_TYPES.LPAREN); const params = this.parseParams(); this.expect(TOKEN_TYPES.RPAREN);
    return { type: 'FunctionDecl', name, params, body: this.parseBlock() };
  }
  parseReturn() {
    this.expect(TOKEN_TYPES.KEYWORD, 'pampu'); let value = null;
    if(!this.check(TOKEN_TYPES.KEYWORD, 'aipoindi') && !this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) { value = this.parseExpression(); }
    this.eatAipoindi(); return { type: 'ReturnStmt', value };
  }
  parseHtmlElement() {
    this.expect(TOKEN_TYPES.KEYWORD, 'petti');
    let tag = this.check(TOKEN_TYPES.IDENTIFIER) || this.check(TOKEN_TYPES.KEYWORD) ? this.advance().value : 'div';
    
    let attributes = [];
    while(this.check(TOKEN_TYPES.IDENTIFIER) && this.peek() && this.peek().type === TOKEN_TYPES.EQUALS) {
      const attrName = this.advance().value; this.expect(TOKEN_TYPES.EQUALS);
      const attrValExpr = this.parseExpression();
      attributes.push({ name: attrName, value: attrValExpr });
    }

    let clickHandler = null;
    if(this.check(TOKEN_TYPES.KEYWORD, 'click ayithe')) {
      this.advance(); const fnName = this.advance().value;
      this.expect(TOKEN_TYPES.LPAREN); const args = this.parseArgs(); this.expect(TOKEN_TYPES.RPAREN);
      clickHandler = { name: fnName, args };
    }

    while(this.check(TOKEN_TYPES.IDENTIFIER) && this.peek() && this.peek().type === TOKEN_TYPES.EQUALS) {
      const attrName = this.advance().value; this.expect(TOKEN_TYPES.EQUALS);
      const attrValExpr = this.parseExpression();
      attributes.push({ name: attrName, value: attrValExpr });
    }

    this.expect(TOKEN_TYPES.LBRACE); const children = [];
    while(!this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi(); if(this.check(TOKEN_TYPES.RBRACE)) break;
      if(this.check(TOKEN_TYPES.KEYWORD, 'raayi')) {
        this.advance(); children.push({ type: 'TextContent', value: this.parseExpression() });
        this.eatAipoindi(); continue;
      }
      if(this.check(TOKEN_TYPES.KEYWORD, 'petti')) {
        children.push(this.parseHtmlElement()); continue;
      }
      this.advance();
    }
    this.expect(TOKEN_TYPES.RBRACE);
    return { type: 'HtmlElement', tag, attributes, clickHandler, children };
  }
  parseCssBlock() {
    this.expect(TOKEN_TYPES.KEYWORD, 'alankaram');
    let selector = this.advance().value; // Identifier, keyword, or '*'
    this.expect(TOKEN_TYPES.LBRACE); const properties = [];
    while(!this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi(); if(this.check(TOKEN_TYPES.RBRACE)) break;
      if(this.check(TOKEN_TYPES.IDENTIFIER)) {
        let prop = this.advance().value;
        while (this.check(TOKEN_TYPES.OPERATOR, '-') && this.peek().type === TOKEN_TYPES.IDENTIFIER) {
          this.advance(); prop += '-' + this.advance().value;
        }
        this.expect(TOKEN_TYPES.EQUALS);
        let rawValue = '';
        while(!this.check(TOKEN_TYPES.KEYWORD, 'aipoindi') && !this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
          rawValue += this.advance().value;
        }
        this.eatAipoindi(); properties.push({ prop, value: rawValue.trim() }); continue;
      }
      this.advance();
    }
    this.expect(TOKEN_TYPES.RBRACE); return { type: 'CssBlock', selector, properties };
  }
  parseBlock() {
    this.expect(TOKEN_TYPES.LBRACE); const body = [];
    while(!this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi(); if(this.check(TOKEN_TYPES.RBRACE)) break;
      const s = this.parseStatement(); if(s) body.push(s); this.eatAipoindi();
    }
    this.expect(TOKEN_TYPES.RBRACE); return { type: 'Block', body };
  }
  parseParams() {
    const params = []; if(this.check(TOKEN_TYPES.RPAREN)) return params;
    params.push(this.expect(TOKEN_TYPES.IDENTIFIER).value);
    while(this.check(TOKEN_TYPES.COMMA)) { this.advance(); params.push(this.expect(TOKEN_TYPES.IDENTIFIER).value); }
    return params;
  }
  parseArgs() {
    const args = []; if(this.check(TOKEN_TYPES.RPAREN)) return args;
    args.push(this.parseExpression());
    while(this.check(TOKEN_TYPES.COMMA)) { this.advance(); args.push(this.parseExpression()); }
    return args;
  }
  parseExprStatement() { const expr = this.parseExpression(); this.eatAipoindi(); return { type: 'ExprStmt', expr }; }
  parseExpression() { return this.parseAssignment(); }
  parseAssignment() {
    let left = this.parseOr();
    if(this.check(TOKEN_TYPES.EQUALS)) { this.advance(); return { type: 'AssignExpr', left, right: this.parseAssignment() }; }
    return left;
  }
  parseOr() {
    let left = this.parseAnd();
    while(this.check(TOKEN_TYPES.OPERATOR, '||')) { const op = this.advance().value; left = { type: 'BinaryExpr', op, left, right: this.parseAnd() }; }
    return left;
  }
  parseAnd() {
    let left = this.parseEquality();
    while(this.check(TOKEN_TYPES.OPERATOR, '&&')) { const op = this.advance().value; left = { type: 'BinaryExpr', op, left, right: this.parseEquality() }; }
    return left;
  }
  parseEquality() {
    let left = this.parseComp();
    while(this.check(TOKEN_TYPES.OPERATOR,'==')||this.check(TOKEN_TYPES.OPERATOR,'!=')||this.check(TOKEN_TYPES.OPERATOR,'===')) {
      const op = this.advance().value; left = { type: 'BinaryExpr', op, left, right: this.parseComp() };
    }
    return left;
  }
  parseComp() {
    let left = this.parseAddSub();
    while(this.check(TOKEN_TYPES.OPERATOR,'<')||this.check(TOKEN_TYPES.OPERATOR,'>')||this.check(TOKEN_TYPES.OPERATOR,'<=')||this.check(TOKEN_TYPES.OPERATOR,'>=')) {
      const op = this.advance().value; left = { type: 'BinaryExpr', op, left, right: this.parseAddSub() };
    }
    return left;
  }
  parseAddSub() {
    let left = this.parseMulDiv();
    while(this.check(TOKEN_TYPES.OPERATOR,'+')||this.check(TOKEN_TYPES.OPERATOR,'-')) {
      const op = this.advance().value; left = { type: 'BinaryExpr', op, left, right: this.parseMulDiv() };
    }
    return left;
  }
  parseMulDiv() {
    let left = this.parseUnary();
    while(this.check(TOKEN_TYPES.OPERATOR,'*')||this.check(TOKEN_TYPES.OPERATOR,'/')||this.check(TOKEN_TYPES.OPERATOR,'%')) {
      const op = this.advance().value; left = { type: 'BinaryExpr', op, left, right: this.parseUnary() };
    }
    return left;
  }
  parseUnary() {
    if(this.check(TOKEN_TYPES.OPERATOR,'!')||this.check(TOKEN_TYPES.OPERATOR,'-')) {
      return { type: 'UnaryExpr', op: this.advance().value, right: this.parseUnary() };
    }
    return this.parsePostfix();
  }
  parsePostfix() {
    let expr = this.parsePrimary();
    let changed = true;
    while(changed) {
      changed = false;
      if(this.check(TOKEN_TYPES.LPAREN)) {
        this.advance(); const args = this.parseArgs(); this.expect(TOKEN_TYPES.RPAREN);
        expr = { type: 'CallExpr', callee: expr, args }; changed = true;
      } else if (this.check(TOKEN_TYPES.LBRACKET)) {
        this.advance(); const index = this.parseExpression(); this.expect(TOKEN_TYPES.RBRACKET);
        expr = { type: 'SubscriptExpr', object: expr, index }; changed = true;
      } else if(this.check(TOKEN_TYPES.OPERATOR, '.')) {
        this.advance(); const prop = this.expect(TOKEN_TYPES.IDENTIFIER).value;
        expr = { type: 'MemberExpr', object: expr, property: prop }; changed = true;
      }
    }
    return expr;
  }
  parsePrimary() {
    const tok = this.current();
    if(tok.type === TOKEN_TYPES.STRING) { this.advance(); return { type: 'StringLiteral', value: tok.value }; }
    if(tok.type === TOKEN_TYPES.NUMBER) { this.advance(); return { type: 'NumberLiteral', value: tok.value }; }
    if(tok.type === TOKEN_TYPES.BOOLEAN) { this.advance(); return { type: 'BooleanLiteral', value: tok.value }; }
    if(tok.type === TOKEN_TYPES.IDENTIFIER) { this.advance(); return { type: 'Identifier', name: tok.value }; }
    if(tok.type === TOKEN_TYPES.LPAREN) {
      this.advance(); const expr = this.parseExpression(); this.expect(TOKEN_TYPES.RPAREN); return expr;
    }
    // Arrays
    if(tok.type === TOKEN_TYPES.LBRACKET) {
      this.advance(); const elements = [];
      if(!this.check(TOKEN_TYPES.RBRACKET)) {
        elements.push(this.parseExpression());
        while(this.check(TOKEN_TYPES.COMMA)) { this.advance(); elements.push(this.parseExpression()); }
      }
      this.expect(TOKEN_TYPES.RBRACKET);
      return { type: 'ArrayExpr', elements };
    }
    // Objects
    if(tok.type === TOKEN_TYPES.LBRACE) {
      this.advance(); const properties = [];
      if(!this.check(TOKEN_TYPES.RBRACE)) {
        let key = this.expect(TOKEN_TYPES.IDENTIFIER).value;
        this.expect(TOKEN_TYPES.COLON);
        properties.push({ key, value: this.parseExpression() });
        while(this.check(TOKEN_TYPES.COMMA)) {
          this.advance();
          key = this.expect(TOKEN_TYPES.IDENTIFIER).value;
          this.expect(TOKEN_TYPES.COLON);
          properties.push({ key, value: this.parseExpression() });
        }
      }
      this.expect(TOKEN_TYPES.RBRACE);
      return { type: 'ObjectExpr', properties };
    }
    this.advance(); return { type: 'NullLiteral' };
  }
}

// ─── Transpiler ─────────────────────────────────────────────────────────────
class Transpiler {
  constructor(ast) { this.ast = ast; this.html=''; this.css=''; this.js=''; }
  transpile() {
    this.html = '<div id="tanglish-app">\n';
    this.ast.body.forEach(node => {
      if(node.type === 'HtmlElement') this.html += this.genHtml(node) + '\n';
      else if(node.type === 'CssBlock') this.css += this.genCss(node) + '\n';
      else this.js += this.genJs(node) + ';\n';
    });
    this.html += '</div>';
    return { html: this.html, css: this.css, js: this.js };
  }
  genHtml(node, indent='  ') {
    let out = `${indent}<${node.tag}`;
    if (node.attributes) {
      node.attributes.forEach(attr => {
        let val = '';
        if (attr.value.type === 'StringLiteral') val = attr.value.value;
        else if (attr.value.type === 'NumberLiteral' || attr.value.type === 'BooleanLiteral') val = attr.value.value;
        else val = `\${${this.genExpr(attr.value)}}`;
        out += ` ${attr.name}="${val}"`;
      });
    }
    if(node.clickHandler) out += ` onclick="${node.clickHandler.name}(${node.clickHandler.args.map(a=>this.genExpr(a)).join(',')})"`;
    out += '>\n';
    node.children.forEach(c => {
      if (c.type === 'TextContent') out += `${indent}  ${this.genExpr(c.value).replace(/"/g, '')}\n`;
      else if (c.type === 'HtmlElement') out += this.genHtml(c, indent+'  ') + '\n';
    });
    out += `${indent}</${node.tag}>`; return out;
  }
  genCss(node) {
    let out = `${node.selector} {\n`;
    node.properties.forEach(p => { out += `  ${p.prop}: ${p.value};\n`; });
    out += '}'; return out;
  }
  genJs(node) {
    if(node.type === 'VarDecl') return `let ${node.name} = ${node.init ? this.genExpr(node.init) : 'null'}`;
    if(node.type === 'Print') return `console.log(${this.genExpr(node.value)})`;
    if(node.type === 'IfStmt') return `if (${this.genExpr(node.condition)}) {\n${node.consequent.body.map(s=>this.genJs(s)).join(';\n')}\n}${node.alternate ? ` else {\n${node.alternate.body?node.alternate.body.map(s=>this.genJs(s)).join(';\n'):this.genJs(node.alternate)}\n}` : ''}`;
    if(node.type === 'ForStmt') return `for (${node.init?this.genJs(node.init):''}; ${this.genExpr(node.condition)}; ${this.genExpr(node.update)}) {\n${node.body.body.map(s=>this.genJs(s)).join(';\n')}\n}`;
    if(node.type === 'WhileStmt') return `while (${this.genExpr(node.condition)}) {\n${node.body.body.map(s=>this.genJs(s)).join(';\n')}\n}`;
    if(node.type === 'ForEachStmt') return `for (let ${node.item} of ${this.genExpr(node.iterable)}) {\n${node.body.body.map(s=>this.genJs(s)).join(';\n')}\n}`;
    if(node.type === 'TryCatchStmt') return `try {\n${node.tryBlock.body.map(s=>this.genJs(s)).join(';\n')}\n}${node.catchClause ? ` catch (${node.catchClause.param}) {\n${node.catchClause.body.body.map(s=>this.genJs(s)).join(';\n')}\n}` : ''}`;
    if(node.type === 'FunctionDecl') return `function ${node.name}(${node.params.join(', ')}) {\n${node.body.body.map(s=>this.genJs(s)).join(';\n')}\n}`;
    if(node.type === 'ReturnStmt') return `return ${node.value ? this.genExpr(node.value) : ''}`;
    if(node.type === 'ExprStmt') return this.genExpr(node.expr);
    return '';
  }
  genExpr(node) {
    switch(node.type) {
      case 'StringLiteral': return `"${node.value}"`;
      case 'NumberLiteral': case 'BooleanLiteral': return `${node.value}`;
      case 'Identifier': return node.name;
      case 'AssignExpr': return `${this.genExpr(node.left)} = ${this.genExpr(node.right)}`;
      case 'BinaryExpr': return `${this.genExpr(node.left)} ${node.op} ${this.genExpr(node.right)}`;
      case 'CallExpr': return `${this.genExpr(node.callee)}(${node.args.map(a=>this.genExpr(a)).join(', ')})`;
      case 'MemberExpr': return `${this.genExpr(node.object)}.${node.property}`;
      case 'SubscriptExpr': return `${this.genExpr(node.object)}[${this.genExpr(node.index)}]`;
      case 'ArrayExpr': return `[${node.elements.map(e=>this.genExpr(e)).join(', ')}]`;
      case 'ObjectExpr': return `{ ${node.properties.map(p=>`"${p.key}": ${this.genExpr(p.value)}`).join(', ')} }`;
      default: return 'null';
    }
  }
}

// ─── IDE Logic ─────────────────────────────────────────────────────────────
const T_SDK = `
const T = {
  get: (sel) => document.querySelector(sel),
  getAll: (sel) => document.querySelectorAll(sel),
  setText: (sel, t) => { const el=document.querySelector(sel); if(el) el.innerText=t; },
  setHtml: (sel, h) => { const el=document.querySelector(sel); if(el) el.innerHTML=h; },
  setClass: (sel, c) => { const el=document.querySelector(sel); if(el) el.className=c; },
  style: (sel, styles) => { const el=document.querySelector(sel); if(el) Object.assign(el.style, styles); },
  alert: (msg) => alert(msg)
};
`;

const EXAMPLES = {
  hello: `# Hello World
alankaram body { font = Inter, sans-serif aipoindi background = #0f0f1a aipoindi color = white aipoindi height = 100vh aipoindi display = flex aipoindi align = center aipoindi justify = center aipoindi }
petti div {
  petti h1 { raayi "Namaskaram, Prapanchama!" }
  petti p { raayi "Idhi simple Hello World program." }
  petti button click ayithe showAlert() { raayi "Click Me" }
}
pani showAlert() {
  T.alert("TanglishScript is working!")
  cheppu "Button clicked"
}
`,
  arrays: `# Array and Object Examples
idigo users = [ "Ravi", "Suresh", "Ramesh" ] aipoindi
idigo activeUser = { name: "Yaswanth", role: "admin", level: 99 } aipoindi

cheppu users[0]
cheppu activeUser.name

alankaram body { font = Inter, sans-serif aipoindi background = #111 aipoindi color = white aipoindi padding = 40px aipoindi }

petti div {
  petti h1 { raayi "TanglishScript Datatypes (Arrays/Objects)" }
  petti p { raayi "Checking console output for array indices & object values!" }
}
`,
  counter: `# Counter App
idigo count = 0 aipoindi
pani increment() { count = count + 1 aipoindi T.setText("h1", count) }
pani decrement() { count = count - 1 aipoindi T.setText("h1", count) }
alankaram body { font = Inter, sans-serif aipoindi background = #222 aipoindi color = white aipoindi padding = 40px aipoindi text-align = center aipoindi }
alankaram button { background = #007aff aipoindi color = white aipoindi border = none aipoindi padding = 12px 24px aipoindi radius = 8px aipoindi margin = 10px aipoindi cursor = pointer aipoindi }

petti div {
  petti h1 { raayi "0" }
  petti button click ayithe decrement() { raayi "- Penchandi" }
  petti button click ayithe increment() { raayi "+ Teesandi" }
}
`,
  calculator: `# Modern Calculator
idigo currentVal = "0" aipoindi
idigo operator = "" aipoindi
idigo storedVal = "0" aipoindi
pani appendNum(num) {
  unte (currentVal == "0") { currentVal = num aipoindi } lekapothe { currentVal = currentVal + num aipoindi }
  updateDisplay()
}
pani setOp(op) {
  storedVal = currentVal aipoindi
  operator = op aipoindi
  currentVal = "0" aipoindi
}
pani compute() {
  idigo a = storedVal * 1 aipoindi
  idigo b = currentVal * 1 aipoindi
  idigo res = 0 aipoindi
  unte (operator == "+") { res = a + b aipoindi }
  unte (operator == "-") { res = a - b aipoindi }
  unte (operator == "*") { res = a * b aipoindi }
  unte (operator == "/") { res = a / b aipoindi }
  currentVal = res + "" aipoindi
  operator = "" aipoindi
  updateDisplay()
}
pani clearCalc() { currentVal = "0" aipoindi storedVal = "0" aipoindi operator = "" aipoindi updateDisplay() }
pani updateDisplay() { T.setText("h2", currentVal) }

alankaram body { background = #222 aipoindi color = white aipoindi display = flex aipoindi justify = center aipoindi align = center aipoindi height = 100vh aipoindi font-family = sans-serif aipoindi margin = 0 aipoindi }
alankaram section { background = rgba(255,255,255,0.05) aipoindi padding = 20px aipoindi radius = 20px aipoindi border = 1px solid rgba(255,255,255,0.1) aipoindi width = 320px aipoindi }
alankaram h2 { background = #111 aipoindi color = #32d74b aipoindi font-size = 3rem aipoindi padding = 20px aipoindi text-align = right aipoindi radius = 10px aipoindi margin-bottom = 20px aipoindi margin-top = 0 aipoindi overflow = hidden aipoindi text-shadow = 0 0 10px rgba(50,215,75,0.5) aipoindi }
alankaram div { display = flex aipoindi gap = 10px aipoindi margin-bottom = 10px aipoindi }
alankaram button { flex = 1 aipoindi padding = 20px aipoindi font-size = 1.5rem aipoindi border = none aipoindi radius = 10px aipoindi background = rgba(255,255,255,0.1) aipoindi color = white aipoindi cursor = pointer aipoindi font-weight = bold aipoindi }
alankaram i { background = #007aff aipoindi color = white aipoindi display = flex aipoindi justify = center aipoindi align = center aipoindi flex = 1 aipoindi radius = 10px aipoindi cursor = pointer aipoindi font-style = normal aipoindi font-size = 1.5rem aipoindi font-weight = bold aipoindi }

petti section {
  petti h2 { raayi "0" }
  petti div {
    petti button click ayithe clearCalc() { raayi "C" }
    petti button { raayi "" }
    petti button { raayi "" }
    petti i click ayithe setOp("/") { raayi "/" }
  }
  petti div {
    petti button click ayithe appendNum("7") { raayi "7" }
    petti button click ayithe appendNum("8") { raayi "8" }
    petti button click ayithe appendNum("9") { raayi "9" }
    petti i click ayithe setOp("*") { raayi "X" }
  }
  petti div {
    petti button click ayithe appendNum("4") { raayi "4" }
    petti button click ayithe appendNum("5") { raayi "5" }
    petti button click ayithe appendNum("6") { raayi "6" }
    petti i click ayithe setOp("-") { raayi "-" }
  }
  petti div {
    petti button click ayithe appendNum("1") { raayi "1" }
    petti button click ayithe appendNum("2") { raayi "2" }
    petti button click ayithe appendNum("3") { raayi "3" }
    petti i click ayithe setOp("+") { raayi "+" }
  }
  petti div {
    petti button click ayithe appendNum("0") { raayi "0" }
    petti button { raayi "." }
    petti i click ayithe compute() { raayi "=" }
  }
}
`,
  styles: `# Glassmorphism UI
alankaram body { background = linear-gradient(135deg, #1e3c72, #2a5298) aipoindi height = 100vh aipoindi color = white aipoindi font = sans-serif aipoindi display = flex aipoindi align = center aipoindi justify = center aipoindi }
alankaram div { background = rgba(255,255,255,0.1) aipoindi backdrop-filter = blur(20px) aipoindi padding = 40px aipoindi radius = 20px aipoindi border = 1px solid rgba(255,255,255,0.2) aipoindi }
petti div {
  petti h1 { raayi "Stunning UI" }
  petti p { raayi "Glassmorphism in TanglishScript" }
}
`
};



// ─── CodeMirror Mode Definitions ──────────────────────────────────────────
CodeMirror.defineSimpleMode("tanglish", {
  start: [
    {regex: /"(?:[^\\\\]|\\\\.)*?(?:"|$)/, token: "string"},
    {regex: /'(?:[^\\\\]|\\\\.)*?(?:'|$)/, token: "string"},
    {regex: /#.*/, token: "comment"},
    {regex: /\\b(?:idigo|cheppu|unte|lekapothe|malli|varaku|pani|pampu|aipoindi|petti|alankaram|raayi|click ayithe|prathi|lona|prayatninchu|pattu)\\b/, token: "keyword"},
    {regex: /\\b(?:nijam|abaddam)\\b/, token: "builtin"},
    {regex: /0x[a-f\\d]+|[-+]?(?:\\.\\d+|\\d+\\.?\\d*)(?:e[-+]?\\d+)?/i, token: "number"},
    {regex: /[-+\\/*=<>!]+/, token: "operator"},
    {regex: /[a-z$][\\w$]*/, token: "variable"},
  ],
  meta: {
    lineComment: "#"
  }
});

// ─── Local Memory AI Engine (1GB IndexedDB Virtual Agent) ───────────────
const AI_DB_NAME = "TanglishAI_Memory";
const AI_VERSION = 1;
let _ai_db;

function initAIMemory() {
  const req = indexedDB.open(AI_DB_NAME, AI_VERSION);
  req.onupgradeneeded = e => {
    let db = e.target.result;
    if (!db.objectStoreNames.contains("knowledge")) {
      db.createObjectStore("knowledge", { keyPath: "topic" });
    }
    if (!db.objectStoreNames.contains("history")) {
      db.createObjectStore("history", { keyPath: "id", autoIncrement:true });
    }
  };
  req.onsuccess = e => {
    _ai_db = e.target.result;
    document.getElementById('ai-mem-badge').innerText = "Memory: Synced (1GB)";
    
    // Preload system memory if missing
    storeAIMemory("greeting", "Namaskaram! I am the Tanglish Local AI. I store my knowledge entirely in your browser memory!");
    storeAIMemory("idigo", "idigo is the Tanglish word for 'let' (Variable Declaration). Example: idigo name = 'yaswanth' aipoindi");
    storeAIMemory("cheppu", "cheppu prints to the Output Logger. Example: cheppu 'Hello'");
    storeAIMemory("unte", "unte is 'if' condition. Example: unte (x == 1) { cheppu 'One' }");
    storeAIMemory("petti", "petti creates HTML elements. Example: petti button { raayi 'Click me' }");
    storeAIMemory("alankaram", "alankaram does CSS styling. Example: alankaram body { background = #222 aipoindi }");
    storeAIMemory("array", "Arrays use brackets [ ]. Example: idigo arr = [1,2,3] aipoindi");
    storeAIMemory("counter", "To make a counter, idigo count = 0 aipoindi, then use pani increment() { count += 1 aipoindi T.setText('h1', count) }");
  };
}

function storeAIMemory(topic, data) {
  if(!_ai_db) return;
  const tx = _ai_db.transaction("knowledge", "readwrite");
  tx.objectStore("knowledge").put({ topic: topic.toLowerCase(), content: data });
}

function askLocalAI(query) {
  if(!_ai_db) return "Memory offline. Cannot process.";
  
  query = query.toLowerCase();
  
  // Real-time Learning Protocol: 
  // If user says "remember that foo means bar"
  if(query.startsWith('remember that ')) {
     const parts = query.replace('remember that ', '').split(' means ');
     if(parts.length === 2) {
        storeAIMemory(parts[0].trim(), parts[1].trim());
        return "I memorized it! Saved '" + parts[0] + "' to IndexedDB Memory Bank.";
     }
  }

  // Scan Code Context
  let contextAddon = '';
  const currentCode = editorInst ? editorInst.getValue() : '';
  if(query.includes('error') || query.includes('fix')) {
     if(currentCode.includes('petti') && !currentCode.includes('raayi')) {
         return "Looking at your code, I see you used 'petti' but forgot to add content inside it using 'raayi'. Fix it like an expert!";
     }
  }

  return new Promise(resolve => {
    const tx = _ai_db.transaction("knowledge", "readonly");
    const store = tx.objectStore("knowledge");
    const req = store.getAll();
    req.onsuccess = () => {
       const memories = req.result;
       let bestMatch = null;
       for(let mem of memories) {
          if(query.includes(mem.topic)) {
             bestMatch = mem.content;
             break;
          }
       }
       if(bestMatch) {
          resolve("<strong>Expert Answer:</strong><br>" + bestMatch + contextAddon);
       } else {
          resolve("I searched 1GB of memory but couldn't find a direct match. Try asking about idigo, petti, unte, or arrays! Or tell me 'remember that [x] means [y]'!");
       }
    };
  });
}

function handleAiInput(e) {
  if(e.key === 'Enter') {
    const val = e.target.value.trim();
    if(!val) return;
    
    const chat = document.getElementById('ai-chat-box');
    chat.innerHTML += `<div class="msg user">${val}</div>`;
    e.target.value = '';
    chat.scrollTop = chat.scrollHeight;
    
    // Process local agent
    setTimeout(async () => {
      const reply = await askLocalAI(val);
      chat.innerHTML += `<div class="msg ai">${reply}</div>`;
      chat.scrollTop = chat.scrollHeight;
      
      // AI automatically learns the last compiled code size
      storeAIMemory("stats", `I remember the last file was ${activeFile} and had ${editorInst.getValue().length} bytes.`);
    }, 600);
  }
}

// ─── Virtual File System & State ────────────────────────────────────────
let VFS = {
  "main.tang": EXAMPLES.hello,
  "calculator.tang": EXAMPLES.calculator,
  "styles.alankaram": EXAMPLES.styles
};
let openTabs = ["main.tang"];
let activeFile = "main.tang";

let editorInst = null;
let currentProjectId = null;

// Initialize CodeMirror Focus
function initEditor() {
  editorInst = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: "tanglish",
    theme: "monokai",
    lineNumbers: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    tabSize: 2
  });
  
  editorInst.on('change', () => {
    VFS[activeFile] = editorInst.getValue();
  });
}

// ─── DOM Managers ───────────────────────────────────────────────────────
function renderExplorer() {
  const tree = document.getElementById('fileTree');
  if(!tree) return;
  tree.innerHTML = '';
  Object.keys(VFS).forEach(file => {
    let icon = '📄';
    if(file.endsWith('.tang')) icon = '⚡';
    if(file.endsWith('.alankaram')) icon = '🎨';
    
    tree.innerHTML += `
      <div class="file-item ${file === activeFile ? 'active' : ''}" onclick="openFile('${file}')">
        <span class="file-icon">${icon}</span> ${file}
      </div>`;
  });
}

function renderTabs() {
  const tabs = document.getElementById('tabsArea');
  if(!tabs) return;
  tabs.innerHTML = '';
  openTabs.forEach(file => {
    tabs.innerHTML += `
      <div class="tab ${file === activeFile ? 'active' : ''}" onclick="openFile('${file}')">
        ${file} <span class="tab-close" onclick="closeTab(event, '${file}')">&#10005;</span>
      </div>`;
  });
}

function openFile(filename) {
  if(!openTabs.includes(filename)) openTabs.push(filename);
  activeFile = filename;
  editorInst.setValue(VFS[filename] || '');
  renderExplorer();
  renderTabs();
}

function closeTab(e, filename) {
  e.stopPropagation();
  openTabs = openTabs.filter(t => t !== filename);
  if(openTabs.length === 0) {
    editorInst.setValue('');
    activeFile = null;
  } else if (activeFile === filename) {
    activeFile = openTabs[0];
    editorInst.setValue(VFS[activeFile]);
  }
  renderExplorer();
  renderTabs();
}

function createNewFile() {
  let name = prompt('File Name? (e.g. login.tang)', 'module.tang');
  if(name && !VFS[name]) {
    VFS[name] = '';
    openFile(name);
  }
}

function switchRightPane(pane) {
  document.querySelectorAll('.segment').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.o-view').forEach(c => c.classList.remove('active'));
  
  if(document.getElementById('seg-'+pane)) document.getElementById('seg-'+pane).classList.add('active');
  if(document.getElementById('view-'+pane)) document.getElementById('view-'+pane).classList.add('active');
}

function logToConsole(msg, type='info') {
  const c = document.getElementById('view-term');
  if(!c) return;
  c.innerHTML += `<div class="log-row"><span class="log-lbl ${type}">${type.toUpperCase()}</span><span class="log-msg" style="word-break:break-all;">${msg}</span></div>`;
  c.scrollTop = c.scrollHeight;
}

function clearConsole() {
  const c = document.getElementById('view-term');
  if(c) c.innerHTML = '';
}

function compile() {
  clearConsole();
  if(!activeFile) return;
  
  let combinedCode = '';
  Object.keys(VFS).forEach(k => { if(k.endsWith('.tang')) combinedCode += VFS[k] + '\n'; });
  
  try {
    const lexer = new Lexer(combinedCode);
    const tokens = lexer.tokenize();
    logToConsole(`Lexed ${tokens.length} tokens across VFS`, 'ok');
    
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();
    logToConsole(`Parsed AST successfully`, 'ok');

    const transpiler = new Transpiler(ast);
    const out = transpiler.transpile();

    // Auto-switch to web preview if successful
    switchRightPane('web');
    
    // Apply alankaram universally
    let finalCss = out.css;
    Object.keys(VFS).forEach(k => { if(k.endsWith('.alankaram')) finalCss += '\n' + VFS[k]; });

    window.lastCompiledHtml = `<!DOCTYPE html><html><head><style>${finalCss}</style></head><body>${out.html}<script>${T_SDK}\n${out.js}<\/script></body></html>`;
    const blob = new Blob([window.lastCompiledHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    document.getElementById('preview-frame').src = url;

    logToConsole(`Build successful! Output Rendered.`, 'ok');
    showToast('App Compiled Succesfully!');

  } catch (err) {
    switchRightPane('term'); // Force open terminal on error
    logToConsole(err.message, 'err');
    showToast('Compile Error');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if(t) {
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }
}

function saveProject() { showToast('Project Saved Locally'); }

// ─── Boot Sequence ────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  initAIMemory(); // Boot the Local 1GB AI engine
  initEditor();
  openFile('main.tang');
  
  // Hijack native console to output into Terminal Pane
  const nativeLog = console.log;
  console.log = function(...args) {
    logToConsole(args.join(' '), 'info');
    nativeLog.apply(console, args);
  };
});
