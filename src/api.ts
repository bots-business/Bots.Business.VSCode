import * as vscode from 'vscode';
import axios from 'axios';

const API_URL = "https://appapi.bots.business/v1/";

let apiKey = "";

function getApiKey(){
	return apiKey;
	return vscode.workspace.getConfiguration().get('BotsBusiness.apiKey');
}

export async function apiGet(path: string){
  const apiKey = getApiKey();
	if(!apiKey){
		vscode.window.showInformationMessage('BB Api key not setuped yet. Please login first.');
		return false;
	}
  const url = API_URL + `${path}?api_key=${apiKey}`;
  console.log(`Loading data from url ${url}`);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    vscode.window.showErrorMessage(`Bots.Business: failed to load from url ${url}`);
  }
  return false;
}