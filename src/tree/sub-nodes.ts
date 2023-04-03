import * as vscode from "vscode";
import * as path from "path";
import { BotNode } from "./bot-node";

export class LibTree extends vscode.TreeItem {
  public children: vscode.TreeItem[] = [];

  constructor(public parent: BotNode) {
    super("Libs");
    this.tooltip = "Libs";
    this.contextValue = "tree-lib";
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        "flask.svg"
      ),
      dark: path.join(__filename, "..", "..", "resources", "dark", "flask.svg"),
    };
  }
}

export class CommandTree extends vscode.TreeItem {
  public children: vscode.TreeItem[] = [];

  constructor(public parent: BotNode) {
    super("Commands");
    this.tooltip = "Commands";
    this.contextValue = "tree-command";
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        "flash.svg"
      ),
      dark: path.join(__filename, "..", "..", "resources", "dark", "flash.svg"),
    };
  }
}

export class ErrorTree extends vscode.TreeItem {
  public children: vscode.TreeItem[] = [];
  constructor(public parent: BotNode) {
    super("Errors");
    this.tooltip = "Errors";
    this.contextValue = "tree-error";
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.iconPath = {
      light: path.join(__filename, "..", "..", "resources", "light", "bug.svg"),
      dark: path.join(__filename, "..", "..", "resources", "dark", "bug.svg"),
    };
  }
}

export class FolderTreeItem extends vscode.TreeItem {
  // commands are children of folders
  public children: vscode.TreeItem[] = [];

  constructor(public folder: any, public parent: CommandTree) {
    super(folder.title);
    this.tooltip = folder.title;
    this.contextValue = "folder";
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.children = folder.children.map(
      (command: any) => new CommandTreeItem(command, this)
    );
  }
}

export class CommandTreeItem extends vscode.TreeItem {
  constructor(
    public bbCommand: any,
    public parent: CommandTree | FolderTreeItem
  ) {
    super(bbCommand.command);
    this.tooltip =
      "📃 " +
      (bbCommand.answer || "no") +
      "\n⌨️ " +
      (bbCommand.keyboard || "no") +
      "\n❓" +
      (bbCommand.need_reply || "no") +
      "\n⏱️ " +
      (bbCommand.auto_retry_time || "no");
    this.contextValue = "command";
  }
}

export class LibTreeItem extends vscode.TreeItem {
  constructor(public lib: any, public parent: LibTree) {
    super(lib.name);
    this.tooltip = lib.name;
    this.contextValue = "lib";
  }
}
