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
const img1Btn = document.getElementById('img1Btn');
const img2Btn = document.getElementById('img2Btn');
const img3Btn = document.getElementById('img3Btn');
const fontSelect = document.getElementById('fontSelect');
const fontSizeSelect = document.getElementById('fontSizeSelect');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

let selectedImage = null;
let longPressTimer = null;
let undoManager = null;

// Initialize undo manager to track custom font size changes
function initUndoManager() {
  undoManager = {
    savedStates: [editor.innerHTML],
    currentStateIndex: 0,
    maxStates: 50
  };
}

// Save state for undo/redo of font size changes
function saveState() {
  if (!undoManager) initUndoManager();
  
  // Remove any states after current index (when user makes a new change after undo)
  undoManager.savedStates = undoManager.savedStates.slice(0, undoManager.currentStateIndex + 1);
  
  // Add new state
  undoManager.savedStates.push(editor.innerHTML);
  undoManager.currentStateIndex++;
  
  // Limit history to maxStates
  if (undoManager.savedStates.length > undoManager.maxStates) {
    undoManager.savedStates.shift();
    undoManager.currentStateIndex--;
  }
}

// Custom undo
function customUndo() {
  if (!undoManager) initUndoManager();
  if (undoManager.currentStateIndex > 0) {
    undoManager.currentStateIndex--;
    editor.innerHTML = undoManager.savedStates[undoManager.currentStateIndex];
    updateFontSizeDisplay();
  }
}

// Custom redo
function customRedo() {
  if (!undoManager) initUndoManager();
  if (undoManager.currentStateIndex < undoManager.savedStates.length - 1) {
    undoManager.currentStateIndex++;
    editor.innerHTML = undoManager.savedStates[undoManager.currentStateIndex];
    updateFontSizeDisplay();
  }
}

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

// Undo
undoBtn.addEventListener('click', () => {
  if (undoManager && undoManager.currentStateIndex > 0) {
    customUndo();
  }
});

// Redo
redoBtn.addEventListener('click', () => {
  if (undoManager && undoManager.currentStateIndex < undoManager.savedStates.length - 1) {
    customRedo();
  }
});

// Keyboard shortcuts for undo/redo - only in editor
editor.addEventListener('keydown', (e) => {
  // Ctrl+Z or Cmd+Z for undo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    if (undoManager && undoManager.currentStateIndex > 0) {
      customUndo();
    }
  }
  
  // Ctrl+Shift+Z or Cmd+Shift+Z for redo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault();
    if (undoManager && undoManager.currentStateIndex < undoManager.savedStates.length - 1) {
      customRedo();
    }
  }
  
  // Ctrl+Y or Cmd+Y for redo (Windows/Linux style)
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault();
    if (undoManager && undoManager.currentStateIndex < undoManager.savedStates.length - 1) {
      customRedo();
    }
  }
});
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
  initUndoManager();
  editor.scrollIntoView({ behavior: 'smooth' });
  editor.focus();
});

// Insert image helper function
function insertImage(imageSrc) {
  editor.focus();
  const imgHtml = `<img src="${imageSrc}" class="editor-image" style="max-width: 100%; height: auto;" />`;
  document.execCommand('insertHTML', false, imgHtml);
  
  // Attach event listeners to newly inserted image
  const images = editor.querySelectorAll('.editor-image:not([data-bound])');
  images.forEach(img => {
    img.setAttribute('data-bound', 'true');
    attachImageListeners(img);
  });
}

function attachImageListeners(img) {
  img.contentEditable = 'false';
  img.style.cursor = 'pointer';
  
  // Desktop: right-click
  img.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showImageMenu(img);
  });
  
  // Mobile: long-press (2 seconds)
  img.addEventListener('mousedown', (e) => {
    if (e.button === 2) return; // Skip right-click
    longPressTimer = setTimeout(() => showImageMenu(img), 2000);
  });
  
  img.addEventListener('mouseup', () => {
    clearTimeout(longPressTimer);
  });
  
  img.addEventListener('mouseleave', () => {
    clearTimeout(longPressTimer);
  });
  
  // Touch events for mobile
  img.addEventListener('touchstart', (e) => {
    longPressTimer = setTimeout(() => showImageMenu(img), 2000);
  });
  
  img.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
  });
}

