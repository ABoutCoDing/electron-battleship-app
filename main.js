const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const template = [
  {
    label: '편집',
    submenu: [
      {
        label: '스크린샷',
        click () { capture() }
      }
    ]
  }
]

let win

function createWindow () {
  // 새로운 브라우저 창을 생성합니다.
  win = new BrowserWindow({width: 600, height: 600});

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'static/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (process.platform === 'darwin') {  // NeXTSTEP, BSD, Mach, OSX 이라면
    template.unshift({  // 새요소 추가
      label: app.getName(),
      submenu: [
        {
          role: 'about'
        },
        {
          label: 'ABCD(ABoutCoDing) Homepage',
          click () { require('electron').shell.openExternal('http://abcds.kr') }
        }
       ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  //  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null
  })

  ipcMain.on('captureSync', function(event){
    capture()
    event.returnValue = '스크린샷 저장'
  })
}

function capture() {
  win.capturePage(function(image) {
    console.log(getUserHome()+'/Documents/screenshot.png');
    fs.writeFileSync(getUserHome() + '/Documents/screenshot.png', image.toPng())
  });
}

function getUserHome() {
  return process.env.HOME || process.env.USERPROFILE
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
