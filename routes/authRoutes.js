import express from "express";
import {
  getUserProfile,
  loginUser,
  registerUser,
} from "../controllers/auth.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getUserProfile);

export default router;
