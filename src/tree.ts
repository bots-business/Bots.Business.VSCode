import * as vscode from 'vscode';
import { apiGet, apiPost,apiDelete } from './api';
import * as path from 'path';
import { openCode, dropHandler } from './actions';

export function getBBTreeView(bots: any[]) {
	const botTreeDataProvider = new BotTreeDataProvider(bots);
	const tree = vscode.window.createTreeView('botTreeView', { treeDataProvider: botTreeDataProvider , dragAndDropController: botTreeDataProvider });
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

  return {tree, botTreeDataProvider};
}

export class BotTreeDataProvider implements vscode.TreeDataProvider<BotNode> , vscode.TreeDragAndDropController<BotNode>{
	dropMimeTypes = ['application/vnd.code.tree.botTreeView'];
	dragMimeTypes = ['application/vnd.code.tree.botTreeView'];
	private _onDidChangeTreeData: vscode.EventEmitter<BotNode | undefined> = new vscode.EventEmitter<BotNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<BotNode | undefined> = this._onDidChangeTreeData.event;

	constructor(private bots: any[]) {}

	getTreeItem(element: BotNode): vscode.TreeItem {
		return element;
	}

	async getItemsForBotElement(element: BotNode){
		element.children = [new LibTree(element),new CommandTree(element),new ErrorTree(element)];
		return element.children.map((item) => item as BotNode);
	}

	async getItemsForLibElement(element:CommandTree){
		const bot = element.parent.bot;
		let info = (await apiGet(`bots/${bot.id}`)) || [];
		let libs = info.libs || [];
		element.children = libs.map((lib:any) => new LibTreeItem(lib, element));
		return element.children.map((item) => item as BotNode);
	}

  	async getItemsForCommandElement(element: CommandTree){
    const bot = element.parent.bot;
    
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

  	refresh(element?: any): void {
		this._onDidChangeTreeData.fire(element);
  	}

	public async handleDrop(target:any, sources: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
		const bbCommand = (sources.get('application/vnd.code.tree.botTreeView'))?.value;
		if (!bbCommand) {return;};
		dropHandler(target,bbCommand);
	  }

	public async handleDrag(source: BotNode[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
		if(source[0] instanceof CommandTreeItem){
			dataTransfer.set('application/vnd.code.tree.botTreeView', new vscode.DataTransferItem(source[0].bbCommand));
		}
	}


	async getChildren(element?: any) {
    	if (element === undefined) {
			return this.bots.map((bot) => new BotNode(bot));
    	}

		if(element instanceof FolderTreeItem){
			return element.children.map((item) => item as BotNode);
		}

    	if(element instanceof BotNode){
        	return this.getItemsForBotElement(element);
    	}

		if(element instanceof LibTree){
			return this.getItemsForLibElement(element);
		}

		if(element instanceof CommandTree){
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

export class BotNode extends vscode.TreeItem {
  // folders are children of bots
  // TODO: libs, chats, props will be children of bots later
	public children: vscode.TreeItem[] = [];

	getStatusIcon(bot: any){
		if(bot.status === 'works'){
			return 'flash.svg';
		}
		if(!bot.token){
			return 'power.svg';
		}
		return 'wrench.svg';
	}

	getContextValue(bot:any){
		if(bot.status === 'works'){
			return 'bot.works';
		}
		if(!bot.token){
			return 'bot.noToken';
		}
		return 'bot.off';
	}
	getIconPath(bot: any){
		return {
			light: path.join(__filename, '..', '..', 'resources', 'light', this.getStatusIcon(bot)),
			dark: path.join(__filename, '..', '..', 'resources', 'dark', this.getStatusIcon(bot))
		};
	}

	constructor(public bot: any) {
		super(bot.name, vscode.TreeItemCollapsibleState.Collapsed);
		this.tooltip = `Bot id: ${bot.id} - ${bot.status || "no token"}`;
		this.contextValue =  this.getContextValue(bot);
		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.iconPath = this.getIconPath(bot);
	}
}

export class LibTree extends vscode.TreeItem{
	public children: vscode.TreeItem[] = [];

	constructor(public parent: BotNode) {
		super("Libs");
		this.tooltip = "Libs";
		this.contextValue = 'tree-lib';
    	this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.iconPath = {
			light: path.join(__filename, '..', '..', 'resources', 'light',"flask.svg"),
			dark: path.join(__filename, '..', '..', 'resources', 'dark', "flask.svg")
		};
	}
}

export class CommandTree extends vscode.TreeItem{
	public children: vscode.TreeItem[] = [];

	constructor(public parent: BotNode) {
		super("Commands");
		this.tooltip = "Commands";
		this.contextValue = 'tree-command';
    	this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light',"flash.svg"),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', "flash.svg")
		};
	}
}

export class ErrorTree extends vscode.TreeItem{
	public children: vscode.TreeItem[] = [];
	constructor(public parent: BotNode) {
		super("Errors");
		this.tooltip = "Errors";
		this.contextValue = 'tree-error';
    	this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.iconPath = {
			light: path.join(__filename, '..', '..', 'resources', 'light',"bug.svg"),
			dark: path.join(__filename, '..', '..', 'resources', 'dark', "bug.svg")
		};
	}
}

export class FolderTreeItem extends vscode.TreeItem {
  // commands are children of folders
  public children: vscode.TreeItem[] = [];

	constructor(public folder: any, public parent: CommandTree) {
		super(folder.title);
		this.tooltip = folder.title;
		this.contextValue = 'folder';
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.children = folder.children.map((command: any) => new CommandTreeItem(command, this));
	}
}

export class CommandTreeItem extends vscode.TreeItem {
  constructor(public bbCommand: any, public parent: CommandTree|FolderTreeItem) {
    super(bbCommand.command);
    this.tooltip = 
			"📃 " + ( bbCommand.answer || "no") + 
			"\n⌨️ " + ( bbCommand.keyboard || "no") +
			"\n❓" + ( bbCommand.need_reply || "no") +
			"\n⏱️ " + ( bbCommand.auto_retry_time || "no");
    this.contextValue = 'command';
  }
}

export class LibTreeItem extends vscode.TreeItem {
	constructor(public lib: any, public parent: LibTree ) {
	  super(lib.name);
	  this.tooltip = lib.name;
	  this.contextValue = 'lib';
	}
  }