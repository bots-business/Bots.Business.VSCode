import * as vscode from "vscode";
import * as path from "path";

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