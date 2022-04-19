import express from 'express';
import { getPendingReportsByDate } from '../controller/report.controller.js';

const reportRoutes = express.Router();

reportRoutes.route('/')
  .get(getPendingReportsByDate);

export default reportRoutes;