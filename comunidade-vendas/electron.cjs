const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");

let backendProcess;
let mainWindow;

const logFile = path.join(app.getPath("userData"), "debug.log");
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
}

// ===== CONFIGURAÇÃO DO AUTO UPDATER =====
function configurarAtualizador() {
    // Não verifica atualizações em modo desenvolvimento
    if (!app.isPackaged) {
        log("Modo desenvolvimento — atualizações desabilitadas.");
        return;
    }

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    // Verifica atualização ao iniciar
    autoUpdater.checkForUpdates();

    // Atualização disponível — inicia download automático
    autoUpdater.on("update-available", (info) => {
        log("Atualizacao disponivel: " + info.version);
    });

    // Nenhuma atualização disponível
    autoUpdater.on("update-not-available", () => {
        log("App ja esta na versao mais recente.");
    });

    // Download concluído — pergunta se quer reiniciar
    autoUpdater.on("update-downloaded", (info) => {
        log("Atualizacao baixada: " + info.version);
        dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "Atualização disponível",
            message: `Nova versão ${info.version} disponível!`,
            detail: "A atualização foi baixada. Deseja reiniciar o app agora para aplicar?",
            buttons: ["Reiniciar agora", "Depois"],
            defaultId: 0
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });

    // Erro no updater
    autoUpdater.on("error", (err) => {
        log("Erro no auto updater: " + err.message);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: { devTools: true }
    });

    // DevTools apenas em desenvolvimento
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    const filePath = path.join(__dirname, "dist", "index.html");
    log("INDEX PATH: " + filePath);
    mainWindow.loadFile(filePath);

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log('ERRO LOAD: ' + errorCode + ' ' + errorDescription);
    });

    // Verifica atualizações após janela abrir
    mainWindow.webContents.on('did-finish-load', () => {
        configurarAtualizador();
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
            DATABASE_URL: "postgresql://postgres.hwprxfaoyrqrdlbfshgl:Geladeira123!@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
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

// ===== FECHA O BACKEND AO FECHAR O APP =====
app.on("before-quit", () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});