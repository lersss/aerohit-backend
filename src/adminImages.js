import express from 'express';
import { adminAuth } from './middleware/auth.js';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();

// Страница загрузки изображений
router.get('/images', adminAuth, async (req, res) => {
  try {
    // Получаем список товаров с бэкенда
    const response = await axios.get(`${req.protocol}://${req.get('host')}/api/products`);
    const products = response.data;

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Загрузка изображений</title>
      <style>
        body { font-family: Arial; max-width: 800px; margin: 40px auto; padding: 20px; background: #f4f4f4; }
        .container { background: #fff; padding: 20px; border-radius: 8px; }
        h2 { margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f0f0f0; }
        .upload-form { display: flex; gap: 10px; align-items: center; }
        input[type="file"] { padding: 5px; }
        button { padding: 6px 12px; background: #007bff; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .success { color: green; }
        .error { color: red; }
        .preview { max-width: 50px; max-height: 50px; }
      </style>
    </head>
    <body>
    <div class="container">
      <h2>🖼️ Загрузка изображений для товаров</h2>
      <p>Выберите товар и загрузите изображение (.png, .jpg, .jpeg).</p>
      <table>
        <tr><th>Модель</th><th>Мощность</th><th>Текущее изображение</th><th>Действие</th></tr>
    `;

    for (const p of products) {
      const imgTag = p.imageUrl ? `<img src="${p.imageUrl}" class="preview" />` : '—';
      html += `
        <tr>
          <td>${p.model}</td>
          <td>${p.power}</td>
          <td>${imgTag}</td>
          <td>
            <form class="upload-form" data-id="${p.id}" action="/admin/upload" method="post" enctype="multipart/form-data">
              <input type="file" name="image" accept="image/*" required />
              <button type="submit">Загрузить</button>
              <span class="result" id="result-${p.id}"></span>
            </form>
          </td>
        </tr>
      `;
    }

    html += `
      </table>
    </div>
    <script>
      document.querySelectorAll('.upload-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const id = form.dataset.id;
          const resultSpan = document.getElementById('result-' + id);
          resultSpan.textContent = '⏳ ...';
          try {
            const response = await fetch('/admin/upload', {
              method: 'POST',
              headers: {
                'x-api-key': '${process.env.ADMIN_API_KEY}'
              },
              body: formData
            });
            if (response.ok) {
              resultSpan.textContent = '✅';
              resultSpan.style.color = 'green';
              // Обновим страницу через секунду, чтобы показать новое изображение
              setTimeout(() => location.reload(), 1000);
            } else {
              const text = await response.text();
              resultSpan.textContent = '❌ ' + text;
              resultSpan.style.color = 'red';
            }
          } catch (err) {
            resultSpan.textContent = '❌ ' + err.message;
            resultSpan.style.color = 'red';
          }
        });
      });
    </script>
    </body>
    </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send('Ошибка загрузки страницы: ' + error.message);
  }
});

// Обработчик загрузки изображения
router.post('/upload', adminAuth, async (req, res) => {
  try {
    // Используем multer для обработки файла — мы уже настроили его в upload.js
    // Но нам нужно обработать multipart/form-data, поэтому используем multer как middleware
    // Проще всего сделать отдельный маршрут с multer
    // Но для простоты мы используем готовый upload из middleware
    // Импортируем его здесь
    const upload = (await import('../middleware/upload.js')).default;
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).send(err.message);
      }
      if (!req.file) {
        return res.status(400).send('Файл не выбран');
      }

      const productId = req.body.productId || req.query.productId;
      if (!productId) {
        return res.status(400).send('ID товара не указан');
      }

      // Обновляем товар в базе
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      try {
        const imageUrl = `/uploads/${req.file.filename}`;
        await prisma.product.update({
          where: { id: parseInt(productId) },
          data: { imageUrl }
        });
        res.send('OK');
      } catch (error) {
        res.status(500).send('Ошибка обновления: ' + error.message);
      } finally {
        await prisma.$disconnect();
      }
    });
  } catch (error) {
    res.status(500).send('Ошибка: ' + error.message);
  }
});

export default router;
