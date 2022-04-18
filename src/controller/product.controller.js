import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import PRODUCT_QUERY from '../query/product.query.js';
import SUPPLIER_QUERY from '../query/supplier.query.js';
import PRODUCTCATEGORY_QUERY from '../query/productcategory.query.js';

const PARAMETER_VALUES = [
  'product_id', 'product_name', 'supplier_id', 'product_cat_id', 'product_subcat_id', 'is_available'
];

export const createProduct = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, creating product...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check parameter quantity
  if (BODY_PARAMETERS.length !== 5) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter quantity`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter quantity'));
    return;
  }
  // Check no empty values
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter value, empty parameters are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, empty parameters are not allowed'));
    return;
  }
  // We need to get 3 obligatory parameters
  const supplier_id = req.body.supplier_id || null;
  const product_sub_cat_id = req.body.product_subcat_id ||  null;
  const is_available = req.body.is_available.toUpperCase() || null;
  // Check if there is some null parameter
  if (supplier_id === null || product_sub_cat_id === null || is_available === null) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter value, parameters (supplier_id, product_sub_cat_id, is_available) cannot be null`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, parameters (supplier_id, product_sub_cat_id, is_available) cannot be null'));
    return;
  }
  // Check the 'is_available' parameter
  if (is_available !== 'YES' && is_available !== 'NO') {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter value, is_available parameter must be YES or NO`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, is_available parameter must be YES or NO'));
    return;
  }
  // Check if the supplier exists
  database.query(SUPPLIER_QUERY.SELECT_SUPPLIER, [supplier_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, supplier does not exist`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Supplier does not exist'));
        return;
      } else {
        // Supplier found, we need to check if the product  sub category exists
        database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTSUBCATEGORY, [product_sub_cat_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
            return;
          } else {
            if (!results[0]) {
              logger.error(`${req.method} - ${req.originalUrl}, product sub category does not exist`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product sub category does not exist'));
              return;
            } else {
              // Product sub category found, then create the product
              database.query(PRODUCT_QUERY.CREATE_PRODUCT, BODY_PARAMETERS, (error, results) => {
                if (error) {
                  if (error.errno == 1064) {
                    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter values, check documentation`);
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, check documentation'));
                    return;
                  }
                  if (error.errno == 1062) {
                    logger.error(`${req.method} - ${req.originalUrl}, duplicate entry, object not created`);
                    res.status(HttpStatus.CONFLICT.code)
                      .send(new Response(HttpStatus.CONFLICT.code, HttpStatus.CONFLICT.status, 'Duplicate entry detected, object not created'));
                    return;
                  }
                  logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
                } else {
                  if (!results) {
                    logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
                    return;
                  } else {
                    const product = results[0][0];
                    logger.info(`${req.method} - ${req.originalUrl}, product created successfully`);
                    res.status(HttpStatus.CREATED.code)
                      .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Product created successfully', { product }));
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

export const getProduct = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting product...`);
  const product_id = req.params.id;
  database.query(PRODUCT_QUERY.SELECT_PRODUCT, [product_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting product: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error getting product'));
      return;
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, product not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product not found'));
        return;
      } else {
        logger.info(`${req.method} - ${req.originalUrl}, product found successfully`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Product found successfully', results[0]));
      }
    }
  });
};

export const getPagedProducts = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting paged products...`);
  const parameter = req.body.parameter || 'product_id';
  const order = req.body.order || 'ASC';
  // Checking order values
  if (order !== 'ASC' && order !== 'DESC') {
    logger.error(`${req.method} - ${req.originalUrl}, invalid order value, must be ASC or DESC`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid order value, must be ASC or DESC'));
    return;
  }
  // Checking parameter values
  if (!PARAMETER_VALUES.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter for order value`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter for order value'));
    return;
  }
  // Checking empty values
  if (PARAMETER_VALUES.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter value, must be one of ${PARAMETER_VALUES}`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, must be one of ' + PARAMETER_VALUES));
    return;
  }
  database.query(PRODUCT_QUERY.SELECT_PRODUCTS, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting products: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error getting products'));
      return;
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, no products found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No products found'));
        return;
      } else {
        const page = Number(req.body.pag) || 1;
        const limit = Number(req.body.limit) || 10;
        if (limit < 1 || limit > 100) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid limit value, must be between 1 and 100`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid limit value, must be between 1 and 100'));
          return;
        }
        // Calculation for pagination parameters
        let numOfResults = results.length;
        let numOfPages = Math.ceil(numOfResults / limit);
        if (page > numOfPages) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid page value, must be between 1 and ${numOfPages}`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid page value, must be between 1 and ' + numOfPages));
          return;
        }
        if (page < 1) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid page value, must be between 1 and ${numOfPages}`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid page value, must be between 1 and ' + numOfPages));
          return;
        }
        // Valid pagination parameters
        const startingLimit = (page - 1) * limit;
        database.query(PRODUCT_QUERY.SELECT_PAGED_PRODUCTS, [parameter, order, startingLimit, limit], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error getting paged products: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error getting paged products'));
            return;
          } else {
            if (!results[0]) {
              logger.error(`${req.method} - ${req.originalUrl}, no paged products found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No paged products found'));
              return;
            } else {
              logger.info(`${req.method} - ${req.originalUrl}, paged products found successfully`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Paged products found successfully', { data: results[0], page, numOfPages }));
            }
          }
        });
      }
    }
  });
};

// product_id, product_name, subcatid, isavailavalble
export const updateProduct = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, updating product...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length !== 4) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter values, must be 4`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, body must have 4 parameters'));
    return;
  }
  // Check non empty values
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter values, empty parameters are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, empty parameters are not allowed'));
    return;
  }
  // Check obligatory parameters
  const product_id = req.params.id;
  const product_sub_cat_id = req.body.product_subcat_id || null;
  const is_available = req.body.is_available.toUpperCase() || 'YES';
  // Check if there is any obligatory parameter is null
  if (product_id === null || product_sub_cat_id === null || is_available === null) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter values, parameters (product_id, product_sub_cat_id, is_available) are obligatory`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, parameters (product_id, product_sub_cat_id, is_available) are obligatory'));
    return;
  }
  // Check is_available value
  if (is_available !== 'YES' && is_available !== 'NO') {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter values, is_available must be YES or NO`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, is_available must be YES or NO'));
    return;
  }
  // Check if the prduct exists
  database.query(PRODUCT_QUERY.SELECT_PRODUCT, [product_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting product: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error getting product'));
      return;
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, product not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product not found'));
        return;
      } else {
        // Product found, then check if subcategory exists
        database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTSUBCATEGORY, [product_sub_cat_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error getting product subcategory: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error getting product subcategory'));
            return;
          } else {
            if (!results[0]) {
              logger.error(`${req.method} - ${req.originalUrl}, product subcategory not found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product subcategory not found'));
              return;
            } else {
              // Product subcategory found, then update
              database.query(PRODUCT_QUERY.UPDATE_PRODUCT, [req.params.id, ...BODY_PARAMETERS], (error, results) => {
                if (error) {
                  if (error.errno == 1064) {
                    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter values, check documentation`);
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, check documentation'));
                    return;
                  }
                  if (error.errno == 1062) {
                    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters, duplicated entry detected`);
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter values, duplicated entry detected'));
                    return;
                  }
                  logger.error(`${req.method} - ${req.originalUrl}, error updating product: ${error}`);
                } else {
                  logger.info(`${req.method} - ${req.originalUrl}, product updated`);
                  res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Product updated'));
                }
              });
            }
          }
        });
      }
    }
  });
};

export const deleteProduct = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting product...`);
  // Check if product exists
  database.query(PRODUCT_QUERY.SELECT_PRODUCT, [req.params.id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting product: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error getting product'));
      return;
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, product not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product not found'));
        return;
      } else {
        // Product found, then delete
        database.query(PRODUCT_QUERY.DELETE_PRODUCT, [req.params.id], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error deleting product: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error deleting product'));
            return;
          } else {
            if (results.affectedRows > 0) {
              logger.info(`${req.method} - ${req.originalUrl}, product deleted`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Product deleted'));
            } else {
              logger.error(`${req.method} - ${req.originalUrl}, product not deleted`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product not deleted'));
            }
          }
        });
      }
    }
  });
};