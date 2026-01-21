import express from "express";
import {
  exportStudentData,
  getAllStudents,
  registerStudent,
} from "../controllers/studentController/student.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/add",
  upload("course-participant/payments").single("paymentSlip"),
  registerStudent
);
router.get("/all-student", getAllStudents);
router.get("/export-excel", exportStudentData);

export default router;
