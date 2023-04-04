import * as vscode from "vscode";
import { openCode } from "../actions";
import { BotTreeDataProvider } from "./bot-tree-data-provider";
import { CommandTreeItem } from "./sub-nodes";

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




