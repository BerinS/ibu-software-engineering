import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes    from './routes/userRoutes.js';
import eventRoutes   from './routes/eventRoutes.js';
import adminRoutes   from './routes/adminRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// ES-module equivalent of __dirname (required for express.static path resolution)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files (event cover images, etc.)
// Must be registered before routes so /uploads/* never hits the router.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/users',    userRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/bookings', bookingRoutes);

// catches errors passed via next(error) in all routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
