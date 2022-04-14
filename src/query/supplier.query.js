const SUPPLIER_QUERY = {
  CREATE_SUPPLIER: 'CALL create_supplier(?, ?, ?, ?, ?)',
  UPDATE_SUPPLIER: 'CALL upd_supplier(?, ?, ?, ?, ?, ?)',
  DELETE_SUPPLIER: 'DELETE FROM Supplier WHERE id = ?',
  SELECT_SUPPLIER: 'SELECT * FROM Supplier WHERE id = ?',
  SELECT_SUPPLIERS: 'SELECT * FROM Supplier',
  SELECT_PAGED_SUPPLIERS: 'CALL getp_suppliers(?, ?, ?, ?)'
};

export default SUPPLIER_QUERY;