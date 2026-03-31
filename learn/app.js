/**
 * TanglishScript Learning Platform & Certificate Generator
 */

// ─── Inline Compiler (Core Only) ───────────────────────────────────────
const TOKEN_TYPES = {
  KEYWORD: 'KEYWORD', IDENTIFIER: 'IDENTIFIER', NUMBER: 'NUMBER',
  STRING: 'STRING', BOOLEAN: 'BOOLEAN', OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION', EOF: 'EOF', LBRACE: 'LBRACE', RBRACE: 'RBRACE',
  LPAREN: 'LPAREN', RPAREN: 'RPAREN', LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET',
  COLON: 'COLON', COMMA: 'COMMA', SEMICOLON: 'SEMICOLON', EQUALS: 'EQUALS'
};
const KEYWORDS = ['idigo','cheppu','unte','lekapothe','malli','varaku','pani','pampu','aipoindi','petti','alankaram','raayi','click ayithe','prathi','lona','prayatninchu','pattu'];

class Lexer {
  constructor(input) { this.input = input; this.pos = 0; this.tokens = []; }
  advance(step = 1) { this.pos += step; }
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
          this.tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: hex }); continue;
        }
        while(this.peek() && this.peek() !== '\n') this.advance(); continue;
      }
      if (char === '"' || char === "'") {
        let quote = char; this.advance(); let str = '';
        while(this.peek() && this.peek() !== quote) { str += this.peek(); this.advance(); }
        this.advance(); this.tokens.push({ type: TOKEN_TYPES.STRING, value: str });
        continue;
      }
      if (/[0-9]/.test(char)) {
        let num = ''; while(/[0-9.]/.test(this.peek())) { num += this.peek(); this.advance(); }
        this.tokens.push({ type: TOKEN_TYPES.NUMBER, value: parseFloat(num) }); continue;
      }
      if (/[a-zA-Z_]/.test(char)) {
        let ident = ''; while(/[a-zA-Z0-9_-]/.test(this.peek())) { ident += this.peek(); this.advance(); }
        if (ident === 'click' && this.input.substring(this.pos).startsWith(' ayithe')) {
          this.advance(7); this.tokens.push({ type: TOKEN_TYPES.KEYWORD, value: 'click ayithe' }); continue;
        }
        if (KEYWORDS.includes(ident)) this.tokens.push({ type: TOKEN_TYPES.KEYWORD, value: ident });
        else if (ident === 'nijam') this.tokens.push({ type: TOKEN_TYPES.BOOLEAN, value: true });
        else if (ident === 'abaddam') this.tokens.push({ type: TOKEN_TYPES.BOOLEAN, value: false });
        else this.tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: ident });
        continue;
      }
      let op2 = char + this.peek(1), op3 = op2 + this.peek(2);
      if(['===','!=='].includes(op3)) { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: op3 }); this.advance(3); continue; }
      if(['==','!=','<=','>=','&&','||','+=','-=','*=','/='].includes(op2)) { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: op2 }); this.advance(2); continue; }
      
      switch(char) {
        case '{': this.tokens.push({ type: TOKEN_TYPES.LBRACE, value: '{' }); break;
        case '}': this.tokens.push({ type: TOKEN_TYPES.RBRACE, value: '}' }); break;
        case '(': this.tokens.push({ type: TOKEN_TYPES.LPAREN, value: '(' }); break;
        case ')': this.tokens.push({ type: TOKEN_TYPES.RPAREN, value: ')' }); break;
        case '[': this.tokens.push({ type: TOKEN_TYPES.LBRACKET, value: '[' }); break;
        case ']': this.tokens.push({ type: TOKEN_TYPES.RBRACKET, value: ']' }); break;
        case ':': this.tokens.push({ type: TOKEN_TYPES.COLON, value: ':' }); break;
        case ',': this.tokens.push({ type: TOKEN_TYPES.COMMA, value: ',' }); break;
        case ';': this.tokens.push({ type: TOKEN_TYPES.SEMICOLON, value: ';' }); break;
        case '=': this.tokens.push({ type: TOKEN_TYPES.EQUALS, value: '=' }); break;
        case '+': case '-': case '*': case '/': case '%': case '<': case '>': case '!': case '.':
          this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: char }); break;
      }
      this.advance();
    }
    this.tokens.push({ type: TOKEN_TYPES.EOF, value: null }); return this.tokens;
  }
}

class Parser {
  constructor(tokens) { this.tokens=tokens; this.pos=0; }
  current() { return this.tokens[this.pos]; }
  advance() { const t=this.tokens[this.pos]; if(t.type!=='EOF') this.pos++; return t; }
  check(type, val=null) { const t=this.current(); return t.type===type && (val===null || t.value===val); }
  expect(type, val=null) { if(!this.check(type, val)) throw new Error(`Parse err: expected ${val||type}`); return this.advance(); }
  eatAipoindi() { while(this.check('KEYWORD','aipoindi')) this.advance(); }
  
