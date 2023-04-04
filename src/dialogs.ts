import * as vscode from "vscode";
import { apiGet } from "./api";
import { BotNode } from "./tree/bot-node";
import { CommandTree, FolderTreeItem, CommandTreeItem } from "./tree/sub-nodes";
import { refreshTree } from "./tree/tree";

export async function showConfirmationDialog(warning: string) {
  const result = await vscode.window.showWarningMessage(
    warning,
    { modal: true },
    "Yes",
    "No"
  );

  // return true if result YES
  return result === "Yes";
}

export async function pickBot(placeHolderText?: string) {
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

export function showInformationAndRefressTreeOnSuccess(
  success: boolean,
  message: string,
  errMessage: string,
  tree?: "tree" | "botTree" | "commandTree" | "libTree",
  element?: BotNode | CommandTree | FolderTreeItem | CommandTreeItem
) {
  if (!success) {
    vscode.window.showErrorMessage(errMessage);
    return;
  }
  vscode.window.showInformationMessage(message);
  if (!tree) {
    tree = "tree";
  }
  if (element) {
    refreshTree(tree, element);
    return;
  }
  refreshTree(tree);
}

export async function showQuickPickDialog(collections: Array<any>, attributes: any){
  let items = collections.map((collection: any) => {
    return {
      id: collection[attributes.id],
      label: collection[attributes.label],
      detail: collection[attributes.detail],
    };
  });
  let result: any = await vscode.window.showQuickPick(items, {
    canPickMany: false,
  });
  return result;
}