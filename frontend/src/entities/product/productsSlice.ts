import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  getProduct,
  listCategories,
  listProducts,
} from '../../shared/api/productsApi'
import type { ListProductsParams } from '../../shared/api/productsApi'
import type { Category, Product } from './types'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

type ProductsState = {
  items: Product[]
  current: Product | null
  categories: Category[]
  total: number
  page: number
  limit: number
  search: string
  categoryId: number | null
  listStatus: Status
  listError: string | null
  currentStatus: Status
  currentError: string | null
  categoriesStatus: Status
}

const initialState: ProductsState = {
  items: [],
  current: null,
  categories: [],
  total: 0,
  page: 1,
  limit: 8,
  search: '',
  categoryId: null,
  listStatus: 'idle',
  listError: null,
  currentStatus: 'idle',
  currentError: null,
  categoriesStatus: 'idle',
}

export const fetchProducts = createAsyncThunk(
  'products/fetchList',
  async (params: ListProductsParams) => {
    return listProducts(params)
  },
)

export const fetchProduct = createAsyncThunk(
  'products/fetchOne',
  async (id: number) => {
    return getProduct(id)
  },
)

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    return listCategories()
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
      state.page = 1
    },
    setCategoryId(state, action: PayloadAction<number | null>) {
      state.categoryId = action.payload
      state.page = 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload.products
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.error.message ?? 'Не удалось загрузить товары'
      })
      .addCase(fetchProduct.pending, (state) => {
        state.currentStatus = 'loading'
        state.currentError = null
        state.current = null
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.currentStatus = 'failed'
        state.currentError = action.error.message ?? 'Товар не найден'
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesStatus = 'failed'
      })
  },
})

export const { setPage, setSearch, setCategoryId } = productsSlice.actions
export default productsSlice.reducer
