import express from 'express';
import { createProductCategory, getPagedProductCategories, getProductCategory, updateProductCategory, deleteProductCategory } from '../controller/productcategory.controller';

const productCategoryRoutes = express.Router();

productCategoryRoutes.route('/')
  .get(getPagedProductCategories) // Paginated
  .post(createProductCategory);

productCategoryRoutes.route('/:id')
  .get(getProductCategory)
  .put(updateProductCategory)
  .delete(deleteProductCategory);

export default productCategoryRoutes;