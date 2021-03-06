import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import BUSINESSSTOCK_QUERY from '../query/business_stock.query.js';
import PRODUCT_QUERY from '../query/product.query.js';
import SUPPLIER_QUERY from '../query/supplier.query.js';


const PARAMETER_VALUES = [
  'product_id', 'quantity'
];

export const getPagedProductsInStock = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, retrieving products in stock...`);
  const parameter = req.body.parameter || 'product_id';
  const order = req.body.order || 'ASC';
  // Check order value
  if (order !== 'ASC' && order !== 'DESC') {
    logger.error(`${req.method} - ${req.originalUrl}, invalid order value: ${order}`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid order value: ${order}`));
    return;
  }
  // Check parameter values
  if (!PARAMETER_VALUES.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, invalid parameter value: ${parameter}`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameter value: ${parameter}`));
    return;
  }
  database.query(BUSINESSSTOCK_QUERY.SELECT_PRODUCTS_IN_STOCK, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting products in stock: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Error getting products in stock: ${error}`));
    } else {
      if (!results[0]) {
        logger.info(`${req.method} - ${req.originalUrl}, no products in stock`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No products in stock'));
      } else {
        const page = Number(req.body.pag) || 1;
        const limit = Number(req.body.limit) || 10;
        // Validation of page parameters
        if (limit < 1 || limit > 100) {
          logger.error(`${req.method} - ${req.originalUrl}, the parameter limit is not valid`);
          res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter limit is not valid`));
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
        database.query(BUSINESSSTOCK_QUERY.SELECT_PAGED_PRODUCTS_IN_STOCK, [parameter, order, startingLimit, limit], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error getting products in stock: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Error getting products in stock: ${error}`));
          } else {
            if (!results[0]) {
              logger.info(`${req.method} - ${req.originalUrl}, no products in stock`);
              res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No products in stock'));
            } else {
              logger.info(`${req.method} - ${req.originalUrl}, products in stock retrieved successfully`);
              res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Products in stock retrieved successfully', { data: results[0], page, numOfPages }));
            }
          }
        });
      }
    }
  });
};

export const getProdInStock = async (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, retrieving product in stock...`);
  let result = await getProductInStock(req.param('id'));
  if (result[0]) {
    logger.info(`${req.method} - ${req.originalUrl}, product in stock retrieved successfully`);
    res.status(HttpStatus.OK.code)
      .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Product in stock retrieved successfully', result[0]));
  } else {
    logger.info(`${req.method} - ${req.originalUrl}, product in stock not found`);
    res.status(HttpStatus.NOT_FOUND.code)
      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Product in stock not found'));
  }
};

