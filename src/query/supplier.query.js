const SUPPLIER_QUERY = {
  CREATE_SUPPLIER: 'CALL create_supplier(?, ?, ?, ?, ?)',
  UPDATE_SUPPLIER: 'CALL upd_supplier(?, ?, ?, ?, ?, ?)',
  DELETE_SUPPLIER: 'DELETE FROM Supplier WHERE supplier_id = ?',
  SELECT_SUPPLIER: 'SELECT * FROM Supplier WHERE supplier_id = ?',
  SELECT_SUPPLIERS: 'SELECT * FROM Supplier',
  SELECT_PAGED_SUPPLIERS: 'CALL getp_suppliers(?, ?, ?, ?)',
  GET_PAGED_PRODUCTS_BY_SUPPLIER: 'CALL getp_sup_products(?, ?, ?, ?, ?)',
  GET_PRODUCTS_BY_SUPPLIER: 'CALL get_sup_products(?)',
  // Supplier Order queries
  CREATE_SUPPLIER_ORD: 'CALL create_supOrder(?)',
  SELECT_PAGED_ORDERS_BY_SUP: 'CALL getp_ordersBySup(?, ?, ?, ?, ?)',
  SELECT_ORDERS_BY_SUP: 'CALL get_ordersBySup(?)',
  GET_LAST_ORDER_OF_SUP: 'SELECT getd_lastOrderSup(?) AS lastOrder',
  SELECT_SUPPLIER_ORDER: 'SELECT * FROM SupplierOrder WHERE supplier_order_id = ?',
  // Supplier Order Detail query
  CREATE_SUPPLIER_ORD_DETAIL: 'CALL create_supOrdDet(?, ?, ?)'
};

export default SUPPLIER_QUERY;