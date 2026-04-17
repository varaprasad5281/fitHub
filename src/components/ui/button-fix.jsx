/**
 * Cross-browser button fix helpers
 * Ensures all interactive elements work reliably across browsers and mobile devices
 */

export const ensureClickable = (element) => {
  if (!element) return;
  
  // Ensure pointer-events is not blocking
  element.style.pointerEvents = 'auto';
  
  // Ensure it's not behind other elements
  if (element.style.zIndex === '') {
    element.style.position = 'relative';
  }
  
  // Prevent parent pointer-events: none from blocking
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    if (window.getComputedStyle(parent).pointerEvents === 'none') {
      parent.style.pointerEvents = 'auto';
    }
    parent = parent.parentElement;
  }
};

export const touchEventWorkaround = (element, callback) => {
  if (!element) return;
  
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;

  element.addEventListener('touchstart', (e) => {
    isTouching = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  element.addEventListener('touchend', (e) => {
    if (!isTouching) return;
    isTouching = false;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = Math.abs(touchEndX - touchStartX);
    const dy = Math.abs(touchEndY - touchStartY);

    // If movement is minimal, treat as a tap
    if (dx < 20 && dy < 20 && callback) {
      callback(e);
    }
  }, { passive: true });
};

export const normalizeButton = (element) => {
  if (!element) return;
  
  // Ensure it's keyboard accessible
  if (!element.getAttribute('type') && element.tagName !== 'A') {
    element.setAttribute('type', 'button');
  }
  
  // Ensure it has proper focus styling
  if (!element.className.includes('focus') && !element.className.includes('outline')) {
    element.style.outline = '2px solid transparent';
    element.style.outlineOffset = '2px';
  }
  
  ensureClickable(element);
};