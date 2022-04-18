import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import CLIENT_QUERY from '../query/client.query.js';
import ZONE_QUERY from '../query/zone.query.js';
import DELIVERY_QUERY from '../query/delivery.query.js';
import BUSINESSTYPE_QUERY from '../query/businesstype.query.js';
import BUSINESSSTOCK_QUERY from '../query/business_stock.query.js';
import PRODUCT_QUERY from '../query/product.query.js';

// client controller

// zoneid, devintervalid, busstypeid, bussname
// bussrep, phone, email, address, lat, long
export const createClient = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, creating client...`);
  const BODY_PARAMETERS = Object.values(req.body);
  // Check if all parameters are provided
  if (BODY_PARAMETERS.length !== 10) {
    logger.error(`${req.method} - ${req.originalUrl}, missing parameters`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Missing parameters'));
    return;
  }
  // Check if they are no empty parameters
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, empty parameters are not allowed`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Empty parameters are not allowed'));
    return;
  }
  // Check if the zoneid is valid
  const zone_id = req.body.zone_id || null;
  if (zone_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter zone_id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'zone_id is not valid'));
    return;
  }
  database.query(ZONE_QUERY.SELECT_ZONE, [zone_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, zone_id ${zone_id} is not found`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `zone_id ${zone_id} is not found`));
      return;
    }
    // Zone found, then check if the devintervalid is valid
    const dev_interval_id = req.body.dev_interval_id || null;
    if (dev_interval_id == null) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter dev_interval_id is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `dev_interval_id ${dev_interval_id} is not valid`));
      return;
    }
    database.query(DELIVERY_QUERY.SELECT_DEVINTERVAL, [dev_interval_id], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, dev_interval_id ${dev_interval_id} is not found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `dev_interval_id ${dev_interval_id} is not found`));
        return;
      }
      // Delivery Interval found, then check if the busstypeid is valid
      const busstype_id = req.body.business_type_id || null;
      if (busstype_id == null) {
        logger.error(`${req.method} - ${req.originalUrl}, the parameter business_type_id is not valid`);
        res.status(HttpStatus.BAD_REQUEST.code)
          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `business_type_id ${busstype_id} is not valid`));
        return;
      }
      database.query(BUSINESSTYPE_QUERY.SELECT_BUSINESSTYPE, [busstype_id], (error, results) => {
        if (error) {
          logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
          return;
        }
        if (!results[0]) {
          logger.error(`${req.method} - ${req.originalUrl}, business_type_id ${busstype_id} is not found`);
          res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `business_type_id ${busstype_id} is not found`));
          return;
        }
        // Business type found, then create the client
        database.query(CLIENT_QUERY.CREATE_CLIENT, [...BODY_PARAMETERS], (error, results) => {
          if (error) {
            logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
            return;
          }
          if (!results) {
            logger.error(`${req.method} - ${req.originalUrl}, error creating client`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
              .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error creating client'));
            return;
          }
          const client = results[0][0];
          logger.info(`${req.method} - ${req.originalUrl}, client created`);
          res.status(HttpStatus.CREATED.code)
            .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `client created`, { client }));
        });
      });
    });
  });
};

const CLIENT_PARAMETER_VALUES = [
  'client_id', 'business_name', 'business_representative', 'phone_number', 'email', 'address', 'business_type_id', 'business_type_name', 'dev_interval_id', 'dev_interval_name', 'zone_id', 'zone_name', 'formal_address', 'latitude', 'longitude'
];

export const getPagedClients = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, retrieving paged clients...`);
  const parameter = req.body.parameter || `client_id`;
  const order = req.body.order || 'ASC';
  // Check order value
  if (order !== 'ASC' && order !== 'DESC') {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter order is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter order is not valid`));
    return;
  }
  // Check parameter value
  if (!CLIENT_PARAMETER_VALUES.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, the value (parameter) is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the value (parameter) is not valid`));
    return;
  }
  database.query(CLIENT_QUERY.SELECT_CLIENTS, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no clients found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no clients found`));
      return;
    }
    // Clients found, then get the paged clients
    const page = Number(req.body.pag) || 1;
    const limit = Number(req.body.limit) || 10;
    // Validation of page parameters
    if (limit < 1 || limit > 100) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter limit is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter limit is not valid`));
      return;
    }
    // Calculation for pagination parameters
    let numOfResults = results.length;
    let numOfPages = Math.ceil(numOfResults / limit);
    if (page > numOfPages) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter page is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter page is not valid`));
      return;
    }
    if (page < 1) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter page is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter page is not valid`));
      return;
    }
    // Valid pagination parameters
    const startingLimit = (page - 1) * limit;
    database.query(CLIENT_QUERY.SELECT_PAGED_CLIENTS, [parameter, order, startingLimit, limit], (error, results) => {
      if (error){
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, no clients found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no clients found`));
        return;
      }
      logger.info(`${req.method} - ${req.originalUrl}, paged clients retrieved`);
      res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `paged clients retrieved`, { data: results[0], page, numOfPages }));
    });
  });
}

export const getClient = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, retrieving client...`);
  const client_id = Number(req.params.id) || null;
  if (client_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  // Check if the client exists
  database.query(CLIENT_QUERY.SELECT_CLIENT, [client_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client found`));
      return;
    }
    logger.info(`${req.method} - ${req.originalUrl}, client retrieved`);
    res.status(HttpStatus.OK.code)
      .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `client retrieved`, results[0] ));
  });
};

export const updateClient = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, updating client...`);
  const client_id = Number(req.params.id) || null;
  if (client_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  const BODY_PARAMETERS = Object.values(req.body);
  logger.info(`$>>>> ${BODY_PARAMETERS.length != 6}`);
  // Check quantity of parameters
  if (BODY_PARAMETERS.length != 6) {
    logger.error(`${req.method} - ${req.originalUrl}, the body parameters are not valid, quantity of parameters is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the body parameters are not valid, quantity of parameters is not valid`));
    return;
  }
  // Check non empty parameters
  if (BODY_PARAMETERS.includes('')) {
    logger.error(`${req.method} - ${req.originalUrl}, empty parameters are not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `empty parameters are not valid`));
    return;
  }
  // Check if the client exists
  database.query(CLIENT_QUERY.SELECT_CLIENT, [client_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client found`));
      return;
    }
    // client_id, busstype_id, bussname, bussrep, phone, email, address
    // Cliet exists, check if the businesstype exists
    const business_type_id = req.body.business_type_id || null;
    if (business_type_id == null) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter business_type_id is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter business_type_id is not valid`));
      return;
    }
    database.query(BUSINESSTYPE_QUERY.SELECT_BUSINESSTYPE, [business_type_id], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, no business type found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no business type found`));
        return;
      }
      // Business type exists, update the client
      database.query(CLIENT_QUERY.UPDATE_CLIENT, [client_id, ...BODY_PARAMETERS], (error, results) => {
        if (error) {
          logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
          return;
        }
        if (results.affectedRows > 0) {
          logger.info(`${req.method} - ${req.originalUrl}, client updated`);
          res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `client updated`, { client_id, ...req.body }));
        } else {
          logger.error(`${req.method} - ${req.originalUrl}, client not updated`);
          res.status(HttpStatus.NOT_MODIFIED.code)
            .send(new Response(HttpStatus.NOT_MODIFIED.code, HttpStatus.NOT_MODIFIED.status, `client not updated`));
        }
      });
    });
  });
};

