import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import ZONE_QUERY from '../query/zone.query.js';
import { ORDER } from 'mysql/lib/PoolSelector';

const ORDER_VALUES = [
  'ASC', 'DESC', 'asc', 'desc'
];

const PARAMETER_ROUTE_VALUES = [
  'route_id', 'route_name'
];

// Zone methods
export const createZone = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating zone...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 1) {
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
  database.query(ZONE_QUERY.CREATE_ZONE, BODY_PARAMETERS, (error, results) => {
    if (error) {
      console.log(error);
      if (error.errno == 1064) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameter values`));
        return;
      }
      if (error.errno == 1062) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated values detected, object not created`));
        return;
      }
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Unexpected behavior`));
      return;
    }
    if (!results) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `The zone was not registered`));
    } else {
      const zone = results[0][0];
      res.status(HttpStatus.CREATED.code)
        .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `Zone created sucessfully`, { zone }));
    }
  });
};

export const getZone = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving zone....`);
  database.query(ZONE_QUERY.SELECT_ZONE, [req.params.id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The zone with the id ${req.params.id} was not found`));
      } else {
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Zone with ${req.params.id} found`, results[0]));
      }
    }
  });
};

export const getPagedZones = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, getting zones...`);
  const order = req.param('order') || 'DESC';
  // Validation of pagination parameters
  if (!ORDER_VALUES.includes(order)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters for pagination (check 'order' value)`));
    return;
  }
  database.query(ZONE_QUERY.SELECT_ZONES, (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
      return;
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Zones not found`));
      } else {
        const page = req.param('pag') ? Number(req.param('pag')) : 1;
        const limit = req.param('limit') ? Number(req.param('limit')) : 1;
        if (isNaN(page) || isNaN(limit)) {
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid values for pagination (check 'pag' and 'limit' values in the request)`));
          return;
        }
        // Calculation for pagination parameters
        let numOfResults = results.length;
        let numOfPages = Math.ceil(nunmOfResults / limit);
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
        database.query(ZONE_QUERY.SELECT_PAGE_ZONES, [order, startingLimit, limit], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Invalid number of parameters`));
            return;
          } else {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No zones found`));
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

export const updateZone = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, updating zone...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 1) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Cheking no empty parameters
  if (BODY_PARAMETERS.includes('', "")) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  database.query(ZONE_QUERY.SELECT_ZONE, [req.params.id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Invalid number of parameters`));
        return;
      } else {
        database.query(ZONE_QUERY.UPDATE_ZONE, [req.params.id, ...BODY_PARAMETERS], (error, results) => {
          if (error) {
            if (error.errno == 1064) {
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters values, check documentation`));
              return;
            }
            if (error.errno == 1062) {
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated value detected, the object was not created`));
              return;
            }
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
            return;
          } else {
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Zone updated sucessfully`, { id: req.params.id, ...req.body }))
          }
        });
      }
    }
  });
};

export const deleteZone = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, deleting zone...`);
  database.query(ZONE_QUERY.SELECT_ZONE, [req.params.id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The zone with the id ${req.params.id} was not found`));
      } else {
        database.query(ZONE_QUERY.DELETE_ZONE, [req.params.id], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query`));
          } else {
            if (results.affectedRows > 0) {
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The zone with id ${req.params.id} was deleted sucessfully`));
            } else {
              res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
            }
          }
        });
      }
    }
  });
};

// Route methods
export const createRoute = (req, res) => {
  logger.info(`${req.method}, ${req.originalUrl}, creating route...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 2) {
    res.status(HttpStatus.BAD_REQUEST.status.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Checking non empty parameters
  if (BODY_PARAMETERS.includes('', "")) {
    res.status(HttpStatus.BAD_REQUEST.status.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  database.query(ZONE_QUERY.CREATE_ROUTE, BODY_PARAMETERS, (error, results) => {
    if (error) {
      console.log(error);
      if (error.errno == 1064) {
        res.status(HttpStatus.BAD_REQUEST.status.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Invalid parameter values, check documentation`));
        return;
      }
      if (error.errno == 1062) {
        res.status(HttpStatus.BAD_REQUEST.status.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated values detected, the object was not created`));
        return;
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.status.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
      return;
    } else {
      if (!results) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.status.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `The vehicle was not registered`));
        return;
      } else {
        const route = results[0][0];
        res.status(HttpStatus.CREATED.status.code)
          .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `Route registered sucessfully`, { route }));
        return;
      }
    }
  });
};

export const getRoute = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving route...`);
  database.query(ZONE_QUERY.SELECT_ROUTE, [req.params.id], (error, results) => {
    if (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.status.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
      return;
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.status.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The route with id ${req.params.id} was not found`));
        return;
      } else {
        res.status(HttpStatus.OK.status.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Route found`, results[0]));
        return;
      }
    }
  });
};

