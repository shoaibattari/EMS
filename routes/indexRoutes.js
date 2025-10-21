import express from "express";
import authRoutes from "./authRoutes.js";
// import adminRoutes from "./adminRoutes.js";
import volunteerRoutes from "./volunteerRoutes.js";
import studentRoutes from "./studentRoutes.js";
import participantRoutes from "./participantRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/admin", adminRoutes);
router.use("/volunteer", volunteerRoutes);
router.use("/student", studentRoutes);
router.use("/participant", participantRoutes);

export default router;
