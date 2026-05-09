import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as ordersApi from '../../shared/api/ordersApi'
import type { CheckoutForm, Order } from './types'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

type OrdersState = {
  current: Order | null
  status: Status
  error: string | null
}

const initialState: OrdersState = {
  current: null,
  status: 'idle',
  error: null,
}

export const submitOrder = createAsyncThunk(
  'orders/submit',
  async (form: CheckoutForm) => {
    return ordersApi.createOrder(form)
  },
)

export const fetchOrder = createAsyncThunk(
  'orders/fetch',
  async (orderNumber: string) => {
    return ordersApi.getOrder(orderNumber)
  },
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder(state) {
      state.current = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Не удалось оформить заказ'
      })
      .addCase(fetchOrder.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Заказ не найден'
      })
  },
})

export const { clearCurrentOrder } = ordersSlice.actions
export default ordersSlice.reducer
