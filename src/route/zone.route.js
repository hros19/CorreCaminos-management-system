import express from 'express';
import { createZone, getZone, getPagedZones, updateZone, deleteZone } from '../controller/zone.controller.js';
import { createRoute, getRoute, getPagedRoutes, updateRoute, deleteRoute } from '../controller/zone.controller.js';
import { createZoneXRoute, getPagedZoneRoutes, deleteZoneXRoute } from '../controller/zone.controller.js';

const zoneRoutes = express.Router();

//Properly zone routes
zoneRoutes.route('/')
  .get(getPagedZones) // tested
  .post(createZone) // tested

//Route routes XD
zoneRoutes.route('/route')
  .get(getPagedRoutes) // tested
  .post(createRoute); // tested

zoneRoutes.route('/route/:route_id')
  .get(getRoute) //tested
  .put(updateRoute) //tested
  .delete(deleteRoute) // tested

zoneRoutes.route('/:id')
  .get(getZone) // tested
  .put(updateZone) // tested
  .delete(deleteZone); // tested

zoneRoutes.route('/:id/route')
  .get(getPagedZoneRoutes); //tested

//ZoneXRoute routes
zoneRoutes.route('/:id/route/:route_id')
  .post(createZoneXRoute) // tested
  .delete(deleteZoneXRoute); //tested

export default zoneRoutes;