import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import PRODUCTCATEGORY_QUERY from '../query/productcategory.query.js';

// Product category controller
export const createProductCategory = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, creating product category...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length !== 1) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters'));
  }
  // Check non-empty parameters
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters, empty values are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters, empty values are not allowed'));
    return;
  }
  database.query(PRODUCTCATEGORY_QUERY.CREATE_PRODUCTCATEGORY, BODY_PARAMETERS, (error, results) => {
    if (error) {
      if (error.errno == 1064) {
        logger.error(`${req.method} - ${req.originalUrl}, invalid parameters`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters'));
        return;
      }
      if (error.errno == 1062) {
        logger.error(`${req.method} - ${req.originalUrl}, duplicate entry`);
        res.status(HttpStatus.CONFLICT.code)
          .send(new Response(HttpStatus.CONFLICT.code, HttpStatus.CONFLICT.status, 'Duplicate entry values, object not created'));
        return;
      }
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error.code}`);
    } else {
      if (!results) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: no results`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query, no results'));
      } else {
        const productCategory = results[0][0];
        logger.info(`${req.method} - ${req.originalUrl}, product category created`);
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
  const parameter = req.body.parameter || 'product_cat_id';
  const order = req.body.order || 'ASC';
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
      const page = Number(req.body.pag) || 1;
      const limit = Number(req.body.limit) || 10;
      if (limit < 1 || limit > 100) {
        logger.error(`${req.method} - ${req.originalUrl}, invalid limit value`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid limit value'));
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
  logger.info(`${req.method} - ${req.originalUrl}, updating product category...` );
  const product_category_id = req.params.id;
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length != 1) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid quantity of parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid request parameters, check the documentation'));
    return;
  }
  // Check no-empty parameters
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters, one or more parameters are empty`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid request parameters, one or more parameters are empty'));
    return;
  }
  // Search if the product category exists
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTCATEGORY, [product_category_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error searching product category: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, product category not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product category with id ${product_category_id} was not found`));
      } else {
        // Updating the product category
        database.query(PRODUCTCATEGORY_QUERY.UPDATE_PRODUCTCATEGORY, [product_category_id, ...BODY_PARAMETERS], (error, results) => {
          if (error) {
            if (error.errno == 1064) {
              logger.error(`${req.method} - ${req.originalUrl}, invalid parameters value, check the documentation`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters value, check the documentation'));
              return;
            }
            if (error.errno == 1062) {
              logger.error(`${req.method} - ${req.originalUrl}, Duplicate entry detected, object was not created`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Duplicate entry detected, object was not created'));
              return;
            }
            logger.error(`${req.method} - ${req.originalUrl}, error updating product category: ${error}`);
          } else {
            logger.info(`${req.method} - ${req.originalUrl}, product category updated sucessfully`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Product category with id ${product_category_id} was updated successfully`));
          }
        });
      }
    }
  });
};

export const deleteProductCategory = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting product category...`);
  const product_category_id = req.params.id;
  // Search for the product category
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTCATEGORY, [product_category_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, error: Product category not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product category with id ${product_category_id} was not found`));
      } else {
        // Product category found, then delete it
        database.query(PRODUCTCATEGORY_QUERY.DELETE_PRODUCTCATEGORY, [product_category_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            logger.info(`${req.method} - ${req.originalUrl}, product category deleted successfully`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Product category with id ${product_category_id} was deleted successfully`));
          }
        });
      }
    }
  });
};

// Product subcategory controller
const PARAMETER_VALUES = [
  'Category_id', 'Category_name', 'SubCategory_id', 'SubCategory_name'
];

export const createProductSubCat = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, creating product subcategory...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length != 2) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters quantity, check the documentation`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters quantity, check the documentation'));
    return;
  }
  // Checking no empty parameters
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters value, empty values are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters value, empty values are not allowed'));
    return;
  }
  const product_cat_id = Number(BODY_PARAMETERS[1]) || null;
  if (product_cat_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters value, check the documentation`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters value, check the documentation'));
    return;
  }
  // Check if the product category exists
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTCATEGORY, [product_cat_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, error: Product category not found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product category with id ${product_cat_id} was not found`));
      return;
    }
    database.query(PRODUCTCATEGORY_QUERY.CREATE_PRODUCTSUBCATEGORY, BODY_PARAMETERS, (error, results) => {
      if (error) {
        if (error.errno == 1064) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid parameters value, check the documentation`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters value, check the documentation'));
          return;
        }
        if (error.errno == 1062) {
          logger.error(`${req.method} - ${req.originalUrl}, Duplicate entry detected, object was not created`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Duplicate entry detected, object was not created'));
          return;
        }
        logger.error(`${req.method} - ${req.originalUrl}, error creating product subcategory: ${error}`);
      } else {
        if (!results) {
          logger.error(`${req.method} - ${req.originalUrl}, error creating product subcategory: ${error}`);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
        } else {
          const sub_cat = results[0][0];
          logger.info(`${req.method} - ${req.originalUrl}, product subcategory created successfully`);
          res.status(HttpStatus.CREATED.code)
            .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Product subcategory created successfully', { sub_cat }));
        }
      }
    });
  });
};

