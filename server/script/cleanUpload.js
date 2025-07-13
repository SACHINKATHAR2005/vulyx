import fs from "fs";
import path from "path";

export const cleanUpload = () => {
  const uploadDir = "upload";
  fs.readdir(uploadDir, (err, files) => {
    if (err) return;
    files.forEach(file => {
      fs.unlink(path.join(uploadDir, file), () => {});
    });
  });
};
