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
import adminImagesRoutes from './adminImages.js'; // <-- ДОБАВЛЕНО

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём папку для картинок
const uploadDir = '/data/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Папка uploads создана в постоянном хранилище');
}

const app = express();
const PORT = process.env.PORT || 80;

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

console.log('1. Начало загрузки index.js');
console.log('2. Переменные окружения загружены, PORT=', PORT);

app.use(cors({
  origin: 'https://aerohit-frontend-skycomposer.amvera.io',
  credentials: true,
}));
console.log('8. CORS настроен');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('9. JSON парсеры настроены');

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));
console.log('10. Сессии настроены');

app.use('/uploads', express.static('/data/uploads'));
console.log('11. Статические файлы настроены');

app.get('/', (req, res) => res.send('Hello from backend!'));
app.get('/test', (req, res) => res.json({ message: 'Test route works' }));

app.use('/api/products', productRoutes);
console.log('12. Маршруты products зарегистрированы');
app.use('/api/cart', cartRoutes);
console.log('13. Маршруты cart зарегистрированы');
app.use('/api/orders', orderRoutes);
console.log('14. Маршруты orders зарегистрированы');
app.use('/api/admin', adminRoutes);
console.log('15. Маршруты admin зарегистрированы');

app.use('/admin', adminImagesRoutes); // <-- ДОБАВЛЕНО
console.log('16. Маршруты admin/images зарегистрированы');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
console.log('17. Файл index.js выполнен до конца');
