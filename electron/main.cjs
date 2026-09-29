const { app, BrowserWindow, ipcMain, dialog, nativeTheme, protocol } = require('electron');
const fs = require('fs');
const path = require('path');
const { scanFonts, fileById } = require('./fonts.cjs');
const qaLog = value => { if (process.env.FONTLIB_QA_DIR) { fs.mkdirSync(process.env.FONTLIB_QA_DIR, { recursive: true }); fs.appendFileSync(path.join(process.env.FONTLIB_QA_DIR, 'qa-debug.log'), value + '\n'); } };
qaLog('main loaded');
if (process.env.FONTLIB_QA_DIR) {
  const qaUserData = path.join(process.env.FONTLIB_QA_DIR, 'user-data');
  fs.mkdirSync(qaUserData, { recursive: true });
  app.setPath('userData', qaUserData);
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('no-sandbox');
}

protocol.registerSchemesAsPrivileged([{ scheme: 'fontlib', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
let window;
const dataFile = () => path.join(app.getPath('userData'), 'library.json');
function readData() {
  try { return JSON.parse(fs.readFileSync(dataFile(), 'utf8')); }
  catch { return { favorites: [], collections: [], notes: {}, ratings: {}, hidden: [], samples: [], pairings: [], projects: [], theme: 'system' }; }
}
function createWindow() {
  qaLog('createWindow');
  window = new BrowserWindow({ width: 1580, height: 990, minWidth: 1100, minHeight: 720, backgroundColor: '#f8f9fa', title: 'Font Library', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: !process.env.FONTLIB_QA_DIR } });
  if (process.env.VITE_DEV_SERVER_URL) window.loadURL(process.env.VITE_DEV_SERVER_URL);
  else window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  window.webContents.on('did-finish-load', () => qaLog('did-finish-load'));
  window.webContents.on('did-fail-load', (_e, code, description) => qaLog(`did-fail-load ${code} ${description}`));
  window.webContents.on('render-process-gone', (_e, details) => qaLog(`render-process-gone ${JSON.stringify(details)}`));
  window.on('closed', () => qaLog('window closed'));
  if (process.env.FONTLIB_QA_DIR) {
    window.webContents.once('did-finish-load', () => setTimeout(async () => {
      const out = process.env.FONTLIB_QA_DIR;
      fs.mkdirSync(out, { recursive: true });
      const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
      const capture = async name => { await pause(500); fs.writeFileSync(path.join(out, name + '.png'), (await window.webContents.capturePage()).toPNG()); };
      try {
        await capture('library');
        await window.webContents.executeJavaScript("[...document.querySelectorAll('.font-card .card-actions button[title=Compare]')].slice(0,4).forEach(x=>x.click())");
        await window.webContents.executeJavaScript("[...document.querySelectorAll('.nav-item')].find(x => x.textContent.includes('Compare')).click()");
        await capture('compare');
        await window.webContents.executeJavaScript("[...document.querySelectorAll('.nav-item')].find(x => x.textContent.includes('Library')).click()");
        await window.webContents.executeJavaScript("[...document.querySelectorAll('.link-title')].find(x => x.textContent.includes('Bahnschrift')).click()");
        await capture('detail');
        await window.webContents.executeJavaScript("[...document.querySelectorAll('.nav-item')].find(x => x.textContent.includes('Type Studio')).click()");
        await capture('studio');
        for (let i = 0; i < 3; i++) {
          if (await window.webContents.executeJavaScript("document.documentElement.dataset.theme === 'dark'")) break;
          await window.webContents.executeJavaScript("document.querySelector('.top-actions button').click()");
          await pause(200);
        }
        await capture('studio-dark');
        await window.webContents.executeJavaScript("const s=document.querySelector('.studio-editor select'); s.value='Blank'; s.dispatchEvent(new Event('change',{bubbles:true}))");
        await pause(200);
        await window.webContents.executeJavaScript("[...document.querySelectorAll('.studio-editor button')].find(x=>x.textContent.includes('Add text block')).click()");
        await capture('studio-blank');
      } finally { app.quit(); }
    }, 4000));
  }
}
app.whenReady().then(() => {
  qaLog('ready');
  protocol.handle('fontlib', request => {
    const id = new URL(request.url).pathname.slice(1);
    const file = fileById.get(id);
    if (!file || !fs.existsSync(file)) return new Response('Not found', { status: 404 });
    return new Response(fs.readFileSync(file), { headers: { 'Content-Type': 'font/ttf', 'Access-Control-Allow-Origin': '*' } });
  });
  ipcMain.handle('fonts:scan', () => scanFonts());
  ipcMain.handle('data:read', () => readData());
  ipcMain.handle('data:save', (_event, data) => {
    const safe = JSON.stringify(data);
    if (safe.length > 5_000_000) throw new Error('Library data is too large');
    fs.mkdirSync(path.dirname(dataFile()), { recursive: true });
    const temp = dataFile() + '.tmp'; fs.writeFileSync(temp, safe); fs.renameSync(temp, dataFile());
    return true;
  });
  ipcMain.handle('data:export', async () => {
    const result = await dialog.showSaveDialog(window, { title: 'Export library data', defaultPath: 'font-library-backup.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (result.canceled) return false;
    fs.writeFileSync(result.filePath, JSON.stringify(readData(), null, 2)); return true;
  });
  ipcMain.handle('data:import', async () => {
    const result = await dialog.showOpenDialog(window, { title: 'Import library data', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (result.canceled) return null;
    const raw = fs.readFileSync(result.filePaths[0], 'utf8');
    if (raw.length > 5_000_000) throw new Error('Backup is too large');
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.favorites) || !Array.isArray(data.collections)) throw new Error('Invalid backup');
    fs.writeFileSync(dataFile(), JSON.stringify(data)); return data;
  });
  ipcMain.handle('theme:system', () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
