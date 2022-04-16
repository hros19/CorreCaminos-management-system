import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import SUPPLIER_QUERY from '../query/supplier.query.js';

const PARAMETER_VALUES = [
  'supplier_id', 'supplier_name', 'formal_address', 'phone_number',
  'email', 'have_delivery'
];

const PARAMETER_PRODBYSUPPLIER_VALUES = [
  'product_id', 'product_name', 'product_subcat_id', 'product_subcat_name', 'supplier_id', 'supplier_name', 'is_available'
];

const PARAMETER_ORDERSBYSUPPLIER_VALUES = [
  'supplier_order_id', 'supplier_id', 'order_date'
];

export const getOrdersBySupplier = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, retrieving orders by supplier...`);
  const supplier_id = req.params.id ? req.params.id : null;
  const parameter = req.param('parameter') || 'supplier_id';
  const order = req.param('order') || 'ASC';
  // Check order value
  if (order !== 'ASC' && order !== 'DESC') {
    logger.error(`${req.method} - ${req.originalUrl}, invalid order value: ${order}`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid order value: ${order}`));
    return;
  }
  // Check parameter values
  if (!PARAMETER_ORDERSBYSUPPLIER_VALUES.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter value: ${parameter}`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameter value: ${parameter}`));
    return;
  }
  // Check supplier id value
  if (supplier_id == null) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Supplier ID is required'));
    return;
  }
  // Search for orders by supplier
  database.query(SUPPLIER_QUERY.SELECT_ORDERS_BY_SUP, [supplier_id], (err, result) => {
    if (err) {
      logger.error(`${req.method} - ${req.originalUrl}, error: ${err}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error retrieving orders by supplier'));
      return;
    } else {
      if (!result[0]) {
        logger.info(`${req.method} - ${req.originalUrl}, no orders found for supplier: ${supplier_id}`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'No orders found for supplier'));
        return;
      } else {
        const page = req.param('pag') ? parseInt(req.param('pag')) : 1;
        const limit = req.param('limit') ? parseInt(req.param('limit')) : 10;
        // Validation of page parameters
        if (isNaN(page) || isNaN(limit)) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid page or limit value: ${page} or ${limit}`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid page or limit value'));
          return;
        }
        // Calculation of pagination parameters
        let numOfResults = result.length;
        let numOfPages = Math.ceil(numOfResults / limit);
        if (page > numOfPages) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid page value: ${page}`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page value: ${page}, max page: ${numOfPages}`));
          return;
        }
        if (page < 1) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid page value: ${page}`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid page value: ${page}, min page: 1`));
          return;
        }
        // Valid pagination parameters
        const startingLimit = (page - 1) * limit;
        database.query(SUPPLIER_QUERY.SELECT_PAGED_ORDERS_BY_SUP, [parameter, order, startingLimit, limit], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error retrieving orders by supplier'));
            return;
          } else {
            if (!results[0]) {
              logger.info(`${req.method} - ${req.originalUrl}, no orders found for supplier: ${supplier_id}`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'No orders found for supplier'));
            } else {
              logger.info(`${req.method} - ${req.originalUrl}, orders found for supplier: ${supplier_id}`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Orders found for supplier', { data: results[0], page, numOfPages }));
            }
          }
        });
      }
    }
  });
}

