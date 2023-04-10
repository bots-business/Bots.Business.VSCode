import * as vscode from "vscode";
import { apiPut } from "../api";
import { showConfirmationDialog, showInformationAndRefressTreeOnSuccess } from "../dialogs";
import { CommandTreeItem, FolderTreeItem, CommandTree } from "./sub-nodes";

function isAllowed(target: any){
  if (!target) {
    return;
  }

  if (!(target instanceof FolderTreeItem || CommandTree)) {
    return;
  }

  return true;
}

function showAlertCantTransferBeetwenBots(){
  vscode.window.showErrorMessage(
    "Can't Transfer Command from one Bot to another Bot",
    { modal: true }
  );
}

function dropToCommandTree(target: any, bbCommand: any){
  if(!(target instanceof CommandTree)) { return; }
  if (target.parent.bot.id !== bbCommand.bot_id) {
    showAlertCantTransferBeetwenBots();
    return;
  }
  if (!bbCommand.commands_folder_id) {
    //it was not in any folder before
    //so it was trying to transfer to same place
    return;
  }
  return true;
}

function dropToFolderTree(target: any, bbCommand: any){
  if(!(target instanceof FolderTreeItem)) { return; }
  if (target.parent.parent.bot.id !== bbCommand.bot_id) {
    showAlertCantTransferBeetwenBots();
    return;
  }
  if (target.folder.id === bbCommand.commands_folder_id) {
    //it was trying to transfer to same folder
    return;
  }
  return true;
}

export async function dropHandler(target: any, bbCommand: any) {
  if (target instanceof CommandTreeItem) {
    target = target.parent;
  }

  if(!isAllowed(target)){ return; }
  let warningStatement;

  if(dropToCommandTree(target, bbCommand)){
    //now the remaining condition is command should come from any folder to no folder
    bbCommand.commands_folder_id = null;
    warningStatement = " to root Folder";
  }
  
  else if(dropToFolderTree(target, bbCommand)){
    //now remaining condition is commannd comes from no folder/any other to the target folder
    bbCommand.commands_folder_id = target.folder.id;
    warningStatement = " to ${target.folder.title} Folder";
  }

  else { return; }

  const confirmed = await showConfirmationDialog(
    `Do u want to move Command: ${bbCommand.command} ` + warningStatement
  );

  if (!confirmed) {
    return;
  }

  let updatedCmd = await apiPut(
    `bots/${bbCommand.bot_id}/commands/${bbCommand.id}`,
    bbCommand
  );

  showInformationAndRefressTreeOnSuccess(
    updatedCmd,
    `Command: ${bbCommand.command} Successfully Transfered`,
    `Error updating command: ${bbCommand?.command}`,
    "commandTree",
    target
  );
}
