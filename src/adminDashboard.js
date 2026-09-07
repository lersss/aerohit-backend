import express from 'express';
import { PrismaClient } from '@prisma/client';
import upload from './middleware/upload.js';

const router = express.Router();
const prisma = new PrismaClient();

// Главная админ-панель (без middleware, ключ запрашивается на странице)
router.get('/dashboard', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { model: 'asc' }
    });

    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Админ-панель</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f1f5f9;
      padding: 20px;
    }
    .container {
      max-width: 1300px;
      margin: 0 auto;
      background: #fff;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #0f172a;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 10px;
      <a href="/admin/orders" target="_blank" style="color:#2563eb; text-decoration:underline; font-size:14px;">📦 Заказы</a>
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 30px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary { background: #2563eb; color: #fff; }
    .btn-primary:hover { background: #1d4ed8; transform: scale(1.02); }
    .btn-success { background: #22c55e; color: #fff; }
    .btn-success:hover { background: #16a34a; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    .btn-warning { background: #f59e0b; color: #fff; }
    .btn-warning:hover { background: #d97706; }
    .btn-sm { padding: 6px 14px; font-size: 12px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 12px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #475569;
    }
    tr:hover { background: #f8fafc; }
    .product-img {
      max-width: 50px;
      max-height: 50px;
      object-fit: contain;
      border-radius: 4px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .form-container {
      display: none;
      margin-top: 30px;
      padding: 25px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .form-container.active { display: block; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 4px;
      color: #0f172a;
    }
    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid #e2e8f0;
      border-radius: 30px;
      font-size: 14px;
      transition: border 0.2s;
    }
    .form-group input:focus,
    .form-group textarea:focus {
      border-color: #2563eb;
      outline: none;
    }
    .form-group textarea {
      border-radius: 16px;
      resize: vertical;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .message {
      margin-top: 15px;
      padding: 12px 18px;
      border-radius: 8px;
      display: none;
    }
    .message.success { display: block; background: #dcfce7; color: #166534; }
    .message.error { display: block; background: #fee2e2; color: #991b1b; }
    .image-upload-form {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .image-upload-form input[type="file"] {
      max-width: 120px;
      padding: 4px;
      font-size: 12px;
    }
    .api-key-form {
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    .api-key-form label { font-weight: 600; }
    .api-key-form input {
      padding: 10px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 30px;
      flex: 1;
      min-width: 200px;
    }
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .container { padding: 15px; }
      table { font-size: 13px; }
      th, td { padding: 8px; }
      .actions { flex-direction: column; gap: 4px; }
    }
  </style>
</head>
<body>
<div class="container">
  <h1>🛠️ Админ-панель</h1>

  <div class="api-key-form" id="apiKeyForm">
    <label for="apiKeyInput">API-ключ:</label>
    <input type="password" id="apiKeyInput" placeholder="Введите ваш API-ключ" />
    <button class="btn btn-primary" id="setApiKeyBtn">Применить</button>
    <span id="apiKeyStatus" style="font-size:14px; color:#475569;"></span>
  </div>

  <div id="mainContent" style="display:none;">
    <div class="top-bar">
      <button id="showAddForm" class="btn btn-primary">➕ Добавить товар</button>
      <a href="/admin/panel" target="_blank" style="color:#2563eb; text-decoration:underline; font-size:14px;">Старая форма добавления</a>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Модель</th>
          <th>Мощность</th>
          <th>Цена (≤5)</th>
          <th>Изображение</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr data-id="${p.id}">
            <td>${p.id}</td>
            <td><strong>${p.model}</strong></td>
            <td>${p.power}</td>
            <td>${p.price1} ₽</td>
            <td>
              ${p.imageUrl ? `<img src="${p.imageUrl}" class="product-img" />` : '—'}
            </td>
            <td>
              <div class="actions">
                <button class="btn btn-warning btn-sm edit-btn" data-id="${p.id}">✏️</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${p.id}">🗑️</button>
                <form class="image-upload-form" data-id="${p.id}">
                  <input type="file" name="image" accept="image/*" />
                  <button type="submit" class="btn btn-primary btn-sm">📤</button>
                </form>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div id="formContainer" class="form-container">
      <h2 id="formTitle">Добавить товар</h2>
      <form id="productForm" enctype="multipart/form-data">
        <input type="hidden" id="editId" />
        <div class="form-row">
          <div class="form-group">
            <label>Модель *</label>
            <input type="text" id="model" required />
          </div>
          <div class="form-group">
            <label>Мощность</label>
            <input type="text" id="power" />
          </div>
        </div>
        <div class="form-group">
          <label>Описание</label>
          <textarea id="description" rows="4"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Цена (≤5 шт) *</label>
            <input type="number" step="0.01" id="price1" required />
          </div>
          <div class="form-group">
            <label>Цена (≤200 шт) *</label>
            <input type="number" step="0.01" id="price2" required />
          </div>
          <div class="form-group">
            <label>Цена (≤500 шт) *</label>
            <input type="number" step="0.01" id="price3" required />
          </div>
          <div class="form-group">
            <label>Цена (≥501 шт) *</label>
            <input type="number" step="0.01" id="price4" required />
          </div>
        </div>
        <div class="form-group">
          <label>Комплектация</label>
          <textarea id="package" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Изображение (оставьте пустым, если не меняете)</label>
          <input type="file" id="image" accept="image/*" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-success" id="submitBtn">Сохранить</button>
          <button type="button" class="btn btn-danger" id="cancelForm">Отмена</button>
        </div>
        <div id="formMessage" class="message"></div>
      </form>
    </div>
  </div>
</div>

<script>
  let API_KEY = localStorage.getItem('adminApiKey') || '';

  // Установка ключа
  document.getElementById('setApiKeyBtn').addEventListener('click', () => {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    if (key) {
      API_KEY = key;
      localStorage.setItem('adminApiKey', key);
      document.getElementById('apiKeyStatus').textContent = '✅ Ключ установлен';
      document.getElementById('mainContent').style.display = 'block';
    } else {
      alert('Введите ключ');
    }
  });

  // Если ключ уже сохранён, показываем контент сразу
  if (API_KEY) {
    document.getElementById('apiKeyInput').value = API_KEY;
    document.getElementById('apiKeyStatus').textContent = '✅ Ключ загружен';
    document.getElementById('mainContent').style.display = 'block';
  }

  // Остальной код управления товарами (работает с API_KEY)
  const container = document.getElementById('formContainer');
  const form = document.getElementById('productForm');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelForm');
  const msgDiv = document.getElementById('formMessage');

  document.getElementById('showAddForm').addEventListener('click', () => {
    if (!API_KEY) return alert('Сначала установите API-ключ');
    form.reset();
    document.getElementById('editId').value = '';
    formTitle.textContent = '➕ Добавить товар';
    submitBtn.textContent = 'Добавить';
    container.classList.add('active');
    msgDiv.className = 'message';
    msgDiv.style.display = 'none';
    window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
  });

  cancelBtn.addEventListener('click', () => {
    container.classList.remove('active');
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!API_KEY) return alert('Сначала установите API-ключ');
      const id = btn.dataset.id;
      const res = await fetch('/api/products/' + id);
      const p = await res.json();
      document.getElementById('editId').value = p.id;
      document.getElementById('model').value = p.model;
      document.getElementById('power').value = p.power;
      document.getElementById('description').value = p.description;
      document.getElementById('price1').value = p.price1;
      document.getElementById('price2').value = p.price2;
      document.getElementById('price3').value = p.price3;
      document.getElementById('price4').value = p.price4;
      document.getElementById('package').value = p.package || '';
      document.getElementById('image').value = '';
      formTitle.textContent = '✏️ Редактировать товар';
      submitBtn.textContent = 'Обновить';
      container.classList.add('active');
      msgDiv.className = 'message';
      msgDiv.style.display = 'none';
      window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!API_KEY) return alert('Сначала установите API-ключ');
    const id = document.getElementById('editId').value;
    const formData = new FormData();
    formData.append('model', document.getElementById('model').value);
    formData.append('power', document.getElementById('power').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('price1', document.getElementById('price1').value);
    formData.append('price2', document.getElementById('price2').value);
    formData.append('price3', document.getElementById('price3').value);
    formData.append('price4', document.getElementById('price4').value);
    formData.append('package', document.getElementById('package').value);
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) formData.append('image', imageFile);

    const url = id ? '/api/admin/products/' + id : '/api/admin/products';
    const method = id ? 'PUT' : 'POST';

    msgDiv.className = 'message';
    msgDiv.style.display = 'block';
    msgDiv.textContent = '⏳ Сохранение...';
    msgDiv.style.background = '#f1f5f9';
    msgDiv.style.color = '#0f172a';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'x-api-key': API_KEY },
        body: formData
      });
      if (res.ok) {
        msgDiv.textContent = '✅ Успешно сохранено! Перезагрузка...';
        msgDiv.className = 'message success';
        setTimeout(() => location.reload(), 1500);
      } else {
        const text = await res.text();
        msgDiv.textContent = '❌ Ошибка: ' + text;
        msgDiv.className = 'message error';
      }
    } catch (err) {
      msgDiv.textContent = '❌ Ошибка сети: ' + err.message;
      msgDiv.className = 'message error';
    }
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!API_KEY) return alert('Сначала установите API-ключ');
      const id = btn.dataset.id;
      if (!confirm('Удалить товар?')) return;
      try {
        const res = await fetch('/api/admin/products/' + id, {
          method: 'DELETE',
          headers: { 'x-api-key': API_KEY }
        });
        if (res.ok) {
          alert('✅ Товар удалён');
          location.reload();
        } else {
          alert('❌ Ошибка удаления');
        }
      } catch (err) {
        alert('❌ Ошибка сети');
      }
    });
  });

  document.querySelectorAll('.image-upload-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!API_KEY) return alert('Сначала установите API-ключ');
      const id = form.dataset.id;
      const fileInput = form.querySelector('input[type="file"]');
      const file = fileInput.files[0];
      if (!file) return alert('Выберите файл');
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch('/api/admin/products/' + id, {
          method: 'PUT',
          headers: { 'x-api-key': API_KEY },
          body: formData
        });
        if (res.ok) {
          alert('✅ Изображение загружено');
          location.reload();
        } else {
          alert('❌ Ошибка загрузки');
        }
      } catch (err) {
        alert('❌ Ошибка сети');
      }
    });
  });
</script>
</body>
</html>
    `;
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка загрузки панели');
  }
});

export default router;
