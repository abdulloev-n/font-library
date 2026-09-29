const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const fontkit = require('fontkit');

const fileById = new Map();
const ext = /\.(ttf|otf|ttc|otc)$/i;
function entries(root) {
  try {
    const output = execFileSync('reg', ['query', root], { encoding: 'utf8', windowsHide: true, timeout: 12000, stdio: ['ignore', 'pipe', 'ignore'] });
    return output.split(/\r?\n/).map(line => line.match(/^\s*(.+?)\s+REG_(?:SZ|EXPAND_SZ)\s+(.+?)\s*$/)).filter(Boolean).map(match => ({ registeredName: match[1], value: match[2] }));
  } catch { return []; }
}
function resolveFile(value, userFont) {
  const expanded = value.replace(/%WINDIR%/ig, process.env.WINDIR || 'C:\\Windows').replace(/%LOCALAPPDATA%/ig, process.env.LOCALAPPDATA || '');
  const base = userFont ? path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Windows', 'Fonts') : path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts');
  const options = path.isAbsolute(expanded) ? [expanded] : [path.join(base, expanded), path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', expanded)];
  return options.find(p => { try { return fs.statSync(p).isFile(); } catch { return false; } });
}
function category(name, face) {
  const s = name.toLowerCase();
  if (/mono|code|console|courier/.test(s)) return 'Monospace';
  if (/script|hand|brush|cursive|callig/.test(s)) return 'Script';
  if (/display|poster|decor|blackletter/.test(s)) return 'Display';
  if (/sans|grotes|gothic|ui|inter|arial|helvetica|bahnschrift|segoe/.test(s)) return 'Sans Serif';
  const panose = face['OS/2']?.panose;
  if (panose?.[0] === 2 && panose[1] >= 11 && panose[1] <= 15) return 'Sans Serif';
  return 'Serif';
}
function scanFonts() {
  fileById.clear();
  const sources = [
    ...entries('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts').map(e => ({ ...e, userFont: false })),
    ...entries('HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts').map(e => ({ ...e, userFont: true }))
  ];
  const byPath = new Map();
  for (const source of sources) {
    if (!ext.test(source.value)) continue;
    const file = resolveFile(source.value, source.userFont);
    if (file) byPath.set(file.toLowerCase(), file);
  }
  const families = new Map();
  for (const file of byPath.values()) {
    try {
      const opened = fontkit.openSync(file);
      const faces = opened.fonts || [opened];
      for (let index = 0; index < faces.length; index++) {
        const face = faces[index];
        const name = (face.familyName || face.fullName || path.basename(file, path.extname(file))).trim();
        const style = (face.subfamilyName || 'Regular').trim();
        const key = name.toLocaleLowerCase();
        const id = crypto.createHash('sha1').update(file.toLowerCase() + ':' + index).digest('hex').slice(0, 16);
        fileById.set(id, file);
        if (!families.has(key)) families.set(key, { id: key, name, category: category(name, face), variable: false, styles: [], axes: {}, faces: [], scripts: [], source: 'Installed in Windows' });
        const family = families.get(key);
        family.faces.push({ id, style });
        if (!family.styles.includes(style)) family.styles.push(style);
        for (const [script, codePoint] of [['Latin', 0x0041], ['Cyrillic', 0x0416], ['Greek', 0x03A9], ['Arabic', 0x0639]]) {
          if (!family.scripts.includes(script) && face.hasGlyphForCodePoint(codePoint)) family.scripts.push(script);
        }
        if (face.variationAxes && Object.keys(face.variationAxes).length) {
          family.variable = true;
          family.axes = face.variationAxes;
        }
      }
    } catch { /* Ignore malformed or unsupported font files. */ }
  }
  return [...families.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'));
}
module.exports = { scanFonts, fileById };
