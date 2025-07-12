import { Report } from "../model/report.model.js";


import { generatePdfStream } from "../utils/pdfGenerator.js";

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
   return res.status(200).json(reports);
  } catch (error) {
    console.error("Error in getAllReports:", error);
   return res.status(500).json({ message: "Failed to fetch reports" });
  }
};


export const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

   return res.status(200).json(report);
  } catch (error) {
    console.error("Error in getReportById:", error);
    return res.status(500).json({ message: "Failed to fetch report" });
  }
};


export const createReport = async (req, res) => {
  try {
    const { filename, totalIssues, score, vulnerabilities } = req.body;

    if (!filename || !score || !vulnerabilities) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newReport = new Report({
      user: req.user._id,
      filename,
      totalIssues,
      score,
      vulnerabilities
    });

    await newReport.save();
return  res.status(201).json(newReport);
  } catch (error) {
    console.error("Error in createReport:", error);
   return res.status(500).json({ message: "Failed to create report" });
  }
};


export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found or already deleted" });
    }

    return res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReport:", error);
    return res.status(500).json({ message: "Failed to delete report" });
  }
};




export const downloadReportPdf = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.filename}-report.pdf"`
    );

    generatePdfStream(report, res); // 👈 Pass the response stream
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};
