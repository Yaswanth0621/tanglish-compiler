# TanglishScript Troubleshooting Guide

## Common Issues & Solutions

### Installation & Setup

#### Problem: "node: command not found"
**Solution**:
- Install Node.js from https://nodejs.org/
- Verify: Run `node --version`

#### Problem: "tanglish-cli.js: command not found"
**Solution**:
```bash
# Use full path
node tanglish-cli.js help

# Or add to PATH
npm link
```

#### Problem: "Cannot find module"
**Solution**:
```bash
# Install dependencies
npm install

# Verify package.json exists
ls package.json
```

---

### Compilation Errors

#### Problem: "Parser error: Expected X (got Y)"
**Solution**:
1. Check syntax carefully against examples
2. Ensure `aipoindi` terminates statements
3. Run `node tanglish-cli.js check file.tang` for details

Example fix:
```tanglish
# ❌ Wrong
idigo x = 5

# ✅ Correct
idigo x = 5 aipoindi
```

#### Problem: "Unexpected token in JSON"
**Possible causes**:
- Invalid package.json syntax
- Trailing commas in objects

**Solution**:
```bash
# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"
```

#### Problem: "Cannot read property 'body' of undefined"
**Solution**:
- Make sure to use `aipoindi` after all statements
- Check that all blocks are closed with `}`

---

### Runtime Errors

#### Problem: Function is not defined
**Solution**:
```tanglish
# ❌ Wrong - function called before declaration
greet("Arjun") aipoindi

pani greet(name) {
  cheppu name aipoindi
}

# ✅ Correct - declare before use
pani greet(name) {
  cheppu name aipoindi
}

greet("Arjun") aipoindi
```

#### Problem: Cannot read property 'X' of undefined
**Solution**:
- Check that objects are initialized before access
- Example: `vasthu.property` only works inside class methods

```tanglish
# ❌ Wrong
idigo obj aipoindi
cheppu obj.name aipoindi  # undefined.name

# ✅ Correct
idigo obj = { name: "Test" } aipoindi
cheppu obj.name aipoindi  # "Test"
```

---

### Module Issues

#### Problem: "Cannot find module './file'"
**Solution**:
```tanglish
# ✅ Correct paths
teesuko { add } from "./math_utils" aipoindi
teesuko { add } from "../utils/math" aipoindi

# ❌ Wrong - missing quotes or extension
teesuko math_utils aipoindi
```

#### Problem: "Exports are not defined"
**Solution**:
```tanglish
# In math_utils.tang
pani add(a, b) { pampu a + b aipoindi }
pani multiply(a, b) { pampu a * b aipoindi }

# ✅ Export what you defined
ivvu add, multiply aipoindi

# Or with braces
ivvu { add, multiply } aipoindi
```

---

### Type System Issues

#### Problem: Type annotation not working
**Solution**: Type annotations are optional and don't enforce at runtime. They're parsed but ignored during compilation.

```tanglish
# Valid but not enforced
idigo age: sankhya = "twenty-five" aipoindi  # No error, but should be number

# Best practice - use types as documentation
idigo age: sankhya = 25 aipoindi
idigo name: padamaala = "Arjun" aipoindi
```

---

### Browser-Specific Issues

#### Problem: Method T.X is not a function
**Solution**: Make sure you're using the correct API and it's targeting browser:

```bash
# Build for browser (default)
node tanglish-cli.js build examples/app.tang

# NOT for Node.js
node tanglish-cli.js build examples/app.tang --platform node
```

#### Problem: "Cannot find file in build/"
**Solution**: The file is generated after compile:

```bash
# First compile
node tanglish-cli.js build example.tang

# Then check
ls build/
# Should show: index.html, style.css, app.js
```

#### Problem: Port 4200 already in use
**Solution**:
```bash
# On Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# On macOS/Linux
lsof -i :4200
kill -9 <PID>
```

---

### Node.js-Specific Issues

#### Problem: "Cannot find module 'express'"
**Solution**:
```bash
# Server needs express dependency
cd build/server
npm install
```

