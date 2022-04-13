import express from 'express';
import { createJobTitle, getPagedJobTitles, updateJobTitle, getJobTitle, deleteJobTitle } from '../controller/jobtitle.controller.js';

const jobtitleRoutes = express.Router();

jobtitleRoutes.route('/')
  .get(getPagedJobTitles) // Paginated (order, pag, limit)
  .post(createJobTitle);

jobtitleRoutes.route('/:id')
  .put(updateJobTitle)
  .get(getJobTitle)
  .delete(deleteJobTitle);

export default jobtitleRoutes;
