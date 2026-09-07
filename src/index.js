import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import adminImagesRoutes from './adminImages.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём папку для картинок в постоянном хранилище
const uploadDir = '/data/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Папка uploads создана в постоянном хранилище');
}

const app = express();
const PORT = process.env.PORT || 80;

// Глобальная обработка ошибок
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

console.log('🚀 Загрузка index.js...');

// CORS
app.use(cors({
  origin: 'https://aerohit-frontend-skycomposer.amvera.io',
  credentials: true,
}));
console.log('✅ CORS настроен');

// JSON парсер
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('✅ JSON парсеры настроены');

// ===== НАСТРОЙКА СЕССИЙ =====
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,          // обязательно для HTTPS
    sameSite: 'none',      // обязательно для кросс-доменных запросов
    maxAge: 1000 * 60 * 60 * 24 // 1 день
  }
}));
console.log('✅ Сессии настроены');

// Статика для картинок
app.use('/uploads', express.static('/data/uploads'));
console.log('✅ Статические файлы настроены');

// Тестовые маршруты
app.get('/', (req, res) => res.send('Hello from backend!'));
app.get('/test', (req, res) => res.json({ message: 'Test route works' }));

// Основные маршруты
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminImagesRoutes);

console.log('✅ Все маршруты зарегистрированы');

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
