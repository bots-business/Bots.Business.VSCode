import * as fs from 'fs';
import * as os from 'os';

export function getBBFolder() {
  return `${os.tmpdir()}/Bots.Business`;
}

export function initBBFolder(){
	let folderPath = getBBFolder();
	// make folder if not exist
	if (!fs.existsSync(folderPath)){
		fs.mkdirSync(folderPath);
	}
}

function getBotFolder(botID: number){
  return `${getBBFolder()}/bot_${botID.toString()}`;
}

export function initBotFolder(botID: number){
  let folderPath = getBotFolder(botID);
  // make folder if not exist
  if (!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath);
  }
}

export function saveCommandToFile(command: any){
  initBotFolder(command.bot_id);
  let filePath = `${getBotFolder(command.bot_id)}/${command.command}.js`;
  if (!fs.existsSync(filePath)){
    fs.writeFileSync(filePath, command.code);
  }
  return filePath;
}