import express from 'express';
import { checkVehicleStatus, fillVehicleTank, createVehicle, getPagedVehicles, getMaintenanceLogsOfVehicle, deleteMaintenanceLog, getMaintenanceLog } from '../controller/vehicle.controller.js';
import { getVehicle, updateVehicle, deleteVehicle, registerKilometers, updateMaintenenaceLog, registerMaintenanceLog } from '../controller/vehicle.controller.js';


const vehicleRoutes = express.Router();

vehicleRoutes.route('/')
  .get(getPagedVehicles) // Paginated
  .post(createVehicle); // Create

vehicleRoutes.route('/:id')
  .get(getVehicle)
  .put(updateVehicle)
  .delete(deleteVehicle);

vehicleRoutes.route('/:id/status')
  .get(checkVehicleStatus);

vehicleRoutes.route('/:id/fillTank')
  .put(fillVehicleTank); // id, gasAmount

vehicleRoutes.route('/:id/registerKilometers')
  .put(registerKilometers); // id, kilometers

vehicleRoutes.route('/:id/registerMaintenance')
  .post(registerMaintenanceLog); // status

vehicleRoutes.route('/:id/maintenances')
  .get(getMaintenanceLogsOfVehicle); // id, page, limit

vehicleRoutes.route('/maintenance/:id')
  .get(getMaintenanceLog)
  .put(updateMaintenenaceLog) // maintenance_id, status
  .delete(deleteMaintenanceLog);

export default vehicleRoutes;