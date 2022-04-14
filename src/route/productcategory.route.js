import express from 'express';
import { createProductCategory, getPagedProductCategories, getProductCategory, updateProductCategory, deleteProductCategory } from '../controller/productcategory.controller.js';
import { createProductSubCat, getProductSubCategory, getPagedProductSubCats, updateProductSubCat, deleteProductSubCat  } from '../controller/productcategory.controller.js';

const productCategoryRoutes = express.Router();

// Product Category routes
productCategoryRoutes.route('/')
  .get(getPagedProductCategories) // Paginated
  .post(createProductCategory);

productCategoryRoutes.route('/:id')
  .get(getProductCategory)
  .put(updateProductCategory)
  .delete(deleteProductCategory);

// Product Sub Category routes
productCategoryRoutes.route('/subCategory')
  .get(getPagedProductSubCats) // Paginated
  .post(createProductSubCat);

productCategoryRoutes.route('/subCategory/:id')
  .get(getProductSubCategory)
  .put(updateProductSubCat)
  .delete(deleteProductSubCat);

export default productCategoryRoutes;