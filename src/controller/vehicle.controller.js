import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import VEHICLE_QUERY from '../query/vehicle.query.js';

const ORDER_VALUES = [
  'ASC', 'DESC', 'asc', 'desc'
];

const PARAMETER_VALUES = [
  'vehicle_id', 'car_brand', 'car_plaque', 'type_of_gas',
  'purchase_date', 'gas_tank_capacity', 'gas_tank_status',
  'last_tank_refill', 'kilometers_traveled'
];

export const checkVehicleStatus = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, checking for vehicle status...`);
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with id ${req.params.id} was not found`));
    } else {
      // Vehicle founded, just retrieve the information.
      database.query(VEHICLE_QUERY.CHECK_VEHICLE_STATUS, [req.params.id], (error, results) => {
        if (error) {
          throw error;
        } else {
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicle found`, results[0][0]));
        }
      });
    }
  });
};


export const fillVehicleTank = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, filling vehicle gasoline tank...`);
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with id ${req.params.id} was not found`));
    } else {
      // Vehicle founded, fill the tank...
      const gasAmount = req.body.gasAmount || null;
      if (gasAmount == null) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The parameter 'gasAmount' is required`));
        return;
      }
      database.query(VEHICLE_QUERY.FILL_VEHICLE_TANK, [req.params.id, gasAmount], (error, results) => {
        if (error) {
          if (error.errno == 1000) {
            res.status(HttpStatus.NOT_ACCEPTABLE.code)
              .send(new Response(HttpStatus.NOT_ACCEPTABLE.code, HttpStatus.NOT_ACCEPTABLE.status, `Gasoline tank already filled today`));
            return;
          }
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
          return;
        } else {
          logger.info(`Vehicle with id ${req.params.id} was filled successfully!`);
          // Retrieve the new status of the vehicle...
          database.query(VEHICLE_QUERY.CHECK_VEHICLE_STATUS, [req.params.id], (error, results) => {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with id ${req.params.id} was not found`));
            } else {
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicle tankfilled sucessfully, new status retrieved`, results[0][0]));
            }
          });
        }
      });
    }
  });
};

export const createVehicle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating vehicle...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 6) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid numbers of parameters`));
    return;
  }
  // Checking no-empty parameters ('');
  if (BODY_PARAMETERS.includes('', "")) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  database.query(VEHICLE_QUERY.CREATE_VEHICLE, BODY_PARAMETERS, (error, results) => {
    if (error) {
      console.log(error.message);
      if (error.errno == 1064) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Invalid parameter values, check documentation`));
        return;
      } 
      if (error.errno == 1062) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Duplicated values for vehicle`));
        return;
      }
      else {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: ${error.sqlMessage}`));
        return;
      }
    }
    if (!results) {
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The vehicle was not registered`));
    } else {
      const vehicle = results[0][0];
      res.status(HttpStatus.CREATED.code)
        .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `Vehicle registered successfully`, { vehicle }));
    }
  });
};

export const getPagedVehicles = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving vehicles...`);
  const parameter = req.body.parameter || 'vehicle_id';
  const order = req.body.order || 'ASC';
  // Validation of pagination parameters
  if (!ORDER_VALUES.includes(order) || !PARAMETER_VALUES.includes(parameter)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status,
                         `Invalid parameters for pagination order (check 'parameter' and 'order' values)`));
    return;
  }
  database.query(VEHICLE_QUERY.SELECT_VEHICLES, (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, error retrieving vehicles: ${error.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
      return;
    }
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicles not found`));
    } else {
      const page = Number(req.body.pag) || 1;
      const limit = Number(req.body.limit) || 10;
      // Validation page parameters
      if (limit < 1 || limit > 100) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status,
                             `Invalid values for pagination (check 'pag' and 'limit' values in the request)`));
        return;
      }
      // Calculation for paginations parameters...
      let numOfResults = results.length;
      let numOfPages = Math.ceil(numOfResults / limit);
      if (page > numOfPages) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Selected page exceeds total page number. The total pages is ${numOfPages} and the page ${page} was requested`));
        return;
      }
      if (page < 1) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested (${page}), must be 1 or higher`));
        return;
      }
      // Valid pagination parameters
      const startingLimit = (page - 1) * limit;
      database.query(VEHICLE_QUERY.SELECT_PAGED_VEHICLES, [parameter, order, startingLimit, limit], (error, results) => {
        if (error) {
          throw error;
        } else { 
          if (!results[0]) {
            res.status(HttpStatus.NOT_FOUND.code)
              .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Not vehicles found`));
          } else {
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, { data: results[0], page, numOfPages }));
          }
        }
      });
    }
  });
};

