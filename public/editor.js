const editor = document.getElementById('editor');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const h1Btn = document.getElementById('h1Btn');
const h2Btn = document.getElementById('h2Btn');
const h3Btn = document.getElementById('h3Btn');
const ulBtn = document.getElementById('ulBtn');
const olBtn = document.getElementById('olBtn');
const leftBtn = document.getElementById('leftBtn');
const centerBtn = document.getElementById('centerBtn');
const rightBtn = document.getElementById('rightBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const dbTextarea = document.getElementById('dbTextarea');

// Format text as bold
boldBtn.addEventListener('click', () => {
  document.execCommand('bold', false, null);
  editor.focus();
});

// Format text as italic
italicBtn.addEventListener('click', () => {
  document.execCommand('italic', false, null);
  editor.focus();
});

// Insert heading 1
h1Btn.addEventListener('click', () => {
  document.execCommand('formatBlock', false, '<h1>');
  editor.focus();
});

// Insert heading 2
h2Btn.addEventListener('click', () => {
  document.execCommand('formatBlock', false, '<h2>');
  editor.focus();
});

// Insert heading 3
h3Btn.addEventListener('click', () => {
  document.execCommand('formatBlock', false, '<h3>');
  editor.focus();
});

// Insert unordered list
ulBtn.addEventListener('click', () => {
  document.execCommand('insertUnorderedList', false, null);
  editor.focus();
});

// Insert ordered list
olBtn.addEventListener('click', () => {
  document.execCommand('insertOrderedList', false, null);
  editor.focus();
});

// Align left
leftBtn.addEventListener('click', () => {
  document.execCommand('justifyLeft', false, null);
  editor.focus();
});

// Align center
centerBtn.addEventListener('click', () => {
  document.execCommand('justifyCenter', false, null);
  editor.focus();
});

// Align right
rightBtn.addEventListener('click', () => {
  document.execCommand('justifyRight', false, null);
  editor.focus();
});

// Clear placeholder text on first input
editor.addEventListener('input', function() {
  if (this.innerText.trim() === 'Start typing here...') {
    this.innerHTML = '<p></p>';
  }
});

// Handle paste to maintain formatting
editor.addEventListener('paste', function(e) {
  e.preventDefault();
  const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
  document.execCommand('insertHTML', false, text);
});

// Export editor content to database format (HTML string)
exportBtn.addEventListener('click', () => {
  const htmlContent = editor.innerHTML;
  dbTextarea.value = htmlContent;
  dbTextarea.scrollIntoView({ behavior: 'smooth' });
});

// Import from database format (restore HTML to editor)
importBtn.addEventListener('click', () => {
  const dbContent = dbTextarea.value.trim();
  
  if (!dbContent) {
    alert('Database textarea is empty!');
    return;
  }
  
  editor.innerHTML = dbContent;
  editor.scrollIntoView({ behavior: 'smooth' });
  editor.focus();
});