  parseProgram() { const body=[]; while(!this.check('EOF')){ this.eatAipoindi(); if(this.check('EOF')) break; const s=this.parseStmt(); if(s) body.push(s); this.eatAipoindi(); } return {type:'Program',body}; }
  parseStmt() {
    const t=this.current();
    if(t.type==='KEYWORD') {
      switch(t.value) {
        case 'idigo': return this.parseVar();
        case 'cheppu': return this.parsePrint();
        case 'unte': return this.parseIf();
        case 'malli': return this.parseFor();
        case 'varaku': return this.parseWhile();
        case 'prathi': return this.parseForEach();
        case 'pani': return this.parseFn();
        case 'pampu': return this.parseRet();
        case 'prayatninchu': return this.parseTryCatch();
        case 'petti': return this.parseHtml();
        case 'alankaram': return this.parseCss();
        default: this.advance(); return null;
      }
    }
    const expr = this.parseExpr(); this.eatAipoindi(); return {type:'ExprStmt', expr};
  }
  parseVar() { this.advance(); const name=this.expect('IDENTIFIER').value; let init=null; if(this.check('EQUALS')){ this.advance(); init=this.parseExpr(); } this.eatAipoindi(); return {type:'VarDecl', name, init}; }
  parsePrint() { this.advance(); const value=this.parseExpr(); this.eatAipoindi(); return {type:'Print', value}; }
  parseIf() { this.advance(); this.expect('LPAREN'); const cond=this.parseExpr(); this.expect('RPAREN'); const cons=this.parseBlock(); let alt=null; if(this.check('KEYWORD','lekapothe')){ this.advance(); alt=this.check('KEYWORD','unte')?this.parseIf():this.parseBlock(); } return {type:'IfStmt', condition:cond, consequent:cons, alternate:alt}; }
  parseFor() { this.advance(); this.expect('LPAREN'); let init=null; if(this.check('KEYWORD','idigo')){ this.advance(); const name=this.expect('IDENTIFIER').value; this.expect('EQUALS'); init={type:'VarDecl',name,init:this.parseExpr()}; } this.expect('SEMICOLON'); const cond=this.parseExpr(); this.expect('SEMICOLON'); const upd=this.parseExpr(); this.expect('RPAREN'); return {type:'ForStmt',init,condition:cond,update:upd,body:this.parseBlock()}; }
  parseWhile() { this.advance(); this.expect('LPAREN'); const cond=this.parseExpr(); this.expect('RPAREN'); return {type:'WhileStmt',condition:cond,body:this.parseBlock()}; }
  parseForEach() { this.advance(); this.expect('LPAREN'); const item = this.expect('IDENTIFIER').value; this.expect('KEYWORD', 'lona'); const iterable = this.parseExpr(); this.expect('RPAREN'); return {type:'ForEachStmt',item,iterable,body:this.parseBlock()}; }
  parseTryCatch() { this.advance(); const tryBlock = this.parseBlock(); let catchClause = null; if(this.check('KEYWORD', 'pattu')){ this.advance(); this.expect('LPAREN'); const param = this.expect('IDENTIFIER').value; this.expect('RPAREN'); catchClause = {param, body: this.parseBlock()}; } return {type:'TryCatchStmt', tryBlock, catchClause}; }
  parseFn() { this.advance(); const name=this.expect('IDENTIFIER').value; this.expect('LPAREN'); const params=[]; if(!this.check('RPAREN')){ params.push(this.expect('IDENTIFIER').value); while(this.check('COMMA')){ this.advance(); params.push(this.expect('IDENTIFIER').value); } } this.expect('RPAREN'); return {type:'FunctionDecl',name,params,body:this.parseBlock()}; }
  parseRet() { this.advance(); let value=null; if(!this.check('KEYWORD','aipoindi')&&!this.check('RBRACE')&&!this.check('EOF')) value=this.parseExpr(); this.eatAipoindi(); return {type:'ReturnStmt',value}; }
  parseHtml() {
    this.advance(); let tag=(this.check('IDENTIFIER')||this.check('KEYWORD'))?this.advance().value:'div';
    let attributes = [];
    while(this.check('IDENTIFIER') && this.tokens[this.pos+1] && this.tokens[this.pos+1].type === 'EQUALS') {
      const attrName = this.advance().value; this.expect('EQUALS');
      const attrValExpr = this.parseExpr();
      attributes.push({ name: attrName, value: attrValExpr });
    }
    let hc=null; if(this.check('KEYWORD','click ayithe')){ this.advance(); const fn=this.advance().value; this.expect('LPAREN'); const args=[]; if(!this.check('RPAREN')){ args.push(this.parseExpr()); while(this.check('COMMA')){ this.advance(); args.push(this.parseExpr()); } } this.expect('RPAREN'); hc={name:fn,args}; }
    while(this.check('IDENTIFIER') && this.tokens[this.pos+1] && this.tokens[this.pos+1].type === 'EQUALS') {
      const attrName = this.advance().value; this.expect('EQUALS');
      const attrValExpr = this.parseExpr();
      attributes.push({ name: attrName, value: attrValExpr });
    }
    this.expect('LBRACE'); const ch=[]; while(!this.check('RBRACE')&&!this.check('EOF')){ this.eatAipoindi(); if(this.check('RBRACE')) break; if(this.check('KEYWORD','raayi')){ this.advance(); ch.push({type:'TextContent',value:this.parseExpr()}); this.eatAipoindi(); continue; } if(this.check('KEYWORD','petti')){ ch.push(this.parseHtml()); continue; } this.advance(); } this.expect('RBRACE'); return {type:'HtmlElement',tag,attributes,clickHandler:hc,children:ch}; }
  parseCss() { this.advance(); let sel=this.advance().value; this.expect('LBRACE'); const props=[]; while(!this.check('RBRACE')&&!this.check('EOF')){ this.eatAipoindi(); if(this.check('RBRACE')) break; if(this.check('IDENTIFIER')){ let p=this.advance().value; while(this.check('OPERATOR','-')){ this.advance(); p+='-'+this.advance().value; } this.expect('EQUALS'); let v=''; while(!this.check('KEYWORD','aipoindi')&&!this.check('RBRACE')&&!this.check('EOF')) v+=this.advance().value; this.eatAipoindi(); props.push({prop:p,value:v.trim()}); continue; } this.advance(); } this.expect('RBRACE'); return {type:'CssBlock',selector:sel,properties:props}; }
  parseBlock() { this.expect('LBRACE'); const b=[]; while(!this.check('RBRACE')&&!this.check('EOF')){ this.eatAipoindi(); if(this.check('RBRACE')) break; const s=this.parseStmt(); if(s) b.push(s); this.eatAipoindi(); } this.expect('RBRACE'); return {type:'Block',body:b}; }
  
