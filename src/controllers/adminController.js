import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import path from 'path';
import fs from 'fs';

export const getAdminProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка получения товаров' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { model, power, description, price1, price2, price3, price4, package: packageContent } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: {
        model,
        power,
        description,
        price1: parseFloat(price1),
        price2: parseFloat(price2),
        price3: parseFloat(price3),
        price4: parseFloat(price4),
        package: packageContent,
        imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка создания товара' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { model, power, description, price1, price2, price3, price4, package: packageContent } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Товар не найден' });

    let imageUrl = existing.imageUrl;
    if (req.file) {
      // Удаляем старое изображение, только если оно существует
      if (existing.imageUrl) {
        const oldPath = path.join(process.cwd(), 'src', existing.imageUrl);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) {}
        }
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        model,
        power,
        description,
        price1: parseFloat(price1),
        price2: parseFloat(price2),
        price3: parseFloat(price3),
        price4: parseFloat(price4),
        package: packageContent,
        imageUrl,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка обновления товара' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Товар не найден' });

    if (existing.imageUrl) {
      const oldPath = path.join(process.cwd(), 'src', existing.imageUrl);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка удаления товара' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['new', 'processing', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
};
