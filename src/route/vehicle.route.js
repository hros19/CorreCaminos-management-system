import express from 'express';
import { checkVehicleStatus, fillVehicleTank, createVehicle, getPagedVehicles, getVehicle, updateVehicle, deleteVehicle, registerKilometers } from '../controller/vehicle.controller.js';

const vehicleRoutes = express.Router();

vehicleRoutes.route('/')
  .get(getPagedVehicles) // Paginated
  .post(createVehicle); // Create

vehicleRoutes.route('/:id')
  .get(getVehicle)
  .put(updateVehicle)
  .delete(deleteVehicle);

vehicleRoutes.route('/:id/status')
  .get(checkVehicleStatus); // Paginated

vehicleRoutes.route('/:id/fillTank')
  .put(fillVehicleTank); // id, gasAmount

vehicleRoutes.route('/:id/registerKilometers')
  .put(registerKilometers); // id, kilometers

export default vehicleRoutes;