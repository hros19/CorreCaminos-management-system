import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import DRIVER_QUERY from '../query/driver.query.js';
import VEHICLE_QUERY from '../query/vehicle.query.js';
import JOBTITLE_QUERY from '../query/jobtitle.query.js';
import CLIENT_QUERY from '../query/client.query.js';

const ORDER_VALUES = [
  'ASC', 'DESC', 'asc', 'desc'
];

const PARAMETER_VALUES = [
  'driver_id', 'driver_name', 'job_title_name', 'driver_doc_id',
  'salary', 'hiring_date', 'vehicle_id', 'car_plaque'
];

export const completeClientOrder = async (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, completing client order...`);
  const driver_id = Number(req.params.id) || null;
  if (driver_id == null || driver_id == undefined) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid driver id'));
    return;
  }
  // Check if the driver exists
  let result = await new Promise((resolve, reject) => database.query(DRIVER_QUERY.SELECT_DRIVER, [driver_id], (error, results) => {
    if (error) {
      reject(new Error(error));
    } else {
      resolve(results);
    }
  }));
  if (result instanceof Error) {
    logger.error(`${req.method} ${req.originalUrl}, error: ${result.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, result.message));
    return;
  }
  // If no driver was found
  if (!result[0]) {
    logger.error(`${req.method} ${req.originalUrl}, driver not found`);
    res.status(HttpStatus.NOT_FOUND.code)
      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Driver not found'));
    return;
  }
  // id, vehid, jobid, nme, docid, salary, hiringdate
  const driver_object = result[0];
  // Check if the client is a 'Repartidor'
  if (driver_object.job_title_id != 2) {
    logger.error(`${req.method} ${req.originalUrl}, driver is not a repartidor`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Driver is not a repartidor'));
    return;
  }
  // Check if the client order exists
  const client_order_id = Number(req.params.clientOrderId) || null;
  if (client_order_id == null || client_order_id == undefined) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid client order id'));
    return;
  }
  result = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.SELECT_CLIENTORDER, [client_order_id], (error, results) => {
    if (error) {
      reject(new Error(error));
    } else {
      resolve(results);
    }
  }));
  if (result instanceof Error) {
    logger.error(`${req.method} ${req.originalUrl}, error: ${result.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, result.message));
    return;
  }
  // If no client order was found
  if (!result[0]) {
    logger.error(`${req.method} ${req.originalUrl}, client order not found`);
    res.status(HttpStatus.NOT_FOUND.code)
      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Client order not found'));
    return;
  }
  // id, clitnid, orderstatus, date, deliverydate
  const client_order_object = result[0];
  // Driver and Client Order Valid
  // Get the information of the client
  if (client_order_object.order_status != 'EN DESPACHO') {
    logger.error(`${req.method} ${req.originalUrl}, client order is not in delivery`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Client order is not in delivery'));
    return;  
  }
  result = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.SELECT_CLIENT, [client_order_object.client_id], (error, results) => {
    if (error) {
      reject(new Error(error));
    } else {
      resolve(results);
    }
  }));
  if (result instanceof Error) {
    logger.error(`${req.method} ${req.originalUrl}, error: ${result.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, result.message));
    return;
  }
  // If no client was found
  if (!result[0]) {
    logger.error(`${req.method} ${req.originalUrl}, client not found`);
    res.status(HttpStatus.NOT_FOUND.code)
      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Client not found'));
    return;
  }
  const client_object = result[0];
  // clientid, geoaddressid, zoneid, devintervalid, businesstypeid, name, represent, number, email, formaladdress
  result = await new Promise((resolve, reject) => database.query(DRIVER_QUERY.SELECT_ZONE_KILOMETERS, [client_object.zone_id], (error, results) => {
    if (error) {
      reject(new Error(error));
    } else {
      resolve(results);
    }
  }));
  if (result instanceof Error) {
    logger.error(`${req.method} ${req.originalUrl}, error: ${result.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, result.message));
    return;
  }
  if (!result[0]) {
    logger.error(`${req.method} ${req.originalUrl}, client address not found (Bad register of zone-route)`);
    res.status(HttpStatus.NOT_FOUND.code)
      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Client address not found (Bad register of zone-route)'));
    return;
  }
  let total_kilometers = Object.values(result[0])[0].total_km;
  total_kilometers = total_kilometers.toFixed(2);
  logger.info(`${driver_object.vehicle_id}, ${total_kilometers}`);
  // With total kilometers to travel and the client order information, then register the kilometers to the driver vehicle
  result = await new Promise((resolve, reject) => database.query(VEHICLE_QUERY.REGISTER_KILOMETERS, [driver_object.vehicle_id, total_kilometers], (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, error 1: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, result.message));
    return;
    } else {
      resolve(results);
    }
  }));
  if (result instanceof Error) {
    logger.error(`${req.method} ${req.originalUrl}, error 2: ${result.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, result.message));
    return;
  }
  if (result.affectedRows > 0) {
    // If the kilometers were registered successfully, then update the client order status to 'COMPLETADO'
    result = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.UPDATE_CLIENTORDER, [client_order_id, 'COMPLETADO'], (error, results) => {
      if (error) {
        logger.error(`${req.method} ${req.originalUrl}, error 3: ${error}`);
        reject(new Error(error));
      } else {
        resolve(results);
      }
    }));
    if (result instanceof Error) {
      logger.error(`${req.method} ${req.originalUrl}, error 4: ${result.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, result.message));
      return;
    }
    if (result.affectedRows > 0) {
      logger.info(`${req.method} ${req.originalUrl}, client order updated successfully`);
      res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Client order completed successfully'));
      return;
    } else {
      logger.error(`${req.method} ${req.originalUrl}, client order not updated`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Client order not updated'));
      return;
    }
  } else {
    logger.error(`${req.method} ${req.originalUrl}, error 5: ${result.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, result.message));
    return;
  }
}

