import express from 'express';
import { createSupplier, updateSupplier, deleteSupplier, getPagedSuppliers, getSupplier, getProductsBySupplier, getOrdersBySupplier } from '../controller/supplier.controller.js';

const supplierRoutes = express.Router();

supplierRoutes.route('/')
  .get(getPagedSuppliers) // parameter, order, pag, limit
  .post(createSupplier); // name, address, phone, email, haveDelivery (YES/NO)

supplierRoutes.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

supplierRoutes.route('/:id/products')
  .get(getProductsBySupplier);

supplierRoutes.route('/:id/orders')
  .get(getOrdersBySupplier);


export default supplierRoutes;