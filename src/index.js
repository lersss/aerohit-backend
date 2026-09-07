import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import adminEditRoutes from './adminEdit.js';
import adminDashboardRoutes from './adminDashboard.js';
import adminOrdersRoutes from './adminOrders.js';

import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import adminImagesRoutes from './adminImages.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём папку для картинок
const uploadDir = '/data/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Папка uploads создана');
}

const app = express();
const PORT = process.env.PORT || 80;

// Доверяем прокси (Amvera использует Envoy)
app.set('trust proxy', 1);

// Глобальная обработка ошибок
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// CORS
app.use(cors({
  origin: 'https://aerohit-frontend-skycomposer.amvera.io',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminDashboardRoutes);
app.use('/admin', adminOrdersRoutes);

// ===== СЕССИЯ (упрощённая для теста) =====
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,      // временно
    sameSite: 'lax',    // временно
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use('/uploads', express.static('/data/uploads'));
app.use('/admin', adminEditRoutes);

app.get('/', (req, res) => res.send('Hello from backend!'));
app.get('/test', (req, res) => res.json({ message: 'Test route works' }));

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminImagesRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