export const deleteClient = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting client...`);
  const client_id = Number(req.params.id) || null;
  if (client_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  // Search if the client exists
  database.query(CLIENT_QUERY.SELECT_CLIENT, [client_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client found`));
      return;
    }
    // Client found
    database.query(CLIENT_QUERY.DELETE_CLIENT, [client_id], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (results.affectedRows > 0) {
        logger.info(`${req.method} - ${req.originalUrl}, client deleted`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `client deleted`));
      } else {
        logger.error(`${req.method} - ${req.originalUrl}, client not deleted`);
        res.status(HttpStatus.NOT_MODIFIED.code)
          .send(new Response(HttpStatus.NOT_MODIFIED.code, HttpStatus.NOT_MODIFIED.status, `client not deleted`));
      }
    });
  });
};

// clientxdevday

export const createClientDevDay = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, creating client dev day...`);
  const client_id = Number(req.params.id) || null;
  if (client_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  // Check if the client exists
  database.query(CLIENT_QUERY.SELECT_CLIENT, [client_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client found`));
      return;
    }
    // Client found, check if the Delivery Day exists
    const delivery_day_id = Number(req.body.delivery_day_id) || null;
    if (delivery_day_id == null) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter delivery_day_id is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter delivery_day_id is not valid`));
      return;
    }
    // Check if the delivery day exists
    database.query(DELIVERY_QUERY.SELECT_DEVDAY, [delivery_day_id], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, no delivery day found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no delivery day found`));
        return;
      }
      // Delivery day exists, create the relationship
      database.query(CLIENT_QUERY.CREATE_CLIENTXDEVDAY, [client_id, delivery_day_id], (error, results) => {
        if (error) {
          logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
          return;
        }
        if (!results[0]) {
          logger.error(`${req.method} - ${req.originalUrl}, relation not created, unexpected behavior`);
          res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `client not created, unexpected behavior`));
          return;
        }
        logger.info(`${req.method} - ${req.originalUrl}, relation created`);
        res.status(HttpStatus.CREATED.code)
          .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `relation created between the client ${client_id} and the delivery day ${delivery_day_id}`, results[0]));
      });
    });
  });
};