export const getVehicle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving vehicle...`);
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${req.params.id} was not found`));
    } else {
      res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicle found`, results[0]));
    }
  });
};

export const updateVehicle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, updating vehicle...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 4) {
    logger.error(`${req.method} ${req.originalUrl}, error updating vehicle: invalid parameters, quantity of parameters must be 4`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid numbers of parameters`));
    return;
  }
  // Checking no-empty parameters ('');
  if (BODY_PARAMETERS.includes('', "")) {
    logger.error(`${req.method} ${req.originalUrl}, error updating vehicle: invalid parameters, empty parameters are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${req.params.id} was not found`));
      return;
    } else {
      database.query(VEHICLE_QUERY.UPDATE_VEHICLE, [req.params.id, ...BODY_PARAMETERS], (error, results) => {
        if (error) {
          console.log(`>>>>>>>>>>>> ${error.errno}`);
          if (error.errno == 1064) {
            res.status(HttpStatus.BAD_REQUEST.code)
              .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Invalid parameter values, check documentation`));
            return;
          }
          if (error.errno == 1062) {
            res.status(HttpStatus.BAD_REQUEST.code)
              .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated values, the object cannot be modified with that parameters`));
            return;
          }
          // Unexpected error
          console.log(`>>> ${error.errno}`);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `${error.errno}: ${error.sqlMessage}`));
          return;
        } else {
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicle updated successfully`, { id: req.params.id, ...req.body }));
        }
      });
    }
  });
};

export const deleteVehicle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, deleting vehicle...`);
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${req.params.id} was not found`));
      return ;
    } else {
      database.query(VEHICLE_QUERY.DELETE_VEHICLE, [req.params.id], (error, results) => {
        if (results.affectedRows > 0) {
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The vehicle with id ${req.params.id} was deleted sucessfully`));
          return;
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during deletion`));
        }
      });
    }
  });
};

export const registerKilometers = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, registering kilometers...`);
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${req.params.id} was not found`));
    } else {
      const kilometers = Number(req.body.kilometers) || null;
      if (kilometers === null) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid kilometers value`));
        return;
      }
      database.query(VEHICLE_QUERY.REGISTER_KILOMETERS, [req.params.id, kilometers], (error, results) => {
        if (error) {
          if (error.errno == 1000) {
            res.status(HttpStatus.BAD_REQUEST.code)
              .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Not enough gasoline to travel that amount of kilometers`));
            return ;
          }
          if (error.errno == 1001) {
            res.status(HttpStatus.BAD_REQUEST.code)
              .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid amount of kilometers`));
            return;
          }
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected error`));
        } else {
          database.query(VEHICLE_QUERY.CHECK_VEHICLE_STATUS, [req.params.id], (error, results) => {
            if (error) {
              res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behaviour`));
            } else {
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicle updated sucessfully, new status retrieved`, results[0][0]));
            }
          });
        }
      });
    }
  });
};

export const updateMaintenenaceLog = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, updating maintenance log...`);
  const status = req.body.status || null;
  // Check if the parameter was passed by the user
  if (!status) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Obligatory parameters were not found (status) is required`));
    return;
  }
  // Check if the status is valid
  if (status == '') {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty values for parameters are not allowed`));
    return;
  }
  // Valid parameter, search the maintenance log
  database.query(VEHICLE_QUERY.SELECT_MAINTENANCELOG, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status), `The maintenance log with id ${req.params.id} was not found`);
    } else {
      // Existing maintenance log, then update.
      database.query(VEHICLE_QUERY.UPDATE_MAINTENANCELOG, [req.params.id, status], (error, results) => {
        if (results.affectedRows > 0) {
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Maintenance log updated sucessfully`, { maintenance_id: req.params.id, new_status: status }));
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
        }
      });
    }
  });
};

export const getMaintenanceLogsOfVehicle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, getting maintenance logs of a vehicle...`);
  // Search if exists maintenance logs asociated to that vehicle
  database.query(VEHICLE_QUERY.GET_MAINTENANCELOGS_OF_VEHICLE, [req.params.id], (error, results) => {
    if (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behaviour`));
      return;
    }
    if (!results[0][0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No maintenance logs were found for the vehicle with id ${req.params.id}`));
    } else {
      const page = Number(req.body.pag) || 1;
      const limit = Number(req.body.limit) || 10;
      // Validation page parameters
      if (isNaN(page) || isNaN(limit)) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status,
                             `Invalid values for pagination (check 'pag' and 'limit' values in the request)`));
        return;
      }
      // Calculation for paginations parameters...
      let numOfResults = results[0].length;
      let numOfPages = Math.ceil(numOfResults / limit);
      if (page > numOfPages) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Selected page exceeds total page number. The total pages is ${numOfPages} and the page ${page} was requested`));
        return;
      }
      if (page < 1) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested (${page}), must be 1 or higher`));
        return;
      }
      let startingLimit = (page - 1) * limit;
      // Valid pagination parameters
      database.query(VEHICLE_QUERY.GETP_MAINTENANCELOGS_OF_VEHICLE, [req.params.id, startingLimit, limit], (error, results) => {
        if (error) {
          console.log(error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
        } else {
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Maintenance logs of vehicle with id ${req.params.id} retrieved`, { data: results[0], page, numOfPages }));
        }
      });
    }
  });
};

export const getMaintenanceLog = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, getting maintenance log...`);
  database.query(VEHICLE_QUERY.SELECT_MAINTENANCELOG, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No maintenance log with id ${req.params.id} was not found`));
    } else {
      res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Maintenance log with id ${req.params.id} was founded`, results[0]));
    }
  });
};

