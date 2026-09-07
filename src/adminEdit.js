import express from 'express';
import { adminAuth } from './middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import upload from './middleware/upload.js';

const router = express.Router();
const prisma = new PrismaClient();

// Страница со списком товаров и кнопками редактирования
router.get('/edit-products', adminAuth, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { model: 'asc' }
    });

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Редактирование товаров</title>
      <style>
        body { font-family: Arial; max-width: 1200px; margin: 40px auto; padding: 20px; background: #f4f4f4; }
        .container { background: #fff; padding: 20px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .btn-edit { background: #007bff; color: #fff; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-edit:hover { background: #0056b3; }
        .edit-form { display: none; margin-top: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background: #f9f9f9; }
        .edit-form.active { display: block; }
        label { display: block; margin-top: 10px; font-weight: bold; }
        input, textarea { width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ccc; border-radius: 4px; }
        button[type="submit"] { margin-top: 15px; padding: 10px 20px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .cancel-btn { margin-top: 15px; padding: 10px 20px; background: #6c757d; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; }
        .success { color: green; }
        .error { color: red; }
      </style>
    </head>
    <body>
    <div class="container">
      <h1>Редактирование товаров</h1>
      <table>
        <tr><th>ID</th><th>Модель</th><th>Мощность</th><th>Цена (≤5)</th><th>Действие</th></tr>
    `;

    for (const p of products) {
      html += `
        <tr>
          <td>${p.id}</td>
          <td>${p.model}</td>
          <td>${p.power}</td>
          <td>${p.price1}</td>
          <td><button class="btn-edit" data-id="${p.id}">Редактировать</button></td>
        </tr>
      `;
    }

    html += `
      </table>

      <div id="editFormContainer" class="edit-form">
        <h2>Редактировать товар</h2>
        <form id="editForm" enctype="multipart/form-data">
          <input type="hidden" id="editId" />
          <label>Модель</label>
          <input type="text" id="editModel" required />
          <label>Мощность</label>
          <input type="text" id="editPower" />
          <label>Описание</label>
          <textarea id="editDescription" rows="4"></textarea>
          <label>Цена (≤5 шт)</label>
          <input type="number" step="0.01" id="editPrice1" required />
          <label>Цена (≤200 шт)</label>
          <input type="number" step="0.01" id="editPrice2" required />
          <label>Цена (≤500 шт)</label>
          <input type="number" step="0.01" id="editPrice3" required />
          <label>Цена (≥501 шт)</label>
          <input type="number" step="0.01" id="editPrice4" required />
          <label>Комплектация</label>
          <textarea id="editPackage" rows="3"></textarea>
          <label>Изображение (оставьте пустым, чтобы не менять)</label>
          <input type="file" id="editImage" accept="image/*" />
          <div>
            <button type="submit">Сохранить изменения</button>
            <button type="button" class="cancel-btn" id="cancelEdit">Отмена</button>
          </div>
        </form>
        <div id="editResult"></div>
      </div>
    </div>

    <script>
      // Получение данных товара и открытие формы
      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const res = await fetch('/api/products/' + id);
          const product = await res.json();
          document.getElementById('editId').value = product.id;
          document.getElementById('editModel').value = product.model;
          document.getElementById('editPower').value = product.power;
          document.getElementById('editDescription').value = product.description;
          document.getElementById('editPrice1').value = product.price1;
          document.getElementById('editPrice2').value = product.price2;
          document.getElementById('editPrice3').value = product.price3;
          document.getElementById('editPrice4').value = product.price4;
          document.getElementById('editPackage').value = product.package || '';
          document.getElementById('editImage').value = '';
          document.getElementById('editResult').innerHTML = '';
          document.getElementById('editFormContainer').classList.add('active');
          window.scrollTo({ top: document.getElementById('editFormContainer').offsetTop - 20, behavior: 'smooth' });
        });
      });

      // Отмена редактирования
      document.getElementById('cancelEdit').addEventListener('click', () => {
        document.getElementById('editFormContainer').classList.remove('active');
      });

      // Отправка формы
      document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const formData = new FormData();
        formData.append('model', document.getElementById('editModel').value);
        formData.append('power', document.getElementById('editPower').value);
        formData.append('description', document.getElementById('editDescription').value);
        formData.append('price1', document.getElementById('editPrice1').value);
        formData.append('price2', document.getElementById('editPrice2').value);
        formData.append('price3', document.getElementById('editPrice3').value);
        formData.append('price4', document.getElementById('editPrice4').value);
        formData.append('package', document.getElementById('editPackage').value);
        const imageFile = document.getElementById('editImage').files[0];
        if (imageFile) {
          formData.append('image', imageFile);
        }

        const resultDiv = document.getElementById('editResult');
        resultDiv.innerHTML = '⏳ Сохранение...';
        try {
          const response = await fetch('/api/admin/products/' + id, {
            method: 'PUT',
            headers: {
              'x-api-key': '${process.env.ADMIN_API_KEY}'
            },
            body: formData
          });
          if (response.ok) {
            resultDiv.innerHTML = '✅ Товар обновлён! Страница будет перезагружена...';
            resultDiv.className = 'success';
            setTimeout(() => location.reload(), 1500);
          } else {
            const text = await response.text();
            resultDiv.innerHTML = '❌ Ошибка: ' + text;
            resultDiv.className = 'error';
          }
        } catch (err) {
          resultDiv.innerHTML = '❌ Ошибка сети: ' + err.message;
          resultDiv.className = 'error';
        }
      });
    </script>
    </body>
    </html>
    `;
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка загрузки страницы');
  }
});

export default router;
