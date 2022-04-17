const PRODUCTCATEGORY_QUERY = {
  CREATE_PRODUCTCATEGORY: 'CALL create_prodCat(?)',
  SELECT_PRODUCTCATEGORY: 'SELECT * FROM ProductCategory WHERE product_cat_id = ?',
  SELECT_PRODUCTCATEGORIES: 'SELECT * FROM ProductCategory',
  SELECT_PAGED_PRODUCTCATEGORIES: 'CALL getp_prodCategories(?, ?, ?, ?)',
  UPDATE_PRODUCTCATEGORY: 'CALL upd_prodCategory(?, ?)',
  DELETE_PRODUCTCATEGORY: 'DELETE FROM ProductCategory WHERE product_cat_id = ?',
  // Subcategory queries
  CREATE_PRODUCTSUBCATEGORY: 'CALL create_prodSubCat(?, ?)',
  SELECT_PRODUCTSUBCATEGORY: 'SELECT * FROM ProductSubCategory WHERE product_subcat_id = ?',
  SELECT_PRODUCTSUBCATEGORIES: 'SELECT * FROM ProductSubCategory',
  SELECT_PAGED_PRODUCTSUBCATEGORIES: 'CALL getp_prodSubCategories(?, ?, ?, ?)',
  UPDATE_PRODUCTSUBCATEGORY: 'CALL upd_prodSubCategory(?, ?)',
  DELETE_PRODUCTSUBCATEGORY: 'DELETE FROM ProductSubCategory WHERE product_subcat_id = ?'
};

export default PRODUCTCATEGORY_QUERY;