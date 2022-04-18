import express from 'express';
import { createProduct, getPagedProducts, getProduct, updateProduct, deleteProduct } from '../controller/product.controller.js';

const productRoutes = express.Router();

productRoutes.route('/')
  .get(getPagedProducts) // Tested
  .post(createProduct); // Tested

productRoutes.route('/:id')
  .get(getProduct) // Tested
  .put(updateProduct) // Tested
  .delete(deleteProduct); // Tested

export default productRoutes;