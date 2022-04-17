import express from 'express';
import { createSupplier, updateSupplier, deleteSupplier, getPagedSuppliers, getSupplier, getProductsBySupplier, getOrdersBySupplier } from '../controller/supplier.controller.js';

const supplierRoutes = express.Router();

supplierRoutes.route('/')
  .get(getPagedSuppliers) // tested
  .post(createSupplier); // tested

supplierRoutes.route('/:id')
  .get(getSupplier) // tested
  .put(updateSupplier) // tested
  .delete(deleteSupplier); // tested

supplierRoutes.route('/:id/products')
  .get(getProductsBySupplier); // tested

supplierRoutes.route('/:id/orders')
  .get(getOrdersBySupplier); // tested


export default supplierRoutes;