import express from 'express';
import { createBusinessType, getPagedBusinessTypes, getBusinessType, updateBusinesstype, deleteBusinessType } from '../controller/businesstype.controller.js';

const businesstypeRoute = express.Router();

businesstypeRoute.route('/')
  .get(getPagedBusinessTypes) // Paginated
  .post(createBusinessType);

businesstypeRoute.route('/:id')
  .get(getBusinessType)
  .put(updateBusinesstype)
  .delete(deleteBusinessType);

export default businesstypeRoute;