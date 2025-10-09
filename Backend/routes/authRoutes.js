import express from "express";
import {
  requestResetPassword,
  verifyResetOTP,
  resetPassword,
} from "../controllers/authController.js";
import { googleSellerAuth } from "../controllers/google.auth.controller.js";

const router = express.Router();

// RESET PASSWORD ROUTES
router.post("/reset-password/request", requestResetPassword);
router.post("/reset-password/verify", verifyResetOTP);
router.post("/reset-password/confirm", resetPassword);

// GOOGLE SELLER AUTH
router.post("/google-seller", googleSellerAuth);

export default router;
