const VEHICLE_QUERY = {
  GET_TOTAL_VEHICLES: 'SELECT COUNT(*) FROM Vehicle',
  CHECK_VEHICLE_STATUS: 'CALL get_veh_status(?)', // set
  FILL_VEHICLE_TANK: 'CALL fillVehicleTank(?, ?)',
  CREATE_VEHICLE: 'CALL create_vehicle(?, ?, ?, ?, ?, ?)', // sets
  SELECT_PAGED_VEHICLES: 'CALL getp_vehicles(?, ?, ?, ?)', // sets
  SELECT_VEHICLE: 'SELECT * FROM Vehicle WHERE vehicle_id = ?', // set
  SELECT_VEHICLES: 'SELECT * FROM Vehicle', // sets
  UPDATE_VEHICLE: 'CALL upd_vehicle_details(?, ?, ?, ?, ?)',
  DELETE_VEHICLE: 'DELETE FROM Vehicle WHERE vehicle_id = ?',
  REGISTER_KILOMETERS: 'CALL reg_kilometers(?, ?)',
  REGISTER_MAINTENANCELOG: 'CALL create_maint_log(?, ?)', //set
  UPDATE_MAINTENANCELOG: 'CALL upd_maint_log(?, ?)',
  GETP_MAINTENANCELOGS_OF_VEHICLE: 'CALL getp_veh_maint_logs(?, ?, ?)', // sets
  GET_MAINTENANCELOGS_OF_VEHICLE: 'CALL get_veh_maint_logs(?)',
  SELECT_MAINTENANCELOG: 'SELECT * FROM MaintenanceLog WHERE maintenance_id = ?'
};

export default VEHICLE_QUERY;