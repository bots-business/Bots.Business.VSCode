import * as vscode from 'vscode';
import { apiGet } from './api';

export function getBBTreeView(bots: any[]) {
	const botTreeDataProvider = new BotTreeDataProvider(bots);
	const tree = vscode.window.createTreeView('botTreeView', { treeDataProvider: botTreeDataProvider });
	vscode.window.showInformationMessage('Bots loaded: ' + bots.length);

  // on click event
	tree.onDidChangeSelection(e => {
		console.log(e);
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

class BotTreeDataProvider implements vscode.TreeDataProvider<BotNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<BotNode | undefined> = new vscode.EventEmitter<BotNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<BotNode | undefined> = this._onDidChangeTreeData.event;

	constructor(private bots: any[]) {}

	getTreeItem(element: BotNode): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: BotNode|undefined) {
    if (element === undefined) {
			return this.bots.map((bot) => new BotNode(bot));
    }

		const bot = element.bot;

		const path = `bots/${bot.id}/commands_folders`;
		const folders = await apiGet(path);
		if(!folders){ return []; }

		// add folders as children to the selected bot node
		element.children = folders.map((folder:any) => new FolderTreeItem(folder, element));

		return element.children.map((item) => item as BotNode);
  }

	getParent(element: BotNode): BotNode | null {
    if (element instanceof FolderTreeItem) {
      return element.parent;
    }

    return null;
  }
}

class BotNode extends vscode.TreeItem {
	public children: vscode.TreeItem[] = [];

	constructor(public bot: any) {
		super(bot.name, vscode.TreeItemCollapsibleState.Collapsed);
		this.tooltip = `Bot id: ${bot.id}`;
		this.contextValue = 'bot';
		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
	}
}

class FolderTreeItem extends vscode.TreeItem {
	constructor(private folder: any, public parent: BotNode) {
		super(folder.title);
		this.tooltip = folder.title;
		this.contextValue = 'folder';
	}
}