// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { apiGet, apiPut } from "./api";
import { getBBTreeView } from "./tree";
import {
  extractBotIDFromFileName,
  extractCommandIDFromFileName,
  initBBFolder,
  isBotFolder,
} from "./bbfolder";
import {
  createNewBot,
  updateStatus,
  createCommand,
  createFolder,
  deleteItem,
  installLib,
  uninstallLib,
  installBot,
  viewCommand,
} from "./actions";

var vsContext: vscode.ExtensionContext;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  vsContext = context;
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "bots-business" is now active!');

  let loginCmd = vscode.commands.registerCommand("BB:login", async () => {
    const apiKey = await vscode.window.showInputBox({
      placeHolder: "Enter your BB API key",
      password: true,
    });
    saveAndCheckApiKey(apiKey);
  });

  context.subscriptions.push(loginCmd);

  const panel = vscode.window.createWebviewPanel(
    "BBView",
    "Bots.Business",
    vscode.ViewColumn.One,
    {}
  );

  panel.webview.html = "<h1>Bots.Business VS Code extension</h1>";

  context.subscriptions.push(panel);

  initBBFolder();

  // save new content on file saving
  vscode.workspace.onDidSaveTextDocument((textDoc) => {
    console.log(textDoc);
    saveCommandCode(textDoc);
  });

  let tree = await buildBBTree();
  //Following are the command for command palatte
  context.subscriptions.push(
    vscode.commands.registerCommand("BB:refresh", async (item) => {
      if (!item) {
        tree = await buildBBTree();
      } else {
        tree?.refresh(item);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB:newBot", async () => {
      createNewBot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB:installBot", async () => {
      installBot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB:installLib", async (item: any) => {
      installLib(item);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB:newCommand", async (item: any) => {
      createCommand(item);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB:createFolder", async (item: any) => {
      createFolder(item);
    })
  );

  //Following are the command for context menu
  context.subscriptions.push(
    vscode.commands.registerCommand("BB.refresh", async (item) => {
      if (!item) {
        tree = await buildBBTree();
      } else {
        tree?.refresh(item);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.newBot", async () => {
      createNewBot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.installBot", async () => {
      installBot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.startBot", async (item: any) => {
      updateStatus(item, "start");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.stopBot", async (item: any) => {
      updateStatus(item, "stop");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.installLib", async (item: any) => {
      installLib(item);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.uninstallLib", async (item: any) => {
      uninstallLib(item);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.newCommand", async (item: any) => {
      createCommand(item);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.createFolder", async (item: any) => {
      createFolder(item);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.viewCommand", async (item: any) => {
      viewCommand(item);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("BB.deleteItem", async (item: any) => {
      deleteItem(item);
    })
  );
}

async function saveCommandCode(textDoc: vscode.TextDocument) {
  // c:\Users\user\AppData\Local\Temp\Bots.Business\bot_123\456\command.js
  if (!isBotFolder(textDoc.fileName)) {
    // vscode.window.showErrorMessage(`Not a BB folder. Not saving code to BB. Cur folder: ${textDoc.fileName}`);
    // vscode.window.showErrorMessage(`BB folder is: ${getBBFolder()}`);
    return;
  }

  // show message
  vscode.window.showInformationMessage(`Saving code to BB...`);

  const commandID = extractCommandIDFromFileName(textDoc.fileName);
  const botID = extractBotIDFromFileName(textDoc.fileName);

  if (!commandID || !botID) {
    vscode.window.showErrorMessage(
      `Failed to save code to BB. Cur folder: ${textDoc.fileName}`
    );
    return;
  }

  const code = textDoc.getText();

  const response = await apiPut(`bots/${botID}/commands/${commandID}/code`, {
    code,
  });
  if (response) {
    vscode.window.showInformationMessage(`Code saved to BB`);
  } else {
    vscode.window.showErrorMessage(`Failed to save code to BB`);
  }
}

async function saveAndCheckApiKey(apiKey: any) {
  vscode.workspace
    .getConfiguration()
    .update("bots-business.apiKey", apiKey, vscode.ConfigurationTarget.Global);

  const response = await apiGet("user/unsecure");
  if (response && response.email) {
    const email = response.email;
    vscode.window.showInformationMessage(
      `Success! Logged to BB account: ${email}`
    );
    vscode.workspace
      .getConfiguration()
      .update("BotsBusiness.email", email, vscode.ConfigurationTarget.Global);
    buildBBTree();
    return;
  }

  vscode.window.showErrorMessage(`Failed. Please check your BB Api key`);
}

export async function buildBBTree() {
  const bots = await apiGet("bots");
  if (!bots) {
    return;
  }
  let BBTree = getBBTreeView(bots);
  vsContext.subscriptions.push(BBTree.tree);
  return BBTree.botTreeDataProvider;
}

// This method is called when your extension is deactivated
export function deactivate() {}