#### Problem: "Port 3000 is already in use"
**Solution**:
```bash
# Use different port
PORT=3001 node server.js

# Or kill existing process
# (see Browser issues above)
```

---

### Array & Object Issues

#### Problem: Array method not working
**Solution**: Make sure to use correct syntax:

```tanglish
# ❌ Wrong - map not available
idigo arr = [1, 2, 3] aipoindi
arr.map(...)  # Error

# ✅ Correct - returns new array
idigo doubled = [1, 2, 3].map(pani(n) { pampu n * 2 aipoindi }) aipoindi

# Store in variable
idigo arr = [1, 2, 3] aipoindi
idigo result = arr.map(pani(n) { pampu n * 2 aipoindi }) aipoindi
```

#### Problem: "Cannot push to non-array"
**Solution**:
```tanglish
# ❌ Wrong
idigo items aipoindi  # undefined
items.push(1) aipoindi  # Error

# ✅ Correct
idigo items = [] aipoindi
items.push(1) aipoindi
```

---

### Class & Inheritance Issues

#### Problem: "this is not defined"
**Solution**: In TanglishScript, use `vasthu` instead of `this`:

```tanglish
# ❌ Wrong
varga Person {
  nirmana_pani(name) {
    this.name = name aipoindi  # Error
  }
}

# ✅ Correct
varga Person {
  nirmana_pani(name) {
    vasthu.name = name aipoindi
  }
}
```

#### Problem: Inherited method not working
**Solution**: Make sure to use `pedhasa` for inheritance:

```tanglish
# ❌ Wrong - no inheritance
varga Employee {
  nirmana_pani(name) {
    vasthu.name = name aipoindi
  }
}

# ✅ Correct - extends Person
varga Employee pedhasa Person {
  nirmana_pani(name, salary) {
    vasthu.name = name aipoindi
    vasthu.salary = salary aipoindi
  }
}
```

---

### Control Flow Issues

#### Problem: Loop not executing
**Solution**: Check loop syntax carefully:

```tanglish
# ❌ Wrong - missing parentheses
malli (i = 0; i < 10; i) {
  cheppu i aipoindi
}

# ✅ Correct
malli (idigo i = 0; i < 10; i++) {
  cheppu i aipoindi
}
```

#### Problem: If statement not working
**Solution**: Make sure to use correct keywords:

```tanglish
# ❌ Wrong
if (x > 5) {  # wrong keyword
  cheppu "yes" aipoindi
}

# ✅ Correct
unte (x > 5) {
  cheppu "yes" aipoindi
}
```

---

### Function Issues

#### Problem: Return value not working
**Solution**: Use `pampu` keyword:

```tanglish
# ❌ Wrong
pani add(a, b) {
  return a + b aipoindi  # 'return' not recognized
}

# ✅ Correct
pani add(a, b) {
  pampu a + b aipoindi
}
```

#### Problem: Function expression in wrong place
**Solution**: Function expressions must be in value context:

```tanglish
# ❌ Wrong - at top level
pani(x) { pampu x * 2 aipoindi } aipoindi

# ✅ Correct - assign to variable
idigo double = pani(x) { pampu x * 2 aipoindi } aipoindi

# Or pass as argument
[1, 2, 3].map(pani(x) { pampu x * 2 aipoindi }) aipoindi
```

---

## Getting Help

1. **Check the examples**: `ls examples/` - all features demonstrated
2. **Read the spec**: `docs/SPEC.md` - complete language reference
3. **Check syntax**: `node tanglish-cli.js check yourfile.tang`
4. **Debug step-by-step**: Add `cheppu` statements to trace execution
5. **Ask online**: GitHub issues or community forums

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Syntax errors | Add `aipoindi` to all statements |
| Undefined variable | Declare with `idigo` first |
| Method not found | Check variable is correct type (array, object, etc.) |
| `this` not working | Use `vasthu` instead |
| `new` not working | Use `parinamam` instead |
| Loop not working | Check for `o++` or `o--` syntax |
| Import not working | Use `teesuko` + quotes around path |
| Port in use | Kill process or use different port |

---

Still stuck? Check the full documentation in `docs/` or file an issue on GitHub!
