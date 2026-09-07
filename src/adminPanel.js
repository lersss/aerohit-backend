import express from 'express';

const router = express.Router();

// Админ-панель — HTML-форма для добавления товаров
router.get('/panel', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Админ-панель</title>
            <style>
                body { font-family: Arial; max-width: 600px; margin: 40px auto; padding: 20px; background: #f4f4f4; }
                form { background: #fff; padding: 20px; border-radius: 8px; }
                label { display: block; margin-top: 12px; font-weight: bold; }
                input, textarea { width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                button { margin-top: 20px; padding: 10px 20px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
                #result { margin-top: 20px; padding: 10px; border-radius: 4px; display: none; }
                .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
                .container { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .api-key-input { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; }
                .api-key-input input { flex: 1; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>➕ Добавить товар</h2>
                <div class="api-key-input">
                    <label style="margin:0;">API-ключ:</label>
                    <input type="text" id="apiKey" placeholder="Введите ваш ADMIN_API_KEY" value="Ien1iek5be">
                    <button id="setKeyBtn" type="button" style="margin:0; padding:8px 16px;">Применить</button>
                </div>
                <div id="statusMsg" class="info" style="display:block; margin-bottom:15px;">Введите API-ключ и нажмите «Применить»</div>
                <form id="productForm">
                    <label>Модель (обязательно):</label>
                    <input type="text" id="model" required>

                    <label>Мощность:</label>
                    <input type="text" id="power" placeholder="например: 363W">

                    <label>Описание (характеристики):</label>
                    <textarea id="description" rows="4"></textarea>

                    <label>Цена ≤5 шт:</label>
                    <input type="number" step="0.01" id="price1" required>

                    <label>Цена ≤200 шт:</label>
                    <input type="number" step="0.01" id="price2" required>

                    <label>Цена ≤500 шт:</label>
                    <input type="number" step="0.01" id="price3" required>

                    <label>Цена ≥501 шт:</label>
                    <input type="number" step="0.01" id="price4" required>

                    <label>Комплектация:</label>
                    <textarea id="package" rows="3"></textarea>

                    <button type="submit">➕ Добавить товар</button>
                </form>
                <div id="result"></div>
            </div>

            <script>
                let currentApiKey = '';

                document.getElementById('setKeyBtn').addEventListener('click', () => {
                    currentApiKey = document.getElementById('apiKey').value.trim();
                    if (currentApiKey) {
                        document.getElementById('statusMsg').textContent = '✅ API-ключ установлен';
                        document.getElementById('statusMsg').className = 'success';
                    } else {
                        document.getElementById('statusMsg').textContent = '❌ API-ключ не может быть пустым';
                        document.getElementById('statusMsg').className = 'error';
                    }
                });

                document.getElementById('productForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (!currentApiKey) {
                        alert('Сначала установите API-ключ!');
                        return;
                    }

                    const data = {
                        model: document.getElementById('model').value.trim(),
                        power: document.getElementById('power').value.trim(),
                        description: document.getElementById('description').value.trim(),
                        price1: parseFloat(document.getElementById('price1').value),
                        price2: parseFloat(document.getElementById('price2').value),
                        price3: parseFloat(document.getElementById('price3').value),
                        price4: parseFloat(document.getElementById('price4').value),
                        package: document.getElementById('package').value.trim()
                    };

                    const resultDiv = document.getElementById('result');

                    try {
                        const res = await fetch('/api/admin/products', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': currentApiKey
                            },
                            body: JSON.stringify(data)
                        });

                        if (res.ok) {
                            resultDiv.textContent = '✅ Товар успешно добавлен!';
                            resultDiv.className = 'success';
                            resultDiv.style.display = 'block';
                            document.getElementById('productForm').reset();
                        } else {
                            const text = await res.text();
                            resultDiv.textContent = '❌ Ошибка: ' + text;
                            resultDiv.className = 'error';
                            resultDiv.style.display = 'block';
                        }
                    } catch (err) {
                        resultDiv.textContent = '❌ Ошибка сети: ' + err.message;
                        resultDiv.className = 'error';
                        resultDiv.style.display = 'block';
                    }
                });
            </script>
        </body>
        </html>
    `);
});

export default router;