export const getClientDevDays = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting client dev days...`);
  const client_id = Number(req.params.id) || null;
  if (client_id == null ){
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  // Check if the client exsts
  database.query(CLIENT_QUERY.SELECT_CLIENT, [client_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client found`));
      return;
    }
    // Client found, get the dev days
    database.query(CLIENT_QUERY.SELECT_CLIENT_DEVDAYS, [client_id], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, no dev days found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no dev days found`));
        return;
      }
      logger.info(`${req.method} - ${req.originalUrl}, dev days found`);
      res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `dev days found`, results));
    });
  });
}

export const deleteClientDevDay = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting client dev day...`);
  const client_id = Number(req.params.id) || null;
  if (client_id == null ){
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  // Check if the client exists
  database.query(CLIENT_QUERY.SELECT_CLIENT, [client_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client found`));
      return;
    }
    // Client found, check if the dev day exists
    const delivery_day_id = Number(req.params.devdayid) || null;
    if (delivery_day_id == null ){
      logger.error(`${req.method} - ${req.originalUrl}, the parameter devdayid is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter devdayid is not valid`));
      return;
    }
    // Check if the dev day exists
    database.query(DELIVERY_QUERY.SELECT_DEVDAY, [delivery_day_id], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, no dev day found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no dev day found`));
        return;
      }
      // Dev day found, then try to delete it
      database.query(CLIENT_QUERY.DELETE_CLIENTXDEVDAY, [client_id, delivery_day_id], (error, results) => {
        if (error) {
          logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
          return;
        }
        logger.info(`${req.method} - ${req.originalUrl}, client dev day deleted`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `client dev day deleted`));
      });
    });
  });
};

const CLNTORD_PARAMETER_VALUES = [
  "client_order_id", "client_id", "order_status",
  "order_date", "order_delivery_date"
];

// clientorders
export const getClientOrders = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting client orders...`);
  const parameter = req.body.parameter || "client_id";
  const order = req.body.order || "ASC";
  // Check order values
  if (order !== "ASC" && order !== "DESC") {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter order is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter order is not valid`));
    return;
  }
  // Check parameter values
  if (!CLNTORD_PARAMETER_VALUES.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter parameter is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter parameter is not valid`));
    return;
  }
  database.query(CLIENT_QUERY.SELECT_CLIENTORDERS, (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client orders found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client orders found`));
      return;
    }
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
      logger.error(`${req.method} - ${req.originalUrl}, the parameter pag is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter pag is not valid`));
      return;
    }
    if (page < 1) {
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter pag is not valid`));
      return;
    }
    // Valid pagination parameters
    const startingLimit = (page - 1) * limit;
    database.query(CLIENT_QUERY.SELECT_PAGED_CLIENTORDERS, [parameter, order, startingLimit, limit], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, no client orders found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client orders found`));
        return;
      }
      logger.info(`${req.method} - ${req.originalUrl}, client orders found`);
      res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `client orders found`, { data: results[0], page, numOfPages }));
    });
  });
};

