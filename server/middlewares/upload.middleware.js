// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // make sure uploads/ exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// // Accept only allowed file types
// const fileFilter = (req, file, cb) => {
//   const allowedExt = [".js", ".py", ".cpp", ".java"];
//   const ext = path.extname(file.originalname);

//   if (!allowedExt.includes(ext)) {
//     return cb(new Error("Unsupported file type"), false);
//   }

//   cb(null, true);
// };

// export const upload = multer({ storage, fileFilter });

import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Ensure upload folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ⬜ Shared storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// ✅ For .zip upload (folder scan)
const zipFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".zip") {
    return cb(new Error("Only .zip files are allowed"), false);
  }
  cb(null, true);
};

// ✅ For single/multiple file upload (.js, .py, etc.)
const codeFileFilter = (req, file, cb) => {
  const allowedExt = [".js", ".py", ".cpp", ".java"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExt.includes(ext)) {
    return cb(new Error("Unsupported file type"), false);
  }
  cb(null, true);
};

// 🟦 Export both
export const uploadZip = multer({ storage, fileFilter: zipFilter });
export const uploadFiles = multer({ storage, fileFilter: codeFileFilter });
