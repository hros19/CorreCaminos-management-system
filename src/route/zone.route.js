import express from 'express';
import { createZone, getZone, getPagedZones, updateZone, deleteZone } from '../controller/zone.controler.js'; 

const zoneRoutes = express.Router();

zoneRoutes.route('/')
  .get(getPagedZones) // Paginated
  .post(createZone)

zoneRoutes.route('/:id')
  .get(getZone)
  .put(updateZone)
  .delete(deleteZone);