import express from 'express';
import { getPagedProductsInStock, getProdInStock, registerProductInStock } from '../controller/business_stock.controller.js';
import { fillProductsInStock, unregProductInStock, deleteProductInStock } from '../controller/business_stock.controller.js';

const businessStockRoutes = express.Router();

businessStockRoutes.route('/')
  .get(getPagedProductsInStock) // Tested
  .post(fillProductsInStock); // Tested

businessStockRoutes.route('/:id')
  .get(getProdInStock) // Tested
  .delete(deleteProductInStock) // Tested
  .put(unregProductInStock) // Tested
  .post(registerProductInStock); // Tested

export default businessStockRoutes;