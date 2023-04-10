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

export async function dropHandler(target: any, bbCommand: any) {
  let warningStatement;
  if (target instanceof CommandTreeItem) {
    target = target.parent;
  }

  if(!isAllowed(target)){ return; }


  if (target instanceof CommandTree) {
    if (target.parent.bot.id !== bbCommand.bot_id) {
      vscode.window.showErrorMessage(
        "Can't Transfer Command from one Bot to another Bot",
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

  const confirmed = await showConfirmationDialog(warningStatement);

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
