import express from 'express';
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
import businessStockRoutes from './route/business_stock.route.js'

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/vehicle', vehicleRoutes);
app.use('/jobTitle', jobtitleRoutes);
app.use('/driver', driverRoutes);
app.use('/businessType', businesstypeRoute);
app.use('/zone', zoneRoutes);
app.use('/supplier', supplierRoutes);
app.use('/productCat', productcategoryRoutes);
app.use('/product', productRoutes);
app.use('/stock', businessStockRoutes);
app.all('*', (req, res) => {
  res.status(HttpStatus.NOT_FOUND.code)
    .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The resource ${req.originalUrl} was not found`));
});

app.listen(PORT, () => {
  logger.info(`Server running at http://${ip.address()}:${PORT}`);
});

export default app;
