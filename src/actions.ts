import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import * as vscode from "vscode";
import { saveCommandToFile } from "./bbfolder";
import { getCommandViewPage } from "./webPage";
import { BotNode, getBot, getBotNode, MenuItemTypes } from "./tree/bot-node";
import { LibTree, CommandTree, FolderTreeItem, CommandTreeItem, LibTreeItem } from "./tree/sub-nodes";


async function pickBot(placeHolderText?: string){
  //If not got then ask for the Bot
  let bots = (await apiGet(`bots`)) || [];
  let items = bots.map((bot: any) => {
    return {
      bot: bot,
      label: bot.name,
    };
  });
  let result: any = await vscode.window.showQuickPick(items, {
    title: "Select The Bot",
    placeHolder: placeHolderText || "",
    canPickMany: false,
  });
  return result.bot;
}

async function getBotOrPickBot(element?: MenuItemTypes, placeHolderText?: string){
  if(element){
    let bot = getBot(element);
    if(bot){ return bot; }
  }
 
  return await pickBot(placeHolderText);
}

async function refresh(
  node: "tree" | "botTree" | "commandTree" | "libTree",
  element?: MenuItemTypes
) {
  let item;

  if (node === "botTree") {
    if (element) {
      item = getBotNode(element);
    } else {
      item = undefined;
    }
  }

  if (node === "commandTree") {
    if (element instanceof CommandTree) {
      item = element;
    } else if (element instanceof FolderTreeItem) {
      item = element.parent;
    } else if (element instanceof CommandTreeItem) {
      if (element.parent instanceof FolderTreeItem) {
        item = element.parent.parent;
      }
      if (element.parent instanceof CommandTree) {
        item = element.parent;
      }
    } else {
      item = undefined;
    }
  }

  if (node === "libTree") {
    if (element instanceof LibTree) {
      item = element;
    } else if (element instanceof LibTreeItem) {
      item = element.parent;
    } else {
      item = undefined;
    }
  }

  vscode.commands.executeCommand("BB:refresh", item);
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
    return;
  }
}

export async function dropHandler(target: any, bbCommand: any) {
  if (!target) {
    return;
  }
  let warningStatement;
  if (target instanceof CommandTreeItem) {
    target = target.parent;
  }

  if (!(target instanceof FolderTreeItem || CommandTree)) {
    return;
  }
  if (target instanceof CommandTree) {
    if (target.parent.bot.id !== bbCommand.bot_id) {
      vscode.window.showErrorMessage(
        "Cant Transfer Command from One Bot to Another Bot",
        { modal: true }
      );
      return;
    }

    //its same bot now

    if (!bbCommand.commands_folder_id) {
      //it was not in any folder before
      //so it was trying to transfer to same place
      return;
    }

    //now the remaining condition is command should come from any folder to no folder
    bbCommand.commands_folder_id = null;
    warningStatement = `Do u want to move Command: ${bbCommand.command} to root Folder`;
  }

  if (target instanceof FolderTreeItem) {
    if (target.parent.parent.bot.id !== bbCommand.bot_id) {
      vscode.window.showErrorMessage(
        "Cant Transfer Command from One Bot to Another Bot",
        { modal: true }
      );
      return;
    }

    //its same bot now

    if (target.folder.id === bbCommand.commands_folder_id) {
      //it was trying to transfer to same folder
      return;
    }

    //now remaining condition is commannd comes from no folder/any other to the target folder
    bbCommand.commands_folder_id = target.folder.id;
    warningStatement = `Do u want to move Command: ${bbCommand.command} to ${target.folder.title} Folder`;
  }
  if (!warningStatement) {
    return;
  }

  const result = await vscode.window.showWarningMessage(
    warningStatement,
    { modal: true },
    "Yes",
    "No"
  );
  if (result !== "Yes") {
    return;
  }

  let updatedCmd = await apiPut(
    `bots/${bbCommand.bot_id}/commands/${bbCommand.id}`,
    bbCommand
  );
  if (!updatedCmd) {
    vscode.window.showErrorMessage(
      `Error updating command: ${bbCommand?.command}`
    );
    return;
  }
  vscode.window.showInformationMessage("Command Successfully Transfered");

  refresh("commandTree", target);
}

export async function createNewBot() {
  const botName = await vscode.window.showInputBox({
    placeHolder: "Enter the Name for the Bot. Eg: BBAdminBot",
  });
  const botToken = await vscode.window.showInputBox({
    placeHolder:
      "Enter the Bot Token. Eg: 391686724:AAG6XGW0Z9NtfZwqEuWkkno_Eri932cX0Hg",
  });

  if (!botName || !botToken) {
    return;
  }

  let newBot = await apiPost(`bots/`, {
    name: botName,
    token: botToken,
  });

  if (newBot.id) {
    vscode.window.showInformationMessage(
      `Bot Successsfully Created: ${newBot.name}`
    );
    refresh("tree");
  } else {
    vscode.window.showErrorMessage(`Error while creating New Bot: ${botName}`);
  }
}

