import * as vscode from 'vscode';
import axios from 'axios';

const API_URL = "https://appapi.bots.business/v1/";

let apiKey = "";

function getApiKey(){
	return apiKey;
	return vscode.workspace.getConfiguration().get('BotsBusiness.apiKey');
}

function getUrl(path: string){
  const apiKey = getApiKey();
  if(!apiKey){
    vscode.window.showInformationMessage('BB Api key not setuped yet. Please login first.');
    return false;
  }
  const url = API_URL + `${path}?api_key=${apiKey}`;
  console.log(`Loading data from url ${url}`);
  return url;
}

const methods = {
  get: axios.get,
  post: axios.post,
  put: axios.put
};

export async function apiRequest(method: keyof typeof methods, path: string, data?: any) {
  const url = getUrl(path);
  if (!url) {return false;}
  try {
    const response = await methods[method](url, data);
    if(response.status !== 200){
      vscode.window.showErrorMessage(`Bots.Business: failed to make request to url ${url}`);
      return false;
    }

    return response.data;
  } catch (error) {
    vscode.window.showErrorMessage(`Bots.Business: failed to ${method} from url ${url}`);
  }
  return false;
}

export async function apiGet(path: string){
  return apiRequest('get', path);
}

export async function apiPost(path: string, data: any){
  return apiRequest('post', path, data);
}

export async function apiPut(path: string, data: any){
  return apiRequest('put', path, data);
}