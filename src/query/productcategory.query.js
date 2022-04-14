const PRODUCTCATEGORY_QUERY = {
  CREATE_PRODUCTCATEGORY: 'CALL create_prodCat(?)',
  SELECT_PRODUCTCATEGORY: 'SELECT * FROM ProductCategory WHERE product_cat_id = ?',
  SELECT_PRODUCTCATEGORIES: 'SELECT * FROM ProductCategory',
  SELECT_PAGED_PRODUCTCATEGORIES: 'CALL getp_prodCategories(?, ?, ?, ?)',
  UPDATE_PRODUCTCATEGORY: 'CALL upd_prodCategory(?, ?)',
  DELETE_PRODUCTCATEGORY: 'DELETE FROM ProductCategory WHERE product_cat_id = ?'
};

export default PRODUCTCATEGORY_QUERY;