export const getPagedRoutes = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving routes...`);
  const parameter = req.param('parameter') || 'route_id';
  const order = req.param('order') || 'DESC';
  // Validation of pagination parameters
  if (!ORDER_VALUES.includes(order) || !PARAMETER_ROUTE_VALUES.includes(parameter)) {
    res.status(HttpStatus.BAD_REQUEST.status.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters for pagination order (check 'parameter' and 'order' values)`));
    return;
  }
  database.query(ZONE_QUERY.SELECT_ROUTES, (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.status.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
      return;
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.status.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No routes found`));
      } else {
        const page = req.param('pag') ? Number(req.param('pag')) : 1;
        const limit = req.para('limit') ? Number(req.param('limit')) : 1;
        // Validation parameters
        if (isNaN(page) || isNaN(limit)) {
          res.status(HttpStatus.BAD_REQUEST.status.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
          return;
        }
        // Calculation for pagination parameters...
        let numOfResults = results.length;
        let numOfPages = Math.ceil(numOfResults / limit);
        if (page > numOfPages) {
          res.status(HttpStatus.BAD_REQUEST.status.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Selected page exceeds total pages. The total pages is ${numOfPages} and the page ${page} was requested`));
          return;
        }
        if (page < 1) {
          res.status(HttpStatus.BAD_REQUEST.status.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested (${page}), must be 1 or higher`));
          return;
        }
        // Valid pagination parameters
        const startingLimit = (page - 1) * limit;
        database.query(ZONE_QUERY.SELECT_PAGED_ROUTES, [parameter, order, startingLimit, limit], (error, results) => {
          if (error) {
            console.log(error);
              res.status(HttpStatus.INTERNAL_SERVER_ERROR.status.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
            return;
          } else {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.status.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No routes found`));
            } else {
              res.status(HttpStatus.OK.status.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, { data: results[0], page, numOfPages }));
            }
          }
        });
      }
    }
  });
};

export const updateRoute = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, updating route...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 2) {
    res.status(HttpStatus.BAD_REQUEST.status.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Checking empty parameters
  if (BODY_PARAMETERS.includes('', "")) {
    res.status(HttpStatus.BAD_REQUEST.status.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  database.query(ZONE_QUERY.SELECT_ROUTE, [req.params.route_id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.status.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
      return;
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.status.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The route with the id ${req.params.route_id} was not found`));
        return;
      } else {
        database.query(ZONE_QUERY.UPDATE_ROUTE, [req.params.route_id, ...BODY_PARAMETERS], (error, results) => {
          if (error) {
            console.log(error);
            if (error.errno == 1064) {
              res.status(HttpStatus.BAD_REQUEST.status.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameter values, check documentation`));
              return;
            }
            if (error.errno == 1062) {
              res.status(HttpStatus.BAD_REQUEST.status.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated values detected, the object was not created`));
              return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.status.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
            return;
          } else {
            res.status(HttpStatus.OK.status.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Route updated successfully`, { id: req.params.route_id, ...req.body }));
            return;
          }
        });
      }
    }
  });
};

