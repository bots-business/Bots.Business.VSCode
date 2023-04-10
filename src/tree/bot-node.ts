import * as vscode from "vscode";
import { LibTree, CommandTree, ErrorTree, FolderTreeItem, CommandTreeItem, LibTreeItem } from "./sub-nodes";
import { getIconsPath } from "./node-icon";

export type MenuItemTypes =
  | BotNode
  | LibTree
  | CommandTree
  | ErrorTree
  | FolderTreeItem
  | CommandTreeItem
  | LibTreeItem;

export class BotNode extends vscode.TreeItem {
  // folders are children of bots
  // TODO: libs, chats, props will be children of bots later
  public children: vscode.TreeItem[] = [];

  getStatusIcon(bot: any) {
    if (bot.status === "works") {
      return "flash.svg";
    }
    if (!bot.token) {
      return "power.svg";
    }
    return "wrench.svg";
  }

  getContextValue(bot: any) {
    if (bot.status === "works") {
      return "bot.works";
    }
    if (!bot.token) {
      return "bot.noToken";
    }
    return "bot.off";
  }

  constructor(public bot: any) {
    super(bot.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = `Bot id: ${bot.id} - ${bot.status || "⚠️ No token"}`;
    this.contextValue = this.getContextValue(bot);
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.iconPath = getIconsPath(this.getStatusIcon(bot));
  }
}

export function getBotNode(element: MenuItemTypes) {
  for (let i = 0; i < 4; i++) {
    if(element instanceof BotNode) {
      return element;
    }
    element = element.parent;
    // deep to element.parent.parent.parent
  }
}

export function getBot( element: MenuItemTypes) {
  let botNodeElement: any = getBotNode(element);
  return botNodeElement.bot;
}