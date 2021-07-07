const electron = require('electron');
const {readFileSync, writeFile, appendFileSync} = require('fs');
const path = require('path');
const url = require('url');

const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let win;
var record;

function createWindow(){
  win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        // height: 600,
        // width:1100,
        minWidth:1100,
        minHeight:600
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../UI/ui.html'),
    protocol: 'file',
    slashes: true
  }));

// Developer tools
// TODO: Remove before packaging
  win.webContents.openDevTools();


  win.on('closed', ()=> {
    win = null;
    })
  }

  app.on('ready', createWindow);

  app.on('window-all-closed', ()=>{
    if(process.platform !== 'darwin')
    app.quit()
  });

ipcMain.on("creds", (event, arg) =>{
  record = arg;
})

ipcMain.on('pass', (event, arg) => {
  console.log(arg)  // prints "ping"
  event.returnValue = record;
})
