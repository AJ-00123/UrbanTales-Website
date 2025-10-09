import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSellerAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();
    let seller = await Seller.findOne({ email });

    if (!seller) {
      const username =
        name.split(" ")[0].toLowerCase() + Math.floor(Math.random() * 100000);
      seller = await Seller.create({
        fullName: name,
        username,
        email,
        phone: "N/A",
        googleId,
      });
    }

    const jwtToken = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ user: seller, token: jwtToken });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
