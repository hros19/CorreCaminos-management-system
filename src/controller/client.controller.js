import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import CLIENT_QUERY from '../query/client.query.js';
import ZONE_QUERY from '../query/zone.query.js';
import DELIVERY_QUERY from '../query/delivery.query.js';
import BUSINESSTYPE_QUERY from '../query/businessType.query.js';

// client controller

// zoneid, devintervalid, busstypeid, bussname
// bussrep, phone, email, address, lat, long
export const createClient = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, creating client...`);
  const BODY_PARAMETERS = Object.values(req.body);

};