function showImageMenu(img) {
  clearTimeout(longPressTimer);
  
  // Remove previous menu and handles
  const existingMenu = document.querySelector('.image-menu');
  if (existingMenu) existingMenu.remove();
  removeResizeHandles();
  
  // Remove previous selection highlight
  document.querySelectorAll('.editor-image.selected').forEach(i => i.classList.remove('selected'));
  
  // Select this image
  img.classList.add('selected');
  selectedImage = img;
  
  // Add resize handles
  addResizeHandles(img);
  
  // Create menu
  const menu = document.createElement('div');
  menu.className = 'image-menu';
  
  const wrapLeft = document.createElement('button');
  wrapLeft.textContent = '◄ Wrap Left';
  wrapLeft.onclick = () => {
    img.classList.remove('float-right', 'no-wrap');
    img.classList.add('float-left');
  };
  
  const wrapRight = document.createElement('button');
  wrapRight.textContent = '► Wrap Right';
  wrapRight.onclick = () => {
    img.classList.remove('float-left', 'no-wrap');
    img.classList.add('float-right');
  };
  
  const noWrap = document.createElement('button');
  noWrap.textContent = '⊡ No Wrap';
  noWrap.onclick = () => {
    img.classList.remove('float-left', 'float-right');
    img.classList.add('no-wrap');
  };
  
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑 Delete';
  deleteBtn.onclick = () => {
    img.remove();
    menu.remove();
    selectedImage = null;
    removeResizeHandles();
  };
  
  menu.appendChild(wrapLeft);
  menu.appendChild(wrapRight);
  menu.appendChild(noWrap);
  menu.appendChild(deleteBtn);
  
  img.parentNode.insertBefore(menu, img);
  
  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', closeImageMenu);
  }, 100);
}

function closeImageMenu() {
  const menu = document.querySelector('.image-menu');
  if (menu) menu.remove();
  document.querySelectorAll('.editor-image.selected').forEach(i => i.classList.remove('selected'));
  removeResizeHandles();
  document.removeEventListener('click', closeImageMenu);
}

