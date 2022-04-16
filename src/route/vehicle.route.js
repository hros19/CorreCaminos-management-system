import express from 'express';
import { checkVehicleStatus, fillVehicleTank, createVehicle, getPagedVehicles, getMaintenanceLogsOfVehicle, deleteMaintenanceLog, getMaintenanceLog } from '../controller/vehicle.controller.js';
import { getVehicle, updateVehicle, deleteVehicle, registerKilometers, updateMaintenenaceLog, registerMaintenanceLog } from '../controller/vehicle.controller.js';


const vehicleRoutes = express.Router();

vehicleRoutes.route('/')
  .get(getPagedVehicles) // Tested
  .post(createVehicle); // Tested

vehicleRoutes.route('/:id')
  .get(getVehicle) // Tested
  .put(updateVehicle) // Tested
  .delete(deleteVehicle); // Tested

vehicleRoutes.route('/:id/status')
  .get(checkVehicleStatus); // Tested

vehicleRoutes.route('/:id/fillTank')
  .put(fillVehicleTank); // Tested

vehicleRoutes.route('/:id/registerKilometers')
  .put(registerKilometers); // Tested

vehicleRoutes.route('/:id/registerMaintenance')
  .post(registerMaintenanceLog); // Tested

vehicleRoutes.route('/:id/maintenances')
  .get(getMaintenanceLogsOfVehicle); // Tested

vehicleRoutes.route('/maintenance/:id')
  .get(getMaintenanceLog) // Tested
  .put(updateMaintenenaceLog) // Tested
  .delete(deleteMaintenanceLog); // Tested

export default vehicleRoutes;