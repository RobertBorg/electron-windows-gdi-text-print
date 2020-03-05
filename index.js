const { app, BrowserWindow } = require('electron');
const { readFileSync } = require('fs');

app.commandLine.appendSwitch('enable-features', 'GdiTextPrinting');

async function print(html, silent, printer) {
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      plugins: true,
      webSecurity: false,
    },
    width: 500,
  });

  printWindow.loadURL('data:text/html,' + html);

  await new Promise(res => {
    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print(
        {
          margins: { marginType: 'none' },
          silent: silent,
          color: false,
          deviceName: printer,
        },
        () => {
          res();
          printWindow.close();
        },
      );
    });
  });
}

const html = readFileSync('index.html', 'utf8');
const myArgs = process.argv.slice(2);

app.on('window-all-closed', () => {});
app.on('ready', async () => {
  if (myArgs[0] === 'both') {
    await print(html, false, myArgs.length > 1 ? myArgs[1] : undefined);
    await print(html, true, myArgs.length > 1 ? myArgs[1] : undefined);
  } else {
    await print(html, myArgs[0] === 'silent', myArgs.length > 1 ? myArgs[1] : undefined);
  }
  app.quit();
});
