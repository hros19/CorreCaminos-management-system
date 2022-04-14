import express from 'express';
import { createProduct, getPagedProducts, getProduct, updateProduct, deleteProduct } from '../controller/product.controller.js';

const productRoutes = express.Router();

productRoutes.route('/')
  .get(getPagedProducts) // Paginated
  .post(createProduct);

productRoutes.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

export default productRoutes;