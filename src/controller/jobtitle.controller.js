import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import JOBTITLE_QUERY from '../query/jobtitle.query.js';

const ORDER_VALUES = [
  'ASC', 'DESC', 'asc', 'desc'
];

export const createJobTitle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating job title...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 1) {
    logger.error(`${req.method} ${req.originalUrl}, invalid parameters quantity`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Checking no empty parameters
  if (BODY_PARAMETERS.includes('', "")) {
    logger.error(`${req.method} ${req.originalUrl}, empty parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Empty parameters not allowed`));
    return;
  }
  database.query(JOBTITLE_QUERY.CREATE_JOBTITLE, BODY_PARAMETERS, (error, results) => {
    if (error) {
      if (error.errno == 1064) {
        logger.error(`${req.method} ${req.originalUrl}, ${error.code} - ${error.errno} - ${error.sqlMessage}`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters values, check documentation`));
        return;
      }
      if (error.errno == 1062) {
        logger.error(`${req.method} ${req.originalUrl}, job title already exists`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated values, the object was not created`));
        return;
      }
      logger.error(`${req.method} ${req.originalUrl}, error creating job title: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
    } else {
      if (!results) {
        logger.error(`${req.method} ${req.originalUrl}, error creating job title`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The job title was not created`));
      } else {
        logger.info(`${req.method} ${req.originalUrl}, job title created`);
        const jobtitle = results[0][0];
        res.status(HttpStatus.CREATED.code)
          .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `Job title registered successfully`, { jobtitle }));
      }
    }
  });
};

export const getPagedJobTitles = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving job titles...`);
  const order = req.body.order || 'ASC';
  if (!ORDER_VALUES.includes(order)) {
    logger.error(`${req.method} ${req.originalUrl}, invalid order value`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Check 'order' values`));
    return;
  }
  database.query(JOBTITLE_QUERY.SELECT_JOBTITLES, (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Job titles not found`));
    } else {
      const page = Number(req.body.pag) || 1;
      const limit = Number(req.body.limit) || 10;
      // Validation of pagination parameters
      if (isNaN(page) || isNaN(limit)) {
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
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Selected page exceed total page number. The total pages is ${numOfPages} and the page ${page} was requested`));
        return;
      }
      if (page < 1) {
        logger.error(`${req.method} ${req.originalUrl}, page number must be greater than 0`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page requested (${page}), must be 1 or higher`));
        return;
      }
      // Valid pagination parameters
      const startingLimit = (page - 1) * limit;
      database.query(JOBTITLE_QUERY.SELECT_PAGED_JOBTITLES, [order, startingLimit, limit], (error, results) => {
        if (error) {
          logger.error(`${req.method} ${req.originalUrl}, error retrieving job titles: ${error}`);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
          return;
        } else {
          if (!results[0]) {
            logger.error(`${req.method} ${req.originalUrl}, error retrieving job titles: ${error}`);
            res.status(HttpStatus.NOT_FOUND.code)
              .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Not job titles found`));
          } else {
            logger.info(`${req.method} ${req.originalUrl}, job titles retrieved successfully`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Job title retrieved`, { data: results[0], page, numOfPages }));
          }
        }
      });
    }
  });
};

export const updateJobTitle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, updating job title...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 1) {
    logger.error(`${req.method} ${req.originalUrl}, invalid number of parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid number of parameters`));
    return;
  }
  // Checking no-empty parameters
  if (BODY_PARAMETERS.includes('', "")) {
    logger.error(`${req.method} ${req.originalUrl}, empty parameters not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid values for pagination (check 'pag' and 'limit' values in the request)`));
    return;
  }
  database.query(JOBTITLE_QUERY.SELECT_JOBTITLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      logger.error(`${req.method} ${req.originalUrl}, job title not found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The job title with id ${req.params.id} was not found`));
      return;
    }
    database.query(JOBTITLE_QUERY.UPDATE_JOBTITLE, [req.params.id, BODY_PARAMETERS[0]], (error, results) => {
      if (error) {
        if (error.errno == 1064) {
          logger.error(`${req.method} ${req.originalUrl}, invalid parameter values`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters value`));
          return;
        }
        if (error.errno == 1062) {
          logger.error(`${req.method} ${req.originalUrl}, duplicate entry`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Duplicated value, the object was not modified`));
          return;
        }
        logger.error(`${req.method} ${req.originalUrl}, unexpected behavior`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Unexpected behavior`));
      } else {
        logger.info(`${req.method} ${req.originalUrl}, job title updated`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Job title modified sucessfully`, { id: req.params.id, ...req.body }));
        return;
      }
    });
  });
};

export const getJobTitle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving job title...`);
  database.query(JOBTITLE_QUERY.SELECT_JOBTITLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `A job title with an id ${req.params.id} was not found`));
      return;
    } else {
      res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Job title with id ${req.params.id} was found`, results[0]));
      return;
    }
  });
};

export const deleteJobTitle = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, deleting job title`);
  // Searching for the job title
  database.query(JOBTITLE_QUERY.SELECT_JOBTITLE, [req.params.id], (error, results) => {
    if (!results[0]) {
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No job title with id ${req.params.id} was found`));
    } else {
      database.query(JOBTITLE_QUERY.DELETE_JOBTITLE, [req.params.id], (error, results) => {
        if (results.affectedRows > 0) {
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The job title with id ${req.params.id} was deleted sucessfully`));
        } else {
          if (error) {
            console.log(error);
            res.status(HttpStatus.BAD_REQUEST.code)
              .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `${error.errno}: Error during execution of the query`));
          } else {
            res.status(HttpStatus.BAD_REQUEST.code)
              .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Unexpected behavior`));
          }
        }
      });
    }
  });
};