function addResizeHandles(img) {
  removeResizeHandles();
  
  const container = document.createElement('div');
  container.className = 'resize-container';
  container.setAttribute('data-resize-container', 'true');
  img.parentNode.insertBefore(container, img);
  container.appendChild(img);
  
  // Create resize handles
  const positions = ['nw', 'ne', 'sw', 'se'];
  positions.forEach(pos => {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-${pos}`;
    handle.addEventListener('mousedown', (e) => startResize(e, img, pos));
    handle.addEventListener('touchstart', (e) => startResize(e, img, pos));
    container.appendChild(handle);
  });
}

function removeResizeHandles() {
  const handles = document.querySelectorAll('.resize-handle');
  handles.forEach(h => h.remove());
  const containers = document.querySelectorAll('[data-resize-container="true"]');
  containers.forEach(c => {
    while (c.firstChild) {
      c.parentNode.insertBefore(c.firstChild, c);
    }
    c.remove();
  });
}

function startResize(e, img, position) {
  e.preventDefault();
  
  const startX = e.clientX || (e.touches && e.touches[0].clientX);
  const startY = e.clientY || (e.touches && e.touches[0].clientY);
  const startWidth = img.offsetWidth;
  const startHeight = img.offsetHeight;
  
  function handleMove(moveEvent) {
    const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
    const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
    
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    if (position.includes('e')) {
      newWidth = startWidth + deltaX;
    } else if (position.includes('w')) {
      newWidth = startWidth - deltaX;
    }
    
    if (position.includes('s')) {
      newHeight = startHeight + deltaY;
    } else if (position.includes('n')) {
      newHeight = startHeight - deltaY;
    }
    
    // Minimum size
    if (newWidth > 50 && newHeight > 50) {
      img.style.width = newWidth + 'px';
      img.style.height = newHeight + 'px';
    }
  }
  
  function handleEnd() {
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchend', handleEnd);
  }
  
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('touchmove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchend', handleEnd);
}

// Close menu when clicking in editor and update font size display
editor.addEventListener('click', (e) => {
  updateFontSizeDisplay();
  if (e.target.classList && !e.target.classList.contains('editor-image')) {
    closeImageMenu();
  }
});

// Function to get and display the font size of selected text
function updateFontSizeDisplay() {
  const selection = window.getSelection();
  
  // If no selection or collapsed, show empty
  if (selection.rangeCount === 0 || selection.isCollapsed) {
    fontSizeSelect.value = '';
    return;
  }
  
  try {
    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;
    
    // If text node, get parent element
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }
    
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      fontSizeSelect.value = '';
      return;
    }
    
    // Check inline style first
    if (node.style && node.style.fontSize) {
      fontSizeSelect.value = node.style.fontSize;
      return;
    }
    
    // Walk up the tree to find inline font-size
    let currentNode = node;
    while (currentNode && currentNode !== editor) {
      if (currentNode.style && currentNode.style.fontSize) {
        fontSizeSelect.value = currentNode.style.fontSize;
        return;
      }
      currentNode = currentNode.parentElement;
    }
    
    // Fallback: get computed font size
    const computedSize = window.getComputedStyle(node).fontSize;
    if (computedSize) {
      const sizeMatch = computedSize.match(/(\d+(?:\.\d+)?)/);
      if (sizeMatch) {
        const numericSize = Math.round(parseFloat(sizeMatch[0]));
        fontSizeSelect.value = numericSize + 'px';
        return;
      }
    }
    
    fontSizeSelect.value = '';
  } catch (e) {
    console.error('Error updating font size display:', e);
    fontSizeSelect.value = '';
  }
}

// Update font size display on text selection
editor.addEventListener('mouseup', updateFontSizeDisplay);
editor.addEventListener('keyup', updateFontSizeDisplay);
editor.addEventListener('touchend', updateFontSizeDisplay);
editor.addEventListener('click', (e) => {
  updateFontSizeDisplay();
  if (e.target.classList && !e.target.classList.contains('editor-image')) {
    closeImageMenu();
  }
});

// Change font family
fontSelect.addEventListener('change', () => {
  if (fontSelect.value) {
    document.execCommand('fontName', false, fontSelect.value);
  }
  // Reset dropdown to default
  fontSelect.value = '';
  editor.focus();
});

// Change font size with execCommand for undo/redo support
fontSizeSelect.addEventListener('change', () => {
  if (fontSizeSelect.value) {
    editor.focus();
    
    const selection = window.getSelection();
    
    // Only work if there's a selection
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      try {
        // Save state before change for undo
        saveState();
        
        // Extract and apply font size
        const range = selection.getRangeAt(0);
        const selectedContent = range.extractContents();
        
        // Create span with font size
        const span = document.createElement('span');
        span.style.fontSize = fontSizeSelect.value;
        span.appendChild(selectedContent);
        
        // Insert the span
        range.insertNode(span);
        
        // Re-select and update
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update dropdown display
        setTimeout(() => {
          updateFontSizeDisplay();
        }, 50);
      } catch (e) {
        console.error('Font size error:', e);
        editor.focus();
      }
    }
  }
});

// Insert Image 1
img1Btn.addEventListener('click', () => {
  insertImage('image1.svg');
});

// Insert Image 2
img2Btn.addEventListener('click', () => {
  insertImage('image2.svg');
});

// Insert Image 3
img3Btn.addEventListener('click', () => {
  insertImage('image3.svg');
});

// Initialize undo manager on page load
initUndoManager();
