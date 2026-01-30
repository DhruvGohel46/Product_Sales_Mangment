const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Menu events
  onNewBill: (callback) => ipcRenderer.on('menu-new-bill', callback),
  
  // Remove all listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // File operations (if needed)
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo')
});

// Disable features for security
window.addEventListener('DOMContentLoaded', () => {
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Disable text selection in certain areas
  const disableSelection = (elements) => {
    elements.forEach(el => {
      if (el) el.style.userSelect = 'none';
    });
  };
  
  // Apply to header, navigation, etc.
  disableSelection([
    document.querySelector('header'),
    document.querySelector('nav'),
    document.querySelector('.sidebar')
  ]);
});
