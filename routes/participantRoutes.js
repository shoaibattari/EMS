import express from "express";
import {
  exportParticipantData,
  getAllParticipant,
  getParticipantByQuery,
  getParticipantStats,
  markAttendance,
  registerParticipant,
  statusPaymentUpdate,
} from "../controllers/participantController/participant.js";
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  upload("event-participants/payments").single("paymentSlip"),
  registerParticipant
);
router.get("/all-participant", getAllParticipant);
router.get("/export-excel", exportParticipantData);
router.patch(
  "/:participantId/payment-status",
  verifyToken,
  statusPaymentUpdate
);
router.get("/find", getParticipantByQuery);

router.patch("/:participantId/attendance", verifyToken, markAttendance);

router.get("/stats", verifyToken, getParticipantStats);

export default router;
