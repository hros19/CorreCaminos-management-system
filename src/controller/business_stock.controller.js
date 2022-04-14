import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import BUSINESSSTOCK_QUERY from '../query/business_stock.query.js';

/*
SELECT_PAGED_PRODUCTS_IN_STOCK: 'CALL getp_businessStock(?, ?, ?, ?)',
  SELECT_PRODUCTS_IN_STOCK: 'SELECT * FROM BusinessStock',
  REGISTER_PRODUCT_IN_STOCK: 'CALL reg_prod_bussStock(?, ?)',
  FILL_PRODUCT_IN_STOCK: 'CALL fill_product_bussStock(?, ?)',
  UNREG_PRODUCT_IN_STOCK: 'CALL unreg_product_bussStock(?, ?)',
  DELETE_PRODUCT_IN_STOCK: 'DELETE FROM BusinessStock WHERE product_id = ?'
*/

export const unregProductInStock = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, unregistering product in stock...`);
  const product_id = req.params.id;
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length !== 1) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid quantity of parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid quantity of parameters'));
    return;
  }
  // Check non-empty parameters
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameters, empty values are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid parameters, empty values are not allowed'));
    return;
  }
  // Quantity of products to unregister
  const quantity = parseInt(BODY_PARAMETERS[0], 10) ? parseInt(BODY_PARAMETERS[0], 10) : 0;
  if (isNaN(quantity)) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid quantity of products to unregister`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid quantity of products to unregister'));
    return;
  }
  // Check if quantity is greater than zero
  if (quantity <= 0) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid quantity of products to unregister`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid quantity of products to unregister'));
    return;
  }
  // Check if the product exists in stock
  database.query(BUSINESSSTOCK_QUERY.SELECT_PRODUCT_IN_STOCK, [product_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, product not found in stock`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product not found in stock'));
        return;
      } else {
        // Product found in stock, then unregister some amount of products
        console.log(results[0]);
      }
    }
  });
};

export const deleteProductInStock = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting product in stock...`);
  const product_id = req.params.id;
  // Search if the product exists
  database.query(BUSINESSSTOCK_QUERY.SELECT_PRODUCT_IN_STOCK, [product_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error deleting product in stock: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, product not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The product ${product_id} was not found`));
      } else {
        // Delete the product
        database.query(BUSINESSSTOCK_QUERY.DELETE_PRODUCT_IN_STOCK, [product_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error deleting product in stock: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
          } else {
            if (results.affectedRows > 0) {
              logger.info(`${req.method} - ${req.originalUrl}, product deleted`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The product ${product_id} was deleted`));
            } else {
              logger.error(`${req.method} - ${req.originalUrl}, product not deleted`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `The product ${product_id} was not deleted`));
            }
          }
        });
      }
    }
  });
};