export const getClientOrder = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting client order...`);
  const client_order_id = Number(req.params.id) || null;
  if (client_order_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  // Look for the client order
  database.query(CLIENT_QUERY.SELECT_CLIENTORDER, [client_order_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client order found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client order found`));
      return;
    }
    logger.info(`${req.method} - ${req.originalUrl}, client order found`);
    res.status(HttpStatus.OK.code)
      .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `client order found`, results[0]));
  });
};

const ORDER_STATUS_VALUES = [
  "PENDIENTE", "EN DESPACHO", "COMPLETADO"
]

export const updateClientOrder = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, updating client order...`);
  const client_order_id = Number(req.params.id) || null;
  if (client_order_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  // Check if the client order exists
  database.query(CLIENT_QUERY.SELECT_CLIENTORDER, [client_order_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client order found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client order found`));
      return;
    }
    // Check if the values are valid
    const BODY_PARAMETERS = Object.values(req.body);
    if (BODY_PARAMETERS.length != 1) {
      logger.error(`${req.method} - ${req.originalUrl}, the body is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the body is not valid`));
      return;
    }
    // Check not null values
    if (BODY_PARAMETERS.includes('')) {
      logger.error(`${req.method} - ${req.originalUrl}, the body is not valid, empty values not allowed`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the body is not valid, empty values not allowed`));
      return;
    }
    const status = BODY_PARAMETERS[0];
    if (!ORDER_STATUS_VALUES.includes(status)) {
      logger.error(`${req.method} - ${req.originalUrl}, the body is not valid, invalid status, must be one of ${ORDER_STATUS_VALUES}`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the body is not valid, invalid status, must be one of ${ORDER_STATUS_VALUES}`));
      return;
    }
    // Update the order
    database.query(CLIENT_QUERY.UPDATE_CLIENTORDER, [status, client_order_id], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (results.affectedRows > 0) {
        logger.info(`${req.method} - ${req.originalUrl}, client order updated`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `client order updated`, { client_order_id: client_order_id, new_status: status }));
      } else {
        res.status(HttpStatus.NOT_MODIFIED.code)
          .send(new Response(HttpStatus.NOT_MODIFIED.code, HttpStatus.NOT_MODIFIED.status, `client order not updated`));
      }
    });
  });
};

export const getOrdersOfClient = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting orders of client...`);
  const client_id = Number(req.params.id) || null;
  if (client_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  const parameter = req.body.parameter || "client_id";
  const order = req.body.order || "ASC";
  // Check order values
  if (order != "ASC" && order != "DESC") {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter order is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter order is not valid`));
    return;
  }
  // Check parameter values
  if (!CLNTORD_PARAMETER_VALUES.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter (parameter) is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter (parameter is not) valid`));
    return;
  }
  database.query(CLIENT_QUERY.SELECT_ORDERS_OF_CLIENT, [client_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no orders found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no orders found`));
      return;
    }
    const page = Number(req.body.pag) || 1;
    const limit = Number(req.body.limit) || 10;
    if (limit < 1 || limit > 100) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter limit is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter limit is not valid`));
      return;
    }
    // Calculation of pagination parameters
    let numOfResults = results[0].length;
    let numOfPages = Math.ceil(numOfResults / limit);
    if (page > numOfPages) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter pag is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter pag is not valid`));
      return;
    }
    if (page < 1) {
      logger.error(`${req.method} - ${req.originalUrl}, the parameter pag is not valid`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter pag is not valid`));
      return;
    }
    const startingLimit = (page - 1) * limit;
    database.query(CLIENT_QUERY.SELECT_PAGED_ORDERS_OF_CLIENT, [client_id, parameter, order, startingLimit, limit], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (!results[0]) {
        logger.error(`${req.method} - ${req.originalUrl}, no orders found`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no orders found`));
        return;
      }
      logger.info(`${req.method} - ${req.originalUrl}, orders found`);
      res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `orders found`, { data: results[0], page, numOfPages }));
    });
  });
};

