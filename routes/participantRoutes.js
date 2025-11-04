import express from "express";
import {
  exportParticipantData,
  getAllParticipant,
  registerParticipant,
  statusPaymentUpdate,
} from "../controllers/participantController/participant.js";

const router = express.Router();

router.post("/add", registerParticipant);
router.get("/all-participant", getAllParticipant);
router.get("/export-excel", exportParticipantData);
router.patch("/:participantId/payment-status", statusPaymentUpdate);

export default router;
