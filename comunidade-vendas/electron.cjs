const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backendProcess;

function createWindow() {

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            devTools: true
        }
    });

    win.webContents.openDevTools();

    const filePath = path.join(__dirname, "dist", "index.html");

    console.log(filePath);

    win.loadFile(filePath);

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('ERRO LOAD:', errorCode, errorDescription);
    });
}

app.whenReady().then(() => {

   const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "dist", "main.exe")
    : path.join(__dirname, "backend", "dist", "main.exe");

    console.log("Backend:", backendPath);

    backendProcess = spawn(backendPath, [], {
        shell: true
    });

    backendProcess.stdout.on("data", (data) => {
        console.log(`BACKEND: ${data}`);
    });

    backendProcess.stderr.on("data", (data) => {
        console.log(`ERRO BACKEND: ${data}`);
    });

    createWindow();
});