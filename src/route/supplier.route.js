import express from 'express';
import { createSupplier, updateSupplier, deleteSupplier, getPagedSuppliers, getSupplier, getProductsBySupplier } from '../controller/supplier.controller';

const supplierRoutes = express.Router();

supplierRoutes.route('/')
  .get(getPagedSuppliers)
  .post(createSupplier);

supplierRoutes.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);
supplierRoutes.route('/:id/products')
  .get(getProductsBySupplier);

export default supplierRoutes;