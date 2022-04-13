import express from 'express';
import { createZone, getZone, getPagedZones, updateZone, deleteZone } from '../controller/zone.controler.js';
import { createRoute, getRoute, getPagedRoutes, updateRoute, deleteRoute } from '../controller/zone.controller.js';
import { createZoneXRoute, getPagedZoneRoutes, deleteZoneXRoute } from '../controller/zone.controller.js';

const zoneRoutes = express.Router();

//Properly zone routes
zoneRoutes.route('/')
  .get(getPagedZones) // Paginated
  .post(createZone)

zoneRoutes.route('/:id')
  .get(getZone)
  .put(updateZone)
  .delete(deleteZone);

//Route routes XD
zoneRoutes.route('/route')
  .get(getPagedRoutes) // Paginated
  .post(createRoute);

zoneRoutes.route('/route/:route_id')
  .get(getRoute)
  .put(updateRoute)
  .delete(deleteRoute)

zoneRoutes.route('/:id/route')
  .get(getPagedZoneRoutes);

//ZoneXRoute routes
zoneRoutes.route('/:id/route/:route_id')
  .post(createZoneXRoute)
  .delete(deleteZoneXRoute);

export default zoneRoutes;