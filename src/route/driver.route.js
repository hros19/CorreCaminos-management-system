import express from 'express';
import { createDriver, updateDriver, getPagedDrivers, getDriver, deleteDriver } from '../controller/driver.controller.js';

const driverRoutes = express.Router();

driverRoutes.route('/')
  .get(getPagedDrivers) // Paginated
  .post(createDriver);

driverRoutes.route('/:id')
  .get(getDriver)
  .put(updateDriver)
  .delete(deleteDriver);

export default driverRoutes;