# Getting Started with TanglishScript

Welcome to TanglishScript, the Telugu-English programming language!

## Installation

### Prerequisites
- **Node.js** 14.0 or higher
- **npm** (comes with Node.js)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Yaswanth0621/tanglish-compiler.git
cd tanglish-compiler
```

2. **Install dependencies**
```bash
npm install
```

3. **Verify installation**
```bash
node tanglish-cli.js help
```

---

## Your First TanglishScript Program

### 1. Create a file: `hello.tang`

```tanglish
cheppu "Hello, TanglishScript!" aipoindi
```

### 2. Compile to Browser

```bash
node tanglish-cli.js build hello.tang
```

This generates three files in `build/`:
- `index.html` - HTML document
- `style.css` - Stylesheet
- `app.js` - JavaScript code

### 3. Open in Browser

```bash
# On Windows
start build\index.html

# On macOS
open build/index.html

# On Linux
xdg-open build/index.html
```

---

## Quick Examples

### Variables & Math

```tanglish
idigo x = 10 aipoindi
idigo y = 20 aipoindi
idigo sum = x + y aipoindi
cheppu "Sum: " + sum aipoindi
```

### Functions

```tanglish
pani greet(name) {
  pampu "Hello, " + name aipoindi
}

cheppu greet("Arjun") aipoindi
```

### Arrays

```tanglish
idigo numbers = [1, 2, 3, 4, 5] aipoindi
idigo doubled = numbers.map(pani(n) { pampu n * 2 aipoindi }) aipoindi
cheppu doubled aipoindi
```

### Objects & Classes

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

idigo student = parinamam Student("Arjun", "A+") aipoindi
cheppu student.display() aipoindi
```

### Control Flow

```tanglish
idigo age = 25 aipoindi

unte (age >= 18) {
  cheppu "Adult" aipoindi
}
lekapothe {
  cheppu "Minor" aipoindi
}
```

---

## Running Examples

The repository includes 15+ working examples in `examples/`:

```bash
# List available examples
ls examples/

# Build and run an example
node tanglish-cli.js build examples/oop_basic.tang
node tanglish-cli.js run examples/data_structures.tang
```

### Example Categories

| Category | Files | Description |
|----------|-------|-------------|
| **Basic** | `simple.tang`, `app.tang` | Variable, functions, control flow |
| **OOP** | `oop_basic.tang`, `oop_inheritance.tang`, `oop_complete.tang` | Classes, inheritance, methods |
| **Data** | `arrays_methods.tang`, `data_structures.tang` | Arrays, objects, methods |
| **Server** | `server_basic.tang`, `server_api.tang` | Node.js, Express, REST API |
| **Advanced** | `typed_app.tang`, `module_app.tang` | Type annotations, modules |

---

## CLI Commands

### Build for Browser

```bash
node tanglish-cli.js build examples/app.tang [outDir]
```

Generates HTML + CSS + JavaScript in `build/` directory.

### Run in Browser

```bash
node tanglish-cli.js run examples/app.tang
```

Builds and automatically opens in your default browser.

### Check Syntax

```bash
node tanglish-cli.js check examples/app.tang
```

Validates syntax and displays the AST.

### Build for Node.js

```bash
node tanglish-cli.js build examples/server.tang outDir --platform node
```

Generates a server.js and package.json in output directory.

---

## IDE & Learning

### Interactive IDE

```bash
npm run ide
```

Opens the browser-based IDE at `http://localhost:4200` with:
- Live compiler
- Built-in examples
- Real-time error detection
- Code preview

### Learning Portal

```bash
npm run learn
```

Opens the learning portal at `http://localhost:4300` with:
- Interactive tutorials
- Keyword reference
- Challenge system

---

## Project Structure

```
tanglish-compiler/
├── compiler/
│   ├── lexer.js          # Tokenizer
│   ├── parser.js         # AST builder
│   ├── transpiler.js     # Browser code generator
│   └── transpiler_node.js # Node.js code generator
├── runtime/
│   ├── browser.js        # Browser runtime API (T.*)
│   └── node.js          # Node.js helpers
├── examples/             # 15+ working examples
├── docs/                 # Language documentation
│   ├── SPEC.md          # Language specification
│   ├── API.md           # API Reference
│   ├── TUTORIAL.md      # Step-by-step tutorial
│   └── TROUBLESHOOTING.md # FAQ & fixes
├── ide/                  # Web-based IDE
├── learn/                # Learning platform
├── build/                # Compiled output
└── tanglish-cli.js      # Command-line interface
```

---

## Workflow Example: Building a Todo App

### Step 1: Create todo.tang

```tanglish
varga TodoApp {
  nirmana_pani() {
    vasthu.todos = [] aipoindi
  }

  addTodo(title) {
    vasthu.todos.push({ title: title, done: abaddam }) aipoindi
  }

  completeTodo(index) {
    vasthu.todos[index].done = nijam aipoindi
  }

  getTodos() {
    pampu vasthu.todos aipoindi
  }
}

idigo app = parinamam TodoApp() aipoindi
app.addTodo("Learn TanglishScript") aipoindi
app.addTodo("Build an app") aipoindi
app.completeTodo(0) aipoindi
cheppu app.getTodos() aipoindi
```

### Step 2: Build

```bash
node tanglish-cli.js build todo.tang
```

### Step 3: Test

```bash
node tanglish-cli.js run todo.tang
```

---

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Make sure you're in the project directory and have run `npm install`

### Issue: Port 4200 already in use
**Solution**: Change the port in `ide/server.js` or kill the existing process

### Issue: Compilation errors
**Solution**:
1. Check the error message carefully
2. Verify syntax matches examples in `examples/`
3. Run `node tanglish-cli.js check file.tang` for detailed errors

---

## Next Steps

1. **Read the Language Spec**: (`docs/SPEC.md`)
2. **Try the Examples**: Start with `examples/oop_basic.tang`
3. **Build Something**: Create your own `.tang` file
4. **Explore the IDE**: `npm run ide`
5. **Join Community**: Contribute to GitHub

---

## Support & Community

- **GitHub Issues**: Report bugs at https://github.com/Yaswanth0621/tanglish-compiler/issues
- **Documentation**: Full docs in `docs/` directory
- **Examples**: Working code samples in `examples/`
- **Discussion**: Share ideas and get help

---

## What's Next in TanglishScript?

- 📚 **Phase 6**: Interactive learning platform with tutorials
- 🎨 **Phase 7**: Enhanced IDE with syntax highlighting & autocomplete
- 📖 **Phase 8**: Complete documentation & test suite

Happy coding! 🟡

