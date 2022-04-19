const DRIVER_QUERY = {
  CREATE_DRIVER: 'CALL create_driver(?, ?, ?, ?, ?)',
  UPDATE_DRIVER: 'CALL upd_driver(?, ?, ?, ?, ?, ?)',
  SELECT_PAGED_DRIVERS: 'CALL getp_drivers(?, ?, ?, ?)',
  SELECT_DRIVERS: 'SELECT * FROM Driver',
  SELECT_DRIVER: 'SELECT * FROM Driver WHERE driver_id = ?',
  DELETE_DRIVER: 'DELETE FROM Driver WHERE driver_id = ?',
  COMPLETE_CLIENTORDER: 'assign_driverToClientOrder',
  SELECT_ZONE_KILOMETERS: 'CALL get_zoneKilometers(?)'
};

export default DRIVER_QUERY;