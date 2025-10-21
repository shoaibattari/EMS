import express from "express";
import {
  exportStudentData,
  getAllStudents,
  registerStudent,
} from "../controllers/studentController/student.js";

const router = express.Router();

router.post("/add", registerStudent);
router.get("/all-student", getAllStudents);
router.get("/export-excel", exportStudentData);

export default router;
