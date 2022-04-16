const DELIVERY_QUERY = {
  // DeliveryDays
  SELECT_DEVDAY: 'SELECT * FROM DeliveryDay WHERE dev_day_id = ?',
  SELECT_DEVDAYS: 'SELECT * FROM DeliveryDay',
  SELECT_PAGED_DEVDAYS: 'CALL getp_dev_days(?, ?, ?)',
  UPDATE_DEVDAY: 'CALL upd_dev_day(? ,?)',
  DELETE_DEVDAY: 'DELETE FROM DeliveryDay WHERE dev_day_id = ?',
  // DeliveryIntervals
  SELECT_DEVINTERVALS: 'SELECT * FROM DeliveryInterval',
  SELECT_PAGED_DEVINTERVALS: 'CALL getp_dev_intervals(?, ?, ?)',
  SELECT_DEVINTERVAL: 'SELECT * FROM DeliveryInterval WHERE dev_interval_id = ?'
};

export default DELIVERY_QUERY;