export const getProductsBySupplier = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting products by supplier`);
  const supplier_id = req.params.id;
  const parameter = req.param('parameter') ? req.param('parameter') : 'product_id';
  const order = req.param('order') ? req.param('order') : 'ASC';
  // Checking order values
  if (order !== 'ASC' && order !== 'DESC') {
    logger.error(`${req.method} - ${req.originalUrl}, invalid order value`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Order must be ASC or DESC'));
    return;
  }
  // Checking parameter values
  if (!PARAMETER_PRODBYSUPPLIER_VALUES.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter value`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Parameter must be one of the following: ' + PARAMETER_PRODBYSUPPLIER_VALUES.join(', ')));
    return;
  }
  // Checking if the supplier_id exists
  database.query(SUPPLIER_QUERY.SELECT_SUPPLIER, [supplier_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
      return;
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, supplier_id not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Supplier not found'));
        return;
      } else {
        // Supplier found, then get the products
        database.query(SUPPLIER_QUERY.SELECT_PRODUCTS_BY_SUPPLIER, [supplier_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            if (!results[0]) {
              logger.info(`${req.method} - ${req.originalUrl}, no products found`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'No products found'));
              return;
            }
            // Products found, apply pagination logic
            const page = req.param('pag') ? parseInt(req.param('pag')) : 1;
            const limit = req.param('limit') ? parseInt(req.param('limit')) : 10;
            if (isNaN(page) || isNaN(limit)) {
              logger.error(`${req.method} - ${req.originalUrl}, invalid pagination values`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Pagination values must be numbers'));
              return;
            }
            // Calculation for pagination on database
            let numOfResults = results.length;
            let numOfPages = Math.ceil(numOfResults / limit);
            if (page > numOfPages) {
              logger.error(`${req.method} - ${req.originalUrl}, invalid pagination values`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Pagination values must be numbers'));
              return;
            }
            if (page < 1) {
              logger.error(`${req.method} - ${req.originalUrl}, invalid pagination values`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Page must be greater than 1'));
              return;
            }
            const startingLimit = (page - 1) * limit;
            database.query(SUPPLIER_QUERY.GET_PAGED_PRODUCTS_BY_SUPPLIER, [supplier_id, parameter, order, startingLimit, limit], (error, results) => {
              if (error) {
                logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                  .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
              } else {
                if (!results[0]) {
                  logger.info(`${req.method} - ${req.originalUrl}, no products found`);
                  res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'No products found'));
                  return;
                } else {
                  logger.info(`${req.method} - ${req.originalUrl}, products found`);
                  res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, results));
                  return;
                }
              }
            });
          }
        });
      }
    }
  });
};

export const createSupplier = (req, res) => {
  logger.info(`${req.originalUrl} - ${req.method}, creating supplier...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Checking quantity of parameters
  if (BODY_PARAMETERS.length !== 5) {
    logger.error(`${req.originalUrl} - ${req.method}, invalid number of parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid number of parameters'));
    return;
  }
  // Cheking non-empty values
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.originalUrl} - ${req.method}, invalid parameters, empty values are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters, empty values are not allowed'));
    return;
  }
  database.query(SUPPLIER_QUERY.CREATE_SUPPLIER, BODY_PARAMETERS, (error, results) => {
    if (error) {
      if (error.errno == 1064) {
        logger.error(`${req.originalUrl} - ${req.method}, invalid parameters, check documentation`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters, check documentation'));
        return;
      }
      if (error.errno == 1062) {
        logger.error(`${req.originalUrl} - ${req.method}, duplicate entry detected, object not created`);
        res.status(HttpStatus.CONFLICT.code)
          .send(new Response(HttpStatus.CONFLICT.code, HttpStatus.CONFLICT.status, 'Duplicate entry detected, object not created'));
        return;
      }
      logger.error(`${req.originalUrl} - ${req.method}, error executing query: ${error.code}`);
    } else {
      if (!results) {
        logger.error(`${req.originalUrl} - ${req.method}, error executing query: no results`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query: no results'));
      } else {
        const supplier = results[0][0];
        logger.info(`${req.originalUrl} - ${req.method}, supplier created`);
        res.status(HttpStatus.CREATED.code)
          .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Supplier created successfully', { supplier }));
      }
    }
  });
};

export const updateSupplier = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, updating supplier...`);
  // Validating quantity of parameters
  const BODY_PARAMETERS = Object.values(req.body);
  if (BODY_PARAMETERS.length != 5) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters'));
    return;
  }
  // Validating non-empty parameters
  if (BODY_PARAMETERS.includes('', "")) {
    logger.error(`${req.method} - ${req.originalUrl}, empty parameters are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters, empty parameters are not allowed'));
    return;
  }
  // Searching the supplier...
  database.query(SUPPLIER_QUERY.SELECT_SUPPLIER, req.params.id, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error searching supplier: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, supplier not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Supplier not found'));
      } else {
        // Updating the supplier...
        database.query(SUPPLIER_QUERY.UPDATE_SUPPLIER, [req.params.id, ...BODY_PARAMETERS], (error, results) => {
          if (error) {
            if (error.errno == 1064) {
              logger.error(`${req.method} - ${req.originalUrl}, invalid parameters`);
              res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters values, check documentation'));
              return;
            }
            if (error.errno == 1062) {
              logger.error(`${req.method} - ${req.originalUrl}, duplicated entry`);
              res.status(HttpStatus.CONFLICT.code)
                .send(new Response(HttpStatus.CONFLICT.code, HttpStatus.CONFLICT.status, 'Duplicated entry detected, object was not created'));
              return;
            }
            logger.error(`${req.method} - ${req.originalUrl}, error updating supplier: ${error}`);
          } else {
            logger.info(`${req.method} - ${req.originalUrl}, supplier update sucessfully`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Supplier ${req.params.id} updated sucessfully`));
          }
        });
      }
    }
  });
};

export const deleteSupplier = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting supplier...`);
  const supplier_id = req.params.supplier_id;
  // Valid if the supplier exists
  database.query(SUPPLIER_QUERY.SELECT_SUPPLIER, supplier_id, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error searching supplier: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, supplier not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Supplier with id ${supplier_id} was not found`));
      } else {
        // Deleting the supplier...
        database.query(SUPPLIER_QUERY.DELETE_SUPPLIER, supplier_id, (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error deleting supplier: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            logger.info(`${req.method} - ${req.originalUrl}, supplier deleted sucessfully`);
            res.status(HttpStatus.OK.code)
              .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Supplier ${supplier_id} deleted sucessfully`));
          }
        });
      }
    }
  });
};

