// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { apiGet } from './api';
import { getBBTreeView } from './tree';
import { initBBFolder } from './bbfolder';

var vsContext: vscode.ExtensionContext;

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

	initBBFolder();
	await buildBBTree();
}

async function saveAndCheckApiKey(apiKey:any) {
	vscode.workspace.getConfiguration().update(
		'BotsBusiness.apiKey', apiKey, 
		vscode.ConfigurationTarget.Global
	);

	const response = await apiGet("user/unsecure");
	if(response&&response.email){
		const email = response.email;
		vscode.window.showInformationMessage(`Success! Logged to BB account: ${email}`);
		vscode.workspace.getConfiguration().update(
			'BotsBusiness.email', email, vscode.ConfigurationTarget.Global
		);
		buildBBTree();
		return;
	}

	vscode.window.showErrorMessage(`Failed. Please check your BB Api key`);
}

function getEmail(){
	return "test@example.com";
	return vscode.workspace.getConfiguration().get('BotsBusiness.email');
}

async function buildBBTree() {
	const bots = await apiGet("bots");
	if(!bots){ return; }
	vsContext.subscriptions.push(getBBTreeView(bots));
}

// This method is called when your extension is deactivated
export function deactivate() {}