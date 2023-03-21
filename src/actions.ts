import { apiGet, apiPost,apiDelete } from "./api";
import * as vscode from 'vscode';
import { saveCommandToFile } from './bbfolder';
import { BotNode,FolderTreeItem,CommandTreeItem} from "./tree";

async function returnBotNode(element:BotNode|FolderTreeItem|CommandTreeItem) {
	if(element instanceof BotNode){
		return element;
	};
	if(element instanceof FolderTreeItem){
		return element.parent;
	}
	if(element instanceof CommandTreeItem){
		if(element.parent instanceof FolderTreeItem){
			return element.parent.parent;
		};
		if(element.parent instanceof BotNode){
			return element.parent;
		};
	}
}


export async function openCode(command: any){
	// reload command
	command = (await apiGet(`bots/${command.bot_id}/commands/${command.id}`));
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

export async function createNewBot() {
	const botName = await vscode.window.showInputBox({
		placeHolder: 'Enter the Name for the Bot. Eg: BBAdminBot'
	});
	const botToken = await vscode.window.showInputBox({
		placeHolder: 'Enter the Bot Token. Eg: 391686724:AAG6XGW0Z9NtfZwqEuWkkno_Eri932cX0Hg'
	});

	if(!botName || ! botToken){return;};

	let newBot = (await apiPost(`bots/`,{
		name: botName,
		token: botToken
	}));

	if(!newBot){
		vscode.window.showErrorMessage(`Error creating New Bot: ${botName}`);
		return;
	}

	if(newBot.id){
		vscode.window.showInformationMessage(`Bot  Successsfully Created: ${newBot.name}`);
		vscode.commands.executeCommand('BB.refresh');
	}
}

export async function updateStatus(element:BotNode,status:String) {
	if(!element){return;};
	let newStatus = (await apiPost(`bots/${element.bot.id}/status`,{
		"status": status === "start" ? "start_launch" : "start_stopping"
	}));

	if(!newStatus){
		vscode.window.showErrorMessage(`Error while ${status === "start" ? "starting" : "stopping"} Bot: ${element.bot.name}`);
		return;
	}

	if(newStatus.error){
		vscode.window.showErrorMessage(`Error: ${newStatus.error}`);
		return;
	}

	if(newStatus.id){
		vscode.window.showInformationMessage(`Bot ${status === "start" ? "Started" : "Stopped"}: ${newStatus.name}`);
		vscode.commands.executeCommand('BB.refresh');
	}
}

export async function createCommand(element:BotNode|FolderTreeItem) {
	const cmdName = await vscode.window.showInputBox({
		placeHolder: 'Enter the Name for the Command. Eg: /start'
	});

	let command:any = {command:cmdName};

	if(element instanceof FolderTreeItem){
		command.commands_folder_id = element.folder.id;
	}
	
	let BotNodeElement = await returnBotNode(element);
	if(!command.command || !BotNodeElement){return;};

	let newCmd = (await apiPost(`bots/${BotNodeElement.bot.id}/commands`,command));
	if(!newCmd){
		vscode.window.showErrorMessage(`Error creating command: ${cmdName}`);
		return;
	}

	if(newCmd.id){
		vscode.window.showInformationMessage(`Command Successsfully Created: ${newCmd.command}`);
		vscode.commands.executeCommand('BB.refreshBot',BotNodeElement);
	}
}

export async function createFolder(element:BotNode) {
	const folderName = await vscode.window.showInputBox({
		placeHolder: 'Enter the Name for the Folders. Eg: Admin'
	});

	if(!element||!folderName){return;};

	let newFolder= (await apiPost(`bots/${element.bot.id}/commands_folders`,{title: folderName}));
	if(!newFolder){
		vscode.window.showErrorMessage(`Error creating Folder: ${folderName}`);
		return;
	}

	if(newFolder.id){
		vscode.window.showInformationMessage(`Folder Successsfully Created: ${newFolder.title}`);
		vscode.commands.executeCommand('BB.refreshBot',element);
	}
}

export async function deleteItem(element:BotNode|FolderTreeItem|CommandTreeItem) {
	let itemType,deleteUrl;
	let BotNodeElement = await returnBotNode(element);

	if(!element || !BotNodeElement){return;};

	if(element instanceof BotNode){
		itemType = 'Bot';
		deleteUrl = `bots/${BotNodeElement.bot.id}`;
	}
	if(element instanceof FolderTreeItem){
		itemType = 'Folder';
		deleteUrl = `bots/${BotNodeElement.bot.id}/commands_folders/${element.folder.id}`;
	}
	if(element instanceof CommandTreeItem){
		itemType = "Command";
		deleteUrl = `bots/${BotNodeElement.bot.id}/commands/${element.bbCommand.id}`;
	}

	const result = await vscode.window.showWarningMessage(
		`Are you sure you want to delete ${itemType} ${element.label}?`, 'Yes', 'No'
	  );
	  if(result !== 'Yes'){ return;}
      
	const deleted = await apiDelete(String(deleteUrl));
	  if(deleted){
		vscode.window.showInformationMessage(`Deleted: ${itemType} ${element.label}`);
		if(element instanceof BotNode){
			await vscode.commands.executeCommand('BB.refresh');
			return;
		}
		vscode.commands.executeCommand('BB.refreshBot',BotNodeElement);
	}
}