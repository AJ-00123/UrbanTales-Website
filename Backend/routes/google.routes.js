import express from "express";
import { googleSellerAuth } from "../controllers/google.auth.controller.js";

const router = express.Router();
router.post("/google-seller", googleSellerAuth);

export default router;
