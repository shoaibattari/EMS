import express from "express";
import {
  registerCourse,
  getAllCourses,
  exportCourseData,
} from "../controllers/courseController/course.js";

const router = express.Router();

// Add new course
router.post("/add", registerCourse);

// Get all courses
router.get("/all-course", getAllCourses);

// Export course data
router.get("/export-excel", exportCourseData);

export default router;