export const getSupplier = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, getting supplier...`);
  const supplier_id = req.params.id;
  database.query(SUPPLIER_QUERY.SELECT_SUPPLIER, [supplier_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.info(`${req.method} ${req.originalUrl}, supplier not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The supplier with id ${supplier_id} was not found`));
      } else {
        logger.info(`${req.method} ${req.originalUrl}, supplier found`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, results[0]));
      }
    }
  });
};

export const getPagedSuppliers = (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, retrieving paged suppliers...`);
  const parameter = req.param('parameter') ? req.param('parameter') : 'supplier_name';
  const order = req.param('order') ? req.param('order').toUpperCase() : 'ASC';
  // Checking order values
  if (order !== 'ASC' && order !== 'DESC') {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid order parameter'));
    return;
  }
  // Checking parameter values
  if (!PARAMETER_VALUES.includes(parameter)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameter for order, check documentation'));
    return;
  }
  database.query(SUPPLIER_QUERY.SELECT_SUPPLIERS, (error, results) => {
    if (error) {
      logger.error(`${req.method} ${req.originalUrl}, error retrieving suppliers: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
      return;
    }
    if (!results[0]) {
      logger.info(`${req.method} ${req.originalUrl}, no suppliers found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No suppliers found'));
      return;
    }
    const page = req.param('pag') ? parseInt(req.param('pag'), 10) : 1;
    const limit = req.param('limit') ? parseInt(req.param('limit'), 10) : 10;
    if (isNaN(page) || isNaN(limit)) {
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid pag or limit parameter'));
      return;
    }
    // Calculation for pagination parameters
    let numOfResults = results.length;
    let numOfPages = Math.ceil(numOfResults / limit);
    if (page > numOfPages) {
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid pag parameter'));
      return;
    }
    if (page < 1) {
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid pag parameter'));
      return;
    }
    // Valid pagination parameters
    const startingLimit = (page - 1) * limit;
    database.query(SUPPLIER_QUERY.SELECT_PAGED_SUPPLIERS, [parameter, order, startingLimit, limit], (error, results) => {
      if (error) {
        logger.error(`${req.method} ${req.originalUrl}, error retrieving paged suppliers: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
        return;
      }
      if (!results[0]) {
        logger.info(`${req.method} ${req.originalUrl}, no suppliers found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No suppliers found'));
        return;
      } else {
        logger.info(`${req.method} ${req.originalUrl}, suppliers retrieved successfully`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, { data: results[0], page, numOfPages }));
        return;
      }
    });
  });
};