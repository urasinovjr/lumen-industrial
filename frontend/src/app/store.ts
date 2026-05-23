import { configureStore } from '@reduxjs/toolkit'
import productsReducer from '../entities/product/productsSlice'
import cartReducer from '../entities/cart/cartSlice'
import ordersReducer from '../entities/order/ordersSlice'
import adminReducer from '../entities/admin/adminSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    admin: adminReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
