// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

const API_URL = "https://appapi.bots.business/v1/";
let apiKey = "";
var vsContext: vscode.ExtensionContext;

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
		const apiKey = getApiKey();

		const url = API_URL + `bots/${bot.id}/commands_folders?api_key=${apiKey}`;
		console.log(`Loading bot folders from url ${url}`);
	
		try {
			const response = await axios.get(url);

			const folders = response.data;
	
			console.log(folders);

			// add folders as children to the selected bot node
			element.children = folders.map((folder:any) => new FolderTreeItem(folder, element));

			return element.children.map((item) => item as BotNode);
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to load bot folders from url ${url}`);
		}

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

function createBotTreeView(bots: any[]) {
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

	// subscribe
	vsContext.subscriptions.push(tree);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	vsContext = context;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "bots-business" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Bots.Business!');
	});

	let loginCmd = vscode.commands.registerCommand('BB:login', async () => {
		const apiKey = await vscode.window.showInputBox({
			placeHolder: 'Enter your BB API key',
			password: true
		});
		saveAndCheckApiKey(apiKey);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(loginCmd);

	await buildBBTree();
}

async function saveAndCheckApiKey(apiKey:any) {
	if(!apiKey){
		vscode.window.showInformationMessage('BB Api key not saved');
		return false;
	}
	vscode.workspace.getConfiguration().update('BotsBusiness.apiKey', apiKey, vscode.ConfigurationTarget.Global);

	try {
		const response = await axios.get(API_URL + `user/unsecure?api_key=${apiKey}`);
		const email = response.data.email;
		if (email) {
			vscode.window.showInformationMessage(`Success! Logged to BB account: ${email}`);
			vscode.workspace.getConfiguration().update(
				'BotsBusiness.email', email, vscode.ConfigurationTarget.Global
			);
			buildBBTree();
		}
	} catch (error) {
		vscode.window.showErrorMessage(`Failed. Please check your BB Api key`);
	}
}

function getApiKey(){
	return apiKey;
	return vscode.workspace.getConfiguration().get('BotsBusiness.apiKey');
}

function getEmail(){
	return "test@example.com";
	return vscode.workspace.getConfiguration().get('BotsBusiness.email');
}

async function buildBBTree() {
	const apiKey = getApiKey();
	if(!apiKey){ return; }
	const response = await axios.get(API_URL + `bots?api_key=${apiKey}`);
	const bots = response.data;
	createBotTreeView(bots);
}

// This method is called when your extension is deactivated
export function deactivate() {}

