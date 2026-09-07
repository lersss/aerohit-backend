import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  getOrders,
  updateOrderStatus
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(adminAuth);

router.get('/products', getAdminProducts);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);

export default router;
