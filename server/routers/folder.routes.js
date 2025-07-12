import express from "express";

import { uploadZip } from "../middlewares/upload.middleware.js";
import { scanZippedProject } from "../controllers/folderScan.controller.js";
import { verifyToken } from "../middlewares/auth.middlware.js";

const router = express.Router();

router.post("/upload-zip", verifyToken, uploadZip.single("file"), scanZippedProject);
// http://localhost:3000/folder/upload-zip
export default router;
