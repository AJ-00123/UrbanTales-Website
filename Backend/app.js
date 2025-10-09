import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './models/db.js';
import cors from 'cors';
import userRoutes from './routes/user.routs.js';
import productRoutes from './routes/product.routes.js';
import sellerRoutes from './routes/Seller.routes.js';
import authRoutes from './routes/authRoutes.js'; // <-- rename/import for both google and reset
import cartRoutes from "./routes/Cart.routes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api', productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
connectDB()
app.get('/', (req, res) => {
    res.send('Hello duniyaa');
});
export default app;
