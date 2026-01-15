"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("dmStore", {
    loadState: () => electron_1.ipcRenderer.invoke("state:load"),
    saveState: (state) => electron_1.ipcRenderer.invoke("state:save", state),
    resetState: () => electron_1.ipcRenderer.invoke("state:reset"),
    info: () => electron_1.ipcRenderer.invoke("state:info"),
    selectDataPath: () => electron_1.ipcRenderer.invoke("state:selectDataPath"),
    openDataPath: () => electron_1.ipcRenderer.invoke("state:openDataPath"),
    loadCampaigns: () => electron_1.ipcRenderer.invoke("campaigns:load"),
    saveCampaigns: (payload) => electron_1.ipcRenderer.invoke("campaigns:save", payload),
    loadPCs: () => electron_1.ipcRenderer.invoke("pcs:load"),
    savePCs: (payload) => electron_1.ipcRenderer.invoke("pcs:save", payload),
    loadNPCs: () => electron_1.ipcRenderer.invoke("npcs:load"),
    saveNPCs: (payload) => electron_1.ipcRenderer.invoke("npcs:save", payload),
    loadMonsters: () => electron_1.ipcRenderer.invoke("monsters:load"),
    saveMonsters: (payload) => electron_1.ipcRenderer.invoke("monsters:save", payload),
    ping: () => "pong"
});
