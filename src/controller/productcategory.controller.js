import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import PRODUCTCATEGORY_QUERY from '../query/productcategory.query.js';

export const createProductCategory = (req, res) => {
  logger.info(`${req.originalUrl} - ${req.method}, creating product category...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length !== 1) {
    logger.error(`${req.originalUrl} - ${req.method}, invalid parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters'));
  }
  // Check non-empty parameters
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.originalUrl} - ${req.method}, invalid parameters, empty values are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters, empty values are not allowed'));
    return;
  }
  database.query(PRODUCTCATEGORY_QUERY.CREATE_PRODUCTCATEGORY, BODY_PARAMETERS, (error, results) => {
    if (error) {
      if (error.errno == 1064) {
        logger.error(`${req.originalUrl} - ${req.method}, invalid parameters`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters'));
        return;
      }
      if (error.errno == 1062) {
        logger.error(`${req.originalUrl} - ${req.method}, duplicate entry`);
        res.status(HttpStatus.CONFLICT.code)
          .send(new Response(HttpStatus.CONFLICT.code, HttpStatus.CONFLICT.status, 'Duplicate entry values, object not created'));
        return;
      }
      logger.error(`${req.originalUrl} - ${req.method}, error executing query: ${error.code}`);
    } else {
      if (!results) {
        logger.error(`${req.originalUrl} - ${req.method}, error executing query: no results`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query, no results'));
      } else {
        const productCategory = results[0][0];
        logger.info(`${req.originalUrl} - ${req.method}, product category created`);
        res.status(HttpStatus.CREATED.code)
          .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Product category created', { productCategory }));
      }
    }
  });
};

export const getProductCategory = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, retrieving product category...`);
  const product_category_id = req.params.id;
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTCATEGORY, [product_category_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.info(`${req.method} - ${req.originalUrl}, product category not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product category with id ${product_category_id} was not found`));
      } else {
        logger.info(`${req.method} - ${req.originalUrl}, product category found`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, results[0]));
      }
    }
  });

};

export const getPagedProductCategories = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting product categories...`);
  const parameter = req.param('parameter') ? req.param('parameter') : 'product_cat_name';
  const order = req.param('order') ? req.param('order').toUpperCase() : 'DESC';
  // Checking order values
  if (order !== 'ASC' && order !== 'DESC') {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The 'order' value ${order} is not valid`));
    return;
  }
  // Checking parameter values
  if (parameter !== 'product_cat_name' && parameter !== 'product_cat_id') {
    logger.error(`The 'parameter' value ${parameter} is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The 'parameter' value ${parameter} is not valid`));
    return;
  }
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTCATEGORIES, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
      return;
    } else {
      if (!results[0]) {
        logger.info(`${req.method} - ${req.originalUrl}, no product categories were found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No product categories found'));
        return;
      }
      const page = req.param('pag') ? parseInt(req.param('pag'), 10) : 1;
      const limit = req.param('limit') ? parseInt(req.param('limit'), 10) : 10;
      if (isNaN(page) || isNaN(limit)) {
        logger.error(`${req.method} - ${req.originalUrl}, the 'pag' and 'limit' parameters must be numbers`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'The pag and limit parameters must be numbers'));
        return;
      }
      // Calculation for pagination parameters
      let numOfResults = results.length;
      let numOfPages = Math.ceil(numOfResults / limit);
      if (page > numOfPages) {
        logger.error(`${req.method} - ${req.originalUrl}, the 'pag' parameter must be less than ${numOfPages}`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The 'pag' parameter must be less than ${numOfPages}`));
        return;
      }
      if (page < 1) {
        logger.error(`${req.method} - ${req.originalUrl}, the 'pag' parameter must be greater than 1`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The 'pag' parameter must be greater than 1`));
        return;
      }
      const startingLimit = (page - 1) * limit;
      database.query(PRODUCTCATEGORY_QUERY.SELECT_PAGED_PRODUCTCATEGORIES, [parameter, order, startingLimit, limit ], (error, results) => {
        if (error) {
          logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          return;
        } else {
          if (!results[0]) {
            logger.info(`${req.method} - ${req.originalUrl}, no product categories were found`);
            res.status(HttpStatus.NOT_FOUND.code)
              .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No product categories found'));
          } else {
            logger.info(`${req.method} - ${req.originalUrl}, product categories were found`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, { data: results[0], page, numOfPages }));
          }
        }
      });
    }
  });
};

export const updateProductCategory = (req, res) => {
  logger.info(`${req.originalUrl} - ${req.method}, updating product category...` );
  const product_category_id = req.params.id;
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length != 1) {
    logger.error(`${req.originalUrl} - ${req.method}, invalid quantity of parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid request parameters, check the documentation'));
    return;
  }
  // Check no-empty parameters
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.originalUrl} - ${req.method}, invalid parameters, one or more parameters are empty`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid request parameters, one or more parameters are empty'));
    return;
  }
  // Search if the product category exists
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTCATEGORY, [product_category_id], (error, results) => {
    if (error) {
      logger.error(`${req.originalUrl} - ${req.method}, error searching product category: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.originalUrl} - ${req.method}, product category not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product category with id ${product_category_id} was not found`));
      } else {
        // Updating the product category
        database.query(PRODUCTCATEGORY_QUERY.UPDATE_PRODUCTCATEGORY, [product_category_id, ...BODY_PARAMETERS], (error, results) => {
          if (error) {
            if (error.errno == 1064) {
              logger.error(`${req.originalUrl} - ${req.method}, invalid parameters value, check the documentation`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters value, check the documentation'));
              return;
            }
            if (error.errno == 1062) {
              logger.error(`${req.originalUrl} - ${req.method}, Duplicate entry detected, object was not created`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Duplicate entry detected, object was not created'));
              return;
            }
            logger.error(`${req.originalUrl} - ${req.method}, error updating product category: ${error}`);
          } else {
            logger.info(`${req.originalUrl} - ${req.method}, product category updated sucessfully`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Product category with id ${product_category_id} was updated successfully`));
          }
        });
      }
    }
  });
};

export const deleteProductCategory = (req, res) => {
  logger.info(`${req.originalUrl} - ${req.method}, deleting product category...`);
  const product_category_id = req.params.id;
  // Search for the product category
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTCATEGORY, [product_category_id], (error, results) => {
    if (error) {
      logger.error(`${req.originalUrl} - ${req.method}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.originalUrl} - ${req.method}, error: Product category not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product category with id ${product_category_id} was not found`));
      } else {
        // Product category found, then delete it
        database.query(PRODUCTCATEGORY_QUERY.DELETE_PRODUCTCATEGORY, [product_category_id], (error, results) => {
          if (error) {
            logger.error(`${req.originalUrl} - ${req.method}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            logger.info(`${req.originalUrl} - ${req.method}, product category deleted successfully`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Product category with id ${product_category_id} was deleted successfully`));
          }
        });
      }
    }
  });
};