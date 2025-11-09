module.exports = {
  appId: 'com.demonseatkids.app',
  productName: 'DEMONSEATKIDS',
  directories: {
    output: 'release'
  },
  win: {
    target: ['nsis'],
    icon: 'assets/icon.ico'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'assets/icon.ico',
    uninstallerIcon: 'assets/icon.ico',
    installerHeaderIcon: 'assets/icon.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
};