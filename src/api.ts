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

function checkResponse(response: any, url: string){
  if(response.status === 200){ return true; }
  const message = `Bots.Business: failed to make request to url ${url}`;
  vscode.window.showErrorMessage(message);
  console.error(message);
  return false;
}

export async function apiRequest(method: keyof typeof methods, path: string, data?: any) {
  const url = getUrl(path);
  if (!url) {return false;}
  try {
    const response = await methods[method](url, data);
    if(!checkResponse(response, url)){ return false; }

    return response.data;
  } catch (error) {
    const message = `Bots.Business: failed to ${method}. Url ${url}`;
    console.error(message);
    vscode.window.showErrorMessage(message);
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