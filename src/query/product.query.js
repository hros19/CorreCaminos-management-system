const PRODUCT_QUERY = {
  CREATE_PRODUCT: 'CALL create_product(?, ?, ?, ?, ?)', // c
  SELECT_PRODUCT: 'SELECT * FROM Product WHERE product_id = ?',
  SELECT_PRODUCTS: 'SELECT * FROM Product',
  SELECT_PAGED_PRODUCTS: 'CALL getp_products(?, ?, ?, ?)',
  UPDATE_PRODUCT: 'CALL upd_product(?, ?, ?, ?, ?)', // c
  DELETE_PRODUCT: 'DELETE FROM Product WHERE product_id = ?'
};

export default PRODUCT_QUERY;