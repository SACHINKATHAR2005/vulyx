import express from "express";
import { verifyToken } from "../middlewares/auth.middlware.js";
import { scanMultipleFiles } from "../controllers/multiScan.controller.js";
import { uploadFiles } from "../middlewares/upload.middleware.js";
const router = express.Router();
router.post("/multi-upload", verifyToken, uploadFiles.array("files"), scanMultipleFiles);

export default router;



