export type { Category, Product } from './types'
export {
  fetchProducts,
  fetchProduct,
  fetchCategories,
  setPage,
  setSearch,
  setCategoryId,
} from './productsSlice'
export { default as productsReducer } from './productsSlice'
