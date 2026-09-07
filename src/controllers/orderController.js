import { PrismaClient } from '@prisma/client';
import generatePDF from '../utils/pdfGenerator.js';

const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const { name, phone, email, comment } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Р—Р°РїРѕР»РЅРёС‚Рµ РІСЃРµ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹Рµ РїРѕР»СЏ' });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'РљРѕСЂР·РёРЅР° РїСѓСЃС‚Р°' });
    }

    let total = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const p = item.product;
      const qty = item.quantity;
      let pricePerUnit;
      if (qty <= 5) pricePerUnit = p.price1;
      else if (qty <= 200) pricePerUnit = p.price2;
      else if (qty <= 500) pricePerUnit = p.price3;
      else pricePerUnit = p.price4;

      const sum = pricePerUnit * qty;
      total += sum;
      orderItemsData.push({
        productId: p.id,
        quantity: qty,
        price: pricePerUnit,
      });
    }

    const order = await prisma.order.create({
      data: {
        name,
        phone,
        email,
        comment,
        total,
        status: 'new',
        items: {
          create: orderItemsData,
        },
      },
      include: { items: { include: { product: true } } },
    });

    await prisma.cartItem.deleteMany({ where: { sessionId } });

    const pdfBuffer = await generatePDF(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order-${order.id}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕС„РѕСЂРјР»РµРЅРёСЏ Р·Р°РєР°Р·Р°' });
  }
};
