import express from "express";
import {
  exportStudentData,
  getAllStudents,
  markAttendance,
  registerStudent,
  statusPaymentUpdate,
  getStudentByQuery,
  getStudentStats,
} from "../controllers/studentController/student.js";
import upload from "../middlewares/uploadMiddleware.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Register Student (supports profileImage + paymentSlip)
router.post(
  "/add",
  upload("course-participant/payments").fields([
    { name: "profileImage", maxCount: 1 },
    { name: "paymentSlip", maxCount: 1 },
  ]),
  registerStudent
);

// Get all students with search & pagination
router.get("/all-student", getAllStudents);

// Export student data to Excel
router.get("/export-excel", exportStudentData);

// Update payment status (secured)
router.patch("/:studentId/payment-status", verifyToken, statusPaymentUpdate);

// Mark attendance (secured)
router.patch("/:studentId/attendance", verifyToken, markAttendance);

// Get student by query (CNIC, contact, or ID)
router.get("/find", getStudentByQuery);

// Get student stats (secured)
router.get("/stats", verifyToken, getStudentStats);

export default router;
