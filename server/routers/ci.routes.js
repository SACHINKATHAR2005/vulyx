import express from "express";
import { uploadZip } from "../middlewares/upload.middleware.js";
import { scanZippedProject } from "../controllers/folderScan.controller.js";
import { verifyApiKey } from "../middlewares/verifyApiKey.middleware.js";

const router = express.Router();

router.post("/scan/zip", verifyApiKey, uploadZip.single("file"), scanZippedProject);
// Endpoint: http://localhost:3000/ci/scan/zip

export default router;

// router.post("/scan/zip", verifyApiKey, uploadZip.single("file"), scanZippedProject);
