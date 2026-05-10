/**
 * Layouts de teclado para el personalizador.
 * Cada tecla: { code, label, x, y, w (en u), h (en u) }
 * 1u = una unidad estándar de tecla.
 */

const row = (keys, y) => keys.map((k, i) => {
  let x = 0
  for (let j = 0; j < i; j++) x += keys[j].w ?? 1
  return { ...k, x, y, w: k.w ?? 1, h: k.h ?? 1 }
})

// 60% layout (61 teclas aprox.)
export const layout60 = [
  ...row([
    { code: 'Backquote', label: '`' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' },
    { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' },
    { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' },
    { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' },
    { code: 'Equal', label: '=' }, { code: 'Backspace', label: 'Backspace', w: 2 },
  ], 0),
  ...row([
    { code: 'Tab', label: 'Tab', w: 1.5 },
    { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' }, { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' }, { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' }, { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' }, { code: 'BracketRight', label: ']' },
    { code: 'Backslash', label: '\\', w: 1.5 },
  ], 1),
  ...row([
    { code: 'CapsLock', label: 'Caps', w: 1.75 },
    { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' }, { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' }, { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' }, { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" },
    { code: 'Enter', label: 'Enter', w: 2.25 },
  ], 2),
  ...row([
    { code: 'ShiftLeft', label: 'Shift', w: 2.25 },
    { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' }, { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' }, { code: 'Comma', label: ',' }, { code: 'Period', label: '.' },
    { code: 'Slash', label: '/' },
    { code: 'ShiftRight', label: 'Shift', w: 2.75 },
  ], 3),
  ...row([
    { code: 'ControlLeft', label: 'Ctrl', w: 1.25 },
    { code: 'MetaLeft', label: 'Win', w: 1.25 },
    { code: 'AltLeft', label: 'Alt', w: 1.25 },
    { code: 'Space', label: 'Space', w: 6.25 },
    { code: 'AltRight', label: 'Alt', w: 1.25 },
    { code: 'Fn', label: 'Fn', w: 1.25 },
    { code: 'ContextMenu', label: 'Menu', w: 1.25 },
    { code: 'ControlRight', label: 'Ctrl', w: 1.25 },
  ], 4),
]

// 65% layout: 60% + columna de flechas + Del/PgUp/PgDn
export const layout65 = [
  ...layout60.map((k) => ({ ...k })),
  // Columna extra a la derecha (flechas + del)
  { code: 'Delete', label: 'Del', x: 15, y: 0 },
  { code: 'PageUp', label: 'PgUp', x: 15, y: 1 },
  { code: 'PageDown', label: 'PgDn', x: 15, y: 2 },
  { code: 'ArrowUp', label: '↑', x: 14, y: 3 },
  { code: 'ArrowLeft', label: '←', x: 13.25, y: 4 },
  { code: 'ArrowDown', label: '↓', x: 14, y: 4 },
  { code: 'ArrowRight', label: '→', x: 15, y: 4 },
]

// TKL: row Fn + main + cluster nav + flechas
export const layoutTKL = [
  // Fila F (y=-1.25 visual)
  ...row([
    { code: 'Escape', label: 'Esc' },
    { code: 'F1', label: 'F1' }, { code: 'F2', label: 'F2' }, { code: 'F3', label: 'F3' }, { code: 'F4', label: 'F4' },
    { code: 'F5', label: 'F5' }, { code: 'F6', label: 'F6' }, { code: 'F7', label: 'F7' }, { code: 'F8', label: 'F8' },
    { code: 'F9', label: 'F9' }, { code: 'F10', label: 'F10' }, { code: 'F11', label: 'F11' }, { code: 'F12', label: 'F12' },
  ], -1.25),
  // main 60%
  ...layout60.map((k) => ({ ...k })),
  // cluster: PrtSc/ScrLk/Pause + Ins/Home/PgUp + Del/End/PgDn + flechas
  { code: 'PrintScreen', label: 'PrSc', x: 15.25, y: -1.25 },
  { code: 'ScrollLock', label: 'ScLk', x: 16.25, y: -1.25 },
  { code: 'Pause', label: 'Pause', x: 17.25, y: -1.25 },
  { code: 'Insert', label: 'Ins', x: 15.25, y: 0 },
  { code: 'Home', label: 'Home', x: 16.25, y: 0 },
  { code: 'PageUp', label: 'PgUp', x: 17.25, y: 0 },
  { code: 'Delete', label: 'Del', x: 15.25, y: 1 },
  { code: 'End', label: 'End', x: 16.25, y: 1 },
  { code: 'PageDown', label: 'PgDn', x: 17.25, y: 1 },
  { code: 'ArrowUp', label: '↑', x: 16.25, y: 3 },
  { code: 'ArrowLeft', label: '←', x: 15.25, y: 4 },
  { code: 'ArrowDown', label: '↓', x: 16.25, y: 4 },
  { code: 'ArrowRight', label: '→', x: 17.25, y: 4 },
]

// Full size = TKL + numpad
export const layoutFull = [
  ...layoutTKL.map((k) => ({ ...k })),
  // Numpad
  { code: 'NumLock', label: 'Num', x: 18.5, y: 0 },
  { code: 'NumpadDivide', label: '/', x: 19.5, y: 0 },
  { code: 'NumpadMultiply', label: '*', x: 20.5, y: 0 },
  { code: 'NumpadSubtract', label: '−', x: 21.5, y: 0 },
  { code: 'Numpad7', label: '7', x: 18.5, y: 1 },
  { code: 'Numpad8', label: '8', x: 19.5, y: 1 },
  { code: 'Numpad9', label: '9', x: 20.5, y: 1 },
  { code: 'NumpadAdd', label: '+', x: 21.5, y: 1, h: 2 },
  { code: 'Numpad4', label: '4', x: 18.5, y: 2 },
  { code: 'Numpad5', label: '5', x: 19.5, y: 2 },
  { code: 'Numpad6', label: '6', x: 20.5, y: 2 },
  { code: 'Numpad1', label: '1', x: 18.5, y: 3 },
  { code: 'Numpad2', label: '2', x: 19.5, y: 3 },
  { code: 'Numpad3', label: '3', x: 20.5, y: 3 },
  { code: 'NumpadEnter', label: 'Enter', x: 21.5, y: 3, h: 2 },
  { code: 'Numpad0', label: '0', x: 18.5, y: 4, w: 2 },
  { code: 'NumpadDecimal', label: '.', x: 20.5, y: 4 },
]

export const LAYOUTS = {
  '60%': layout60,
  '65%': layout65,
  'TKL': layoutTKL,
  'Full': layoutFull,
}

/** Paletas de colores predefinidas para selección rápida */
export const PRESET_PALETTES = [
  { name: 'GMK Red Samurai', colors: ['#1a1a2e', '#e63946', '#f1faee', '#a8dadc'] },
  { name: 'Neón Tokyo', colors: ['#0a0a0f', '#a855f7', '#22d3ee', '#ec4899'] },
  { name: 'Pastel Dream', colors: ['#fefae0', '#faedcd', '#d4a373', '#ccd5ae'] },
  { name: 'Monocromo', colors: ['#0a0a0f', '#3a3a52', '#9696aa', '#e7e7f0'] },
  { name: 'Cyberpunk', colors: ['#000814', '#ffd60a', '#ff006e', '#3a86ff'] },
  { name: 'Gruvbox', colors: ['#282828', '#fb4934', '#fabd2f', '#83a598'] },
]

export const FONT_OPTIONS = [
  'Inter', 'JetBrains Mono', 'Arial', 'Georgia', 'Courier New', 'Impact',
]
