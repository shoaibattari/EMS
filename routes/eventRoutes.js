import express from "express";
import {
  registerEvent,
  getAllEvents,
  exportEventData,
} from "../controllers/eventController/event.js";

const router = express.Router();

// Add new event
router.post("/add", registerEvent);

// Get all events
router.get("/all-event", getAllEvents);

// Export event data
router.get("/export-excel", exportEventData);

export default router;
