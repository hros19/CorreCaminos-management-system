import express from 'express';
import bodyParser from 'body-parser';
import ip from 'ip';
import dotenv from 'dotenv';
import cors from 'cors';
import Response from './domain/response.js';
import logger from './util/logger.js';
import HttpStatus from './config/http.config.js';
import vehicleRoutes from './route/vehicle.route.js';
import jobtitleRoutes from './route/jobtitle.route.js';
import driverRoutes from './route/driver.route.js';
import businesstypeRoute from './route/businesstype.route.js';
import supplierRoutes from './route/supplier.route.js';
import zoneRoutes from './route/zone.route.js';
import productcategoryRoutes from './route/productcategory.route.js';
import productRoutes from './route/product.route.js';
import businessStockRoutes from './route/business_stock.route.js';
import deliveryRoutes from './route/delivery.route.js';
import clientRoutes from './route/client.route.js';
import reportRoutes from './route/report.route.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/vehicle', vehicleRoutes); // tested
app.use('/jobTitle', jobtitleRoutes); // tested
app.use('/driver', driverRoutes); // tested
app.use('/businessType', businesstypeRoute); // tested
app.use('/zone', zoneRoutes); // tested
app.use('/supplier', supplierRoutes); // tested
app.use('/productCat', productcategoryRoutes); // tested
app.use('/product', productRoutes); // tested
app.use('/stock', businessStockRoutes); // tested
app.use('/delivery', deliveryRoutes); // tested
app.use('/client', clientRoutes); // tested
app.use('/report', reportRoutes); // tested
app.use('/', (req, res) => {
  res.status(HttpStatus.OK.code)
    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Welcome to CorreCaminos management system', { 
      ip: ip.address(),
      port: PORT,
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      database: process.env.DB_NAME,
      institute: "Instituto Tecnologico de Costa Rica",
      career: "Ingenieria en Computacion",
      course: "Bases de Datos II",
      assign: "Proyecto 01 - CorreCaminos management system",
      group: "Grupo 60",
      instructor: "Ing. Kenneth Obando",
      student: "Hansol Antay",
      semester: "1er Semestre",
      year: "2022"
    }));
});
app.all('*', (req, res) => {
  res.status(HttpStatus.NOT_FOUND.code)
    .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The resource ${req.originalUrl} was not found`));
});

app.listen(PORT, () => {
  logger.info(`Server running at http://${ip.address()}:${PORT}`);
});

export default app;
