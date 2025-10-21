// import express from "express";
// import {
//   adminDeleteAllTaskify,
//   adminEditTaskify,
//   getaAdminTaskify,
//   getAllTaskifyForAdmin,
//   getAllTaskifyForLanding,
//   getDashboardStats,
// } from "../controllers/taskifyController/taskify.js"; // ✅ Updated path and names
// import verifyToken from "../middlewares/verifyToken.js";
// import authorizeRoles from "../middlewares/authorizeRoles.js";
// import { getAllUsersForAdmin } from "../controllers/authController/auth.js";
// import upload from "../middlewares/uploadMiddleware.js";

// const router = express.Router();

// // ✅ Admin: Delete All Taskify
// router.delete(
//   "/delete-all-taskify",
//   verifyToken,
//   authorizeRoles("admin"),
//   adminDeleteAllTaskify
// );

// // ✅ Admin: Get All Taskify
// router.get(
//   "/all-taskify",
//   verifyToken,
//   authorizeRoles("admin"),
//   getAllTaskifyForAdmin
// );

// // ✅ Admin: Get All Users
// router.get(
//   "/all-users",
//   verifyToken,
//   authorizeRoles("admin"),
//   getAllUsersForAdmin
// );

// router.get(
//   "/landing-taskify",
//   getAllTaskifyForLanding //
// );

// router.get(
//   "/dashboard-stats",
//   verifyToken,
//   authorizeRoles("admin"),
//   getDashboardStats
// );

// router.get(
//   "/taskify/:id",
//   verifyToken,
//   authorizeRoles("admin"),
//   getaAdminTaskify
// );

// router.put(
//   "/edit/:id",
//   verifyToken,
//   authorizeRoles("admin"),
//   upload("taskifyAvatars").single("avatar"),
//   adminEditTaskify
// );

// export default router;
