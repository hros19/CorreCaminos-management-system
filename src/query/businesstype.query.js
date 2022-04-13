const BUSINESSTYPE_QUERY = {
  CREATE_BUSINESSTYPE: 'CALL create_buss_type(?)',
  SELECT_PAGED_BUSINESSTYPES: 'CALL getp_buss_types(?, ?, ?)',
  SELECT_BUSINESSTYPES: 'SELECT * FROM BusinessType',
  SELECT_BUSINESSTYPE: 'SELECT * FROM BusinessType WHERE business_type_id = ?',
  UPDATE_BUSINESSTYPE: 'CALL upd_business_type(?, ?)',
  DELETE_BUSINESSTYPE: 'DELETE FROM BusinessType WHERE business_type_id = ?'
};

export default BUSINESSTYPE_QUERY;