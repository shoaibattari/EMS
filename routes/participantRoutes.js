import express from "express";
import {
  exportParticipantData,
  getAllParticipant,
  registerParticipant,
} from "../controllers/participantController/participant.js";

const router = express.Router();

router.post("/add", registerParticipant);
router.get("/all-participant", getAllParticipant);
router.get("/export-excel", exportParticipantData);

export default router;
