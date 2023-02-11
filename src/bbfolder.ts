import * as fs from 'fs';
import * as os from 'os';

export function getBBFolder() {
  return `${os.tmpdir()}/Bots.Business`;
}

function createDirIfNotExists(dirPath: string) {
  if (fs.existsSync(dirPath)) { return; }
  fs.mkdirSync(dirPath);
}

export function initBBFolder(){
  createDirIfNotExists(getBBFolder());
}

function getBotFolder(botID: number){
  return `${getBBFolder()}/bot_${botID.toString()}`;
}

export function initBotFolder(botID: number){
  createDirIfNotExists(getBBFolder());
}

function initCommandFolder(botID: number, commandID: number){
  const botFolder = getBotFolder(botID);
  createDirIfNotExists(botFolder);
  const commandFolder = `${botFolder}/${commandID}`;
  createDirIfNotExists(commandFolder);
  return commandFolder;
}

export function saveCommandToFile(command: any){
  initBotFolder(command.bot_id);
  let fileName = command.command;
  // escape file name
  fileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  fileName = `${fileName}.js`;
  let commandFolder = initCommandFolder(command.bot_id, command.id);
  let filePath = `${commandFolder}/${fileName}`;
  fs.writeFileSync(filePath, command.code, {encoding: 'utf8', flag: 'w'});
  return filePath;
}

export function extractBotIDFromFileName(fileName: string){
  let parts = fileName.split('/');
  return parts[parts.length - 3].split("bot_")[1];
}

export function extractCommandIDFromFileName(fileName: string){
  let parts = fileName.split('/');
  return parts[parts.length - 2];
}

export function isBotFolder(folderPath: string){
  return folderPath.indexOf(getBBFolder()) === 0;
}