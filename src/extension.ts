// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { apiGet, apiPost, apiPut } from './api';
import { getBBTreeView } from './tree';
import { extractBotIDFromFileName, extractCommandIDFromFileName, getBBFolder, initBBFolder, isBotFolder } from './bbfolder';

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

	// save new content on file saving
	vscode.workspace.onDidSaveTextDocument(textDoc => {
		console.log(textDoc);
		saveCommandCode(textDoc);
	});

	await buildBBTree();
}

async function saveCommandCode(textDoc: vscode.TextDocument){
	// show message
	vscode.window.showInformationMessage(`Saving code to BB...`);

	// c:\Users\user\AppData\Local\Temp\Bots.Business\bot_123\456\command.js
	if(!isBotFolder(textDoc.fileName)){
		// vscode.window.showErrorMessage(`Not a BB folder. Not saving code to BB. Cur folder: ${textDoc.fileName}`);
		// vscode.window.showErrorMessage(`BB folder is: ${getBBFolder()}`);
		return;
	}

	const commandID = extractCommandIDFromFileName(textDoc.fileName);
	const botID = extractBotIDFromFileName(textDoc.fileName);

	if(!commandID||!botID){
		vscode.window.showErrorMessage(`Failed to save code to BB. Cur folder: ${textDoc.fileName}`);
		return;
	}

	const code = textDoc.getText();

	const response = await apiPut(`bots/${botID}/commands/${commandID}/code`, {code});
	if(response){
		vscode.window.showInformationMessage(`Code saved to BB`);
	}else{
		vscode.window.showErrorMessage(`Failed to save code to BB`);
	}
}

async function saveAndCheckApiKey(apiKey:any) {
	vscode.workspace.getConfiguration().update(
		'bots-business.apiKey', apiKey, 
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