export const deleteMaintenanceLog = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, removing maintenance log...`);
  // Search for the maintenance log...
  database.query(VEHICLE_QUERY.SELECT_MAINTENANCELOG, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No maintenance log with id ${req.params.id} was not found`));
    } else {
      database.query(VEHICLE_QUERY.DELETE_MAINTENANCELOG, [req.params.id], (error, results) => {
        if (results.affectedRows > 0) {
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The maintenance log with id ${req.params.id} was deleted sucessfully`));
        } else {
          console.log(error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
        }
      });
    }
  });
};

export const registerMaintenanceLog = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, registering maintenance log...`);
  // Check if the parameter was passed by the user
  const status = req.body.status || null;
  console.log(`>>>> ${isNaN(status)}`);
  if (status == null) {
    logger.error(`${req.method} ${req.originalUrl}, status parameter is obligatory`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The parameter 'status' was not found on the request`));
    return;
  }
  // Check if the status is valid
  if (status == '') {
    logger.error(`${req.method} ${req.originalUrl}, status parameter cannot be empty`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty values for parameters are not allowed`));
    return;
  }
  // Valid parameter, search if the vehicle exists
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${req.params.id} was not found`));
      return;
    } else {
      // Vehicle found then register the maintenance log.
      database.query(VEHICLE_QUERY.REGISTER_MAINTENANCELOG, [req.params.id, status], (error, results) => {
        if (error) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
        } else {
          res.status(HttpStatus.CREATED.code)
            .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `Maintenance log registered sucessfully for the vehicle with id ${req.params.id}`, results[0]));
        }
      });
    }
  });
};