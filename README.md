# Bots.Business VS Code Extension

Use this extension for quickly bot development with [Bots.Business](https://bots.business)!

## Features

![BB Bots List in VS Code](https://raw.githubusercontent.com/bots-business/Bots.Business.VSCode/main/images/main.png)

> Tip: you can load code for any commands and edit it!

## Installation
1. Download VSIX [file](https://github.com/bots-business/Bots.Business.VSCode/raw/main/bots-business.vsix)
2. from VSCode's main menu, select “Extensions”
3. click to open the three-dot menu at the top of the middle panel (see screenshot)
4. select “Install from VSIX…” and follow the prompts.

![Install from VSIX](https://i.stack.imgur.com/nPF49.png)

## Requirements

### Install BB Api Key
You can copy BB Api Key in BB App > Profile

1. use Ctrl+Shift+P then BB:login to BB account

2. Or use Menu: File > Preferences > Settings.
See Extensions item and Bots.Business section.

Then you can fill BB Api Key in settings.json: "bots-business.apiKey" field.


## Commands

### Use Ctrl+Shift+P to use the commands

1. BB:login : Login to BB account
2. BB:refresh : Refresh BB tree
3. BB:newBot : Create New Bot
4. BB:installBot : Install New Bot from store
5. BB:installLib : Install Lib in Bot
6. BB:newCommand : Create New Command
7. BB.createFolder : Create New Folder


## Known Issues
- Bot errors not works (not developed yet)

## Release Notes
Please see: [CHANGELOG.md](https://github.com/bots-business/Bots.Business.VSCode/blob/main/CHANGELOG.md)


## Make your own Github PR!
See: https://github.com/bots-business/Bots.Business.VSCode

Just make clone:
`git@github.com:bots-business/Bots.Business.VSCode.git`

then press F5 for debugging

### Publishing

See:
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

use `vsce package` for extension packing

## For more information

* [Bots.Business - create your own bot](https://bots.business)
* [Bots.Business - Help](https://help.bots.business)

**Enjoy!**