export const deleteClientOrder = (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, deleting client order...`);
  const client_order_id = Number(req.params.id) || null;
  if (client_order_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter id is not valid`));
    return;
  }
  // Check if the client exists
  database.query(CLIENT_QUERY.SELECT_CLIENTORDER, [client_order_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client order found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client order found`));
      return;
    }
    // Delete the client order
    database.query(CLIENT_QUERY.DELETE_CLIENTORDER, [client_order_id], (error, results) => {
      if (error) {
        logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
        return;
      }
      if (results.affectedRows > 0) {
        logger.info(`${req.method} - ${req.originalUrl}, client order deleted`);
        res.status(HttpStatus.OK.code)
          .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `client order deleted`));
      } else {
        logger.error(`${req.method} - ${req.originalUrl}, no client order deleted`);
        res.status(HttpStatus.NOT_FOUND.code)
          .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client order deleted`));
      }
    });
  });
};

export const createClientOrder = async (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, creating client order...`);
  const client_id = Number(req.params.id) || null;
  if (client_id == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter client_id or order_id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter client_id or order_id is not valid`));
    return;
  }
  // Check if the client exists
  let clientResultSet = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.SELECT_CLIENT, [client_id], (error, results) => {
    if (error) {
      logger.error(`${req.method} - ${req.originalUrl}, error executing query: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error executing query'));
      return;
    }
    if (!results[0]) {
      logger.error(`${req.method} - ${req.originalUrl}, no client found`);
      res.status(HttpStatus.NOT_FOUND.code)
        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `no client found`));
      return;
    }
    resolve(results[0]);
  }));
  const actualClient = Object.values(clientResultSet);
  const paramProducts = req.body.products || null;
  if (paramProducts == null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter products is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `the parameter products is not valid`));
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
  // Check if every element is a valid tuple (product, quantity)
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
    // Check if the product exists in stock
    let result = await getProductInStock(product.product_id);
    if (result.length == 0) {
      logger.error(`${req.method} - ${req.originalUrl}, the product ${product.product_id} does not exist in the stock`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The product ${product.product_id} does not exist in the stock`));
      return;
    }
    productsInStock.push(Object.values(result[0]));
  }
  // Status of the order (if there is any suficient stock, the order will be marked as "PENDIENTE")
  let status = 'EN DESPACHO';
  // Get the main information for each product
  const productsInfo = [];
  for (let i in productsInStock) {
    const product_id = productsInStock[i][0];
    let result = await getProduct(product_id);
    if (result.length == 0) {
      logger.error(`${req.method} - ${req.originalUrl}, the product ${product_id} does not exist`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The product ${product_id} does not exist`));
      return;
    }
    // Check if the product is available
    if (result[0].is_available == "NO") {
      logger.error(`${req.method} - ${req.originalUrl}, the product ${product_id} is not available`);
      res.status(HttpStatus.BAD_REQUEST.code)
        .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The product ${product_id} is not available`));
      return;
    }
    // Check if the product in stock is less then the solicited amount
    if (productsInStock[i][1] < products[i].quantity) {
      status = 'PENDIENTE';
    }
    productsInfo.push(Object.values(result[0]));
  }
  let result = await auxOpenClientOrder(client_id, status);
  let client_order_id = Object.values(result[0])[0];
  let clientResult = await auxGetClientOrder(client_order_id);
  const client_order = Object.values(clientResult);
  // Let create the details
  for (let i in productsInfo) {
    const product_id = productsInfo[i][0];
    const quantity = products[i].quantity;
    let result = await auxCreateCltOrdDet(client_order_id, product_id, quantity);
  }
  // Send the response
  res.status(HttpStatus.CREATED.code)
    .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, `The order was created successfully`, { order_satus: client_order[2], client_order_id: client_order[0], delivery_date: client_order[4] }));
};

const PARAMETER_CLIENTORDERDETAILS = [
  "product_id", "product_name", "quantity"
];

