import { apiGet, apiDelete } from "./api";
import * as vscode from 'vscode';
import { saveCommandToFile } from './bbfolder';
import { getBBTreeView } from "./tree";

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

function getItemType(item: any){
  if(item.bbCommand){
    return 'command';
  }
  if(item.folder){
    return 'folder';
  }
  if(item.bot){
    return 'bot';
  }
}

// delete Item
export async function deleteItem(item: any){
  const itemType = getItemType(item);
  if(!itemType){ return; };
  
  const result = await vscode.window.showWarningMessage(
    `Are you sure you want to delete ${itemType} ${item.label}?`, 'Yes', 'No'
  );
  if(result !== 'Yes'){ return; }

  const url = getDeleteUrl(item, itemType);
  const deleted = await apiDelete(String(url));
  if(deleted){
    vscode.window.showInformationMessage(`Deleted: ${itemType} ${item.label}`);
    getBBTreeView().refresh();
  }
}

function getDeleteUrl(item: any, itemType: string){
  return {
    "command": `bots/${item.bot_id}/commands/${item.id}`,
    "folder": `bots/${item.bot_id}/commands_folders/${item.id}`,
    "bot": `bots/${item.id}`
  }[itemType];
}


