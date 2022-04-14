import express from 'express';
import { unregProductInStock } from '../controller/business_stock.controller.js';

const businessStockRoutes = express.Router();

businessStockRoutes.route('/:id')
  .get(unregProductInStock)

export default businessStockRoutes;