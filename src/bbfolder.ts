import * as fs from 'fs';
import * as os from 'os';
// it is derictory separator  / or \ depending on OS
import { sep } from 'path';
import * as path from 'path';

const OS_SEPARATOR = sep;

function pathToLowerCaseOnWin32(path: string) {
  if (process.platform === 'win32') {
    return path.toLowerCase();
  }
  return path;
}

export function getBBFolder() {
  let bbFolder = `${os.tmpdir()}${OS_SEPARATOR}Bots.Business`;
  bbFolder = pathToLowerCaseOnWin32(bbFolder);
  return bbFolder;
}

function createDirIfNotExists(dirPath: string) {
  if (fs.existsSync(dirPath)) { return; }
  fs.mkdirSync(dirPath);
}

export function initBBFolder(){
  createDirIfNotExists(getBBFolder());
}

function getBotFolder(botID: number){
  return path.join(getBBFolder(), `bot_${botID.toString()}`);
}

export function initBotFolder(botID: number){
  createDirIfNotExists(getBBFolder());
}

function initCommandFolder(botID: number, commandID: number){
  const botFolder = getBotFolder(botID);
  createDirIfNotExists(botFolder);
  const commandFolder = path.join(botFolder, commandID.toString());
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
  let filePath = path.join(commandFolder, fileName);
  fs.writeFileSync(filePath, command.code, {encoding: 'utf8', flag: 'w'});
  return filePath;
}

export function extractBotIDFromFileName(fileName: string){
  let parts = fileName.split(OS_SEPARATOR);
  return parts[parts.length - 3].split("bot_")[1];
}

export function extractCommandIDFromFileName(fileName: string){
  let parts = fileName.split(OS_SEPARATOR);
  return parts[parts.length - 2];
}

export function isBotFolder(folderPath: string){
  folderPath = pathToLowerCaseOnWin32(folderPath);
  return folderPath.indexOf(getBBFolder()) === 0;
}