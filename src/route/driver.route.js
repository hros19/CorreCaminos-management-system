import express from 'express';
import { createDriver, updateDriver, getPagedDrivers, getDriver, deleteDriver } from '../controller/driver.controller.js';

const driverRoutes = express.Router();

driverRoutes.route('/')
  .get(getPagedDrivers) // Tested
  .post(createDriver); // Tested

driverRoutes.route('/:id')
  .get(getDriver) // Tested
  .put(updateDriver) // Tested
  .delete(deleteDriver); //  Tested

export default driverRoutes;