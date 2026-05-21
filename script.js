// ColorFly - Generador de paletas de colores js
const paletteForm = document.getElementById("paletteForm");
const paletteSize = document.getElementById("paletteSize");
const paletteGrid = document.getElementById("paletteGrid");
const toast = document.getElementById("toast");
const savePaletteButton = document.getElementById("savePaletteButton");
const savedPalette = document.getElementById("savedPalette");

let currentPalette = [];
// Genera un color HSL aleatorio con valores dentro de un rango 
function generateRandomHSL() {
  const hue = Math.floor(Math.random() * 361);
  const saturation = Math.floor(Math.random() * 41) + 50;
  const lightness = Math.floor(Math.random() * 41) + 35;

  return {
    h: hue,
    s: saturation,
    l: lightness
  };
}
// Convierte un color HSL a formato hex
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
// Cálculo de los componentes RGB a partir de HSL
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const match = l - chroma / 2;

  // Asignación de los valores RGB según el rango del matiz
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = chroma;
    g = x;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = chroma;
  } else if (h >= 120 && h < 180) {
    g = chroma;
    b = x;
  } else if (h >= 180 && h < 240) {
    g = x;
    b = chroma;
  } else if (h >= 240 && h < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const red = Math.round((r + match) * 255);
  const green = Math.round((g + match) * 255);
  const blue = Math.round((b + match) * 255);

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}
// Convierte un valor numérico a su representación hex de dos dígitos
function toHex(value) {
  return value.toString(16).padStart(2, "0");
}
// Crea un objeto de color con valores HSL, su equivalente hex
function createColor() {
  const hsl = generateRandomHSL();
  const hex = hslToHex(hsl.h, hsl.s, hsl.l);

  return {
    hsl,
    hex,
    locked: false
  };
}

// Genera una nueva paleta de colores, manteniendo los colores bloqueados
function generatePalette(size) {
  const newPalette = [];

  for (let index = 0; index < size; index++) {
    const existingColor = currentPalette[index];

    if (existingColor && existingColor.locked) {
      newPalette.push(existingColor);
    } else {
      newPalette.push(createColor());
    }
  }

  currentPalette = newPalette;
  renderPalette();
}
// Renderiza la paleta de colores en el DOM
function renderPalette() {
  paletteGrid.innerHTML = "";

  currentPalette.forEach((color, index) => {
    const hslText = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;

    const card = document.createElement("article");
    card.className = "color-card";
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Color ${color.hex}. Presiona Enter para copiar.`);

    card.innerHTML = `
      <div class="color-preview" style="background-color: ${color.hex};"></div>

      <div class="color-info">
        <span class="hex-code">${color.hex}</span>
        <span class="hsl-code">${hslText}</span>

        <div class="card-actions">
          <span>Click para copiar</span>
          <button 
            class="lock-button" 
            type="button"
            aria-label="${color.locked ? "Desbloquear color" : "Bloquear color"}"
            data-index="${index}"
          >
            ${color.locked ? "🔒" : "🔓"}
          </button>
        </div>
      </div>
    `;
// 
    card.addEventListener("click", () => {
      copyToClipboard(color.hex);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        copyToClipboard(color.hex);
      }
    });

    const lockButton = card.querySelector(".lock-button");

    lockButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleLock(index);
    });

    paletteGrid.appendChild(card);
  });
}

function toggleLock(index) {
  currentPalette[index].locked = !currentPalette[index].locked;
  renderPalette();

  showToast(
    currentPalette[index].locked
      ? "Color bloqueado"
      : "Color desbloqueado"
  );
}
// Copia el texto al portapapeles y muestra una notificación
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${text} copiado`);
  } catch (error) {
    showToast("No se pudo copiar el color");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}
// Guarda la paleta actual en localStorage y actualiza la sección de paletas guardadas
function savePalette() {
  localStorage.setItem("colorflyPalette", JSON.stringify(currentPalette));
  renderSavedPalette();
  showToast("Paleta guardada");
}
// Renderiza la paleta guardada desde localStorage o muestra un mensaje si no hay ninguna guardada
function renderSavedPalette() {
  const saved = localStorage.getItem("colorflyPalette");

  if (!saved) {
    savedPalette.innerHTML = `<p class="empty-message">Aún no has guardado una paleta.</p>`;
    return;
  }

  const colors = JSON.parse(saved);

  savedPalette.innerHTML = "";
// 
  colors.forEach((color) => {
    const chip = document.createElement("div");
    chip.className = "saved-chip";
    chip.style.backgroundColor = color.hex;
    chip.title = color.hex;
    chip.setAttribute("aria-label", `Color guardado ${color.hex}`);
    savedPalette.appendChild(chip);
  });
}
// Eventos para generar la paleta, cambiar su tamaño, guardar y mostrar la paleta guardada
paletteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  generatePalette(Number(paletteSize.value));
});

paletteSize.addEventListener("change", () => {
  generatePalette(Number(paletteSize.value));
});

savePaletteButton.addEventListener("click", savePalette);

generatePalette(Number(paletteSize.value));
renderSavedPalette();