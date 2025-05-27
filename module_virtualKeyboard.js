document.addEventListener("DOMContentLoaded", () => {
    const settingsPanel = document.getElementById("settingsPanel");
    const pauseButton = document.createElement("span");
    pauseButton.id = "pauseButton";
    pauseButton.textContent = "🎹";
    settingsPanel.appendChild(pauseButton);

    pauseButton.addEventListener("click", () => {
      const notationElem = document.getElementById("notation");
      const vk = document.getElementById("virtualKeyboard");
      if (vk) {
        const isHidden = vk.style.visibility === "hidden";
        vk.style.visibility = isHidden ? "visible" : "hidden";
        // Neu: Klasse setzen/removen
        if (isHidden) {
          document.body.classList.add("vk-active");
        } else {
          document.body.classList.remove("vk-active");
        }
        if (notationElem) {
          if (isHidden) {
            // Keyboard wird aktiviert: Notation etwas höher positionieren
            notationElem.style.top = "55%";
          } else {
            // Keyboard wird deaktiviert: gespeicherte Position wiederherstellen
            const saved = localStorage.getItem("notationTransform");
            if (saved) notationElem.style.transform = saved;
            // Entferne inline-top, damit CSS-Default (85%) greift
            notationElem.style.top = "";
          }
        }
      }
    });

    // ---- Virtual Keyboard below notation ----
    // Find the button container
    const bc = document.getElementById("buttonContainer");
    if (bc) {
      // Create a virtual keyboard element
      const vk = document.createElement("div");
      vk.id = "virtualKeyboard";
      vk.textContent = "Virtuelles Keyboard";
      // Keyboard initially hidden
      vk.style.visibility = "hidden";
      vk.style.position = "fixed";
      vk.style.top = "10%";
      vk.style.transform = "translateY(210%) scale(0.7, 1.5)"; // Uniform Zoom: both axes the same scale
      vk.style.zIndex = "100";
      vk.style.background = "#eee";
      vk.style.padding = "100px";
      // Initially place it just above the button container
      // We'll update its position on window resize and DOMContentLoaded
      function positionVK() {
        const bcRect = bc.getBoundingClientRect();
        const vkHeight = vk.offsetHeight || 200;
        // Place it above the button container, but not out of screen
        let top = bcRect.top - vkHeight - 5;
        if (top < 0) top = 0;
        vk.style.top = `${top}px`;
      }
      // Append first so offsetHeight is available
      document.body.appendChild(vk);
      // --- Override key dimensions after rendering ---
      setTimeout(() => {
        const whiteKeys = vk.querySelectorAll('.white-key, .white');
        whiteKeys.forEach(key => {
          key.style.width = '23px';
          key.style.height = '260px';
        });
        const blackKeys = vk.querySelectorAll('.black-key, .black');
        blackKeys.forEach(key => {
          key.style.width = '14px';
          key.style.height = '80px';
          key.style.marginLeft = '-7px';
          key.style.marginRight = '-7px';
        });
      }, 100);
      // Position after appending
      positionVK();
      // Update position on window resize and orientation change
      window.addEventListener("resize", positionVK);
      window.addEventListener("orientationchange", positionVK);
      // The virtual keyboard layout and input is now handled only by QwertyHancock or other dedicated code.
      // No manual <button> elements are created here.
    }
  });