export async function installBot() {
  let collections = (await apiGet(`store/collections/`)) || [];
  let items = collections.map((collection: any) => {
    return {
      id: collection.id,
      label: collection.title,
      detail: collection.description,
    };
  });
  let result: any = await vscode.window.showQuickPick(items, {
    canPickMany: false,
  });
  if (!result) {
    return;
  }

  let bots = (await apiGet(`store/collections/${result.id}/bots`)) || [];
  items = bots.map((bot: any) => {
    return {
      id: bot.id,
      label: bot.name,
      detail: bot.description,
    };
  });
  result = await vscode.window.showQuickPick(items, { canPickMany: false });

  let installed = await apiPost(`bots/installed`, { id: result.id });

  if (installed) {
    vscode.window.showInformationMessage(`Bot Installed: ${result.label}`);
    refresh("tree");
  } else {
    vscode.window.showErrorMessage(
      `Error while installing the Bot:  ${result.label}`
    );
  }
}

export async function updateStatus(element: BotNode, status: String) {
  let bot: any = await getBotOrPickBot(element);
  if (!element) {
    return;
  }
  let newStatus = await apiPost(`bots/${bot.id}/status`, {
    status: status === "start" ? "start_launch" : "start_stopping",
  });

  if (newStatus.id) {
    vscode.window.showInformationMessage(
      `Bot ${status === "start" ? "Started" : "Stopped"}: ${newStatus.name}`
    );
    refresh("tree");
  } else {
    vscode.window.showErrorMessage(
      `Error while ${status === "start" ? "starting" : "stopping"} Bot: ${
        element.bot.name
      }`
    );
  }
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
  let items = libs.map((lib: any) => {
    return {
      id: lib.id,
      label: lib.name,
      detail: lib.description,
    };
  });
  const result: any = await vscode.window.showQuickPick(items, {
    canPickMany: false,
  });
  if (!result) {
    return;
  }

  let installed = await apiPost(`bots/${bot.id}/libs/`, {
    lib_id: String(result.id),
  });

  if (installed) {
    vscode.window.showInformationMessage(`Lib Installed: ${result.label}`);
    refresh("libTree", element);
  } else {
    vscode.window.showErrorMessage(
      `Error while installing the Lib: ${result.label}`
    );
  }
}

export async function uninstallLib(element: LibTreeItem) {
  let bot: any = await getBotOrPickBot(element);
  const result = await vscode.window.showWarningMessage(
    `Are you sure you want to uninstall Lib ${element.label}?`,
    { modal: true },
    "Yes",
    "No"
  );
  if (result !== "Yes") {
    return;
  }

  let deleted = await apiDelete(`bots/${bot.id}/libs/${element.lib.id}`);
  if (deleted) {
    vscode.window.showInformationMessage(
      `Lib Uninstalled: ${element.lib.name}`
    );
    refresh("libTree", element);
  } else {
    vscode.window.showErrorMessage(
      `Error while uninstalling Lib: ${element.lib.name}`
    );
  }
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

  if (newCmd.id) {
    vscode.window.showInformationMessage(
      `Command Successsfully Created: ${newCmd.command}`
    );
    refresh("commandTree", element);
  } else {
    vscode.window.showErrorMessage(
      `Error while creating new command: ${cmdName}`
    );
  }
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

  if (newFolder.id) {
    vscode.window.showInformationMessage(
      `Folder Successsfully Created: ${newFolder.title}`
    );
    refresh("commandTree", element);
  } else {
    vscode.window.showErrorMessage(
      `Error while creating New Folder: ${folderName}`
    );
  }
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

  const result = await vscode.window.showWarningMessage(
    `Are you sure you want to delete ${itemType} ${element.label}?`,
    { modal: true },
    "Yes",
    "No"
  );
  if (result !== "Yes") {
    return;
  }

  const deleted = await apiDelete(String(deleteUrl));
  if (deleted) {
    vscode.window.showInformationMessage(
      `Deleted: ${itemType} ${element.label}`
    );
    if (element instanceof BotNode) {
      return refresh("tree");
    }
    refresh("commandTree", element);
  } else {
    vscode.window.showErrorMessage(
      `Error while deleting ${itemType}: ${element.label}`
    );
  }
}
