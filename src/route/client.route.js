import express from 'express';
import { createClient, getPagedClients, getClient, updateClient, deleteClient, getClientDevDays, getOrdersOfClient, createClientOrder, getDetailsOfClientOrder } from '../controller/client.controller.js';
import { createClientDevDay, deleteClientDevDay, getClientOrders, getClientOrder, updateClientOrder } from '../controller/client.controller.js';
import { deleteClientOrder } from '../controller/client.controller.js';

const clientRoutes = express.Router();

clientRoutes.route('/')
  .get(getPagedClients) // Tested
  .post(createClient); // Tested

clientRoutes.route('/order')
  .get(getClientOrders) // Tested

clientRoutes.route('/order/:id')
  .get(getClientOrder) // Tested
  .put(updateClientOrder) // Tested
  .delete(deleteClientOrder); // Tested

clientRoutes.route('/order/:id/detail')
  .get(getDetailsOfClientOrder) // Tested


clientRoutes.route('/:id')
  .get(getClient) // Tested
  .put(updateClient) // Tested
  .delete(deleteClient); // Tested

clientRoutes.route('/:id/order')
  .get(getOrdersOfClient) // Tested
  .post(createClientOrder); // Tested

clientRoutes.route('/:id/devday')
  .delete(deleteClientDevDay) // Tested
  .post(createClientDevDay) // Tested
  .get(getClientDevDays); // Tested


export default clientRoutes;