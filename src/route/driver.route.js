import express from 'express';
import { createDriver, updateDriver, getPagedDrivers, getDriver, deleteDriver, completeClientOrder } from '../controller/driver.controller.js';

const driverRoutes = express.Router();

driverRoutes.route('/')
  .get(getPagedDrivers) // Tested
  .post(createDriver); // Tested

driverRoutes.route('/:id')
  .get(getDriver) // Tested
  .put(updateDriver) // Tested
  .delete(deleteDriver); //  Tested

driverRoutes.route('/:id/delivery/:clientOrderId')
  .post(completeClientOrder); // Tested

export default driverRoutes;