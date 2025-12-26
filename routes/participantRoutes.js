import express from "express";
import {
  exportParticipantData,
  getAllParticipant,
  markAttendance,
  registerParticipant,
  statusPaymentUpdate,
} from "../controllers/participantController/participant.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/add", registerParticipant);
router.get("/all-participant", getAllParticipant);
router.get("/export-excel", exportParticipantData);
router.patch(
  "/:participantId/payment-status",
  verifyToken,
  statusPaymentUpdate
);

router.patch("/:participantId/attendance", verifyToken, markAttendance);

export default router;
