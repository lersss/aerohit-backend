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
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ С‚РѕРІР°СЂРѕРІ' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { model, power, description, price1, price2, price3, price4, package } = req.body;
    const imageUrl = req.file ? /uploads/ : null;

    const product = await prisma.product.create({
      data: {
        model,
        power,
        description,
        price1: parseFloat(price1),
        price2: parseFloat(price2),
        price3: parseFloat(price3),
        price4: parseFloat(price4),
        package,
        imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ С‚РѕРІР°СЂР°' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { model, power, description, price1, price2, price3, price4, package } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });

    let imageUrl = existing.imageUrl;
    if (req.file) {
      if (existing.imageUrl) {
        const oldPath = path.join(process.cwd(), 'src', existing.imageUrl);
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
      imageUrl = /uploads/;
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
        package,
        imageUrl,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ С‚РѕРІР°СЂР°' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });

    if (existing.imageUrl) {
      const oldPath = path.join(process.cwd(), 'src', existing.imageUrl);
      try { fs.unlinkSync(oldPath); } catch (e) {}
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ С‚РѕРІР°СЂР°' });
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
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°РєР°Р·РѕРІ' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['new', 'processing', 'done'].includes(status)) {
      return res.status(400).json({ error: 'РќРµРґРѕРїСѓСЃС‚РёРјС‹Р№ СЃС‚Р°С‚СѓСЃ' });
    }
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ СЃС‚Р°С‚СѓСЃР°' });
  }
};
