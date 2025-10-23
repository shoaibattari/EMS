import express from "express";
import {
  registerCampus,
  getAllCampuses,
  exportCampusData,
} from "../controllers/campusController/campus.js";

const router = express.Router();

// Add a new campus
router.post("/add", registerCampus);

// Get all campuses
router.get("/all-campus", getAllCampuses);

// Export all campuses to Excel
router.get("/export-excel", exportCampusData);

export default router;
