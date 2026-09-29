const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('fontLibrary', {
  scan: () => ipcRenderer.invoke('fonts:scan'),
  readData: () => ipcRenderer.invoke('data:read'),
  saveData: data => ipcRenderer.invoke('data:save', data),
  exportData: () => ipcRenderer.invoke('data:export'),
  importData: () => ipcRenderer.invoke('data:import'),
  systemTheme: () => ipcRenderer.invoke('theme:system')
});
