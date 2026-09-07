import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Перехват всех ошибок до запуска
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

try {
  console.log('🚀 Загрузка .env...');
  dotenv.config();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PORT = process.env.PORT || 80;

  console.log('📦 Импорт маршрутов...');
  const productRoutes = (await import('./routes/products.js')).default;
  const cartRoutes = (await import('./routes/cart.js')).default;
  const orderRoutes = (await import('./routes/orders.js')).default;
  const adminRoutes = (await import('./routes/admin.js')).default;

  console.log('🛠️ Создание Express...');
  const app = express();

  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
  }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.get('/', (req, res) => res.send('Hello from backend!'));
  app.get('/test', (req, res) => res.json({ message: 'Test route works' }));

  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);

  console.log(`🌐 Запуск на порту ${PORT}...`);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });

} catch (error) {
  console.error('❌ Критическая ошибка при запуске:', error);
}
