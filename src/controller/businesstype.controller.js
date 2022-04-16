import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import BUSINESSTYPE_QUERY from '../query/businesstype.query.js';

const ORDER_VALUES = [
  'ASC', 'DESC', 'asc', 'desc'
];

export const createBusinessType = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating business type`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 1) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  if (BODY_PARAMETERS.includes('', "")) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters are not allowed`));
    return;
  }
  database.query(BUSINESSTYPE_QUERY.CREATE_BUSINESSTYPE, BODY_PARAMETERS, (error, results) => {
    if (error) {
      console.log(error);
      if (error.errno == 1064) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Invalid parameter values, check documentation`)); 
        return;
      }
      if (error.errno == 1062) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated values on table, the object was not registered`));
        return;
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Invalid number of parameters`));
      return;
    }
    if (!results) {
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The business type was not created`));
    } else {
      const businesstype = results[0][0];
      res.status(HttpStatus.CREATED.code)
        .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `Business type registered sucessfully`, { businesstype }));
    }
  });
};

export const getPagedBusinessTypes = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving business type...`);
  const order = req.body.order || 'ASC';
  // Validation of register parameters
  if (!ORDER_VALUES.includes(order)) {
    logger.error(`${req.method} ${req.originalUrl}, invalid order value`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters for pagination order (check 'order' value)`));
    return;
  }
  database.query(BUSINESSTYPE_QUERY.SELECT_BUSINESSTYPES, (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, error on query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} ${req.originalUrl}, no business type found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The business type was not created`));
      } else {
        const page = Number(req.body.pag) || 1;
        const limit = Number(req.body.limit) || 10;
        console.log(`>>>>>. ${page} ${limit}`);
        if (limit < 1 || limit > 100) {
          logger.error(`${req.method} ${req.originalUrl}, invalid limit value`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters for pagination limit (check 'limit' value)`));
          return;
        }
        // Calculation for pagination paramaters
        let numOfResults = results.length;
        let numOfPages = Math.ceil(numOfResults / limit);
        if (page > numOfPages) {
          logger.error(`${req.method} ${req.originalUrl}, invalid page value`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Selected page exceeds total page number. The total pages is ${numOfPages} and the page ${page} was requested`));
          return;
        }
        if (page < 1) {
          logger.error(`${req.method} ${req.originalUrl}, invalid page value`);
          res.status(HttpStatus.BAD_REQUEST.code)
           .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested (${page}), must be 1 or higher`));
          return;
        }
        // Valid pagination parameters
        const startingLimit = (page - 1) * limit;
        database.query(BUSINESSTYPE_QUERY.SELECT_PAGED_BUSINESSTYPES, [order, startingLimit, limit], (error, results) => {
          if (error) {
            logger.error(`${req.method} ${req.originalUrl}, error on query: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `The business type was not created`));
          } else {
            if (!results[0]) {
              logger.error(`${req.method} ${req.originalUrl}, no business type found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Business types not found`));
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

export const updateBusinesstype = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, updating business type...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length != 1) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  database.query(BUSINESSTYPE_QUERY.SELECT_BUSINESSTYPE, [req.params.id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The business type was not created`));
      } else {
        database.query(BUSINESSTYPE_QUERY.UPDATE_BUSINESSTYPE, [req.params.id, BODY_PARAMETERS], (error, results) => {
          if (error) {
            if (error.errno == 1064) {
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Invalid parameter values, check documentation`));
              return;
            }
            if (error.errno == 1062) {
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated values, the object was not created`));
              return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
            return;
          } else {
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Business type updated sucessfully`, { id: req.params.id, ...req.body }));
          }
        });
      }
    }
  });
};

export const deleteBusinessType = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, deleting business type...`);
  database.query(BUSINESSTYPE_QUERY.SELECT_BUSINESSTYPE, [req.params.id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The business type with the id ${req.params.id} was not found`));
      } else {
        database.query(BUSINESSTYPE_QUERY.DELETE_BUSINESSTYPE, [req.params.id], (error, results) => {
          if (error) {
            console.log(error);
            res.status(HttpStatus.BAD_REQUEST.code)
              .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Error during query: ${error.errno}`));
          } else {
            if (results.affectedRows > 0) {
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The business type with the id ${req.params.id} was deleted sucessfully`));
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

export const getBusinessType = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving business type....`);
  database.query(BUSINESSTYPE_QUERY.SELECT_BUSINESSTYPE, [req.params.id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
       .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results[0]) {
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The business type with the id ${req.params.id} was not found`));
      } else {
        res.status(HttpStatus.OK.code)
         .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Business type found`, results[0]));
      }
    }
  });
};