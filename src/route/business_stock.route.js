import express from 'express';
import { fillProductsInStock } from '../controller/business_stock.controller.js';

const businessStockRoutes = express.Router();

businessStockRoutes.route('/fillProducts')
  .get(fillProductsInStock)

export default businessStockRoutes;