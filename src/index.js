import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('1. Начало загрузки index.js');

// Загрузка переменных окружения
dotenv.config();
console.log('2. Переменные окружения загружены, PORT=', process.env.PORT);

import productRoutes from './routes/products.js';
console.log('3. Маршруты products загружены');
import cartRoutes from './routes/cart.js';
console.log('4. Маршруты cart загружены');
import orderRoutes from './routes/orders.js';
console.log('5. Маршруты orders загружены');
import adminRoutes from './routes/admin.js';
console.log('6. Маршруты admin загружены');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

console.log('7. Express приложение создано, PORT=', PORT);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
console.log('8. CORS настроен');

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('11. Статические файлы настроены');

app.use('/api/products', productRoutes);
console.log('12. Маршруты products зарегистрированы');
app.use('/api/cart', cartRoutes);
console.log('13. Маршруты cart зарегистрированы');
app.use('/api/orders', orderRoutes);
console.log('14. Маршруты orders зарегистрированы');
app.use('/api/admin', adminRoutes);
console.log('15. Маршруты admin зарегистрированы');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
console.log('16. Файл index.js выполнен до конца');
