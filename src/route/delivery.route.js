import express from 'express';
import { getPagedDevDays, selectDevDay, updateDevDay, deleteDevDay } from '../controller/delivery.controller.js';
import { getPagedDevIntervals, getDevInterval } from '../controller/delivery.controller.js';

const deliveryRoutes = express.Router();

deliveryRoutes.route('/day')
  .get(getPagedDevDays); // tested

deliveryRoutes.route('/day/:id')
  .get(selectDevDay) // tested

deliveryRoutes.route('/interval')
  .get(getPagedDevIntervals); // tested

deliveryRoutes.route('/interval/:id')
  .get(getDevInterval); // tested


export default deliveryRoutes;