import * as vscode from "vscode";
import * as path from "path";
import { LibTree, CommandTree, ErrorTree, FolderTreeItem, CommandTreeItem, LibTreeItem } from "./sub-nodes";

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
  getIconPath(bot: any) {
    return {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        this.getStatusIcon(bot)
      ),
      dark: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "dark",
        this.getStatusIcon(bot)
      ),
    };
  }

  constructor(public bot: any) {
    super(bot.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = `Bot id: ${bot.id} - ${bot.status || "no token"}`;
    this.contextValue = this.getContextValue(bot);
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.iconPath = this.getIconPath(bot);
  }
}

export function getBotNode(
  element:
    | BotNode
    | LibTree
    | CommandTree
    | ErrorTree
    | FolderTreeItem
    | CommandTreeItem
    | LibTreeItem
) {
  if (element instanceof BotNode) {
    return element;
  }
  if (element instanceof LibTree) {
    return element.parent;
  }
  if (element instanceof CommandTree) {
    return element.parent;
  }
  if (element instanceof ErrorTree) {
    return element.parent;
  }
  if (element instanceof LibTreeItem) {
    return element.parent.parent;
  }
  if (element instanceof FolderTreeItem) {
    return element.parent.parent;
  }
  if (element instanceof CommandTreeItem) {
    if (element.parent instanceof FolderTreeItem) {
      return element.parent.parent.parent;
    }
    if (element.parent instanceof CommandTree) {
      return element.parent.parent;
    }
  }
}

export type MenuItemTypes =
  | BotNode
  | LibTree
  | CommandTree
  | ErrorTree
  | FolderTreeItem
  | CommandTreeItem
  | LibTreeItem
  | undefined;

export function getBot( element: MenuItemTypes) {
  //this function return the bot information on based of any Node selected and if not,ask User for it
  if (!element) { return; }
  let botNodeElement: any = getBotNode(element);
  return botNodeElement.bot;
}