export const registerProductInStock = async (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, registering new product in stock`);
  const product_id = req.params.id ? req.params.id : null;
  const quantity = req.body.quantity ? req.body.quantity : null;
  // Check if values are null
  if (product_id == null || quantity == null) {
    logger.error(`${req.method} - ${req.originalUrl}, missing parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Missing parameters`));
    return;
  }
  // Check if quantity is valid
  if (quantity <= 0) {
    logger.error(`${req.method} - ${req.originalUrl}, quantity must be greater than 0`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Quantity must be greater than 0`));
    return;
  }
  // Check if the product exists
  let result = await getProduct(product_id);
  if (!result[0]) {
    logger.error(`${req.method} - ${req.originalUrl}, product does not exist`);
    res.status(HttpStatus.NOT_FOUND.code)
      .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Product does not exist`));
    return;
  }
  // Check if the product is already in stock
  result = await getProductInStock(product_id);
  if (result[0]) {
    logger.error(`${req.method} - ${req.originalUrl}, product is already in stock`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Product is already in stock, you cant register again the product ${product_id}`));
    return;
  }
  // Product not in stock, then register it
  database.query(BUSINESSSTOCK_QUERY.REGISTER_PRODUCT_IN_STOCK, [product_id, quantity], (err, result) => {
    if (err) {
      logger.error(`${req.method} - ${req.originalUrl}, error registering product in stock: ${err}`);
      if (err.errno == 1064) {
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Invalid parameters values`));
        return;
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Error registering product in stock`));
    } else {
      if (!result) {
        logger.error(`${req.method} - ${req.originalUrl}, error registering product in stock`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Error registering product in stock`));
      } else {
        const product = result[0][0];
        logger.info(`${req.method} - ${req.originalUrl}, product registered in stock`);
        res.status(HttpStatus.CREATED.code)
          .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `Product registered in stock`, { product }));
      }
    }
  });
}

// Fill (existing) products in stock
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
    if (product.quantity === undefined || product.quantity === null || product.quantity <= 0) {
      logger.error(`${req.method} - ${req.originalUrl}, the item in index ${i} is invalid, the quantity ${product.quantity} is not a valid value`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The quantity ${product.quantity} is not valid`));
      return;
    }
    // Check for every 'product_id' parameter if is an existing product in stock
    let result = await getProductInStock(product.product_id);
    if (result.length == 0) {
      logger.error(`${req.method} - ${req.originalUrl}, the product ${product.product_id} does not exist in the stock`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The product ${product.product_id} does not exist in the stock`));
      return;
    }
    productsInStock.push(result[0]);
  }
  // All the products are in stock, then retrieve the main information of the product
  let productRows = [];
  for (let i in productsInStock) {
    const product_id = productsInStock[i].product_id;
    let result = await getProduct(product_id);
    if (result.length == 0) {
      logger.error(`${req.method} - ${req.originalUrl}, the product ${product_id} does not exist`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The product ${product_id} does not exist`));
      return;
    }
    // Check if the product is available
    if (result[0].is_available == 'NO') {
      logger.error(`${req.method} - ${req.originalUrl}, the product ${product_id} is not available`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The product ${product_id} is not available`));
      return;
    }
    // Check the last order of the supplier by the product
    let supplier_id = result[0].supplier_id;
    let results = await getLastOrderOfSup(supplier_id);
    // If result is null, indicates that there are not orders of the supplier registered
    let lastOrderObject = results[0].lastOrder;
    if (lastOrderObject != null) {
      let actualDate = new Date();
      let lastOrderDate = new Date(lastOrderObject);
      // Check if the last order is older than 7 days
      let dayBetweenLastOrder = (actualDate.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
      if (dayBetweenLastOrder < 8) {
        logger.error(`${req.method} - ${req.originalUrl}, a new order of the product ${product_id} can not be registered because the last order was registered less than 7 days ago`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `A new order of the product ${product_id} can not be registered because the last order was registered less than 7 days ago`));
        return;
      }
    }
    /* Everything seems ok, then we need to add those products to a new list.
    The difference between productRows and productsInStock is that 'productInStock' 
    objets are just a register from the business stock, the 'productRows' 
    objects are the main information of the product that is contained in 'Product' table.*/
    productRows.push(result[0]);
  }
  // At this point, all the products are available. The we need to open a SupplierOrder and then register the products
  let supplierOrderIds = [];
  for (let i in productRows) {
    const product = productRows[i];
    const supplier_id = product.supplier_id;
    const result = await openSupplierOrder(supplier_id);
    if (result[0].length == 0) {
      // This might be a fatal error
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `The order for the supplier ${supplier_id} could not be opened, fatal error`));
      return;
    }
    // If a value is duplicated, doesnt matter. The last one will be used
    if (result[0] != 'duplicate') {
      supplierOrderIds.push(result[0][0].ID);
    }
  }
  // Get the respective supplier orders
  let supplierOrders = [];
  for (let i in supplierOrderIds) {
    const supplierOrderId = supplierOrderIds[i];
    let result = await getSupplierOrder(supplierOrderId);
    if (result[0].length == 0) {
      // This might be a fatal error
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `The supplier order ${supplierOrderId} could not be retrieved, fatal error`));
      return;
    }
    supplierOrders.push(result[0]);
  }
  // For each supplier order, we register the details for each product
  for (let i in supplierOrders) {
    for (let j in productRows) {
      const supplierOrder = supplierOrders[i];
      const product = productRows[j];
      const quantity = products[j].quantity;
      if (supplierOrder.supplier_id == product.supplier_id) {
        // Register the supplier order detail
        let result = await createSupplierOrderDetail(supplierOrder.supplier_order_id, product.product_id, quantity);
        if (result.affectedRows > 0) {
          continue;
        } else {
          // This might be a fatal error
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `The supplier order detail ${supplierOrder.supplier_order_id} for the product ${product.product_id} could not be registered, fatal error`));
          return;
        }
      }
    }
  }
  // All products registered!
  res.status(HttpStatus.CREATED.code)
    .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `The products were registered successfully`));
};

let createSupplierOrderDetail = async(supplierOrderId, productId, quantity) => {
  let result = await new Promise((resolve, reject) => database.query(SUPPLIER_QUERY.CREATE_SUPPLIER_ORD_DETAIL, [supplierOrderId, productId, quantity], (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  }));
  return result;
};

let getSupplierOrder = async (supplierOrderId) => {
  let result = await new Promise((resolve, reject) => database.query(SUPPLIER_QUERY.SELECT_SUPPLIER_ORDER, [supplierOrderId], (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  }));
  return result;
};

let openSupplierOrder = async (supplier_id) => {
  let result = await new Promise((resolve, reject) => database.query(SUPPLIER_QUERY.CREATE_SUPPLIER_ORD, [supplier_id], (err, result) => {
    if (err) {
      if (err.errno == 1062) {
        resolve(["duplicate"]);
      } else {
        reject(err);
      }
    } else {
      resolve(result);
    }
  }));
  return result;
};

let getLastOrderOfSup = async(supplier_id) => {
  let result = await new Promise((resolve, reject) => database.query(SUPPLIER_QUERY.GET_LAST_ORDER_OF_SUP, [supplier_id], (err, result) => {
    if (err) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting last order of supplier ${supplier_id}: ${err}`);
      reject(err);
    } else {
      resolve(result);
    }
  }));
  return result;
};

let getProduct = async (productId) => {
  let result = await new Promise((resolve, reject) => database.query(PRODUCT_QUERY.SELECT_PRODUCT, [productId], (err, result) => {
    if (err) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting product: ${err}`);
      reject(err);
    } else {
      resolve(result);
    }
  }));
  return result;
};

let getProductInStock = async (productId) => {
  let results = await new Promise((resolve, reject) => database.query(BUSINESSSTOCK_QUERY.SELECT_PRODUCT_IN_STOCK, [productId], (err, results) => {
    if (err) {
      logger.error(`Error getting product: ${err}`);
      reject(err);
    } else{
      resolve(results);
    }
  }));
  return results;
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
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Product removed from stock, current amount is ${product.quantity - quantityToRem}`));
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