import express from 'express';
import { createJobTitle, getPagedJobTitles, updateJobTitle, getJobTitle, deleteJobTitle } from '../controller/jobtitle.controller.js';

const jobtitleRoutes = express.Router();

jobtitleRoutes.route('/')
  .get(getPagedJobTitles) // Tested
  .post(createJobTitle); // Tested

jobtitleRoutes.route('/:id')
  .put(updateJobTitle) // Tested
  .get(getJobTitle) // Tested
  .delete(deleteJobTitle); // Tested

export default jobtitleRoutes;
