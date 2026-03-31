const DICTIONARY = [
  // CORE JAVASCRIPT
  { syntax: 'idigo [var] = [val] aipoindi', telugu: 'Here is... Finished', web: 'let [var] = [val];', desc: 'Declares a variable. Identical to javascript let.' },
  { syntax: 'cheppu [expr]', telugu: 'Say/Tell', web: 'console.log()', desc: 'Prints the expression to the developer console and the preview window.' },
  { syntax: 'unte ( [condition] ) { }', telugu: 'If present/True', web: 'if ( [condition] ) { }', desc: 'Executes the block if the condition evaluates to true.' },
  { syntax: 'lekapothe { }', telugu: 'Otherwise/Else', web: 'else { }', desc: 'Executes the block if the previous unte condition was false.' },
  { syntax: 'varaku ( [condition] ) { }', telugu: 'Until/While', web: 'while ( [condition] ) { }', desc: 'Loops the block continuously until the condition becomes false.' },
  { syntax: 'prathi ( [item] lona [list] )', telugu: 'For each... In...', web: 'for (let [item] of [list])', desc: 'Iterates over every element inside an array or list.' },
  { syntax: 'prayatninchu { }', telugu: 'Try', web: 'try { }', desc: 'Attempts to run the code. If an error occurs, it jumps to pattu.' },
  { syntax: 'pattu ( [error] ) { }', telugu: 'Catch', web: 'catch ( [error] ) { }', desc: 'Catches errors thrown within the prayatninchu block.' },
  { syntax: 'pani [name]([args]) { }', telugu: 'Work/Task', web: 'function [name]([args]) { }', desc: 'Declares a reusable function.' },
  { syntax: 'pampu [expr] aipoindi', telugu: 'Send/Return', web: 'return [expr];', desc: 'Returns a value from a pani (function) back to the caller.' },
  
  // OPERATORS & SYMBOLS
  { syntax: '# [text]', telugu: '(Hash symbol)', web: '// [text]', desc: 'Single-line comment. Ignored by the engine. Used for notes.' },
  { syntax: '+, -, *, /, %', telugu: '(Math math)', web: '+, -, *, /, %', desc: 'Standard arithmetic operators for numbers.' },
  { syntax: '==, !=, <, >, <=, >=', telugu: '(Comparisons)', web: '===, !==, <, >, <=, >=', desc: 'Standard comparison operators used in unte/varaku.' },
  { syntax: '&&, ||, !', telugu: '(Logic gates)', web: '&&, ||, !', desc: 'Logical AND, OR, and NOT operators.' },
  
  // DATA STRUCTURES
  { syntax: '"[text]"', telugu: '(Quotes)', web: 'String', desc: 'Represents text data.' },
  { syntax: '[ item1, item2 ]', telugu: '(Brackets)', web: 'Array', desc: 'Creates a list of ordered items.' },
  { syntax: '{ key: value }', telugu: '(Braces)', web: 'Object', desc: 'Creates a dictionary of key-value pairs.' },
  
  // HTML (petti)
  { syntax: 'petti [tag] { }', telugu: 'Box (Container)', web: '<[tag]></[tag]>', desc: 'Creates an HTML element. Can be nested inside other pettis.' },
  { syntax: 'petti [tag] [attr]="[val]" { }', telugu: 'Box with Attributes', web: '<[tag] [attr]="[val]"></[tag]>', desc: 'Creates an HTML element with native attributes like id, class, src, type.' },
  { syntax: 'raayi "[text]"', telugu: 'Write', web: 'innerHTML / Text Node', desc: 'Writes text directly into the nearest wrapping petti.' },
  
  // CSS (alankaram)
  { syntax: 'alankaram [selector] { }', telugu: 'Decoration', web: 'CSS block', desc: 'Creates a CSS style definition for the specified HTML selector (like div, .card, #main).' },
  { syntax: '[prop] = "[val]" aipoindi', telugu: '(CSS property)', web: 'prop: val;', desc: 'Used inside an alankaram block to assign a CSS property.' },
  
  // EVENTS
  { syntax: 'click ayithe [func]()', telugu: 'If Clicked', web: 'onclick="[func]()"', desc: 'Binds a Javascript pani (function) to an HTML petti click event.' }
];

function renderDict(filterText = '') {
  const tbody = document.getElementById('dictBody');
  if(!tbody) return;
  
  const query = filterText.toLowerCase();
  let html = '';
  
  DICTIONARY.forEach(d => {
    if(d.syntax.toLowerCase().includes(query) || 
       d.telugu.toLowerCase().includes(query) || 
       d.web.toLowerCase().includes(query) || 
       d.desc.toLowerCase().includes(query)) {
       
       html += `
         <tr>
           <td class="dt-tanglish">${d.syntax.replace(/\[/g, '<span style="color:#888">[').replace(/\]/g, ']</span>')}</td>
           <td style="color:#ccc; font-style:italic">"${d.telugu}"</td>
           <td><span class="dt-map">${d.web}</span></td>
           <td class="dt-desc">${d.desc}</td>
         </tr>
       `;
    }
  });
  
  if(html === '') {
    html = `<tr><td colspan="4" style="text-align:center; padding:40px; color:#888;">No dictionary results found for "${filterText}"</td></tr>`;
  }
  
  tbody.innerHTML = html;
}

function openDictionary() {
  document.getElementById('dictModal').classList.add('show');
  document.getElementById('dictSearch').value = '';
  renderDict();
  document.getElementById('dictSearch').focus();
}

function closeDictionary() {
  document.getElementById('dictModal').classList.remove('show');
}

function filterDict() {
  renderDict(document.getElementById('dictSearch').value);
}

// Global escape key to close dictionary
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeDictionary();
});
