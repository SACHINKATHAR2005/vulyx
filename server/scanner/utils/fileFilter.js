// /utils/fileFilter.js
import path from "path";
import { IGNORED_EXTENSIONS, IGNORED_PATHS } from "../constants/ignoredExtensions.js";

export const isFileSupported = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return !IGNORED_EXTENSIONS.includes(ext) && !IGNORED_PATHS.some(p => filePath.includes(p));
};
