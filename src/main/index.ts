import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'node:fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PIN_WINDOW, SAVE_CONFIG, GET_CONFIG, OPEN_EXTERNAL } from '../constants'
import { defaultConfig } from '../config'
import { IAppConfig } from '../types'

let mainWindow: BrowserWindow
let appConfig: IAppConfig

const configPath = app.getPath('userData')
const configFile = join(configPath, 'appConfig.json')

function tryInitConfig(): void {
  if (!fs.existsSync(configPath)) {
    console.log('no local config PATH exist, creating...', configPath)
    fs.mkdirSync(configPath)
  }

  if (!fs.existsSync(configFile)) {
    console.log('no local config FILE exist, creating...', configFile)
    fs.writeFileSync(configFile, JSON.stringify({ ...defaultConfig }, null, 2))
  }
}

function handleConfig(): void {
  console.log('handling configurations...')
  tryInitConfig()

  console.log('get configurations from local: ', configFile)
  const jsonStr = fs.readFileSync(configFile).toString('utf8')
  const configJson = JSON.parse(jsonStr)
  if (configJson) {
    appConfig = configJson
    console.log('got local config', appConfig)
  }
}

const saveConfig = (configData: IAppConfig): void => {
  console.log('configurations saving:', configData)
  fs.writeFileSync(configFile, JSON.stringify({ ...defaultConfig, ...configData }, null, 2))
  console.log('configurations save success')
}

handleConfig()

const pinWindow = (pin: boolean): void => {
  console.log('main got pin state: ', pin)
  mainWindow.setAlwaysOnTop(pin, 'floating')
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 670,
    show: false,
    // alwaysOnTop: true,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // mainWindow.webContents.setWindowOpenHandler((details) => {
  //   shell.openExternal(details.url)
  //   return { action: 'deny' }
  // })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.openDevTools({ mode: 'right' })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // get config
  // macOS  /Users/{USERNAME}/Library/'Application Support'/electron-app
  // Linux /home/{USERNAME}/.config/electron-app
  console.log(app.getPath('userData'))

  // IPC test
  ipcMain.handle(PIN_WINDOW, (_, pinState) => pinWindow(pinState))
  ipcMain.handle(SAVE_CONFIG, (_, config) => saveConfig(config))
  ipcMain.handle(GET_CONFIG, (): IAppConfig => appConfig)
  ipcMain.handle(OPEN_EXTERNAL, (_, url) => {
    console.log('main received url', url);
    shell.openExternal(url)
  })
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
