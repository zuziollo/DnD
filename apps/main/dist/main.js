"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const url_1 = require("url");
const promises_1 = require("fs/promises");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const isDevelopment = process.env.NODE_ENV === "development";
const rendererDevUrl = process.env.VITE_DEV_SERVER_URL ||
    process.env.RENDERER_URL ||
    "http://127.0.0.1:5173";
let stateFilePath;
let campaignsFilePath;
let playerCharactersFilePath;
let npcFilePath;
let monsterFilePath;
let dataPath;
let settingsPath;
let userDataPath;
async function waitForDevServer(url, timeoutMs = 60000, intervalMs = 500) {
    const start = Date.now();
    const urlObj = new URL(url);
    const client = urlObj.protocol === "https:" ? https_1.default : http_1.default;
    while (Date.now() - start < timeoutMs) {
        try {
            const ok = await new Promise((resolve, reject) => {
                const req = client.request({
                    method: "GET",
                    host: urlObj.hostname,
                    port: urlObj.port,
                    path: urlObj.pathname,
                    timeout: 3000
                }, (res) => {
                    res.destroy();
                    resolve((res.statusCode ?? 500) < 400);
                });
                req.on("error", reject);
                req.on("timeout", () => req.destroy(new Error("timeout")));
                req.end();
            });
            if (ok) {
                console.log("[Dev] Dev server reachable at", url);
                return;
            }
        }
        catch (err) {
            console.log("[Dev] retry dev server", {
                message: err?.message ?? String(err),
                code: err?.code
            });
        }
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`Dev server not reachable at ${url} within ${timeoutMs}ms`);
}
async function initSettings() {
    userDataPath = electron_1.app.getPath("userData");
    settingsPath = (0, path_1.join)(userDataPath, "settings.json");
    dataPath = userDataPath;
    campaignsFilePath = (0, path_1.join)(dataPath, "campaigns.json");
    playerCharactersFilePath = (0, path_1.join)(dataPath, "player-characters.json");
    npcFilePath = (0, path_1.join)(dataPath, "npcs.json");
    monsterFilePath = (0, path_1.join)(dataPath, "monsters.json");
    try {
        const raw = await (0, promises_1.readFile)(settingsPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed?.dataPath) {
            dataPath = parsed.dataPath;
            campaignsFilePath = (0, path_1.join)(dataPath, "campaigns.json");
            npcFilePath = (0, path_1.join)(dataPath, "npcs.json");
            monsterFilePath = (0, path_1.join)(dataPath, "monsters.json");
        }
    }
    catch (err) {
        if (err?.code !== "ENOENT") {
            console.error("[State][main] settings read error", err);
        }
    }
    await (0, promises_1.mkdir)(dataPath, { recursive: true });
    const defaultStateFilePath = (0, path_1.join)(userDataPath, "app-state.json");
    stateFilePath = (0, path_1.join)(dataPath, "app-state.json");
    playerCharactersFilePath = (0, path_1.join)(dataPath, "player-characters.json");
    monsterFilePath = (0, path_1.join)(dataPath, "monsters.json");
    if (dataPath !== userDataPath) {
        try {
            const s = await (0, promises_1.stat)(defaultStateFilePath);
            const targetExists = await (0, promises_1.stat)(stateFilePath).then(() => true, () => false);
            if (!targetExists) {
                await (0, promises_1.copyFile)(defaultStateFilePath, stateFilePath);
                await (0, promises_1.rm)(defaultStateFilePath, { force: true });
                console.log("[State][main] migrated state", {
                    from: defaultStateFilePath,
                    to: stateFilePath,
                    size: s.size
                });
            }
        }
        catch (err) {
            if (err?.code !== "ENOENT") {
                console.error("[State][main] migration check error", err);
            }
        }
    }
    console.log("[State][main] userData:", userDataPath);
    console.log("[State][main] settingsPath:", settingsPath);
    console.log("[State][main] dataPath:", dataPath);
    console.log("[State][main] state file path:", stateFilePath);
    console.log("[State][main] campaigns file path:", campaignsFilePath);
    console.log("[PC][main] pcs file path:", playerCharactersFilePath);
    console.log("[NPC][main] npc file path:", npcFilePath);
    console.log("[Monster][main] monsters file path:", monsterFilePath);
}
function createWindow() {
    const preloadPath = (0, path_1.join)(__dirname, "preload.js");
    console.log("[State][main] preload path:", preloadPath);
    console.log("[Dev] rendererDevUrl:", rendererDevUrl);
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: preloadPath
        }
    });
    if (isDevelopment) {
        waitForDevServer(rendererDevUrl)
            .then(() => mainWindow.loadURL(rendererDevUrl))
            .catch((err) => {
            console.error("[Dev] renderer dev server not reachable", err?.message ?? err);
            const fallbackHtml = `
          <html><body style="font-family:sans-serif;background:#0f1115;color:#e5ecf5;padding:20px;">
          <h2>Renderer dev server is not running</h2>
          <p>Start it with:</p>
          <pre>npm run dev --workspace apps/renderer</pre>
          <p>Attempted: ${rendererDevUrl}</p>
          <p>Error: ${err?.message ?? err}</p>
          </body></html>`;
            mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(fallbackHtml));
        });
    }
    else {
        const indexPath = (0, path_1.join)(__dirname, "../../renderer/dist/index.html");
        mainWindow.loadURL((0, url_1.pathToFileURL)(indexPath).toString());
    }
}
electron_1.app.whenReady().then(() => {
    initSettings().catch((err) => console.error("[State][main] init error", err));
    electron_1.ipcMain.handle("state:load", async () => {
        console.log("[State][main] load requested from", stateFilePath);
        try {
            const s = await (0, promises_1.stat)(stateFilePath);
            console.log("[State][main] file exists, size:", s.size);
        }
        catch (err) {
            if (err?.code === "ENOENT") {
                console.log("[State][main] file not found, returning null");
                return null;
            }
            console.error("[State][main] stat error", err);
            throw err;
        }
        try {
            const raw = await (0, promises_1.readFile)(stateFilePath, "utf-8");
            console.log("[State][main] read bytes:", raw.length);
            return JSON.parse(raw);
        }
        catch (err) {
            console.error("[State][main] load error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("state:save", async (_event, state) => {
        try {
            const payload = JSON.stringify(state, null, 2);
            await (0, promises_1.writeFile)(stateFilePath, payload, "utf-8");
            console.log("[State][main] saved bytes:", Buffer.byteLength(payload), "to", stateFilePath);
        }
        catch (err) {
            console.error("[State][main] save error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("campaigns:load", async () => {
        console.log("[Campaigns][main] load", campaignsFilePath);
        try {
            const s = await (0, promises_1.stat)(campaignsFilePath);
            console.log("[Campaigns][main] exists, size:", s.size);
        }
        catch (err) {
            if (err?.code === "ENOENT") {
                console.log("[Campaigns][main] file not found");
                return null;
            }
            console.error("[Campaigns][main] stat error", err);
            throw err;
        }
        try {
            const raw = await (0, promises_1.readFile)(campaignsFilePath, "utf-8");
            console.log("[Campaigns][main] read bytes", raw.length);
            return JSON.parse(raw);
        }
        catch (err) {
            console.error("[Campaigns][main] load error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("campaigns:save", async (_event, payload) => {
        try {
            const json = JSON.stringify(payload, null, 2);
            await (0, promises_1.writeFile)(campaignsFilePath, json, "utf-8");
            console.log("[Campaigns][main] saved bytes", Buffer.byteLength(json), "to", campaignsFilePath);
        }
        catch (err) {
            console.error("[Campaigns][main] save error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("pcs:load", async () => {
        console.log("[PC][main] load", playerCharactersFilePath);
        try {
            const s = await (0, promises_1.stat)(playerCharactersFilePath);
            console.log("[PC][main] exists, size:", s.size);
        }
        catch (err) {
            if (err?.code === "ENOENT") {
                console.log("[PC][main] file not found");
                return [];
            }
            console.error("[PC][main] stat error", err);
            throw err;
        }
        try {
            const raw = await (0, promises_1.readFile)(playerCharactersFilePath, "utf-8");
            console.log("[PC][main] read bytes", raw.length);
            return JSON.parse(raw);
        }
        catch (err) {
            console.error("[PC][main] load error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("pcs:save", async (_event, payload) => {
        try {
            const json = JSON.stringify(payload, null, 2);
            await (0, promises_1.writeFile)(playerCharactersFilePath, json, "utf-8");
            console.log("[PC][main] saved bytes", Buffer.byteLength(json), "to", playerCharactersFilePath);
        }
        catch (err) {
            console.error("[PC][main] save error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("npcs:load", async () => {
        console.log("[NPC][main] load", npcFilePath);
        try {
            const s = await (0, promises_1.stat)(npcFilePath);
            console.log("[NPC][main] exists, size:", s.size);
        }
        catch (err) {
            if (err?.code === "ENOENT") {
                console.log("[NPC][main] file not found");
                return [];
            }
            console.error("[NPC][main] stat error", err);
            throw err;
        }
        try {
            const raw = await (0, promises_1.readFile)(npcFilePath, "utf-8");
            console.log("[NPC][main] read bytes", raw.length);
            return JSON.parse(raw);
        }
        catch (err) {
            console.error("[NPC][main] load error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("npcs:save", async (_event, payload) => {
        try {
            const json = JSON.stringify(payload, null, 2);
            await (0, promises_1.writeFile)(npcFilePath, json, "utf-8");
            console.log("[NPC][main] saved bytes", Buffer.byteLength(json), "to", npcFilePath);
        }
        catch (err) {
            console.error("[NPC][main] save error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("monsters:load", async () => {
        console.log("[Monster][main] load", monsterFilePath);
        try {
            const s = await (0, promises_1.stat)(monsterFilePath);
            console.log("[Monster][main] exists, size:", s.size);
        }
        catch (err) {
            if (err?.code === "ENOENT") {
                console.log("[Monster][main] file not found");
                return [];
            }
            console.error("[Monster][main] stat error", err);
            throw err;
        }
        try {
            const raw = await (0, promises_1.readFile)(monsterFilePath, "utf-8");
            console.log("[Monster][main] read bytes", raw.length);
            return JSON.parse(raw);
        }
        catch (err) {
            console.error("[Monster][main] load error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("monsters:save", async (_event, payload) => {
        try {
            const json = JSON.stringify(payload, null, 2);
            await (0, promises_1.writeFile)(monsterFilePath, json, "utf-8");
            console.log("[Monster][main] saved bytes", Buffer.byteLength(json), "to", monsterFilePath);
        }
        catch (err) {
            console.error("[Monster][main] save error", err);
            throw err;
        }
    });
    electron_1.ipcMain.handle("state:reset", async () => {
        await (0, promises_1.rm)(stateFilePath, { force: true });
        console.log("[State][main] reset (file removed if existed)");
        return null;
    });
    electron_1.ipcMain.handle("state:info", async () => {
        try {
            const s = await (0, promises_1.stat)(stateFilePath);
            return {
                userData: userDataPath,
                settingsPath,
                dataPath,
                stateFilePath,
                exists: true,
                size: s.size
            };
        }
        catch (err) {
            if (err?.code === "ENOENT") {
                return {
                    userData: userDataPath,
                    settingsPath,
                    dataPath,
                    stateFilePath,
                    exists: false,
                    size: 0
                };
            }
            throw err;
        }
    });
    electron_1.ipcMain.handle("state:selectDataPath", async () => {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ["openDirectory", "createDirectory"]
        });
        if (result.canceled || result.filePaths.length === 0) {
            return { changed: false, dataPath, stateFilePath, settingsPath };
        }
        const chosen = result.filePaths[0];
        const previousDataPath = dataPath;
        const previousStateFile = stateFilePath;
        const previousCampaignsFile = campaignsFilePath;
        const previousPCFile = playerCharactersFilePath;
        const previousNPCFile = npcFilePath;
        const previousMonsterFile = monsterFilePath;
        dataPath = chosen;
        await (0, promises_1.mkdir)(dataPath, { recursive: true });
        stateFilePath = (0, path_1.join)(dataPath, "app-state.json");
        campaignsFilePath = (0, path_1.join)(dataPath, "campaigns.json");
        playerCharactersFilePath = (0, path_1.join)(dataPath, "player-characters.json");
        npcFilePath = (0, path_1.join)(dataPath, "npcs.json");
        monsterFilePath = (0, path_1.join)(dataPath, "monsters.json");
        await (0, promises_1.writeFile)(settingsPath, JSON.stringify({ dataPath }, null, 2), "utf-8");
        try {
            const prevStat = await (0, promises_1.stat)(previousStateFile);
            const targetExists = await (0, promises_1.stat)(stateFilePath).then(() => true, () => false);
            if (!targetExists) {
                await (0, promises_1.copyFile)(previousStateFile, stateFilePath);
                await (0, promises_1.rm)(previousStateFile, { force: true });
                console.log("[State][main] migrated state on select", {
                    from: previousStateFile,
                    to: stateFilePath,
                    size: prevStat.size
                });
            }
        }
        catch (err) {
            if (err?.code !== "ENOENT") {
                console.error("[State][main] migration during select error", err);
            }
        }
        try {
            const prevCampStat = await (0, promises_1.stat)(previousCampaignsFile);
            const targetExists = await (0, promises_1.stat)(campaignsFilePath).then(() => true, () => false);
            if (!targetExists) {
                await (0, promises_1.copyFile)(previousCampaignsFile, campaignsFilePath);
                await (0, promises_1.rm)(previousCampaignsFile, { force: true });
                console.log("[State][main] migrated campaigns on select", {
                    from: previousCampaignsFile,
                    to: campaignsFilePath,
                    size: prevCampStat.size
                });
            }
        }
        catch (err) {
            if (err?.code !== "ENOENT") {
                console.error("[State][main] campaigns migration during select error", err);
            }
        }
        try {
            const prevPCStat = await (0, promises_1.stat)(previousPCFile);
            const targetExists = await (0, promises_1.stat)(playerCharactersFilePath).then(() => true, () => false);
            if (!targetExists) {
                await (0, promises_1.copyFile)(previousPCFile, playerCharactersFilePath);
                await (0, promises_1.rm)(previousPCFile, { force: true });
                console.log("[PC][main] migrated pcs on select", {
                    from: previousPCFile,
                    to: playerCharactersFilePath,
                    size: prevPCStat.size
                });
            }
        }
        catch (err) {
            if (err?.code !== "ENOENT") {
                console.error("[PC][main] pcs migration during select error", err);
            }
        }
        try {
            const prevNPCStat = await (0, promises_1.stat)(previousNPCFile);
            const targetExists = await (0, promises_1.stat)(npcFilePath).then(() => true, () => false);
            if (!targetExists) {
                await (0, promises_1.copyFile)(previousNPCFile, npcFilePath);
                await (0, promises_1.rm)(previousNPCFile, { force: true });
                console.log("[NPC][main] migrated npcs on select", {
                    from: previousNPCFile,
                    to: npcFilePath,
                    size: prevNPCStat.size
                });
            }
        }
        catch (err) {
            if (err?.code !== "ENOENT") {
                console.error("[NPC][main] npcs migration during select error", err);
            }
        }
        try {
            const prevMonsterStat = await (0, promises_1.stat)(previousMonsterFile);
            const targetExists = await (0, promises_1.stat)(monsterFilePath).then(() => true, () => false);
            if (!targetExists) {
                await (0, promises_1.copyFile)(previousMonsterFile, monsterFilePath);
                await (0, promises_1.rm)(previousMonsterFile, { force: true });
                console.log("[Monster][main] migrated monsters on select", {
                    from: previousMonsterFile,
                    to: monsterFilePath,
                    size: prevMonsterStat.size
                });
            }
        }
        catch (err) {
            if (err?.code !== "ENOENT") {
                console.error("[Monster][main] monsters migration during select error", err);
            }
        }
        console.log("[State][main] dataPath changed", {
            dataPath,
            stateFilePath,
            campaignsFilePath,
            playerCharactersFilePath,
            npcFilePath,
            monsterFilePath,
            previousDataPath
        });
        return {
            changed: true,
            dataPath,
            stateFilePath,
            settingsPath,
            campaignsFilePath,
            playerCharactersFilePath,
            npcFilePath,
            monsterFilePath
        };
    });
    electron_1.ipcMain.handle("state:openDataPath", async () => {
        if (!dataPath)
            return { opened: false };
        const res = await electron_1.shell.openPath(dataPath);
        return { opened: res === "" };
    });
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("before-quit", () => {
    console.log("[State][main] before-quit fired");
});
