import express from 'express';
import { createSupplier, updateSupplier, deleteSupplier, getPagedSuppliers, getSupplier } from '../controller/supplier.controller';

const supplierRoutes = express.Router();

supplierRoutes.route('/')
  .get(getPagedSuppliers)
  .post(createSupplier);

supplierRoutes.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

export default supplierRoutes;