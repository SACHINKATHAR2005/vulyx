import fs from "fs";
import path from "path";

export const cleanTemp = () => {
  const tempDir = "temp";
  fs.readdir(tempDir, (err, folders) => {
    if (err) return;
    folders.forEach(folder => {
      fs.rm(path.join(tempDir, folder), { recursive: true, force: true }, () => {});
    });
  });
};
