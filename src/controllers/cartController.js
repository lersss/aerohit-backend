import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCart = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєРѕСЂР·РёРЅС‹' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'РќРµРІРµСЂРЅС‹Рµ РґР°РЅРЅС‹Рµ' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });
    if (!product) return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });

    const existing = await prisma.cartItem.findUnique({
      where: {
        sessionId_productId: {
          sessionId,
          productId: parseInt(productId),
        },
      },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      });
      return res.json(updated);
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          sessionId,
          productId: parseInt(productId),
          quantity,
        },
        include: { product: true },
      });
      return res.json(newItem);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РґРѕР±Р°РІР»РµРЅРёСЏ РІ РєРѕСЂР·РёРЅСѓ' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const { id } = req.params;
    const item = await prisma.cartItem.findFirst({
      where: { id: parseInt(id), sessionId },
    });
    if (!item) return res.status(404).json({ error: 'РџРѕР·РёС†РёСЏ РЅРµ РЅР°Р№РґРµРЅР°' });

    await prisma.cartItem.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    await prisma.cartItem.deleteMany({ where: { sessionId } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РѕС‡РёСЃС‚РєРё РєРѕСЂР·РёРЅС‹' });
  }
};
