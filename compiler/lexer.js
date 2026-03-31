/**
 * TanglishScript Lexer
 * Tokenizes .tang source code into a stream of tokens.
 */

const TOKEN_TYPES = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  SEMICOLON: 'SEMICOLON',
  EQUALS: 'EQUALS',
  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
  BOOLEAN: 'BOOLEAN',
};

// Full TanglishScript keyword map
const KEYWORDS = new Set([
  'idigo',       // let
  'cheppu',      // console.log
  'unte',        // if
  'lekapothe',   // else
  'malli',       // for
  'varaku',      // while
  'pani',        // function
  'pampu',       // return
  'aipoindi',    // ; (statement end)
  'nijam',       // true
  'abaddam',     // false
  'petti',       // HTML element
  'raayi',       // text content
  'alankaram',   // CSS
  'click',       // click event keyword part
  'ayithe',      // event keyword part
  'marchu',      // switch
  'apu',         // break
  'munduku',     // continue
  'teesuko',     // import
  'ivvu',        // export
  'prathi',      // foreach/for
  'lona',        // in/of
  'prayatninchu',// try
  'pattu',       // catch
]);

const BOOLEANS = new Set(['nijam', 'abaddam']);

class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.tokens = [];
  }

  error(msg) {
    throw new Error(`[Lexer] Line ${this.line}, Col ${this.col}: ${msg}`);
  }

  peek(offset = 0) {
    return this.source[this.pos + offset];
  }

  advance() {
    const ch = this.source[this.pos++];
    if (ch === '\n') { this.line++; this.col = 1; }
    else { this.col++; }
    return ch;
  }

  skipWhitespace() {
    while (this.pos < this.source.length && /[ \t\r]/.test(this.source[this.pos])) {
      this.advance();
    }
  }

  skipComment() {
    // Single-line comment: # ...
    if (this.source[this.pos] === '#') {
      const nxt = this.source[this.pos + 1] || '';
      if (/[0-9a-fA-F]/.test(nxt)) return false; // Not a comment, a hex color
      while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
        this.advance();
      }
      return true;
    }
    // Block comment: /* ... */
    if (this.source[this.pos] === '/' && this.source[this.pos + 1] === '*') {
      this.advance(); this.advance();
      while (this.pos < this.source.length) {
        if (this.source[this.pos] === '*' && this.source[this.pos + 1] === '/') {
          this.advance(); this.advance();
          break;
        }
        this.advance();
      }
      return true;
    }
    return false;
  }

  readString(quote) {
    this.advance(); // skip opening quote
    let str = '';
    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      if (this.source[this.pos] === '\\') {
        this.advance();
        const esc = this.advance();
        switch (esc) {
          case 'n': str += '\n'; break;
          case 't': str += '\t'; break;
          case '"': str += '"'; break;
          case "'": str += "'"; break;
          default: str += esc;
        }
      } else {
        str += this.advance();
      }
    }
    if (this.pos >= this.source.length) this.error('Unterminated string');
    this.advance(); // skip closing quote
    return str;
  }

  readNumber() {
    let num = '';
    while (this.pos < this.source.length && /[\d.]/.test(this.source[this.pos])) {
      num += this.advance();
    }
    return num;
  }

  readIdentifier() {
    let id = '';
    while (this.pos < this.source.length && /[\w]/.test(this.source[this.pos])) {
      id += this.advance();
    }
    return id;
  }

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;

      if (this.skipComment()) continue;

      const ch = this.source[this.pos];
      const line = this.line;
      const col = this.col;

      // Newline
      if (ch === '\n') {
        this.advance();
        // Don't emit newline tokens - we use aipoindi as statement end
        continue;
      }

      // String
      if (ch === '"' || ch === "'") {
        const str = this.readString(ch);
        this.tokens.push({ type: TOKEN_TYPES.STRING, value: str, line, col });
        continue;
      }

      // Number
      if (/\d/.test(ch)) {
        const num = this.readNumber();
        this.tokens.push({ type: TOKEN_TYPES.NUMBER, value: Number(num), line, col });
        continue;
      }

      // Hex Color
      if (ch === '#' && /[0-9a-fA-F]/.test(this.peek(1) || '')) {
        let hex = this.advance();
        while (this.pos < this.source.length && /[0-9a-fA-F]/.test(this.source[this.pos])) {
          hex += this.advance();
        }
        this.tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: hex, line, col });
        continue;
      }

      // Identifier / Keyword
      if (/[a-zA-Z_]/.test(ch)) {
        const id = this.readIdentifier();

        if (BOOLEANS.has(id)) {
          this.tokens.push({ type: TOKEN_TYPES.BOOLEAN, value: id === 'nijam', raw: id, line, col });
        } else if (KEYWORDS.has(id)) {
          // Check for compound keyword: "click ayithe"
          if (id === 'click') {
            this.skipWhitespace();
            const saved = this.pos;
            const next = this.readIdentifier();
            if (next === 'ayithe') {
              this.tokens.push({ type: TOKEN_TYPES.KEYWORD, value: 'click ayithe', line, col });
            } else {
              this.pos = saved;
              this.tokens.push({ type: TOKEN_TYPES.KEYWORD, value: id, line, col });
            }
          } else {
            this.tokens.push({ type: TOKEN_TYPES.KEYWORD, value: id, line, col });
          }
        } else {
          this.tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: id, line, col });
        }
        continue;
      }

      // Operators and punctuation
      switch (ch) {
        case '{': this.advance(); this.tokens.push({ type: TOKEN_TYPES.LBRACE, value: '{', line, col }); break;
        case '}': this.advance(); this.tokens.push({ type: TOKEN_TYPES.RBRACE, value: '}', line, col }); break;
        case '(': this.advance(); this.tokens.push({ type: TOKEN_TYPES.LPAREN, value: '(', line, col }); break;
        case ')': this.advance(); this.tokens.push({ type: TOKEN_TYPES.RPAREN, value: ')', line, col }); break;
        case '[': this.advance(); this.tokens.push({ type: 'LBRACKET', value: '[', line, col }); break;
        case ']': this.advance(); this.tokens.push({ type: 'RBRACKET', value: ']', line, col }); break;
        case ':': this.advance(); this.tokens.push({ type: 'COLON', value: ':', line, col }); break;
        case ',': this.advance(); this.tokens.push({ type: TOKEN_TYPES.COMMA, value: ',', line, col }); break;
        case ';': this.advance(); this.tokens.push({ type: TOKEN_TYPES.SEMICOLON, value: ';', line, col }); break;
        case '=': {
          this.advance();
          if (this.source[this.pos] === '=') {
            this.advance();
            if (this.source[this.pos] === '=') { this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '===', line, col }); }
            else { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '==', line, col }); }
          } else {
            this.tokens.push({ type: TOKEN_TYPES.EQUALS, value: '=', line, col });
          }
          break;
        }
        case '!': {
          this.advance();
          if (this.source[this.pos] === '=') { this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '!=', line, col }); }
          else { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '!', line, col }); }
          break;
        }
        case '<': {
          this.advance();
          if (this.source[this.pos] === '=') { this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '<=', line, col }); }
          else { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '<', line, col }); }
          break;
        }
        case '>': {
          this.advance();
          if (this.source[this.pos] === '=') { this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '>=', line, col }); }
          else { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '>', line, col }); }
          break;
        }
        case '+': {
          this.advance();
          if (this.source[this.pos] === '+') { this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '++', line, col }); }
          else { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '+', line, col }); }
          break;
        }
        case '-': {
          this.advance();
          if (this.source[this.pos] === '-') { this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '--', line, col }); }
          else { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '-', line, col }); }
          break;
        }
        case '*': this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '*', line, col }); break;
        case '/': this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '/', line, col }); break;
        case '%': this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '%', line, col }); break;
        case '&': {
          this.advance();
          if (this.source[this.pos] === '&') { this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '&&', line, col }); }
          else { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '&', line, col }); }
          break;
        }
        case '|': {
          this.advance();
          if (this.source[this.pos] === '|') { this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '||', line, col }); }
          else { this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '|', line, col }); }
          break;
        }
        case '.': this.advance(); this.tokens.push({ type: TOKEN_TYPES.OPERATOR, value: '.', line, col }); break;
        default:
          this.advance(); // skip unknown chars
          break;
      }
    }

    this.tokens.push({ type: TOKEN_TYPES.EOF, value: null, line: this.line, col: this.col });
    return this.tokens;
  }
}

module.exports = { Lexer, TOKEN_TYPES, KEYWORDS };