export const deleteRoute = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, deleting route...`);
  database.query(ZONE_QUERY.SELECT_ROUTE, [req.params.route_id], (error, results) => {
    if (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The route with the id ${req.params.route_id} was not found`));
      } else {
        database.query(ZONE_QUERY.DELETE_ROUTE, [req.params.route_id], (error, results) => {
          if (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
          } else {
            if (results.affectedRows > 0) {
              res.status(HttpStatus.OK.code)
               .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The route with the id ${req.params.route_id} was deleted successfully`));
            } else {
              res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
               .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
            }
          }
        });
      }
    }
  });
};

// ZoneXRoute methods
export const createZoneXRoute = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating association between zone and route...`);
  const zone_id = req.params.id;
  const route_id = req.params.route_id;
  // Search if zone_id exists
  database.query(ZONE_QUERY.SELECT_ZONE, [zone_id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The zone with id ${zone_id} was not found`));
      } else {
        // Zone found, search route_id
        database.query(ZONE_QUERY.SELECT_ROUTE, [route_id], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
          } else {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.code)
               .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The zone with id ${zone_id} was not found`));
            } else {
              // route_id also exists, create the relation
              database.query(ZONE_QUERY.CREATE_ZONEXROUTE, [zone_id, route_id], (error, results) => {
                if (error) {
                  console.log(error);
                  if (error.errno == 1064) {
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno} Invalid parameter values, check documentation`));
                    return;
                  }
                  if (error.errno == 1062) {
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno} Duplicated values detected, the object was not created`));
                    return;
                  }
                  res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                    .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
                  return;
                } else {
                  res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Asociation between zone with id ${zone_id} and route with id ${route_id} was sucessfull`));
                }
              });
            }
          }
        });
      }
    }
  });
};

export const getPagedZoneRoutes = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving routes of a zone...`);
  const parameter = req.param('parameter') || 'zone_id';
  const order = req.param('order') || 'DESC';
  if (!ORDER_VALUES.includes(order) || !PARAMETER_ROUTE_VALUES.includes(parameter)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters for pagination order (check 'parameter' and 'order' values)`));
    return;
  }
  database.query(ZONE_QUERY.SELECT_ZONE_ROUTES, [req.params.id], (error, results) => {
    if (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No relationships between zones and routes found`));
        return;
      } else {
        const page = req.param('pag') ? Number(req.param('pag')) : 1;
        const limit = req.param('limit') ? Number(req.param('limit')) : 1;
        // Validation page parameters
        if (isNaN(page) || isNaN(limit)) {
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid values for pagination (check 'pag' and 'limit' values in the request)`));
          return;
        }
        // Calculation for pagination parameters
        let numOfResults = results.length;
        let numOfPages = (numOfResults / limit);
        if (page > numOfPages) {
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Selected page exceeds the total page number. The total pages is ${numOfPages} and the page ${page} was requested`));
          return;
        }
        if (page < 1) {
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested (${page}), must be 1 or higher`));
          return;
        }
        // Valid pagination parameters
        const startingLimit = (page - 1) * limit;
        database.query(ZONE_QUERY.SELECT_PAGED_ZONE_ROUTES, [req.params.id, parameter, order, startingLimit, limit], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during the query execution`));
          } else {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The zone with id ${req.params.id} was not found`));
            } else {
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, { data: results[0], page, numOfPages }));
              return;
            }
          }
        });
      }
    }
  });
};

export const deleteZoneXRoute = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, deleting the relation between a zone and a route...`);
  const zone_id = req.params.id;
  const route_id = req.params.route_id;
  // Check if the zone id exists
  database.query(ZONE_QUERY.SELECT_ROUTE, [zone_id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during the query execution`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The zone with the id ${zone_id} was not found`));
      } else {
        // Zone found, check if route exists too
        database.query(ZONE_QUERY.SELECT_ROUTE, [route_id], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
          } else {
            if (!results[0]) {
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The route with the id ${route_id} was not found`));
            } else {
              // Route found, then delete the zone and route relation (if exists)
              database.query(ZONE_QUERY.DELETE_ZONEXROUTE, [zone_id, route_id], (error, results) => {
                if (error) {
                  console.log(error);
                  res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                    .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior during query execution`));
                } else {
                  if (results.affectedRows > 0) {
                    res.status(HttpStatus.OK.code)
                      .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The relation between the zone with id ${zone_id} and the route with id ${route_id} was deleted successfully`));
                  } else {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected error, relation not deleted`))
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