export const getDetailsOfClientOrder = async (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting details of client order...`);
  const client_order_id = req.params.id || null;
  if (client_order_id === null) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter id is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The parameter id is not valid`));
    return;
  }
  // Check if the client order exists
  let result = await auxGetClientOrder(client_order_id);
  logger.info(`${result.length}`);
  if (result.message) {
    logger.error(`${req.method} - ${req.originalUrl}, the client order ${client_order_id} does not exist`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The client order ${client_order_id} does not exist`));
    return;
  }
  if (result.length == 0) {
    logger.error(`${req.method} - ${req.originalUrl}, the client order ${client_order_id} does not exist`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The client order ${client_order_id} does not exist`));
    return;
  }
  const client_order = Object.values(result);
  // Pagination parameters
  const parameter = req.body.parameter || "product_id";
  const order = req.body.order || "ASC";
  // Validation of pagination parameters
  if (!PARAMETER_CLIENTORDERDETAILS.includes(parameter)) {
    logger.error(`${req.method} - ${req.originalUrl}, the parameter ${parameter} is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The parameter ${parameter} is not valid`));
    return;
  }
  if (order !== "ASC" && order !== "DESC") {
    logger.error(`${req.method} - ${req.originalUrl}, the order ${order} is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The order ${order} is not valid`));
    return;
  }
  // Get the details of the client order
  result = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.SELECT_DETAILS_OF_CLIENTORDER, [client_order_id], (err, result) => {
    if (err) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting the details of the client order ${client_order_id}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Error getting the details of the client order ${client_order_id}`));
      return;
    }
    resolve(result);
  }));
  if (!result[0]) {
    logger.error(`${req.method} - ${req.originalUrl}, the client order ${client_order_id} does not have details`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The client order ${client_order_id} does not have details`));
    return;
  }
  // Check pagination parameters
  const page = Number(req.body.pag) || 1;
  const limit = Number(req.body.limit) || 10;
  if (limit < 1 || limit > 100) {
    logger.error(`${req.method} - ${req.originalUrl}, the limit ${limit} is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The limit ${limit} is not valid`));
    return;
  }
  // Calculation of pagination parameters
  let numOfResults = result.length;
  let numOfPages = Math.ceil(numOfResults / limit);
  if (page < 1 || page > numOfPages) {
    logger.error(`${req.method} - ${req.originalUrl}, the page ${page} is not valid`);
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `The page ${page} is not valid`));
    return;
  }
  result = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.SELECT_PAGED_DETAILS_OF_CLIENTORDER, [client_order_id, parameter, order, page, limit], (err, result) => {
    if (err) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting the details of the client order ${client_order_id}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Error getting the details of the client order ${client_order_id}`));
      return;
    }
    resolve(result);
  }));
  // Info retrieved successfully
  logger.info(`${req.method} - ${req.originalUrl}, the details of the client order ${client_order_id} were retrieved successfully`);
  res.status(HttpStatus.OK.code)
    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `The details of the client order ${client_order_id} were retrieved successfully`, { data: result[0], page, numOfPages }));
}

let auxCreateCltOrdDet = async (client_order_id, product_id, quantity) => {
  let result = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.CREATE_CLIENTORDERDETAIL, [client_order_id, product_id, quantity], (err, results) => {
    if (err) {
      logger.error(`Error during query: ${err}`)
      reject(err);
    } else {
      resolve(results);
    }
  }));
  return result;
};

let auxOpenClientOrder = async(client_id, order_status) => {
  let result = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.CREATE_CLIENTORDER, [client_id, order_status], (err, results) => {
    if (err) {
      logger.error(`Error creating client order: ${err}`);
      reject(err);
    } else {
      resolve(results[0]);
    }
  }));
  return result;
};

let auxGetClientOrder = async(client_order_id) => {
  let result = await new Promise((resolve, reject) => database.query(CLIENT_QUERY.SELECT_CLIENTORDER, [client_order_id], (error, results) => {
    if (error) {
      logger.error(`Error getting client order: ${error}`);
      reject(error);
    } else {
      if (!results[0]) {
        logger.error(`Client order ${client_order_id} does not exist`);
        reject(new Error(`Client order ${client_order_id} does not exist`));
        return;
      }
      resolve(results[0]);
    }
  }));
  return result;
};

let getProductInStock = async(productId) => {
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