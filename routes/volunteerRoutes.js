import express from "express";
import {
  createVolunteer,
  exportVolunteers,
  generateVolunteerCard,
  getAllVolunteers,
} from "../controllers/volunteerController/volunteer.js";

const router = express.Router();

router.post("/add", createVolunteer);
router.get("/all-volunteers", getAllVolunteers);
router.get("/export-excel", exportVolunteers);
router.get("/:id/card", generateVolunteerCard);

export default router;
