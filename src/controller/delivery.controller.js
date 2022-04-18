import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import DELIVERY_QUERY from '../query/delivery.query.js';

// delivery/day
export const getPagedDevDays = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting paged delivery days...`);
  const order = req.param('order') || 'ASC';
  // Check order value
  if (order !== 'ASC' && order !== 'DESC') {
    logger.info(`${req.method} - ${req.originalUrl}, invalid order value`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid order value'));
    return;
  }
  database.query(DELIVERY_QUERY.SELECT_DEVDAYS, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Delivery days not found'));
      } else {
        const page = Number(req.body.pag) || 1;
        const limit = Number(req.body.limit) || 10;
        // Validation of page parameters
        if (limit < 1 || limit > 100) {
          logger.info(`${req.method} - ${req.originalUrl}, invalid limit value`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid limit value'));
          return;
        }
        // Calculation of pagination parameters
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
        database.query(DELIVERY_QUERY.SELECT_PAGED_DEVDAYS, [order, startingLimit, limit], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            if (!results[0]) {
              logger.info(`${req.method} - ${req.originalUrl}, no delivery days found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Delivery days not found'));
            } else {
              logger.info(`${req.method} - ${req.originalUrl}, delivery days found`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Delivery days found', { data: results[0], page, numOfPages}));
            }
          }
        });
      }
    }
  });
};

// delivery/day/:id
export const selectDevDay = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting delivery day...`);
  const dev_day_id = req.params.id || null;
  if (dev_day_id == null) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid delivery day id'));
    return;
  }
  database.query(DELIVERY_QUERY.SELECT_DEVDAY, [dev_day_id], (error, result) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!result[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Delivery day not found'));
      } else {
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Delivery day found', result[0]));
      }
    }
  });
};

export const updateDevDay = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, updating delivery day...`);
  const dev_day_id = req.params.id || null;
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length !== 1) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters'));
    return;
  }
  // Check non empty values
  if (BODY_PARAMETERS[0] == '') {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters, cannot be empty'));
    return;
  }
  if (dev_day_id == null) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid delivery day id'));
    return;
  }
  // check if the id exists
  database.query(DELIVERY_QUERY.SELECT_DEVDAY, [dev_day_id], (error, result) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!result[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Delivery day not found'));
      } else {
        // then, update the delivery day
        database.query(DELIVERY_QUERY.UPDATE_DEVDAY, [dev_day_id, BODY_PARAMETERS[0]], (error, result) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            if (result.affectedRows > 0) {
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Delivery day updated'));
            } else {
              res.status(HttpStatus.NOT_MODIFIED.code)
                .send(new Response(HttpStatus.NOT_MODIFIED.code, HttpStatus.NOT_MODIFIED.status, 'Delivery day not modified'));
            }
          }
        });
      }
    }
  });
}

export const deleteDevDay = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting delivery day...`);
  const dev_day_id = req.params.id || null;
  if (dev_day_id === null) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid delivery day id'));
    return;
  }
  // Check if the dev_day_id exists
  database.query(DELIVERY_QUERY.SELECT_DEVDAY, [dev_day_id], (error, result) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!result[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Delivery day not found'));
      } else {
        // Delivery day found, then delete it if is possible
        database.query(DELIVERY_QUERY.DELETE_DEVDAY, [dev_day_id], (error, result) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            if (result.affectedRows > 0) {
              logger.info(`${req.method} - ${req.originalUrl}, delivery day deleted`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Delivery day deleted'));
            } else {
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Delivery day not found'));
            }
          }
        });
      }
    }
  });
};

const PARAMETER_DEVINTERVAL_VALUES = [
  'dev_interval_id', 'dev_interval_name'
];

// delivery/intervals
export const getPagedDevIntervals = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, retrieving delivery intervals...`);
  const parameter = req.body.parameter || 'dev_interval_id';
  const order = req.body.order || 'ASC';
  // Check order value
  if (order !== 'ASC' && order !== 'DESC') {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid order value: ${order}`));
    return;
  }
  // Check parameter value
  if (!PARAMETER_DEVINTERVAL_VALUES.includes(parameter)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameter value: ${parameter}`));
    return;
  }
  database.query(DELIVERY_QUERY.SELECT_DEVINTERVALS, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
      return;
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No delivery intervals found'));
        return;
      } else {
        const page = Number(req.body.pag) || 1;
        const limit = Number(req.body.limit) || 10;
        // Validation of page parameters
        if (limit < 1 || limit > 100) {
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid limit value'));
          return;
        }
        // Calculation of pagination parameters
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
        database.query(DELIVERY_QUERY.SELECT_PAGED_DEVINTERVALS, [parameter, order, startingLimit, limit], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
            return;
          } else {
            if (!results[0]) {
              logger.info(`${req.method} - ${req.originalUrl}, no delivery intervals found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No delivery intervals found'));
            } else {
              logger.info(`${req.method} - ${req.originalUrl}, delivery intervals found`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Delivery intervals retrieved successfully', { data: results[0], page, numOfPages }));
            }
          }
        });
      }
    }
  });
};

// delivery/intervals/:id
export const getDevInterval = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, retrieving delivery interval...`);
  const devIntervalId = req.params.id || null;
  if (devIntervalId == null) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid delivery interval id'));
    return;
  }
  database.query(DELIVERY_QUERY.SELECT_DEVINTERVAL, [devIntervalId], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
      return;
    } else {
      if (!results[0]) {
        logger.info(`${req.method} - ${req.originalUrl}, no delivery interval found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Delivery interval not found'));
        return;
      } else {
        logger.info(`${req.method} - ${req.originalUrl}, delivery interval found`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Delivery interval found', results[0]));
        return;
      }
    }
  });
};