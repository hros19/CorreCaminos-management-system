import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import BUSINESSSTOCK_QUERY from '../query/business_stock.query.js';
import PRODUCT_QUERY from '../query/product.query.js';
import SUPPLIER_QUERY from '../query/supplier.query.js';

/*
SELECT_PAGED_PRODUCTS_IN_STOCK: 'CALL getp_businessStock(?, ?, ?, ?)',
  SELECT_PRODUCTS_IN_STOCK: 'SELECT * FROM BusinessStock',
  REGISTER_PRODUCT_IN_STOCK: 'CALL reg_prod_bussStock(?, ?)',
  FILL_PRODUCT_IN_STOCK: 'CALL fill_product_bussStock(?, ?)',
  UNREG_PRODUCT_IN_STOCK: 'CALL unreg_product_bussStock(?, ?)',
  DELETE_PRODUCT_IN_STOCK: 'DELETE FROM BusinessStock WHERE product_id = ?'
*/

// Fill products in stock
export const fillProductsInStock = async (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, filling products in stock...`);
  const paramProducts = req.param('products') ? req.param('products') : null;
  // Check if the param 'products' is not null
  if (paramProducts === null) {
    logger.error(`${req.method} - ${req.originalUrl}, products were not passed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Products were not passed'));
    return;
  }
  // Try to transform into a JSON object
  let products;
  try {
    products = JSON.parse(paramProducts);
  } catch (err) {
    logger.error(`${req.method} - ${req.originalUrl}, error parsing products: ${err}`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Error parsing products'));
    return;
  }
  // Check if products is an empty list
  if (products.length === 0) {
    logger.error(`${req.method} - ${req.originalUrl}, products were not passed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Products were not passed'));
    return;
  }
  const productsInStock = [];
  // Check for every item in the list is a valid tuple
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (!Object.keys(product).includes('product_id') || !Object.keys(product).includes('quantity')) {
      logger.error(`${req.method} - ${req.originalUrl}, the product ${product} is not valid, it must have the keys product_id and quantity`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The product ${product} is not valid, it must have the keys product_id and quantity`));
      return;
    }
    // Check every 'quantity' parameter if is a valid number
    if (isNaN(product.quantity) || product.quantity <= 0) {
      logger.error(`${req.method} - ${req.originalUrl}, the item in index ${i} is invalid, the quantity ${product.quantity} is not a valid value`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The quantity ${product.quantity} is not valid`));
      return;
    }
    // Check for every 'product_id' parameter if is an existing product
    let result = await existsProductInStock(product.product_id);
    if (result.length == 0) {
      logger.error(`${req.method} - ${req.originalUrl}, the product ${product.product_id} does not exist in the stock`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The product ${product.product_id} does not exist in the stock`));
      return;
    }
    productsInStock.push(result[0]);
  }
  // All valid products, try to fill them in the stock
  for (let i in productsInStock) {
    console.log(productsInStock[i]);
  }
};

let existsProductInStock = async (productId) => {
  let results = await new Promise((resolve, reject) => database.query(PRODUCT_QUERY.SELECT_PRODUCT, [productId], (err, results) => {
    if (err) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting product: ${err}`);
      reject(err);
    } else{
      resolve(results);
    }
  }));
  return results;
};

export const fillProtuctInStock = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, filling product in stock...`);
  const product_id = req.params.id;
  const BODY_PARAMETERS = Object.values(req.body);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length !== 1) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'The request body must have only one parameter'));
    return;
  }
  // Check non-empty parameter values
  if (BODY_PARAMETERS[0] === '') {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'The request body must have a non-empty parameter value'));
    return;
  }
  const quantityToFill = parseInt(BODY_PARAMETERS[0], 10) ? parseInt(BODY_PARAMETERS[0], 10) : 0;
  if (isNaN(quantityToFill)) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'The request body must have a valid parameter value'));
    return;
  }
  // Check if is a valid amount
  if (quantityToFill <= 0) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'The request body must have a valid parameter value'));
    return;
  }
  // Check if the product exists in stock
  database.query(BUSINESSSTOCK_QUERY.SELECT_PRODUCT_IN_STOCK, [product_id], (error, results) => {
    if (error) {
      console.log(`>>>>> 1`);
      logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
      return;
    } else {
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, error: Product with id ${product_id} does not exist in stock`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'The product does not exist in stock'));
      } else {
        // Product is in stock then we need to get the
        // information of the entire product
        database.query(PRODUCT_QUERY.SELECT_PRODUCT, [product_id], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error));
            return;
          } else {
            if (!results[0]) {
              logger.error(`${req.method} - ${req.originalUrl}, error: Product with id ${product_id} does not exist`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'The product does not exist'));
            } else {
              const product = results[0];
              // Check if the product is available
              if (product.is_available != 'YES') {
                logger.error(`${req.method} - ${req.originalUrl}, error: Product with id ${product_id} is not available`);
                res.status(HttpStatus.NOT_FOUND.code)
                  .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'The product is not available'));
                return;
              }
              // We can only make a order to a supplier per week, the query check that
              const supplier_id = product.supplier_id;
              database.query(SUPPLIER_QUERY.CREATE_SUPPLIER_ORDER, [supplier_id], (error, results) => {
                if (error) {
                  if (error.errno == 1000) {
                    logger.error(`${req.method} - ${req.originalUrl}, error: The supplier with id ${supplier_id} has already a order registered this week`);
                    res.status(HttpStatus.NOT_FOUND.code)
                      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'The supplier already has a order registered this week'));
                    return;
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
  // Quantity of products to remove
  const quantityToRem = parseInt(BODY_PARAMETERS[0], 10) ? parseInt(BODY_PARAMETERS[0], 10) : 0;
  if (isNaN(quantityToRem)) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid quantity of products to remove`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid quantity of products to remove'));
    return;
  }
  // Check if quantity is greater than zero
  if (quantityToRem <= 0) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid quantity of products to remove`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid quantity of products to remove'));
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
        const product = results[0];
        // Check if the current quantity in stock is valid
        if (product.quantity < 0) {
          logger.error(`${req.method} - ${req.originalUrl}, invalid quantity of products in stock (${product.quantity})`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid quantity of products in stock, current amount is ${product.quantity}`));
          return;
        }
        // Check if the amount overpass the product quantity
        if (product.quantity < quantityToRem) {
          logger.error(`${req.method} - ${req.originalUrl}, Current quantity in stock is less than the quantity to remove`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Current stock is less than the quantity to remove'));
          return;
        }
        // Amounts look good, lets remove the products in stock
        database.query(BUSINESSSTOCK_QUERY.UNREG_PRODUCT_IN_STOCK, [product_id, quantityToRem], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
            return;
          } else {
            if (results.affectedRows > 0) {
              logger.info(`${req.method} - ${req.originalUrl}, product removed from stock`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Product removed from stock'));
              return;
            } else {
              logger.error(`${req.method} - ${req.originalUrl}, product not removed from stock`);
              res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Product not removed from stock'));
              return;
            }
          }
        });
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