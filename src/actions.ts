import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import * as vscode from "vscode";
import { saveCommandToFile } from "./bbfolder";
import { getCommandViewPage } from "./webPage";
import { BotNode, getBot, MenuItemTypes } from "./tree/bot-node";
import {
  LibTree,
  CommandTree,
  FolderTreeItem,
  CommandTreeItem,
  LibTreeItem,
} from "./tree/sub-nodes";
import { showConfirmationDialog, pickBot, showInformationAndRefressTreeOnSuccess, showQuickPickDialog } from "./dialogs";

async function getBotOrPickBot(
  element?: MenuItemTypes,
  placeHolderText?: string
) {
  if (element) {
    let bot = getBot(element);
    if (bot) {
      return bot;
    }
  }

  return await pickBot(placeHolderText);
}

export async function openCode(command: any) {
  // reload command
  command = await apiGet(`bots/${command.bot_id}/commands/${command.id}`);
  if (!command) {
    vscode.window.showErrorMessage(`Error loading command: ${command.id}`);
    return;
  }

  let cmdFile = saveCommandToFile(command);

  let uri = vscode.Uri.file(cmdFile);
  let document = await vscode.workspace.openTextDocument(uri);
  let success = await vscode.window.showTextDocument(document, {
    preview: true,
  });
  if (!success) {
    vscode.window.showErrorMessage(`Error opening file: ${cmdFile}`);
  }
}

export async function createNewBot() {
  const botName = await vscode.window.showInputBox({
    placeHolder: "Enter the Name for the Bot. Eg: BBAdminBot",
  });

  if (!botName) {
    return;
  }

  const botToken = await vscode.window.showInputBox({
    placeHolder:
      "Enter the Bot Token. Eg: 391686724:AAG6XGW0Z9NtfZwqEuWkkno_Eri932cX0Hg",
  });

  if (!botToken) {
    return;
  }

  let newBot = await apiPost(`bots/`, {
    name: botName,
    token: botToken,
  });

  showInformationAndRefressTreeOnSuccess(
    newBot.id,
    `Bot Successsfully Created: ${newBot.name}`,
    `Error while creating New Bot: ${botName}`
  );
}

export async function installBot() {
  let collections = (await apiGet(`store/collections/`)) || [];

  let result = await showQuickPickDialog(collections, {id: 'id', label: 'title', detail: 'description'});
  if(!result){ return; }

  let bots = (await apiGet(`store/collections/${result.id}/bots`)) || [];

  result = await showQuickPickDialog(bots, {id: 'id', label: 'name', detail: 'description'});
  if(!result){ return; }

  let installed = await apiPost(`bots/installed`, { id: result.id });

  showInformationAndRefressTreeOnSuccess(
    installed,
    `Bot Installed: ${result.label}`,
    `Error while installing the Bot:  ${result.label}`
  );
}

export async function updateStatus(element: BotNode, status: String) {
  let bot: any = await getBotOrPickBot(element);
  if (!element) {
    return;
  }
  let newStatus = await apiPost(`bots/${bot.id}/status`, {
    status: status === "start" ? "start_launch" : "start_stopping",
  });

  showInformationAndRefressTreeOnSuccess(
    newStatus.id,
    `Bot ${status === "start" ? "Started" : "Stopped"}: ${newStatus.name}`,
    `Error while ${status === "start" ? "starting" : "stopping"} Bot: ${
      element.bot.name
    }`
  );
}

export async function stopBot(element: BotNode) {
  await updateStatus(element, "stop");
}

export async function startBot(element: BotNode) {
  await updateStatus(element, "start");
}

export async function installLib(element: LibTree | undefined) {
  let bot: any = await getBotOrPickBot(
    element,
    "Select the Bot in which you want to install Libs"
  );
  let libs = (await apiGet(`store/libs/`)) || [];

  let result = await showQuickPickDialog(libs, {id: 'id', label: 'name', detail: 'description'});
  if(!result){ return; }

  let installed = await apiPost(`bots/${bot.id}/libs/`, {
    lib_id: String(result.id)
  });

  showInformationAndRefressTreeOnSuccess(
    installed,
    `Lib Installed: ${result.label}`,
    `Error while installing the Lib: ${result.label}`,
    "libTree"
  );
}

