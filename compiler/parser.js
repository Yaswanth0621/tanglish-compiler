/**
 * TanglishScript Parser
 * Builds an Abstract Syntax Tree (AST) from the token stream.
 *
 * AST Node Types:
 *   Program, VarDecl, Print, IfStmt, WhileStmt, ForStmt,
 *   FunctionDecl, ReturnStmt, HtmlElement, CssBlock, ExprStmt,
 *   AssignExpr, BinaryExpr, UnaryExpr, CallExpr, Identifier,
 *   StringLiteral, NumberLiteral, BooleanLiteral
 */

const { TOKEN_TYPES } = require('./lexer');

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  error(msg) {
    const tok = this.current();
    throw new Error(`[Parser] Line ${tok.line}, Col ${tok.col}: ${msg} (got "${tok.value}")`);
  }

  current() { return this.tokens[this.pos]; }
  peek(offset = 1) { return this.tokens[this.pos + offset] || { type: TOKEN_TYPES.EOF }; }

  advance() {
    const tok = this.tokens[this.pos];
    if (tok.type !== TOKEN_TYPES.EOF) this.pos++;
    return tok;
  }

  check(type, value = null) {
    const tok = this.current();
    if (tok.type !== type) return false;
    if (value !== null && tok.value !== value) return false;
    return true;
  }

  expect(type, value = null) {
    if (!this.check(type, value)) {
      const expected = value !== null ? `"${value}"` : type;
      this.error(`Expected ${expected}`);
    }
    return this.advance();
  }

  // Optional: consume aipoindi (statement terminator)
  eatAipoindi() {
    while (this.check(TOKEN_TYPES.KEYWORD, 'aipoindi')) {
      this.advance();
    }
  }

  // ─── Program ────────────────────────────────────────────────────────────────
  parseProgram() {
    const body = [];
    while (!this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi();
      if (this.check(TOKEN_TYPES.EOF)) break;
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
      this.eatAipoindi();
    }
    return { type: 'Program', body };
  }

  // ─── Statements ─────────────────────────────────────────────────────────────
  parseStatement() {
    const tok = this.current();

    if (tok.type === TOKEN_TYPES.KEYWORD) {
      switch (tok.value) {
        case 'idigo':     return this.parseVarDecl();
        case 'cheppu':    return this.parsePrint();
        case 'unte':      return this.parseIf();
        case 'malli':     return this.parseFor();
        case 'varaku':    return this.parseWhile();
        case 'prathi':    return this.parseForEach();
        case 'pani':      return this.parseFunctionDecl();
        case 'pampu':     return this.parseReturn();
        case 'prayatninchu': return this.parseTryCatch();
        case 'petti':     return this.parseHtmlElement();
        case 'alankaram': return this.parseCssBlock();
        case 'apu':       this.advance(); return { type: 'BreakStmt' };
        case 'munduku':   this.advance(); return { type: 'ContinueStmt' };
        case 'varga':     return this.parseClassDecl();
        case 'teesuko':   return this.parseImport();
        case 'ivvu':      return this.parseExport();
        default:
          // unknown keyword — skip
          this.advance();
          return null;
      }
    }

    // Expression statement (assignments, calls, etc.)
    return this.parseExprStatement();
  }

  // idigo name [: type] = expr aipoindi
  parseVarDecl() {
    this.expect(TOKEN_TYPES.KEYWORD, 'idigo');
    const name = this.expect(TOKEN_TYPES.IDENTIFIER).value;

    // Optional type annotation: idigo x: sankhya = 5
    let typeAnnotation = null;
    if (this.check('COLON')) {
      this.advance();
      typeAnnotation = this.parseTypeAnnotation();
    }

    let init = null;
    if (this.check(TOKEN_TYPES.EQUALS)) {
      this.advance(); // consume '='
      init = this.parseExpression();
    }
    this.eatAipoindi();
    return { type: 'VarDecl', name, init, typeAnnotation };
  }

  // cheppu expr
  parsePrint() {
    this.expect(TOKEN_TYPES.KEYWORD, 'cheppu');
    const value = this.parseExpression();
    this.eatAipoindi();
    return { type: 'Print', value };
  }

  // unte (cond) { ... } lekapothe { ... }
  parseIf() {
    this.expect(TOKEN_TYPES.KEYWORD, 'unte');
    this.expect(TOKEN_TYPES.LPAREN);
    const condition = this.parseExpression();
    this.expect(TOKEN_TYPES.RPAREN);
    const consequent = this.parseBlock();

    let alternate = null;
    if (this.check(TOKEN_TYPES.KEYWORD, 'lekapothe')) {
      this.advance();
      if (this.check(TOKEN_TYPES.KEYWORD, 'unte')) {
        alternate = this.parseIf();
      } else {
        alternate = this.parseBlock();
      }
    }
    return { type: 'IfStmt', condition, consequent, alternate };
  }

  // malli (init; cond; update) { ... }
  parseFor() {
    this.expect(TOKEN_TYPES.KEYWORD, 'malli');
    this.expect(TOKEN_TYPES.LPAREN);

    // init
    let init = null;
    if (this.check(TOKEN_TYPES.KEYWORD, 'idigo')) {
      this.advance();
      const name = this.expect(TOKEN_TYPES.IDENTIFIER).value;
      this.expect(TOKEN_TYPES.EQUALS);
      const initVal = this.parseExpression();
      init = { type: 'VarDecl', name, init: initVal };
    }
    this.expect(TOKEN_TYPES.SEMICOLON);

    // condition
    const condition = this.parseExpression();
    this.expect(TOKEN_TYPES.SEMICOLON);

    // update
    const update = this.parseExpression();
    this.expect(TOKEN_TYPES.RPAREN);

    const body = this.parseBlock();
    return { type: 'ForStmt', init, condition, update, body };
  }

  // varaku (cond) { ... }
  parseWhile() {
    this.expect(TOKEN_TYPES.KEYWORD, 'varaku');
    this.expect(TOKEN_TYPES.LPAREN);
    const condition = this.parseExpression();
    this.expect(TOKEN_TYPES.RPAREN);
    const body = this.parseBlock();
    return { type: 'WhileStmt', condition, body };
  }

  // prathi (name lona expr) { ... }
  parseForEach() {
    this.expect(TOKEN_TYPES.KEYWORD, 'prathi');
    this.expect(TOKEN_TYPES.LPAREN);
    const item = this.expect(TOKEN_TYPES.IDENTIFIER).value;
    this.expect(TOKEN_TYPES.KEYWORD, 'lona');
    const iterable = this.parseExpression();
    this.expect(TOKEN_TYPES.RPAREN);
    const body = this.parseBlock();
    return { type: 'ForEachStmt', item, iterable, body };
  }

  // prayatninchu { ... } pattu (err) { ... }
  parseTryCatch() {
    this.expect(TOKEN_TYPES.KEYWORD, 'prayatninchu');
    const tryBlock = this.parseBlock();
    let catchClause = null;
    if (this.check(TOKEN_TYPES.KEYWORD, 'pattu')) {
      this.advance();
      this.expect(TOKEN_TYPES.LPAREN);
      const param = this.expect(TOKEN_TYPES.IDENTIFIER).value;
      this.expect(TOKEN_TYPES.RPAREN);
      const catchBlock = this.parseBlock();
      catchClause = { param, body: catchBlock };
    }
    return { type: 'TryCatchStmt', tryBlock, catchClause };
  }

  // pani name(params) { ... }
  parseFunctionDecl() {
    this.expect(TOKEN_TYPES.KEYWORD, 'pani');
    const name = this.expect(TOKEN_TYPES.IDENTIFIER).value;
    this.expect(TOKEN_TYPES.LPAREN);
    const params = this.parseParams();
    this.expect(TOKEN_TYPES.RPAREN);
    const body = this.parseBlock();
    return { type: 'FunctionDecl', name, params, body };
  }

  // varga ClassName [pedhasa ParentClass] { nirmana_pani(...) { ... } method() { ... } }
  parseClassDecl() {
    this.expect(TOKEN_TYPES.KEYWORD, 'varga');
    const name = this.expect(TOKEN_TYPES.IDENTIFIER).value;

    let superClass = null;
    if (this.check(TOKEN_TYPES.KEYWORD, 'pedhasa')) {
      this.advance();
      superClass = this.expect(TOKEN_TYPES.IDENTIFIER).value;
    }

    this.expect(TOKEN_TYPES.LBRACE);

    const methods = [];
    const properties = [];

    while (!this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi();
      if (this.check(TOKEN_TYPES.RBRACE)) break;

      // Check for constructor or method
      if (this.check(TOKEN_TYPES.KEYWORD, 'nirmana_pani')) {
        // Constructor
        this.advance();
        this.expect(TOKEN_TYPES.LPAREN);
        const params = this.parseParams();
        this.expect(TOKEN_TYPES.RPAREN);
        const body = this.parseBlock();
        methods.push({ type: 'MethodDef', name: 'constructor', params, body, isConstructor: true });
      } else if (this.check(TOKEN_TYPES.IDENTIFIER)) {
        // Method or property
        const methodName = this.advance().value;
        if (this.check(TOKEN_TYPES.LPAREN)) {
          // It's a method
          this.advance();
          const params = this.parseParams();
          this.expect(TOKEN_TYPES.RPAREN);
          const body = this.parseBlock();
          methods.push({ type: 'MethodDef', name: methodName, params, body });
        } else {
          // It's a property — could be initialized in constructor
          properties.push({ name: methodName });
        }
      } else {
        this.advance(); // skip unknown
      }
      this.eatAipoindi();
    }

    this.expect(TOKEN_TYPES.RBRACE);
    return { type: 'ClassDecl', name, superClass, methods, properties };
  }

  // pampu expr aipoindi
  parseReturn() {
    this.expect(TOKEN_TYPES.KEYWORD, 'pampu');
    let value = null;
    if (!this.check(TOKEN_TYPES.KEYWORD, 'aipoindi') && !this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
      value = this.parseExpression();
    }
    this.eatAipoindi();
    return { type: 'ReturnStmt', value };
  }

  // teesuko moduleName aipoindi or teesuko { x, y } from moduleName aipoindi
  parseImport() {
    this.expect(TOKEN_TYPES.KEYWORD, 'teesuko');

    let specifiers = [];
    let source = null;

    // Could be: teesuko "./utils" or teesuko { x, y } from "./math"
    if (this.check(TOKEN_TYPES.STRING)) {
      // teesuko "./path" pattern
      source = this.advance().value;
    } else if (this.check(TOKEN_TYPES.LBRACE)) {
      // teesuko { x, y } from "./module" pattern
      this.advance(); // consume {
      if (!this.check(TOKEN_TYPES.RBRACE)) {
        specifiers.push(this.expect(TOKEN_TYPES.IDENTIFIER).value);
        while (this.check(TOKEN_TYPES.COMMA)) {
          this.advance();
          specifiers.push(this.expect(TOKEN_TYPES.IDENTIFIER).value);
        }
      }
      this.expect(TOKEN_TYPES.RBRACE);
      // Expect "from" keyword (as IDENTIFIER)
      if (this.check(TOKEN_TYPES.IDENTIFIER) && this.current().value === 'from') {
        this.advance();
      }
      source = this.expect(TOKEN_TYPES.STRING).value;
    }

    this.eatAipoindi();
    return { type: 'ImportStmt', specifiers, source };
  }

  // ivvu name aipoindi or ivvu { x, y } aipoindi or ivvu x, y, z aipoindi
  parseExport() {
    this.expect(TOKEN_TYPES.KEYWORD, 'ivvu');

    let exports = [];

    if (this.check(TOKEN_TYPES.LBRACE)) {
      // ivvu { x, y } pattern
      this.advance(); // consume {
      if (!this.check(TOKEN_TYPES.RBRACE)) {
        exports.push(this.expect(TOKEN_TYPES.IDENTIFIER).value);
        while (this.check(TOKEN_TYPES.COMMA)) {
          this.advance();
          exports.push(this.expect(TOKEN_TYPES.IDENTIFIER).value);
        }
      }
      this.expect(TOKEN_TYPES.RBRACE);
    } else if (this.check(TOKEN_TYPES.IDENTIFIER)) {
      // ivvu name or ivvu x, y, z pattern
      exports.push(this.advance().value);
      while (this.check(TOKEN_TYPES.COMMA)) {
        this.advance();
        if (this.check(TOKEN_TYPES.IDENTIFIER)) {
          exports.push(this.advance().value);
        }
      }
    }

    this.eatAipoindi();
    return { type: 'ExportStmt', exports };
  }

  // petti tagName [click ayithe fn()] { children }
  parseHtmlElement() {
    this.expect(TOKEN_TYPES.KEYWORD, 'petti');

    // tag name — can be an identifier or a known HTML tag name
    let tag;
    if (this.check(TOKEN_TYPES.IDENTIFIER)) {
      tag = this.advance().value;
    } else if (this.check(TOKEN_TYPES.KEYWORD)) {
      // In case user mistakenly uses keyword as tag
      tag = this.advance().value;
    } else {
      this.error('Expected HTML tag name after "petti"');
    }

    // id/class modifiers: #id .class
    let id = null;
    let className = null;

    // Attributes: name="value" or name=expr
    let attributes = [];
    while (this.check(TOKEN_TYPES.IDENTIFIER) && this.peek() && this.peek().type === TOKEN_TYPES.EQUALS) {
      const attrName = this.advance().value;
      this.expect(TOKEN_TYPES.EQUALS);
      const attrValExpr = this.parseExpression();
      attributes.push({ name: attrName, value: attrValExpr });
    }

    // click ayithe handler()
    let clickHandler = null;
    if (this.check(TOKEN_TYPES.KEYWORD, 'click ayithe')) {
      this.advance();
      if (this.check(TOKEN_TYPES.IDENTIFIER)) {
        const fnName = this.advance().value;
        this.expect(TOKEN_TYPES.LPAREN);
        const args = this.parseArgs();
        this.expect(TOKEN_TYPES.RPAREN);
        clickHandler = { name: fnName, args };
      }
    }

    // After click ayithe there could be more attributes (like class/id) in my new syntax, but let's just stick to the order:
    // attributes -> click ayithe -> { children }
    while (this.check(TOKEN_TYPES.IDENTIFIER) && this.peek() && this.peek().type === TOKEN_TYPES.EQUALS) {
      const attrName = this.advance().value;
      this.expect(TOKEN_TYPES.EQUALS);
      const attrValExpr = this.parseExpression();
      attributes.push({ name: attrName, value: attrValExpr });
    }

    this.expect(TOKEN_TYPES.LBRACE);
    const children = [];
    while (!this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi();
      if (this.check(TOKEN_TYPES.RBRACE)) break;

      // raayi "text"
      if (this.check(TOKEN_TYPES.KEYWORD, 'raayi')) {
        this.advance();
        const text = this.parseExpression();
        children.push({ type: 'TextContent', value: text });
        this.eatAipoindi();
        continue;
      }

      // nested petti
      if (this.check(TOKEN_TYPES.KEYWORD, 'petti')) {
        children.push(this.parseHtmlElement());
        continue;
      }

      // skip unknown
      this.advance();
    }
    this.expect(TOKEN_TYPES.RBRACE);
    return { type: 'HtmlElement', tag, id, className, attributes, clickHandler, children };
  }

  // alankaram selector { prop = value aipoindi ... }
  parseCssBlock() {
    this.expect(TOKEN_TYPES.KEYWORD, 'alankaram');
    let selector;
    if (this.check(TOKEN_TYPES.IDENTIFIER)) {
      selector = this.advance().value;
    } else if (this.check(TOKEN_TYPES.KEYWORD)) {
      selector = this.advance().value;
    } else if (this.check(TOKEN_TYPES.OPERATOR, '*')) {
      selector = this.advance().value; // universal selector
    } else {
      this.error('Expected CSS selector after "alankaram"');
    }

    this.expect(TOKEN_TYPES.LBRACE);
    const properties = [];
    while (!this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi();
      if (this.check(TOKEN_TYPES.RBRACE)) break;

      // prop = value aipoindi (supports hyphenated props like box-sizing)
      if (this.check(TOKEN_TYPES.IDENTIFIER)) {
        let prop = this.advance().value;
        // handle hyphenated CSS properties: box - sizing → box-sizing
        while (this.check(TOKEN_TYPES.OPERATOR, '-') && this.peek() && this.peek().type === TOKEN_TYPES.IDENTIFIER) {
          this.advance(); // consume '-'
          prop += '-' + this.advance().value;
        }
        this.expect(TOKEN_TYPES.EQUALS);
        // Value is everything until aipoindi or }
        let rawValue = '';
        while (
          !this.check(TOKEN_TYPES.KEYWORD, 'aipoindi') &&
          !this.check(TOKEN_TYPES.RBRACE) &&
          !this.check(TOKEN_TYPES.EOF)
        ) {
          const t = this.advance();
          rawValue += t.value;
        }
        this.eatAipoindi();
        properties.push({ prop, value: rawValue.trim() });
        continue;
      }
      this.advance(); // skip
    }
    this.expect(TOKEN_TYPES.RBRACE);
    return { type: 'CssBlock', selector, properties };
  }

  // { stmts }
  parseBlock() {
    this.expect(TOKEN_TYPES.LBRACE);
    const stmts = [];
    while (!this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
      this.eatAipoindi();
      if (this.check(TOKEN_TYPES.RBRACE)) break;
      const s = this.parseStatement();
      if (s) stmts.push(s);
      this.eatAipoindi();
    }
    this.expect(TOKEN_TYPES.RBRACE);
    return { type: 'Block', body: stmts };
  }

  parseParams() {
    const params = [];
    if (this.check(TOKEN_TYPES.RPAREN)) return params;

    // Parse first param
    const paramName = this.expect(TOKEN_TYPES.IDENTIFIER).value;
    // Skip optional type annotation
    if (this.check('COLON')) {
      this.advance();
      this.parseTypeAnnotation();
    }
    params.push(paramName);

    while (this.check(TOKEN_TYPES.COMMA)) {
      this.advance();
      const name = this.expect(TOKEN_TYPES.IDENTIFIER).value;
      // Skip optional type annotation
      if (this.check('COLON')) {
        this.advance();
        this.parseTypeAnnotation();
      }
      params.push(name);
    }
    return params;
  }

  parseTypeAnnotation() {
    // Parse type like: sankhya, padamaala, nijam_abaddam, lista, sambandhitam
    if (this.check(TOKEN_TYPES.IDENTIFIER)) {
      const typeStr = this.advance().value;
      // Map Telugu type names to their underlying types
      const typeMap = {
        'sankhya': 'number',
        'padamaala': 'string',
        'nijam_abaddam': 'boolean',
        'lista': 'array',
        'sambandhitam': 'object'
      };
      return typeMap[typeStr] || typeStr;
    }
    return null;
  }

  parseArgs() {
    const args = [];
    if (this.check(TOKEN_TYPES.RPAREN)) return args;
    args.push(this.parseExpression());
    while (this.check(TOKEN_TYPES.COMMA)) {
      this.advance();
      args.push(this.parseExpression());
    }
    return args;
  }

  // ─── Expressions ────────────────────────────────────────────────────────────

  parseExprStatement() {
    const expr = this.parseExpression();
    this.eatAipoindi();
    return { type: 'ExprStmt', expr };
  }

  parseExpression() {
    return this.parseAssignment();
  }

  parseAssignment() {
    let left = this.parseOr();
    if (this.check(TOKEN_TYPES.EQUALS)) {
      this.advance();
      const right = this.parseAssignment();
      return { type: 'AssignExpr', left, right };
    }
    // Compound: += -= *= /=
    if (this.check(TOKEN_TYPES.OPERATOR)) {
      const op = this.current().value;
      if (['++=', '-=', '*=', '/='].includes(op)) {
        this.advance();
        const right = this.parseAssignment();
        return { type: 'AssignExpr', left, right: { type: 'BinaryExpr', op: op[0], left, right } };
      }
    }
    return left;
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.check(TOKEN_TYPES.OPERATOR, '||')) {
      const op = this.advance().value;
      const right = this.parseAnd();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseAnd() {
    let left = this.parseEquality();
    while (this.check(TOKEN_TYPES.OPERATOR, '&&')) {
      const op = this.advance().value;
      const right = this.parseEquality();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseEquality() {
    let left = this.parseComparison();
    while (
      this.check(TOKEN_TYPES.OPERATOR, '==') ||
      this.check(TOKEN_TYPES.OPERATOR, '===') ||
      this.check(TOKEN_TYPES.OPERATOR, '!=')
    ) {
      const op = this.advance().value;
      const right = this.parseComparison();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseComparison() {
    let left = this.parseAddSub();
    while (
      this.check(TOKEN_TYPES.OPERATOR, '<') ||
      this.check(TOKEN_TYPES.OPERATOR, '>') ||
      this.check(TOKEN_TYPES.OPERATOR, '<=') ||
      this.check(TOKEN_TYPES.OPERATOR, '>=')
    ) {
      const op = this.advance().value;
      const right = this.parseAddSub();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.check(TOKEN_TYPES.OPERATOR, '+') || this.check(TOKEN_TYPES.OPERATOR, '-')) {
      const op = this.advance().value;
      const right = this.parseMulDiv();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parseUnary();
    while (
      this.check(TOKEN_TYPES.OPERATOR, '*') ||
      this.check(TOKEN_TYPES.OPERATOR, '/') ||
      this.check(TOKEN_TYPES.OPERATOR, '%')
    ) {
      const op = this.advance().value;
      const right = this.parseUnary();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseUnary() {
    if (this.check(TOKEN_TYPES.OPERATOR, '!') || this.check(TOKEN_TYPES.OPERATOR, '-')) {
      const op = this.advance().value;
      const right = this.parseUnary();
      return { type: 'UnaryExpr', op, right };
    }
    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();
    // Handle ++ and --
    if (this.check(TOKEN_TYPES.OPERATOR, '++')) {
      this.advance();
      return { type: 'PostfixExpr', op: '++', expr };
    }
    if (this.check(TOKEN_TYPES.OPERATOR, '--')) {
      this.advance();
      return { type: 'PostfixExpr', op: '--', expr };
    }

    // Loop to handle chained: calls, member access, subscripts
    let changed = true;
    while (changed) {
      changed = false;
      // Function call
      if (this.check(TOKEN_TYPES.LPAREN)) {
        this.advance();
        const args = this.parseArgs();
        this.expect(TOKEN_TYPES.RPAREN);
        expr = { type: 'CallExpr', callee: expr, args };
        changed = true;
      }
      // Array subscript [index]
      else if (this.current().type === 'LBRACKET') {
        this.advance(); // consume '['
        const index = this.parseExpression();
        if (this.current().type === 'RBRACKET') this.advance(); // consume ']'
        expr = { type: 'SubscriptExpr', object: expr, index };
        changed = true;
      }
      // Member access
      else if (this.check(TOKEN_TYPES.OPERATOR, '.')) {
        this.advance();
        const prop = this.expect(TOKEN_TYPES.IDENTIFIER).value;
        expr = { type: 'MemberExpr', object: expr, property: prop };
        changed = true;
      }
    }
    return expr;
  }

  parsePrimary() {
    const tok = this.current();

    if (tok.type === TOKEN_TYPES.STRING) {
      this.advance();
      return { type: 'StringLiteral', value: tok.value };
    }

    if (tok.type === TOKEN_TYPES.NUMBER) {
      this.advance();
      return { type: 'NumberLiteral', value: tok.value };
    }

    if (tok.type === TOKEN_TYPES.BOOLEAN) {
      this.advance();
      return { type: 'BooleanLiteral', value: tok.value };
    }

    // vasthu = this
    if (tok.type === TOKEN_TYPES.KEYWORD && tok.value === 'vasthu') {
      this.advance();
      return { type: 'ThisExpr' };
    }

    // parinamam = new
    if (tok.type === TOKEN_TYPES.KEYWORD && tok.value === 'parinamam') {
      this.advance();
      const className = this.expect(TOKEN_TYPES.IDENTIFIER).value;
      this.expect(TOKEN_TYPES.LPAREN);
      const args = this.parseArgs();
      this.expect(TOKEN_TYPES.RPAREN);
      return { type: 'NewExpr', className, args };
    }

    // pani = function expression (anonymous function)
    if (tok.type === TOKEN_TYPES.KEYWORD && tok.value === 'pani') {
      this.advance();
      // Optional function name (but usually anonymous)
      let name = '';
      if (this.check(TOKEN_TYPES.IDENTIFIER)) {
        name = this.advance().value;
      }
      this.expect(TOKEN_TYPES.LPAREN);
      const params = this.parseParams();
      this.expect(TOKEN_TYPES.RPAREN);
      const body = this.parseBlock();
      return { type: 'FunctionExpr', name, params, body };
    }

    if (tok.type === TOKEN_TYPES.IDENTIFIER) {
      this.advance();
      return { type: 'Identifier', name: tok.value };
    }

    if (tok.type === TOKEN_TYPES.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TOKEN_TYPES.RPAREN);
      return expr;
    }

    // Arrays
    if (tok.type === 'LBRACKET') {
      this.advance();
      const elements = [];
      if (!this.check('RBRACKET') && !this.check(TOKEN_TYPES.EOF)) {
        elements.push(this.parseExpression());
        while (this.check(TOKEN_TYPES.COMMA)) {
          this.advance();
          elements.push(this.parseExpression());
        }
      }
      this.expect('RBRACKET');
      return { type: 'ArrayExpr', elements };
    }

    // Objects
    if (tok.type === TOKEN_TYPES.LBRACE) {
      this.advance();
      const properties = [];
      if (!this.check(TOKEN_TYPES.RBRACE) && !this.check(TOKEN_TYPES.EOF)) {
        let key = this.expect(TOKEN_TYPES.IDENTIFIER).value;
        this.expect('COLON');
        properties.push({ key, value: this.parseExpression() });
        while (this.check(TOKEN_TYPES.COMMA)) {
          this.advance();
          key = this.expect(TOKEN_TYPES.IDENTIFIER).value;
          this.expect('COLON');
          properties.push({ key, value: this.parseExpression() });
        }
      }
      this.expect(TOKEN_TYPES.RBRACE);
      return { type: 'ObjectExpr', properties };
    }

    // Fallback: skip and return null literal
    this.advance();
    return { type: 'NullLiteral' };
  }
}

module.exports = { Parser };
