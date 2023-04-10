import * as vscode from "vscode";
import { openCode } from "../actions";
import { getBotNode, MenuItemTypes } from "./bot-node";
import { BotTreeDataProvider } from "./bot-tree-data-provider";
import { CommandTree, CommandTreeItem, FolderTreeItem, LibTree, LibTreeItem } from "./sub-nodes";

export function getBBTreeView(bots: any[]) {
  const botTreeDataProvider = new BotTreeDataProvider(bots);
  const tree = vscode.window.createTreeView("botTreeView", {
    treeDataProvider: botTreeDataProvider,
    dragAndDropController: botTreeDataProvider,
  });
  vscode.window.showInformationMessage("Bots loaded: " + bots.length);

  // on click event
  tree.onDidChangeSelection((e) => {
    if (e.selection[0] instanceof CommandTreeItem) {
      openCode(e.selection[0].bbCommand);
    }
  });
  tree.onDidCollapseElement((e) => {
    console.log(e);
  });
  tree.onDidChangeVisibility((e) => {
    console.log(e);
  });
  tree.onDidExpandElement((e) => {
    console.log(e);
  });

  return { tree, botTreeDataProvider };
}

function getRefreshedElement(
  node: "tree" | "botTree" | "commandTree" | "libTree",
  element?: MenuItemTypes
){
  if ((element)&&(node === "botTree")) {
    return getBotNode(element);
  }

  const libsOrCommands = (element instanceof LibTree) || (element instanceof CommandTree);
  if (libsOrCommands) {
    return element;
  }

  const libOrFolder = (element instanceof LibTreeItem) || (element instanceof FolderTreeItem);
  if (libOrFolder) {
    return element.parent;
  }

  if (element instanceof CommandTreeItem) {
    if (element.parent instanceof FolderTreeItem) {
      return element.parent.parent;
    }
    if (element.parent instanceof CommandTree) {
      return element.parent;
    }
  }
}

export async function refreshTree(
  node: "tree" | "botTree" | "commandTree" | "libTree",
  element?: MenuItemTypes
) {
  let refreshedEl = getRefreshedElement(node, element);
  vscode.commands.executeCommand("BB:refresh", refreshedEl);
}