  parseExpr() { return this.parseAssign(); }
  parseAssign() { let l=this.parseOr(); if(this.check('EQUALS')){ this.advance(); return {type:'AssignExpr',left:l,right:this.parseAssign()}; } return l; }
  parseOr() { let l=this.parseAnd(); while(this.check('OPERATOR','||')){ l={type:'BinaryExpr',op:this.advance().value,left:l,right:this.parseAnd()}; } return l; }
  parseAnd() { let l=this.parseEq(); while(this.check('OPERATOR','&&')){ l={type:'BinaryExpr',op:this.advance().value,left:l,right:this.parseEq()}; } return l; }
  parseEq() { let l=this.parseCmp(); while(['==','!=','==='].includes(this.current().value)){ l={type:'BinaryExpr',op:this.advance().value,left:l,right:this.parseCmp()}; } return l; }
  parseCmp() { let l=this.parseAdd(); while(['<','>','<=','>='].includes(this.current().value)){ l={type:'BinaryExpr',op:this.advance().value,left:l,right:this.parseAdd()}; } return l; }
  parseAdd() { let l=this.parseMul(); while(['+','-'].includes(this.current().value)){ l={type:'BinaryExpr',op:this.advance().value,left:l,right:this.parseMul()}; } return l; }
  parseMul() { let l=this.parseUn(); while(['*','/','%'].includes(this.current().value)){ l={type:'BinaryExpr',op:this.advance().value,left:l,right:this.parseUn()}; } return l; }
  parseUn() { if(['!','-'].includes(this.current().value)) return {type:'UnaryExpr',op:this.advance().value,right:this.parseUn()}; return this.parsePost(); }
  parsePost() {
    let e=this.parsePri(); let chg=true;
    while(chg){
      chg=false;
      if(this.check('LPAREN')){ this.advance(); const args=[]; if(!this.check('RPAREN')){ args.push(this.parseExpr()); while(this.check('COMMA')){ this.advance(); args.push(this.parseExpr()); } } this.expect('RPAREN'); e={type:'CallExpr',callee:e,args}; chg=true; }
      else if(this.check('LBRACKET')){ this.advance(); const idx=this.parseExpr(); this.expect('RBRACKET'); e={type:'SubscriptExpr',object:e,index:idx}; chg=true; }
      else if(this.check('OPERATOR','.')){ this.advance(); const prop=this.expect('IDENTIFIER').value; e={type:'MemberExpr',object:e,property:prop}; chg=true; }
    }
    return e;
  }
  parsePri() {
    const t=this.current();
    if(t.type==='STRING'||t.type==='NUMBER'||t.type==='BOOLEAN'||t.type==='IDENTIFIER'){ this.advance(); return {type:t.type.charAt(0)+t.type.slice(1).toLowerCase()+'Literal', value:t.value, name:t.value}; }
    if(t.type==='LPAREN'){ this.advance(); const e=this.parseExpr(); this.expect('RPAREN'); return e; }
    if(t.type==='LBRACKET'){ this.advance(); const el=[]; if(!this.check('RBRACKET')){ el.push(this.parseExpr()); while(this.check('COMMA')){ this.advance(); el.push(this.parseExpr()); } } this.expect('RBRACKET'); return {type:'ArrayExpr',elements:el}; }
    if(t.type==='LBRACE'){ this.advance(); const pr=[]; if(!this.check('RBRACE')){ let k=this.expect('IDENTIFIER').value; this.expect('COLON'); pr.push({key:k,value:this.parseExpr()}); while(this.check('COMMA')){ this.advance(); k=this.expect('IDENTIFIER').value; this.expect('COLON'); pr.push({key:k,value:this.parseExpr()}); } } this.expect('RBRACE'); return {type:'ObjectExpr',properties:pr}; }
    this.advance(); return {type:'NullLiteral'};
  }
}

