import express from 'express';
import { getPagedDevDays, selectDevDay, updateDevDay, deleteDevDay } from '../controller/delivery.controller.js';
import { getPagedDevIntervals, getDevInterval } from '../controller/delivery.controller.js';

const deliveryRoutes = express.Router();

deliveryRoutes.route('/day')
  .get(getPagedDevDays);

deliveryRoutes.route('/day/:id')
  .get(selectDevDay)
  .put(updateDevDay)
  .delete(deleteDevDay);

deliveryRoutes.route('/interval')
  .get(getPagedDevIntervals);

deliveryRoutes.route('/interval/:id')
  .get(getDevInterval);


export default deliveryRoutes;