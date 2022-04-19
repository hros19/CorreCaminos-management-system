import database from '../config/mysql.config.js';
import HttpStatus from '../config/http.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import REPORT_QUERY from '../query/report.query.js';

export const getPendingReportsByDate = async (req, res) => {
  logger.info(`${req.method} - ${req.originalUrl}, getting reports by a date`);
  const givenDate = new Date(req.body.date) || null;
  if (givenDate.toLocaleDateString() == "Invalid Date" || givenDate == null) {
    res.status(HttpStatus.BAD_REQUEST.code)
      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid date format'));
    return;
  }
  givenDate.setDate(givenDate.getDate() + 1);
  logger.info(`>> ${givenDate.toLocaleDateString("fr-CA")}`);
  // Valid date given, then get reports
  let reportsObject = await new Promise((resolve, reject) => database.query(REPORT_QUERY.SELECT_REPORT_BY_DATE, [givenDate.toLocaleDateString("fr-CA")], (err, result) => {
    if (err) {
      logger.error(`${req.method} - ${req.originalUrl}, error getting reports by a date`);
      reject(new Error(err));
    } else {
      logger.info(`${req.method} - ${req.originalUrl}, successfully getting reports by a date`);
      resolve(result[0]);
    }
  }));
  if (reportsObject instanceof Error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error getting reports by a date'));
    return;
  }
  logger.info(`${JSON.stringify(reportsObject)}`);
  if (reportsObject[0] == undefined || reportsObject[0] == null) {
    res.status(HttpStatus.OK.code)
      .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'No reports found', []));
    return;
  }
  let reports = Object.values(reportsObject);
  let unreadyReports = [];
  for (let i in reports) {
    logger.info(`>>> ${reports[i].order_status == "EN DESPACHO"}`)
    if (reports[i].order_status == "EN DESPACHO") {
      unreadyReports.push(reports[i]);
    }
  }
  if (unreadyReports == []) {
    res.status(HttpStatus.OK.code)
      .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'No pending reports found', []));
    return;
  }
  // Send the response
  res.status(HttpStatus.OK.code)
    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Pending reports found', unreadyReports));
};