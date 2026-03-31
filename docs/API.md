# TanglishScript API Reference

## Browser Runtime (T.* API)

When you compile TanglishScript to the browser, you get access to the global `T` object with 30+ helper functions.

### DOM Manipulation

#### `T.get(selector)`
Select an element by CSS selector.

```tanglish
idigo btn = T.get("#myButton") aipoindi
idigo elements = T.get(".my-class") aipoindi
```

#### `T.getAll(selector)`
Select all matching elements.

```tanglish
idigo items = T.getAll("li") aipoindi
```

#### `T.setText(selector, text)`
Set the text content of an element.

```tanglish
T.setText("#title", "Welcome!") aipoindi
```

#### `T.getText(selector)`
Get the text content of an element.

```tanglish
idigo title = T.getText("#title") aipoindi
```

#### `T.create(tag, options)`
Create an element dynamically.

```tanglish
idigo div = T.create("div", { class: "box", text: "Hello" }) aipoindi
```

#### `T.append(parentSelector, child)`
Append a child element to a parent.

```tanglish
T.append("#container", child) aipoindi
```

### CSS Classes

#### `T.addClass(selector, className)`
Add a CSS class to an element.

```tanglish
T.addClass("#button", "active") aipoindi
```

#### `T.removeClass(selector, className)`
Remove a CSS class from an element.

```tanglish
T.removeClass("#button", "active") aipoindi
```

#### `T.toggleClass(selector, className)`
Toggle a CSS class on an element.

```tanglish
T.toggleClass("#menu", "open") aipoindi
```

### Visibility

#### `T.show(selector)`
Show an element.

```tanglish
T.show("#hidden-content") aipoindi
```

#### `T.hide(selector)`
Hide an element (display: none).

```tanglish
T.hide("#warning") aipoindi
```

#### `T.toggle(selector)`
Toggle visibility of an element.

```tanglish
T.toggle("#menu") aipoindi
```

### Form Input

#### `T.val(selector, [value])`
Get or set the value of an input element.

```tanglish
# Get value
idigo email = T.val("#email-input") aipoindi

# Set value
T.val("#email-input", "user@example.com") aipoindi
```

### Event Handling

#### `T.on(selector, event, handler)`
Attach an event listener to elements.

```tanglish
T.on("#button", "click", pani() {
  cheppu "Button clicked!" aipoindi
}) aipoindi
```

#### `T.off(selector, event, handler)`
Remove an event listener.

```tanglish
T.off("#button", "click", myHandler) aipoindi
```

#### `T.emit(selector, eventName, data)`
Trigger a custom event.

```tanglish
T.emit("#myElement", "custom-event", { value: 42 }) aipoindi
```

### State Management

#### `T.setState(key, value)`
Store application state and trigger UI updates.

```tanglish
T.setState("user-count", 42) aipoindi
```

#### `T.getState(key)`
Retrieve stored state.

```tanglish
idigo count = T.getState("user-count") aipoindi
```

### HTTP Requests

#### `T.fetch(url, [options])`
Make an asynchronous HTTP request.

```tanglish
idigo response = T.fetch("/api/users") aipoindi
```

### Data Persistence

#### `T.save(key, value)`
Save data to browser's LocalStorage.

```tanglish
T.save("user-preferences", { theme: "dark" }) aipoindi
```

#### `T.load(key)`
Load data from LocalStorage.

```tanglish
idigo prefs = T.load("user-preferences") aipoindi
```

#### `T.remove(key)`
Remove data from LocalStorage.

```tanglish
T.remove("user-preferences") aipoindi
```

### Animations

#### `T.animate(selector, keyframes, options)`
Animate an element with keyframes.

```tanglish
T.animate("#box", [
  { opacity: 0 },
  { opacity: 1 }
], { duration: 300 }) aipoindi
```

#### `T.fadeIn(selector, [duration])`
Fade in an element (default 300ms).

```tanglish
T.fadeIn("#content") aipoindi
```

#### `T.fadeOut(selector, [duration])`
Fade out an element (default 300ms).

```tanglish
T.fadeOut("#loading") aipoindi
```

### Utilities

#### `T.alert(message)`
Show an alert dialog.

```tanglish
T.alert("Operation successful!") aipoindi
```

#### `T.confirm(message)`
Show a confirmation dialog and return result.

```tanglish
idigo confirmed = T.confirm("Delete this item?") aipoindi
```

#### `T.wait(milliseconds)`
Wait for a specified duration (async).

```tanglish
T.wait(1000) aipoindi  # Wait 1 second
```

#### `T.format(number, [locale])`
Format a number with locale settings.

```tanglish
idigo formatted = T.format(1000000, "en-US") aipoindi  # "1,000,000"
```

#### `T.log(...args)`
Log to console with TanglishScript prefix.

```tanglish
T.log("Debug", value) aipoindi
```

---

## Node.js Runtime (T.* API for Servers)

When compiling with `--platform node`, you get server-specific helpers:

