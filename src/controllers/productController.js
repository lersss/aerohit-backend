import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ С‚РѕРІР°СЂРѕРІ' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ С‚РѕРІР°СЂР°' });
  }
};
