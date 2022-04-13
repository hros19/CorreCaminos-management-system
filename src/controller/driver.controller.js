import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import DRIVER_QUERY from '../query/driver.query.js';
import VEHICLE_QUERY from '../query/vehicle.query.js';
import JOBTITLE_QUERY from '../query/jobtitle.query.js';

const ORDER_VALUES = [
  'ASC', 'DESC', 'asc', 'desc'
];

const PARAMETER_VALUES = [
  'driver_id', 'driver_name', 'job_title_name', 'driver_doc_id',
  'salary', 'hiring_date', 'vehicle_id', 'car_plaque'
];

export const createDriver = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating driver...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length != 5) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Check no-empty parameters
  if (BODY_PARAMETERS.includes('', "")) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  // Check if the vehicle_id and job_title_id exists...
  const vehicle_id = req.param('vehicle_id');
  const job_title_id = req.param('job_title_id');
  if (isNaN(vehicle_id)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `There should be a 'vehicle_id' parameter`));
    return;
  }
  if (isNaN(job_title_id)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `There should be a 'job_title_id' parameter`));
    return;
  }
  // Check if the vehicle_id exists
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [vehicle_id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${vehicle_id} was not found`));
      } else {
        // Vehicle found, proceed to check if the job_title_id exists
        database.query(JOBTITLE_QUERY.SELECT_JOBTITLE, [job_title_id], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
            return;
          } else {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${vehicle_id} was not found`));
            } else {
              // Job title id found, proceed to create the driver
              database.query(DRIVER_QUERY.CREATE_DRIVER, BODY_PARAMETERS, (error, results) => {
                if (error) {
                  console.log(error);
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
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The driver was not registered`));
                  } else {
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
  if (BODY_PARAMETERS.length != 6) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Check no-empty parameters
  if (BODY_PARAMETERS.includes("", '')) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  // Check if the vehicle_id and job_title_id exists...
  const vehicle_id = req.param('vehicle_id');
  const job_title_id = req.param('job_title_id');
  if (isNaN(vehicle_id)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `There should be a 'vehicle_id' parameter`));
    return;
  }
  if (isNaN(job_title_id)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `There should be a 'job_title_id' parameter`));
    return;
  }
  // Check if they are asigned to a row in a table
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [vehicle_id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${vehicle_id} was not found`));
      } else {
        // Vehicle found
        database.query(JOBTITLE_QUERY.SELECT_JOBTITLE, [job_title_id], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `There should be a 'job_title_id' parameter`));
          } else {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The job title with the id ${vehicle_id} was not found`));
            } else {
              // Job title id found, update the driver
              database.query(DRIVER_QUERY.UPDATE_DRIVER, BODY_PARAMETERS, (error, results) => {
                if (error) {
                  console.log(error);
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
  const parameter = req.param('parameter') || 'driver_id';
  const order = req.param('order') || 'DESC';
  // Validation of pagination parameters
  if (!ORDER_VALUES.includes(order) || !PARAMETER_VALUES.includes(parameter)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameter for pagination order (check 'parameter' and 'order' values)`));
    return;
  }
  database.query(DRIVER_QUERY.SELECT_DRIVERS, (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No drivers found`));
      } else {
        const page = req.param('page') ? Number(req.param('pag')) : 1;
        const limit = req.param('limit') ? Number(req.param('limit')) : 10;
        // Validation page parameters
        if (isNaN(page) || isNaN(limit)) {
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid values for pagination (check 'pag' and 'limit' values in the request)`));
          return;
        }
        // Calculation for pagination parameters
        let numOfResults = results.length;
        let numOfPages = Math.ceil(numOfResults / limit);
        if (page > numOfPages) {
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Selected page exceeds total page number. The total pages is ${numOfPages} and the page ${page} was requested`));
          return;
        }
        if (page < 1) {
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested (${page}, must be 1 or higher`));
          return;
        }
        // Valid pagination parameters
        const startingLimit = (page - 1) * limit;
        database.query(DRIVER_QUERY.SELECT_PAGED_DRIVERS, [parameter, order, startingLimit, limit], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
          } else {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Not drivers found`));
            } else {
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, { data: results[0], page, numOfPages }));
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
      console.log(error);
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