export const createDriver = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating driver...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length != 5) {
    logger.error(`${req.method} ${req.originalUrl}, invalid parameters quantity`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Check no-empty parameters
  if (BODY_PARAMETERS.includes('', "")) {
    logger.error(`${req.method} ${req.originalUrl}, invalid parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  // Check if the vehicle_id and job_title_id exists...
  const vehicle_id = req.body.vehicle_id || null;
  const job_title_id = req.body.job_title_id || null;
  if (vehicle_id == null || job_title_id == null) {
    logger.error(`${req.method} ${req.originalUrl}, vehicle_id or job_title_id is null`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `There should be a 'vehicle_id' and 'job_title_id' parameters`));
    return;
  }
  // Check if the vehicle_id exists
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [vehicle_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, error on searching vehicle: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} ${req.originalUrl}, vehicle_id '${vehicle_id}' does not exist`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${vehicle_id} was not found`));
      } else {
        // Vehicle found, proceed to check if the job_title_id exists
        database.query(JOBTITLE_QUERY.SELECT_JOBTITLE, [job_title_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
            return;
          } else {
            if (!results[0]) {
              logger.error(`${req.method} ${req.originalUrl}, the job_title_id ${job_title_id} was not found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${vehicle_id} was not found`));
            } else {
              // Job title id found, proceed to create the driver
              database.query(DRIVER_QUERY.CREATE_DRIVER, BODY_PARAMETERS, (error, results) => {
                if (error) {
                  logger.error(`${req.method} ${req.originalUrl}, error creating driver: ${error}`);
                  if (error.errno == 1064) {
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Invalid parameters values`));
                    return;
                  }
                  if (error.errno == 1062) {
                    res.status(HttpStatus.NOT_FOUND.code)
                      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Duplicated values on table, the object was not created`));
                    return;
                  }
                  res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                    .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
                } else {
                  if (!results) {
                    logger.error(`${req.method} ${req.originalUrl}, error creating driver`);
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The driver was not registered`));
                  } else {
                    logger.info(`${req.method} ${req.originalUrl}, driver created`);
                    const driver = results[0][0];
                    res.status(HttpStatus.CREATED.code)
                      .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `The driver was created sucessfully`, { driver }));
                  }
                }
              });
            }
          }
        });
      }
    }
  });
};

