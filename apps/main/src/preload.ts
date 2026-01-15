import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("dmStore", {
  loadState: () => ipcRenderer.invoke("state:load"),
  saveState: (state: unknown) => ipcRenderer.invoke("state:save", state),
  resetState: () => ipcRenderer.invoke("state:reset"),
  info: () => ipcRenderer.invoke("state:info"),
  selectDataPath: () => ipcRenderer.invoke("state:selectDataPath"),
  openDataPath: () => ipcRenderer.invoke("state:openDataPath"),
  loadCampaigns: () => ipcRenderer.invoke("campaigns:load"),
  saveCampaigns: (payload: unknown) => ipcRenderer.invoke("campaigns:save", payload),
  loadPCs: () => ipcRenderer.invoke("pcs:load"),
  savePCs: (payload: unknown) => ipcRenderer.invoke("pcs:save", payload),
  loadNPCs: () => ipcRenderer.invoke("npcs:load"),
  saveNPCs: (payload: unknown) => ipcRenderer.invoke("npcs:save", payload),
  loadMonsters: () => ipcRenderer.invoke("monsters:load"),
  saveMonsters: (payload: unknown) => ipcRenderer.invoke("monsters:save", payload),
  ping: () => "pong"
});