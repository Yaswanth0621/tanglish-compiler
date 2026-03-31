# TanglishScript Language Specification v1.0

## Table of Contents
1. [Introduction](#introduction)
2. [Language Overview](#language-overview)
3. [Lexical Structure](#lexical-structure)
4. [Data Types](#data-types)
5. [Variables](#variables)
6. [Operators](#operators)
7. [Control Flow](#control-flow)
8. [Functions](#functions)
9. [Classes & OOP](#classes--oop)
10. [Arrays & Objects](#arrays--objects)
11. [String Literals](#string-literals)
12. [Comments](#comments)
13. [Module System](#module-system)
14. [Type System](#type-system)
15. [Keywords & Built-ins](#keywords--built-ins)

---

## Introduction

TanglishScript (তাংলিশ স্ক্রিপ্ট) is a Telugu-English hybrid programming language that allows developers to write code using Telugu keywords alongside English identifiers. It's designed to improve accessibility for Telugu-speaking programmers while maintaining compatibility with JavaScript and Node.js ecosystems.

### Key Features
- **Telugu Keywords** - Write using familiar Telugu language
- **Full-Stack Development** - Target both browser and Node.js
- **Object-Oriented** - Classes, inheritance, and polymorphism
- **Functional** - First-class functions, closures, higher-order functions
- **Modular** - Import/export system for code organization
- **Type-Safe** - Optional type annotations
- **Zero Runtime** - Compiles directly to JavaScript

---

## Language Overview

### Hello, World!

```tanglish
cheppu "Hello, World!" aipoindi
```

### Execution Contexts

TanglishScript can target two execution environments:

1. **Browser**: Compiles to HTML + CSS + JavaScript
2. **Node.js**: Compiles to standalone JavaScript server code

---

## Lexical Structure

### Identifiers

Identifiers start with a letter or underscore and can contain letters, digits, and underscores.

```tanglish
idigo myVariable = 10 aipoindi
idigo _privateVar = 20 aipoindi
idigo camelCaseVar = 30 aipoindi
```

### Whitespace & Newlines

Whitespace and newlines are not significant (TanglishScript uses `aipoindi` as statement terminator).

```tanglish
# All valid:
idigo x = 1 aipoindi
idigo
  x =
    1
aipoindi
```

### Comments

```tanglish
# Single-line comment

/* Multi-line
   comment
   support */
```

---

## Data Types

### Primitive Types

| Type | Telugu Name | Examples |
|------|-------------|----------|
| **Number** | sankhya | `5`, `3.14`, `-42` |
| **String** | padamaala | `"hello"`, `'world'` |
| **Boolean** | nijam_abaddam | `nijam`, `abaddam` |

### Complex Types

| Type | Telugu Name | Example |
|------|-------------|---------|
| **Array** | lista | `[1, 2, 3]` |
| **Object** | sambandhitam | `{ name: "Arjun", age: 25 }` |

### Type Coercion

```tanglish
idigo num: sankhya = 5 aipoindi
idigo str: padamaala = num + " apples" aipoindi  # "5 apples"
```

---

## Variables

### Declaration & Initialization

```tanglish
# Variable declaration with initialization
idigo count = 0 aipoindi

# Without initialization (undefined)
idigo message aipoindi

# With type annotation
idigo age: sankhya = 25 aipoindi
idigo name: padamaala = "Arjun" aipoindi
idigo isActive: nijam_abaddam = nijam aipoindi
idigo scores: lista = [85, 90, 88] aipoindi
```

### Scope

Variables are function/block scoped:

```tanglish
idigo global = "I'm global" aipoindi

pani testScope() {
  idigo local = "I'm local" aipoindi
  cheppu local aipoindi
}

testScope()
cheppu global aipoindi
```

---

## Operators

### Arithmetic

```tanglish
idigo a = 10 aipoindi
idigo b = 3 aipoindi
idigo add = a + b aipoindi        # 13
idigo sub = a - b aipoindi        # 7
idigo mul = a * b aipoindi        # 30
idigo div = a / b aipoindi        # 3.33...
idigo mod = a % b aipoindi        # 1
```

### Comparison

```tanglish
unte (5 == "5") { }    # true (loose equality)
unte (5 === "5") { }   # false (strict equality)
unte (5 != "5") { }    # false
unte (5 !== "5") { }   # true
unte (5 < 10) { }      # true
unte (5 > 3) { }       # true
unte (5 <= 5) { }      # true
unte (5 >= 5) { }      # true
```

### Logical

```tanglish
idigo valid = nijam && abaddam aipoindi          # false
idigo either = nijam || abaddam aipoindi         # true
idigo inverted = !nijam aipoindi                 # false
```

### Assignment

```tanglish
idigo x = 5 aipoindi
x += 3 aipoindi         # x = 8
x -= 2 aipoindi         # x = 6
x *= 2 aipoindi         # x = 12
x /= 3 aipoindi         # x = 4
```

---

## Control Flow

### if/else

```tanglish
unte (age >= 18) {
  cheppu "Adult" aipoindi
}
lekapothe unte (age >= 13) {
  cheppu "Teenager" aipoindi
}
lekapothe {
  cheppu "Child" aipoindi
}
```

### for loop

```tanglish
malli (idigo i = 0; i < 10; i++) {
  cheppu i aipoindi
}
```

### while loop

```tanglish
idigo count = 0 aipoindi
varaku (count < 5) {
  cheppu count aipoindi
  count++ aipoindi
}
```

### for...of (forEach)

```tanglish
idigo arr = [1, 2, 3] aipoindi
prathi (num lona arr) {
  cheppu num aipoindi
}
```

### break & continue

```tanglish
malli (idigo i = 0; i < 10; i++) {
  unte (i == 3) {
    munduku aipoindi    # continue
  }
  unte (i == 8) {
    apu aipoindi        # break
  }
  cheppu i aipoindi
}
```

---

## Functions

### Declaration

```tanglish
pani add(a, b) {
  pampu a + b aipoindi
}
```

### With Type Annotations

```tanglish
pani calculateAge(birthYear: sankhya): sankhya {
  pampu 2025 - birthYear aipoindi
}
```

### Anonymous Functions (Function Expressions)

```tanglish
idigo square = pani(x) { pampu x * x aipoindi } aipoindi
cheppu square(5) aipoindi    # 25
```

### Higher-Order Functions

```tanglish
idigo numbers = [1, 2, 3, 4, 5] aipoindi
idigo doubled = numbers.map(pani(n) { pampu n * 2 aipoindi }) aipoindi
idigo evens = numbers.filter(pani(n) { pampu n % 2 == 0 aipoindi }) aipoindi
```

---

## Classes & OOP

### Class Declaration

```tanglish
varga Person {
  nirmana_pani(name, age) {
    vasthu.name = name aipoindi
    vasthu.age = age aipoindi
  }

  greet() {
    pampu "Hello, I'm " + vasthu.name aipoindi
  }

  getAge() {
    pampu vasthu.age aipoindi
  }
}
```

### Instantiation

```tanglish
idigo person = parinamam Person("Arjun", 25) aipoindi
person.greet() aipoindi
```

### Inheritance

```tanglish
varga Employee pedhasa Person {
  nirmana_pani(name, age, salary) {
    vasthu.name = name aipoindi
    vasthu.age = age aipoindi
    vasthu.salary = salary aipoindi
  }

  getSalary() {
    pampu vasthu.salary aipoindi
  }
}
```

---

## Arrays & Objects

### Arrays

```tanglish
# Creation
idigo arr = [1, 2, 3] aipoindi

# Access
cheppu arr[0] aipoindi         # 1

# Methods
arr.push(4) aipoindi           # Add element
idigo len = arr.length aipoindi # 4
idigo first = arr[0] aipoindi  # 1
```

### Array Methods

```tanglish
idigo numbers = [1, 2, 3, 4, 5] aipoindi

# map - transform
idigo doubled = numbers.map(pani(n) { pampu n * 2 aipoindi }) aipoindi

# filter - select
idigo evens = numbers.filter(pani(n) { pampu n % 2 == 0 aipoindi }) aipoindi

# reduce - combine
idigo sum = numbers.reduce(pani(total, n) { pampu total + n aipoindi }, 0) aipoindi

# forEach - iterate
numbers.forEach(pani(n) { cheppu n aipoindi }) aipoindi
```

### Objects

```tanglish
# Creation
idigo person = {
  name: "Arjun",
  age: 25,
  city: "Hyderabad"
} aipoindi

# Access
cheppu person.name aipoindi
cheppu person["age"] aipoindi

# Modification
person.age = 26 aipoindi
```

---

## String Literals

### Basic Strings

```tanglish
idigo single = 'Hello' aipoindi
idigo double = "World" aipoindi
```

### Escape Sequences

```tanglish
idigo newline = "Line 1\nLine 2" aipoindi
idigo tab = "Name\tValue" aipoindi
idigo quote = "He said \"Hi\"" aipoindi
```

### String Concatenation

```tanglish
idigo greeting = "Hello" + " " + "World" aipoindi
```

---

## Module System

### Importing

```tanglish
# Import specific exports
teesuko { add, multiply } from "./math_utils" aipoindi

# Import entire module
teesuko "./utils" aipoindi
```

### Exporting

```tanglish
# Export multiple items
ivvu add, multiply, divide aipoindi

# Export with braces
ivvu { add, multiply, divide } aipoindi
```

### Browser vs Node.js

- **Browser**: Generates ES6 `import`/`export`
- **Node.js**: Generates CommonJS `require`/`module.exports`

---

## Type System

### Type Annotation

```tanglish
# Variables
idigo age: sankhya = 25 aipoindi
idigo name: padamaala = "Arjun" aipoindi
idigo isStudent: nijam_abaddam = nijam aipoindi
idigo scores: lista = [85, 90, 88] aipoindi
idigo person: sambandhitam = { name: "Arjun" } aipoindi

# Functions
pani calculate(a: sankhya, b: sankhya): sankhya {
  pampu a + b aipoindi
}
```

### Type Keywords

| Keyword | Represents |
|---------|------------|
| `sankhya` | number |
| `padamaala` | string |
| `nijam_abaddam` | boolean |
| `lista` | array |
| `sambandhitam` | object |

---

## Keywords & Built-ins

### Keywords

| Keyword | Meaning | Usage |
|---------|---------|-------|
| `idigo` | let/const | `idigo x = 5` |
| `cheppu` | console.log | `cheppu x` |
| `pani` | function | `pani foo() { ... }` |
| `pampu` | return | `pampu result` |
| `unte` | if | `unte (x > 0) { ... }` |
| `lekapothe` | else | `lekapothe { ... }` |
| `malli` | for | `malli (init; cond; update) { ... }` |
| `varaku` | while | `varaku (cond) { ... }` |
| `prathi` | for...of | `prathi (x lona arr) { ... }` |
| `varga` | class | `varga MyClass { ... }` |
| `nirmana_pani` | constructor | `nirmana_pani() { ... }` |
| `vasthu` | this | `vasthu.property` |
| `parinamam` | new | `parinamam MyClass()` |
| `pedhasa` | extends | `varga Child pedhasa Parent { ... }` |
| `teesuko` | import | `teesuko { x } from "./file"` |
| `ivvu` | export | `ivvu x` |
| `nijam` | true | `nijam` |
| `abaddam` | false | `abaddam` |
| `apu` | break | `apu` |
| `munduku` | continue | `munduku` |
| `prayatninchu` | try | `prayatninchu { ... }` |
| `pattu` | catch | `pattu (err) { ... }` |

### Built-in Runtime API (Browser)

```tanglish
T.get(selector)              # Select element
T.setText(selector, text)    # Set text content
T.addClass(selector, class)  # Add CSS class
T.on(selector, event, fn)    # Attach event listener
T.fetch(url, options)        # HTTP request
T.save(key, value)           # LocalStorage
T.load(key)                  # LocalStorage
```

---

## Examples

See the `examples/` directory for working code samples covering all features.

