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

let selectedImage = null;
let longPressTimer = null;

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

// Close menu when clicking in editor
editor.addEventListener('click', (e) => {
  if (e.target.classList && !e.target.classList.contains('editor-image')) {
    closeImageMenu();
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
