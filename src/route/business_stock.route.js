import express from 'express';
import { getPagedProductsInStock, getProdInStock, registerProductInStock } from '../controller/business_stock.controller.js';
import { fillProductsInStock, unregProductInStock, deleteProductInStock } from '../controller/business_stock.controller.js';

const businessStockRoutes = express.Router();

businessStockRoutes.route('/')
  .get(getPagedProductsInStock) // Paginated
  .post(fillProductsInStock); // { product_id, amount }

businessStockRoutes.route('/:id')
  .get(getProdInStock)
  .delete(deleteProductInStock)
  .put(unregProductInStock)
  .post(registerProductInStock); // { product_id, amount }


export default businessStockRoutes;