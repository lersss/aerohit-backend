import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/orders', async (req, res) => {
  try {
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Заказы</title>
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
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    h1 a {
      font-size: 16px;
      color: #2563eb;
      text-decoration: underline;
      font-weight: 500;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
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
    .btn-primary:hover { background: #1d4ed8; }
    .btn-success { background: #22c55e; color: #fff; }
    .btn-success:hover { background: #16a34a; }
    .btn-warning { background: #f59e0b; color: #fff; }
    .btn-warning:hover { background: #d97706; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    .btn-sm { padding: 4px 12px; font-size: 12px; }
    .filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .filter-bar select, .filter-bar input {
      padding: 8px 14px;
      border: 2px solid #e2e8f0;
      border-radius: 30px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
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
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-new { background: #dbeafe; color: #1e40af; }
    .status-processing { background: #fef3c7; color: #92400e; }
    .status-done { background: #dcfce7; color: #166534; }
    .order-items {
      font-size: 13px;
      color: #475569;
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
      .container { padding: 15px; }
      table { font-size: 13px; }
      th, td { padding: 8px; }
    }
  </style>
</head>
<body>
<div class="container">
  <h1>
    📦 Заказы
    <a href="/admin/dashboard">🛠️ Товары</a>
  </h1>

  <div class="api-key-form" id="apiKeyForm">
    <label for="apiKeyInput">API-ключ:</label>
    <input type="password" id="apiKeyInput" placeholder="Введите ваш API-ключ" />
    <button class="btn btn-primary" id="setApiKeyBtn">Применить</button>
    <span id="apiKeyStatus" style="font-size:14px; color:#475569;"></span>
  </div>

  <div id="mainContent" style="display:none;">
    <div class="top-bar">
      <div class="filter-bar">
        <select id="statusFilter">
          <option value="all">Все статусы</option>
          <option value="new">Новый</option>
          <option value="processing">В обработке</option>
          <option value="done">Готово</option>
        </select>
        <input type="text" id="searchInput" placeholder="Поиск по имени, телефону, email" />
        <button class="btn btn-primary" id="applyFilterBtn">Применить</button>
      </div>
      <button class="btn btn-primary" id="refreshBtn">🔄 Обновить</button>
    </div>

    <div id="ordersList">
      <p>Загрузка заказов...</p>
    </div>
  </div>
</div>

<script>
  let API_KEY = localStorage.getItem('adminApiKey') || '';

  document.getElementById('setApiKeyBtn').addEventListener('click', () => {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    if (key) {
      API_KEY = key;
      localStorage.setItem('adminApiKey', key);
      document.getElementById('apiKeyStatus').textContent = '✅ Ключ установлен';
      document.getElementById('mainContent').style.display = 'block';
      loadOrders();
    } else {
      alert('Введите ключ');
    }
  });

  if (API_KEY) {
    document.getElementById('apiKeyInput').value = API_KEY;
    document.getElementById('apiKeyStatus').textContent = '✅ Ключ загружен';
    document.getElementById('mainContent').style.display = 'block';
  }

  async function loadOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const search = document.getElementById('searchInput').value.trim();

    const container = document.getElementById('ordersList');
    container.innerHTML = '⏳ Загрузка...';

    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-api-key': API_KEY }
      });
      if (!res.ok) throw new Error('Ошибка загрузки заказов');
      let orders = await res.json();

      if (statusFilter !== 'all') {
        orders = orders.filter(o => o.status === statusFilter);
      }

      if (search) {
        const s = search.toLowerCase();
        orders = orders.filter(o =>
          o.name.toLowerCase().includes(s) ||
          o.phone.includes(s) ||
          o.email.toLowerCase().includes(s)
        );
      }

      if (orders.length === 0) {
        container.innerHTML = '<p>Заказов не найдено.</p>';
        return;
      }

      let html = '<table><thead><tr><th>ID</th><th>Клиент</th><th>Товары</th><th>Сумма</th><th>Статус</th><th>Дата</th><th>Действия</th></tr></thead><tbody>';
      orders.forEach(o => {
        var itemsList = o.items.map(function(item) {
          return item.product.model + ' (' + item.quantity + ' шт.)';
        }).join(', ');

        var statusClass = 'status-' + o.status;
        var statusLabels = { new: 'Новый', processing: 'В обработке', done: 'Готово' };
        html += '<tr>' +
          '<td>' + o.id + '</td>' +
          '<td><strong>' + o.name + '</strong><br><small>' + o.phone + '<br>' + o.email + '</small></td>' +
          '<td class="order-items">' + itemsList + '</td>' +
          '<td>' + o.total + ' ₽</td>' +
          '<td><span class="status-badge ' + statusClass + '">' + statusLabels[o.status] + '</span></td>' +
          '<td>' + new Date(o.createdAt).toLocaleDateString() + ' ' + new Date(o.createdAt).toLocaleTimeString() + '</td>' +
          '<td>' +
            '<button class="btn btn-warning btn-sm status-btn" data-id="' + o.id + '" data-status="processing">В обработку</button> ' +
            '<button class="btn btn-success btn-sm status-btn" data-id="' + o.id + '" data-status="done">Готово</button>' +
          '</td>' +
        '</tr>';
      });
      html += '</tbody></table>';
      container.innerHTML = html;

      document.querySelectorAll('.status-btn').forEach(function(btn) {
        btn.addEventListener('click', async function() {
          var id = this.dataset.id;
          var status = this.dataset.status;
          if (!confirm('Изменить статус заказа #' + id + ' на "' + status + '"?')) return;
          try {
            var res = await fetch('/api/admin/orders/' + id, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
              },
              body: JSON.stringify({ status: status })
            });
            if (res.ok) {
              alert('✅ Статус обновлён');
              loadOrders();
            } else {
              alert('❌ Ошибка обновления');
            }
          } catch (err) {
            alert('❌ Ошибка сети');
          }
        });
      });
    } catch (err) {
      container.innerHTML = '<p class="error">❌ Ошибка загрузки: ' + err.message + '</p>';
    }
  }

  document.getElementById('applyFilterBtn').addEventListener('click', loadOrders);
  document.getElementById('refreshBtn').addEventListener('click', loadOrders);

  if (API_KEY) {
    loadOrders();
  }
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
