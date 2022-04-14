const SUPPLIER_QUERY = {
  CREATE_SUPPLIER: 'CALL create_supplier(?, ?, ?, ?, ?)',
  UPDATE_SUPPLIER: 'CALL upd_supplier(?, ?, ?, ?, ?, ?)',
  DELETE_SUPPLIER: 'DELETE FROM Supplier WHERE id = ?',
  SELECT_SUPPLIER: 'SELECT * FROM Supplier WHERE id = ?',
  SELECT_SUPPLIERS: 'SELECT * FROM Supplier',
  SELECT_PAGED_SUPPLIERS: 'CALL getp_suppliers(?, ?, ?, ?)',
  GET_PAGED_PRODUCTS_BY_SUPPLIER: 'CALL getp_sup_products(?, ?, ?, ?, ?)',
  GET_PRODUCTS_BY_SUPPLIER: 'CALL get_sup_products(?)'
};

export default SUPPLIER_QUERY;