import * as vscode from "vscode";
import { dropHandler } from "../actions";
import { apiGet } from "../api";
import { BotNode } from "./bot-node";
import { LibTree, CommandTree, ErrorTree, LibTreeItem, FolderTreeItem, CommandTreeItem } from "./sub-nodes";

export class BotTreeDataProvider
  implements
    vscode.TreeDataProvider<BotNode>,
    vscode.TreeDragAndDropController<BotNode>
{
  dropMimeTypes = ["application/vnd.code.tree.botTreeView"];
  dragMimeTypes = ["application/vnd.code.tree.botTreeView"];
  private _onDidChangeTreeData: vscode.EventEmitter<BotNode | undefined> =
    new vscode.EventEmitter<BotNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<BotNode | undefined> =
    this._onDidChangeTreeData.event;

  constructor(private bots: any[]) {}

  getTreeItem(element: BotNode): vscode.TreeItem {
    return element;
  }

  async getItemsForBotElement(element: BotNode) {
    element.children = [
      new LibTree(element),
      new CommandTree(element),
      new ErrorTree(element),
    ];
    return element.children.map((item) => item as BotNode);
  }

  async getItemsForLibElement(element: CommandTree) {
    const bot = element.parent.bot;
    let info = (await apiGet(`bots/${bot.id}`)) || [];
    let libs = info.libs || [];
    element.children = libs.map((lib: any) => new LibTreeItem(lib, element));
    return element.children.map((item) => item as BotNode);
  }

  async getItemsForCommandElement(element: CommandTree) {
    const bot = element.parent.bot;

    let folders = (await apiGet(`bots/${bot.id}/commands_folders`)) || [];
    const commands = (await apiGet(`bots/${bot.id}/commands`)) || [];

    folders.forEach((folder: any) => {
      folder.children = commands.filter(
        (command: any) => command.commands_folder_id === folder.id
      );
    });

    // add folders as children to the selected bot node
    element.children = folders.map(
      (folder: any) => new FolderTreeItem(folder, element)
    );

    commands.forEach((command: any) => {
      if (command.commands_folder_id === null) {
        element.children.push(new CommandTreeItem(command, element));
      }
    });

    return element.children.map((item) => item as BotNode);
  }

  refresh(element?: any): void {
    this._onDidChangeTreeData.fire(element);
  }

  public async handleDrop(
    target: any,
    sources: vscode.DataTransfer
  ): Promise<void> {
    const bbCommand = sources.get(
      "application/vnd.code.tree.botTreeView"
    )?.value;
    if (!bbCommand) {
      return;
    }
    dropHandler(target, bbCommand);
  }

  public async handleDrag(
    source: BotNode[],
    dataTransfer: vscode.DataTransfer
  ): Promise<void> {
    if (source[0] instanceof CommandTreeItem) {
      dataTransfer.set(
        "application/vnd.code.tree.botTreeView",
        new vscode.DataTransferItem(source[0].bbCommand)
      );
    }
  }

  async getChildren(element?: any) {
    if (element === undefined) {
      return this.bots.map((bot) => new BotNode(bot));
    }

    if (element instanceof FolderTreeItem) {
      return element.children.map((item) => item as BotNode);
    }

    if (element instanceof BotNode) {
      return this.getItemsForBotElement(element);
    }

    if (element instanceof LibTree) {
      return this.getItemsForLibElement(element);
    }

    if (element instanceof CommandTree) {
      return this.getItemsForCommandElement(element);
    }
  }

  getParent(element: BotNode): BotNode | null {
    if (element instanceof FolderTreeItem) {
      return element.parent.parent;
    }

    return null;
  }
}