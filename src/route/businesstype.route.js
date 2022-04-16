import express from 'express';
import { createBusinessType, getPagedBusinessTypes, getBusinessType, updateBusinesstype, deleteBusinessType } from '../controller/businesstype.controller.js';

const businesstypeRoute = express.Router();

businesstypeRoute.route('/')
  .get(getPagedBusinessTypes) // tested
  .post(createBusinessType); // tested

businesstypeRoute.route('/:id')
  .get(getBusinessType) // tested
  .put(updateBusinesstype) // tested
  .delete(deleteBusinessType); // tested

export default businesstypeRoute;