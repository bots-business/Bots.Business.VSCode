import * as path from "path";

function getIconFileName(fileName: string, style:"light"|"dark") {
  return path.join(
    __filename,
    "..",
    "..",
    "resources",
    style,
    fileName
  );
}

export function getIconsPath(fileName: string) {
  return {
    light: getIconFileName(fileName, "light"),
    dark: getIconFileName(fileName, "dark")
  };
}