export async function uninstallLib(element: LibTreeItem) {
  let bot: any = await getBotOrPickBot(element);

  const confirmed = await showConfirmationDialog(`Are you sure you want to uninstall Lib ${element.label}?`);

  if (!confirmed){
    return;
  }

  let deleted = await apiDelete(`bots/${bot.id}/libs/${element.lib.id}`);

  showInformationAndRefressTreeOnSuccess(
    deleted,
    `Lib Uninstalled: ${element.lib.name}`,
    `Error while uninstalling Lib: ${element.lib.name}`,
    "libTree"
  );
}

export async function createCommand(
  element: CommandTree | FolderTreeItem | undefined
) {
  let bot: any = await getBotOrPickBot(
    element,
    "Select the Bot in which you want to create Command"
  );
  const cmdName = await vscode.window.showInputBox({
    placeHolder: "Enter the Name for the Command. Eg: /start",
  });

  let command: any = { command: cmdName };

  if (element instanceof FolderTreeItem) {
    command.commands_folder_id = element.folder.id;
  }

  if (!command.command || !bot) {
    return;
  }

  let newCmd = await apiPost(`bots/${bot.id}/commands`, command);

  showInformationAndRefressTreeOnSuccess(
    newCmd.id,
    `Command Successsfully Created: ${newCmd.command}`,
    `Error while creating new command: ${cmdName}`,
    "commandTree",
    element
  );
}

export async function createFolder(element: CommandTree | undefined) {
  let bot: any = await getBotOrPickBot(
    element,
    "Select the Bot in which you want to create Folder"
  );
  const folderName = await vscode.window.showInputBox({
    placeHolder: "Enter the Name for the Folders. Eg: Admin",
  });

  if (!folderName) {
    return;
  }

  let newFolder = await apiPost(`bots/${bot.id}/commands_folders`, {
    title: folderName,
  });

  showInformationAndRefressTreeOnSuccess(
    newFolder.id,
    `Folder Successsfully Created: ${newFolder.title}`,
    `Error while creating New Folder: ${folderName}`,
    "commandTree",
    element
  );
}

export async function viewCommand(element: CommandTreeItem) {
  let command = await apiGet(
    `bots/${element.bbCommand.bot_id}/commands/${element.bbCommand.id}`
  );
  const panel = vscode.window.createWebviewPanel(
    "command_" + command.id,
    "Command: " + command.command,
    vscode.ViewColumn.One,
    {}
  );

  panel.webview.html = getCommandViewPage(command);
}

export async function deleteItem(
  element: BotNode | FolderTreeItem | CommandTreeItem
) {
  let itemType, deleteUrl;
  let bot: any = await getBotOrPickBot(element);
  if (!element || !bot) {
    return;
  }

  if (element instanceof BotNode) {
    itemType = "Bot";
    deleteUrl = `bots/${bot.id}`;
  }
  if (element instanceof FolderTreeItem) {
    itemType = "Folder";
    deleteUrl = `bots/${bot.id}/commands_folders/${element.folder.id}`;
  }
  if (element instanceof CommandTreeItem) {
    itemType = "Command";
    deleteUrl = `bots/${bot.id}/commands/${element.bbCommand.id}`;
  }

  const confirmed = await showConfirmationDialog(`Do you want to delete ${itemType} "${element.label}?"`);

  if (!confirmed) {
    return;
  }

  const deleted = await apiDelete(String(deleteUrl));

  showInformationAndRefressTreeOnSuccess(
    deleted,
    `Deleted: ${itemType} "${element.label}"`,
    `Error while deleting ${itemType}: ${element.label}`,
    "commandTree",
    element
  );
}