### Routing

#### `T.get(path, handler)`
Register a GET route.

```tanglish
T.get("/api/users", pani(req, res) {
  res.json({ users: [] }) aipoindi
}) aipoindi
```

#### `T.post(path, handler)`
Register a POST route.

```tanglish
T.post("/api/users", pani(req, res) {
  # Handle POST
}) aipoindi
```

#### `T.put(path, handler)`
Register a PUT route.

```tanglish
T.put("/api/users/:id", pani(req, res) {
  # Handle PUT
}) aipoindi
```

#### `T.delete(path, handler)`
Register a DELETE route.

```tanglish
T.delete("/api/users/:id", pani(req, res) {
  # Handle DELETE
}) aipoindi
```

### File I/O

#### `T.readFile(filePath)`
Read a file synchronously.

```tanglish
idigo content = T.readFile("./data.json") aipoindi
```

#### `T.writeFile(filePath, content)`
Write content to a file.

```tanglish
T.writeFile("./data.json", content) aipoindi
```

#### `T.exists(filePath)`
Check if a file exists.

```tanglish
unte (T.exists("./config.json")) {
  cheppu "Config found" aipoindi
}
```

### Logging

#### `T.log(...args)`
Log to console.

```tanglish
T.log("Server started", PORT) aipoindi
```

#### `T.error(message)`
Log an error message.

```tanglish
T.error("Failed to connect to database") aipoindi
```

---

## Array Methods

All arrays have these built-in methods:

### `.length`
Get the number of elements.

```tanglish
idigo arr = [1, 2, 3] aipoindi
cheppu arr.length aipoindi  # 3
```

### `.push(value)`
Add an element to the end.

```tanglish
arr.push(4) aipoindi
```

### `.pop()`
Remove and return the last element.

```tanglish
idigo last = arr.pop() aipoindi
```

### `.map(callback)`
Transform each element.

```tanglish
idigo doubled = [1, 2, 3].map(pani(n) { pampu n * 2 aipoindi }) aipoindi
```

### `.filter(callback)`
Keep elements where callback returns true.

```tanglish
idigo evens = [1, 2, 3, 4].filter(pani(n) { pampu n % 2 == 0 aipoindi }) aipoindi
```

### `.reduce(callback, initial)`
Combine all elements into a single value.

```tanglish
idigo sum = [1, 2, 3].reduce(pani(total, n) { pampu total + n aipoindi }, 0) aipoindi
```

### `.forEach(callback)`
Execute a function for each element.

```tanglish
[1, 2, 3].forEach(pani(n) { cheppu n aipoindi }) aipoindi
```

### `.join(separator)`
Combine elements into a string.

```tanglish
idigo str = ["a", "b", "c"].join("-") aipoindi  # "a-b-c"
```

### `.includes(value)`
Check if element exists.

```tanglish
unte ([1, 2, 3].includes(2)) {
  cheppu "Found!" aipoindi
}
```

### `.indexOf(value)`
Find index of element.

```tanglish
idigo index = ["a", "b", "c"].indexOf("b") aipoindi  # 1
```

---

## String Methods

All strings have these built-in methods:

### `.length`
Get the number of characters.

```tanglish
cheppu "hello".length aipoindi  # 5
```

### `.toUpperCase()`
Convert to uppercase.

```tanglish
cheppu "hello".toUpperCase() aipoindi  # "HELLO"
```

### `.toLowerCase()`
Convert to lowercase.

```tanglish
cheppu "HELLO".toLowerCase() aipoindi  # "hello"
```

### `.substring(start, [end])`
Extract a substring.

```tanglish
cheppu "hello".substring(1, 4) aipoindi  # "ell"
```

### `.split(separator)`
Split into an array.

```tanglish
idigo parts = "a,b,c".split(",") aipoindi  # ["a", "b", "c"]
```

### `.trim()`
Remove whitespace from both ends.

```tanglish
cheppu "  hello  ".trim() aipoindi  # "hello"
```

### `.indexOf(substring)`
Find index of substring.

```tanglish
cheppu "hello world".indexOf("world") aipoindi  # 6
```

---

## Global Functions

### `cheppu(value)`
Print a value to console.

```tanglish
cheppu "Hello" aipoindi
cheppu 42 aipoindi
cheppu { name: "Arjun" } aipoindi
```

---

## Complete Example

```tanglish
# Create a simple counter app
varga Counter {
  nirmana_pani() {
    vasthu.count = 0 aipoindi
  }

  increment() {
    vasthu.count++ aipoindi
    vasthu.updateUI() aipoindi
  }

  updateUI() {
    T.setText("#count-display", "Count: " + vasthu.count) aipoindi
  }
}

idigo counter = parinamam Counter() aipoindi

T.on("#increment-btn", "click", pani() {
  counter.increment() aipoindi
}) aipoindi

counter.updateUI() aipoindi
```

---

For more information, see the [Language Specification](SPEC.md) or explore the [Examples](../examples/).
