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

// Register Participant (supports profileImage + paymentSlip if needed)
router.post(
  "/add",
  upload("event-participants/payments").fields([
    { name: "profileImage", maxCount: 1 },
    { name: "paymentSlip", maxCount: 1 },
  ]),
  registerParticipant
);

// Get all participants with search & pagination
router.get("/all-participant", getAllParticipant);

// Export participant data to Excel
router.get("/export-excel", exportParticipantData);

// Update payment status (secured)
router.patch(
  "/:participantId/payment-status",
  verifyToken,
  statusPaymentUpdate
);

// Mark attendance (secured)
router.patch("/:participantId/attendance", verifyToken, markAttendance);

// Get participant by query (CNIC, contact, or ID)
router.get("/find", getParticipantByQuery);

// Get participant stats (secured)
router.get("/stats", verifyToken, getParticipantStats);

export default router;
