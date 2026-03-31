# 🟡 TanglishScript

> **Telugu-English Web Programming Language** — Compiles `.tang` files into HTML + CSS + JavaScript.

---

## What is TanglishScript?

TanglishScript is a real programming language designed for Telugu-speaking developers. Write code in Telugu-English keywords, and the compiler generates a complete website.

```
TanglishScript (.tang)
        ↓
Compiler (Lexer → Parser → Transpiler)
        ↓
HTML + CSS + JavaScript
        ↓
Browser runs website
```

---

## Quick Start

```bash
# Build a .tang file
node tanglish-cli.js build examples/app.tang

# Build and open in browser
node tanglish-cli.js run examples/complete.tang

# Check syntax
node tanglish-cli.js check examples/app.tang

# Open Browser IDE
start ide\index.html
```

---

## Language Syntax

### Variables
```
idigo name = "Ravi" aipoindi
idigo age  = 25 aipoindi
```

### Print
```
cheppu "Hello World!"
cheppu age
```

### If / Else
```
unte (age > 18) {
    cheppu "Major"
} lekapothe {
    cheppu "Minor"
}
```

### For Loop
```
malli (idigo i = 0; i < 5; i++) {
    cheppu i
}
```

### While Loop
```
varaku (x > 0) {
    x = x - 1 aipoindi
}
```

### Functions
```
pani add(a, b) {
    pampu a + b aipoindi
}

idigo result = add(10, 20) aipoindi
cheppu result
```

### HTML Elements
```
petti div {
    petti h1 { raayi "Na Website" }
    petti p  { raayi "TanglishScript rocks!" }
    petti button click ayithe showMsg() {
        raayi "Click Me"
    }
}
```

### CSS Styles
```
alankaram h1 {
    color = #f5a623 aipoindi
    size  = 2rem aipoindi
}

alankaram button {
    background = blue aipoindi
    color      = white aipoindi
    radius     = 8px aipoindi
}
```

---

## Keyword Reference

| TanglishScript | Meaning        |
|----------------|----------------|
| `idigo`        | let            |
| `cheppu`       | console.log    |
| `unte`         | if             |
| `lekapothe`    | else           |
| `malli`        | for            |
| `varaku`       | while          |
| `pani`         | function       |
| `pampu`        | return         |
| `aipoindi`     | ; (end stmt)   |
| `nijam`        | true           |
| `abaddam`      | false          |
| `petti`        | HTML element   |
| `raayi`        | text content   |
| `alankaram`    | CSS block      |
| `click ayithe` | onclick event  |
| `apu`          | break          |
| `munduku`      | continue       |

---

## Project Structure

```
TanglishScript/
├── compiler/
│   ├── lexer.js        ← Tokenizer
│   ├── parser.js       ← AST Parser
│   └── transpiler.js   ← HTML + CSS + JS generator
├── runtime/
│   └── browser.js      ← Browser helpers (T.* API)
├── ide/
│   ├── index.html      ← Browser IDE
│   └── ide.js          ← IDE compiler + examples
├── examples/
│   ├── app.tang        ← Full app example
│   ├── style.tang      ← Glassmorphism styles example
│   └── complete.tang   ← Complete website with calculator
├── build/              ← Generated output
├── tanglish-cli.js     ← CLI tool
└── package.json
```

---

## Browser IDE

Open `ide/index.html` in any browser — no server required.

- ✅ Live compiler (runs entirely in browser)
- ✅ 6 built-in examples (Hello World, Counter, Calculator, Form, Loops, Styled App)
- ✅ HTML / CSS / JS code output tabs
- ✅ Live preview panel
- ✅ Console output
- ✅ Ctrl+Enter to compile

---

## Runtime API (T.*)

The browser runtime provides helper functions auto-available in compiled apps:

```javascript
T.get('#id')              // querySelector
T.setText('#id', 'Hello') // set text content
T.val('#input')           // get/set input value
T.show('#el')             // show element
T.hide('#el')             // hide element
T.addClass('#el', 'cls')  // add CSS class
T.animate('#el', [...])   // Web Animations API
T.setState('key', val)    // reactive state
T.getState('key')         // read state
T.save('key', data)       // localStorage save
T.load('key')             // localStorage load
T.fetch(url)              // async HTTP fetch
T.alert('msg')            // alert dialog
T.wait(ms)                // await T.wait(1000)
```

---

## Equivalents

| TanglishScript    | World Equivalent |
|-------------------|------------------|
| TanglishScript    | TypeScript       |
| Tanglish UI (petti) | JSX / React    |
| Tanglish Styles   | CSS / SASS       |
| Tanglish Compiler | Babel            |
| Tanglish CLI      | Node CLI         |
| Tanglish Runtime  | Browser SDK      |

---

*Built with 💛 for Telugu-speaking developers worldwide.*