export const getProductSubCategory = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting product subcategory...`);
  const product_sub_cat_id = req.params.id;
  // Search for the product subcategory
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTSUBCATEGORY, [product_sub_cat_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, error: Product subcategory not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product subcategory with id ${product_sub_cat_id} was not found`));
      } else {
        logger.info(`${req.method} - ${req.originalUrl}, product subcategory found`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, results[0]));
      }
    }
  });
};

export const getPagedProductSubCats = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting paged product subcategories...`);
  const parameter = req.body.parameter || 'product_subcat_id';
  const order = req.body.order || 'ASC';
  // Checking order values
  if (order != 'ASC' && order != 'DESC') {
    logger.error(`${req.method} - ${req.originalUrl}, invalid order value, order must be ASC or DESC`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid order value, order must be ASC or DESC'));
    return;
  }
  // Checking parameter values
  if (!PARAMETER_VALUES.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter value, parameter must be one of ${PARAMETER_VALUES}`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter value, parameter must be one of ' + PARAMETER_VALUES));
    return;
  }
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTSUBCATEGORIES, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, error: Product subcategories not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product subcategories not found'));
      } else {
        const page = Number(req.body.pag) || 1;
        const limit = Number(req.body.limit) || 10;
        if (limit < 1 || limit > 100) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid limit value, limit must be between 1 and 100`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid limit value, limit must be between 1 and 100'));
          return;
        }
        // Calculation for pagination parameters
        let numOfResults = results.length;
        let numOfPages = Math.ceil(numOfResults / limit);
        if (page > numOfPages) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid pag value, pag must be less than ${numOfPages}`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid pag value, pag must be less than ${numOfPages}`));
          return;
        }
        if (page < 1) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid pag value, pag must be greater than 0`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid pag value, pag must be greater than 0`));
          return;
        }
        // Valid pagination parameters
        const startingLimit = (page - 1) * limit;
        database.query(PRODUCTCATEGORY_QUERY.SELECT_PAGED_PRODUCTSUBCATEGORIES, [parameter, order, limit, startingLimit], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            if (!results[0]) {
              logger.error(`${req.method} - ${req.originalUrl}, error: Product subcategories not found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product subcategories not found'));
            } else {
              logger.info(`${req.method} - ${req.originalUrl}, product subcategories found successfully`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, { data: results[0], page, numOfPages }));
            }
          }
        });
      }
    }
  });
};

export const updateProductSubCat = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, updating product subcategory...`);
  // Validating quantity of parameters
  const BODY_PARAMETERS = Object.values(req.body);
  if (BODY_PARAMETERS.length != 1) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters quantity, check the documentation`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters quantity, check the documentation'));
    return;
  }
  // Validating non-empty parameters
  if (BODY_PARAMETERS[0] == '') {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters value, non-empty parameters are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters value, non-empty parameters are not allowed'));
    return;
  }
  // Searching the product subcategory id
  const product_sub_cat_id = req.params.id;
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTSUBCATEGORY, [product_sub_cat_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, error: Product subcategory not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product subcategory with id ${product_sub_cat_id} was not found`));
      } else {
        // Product subcategory found, then update it
        database.query(PRODUCTCATEGORY_QUERY.UPDATE_PRODUCTSUBCATEGORY, [product_sub_cat_id, ...BODY_PARAMETERS], (error, results) => {
          if (error) {
            if (error.errno == 1064) {
              logger.error(`${req.method} - ${req.originalUrl}, error updating product subcategory: ${error}`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters values, check the documentation`));
              return;
            }
            if (error.errno == 1062) {
              logger.error(`${req.method} - ${req.originalUrl}, error updating product subcategory: ${error}`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Product subcategory with name ${req.body.name} already exists`));
              return;
            }
            logger.error(`${req.method} - ${req.originalUrl}, error updating product subcategory: ${error}`);
          } else {
            logger.info(`${req.method} - ${req.originalUrl}, product subcategory updated sucessfully`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Product subcategory with id ${product_sub_cat_id} was updated successfully`));
          }
        });
      }
    }
  });
};

export const deleteProductSubCat = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting product subcategory...`);
  const product_sub_cat_id = req.params.id;
  // Search for the product subcategory
  database.query(PRODUCTCATEGORY_QUERY.SELECT_PRODUCTSUBCATEGORY, [product_sub_cat_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, error: Product subcategory not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product subcategory with id ${product_sub_cat_id} was not found`));
      } else {
        // Product subcategory found, then delete it
        database.query(PRODUCTCATEGORY_QUERY.DELETE_PRODUCTSUBCATEGORY, [product_sub_cat_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            if (results.affectedRows > 0) {
              logger.info(`${req.method} - ${req.originalUrl}, product subcategory deleted successfully`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Product subcategory with id ${product_sub_cat_id} was deleted successfully`));
            } else {
              logger.error(`${req.method} - ${req.originalUrl}, error: Product subcategory not found`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product subcategory with id ${product_sub_cat_id} was not found`));
            }
          }
        });
      }
    }
  });
};