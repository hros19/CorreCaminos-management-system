import express from 'express';
import { createProductCategory, getPagedProductCategories, getProductCategory, updateProductCategory, deleteProductCategory } from '../controller/productcategory.controller.js';
import { createProductSubCat, getProductSubCategory, getPagedProductSubCats, updateProductSubCat, deleteProductSubCat  } from '../controller/productcategory.controller.js';

const productCategoryRoutes = express.Router();

// Product Category routes
productCategoryRoutes.route('/')
  .get(getPagedProductCategories) // Tested
  .post(createProductCategory); // Tested

// Product Sub Category routes
productCategoryRoutes.route('/subCategory')
  .get(getPagedProductSubCats) // Tested
  .post(createProductSubCat); // Tested

productCategoryRoutes.route('/subCategory/:id')
  .get(getProductSubCategory) // Tested
  .put(updateProductSubCat) // Tested
  .delete(deleteProductSubCat);  // Tested

productCategoryRoutes.route('/:id')
  .get(getProductCategory) // Tested
  .put(updateProductCategory) // Tested
  .delete(deleteProductCategory); // Tested

export default productCategoryRoutes;