export const updateDriver = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, updating driver...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length != 5) {
    logger.error(`${req.method} ${req.originalUrl}, invalid number of parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Check no-empty parameters
  if (BODY_PARAMETERS.includes("", '')) {
    logger.error(`${req.method} ${req.originalUrl}, empty parameters are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  // Check if the vehicle_id and job_title_id exists...
  const vehicle_id = req.body.vehicle_id || null;
  const job_title_id = req.body.job_title_id || null;
  if (vehicle_id == null || job_title_id == null) {
    logger.error(`${req.method} ${req.originalUrl}, there should be a 'vehicle_id' and 'job_title_id' parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `There should be a 'vehicle_id' and 'job_title_id' parameters`));
    return;
  }
  // Check if they are asigned to a row in a table
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [vehicle_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, unexpected behavior`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} ${req.originalUrl}, the vehicle with the id ${vehicle_id} was not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${vehicle_id} was not found`));
      } else {
        // Vehicle found
        database.query(JOBTITLE_QUERY.SELECT_JOBTITLE, [job_title_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} ${req.originalUrl}, unexpected behavior`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `There should be a 'job_title_id' parameter`));
          } else {
            if (!results[0]) {
              logger.error(`${req.method} ${req.originalUrl}, the job title with the id ${job_title_id} was not found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The job title with the id ${vehicle_id} was not found`));
            } else {
              // Job title id found, update the driver
              database.query(DRIVER_QUERY.UPDATE_DRIVER, [req.params.id, ...BODY_PARAMETERS], (error, results) => {
                if (error) {
                  logger.error(`${req.method} ${req.originalUrl}, unexpected behavior: ${error.message}`);
                  if (error.errno == 1064) {
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Invalid parameters values`));
                    return;
                  }
                  if (error.errno == 1062) {
                    res.status(HttpStatus.NOT_FOUND.code)
                      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Duplicated values on table, the object was not created`));
                    return;
                  }
                  res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                    .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
                } else {
                  if (results.affectedRows == 0) {
                    logger.error(`${req.method} ${req.originalUrl}, the driver with the id ${req.params.id} was not found`);
                    res.status(HttpStatus.NOT_FOUND.code)
                      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The driver with the id ${req.params.id} was not found`));
                    return;
                  }
                  logger.info(`${req.method} ${req.originalUrl}, the driver was updated sucessfully`);
                  res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Driver updated sucessfully`, { id: req.params.id, ...req.body }));
                }
              });
            }
          }
        });
      }
    }
  });
};

export const getPagedDrivers = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving drivers...`);
  const parameter = req.body.parameter || 'driver_id';
  const order = req.body.order || "ASC";
  // Validation of pagination parameters
  if (!ORDER_VALUES.includes(order) || !PARAMETER_VALUES.includes(parameter)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameter for pagination order (check 'parameter' and 'order' values)`));
    return;
  }
  database.query(DRIVER_QUERY.SELECT_DRIVERS, (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, error on retrieving drivers: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No drivers found`));
      } else {
        const page = Number(req.body.page) || 1;
        const limit = Number(req.body.limit) || 10;
        // Validation page parameters
        if (isNaN(page) || isNaN(limit)) {
          logger.error(`${req.method} ${req.originalUrl}, error on retrieving drivers: ${error}`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid values for pagination (check 'pag' and 'limit' values in the request)`));
          return;
        }
        // Calculation for pagination parameters
        let numOfResults = results.length;
        let numOfPages = Math.ceil(numOfResults / limit);
        if (page > numOfPages) {
          logger.error(`${req.method} ${req.originalUrl}, page ${page} not found`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Selected page exceeds total page number. The total pages is ${numOfPages} and the page ${page} was requested`));
          return;
        }
        if (page < 1) {
          logger.error(`${req.method} ${req.originalUrl}, error on retrieving drivers: ${error}`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested (${page}, must be 1 or higher`));
          return;
        }
        // Valid pagination parameters
        const startingLimit = (page - 1) * limit;
        database.query(DRIVER_QUERY.SELECT_PAGED_DRIVERS, [parameter, order, startingLimit, limit], (error, results) => {
          if (error) {
            logger.error(`${req.method} ${req.originalUrl}, error on retrieving paged drivers: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
          } else {
            if (!results[0]) {
              logger.error(`${req.method} ${req.originalUrl}, error on retrieving drivers: ${error}`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Not drivers found`));
            } else {
              logger.info(`${req.method} ${req.originalUrl}, drivers retrieved successfully`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Drivers retrieved`, { data: results[0], page, numOfPages }));
            }
          }
        });
      }
    }
  });
};

export const getDriver = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving a driver...`);
  database.query(DRIVER_QUERY.SELECT_DRIVER, [req.params.id], (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, error on retrieving a driver: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The driver with id ${req.params.id} was not found`));
      } else {
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Driver found`, results[0]));
      }
    }
  });
};

export const deleteDriver = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, deleting driver...`);
  database.query(DRIVER_QUERY.SELECT_DRIVER, [req.params.id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The driver with id ${req.params.id} was not found`));
      } else {
        database.query(DRIVER_QUERY.DELETE_DRIVER, [req.params.id], (error, results) => {
          if (results.affectedRows > 0) {
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The driver with id ${req.params.id} was deleted sucessfully`));
          } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
          }
        });
      }
    }
  });
};