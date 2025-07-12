import express from "express";
import {
  getAllReports,
  getReportById,
  createReport,
  deleteReport,
  downloadReportPdf
} from "../controllers/reportController.js";

import { verifyToken } from "../middlewares/auth.middlware.js";

const router = express.Router();

// Apply auth middleware
router.use(verifyToken);

// GET all reports
router.get("/api/scans", getAllReports);

// GET specific report
router.get("/api/scans/:id", getReportById);

// POST create new report
router.post("/api/scans", createReport);

// DELETE a report (optional)
router.delete("/api/scans/:id", deleteReport);

router.get("/api/scans/:id/pdf", downloadReportPdf);

export default router;