class Transpiler {
  constructor(ast) { this.ast=ast; this.js=''; this.html=''; this.css=''; }
  transpile() {
    this.ast.body.forEach(n=>{
      if(n.type==='HtmlElement') this.html+=this.genHtml(n, '')+'\n';
      else if(n.type==='CssBlock') this.css+=this.genCss(n)+'\n';
      else if(n.type==='Print') this.js+=`logOut(${this.genExpr(n.value)});\n`;
      else this.js+=this.genJs(n)+';\n';
    });
    return { js: this.js, html: this.html, css: this.css };
  }
  genHtml(node, indent='') {
    let out = `${indent}<${node.tag}`;
    if (node.attributes) {
      node.attributes.forEach(attr => {
        let val = '';
        if (attr.value.type === 'StringLiteral') val = attr.value.value;
        else if (attr.value.type === 'NumberLiteral' ||attr.value.type === 'BooleanLiteral') val = attr.value.value;
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
  genJs(n) {
    if(n.type==='VarDecl') return `let ${n.name}=${n.init?this.genExpr(n.init):'null'}`;
    if(n.type==='IfStmt') return `if(${this.genExpr(n.condition)}){\n${n.consequent.body.map(s=>this.genJs(s)||'').join(';\n')}\n}${n.alternate?` else {\n${n.alternate.body?n.alternate.body.map(s=>this.genJs(s)||'').join(';\n'):this.genJs(n.alternate)}\n}`:''}`;
    if(n.type==='ForStmt') return `for(${n.init?this.genJs(n.init):''};${this.genExpr(n.condition)};${this.genExpr(n.update)}){\n${n.body.body.map(s=>this.genJs(s)||'').join(';\n')}\n}`;
    if(n.type==='WhileStmt') return `while(${this.genExpr(n.condition)}){\n${n.body.body.map(s=>this.genJs(s)||'').join(';\n')}\n}`;
    if(n.type==='ForEachStmt') return `for(let ${n.item} of ${this.genExpr(n.iterable)}){\n${n.body.body.map(s=>this.genJs(s)||'').join(';\n')}\n}`;
    if(n.type==='TryCatchStmt') return `try{\n${n.tryBlock.body.map(s=>this.genJs(s)||'').join(';\n')}\n}${n.catchClause?`catch(${n.catchClause.param}){\n${n.catchClause.body.body.map(s=>this.genJs(s)||'').join(';\n')}\n}`:''}`;
    if(n.type==='FunctionDecl') return `function ${n.name}(${n.params.join(',')}){\n${n.body.body.map(s=>this.genJs(s)||'').join(';\n')}\n}`;
    if(n.type==='ReturnStmt') return `return ${n.value?this.genExpr(n.value):''}`;
    if(n.type==='ExprStmt') return this.genExpr(n.expr);
    return '';
  }
  genExpr(n) {
    if(n.type==='StringLiteral') return `"${n.value}"`;
    if(n.type==='NumberLiteral'||n.type==='BooleanLiteral'||n.type==='IdentifierLiteral') return `${n.value||n.name}`;
    if(n.type==='AssignExpr') return `${this.genExpr(n.left)}=${this.genExpr(n.right)}`;
    if(n.type==='BinaryExpr') return `${this.genExpr(n.left)}${n.op}${this.genExpr(n.right)}`;
    if(n.type==='CallExpr') return `${this.genExpr(n.callee)}(${n.args.map(a=>this.genExpr(a)).join(',')})`;
    if(n.type==='MemberExpr') return `${this.genExpr(n.object)}.${n.property}`;
    if(n.type==='SubscriptExpr') return `${this.genExpr(n.object)}[${this.genExpr(n.index)}]`;
    if(n.type==='ArrayExpr') return `[${n.elements.map(e=>this.genExpr(e)).join(',')}]`;
    if(n.type==='ObjectExpr') return `{${n.properties.map(p=>`"${p.key}":${this.genExpr(p.value)}`).join(',')}}`;
    return 'null';
  }
}

// ─── Course Application Logic ──────────────────────────────────────────

const LESSONS = [
  // ----------- CATEGORY: TANGLISH CORE ⚙️ -----------
  {
    id: 1, category: 'Tanglish Core ⚙️', title: '1. Hello World',
    prof_text: '<b>What is it?</b><br>In programming, we need a way to let the computer speak to us. In standard JavaScript, this is called `console.log`. In TanglishScript, it is called <b><code>cheppu</code></b> (say/tell).<br><br><b>Syntax:</b><br><code>cheppu [expression]</code><br><br><b>Did you know?</b><br>This is always the very first command a new programmer learns!',
    example_code: 'cheppu "Hello World!"\n',
    challenge_text: '<b>🎯 Challenge:</b> Print the exact phrase "Namaskaram!" using the `cheppu` command.',
    challenge_code: '# Print Namaskaram!\n',
    test: (logs) => logs.some(l => l.includes('Namaskaram!')),
    hint: 'Make sure you wrap the text in double quotes: `cheppu "Namaskaram!"`'
  },
  {
    id: 2, category: 'Tanglish Core ⚙️', title: '2. Comments',
    prof_text: '<b>What is it?</b><br>Comments are notes left in the code for humans to read. The computer totally ignores them! In JS we use `//`, but in TanglishScript we use the hash symbol <b><code>#</code></b>.<br><br><b>Syntax:</b><br><code># This is my note</code><br><br><b>Did you know?</b><br>Professionals leave comments everywhere to explain complex logic to their future selves.',
    example_code: '# I am invisible to the computer!\ncheppu "The computer only sees me."\n',
    challenge_text: '<b>🎯 Challenge:</b> Write a comment using the `#` symbol, and then on the next line print "Done".',
    challenge_code: '# Write a comment below this line:\n\n# Print Done below:\n',
    test: (logs) => logs.some(l => l.includes('Done')),
    hint: 'Type `# my comment` on line 1, and `cheppu "Done"` on line 2.'
  },
  {
    id: 3, category: 'Tanglish Core ⚙️', title: '3. Variables',
    prof_text: '<b>What is it?</b><br>Variables are just standard boxes to store data. In TanglishScript, you create a box using <b><code>idigo</code></b> ("here is"), give it a name, set it using `=`, and tell the parser it\'s finished by typing <b><code>aipoindi</code></b>.<br><br><b>Syntax:</b><br><code>idigo [name] = [value] aipoindi</code><br><br><b>Did you know?</b><br>This maps exactly to `let [name] = [value];` in JavaScript!',
    example_code: 'idigo age = 100 aipoindi\ncheppu age\n',
    challenge_text: '<b>🎯 Challenge:</b> Create a variable named `vayas` and set it to 25. Then print it.',
    challenge_code: 'idigo vayas = 25 aipoindi\n\n# print vayas:\n',
    test: (logs) => logs.some(l => l.includes('25')),
    hint: 'On line 3, write `cheppu vayas`.'
  },
  {
    id: 4, category: 'Tanglish Core ⚙️', title: '4. Data Types',
    prof_text: '<b>What is it?</b><br>Boxes (variables) can hold different types of things. <br>1. <b>Strings</b> (text wrapped in Quotes `"Hi"`)<br>2. <b>Numbers</b> (just math values `42`)<br>3. <b>Booleans</b> (True or False logic `true` `false`).<br><br><b>Did you know?</b><br>You should never wrap numbers or booleans in quotes, otherwise the computer will treat them as raw text!',
    example_code: 'idigo name = "Yaswanth" aipoindi\nidigo active = true aipoindi\nidigo score = 99 aipoindi\n\ncheppu score\n',
    challenge_text: '<b>🎯 Challenge:</b> Create a boolean variable `isPro = true aipoindi` and print it.',
    challenge_code: '# create isPro and print it\n',
    test: (logs) => logs.some(l => l.includes('true')),
    hint: 'Type `idigo isPro = true aipoindi` and then `cheppu isPro`.'
  },
  {
    id: 5, category: 'Tanglish Core ⚙️', title: '5. Arithmetic Operators',
    prof_text: '<b>What is it?</b><br>TanglishScript uses universally standard keyboard symbols for math: `+`, `-`, `*` (multiply), and `/` (divide).<br><br><b>Syntax:</b><br><code>idigo result = 10 * 5 aipoindi</code><br><br><b>Did you know?</b><br>You can do math directly inside print statements too!',
    example_code: 'idigo a = 10 aipoindi\nidigo result = a * 5 aipoindi\ncheppu result\n',
    challenge_text: '<b>🎯 Challenge:</b> Divide 100 by 5 and print the result physically.',
    challenge_code: 'idigo a = 100 aipoindi\n\n# print a / 5\n',
    test: (logs) => logs.some(l => l.includes('20')),
    hint: 'Write `cheppu a / 5`'
  },
  {
    id: 6, category: 'Tanglish Core ⚙️', title: '6. Strings & Concatenation',
    prof_text: '<b>What is it?</b><br>If you use the `+` operator on <i>Strings</i> (text), it glues them together rather than doing math. This is called "Concatenation".<br><br><b>Syntax:</b><br><code>cheppu "Hi " + "there"</code> results in `"Hi there"`.',
    example_code: 'idigo greeting = "Namaskaram " aipoindi\nidigo user = "Developer" aipoindi\ncheppu greeting + user\n',
    challenge_text: '<b>🎯 Challenge:</b> Concatenate "Level " and 100 to print "Level 100".',
    challenge_code: 'idigo base = "Level " aipoindi\n\n# cheppu base + 100\n',
    test: (logs) => logs.some(l => l.includes('Level 100')),
    hint: 'Write `cheppu base + 100`.'
  },
  {
    id: 7, category: 'Tanglish Core ⚙️', title: '7. Variable Reassignment',
    prof_text: '<b>What is it?</b><br>Variables can change! You only say `idigo` the *first* time you make the box. Afterwards, just name the box and set a new value!<br><br><b>Syntax:</b><br><code>x = 5 aipoindi</code> <br><code>x = x + 1 aipoindi</code> (now x is 6!).',
    example_code: 'idigo score = 0 aipoindi\ncheppu score\n\n# Reassignment\nscore = score + 10 aipoindi\ncheppu score\n',
    challenge_text: '<b>🎯 Challenge:</b> Increase `coins` by 5 and print it.',
    challenge_code: 'idigo coins = 10 aipoindi\n# Reassign coins to coins + 5, then print it\n',
    test: (logs) => logs.some(l => l.includes('15')),
    hint: 'Write `coins = coins + 5 aipoindi` and then `cheppu coins`.'
  },
  {
    id: 8, category: 'Tanglish Core ⚙️', title: '8. The "unte" Statement',
    prof_text: '<b>What is it?</b><br>Programs need logic! To make decisions, use <b><code>unte</code></b> ("if present/true"). The code block `{ }` only runs if whatever is in the `( )` evaluates to true.<br><br><b>Syntax:</b><br><code>unte ( [condition] ) { [code] }</code>',
    example_code: 'idigo isReady = true aipoindi\nunte (isReady) {\n  cheppu "Go!"\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Tell the program to print "Yes", because `10 > 5` is true.',
    challenge_code: 'unte (10 > 5) {\n  # print "Yes"\n}\n',
    test: (logs) => logs.some(l => l.includes('Yes')),
    hint: 'Inside the brackets, write `cheppu "Yes"`.'
  },
  {
    id: 9, category: 'Tanglish Core ⚙️', title: '9. The "lekapothe" Statement',
    prof_text: '<b>What is it?</b><br>If an `unte` condition fails, we can catch it using <b><code>lekapothe</code></b> ("otherwise / else").<br><br><b>Syntax:</b><br><code>unte ( false ) { } lekapothe { [fallback code] }</code>',
    example_code: 'idigo score = 20 aipoindi\nunte (score > 50) {\n  cheppu "Pass"\n} lekapothe {\n  cheppu "Fail"\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Since `10 > 100` is false, print "No" in the fallback block.',
    challenge_code: 'unte (10 > 100) {\n  cheppu "Yes"\n} lekapothe {\n  # print "No"\n}\n',
    test: (logs) => logs.some(l => l.includes('No')),
    hint: 'Inside the lekapothe brackets, write `cheppu "No"`.'
  },
  {
    id: 10, category: 'Tanglish Core ⚙️', title: '10. Comparison Operators',
    prof_text: '<b>What is it?</b><br>To check conditions, you need comparisons: `>` (greater), `<` (lesser), `>=` (greater/equal), and `==` (is strictly equal).<br><br><b>Did you know?</b><br>One `=` is for setting a variable. Two `==` are for comparing variables! Do not mix them up!',
    example_code: 'idigo passWord = "admin" aipoindi\nunte (passWord == "admin") {\n  cheppu "Access Granted!"\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Fill in the condition `x == 50` so it prints "Matched!".',
    challenge_code: 'idigo x = 50 aipoindi\nunte ( x == 50 ) {\n  cheppu "Matched!"\n}\n',
    test: (logs) => logs.some(l => l.includes('Matched!')),
    hint: 'Ensure that you check `unte( x == 50 )` and print "Matched!"'
  },
  {
    id: 11, category: 'Tanglish Core ⚙️', title: '11. Logical Operators',
    prof_text: '<b>What is it?</b><br>Sometimes you need multiple checks. <br>`&&` means AND (both must be true). <br>`||` means OR (only one needs to be true).',
    example_code: 'idigo cash = 100 aipoindi\nidigo age = 20 aipoindi\nunte (cash > 50 && age > 18) {\n  cheppu "You can buy this!"\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Print "Valid" if `a > 1` OR (`||`) `b > 1`.',
    challenge_code: 'idigo a = 5 aipoindi\nidigo b = 0 aipoindi\nunte ( a > 1 || b > 1 ) {\n  # print "Valid"\n}\n',
    test: (logs) => logs.some(l => l.includes('Valid')),
    hint: 'Ensure inside unte you write `cheppu "Valid"`.'
  },
  {
    id: 12, category: 'Tanglish Core ⚙️', title: '12. While Loops',
    prof_text: '<b>What is it?</b><br>Loops repeat code so you don\'t have to. The <b><code>varaku</code></b> ("until / while") loop checks a condition and repeats the `{ }` block until it becomes false.<br><br><b>Syntax:</b><br><code>varaku ( condition ) { [repeat this] }</code>',
    example_code: 'idigo time = 3 aipoindi\nvaraku (time > 0) {\n  cheppu time\n  time = time - 1 aipoindi\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Run the loop to print 0, then 1, then 2.',
    challenge_code: 'idigo x = 0 aipoindi\nvaraku (x < 3) {\n  cheppu x\n  x = x + 1 aipoindi\n}\n',
    test: (logs) => logs.includes('0') && logs.includes('1') && logs.includes('2'),
    hint: 'Press Run Test! The loop will correctly print x, then increase x by 1 each time.'
  },
  {
    id: 13, category: 'Tanglish Core ⚙️', title: '13. Try & Catch Errors',
    prof_text: '<b>What is it?</b><br>Professional apps shouldn\'t crash when there\'s a bug. Tanglish handles this gracefully with <b><code>prayatninchu</code></b> ("try") and <b><code>pattu</code></b> ("catch").<br><br><b>Syntax:</b><br><code>prayatninchu { [risky code] } pattu (err) { [fallback code] }</code>',
    example_code: 'prayatninchu {\n  cheppu I_DO_NOT_EXIST\n} pattu (e) {\n  cheppu "We caught a bug!"\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Complete the catch block and print "Error Caught!".',
    challenge_code: 'prayatninchu {\n  cheppu unknown_var\n} pattu (err) {\n  # cheppu "Error Caught!" \n}\n',
    test: (logs) => logs.some(l => l.includes('Error Caught!')),
    hint: 'Inside pattu, write `cheppu "Error Caught!"`'
  },
  
  // ----------- CATEGORY: ARRAYS & OBJECTS 📦 -----------
  {
    id: 14, category: 'Arrays & Objects 📦', title: '14. Functions Introduction',
    prof_text: '<b>What is it?</b><br>Functions are self-contained mini-programs that you can reuse. You create one using <b><code>pani</code></b> ("task").<br><br><b>Syntax:</b><br><code>pani [name]([inputs]) { }</code><br>And you run it by typing `name()`.',
    example_code: 'pani sayHi() {\n  cheppu "Hi Programmer"\n}\nsayHi()\nsayHi()\n',
    challenge_text: '<b>🎯 Challenge:</b> Create a function `hello()` that prints "Hello", then call it.',
    challenge_code: 'pani hello() {\n  # print "Hello"\n}\n# call hello()\n',
    test: (logs) => logs.some(l => l.includes('Hello')),
    hint: 'Use `cheppu "Hello"` inside the pani, and `hello()` outside.'
  },
  {
    id: 15, category: 'Arrays & Objects 📦', title: '15. Returning Values',
    prof_text: '<b>What is it?</b><br>Functions often calculate things and need to "send" the result back to whoever called it. Use <b><code>pampu</code></b> ("return") followed by `aipoindi`.',
    example_code: 'pani multiply(a, b) {\n  pampu a * b aipoindi\n}\nidigo result = multiply(2, 5) aipoindi\ncheppu result\n',
    challenge_text: '<b>🎯 Challenge:</b> Create a function `add(10,5)` that returns their sum. Print it.',
    challenge_code: 'pani add(a, b) {\n  pampu a + b aipoindi\n}\ncheppu add(10, 5)\n',
    test: (logs) => logs.some(l => l.includes('15')),
    hint: 'Press Run! The function adds `a+b` and sends it back to the `cheppu`.'
  },
  {
    id: 16, category: 'Arrays & Objects 📦', title: '16. Understanding Arrays',
    prof_text: '<b>What is it?</b><br>Arrays are lists of variables in one box. They use `[ ]` brackets, separated by commas. Wait, remember: Computers start counting at `0`! So `[0]` gets the first item.',
    example_code: 'idigo arr = ["Red", "Blue", "Green"] aipoindi\ncheppu arr[0]\n',
    challenge_text: '<b>🎯 Challenge:</b> Print the 2nd item ("One") from the provided array.',
    challenge_code: 'idigo arr = ["Zero", "One", "Two"] aipoindi\n\n# print arr[1]\n',
    test: (logs) => logs.some(l => l.includes('One')),
    hint: 'Since computer counts start at 0, "One" is index 1. Write `cheppu arr[1]`.'
  },
  {
    id: 17, category: 'Arrays & Objects 📦', title: '17. The For-Each Loop',
    prof_text: '<b>What is it?</b><br>To easily loop over every item in an array, use <b><code>prathi ([curr] lona [arr])</code></b>. It means "for each item in array".<br><br><b>Did you know?</b><br>This maps natively to modern JS `for (let item of array)`!',
    example_code: 'idigo fruits = ["Apple", "Mango"] aipoindi\nprathi (f lona fruits) {\n  cheppu f\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Use `prathi` to print every fruit in the array.',
    challenge_code: 'idigo list = ["Banana", "Kiwi"] aipoindi\nprathi (f lona list) {\n  # cheppu f\n}\n',
    test: (logs) => logs.includes('Banana') && logs.includes('Kiwi'),
    hint: 'Inside the loop block, just write `cheppu f`.'
  },
  {
    id: 18, category: 'Arrays & Objects 📦', title: '18. Understanding Objects',
    prof_text: '<b>What is it?</b><br>Objects are super-variables that map named "Keys" to "Values". They use `{ key: "value" }`. Access the value by typing `objectName.keyName`.',
    example_code: 'idigo user = { name: "Alice", age: 30 } aipoindi\ncheppu user.name\n',
    challenge_text: '<b>🎯 Challenge:</b> Print the user\'s role "Developer".',
    challenge_code: 'idigo user = { name: "John", role: "Developer" } aipoindi\n# cheppu user.role\n',
    test: (logs) => logs.some(l => l.includes('Developer')),
    hint: 'Write `cheppu user.role`'
  },

  // ----------- CATEGORY: TANGLISH HTML ELEMENT 🧱 -----------
  {
    id: 19, category: 'Tanglish HTML 🧱', title: '19. Introduction to Web UI',
    prof_text: '<b>What is it?</b><br>Welcome to Tanglish HTML! TanglishScript allows you to directly build User Interfaces using the <b><code>petti</code></b> keyword (meaning "box").<br><br><b>Syntax:</b><br><code>petti [tagname] { }</code><br><br>If it runs correctly, it renders pure HTML natively over to the "Live Web Preview"!',
    example_code: 'petti h3 {\n  raayi "I rendered in the browser!"\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Render an `h1` header box.',
    challenge_code: 'petti h1 {\n  raayi "Hello DOM"\n}\n',
    test: (logs, html) => html && html.includes('Hello DOM'),
    hint: 'Run the test! We gave you the code.'
  },
  {
    id: 20, category: 'Tanglish HTML 🧱', title: '20. Writing Text Nodes (Raayi)',
    prof_text: '<b>What is it?</b><br>To put text *inside* a `petti` box, you must use <b><code>raayi</code></b> ("write"). It is the equivalent of Javascript\'s `innerHTML`.<br><br><b>Syntax:</b><br><code>raayi "Your text here"</code> or even <code>raayi myVariable</code>!',
    example_code: 'idigo name = "Yaswanth" aipoindi\npetti p {\n  raayi "My name is: "\n  raayi name\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Write "The Boss" inside the span petti using raayi.',
    challenge_code: 'petti span {\n  # write "The Boss"\n}\n',
    test: (logs, html) => html && html.includes('The Boss'),
    hint: 'Type `raayi "The Boss"` inside the span brackets.'
  },
  {
    id: 21, category: 'Tanglish HTML 🧱', title: '21. Nesting UI Elements',
    prof_text: '<b>What is it?</b><br>You can place a `petti` inside another `petti`! The parser beautifully manages the DOM tree for you.',
    example_code: 'petti div {\n  petti h1 { raayi "Title" }\n  petti p { raayi "Description" }\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Inside the `div`, create another `petti b { }` that writes "Bold".',
    challenge_code: 'petti div {\n  # petti b { raayi "Bold" }\n}\n',
    test: (logs, html) => html && html.includes('<b>Bold</b>'),
    hint: 'Type `petti b { raayi "Bold" }`.'
  },
  {
    id: 22, category: 'Tanglish HTML 🧱', title: '22. HTML Tag Attributes',
    prof_text: '<b>What is it?</b><br>Standard HTML tags need attributes (like `id`, `class`, `src`). TanglishScript accepts them naturally! Just write them after the tag name and before the brace `{`.<br><br><b>Syntax:</b><br><code>petti div id="main" class="container" { }</code>',
    example_code: 'petti a href="https://google.com" target="_blank" {\n  raayi "Click to go to Google"\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Add `id="root"` and `class="card"` to the div.',
    challenge_code: 'petti div id="root" class="card" {\n  raayi "Attributes"\n}\n',
    test: (logs, html) => html && html.includes('id="root"') && html.includes('class="card"'),
    hint: 'Just click Run!'
  },

  // ----------- CATEGORY: TANGLISH CSS & STYLES 🎨 -----------
  {
    id: 23, category: 'Tanglish CSS & Styles 🎨', title: '23. Applying CSS Rules',
    prof_text: '<b>What is it?</b><br>We build beautiful UIs via Native TanglishCSS! Use <b><code>alankaram</code></b> ("decoration/style"), tell it the target class selector, and define properties like variables (ending in `aipoindi`).<br><br><b>Syntax:</b><br><code>alankaram .classname { prop = "val" aipoindi }</code>',
    example_code: 'alankaram .cool {\n  background = "blue" aipoindi\n  color = "white" aipoindi\n}\npetti div class="cool" { raayi "I am styled natively!" }\n',
    challenge_text: '<b>🎯 Challenge:</b> Use `alankaram` to add `color = "red" aipoindi` to `.box`.',
    challenge_code: 'alankaram .box {\n  # set color to red\n}\npetti div class="box" { raayi "Red!" }\n',
    test: (logs, html, css) => css && css.includes('red'),
    hint: 'Inside alankaram, write `color = "red" aipoindi`.'
  },

  // ----------- CATEGORY: EVENTS & FINAL ⚡ -----------
  {
    id: 24, category: 'Events & Final ⚡', title: '24. Interactions & Events',
    prof_text: '<b>What is it?</b><br>The ultimate feature! Bind interactive DOM clicking using <b><code>click ayithe</code></b> ("if clicked") directly on a `petti`!<br><br><b>Syntax:</b><br><code>petti button click ayithe myFunc() { }</code>',
    example_code: 'pani tap() {\n  cheppu "You tapped me!"\n}\n\npetti button click ayithe tap() {\n  raayi "Tap Here"\n}\n',
    challenge_text: '<b>🎯 Challenge:</b> Add `click ayithe callMe()` to the button element.',
    challenge_code: 'pani callMe() {\n  cheppu "Executed!"\n}\n\npetti button click ayithe callMe() {\n  raayi "Test Btn"\n}\n',
    test: (logs, html) => html && html.includes('onclick="callMe()'),
    hint: 'Just run!'
  },
  {
    id: 25, category: 'Events & Final ⚡', title: '25. The Master Developer',
    prof_text: '<b>What is it?</b><br>You have arrived 👨‍🏫 🚀<br><br>You now deeply understand how TanglishScript powers Variables, Arrays, Parsers, Functions, Document Object Models (HTML) and style engines! In TanglishScript nothing is hidden from you.<br><br>Combine everything one last time.',
    example_code: 'alankaram .glass {\n  background = "linear-gradient(135deg, rgba(255,159,10,0.8), rgba(255,69,58,0.8))" aipoindi\n  padding = "20px" aipoindi\n  color = "white" aipoindi\n  border-radius = "12px" aipoindi\n}\npetti div class="glass" {\n  raayi "TanglishScript Master."\n}\n',
    challenge_text: '<b>🎯 Final Challenge:</b> Build a styled card UI rendering "Ultra Pro Developer" and hit "Run Test" to capture your certificate.',
    challenge_code: 'alankaram .card {\n  background = "#5e5ce6" aipoindi\n  padding = "20px" aipoindi\n  border-radius = "12px" aipoindi\n}\n\nidigo name = "Ultra Pro Developer" aipoindi\n\npetti div class="card" {\n  petti h2 { raayi name }\n}\n',
    test: (logs, html, css) => html && html.includes('Ultra Pro Developer') && css && css.includes('#5e5ce6'),
    hint: 'Verify the code and press Run to capture the Certificate.'
  }
];




let currentLesson = 0;
let highestUnlocked = parseInt(localStorage.getItem('tanglish_max_lesson') || '0');
let progressLogs = [];
let isChallengeMode = false;

function init() {
  const sidebar = document.getElementById('lesson-list');
  sidebar.innerHTML = '';
  
  let currentCat = '';
  LESSONS.forEach((l, i) => {
    if (l.category && l.category !== currentCat) {
      sidebar.innerHTML += `<div class="category-header">${l.category}</div>`;
      currentCat = l.category;
    }
    sidebar.innerHTML += `
      <div class="lesson-item ${i<highestUnlocked?'done':''} ${i===currentLesson?'active':''}" id="lNav-${i}" onclick="selectLesson(${i})">
        <span class="status">${i<highestUnlocked ? '✓' : ''}</span>
        ${l.title.substring(l.title.indexOf('.') + 1).trim()}
      </div>`;
  });
  loadLesson(Math.min(highestUnlocked, LESSONS.length - 1));
  updateProgressUI();
}

function loadLesson(idx) {
  currentLesson = idx;
  const l = LESSONS[idx];
  
  // Reset to Professor Mode
  isChallengeMode = false;
  document.getElementById('ltitle').innerText = l.title;
  
  const badge = document.getElementById('modeBadge');
  if(badge) {
    badge.innerHTML = '<span>👨‍🏫</span> Professor Mode';
    badge.style.background = 'rgba(94, 92, 230, 0.2)';
    badge.style.color = '#bf5af2';
    badge.style.borderColor = 'rgba(94, 92, 230, 0.5)';
  }
  
  document.getElementById('ldesc').innerHTML = l.prof_text || l.desc;
  document.getElementById('editor').value = l.example_code || l.code;
  document.getElementById('console-out').innerHTML = '';
  document.getElementById('nextBtn').disabled = (currentLesson >= highestUnlocked);
  document.getElementById('nextBtn').style.display = 'none';
  
  const switchBtn = document.getElementById('switchBtn');
  if(switchBtn) switchBtn.style.display = 'block';
  
  const runBtn = document.getElementById('runBtn');
  if(runBtn) runBtn.innerText = '▶ Run Example';
  
  document.querySelectorAll('.lesson-item').forEach(e => e.classList.remove('active'));
  document.getElementById(`lNav-${idx}`).classList.add('active');
}

function startChallenge() {
  isChallengeMode = true;
  const l = LESSONS[currentLesson];
  
  const badge = document.getElementById('modeBadge');
  if(badge) {
    badge.innerHTML = '<span>🎯</span> Challenge Mode';
    badge.style.background = 'rgba(255, 159, 10, 0.2)';
    badge.style.color = '#ff9f0a';
    badge.style.borderColor = 'rgba(255, 159, 10, 0.5)';
  }
  
  document.getElementById('ldesc').innerHTML = l.challenge_text || l.desc;
  document.getElementById('editor').value = l.challenge_code || '';
  document.getElementById('console-out').innerHTML = '';
  
  document.getElementById('switchBtn').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'block';
  document.getElementById('runBtn').innerText = '▶ Run Test';
}

function selectLesson(idx) {
  if(idx <= highestUnlocked) loadLesson(idx); // Can go back to previous/unlocked lessons
}

// Intercepts transpiled cheppu outputs
window.logOut = function(val) {
  const msg = typeof val==='object' ? JSON.stringify(val) : String(val);
  progressLogs.push(msg);
  document.getElementById('console-out').innerHTML += `<div>> ${msg}</div>`;
};

function runCode() {
  const code = document.getElementById('editor').value;
  document.getElementById('console-out').innerHTML = '';
  progressLogs = [];
  
  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();
    const trans = new Transpiler(ast);
    const out = trans.transpile();
    
    // Render UI to iframe
    const fDoc = document.getElementById('browser-view').contentWindow.document;
    fDoc.open();
    fDoc.write(`
      <style>body { font-family: -apple-system, sans-serif; color: #111; margin: 16px; }</style>
      <style>${out.css}</style>
      ${out.html}
    `);
    fDoc.close();

    // Evaluate the transpiled script logic securely in this closure
    new Function(out.js)();
    
    if (!isChallengeMode) {
      document.getElementById('console-out').innerHTML += `<div style="color:var(--text-dim);margin-top:20px;">ℹ️ Example executed successfully. See output above. When you're ready, click "Give me the Challenge ➔".</div>`;
      return;
    }
    
    // Check answer against test block
    const l = LESSONS[currentLesson];
    if (l.test(progressLogs, out.html, out.css)) {
      document.getElementById('console-out').innerHTML += `<div style="color:var(--green);margin-top:20px;font-weight:700">✅ Challenge Passed!</div>`;
      document.getElementById('nextBtn').disabled = false;
      document.getElementById(`lNav-${currentLesson}`).classList.add('done');
      document.getElementById(`lNav-${currentLesson}`).querySelector('.status').innerText = '✓';
      
      if(currentLesson >= highestUnlocked) {
         highestUnlocked = currentLesson + 1;
         localStorage.setItem('tanglish_max_lesson', highestUnlocked.toString());
         updateProgressUI();
      }
    } else {
      document.getElementById('console-out').innerHTML += `<div style="color:var(--yellow);margin-top:20px;">ℹ️ Output didn't match the challenge requirements. Try again.</div>`;
      if (l.hint) {
        document.getElementById('console-out').innerHTML += `<div style="color:var(--text-dim);margin-top:10px;">${l.hint}</div>`;
      }
    }

  } catch (err) {
    document.getElementById('console-out').innerHTML += `<div style="color:var(--red)">Compilation Error: ${err.message}</div>`;
  }
}

function updateProgressUI() {
  const val = Math.floor((Math.min(highestUnlocked, LESSONS.length) / LESSONS.length) * 100);
  document.getElementById('pbar').style.width = val + '%';
  document.getElementById('ptext').innerText = val + '%';
  
  if (val === 100) {
    setTimeout(() => {
      document.getElementById('nameModal').classList.add('show');
    }, 1000); // Wait 1s and show Certificate collector modal
  }
}

function nextLesson() {
  if (currentLesson < LESSONS.length - 1) {
    loadLesson(currentLesson + 1);
  } else {
    document.getElementById('nameModal').classList.add('show');
  }
}

function generateCertificate() {
  const name = document.getElementById('certName').value.trim();
  if(!name) { alert("Please enter your name!"); return; }
  
  document.getElementById('nameModal').classList.remove('show');
  document.getElementById('docName').innerText = name;
  const d = new Date();
  document.getElementById('docDate').innerText = d.toISOString().split('T')[0];
  
  document.getElementById('cert-view').classList.add('show');
}

// Keyboard shortcuts inside editor text area
document.getElementById('editor').addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    e.target.value = e.target.value.substring(0, start) + "  " + e.target.value.substring(end);
    e.target.selectionStart = e.target.selectionEnd = start + 2;
  }
});

init();
