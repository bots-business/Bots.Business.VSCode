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

export async function refreshTree(
  node: "tree" | "botTree" | "commandTree" | "libTree",
  element?: MenuItemTypes
) {
  let item;

  if ((element)&&(node === "botTree")) {
    item = getBotNode(element);
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
    }
  }

  if (node === "libTree") {
    if (element instanceof LibTree) {
      item = element;
    } else if (element instanceof LibTreeItem) {
      item = element.parent;
    }
  }

  if(!item){ return; }

  vscode.commands.executeCommand("BB:refresh", item);
}
