# 🟡 TanglishScript - The Telugu-English Programming Language

[![GitHub](https://img.shields.io/github/license/Yaswanth0621/tanglish-compiler)](https://github.com/Yaswanth0621/tanglish-compiler)
[![Node.js](https://img.shields.io/badge/node.js->=14.0.0-brightgreen)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()

> **Write code in Telugu. Build full-stack applications with confidence.**

TanglishScript is a modern programming language that lets Telugu-speaking developers write code using Telugu keywords while maintaining full compatibility with JavaScript and Node.js ecosystems. It's a transpiled language that compiles to native JavaScript for both browser and server environments.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Yaswanth0621/tanglish-compiler.git
cd tanglish-compiler

# 2. Install dependencies
npm install

# 3. Write your first program (hello.tang)
cat > hello.tang << 'EOF'
cheppu "నమస్కారం, TanglishScript!" aipoindi
EOF

# 4. Compile and run
node tanglish-cli.js run hello.tang
```

## ✨ Features

### 🎯 Language Features
- **34+ Keywords** - Complete Telugu-English hybrid syntax
- **Object-Oriented** - Classes, inheritance, polymorphism
- **Functional** - First-class functions, closures, higher-order functions
- **Full-Stack** - Browser & Node.js support (same source code)
- **Modular** - Import/export system for large applications
- **Type System** - Optional type annotations for type safety
- **Built-ins** - 30+ runtime helper functions

### 🛠️ Developer Experience
- **Browser IDE** - Live compiler with instant feedback
- **Command-line CLI** - Build, run, and check syntax
- **Learning Portal** - Interactive tutorials and examples
- **Comprehensive Docs** - Full spec, API reference, troubleshooting
- **15+ Examples** - From hello world to REST APIs

### 💻 Platforms
- **Frontend** → Compiles to HTML + CSS + JavaScript
- **Backend** → Compiles to Node.js/Express.js servers
- **Same Code** → Write once, deploy to either platform

## 📚 Language Overview

### Variables & Types
```tanglish
idigo name: padamaala = "Arjun" aipoindi
idigo age: sankhya = 25 aipoindi
idigo isStudent: nijam_abaddam = nijam aipoindi
idigo scores: lista = [85, 90, 88] aipoindi
```

### Functions
```tanglish
pani greet(name: padamaala) {
  pampu "Hello, " + name aipoindi
}

cheppu greet("Arjun") aipoindi
```

### Classes & OOP
```tanglish
varga Student {
  nirmana_pani(name, grade) {
    vasthu.name = name aipoindi
    vasthu.grade = grade aipoindi
  }

  display() {
    pampu vasthu.name + ": " + vasthu.grade aipoindi
  }
}

idigo student = parinamam Student("Priya", "A+") aipoindi
cheppu student.display() aipoindi
```

### Arrays & Higher-Order Functions
```tanglish
idigo numbers = [1, 2, 3, 4, 5] aipoindi

# Map - transform elements
idigo doubled = numbers.map(pani(n) { pampu n * 2 aipoindi }) aipoindi

# Filter - keep matching elements
idigo evens = numbers.filter(pani(n) { pampu n % 2 == 0 aipoindi }) aipoindi

# Reduce - combine into single value
idigo sum = numbers.reduce(pani(total, n) { pampu total + n aipoindi }, 0) aipoindi
```

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [`docs/SPEC.md`](docs/SPEC.md) | Complete language specification & grammar |
| [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md) | Setup, first program, workflow |
| [`docs/API.md`](docs/API.md) | Runtime API reference (T.*, browser & Node.js) |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Common issues & solutions |

## 🎯 Project Structure

```
tanglish-compiler/
├── compiler/
│   ├── lexer.js           # Tokenizer (~300 lines)
│   ├── parser.js          # AST builder (~700 lines)
│   ├── transpiler.js      # Browser code generator (~350 lines)
│   └── transpiler_node.js # Node.js code generator (~350 lines)
├── runtime/
│   ├── browser.js         # Browser runtime (T.*, 30+ functions)
│   └── node.js           # Node.js helpers
├── examples/
│   ├── oop_basic.tang, oop_inheritance.tang, oop_complete.tang
│   ├── arrays_methods.tang, data_structures.tang
│   ├── server_basic.tang, server_api.tang
│   ├── typed_app.tang, module_math.tang, module_app.tang
│   └── more examples...
├── docs/                  # Comprehensive documentation
├── ide/                   # Browser-based IDE
├── learn/                 # Learning platform
├── tanglish-cli.js       # Command-line interface
└── package.json          # Project configuration
```

## 🚀 Usage

### Command-Line Interface

```bash
# Build for browser
node tanglish-cli.js build examples/app.tang

# Run and auto-open in browser
node tanglish-cli.js run examples/app.tang

# Check syntax without compiling
node tanglish-cli.js check examples/app.tang

# Build for Node.js
node tanglish-cli.js build examples/server.tang --platform node
```

### Interactive IDE

```bash
# Launch browser IDE at http://localhost:4200
npm run ide

# Launch learning portal at http://localhost:4300
npm run learn
```

## 🏗️ Architecture

TanglishScript uses a multi-stage compiler architecture:

```
Source Code (.tang)
     ↓
  LEXER (tokenize)
     ↓
  PARSER (build AST)
     ↓
  TRANSPILER (code generation)
     ├→ Browser Transpiler → HTML + CSS + JavaScript
     └→ Node.js Transpiler → server.js + package.json
```

**Key Components:**
- **Lexer** (`compiler/lexer.js`) - Tokenizes source into 20+ token types
- **Parser** (`compiler/parser.js`) - Builds Abstract Syntax Tree (AST)
- **Transpiler** (`compiler/transpiler.js`) - Generates browser-compatible JavaScript
- **Node Transpiler** (`compiler/transpiler_node.js`) - Generates Node.js code
- **Runtime** (`runtime/`) - Provides T.* API for both platforms

## 📊 Language Features

| Feature | Status | Example |
|---------|--------|---------|
| Variables | ✅ | `idigo x = 5` |
| Functions | ✅ | `pani add(a, b) { pampu a + b }` |
| Classes | ✅ | `varga Person { ... }` |
| Inheritance | ✅ | `varga Child pedhasa Parent { ... }` |
| Arrays | ✅ | `[1, 2, 3].map(...)` |
| Objects | ✅ | `{ name: "Arjun", age: 25 }` |
| Loops | ✅ | `malli`, `varaku`, `prathi` |
| Type Annotations | ✅ | `idigo x: sankhya = 5` |
| Modules | ✅ | `teesuko { x } from "./file"` |
| Try/Catch | ✅ | `prayatninchu { ... }` |

## 🎓 Examples

The repository includes 15+ working examples:

```bash
# OOP Examples
examples/oop_basic.tang              # Basic class definition
examples/oop_inheritance.tang        # Inheritance & polymorphism
examples/oop_complete.tang          # Full student management system

# Data Structures
examples/arrays_methods.tang         # Array methods (map, filter, reduce)
examples/data_structures.tang        # Complex objects & arrays

# Backend
examples/server_basic.tang           # Basic HTTP server
examples/server_api.tang            # REST API with data management

# Advanced Features
examples/typed_app.tang             # Type annotations
examples/module_math.tang           # Reusable module
examples/module_app.tang            # Importing modules
```

Run any example:
```bash
node tanglish-cli.js run examples/oop_basic.tang
```

## 📋 Development Phases

### ✅ Phase 1: OOP
- Classes, constructors, inheritance (`varga`, `nirmana_pani`, `pedhasa`)
- Instance creation (`parinamam`)
- This binding (`vasthu`)

### ✅ Phase 2: Data Structures
- Function expressions (`pani(x) { ... }`)
- Array methods (`.map()`, `.filter()`, `.reduce()`)
- Object operations

### ✅ Phase 3: Full-Stack
- Node.js/Express support
- `--platform node` flag
- Server runtime helpers

### ✅ Phase 4: Type System
- Optional type annotations
- Telugu type keywords (sankhya, padamaala, nijam_abaddam, lista, sambandhitam)
- Type-aware IDE preparation

### ✅ Phase 5: Modules
- `teesuko` (import) keyword
- `ivvu` (export) keyword
- Multi-file applications

### 🎯 Phase 6+: Future
- Interactive learning platform
- IDE enhancements (syntax highlighting, autocomplete)
- Advanced type checking
- Performance optimizations
- Package manager

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Core Compiler | ~3,500 lines of JavaScript |
| Language Keywords | 34 |
| Built-in Functions | 30+ |
| Working Examples | 15+ |
| Supported Platforms | 2 (Browser, Node.js) |
| Documentation Pages | 4 |
| Test Coverage | 80%+ |

## 🤝 Contributing

We welcome contributions! Ways to help:

1. **Report Issues** - Found a bug? Report it on GitHub
2. **Add Examples** - Share code showcasing language features
3. **Improve Docs** - Help improve documentation & tutorials
4. **Add Features** - Extend the language with new capabilities
5. **Test** - Try building real applications and report feedback

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with ❤️ for the Telugu-speaking developer community
- Inspired by other domain-specific languages and transpilers
- Thanks to all contributors and testers

---

## ⚡ Quick Links

- 🚀 [Getting Started](docs/GETTING_STARTED.md)
- 📖 [Language Spec](docs/SPEC.md)
- 🔧 [API Reference](docs/API.md)
- 🐛 [Troubleshooting](docs/TROUBLESHOOTING.md)
- 📂 [Examples](examples/)
- 💬 [Issues](https://github.com/Yaswanth0621/tanglish-compiler/issues)

---

**Happy Coding! 🟡**

*"Write beautiful code in Telugu with TanglishScript"*
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
