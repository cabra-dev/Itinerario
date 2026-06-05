const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let backendProcess;

const logFile = path.join(app.getPath("userData"), "debug.log");
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: { devTools: true }
    });

    win.webContents.openDevTools();

    const filePath = path.join(__dirname, "dist", "index.html");
    log("INDEX PATH: " + filePath);
    win.loadFile(filePath);

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log('ERRO LOAD: ' + errorCode + ' ' + errorDescription);
    });
}

app.whenReady().then(() => {

    const backendPath = app.isPackaged
        ? path.join(process.resourcesPath, "backend", "dist", "main.exe")
        : path.join(__dirname, "backend", "dist", "main.exe");

    log("=== INICIO ===");
    log("Backend: " + backendPath);
    log("BACKEND EXISTE: " + fs.existsSync(backendPath));
    log("LOG FILE: " + logFile);

    backendProcess = spawn(backendPath, [], {
        shell: true,
        env: {
            ...process.env,
            DATABASE_URL: "postgresql://postgres:Geladeira123!@db.hwprxfaoyrqrdlbfshgl.supabase.co:5432/postgres",
            PRISMA_QUERY_ENGINE_BINARY: app.isPackaged
                ? path.join(process.resourcesPath, "prisma-engines", "query-engine-windows.exe")
                : path.join(__dirname, "prisma-engines", "query-engine-windows.exe")
        }
    });

    backendProcess.stdout.on("data", (data) => {
        log("BACKEND: " + data);
    });

    backendProcess.stderr.on("data", (data) => {
        log("ERRO BACKEND: " + data);
    });

    backendProcess.on("close", (code) => {
        log("BACKEND ENCERRADO com codigo: " + code);
    });

    createWindow();
});