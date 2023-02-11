import * as vscode from 'vscode';
import { apiGet } from './api';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { saveCommandToFile } from './bbfolder';

export function getBBTreeView(bots: any[]) {
	const botTreeDataProvider = new BotTreeDataProvider(bots);
	const tree = vscode.window.createTreeView('botTreeView', { treeDataProvider: botTreeDataProvider });
	vscode.window.showInformationMessage('Bots loaded: ' + bots.length);

  // on click event
	tree.onDidChangeSelection(e => {
		if(e.selection[0] instanceof CommandTreeItem ){
			openCode(e.selection[0].bbCommand);
		}
	});
	tree.onDidCollapseElement(e => {
		console.log(e);
	});
	tree.onDidChangeVisibility(e => {
		console.log(e);
	});
	tree.onDidExpandElement(e => {
		console.log(e);
	});

  return tree;
}

async function __loadCode(command: any){
	const edit = new vscode.WorkspaceEdit();
	let uri = vscode.Uri.parse(`untitled:${command.command}`);
	edit.insert(uri, new vscode.Position(0, 0), command.code);
	let success = await vscode.workspace.applyEdit(edit);
	vscode.window.showTextDocument(uri);
}

async function openCode(command: any){
	// reload command
	command = (await apiGet(`bots/${command.bot_id}/commands/${command.id}`));
	// const commands = (await apiGet(`bots/${bot.id}/commands`)) || [];
	if(!command){
		vscode.window.showErrorMessage(`Error loading command: ${command.id}`);
		return;
	}

	let cmdFile = saveCommandToFile(command);

	let uri = vscode.Uri.file(cmdFile);
	let document = await vscode.workspace.openTextDocument(uri, );
	let success = await vscode.window.showTextDocument(document, {preview: true});
	if (!success) {
		vscode.window.showErrorMessage(`Error opening file: ${cmdFile}`);
		return;
	}
}


class BotTreeDataProvider implements vscode.TreeDataProvider<BotNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<BotNode | undefined> = new vscode.EventEmitter<BotNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<BotNode | undefined> = this._onDidChangeTreeData.event;

	constructor(private bots: any[]) {}

	getTreeItem(element: BotNode): vscode.TreeItem {
		return element;
	}

  async getItemsForBotElement(element: BotNode){
    const bot = element.bot;
    
    let folders = (await apiGet(`bots/${bot.id}/commands_folders`)) || [];
		const commands = (await apiGet(`bots/${bot.id}/commands`)) || [];

    folders.forEach((folder: any) => {
      folder.children = commands.filter((command: any) => command.commands_folder_id === folder.id);
    });

		// add folders as children to the selected bot node
		element.children = folders.map((folder:any) => new FolderTreeItem(folder, element));

		commands.forEach((command: any) => {
			if(command.commands_folder_id === null){
				element.children.push(new CommandTreeItem(command, element));
			}
		});

		return element.children.map((item) => item as BotNode);
  }

	async getChildren(element?: BotNode|undefined) {
    if (element === undefined) {
			return this.bots.map((bot) => new BotNode(bot));
    }

		if(element instanceof FolderTreeItem){
			return element.children.map((item) => item as BotNode);
		}

    if(element instanceof BotNode){
      return this.getItemsForBotElement(element);
    }
  }

	getParent(element: BotNode): BotNode | null {
    if (element instanceof FolderTreeItem) {
      return element.parent;
    }

    return null;
  }
}

class BotNode extends vscode.TreeItem {
  // folders are children of bots
  // TODO: libs, chats, props will be children of bots later
	public children: vscode.TreeItem[] = [];

	constructor(public bot: any) {
		super(bot.name, vscode.TreeItemCollapsibleState.Collapsed);
		this.tooltip = `Bot id: ${bot.id}`;
		this.contextValue = 'bot';
		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
	}
}

class FolderTreeItem extends vscode.TreeItem {
  // commands are children of folders
  public children: vscode.TreeItem[] = [];

	constructor(private folder: any, public parent: BotNode) {
		super(folder.title);
		this.tooltip = folder.title;
		this.contextValue = 'folder';
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.children = folder.children.map((command: any) => new CommandTreeItem(command, this));
	}
}

class CommandTreeItem extends vscode.TreeItem {
  constructor(public bbCommand: any, public parent: vscode.TreeItem ) {
    super(bbCommand.command);
    this.tooltip = 
			"📃 " + ( bbCommand.answer || "no") + 
			"\n⌨️ " + ( bbCommand.keyboard || "no") +
			"\n❓" + ( bbCommand.need_reply || "no") +
			"\n⏱️ " + ( bbCommand.auto_retry_time || "no");
    this.contextValue = 'command';
  }
}