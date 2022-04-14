const BUSINESSSTOCK_QUERY = {
  SELECT_PAGED_PRODUCTS_IN_STOCK: 'CALL getp_businessStock(?, ?, ?, ?)',
  SELECT_PRODUCTS_IN_STOCK: 'SELECT * FROM BusinessStock',
  SELECT_PRODUCT_IN_STOCK: 'SELECT * FROM BusinessStock WHERE product_id = ?',
  REGISTER_PRODUCT_IN_STOCK: 'CALL reg_prod_bussStock(?, ?)',
  FILL_PRODUCT_IN_STOCK: 'CALL fill_product_bussStock(?, ?)',
  UNREG_PRODUCT_IN_STOCK: 'CALL unreg_product_bussStock(?, ?)',
  DELETE_PRODUCT_IN_STOCK: 'DELETE FROM BusinessStock WHERE product_id = ?'
};

export default BUSINESSSTOCK_QUERY;