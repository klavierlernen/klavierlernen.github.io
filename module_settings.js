// SETTINGS VERZEICHNIS


// SCROLLEN DEAKTIVIEREN
window.addEventListener('scroll', function(e) {
    e.preventDefault();
    window.scrollTo(0, 0);
  }, { passive: false });

  // MODUS: BENUTZERDEFINIERT
  let customModeSettings = null;
  const octaveDefinitions = {
    grosse:   { notes: ["c","d","e","f","g","a","b"], baseOctave: 3 },
    kleine:   { notes: ["c","d","e","f","g","a","b"], baseOctave: 4 },
    eingestr: { notes: ["c","d","e","f","g","a","b"], baseOctave: 5 },
    zweigestr:{ notes: ["c","d","e","f","g","a","b"], baseOctave: 6 },
  };

  // SETTINGS: POSITION NOTATION
document.addEventListener('DOMContentLoaded', () => {
    const notation = document.getElementById('notation');
    if (!notation) return;
  
    // Load or set default transform
    let saved = localStorage.getItem('notationTransform');
    if (!saved) {
      saved = 'translate(-50%, -50%)';
      localStorage.setItem('notationTransform', saved);
    }
    notation.style.transform = saved;
  
    // Prepare variables for touch dragging
    let startX = 0, startY = 0;
    let initX = 0, initY = 0;
    let dragging = false;
  
    notation.addEventListener('touchstart', e => {
      // Only allow dragging if the Geodreieck-Button ("geometryToggle") is active
      const toggle = document.getElementById('geometryToggle');
      const isActive = toggle && (toggle.classList.contains('active') || toggle.dataset.active === 'true');
      if (!isActive) return;
      e.preventDefault();
      dragging = true;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      const style = window.getComputedStyle(notation);
      const matrix = new DOMMatrix(style.transform);
      initX = matrix.m41;
      initY = matrix.m42;
    }, { passive: false });
  
    notation.addEventListener('touchmove', e => {
      if (!dragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const newX = initX + dx;
      const newY = initY + dy;
      // Calculate the position of the center of notation in viewport
      // The transform is relative to (left:50%, top:50%)
      const newLeft = newX + window.innerWidth / 2;
      const newTop = newY + window.innerHeight / 2;
      if (
        newLeft > 0 &&
        newLeft < window.innerWidth &&
        newTop > 0 &&
        newTop < window.innerHeight
      ) {
        notation.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    }, { passive: false });
  
    notation.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      localStorage.setItem('notationTransform', notation.style.transform);
    });
  });