import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import VEHICLE_QUERY from '../query/vehicle.query.js';

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
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicle found`, results[0]));
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
      const gasAmount = req.param('gasAmount') || 1;
      database.query(VEHICLE_QUERY.FILL_VEHICLE_TANK, [req.params.id, gasAmount], (error, results) => {
        if (results[0]) {
          res.status(HttpStatus.METHOD_NOT_ALLOWED.code)
            .send(new Response(HttpStatus.METHOD_NOT_ALLOWED.code, HttpStatus.METHOD_NOT_ALLOWED.status, `The tank already filled today`, results[0]));
        } else {
          if (error) {
            throw error;
          } else {
            logger.info(`Vehicle with id ${req.params.id} was filled successfully!`);
            // Retrieve the new status of the vehicle...
            database.query(VEHICLE_QUERY.CHECK_VEHICLE_STATUS, [req.params.id], (error, results) => {
              if (error) {
                throw error;
              } else {
                res.status(HttpStatus.OK.code)
                  .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `New status of the vehicle with id ${req.params.id}`, results[0]));
              }
            });
          }
        }
      });
    }
  });
};

export const createVehicle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating vehicle...`);
  database.query(VEHICLE_QUERY.CREATE_VEHICLE, Object.values(req.body), (error, results) => {
    if (!results) {
      logger.error(error.message);
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
  const parameter = req.param('parameter') || 'vehicle_id';
  const order = req.param('order') || 'DESC';
  database.query(VEHICLE_QUERY.SELECT_VEHICLES, Object.values(req.body), (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicles not found`));
    } else {
      const page = req.param('pag') ? Number(req.param('pag')) : 1;
      const limit = req.param('limit') ? Number(req.param('limit')) : 10;
      // Calculation for paginations parameters...
      const numOfResults = results[0].length;
      const numOfPages = Math.ceil(numOfResults / limit);
      if (numOfResults == 3) { numOfPages = 2; }
      if (page > numOfPages) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid paginations parameters`));
        return;
      }
      if (page < 1) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested`));
        return;
      }
      // Valid pagination parameters
      const startingLimit = (page - 1) * limit;
      database.query(VEHICLE_QUERY.SELECT_PAGED_VEHICLES, [parameter, order, startingLimit, limit], (error, results) => {
        if (error) throw error;
        if (!results[0]) {
          res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Not vehicles found`));
        } else {
          let iterator = (page - limit) < 1 ? 1 : page - limit;
          let endingLink = (iterator + 9) <= numOfPages ? (iterator + 9) : page + (numOfPages + 9);
          if (endingLink < (page + (limit - 1))) {
            iterator -= (page + (limit - 1) - numOfPages);
          }
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, { data: results[0], page, numOfPages }));
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
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Vehicle founded`, results[0]));
    }
  });
};

export const deleteVehicle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, deleting vehicle...`);
  database.query(VEHICLE_QUERY.SELECT_VEHICLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The vehicle with the id ${req.params.id} was not found`));
    } else {
      database.query(VEHICLE_QUERY.DELETE_VEHICLE, [req.params.id], (error, results) => {
        if (results.affectedRows > 0) {
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The vehicle with id ${req.params.id} was deleted sucessfully`));
        }
        if (error) {
          throw error;
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during deletion`);
        }
      });
    }
  });
};