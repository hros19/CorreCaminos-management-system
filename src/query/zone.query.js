const ZONE_QUERY = {
  CREATE_ZONE: 'CALL create_zone(?)',
  SELECT_PAGE_ZONES: 'CALL getp_zones(?, ?, ?)',
  SELECT_ZONES: 'SELECT * FROM Zone',
  SELECT_ZONE: 'SELECT * FROM Zone WHERE zone_id = ?',
  UPDATE_ZONE: 'CALL upd_zone(? ,?)',
  DELETE_ZONE: 'DELETE FROM Zone WHERE zone_id = ?',
  // Routes
  CREATE_ROUTE: 'CALL create_route(?, ?)',
  SELECT_PAGED_ROUTES: 'CALL getp_routes(?, ?, ?, ?)',
  SELECT_ROUTES: 'SELECT * FROM Route',
  SELECT_ROUTE: 'SELECT * FROM Route WHERE route_id = ?',
  UPDATE_ROUTE: 'CALL upd_route(?, ?, ?)',
  DELETE_ROUTE: 'DELETE FROM Route WHERE route_id = ?',
  // ZoneXroutes
  CREATE_ZONEXROUTE: 'CALL create_zonexroute(?, ?)',
  SELECT_PAGED_ZONE_ROUTES: 'CALL getp_zone_routes(?, ?, ?, ?, ?)',
  SELECT_ZONE_ROUTES: 'CALL get_zone_routes(?)',
  DELETE_ZONEXROUTE: 'CALL rem_zonexroute(?, ?)'
};

export default ZONE_QUERY;