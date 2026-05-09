import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as ordersApi from '../../shared/api/ordersApi'
import type { CartState } from './types'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

type CartSliceState = CartState & {
  status: Status
  error: string | null
  mutating: boolean
}

const initialState: CartSliceState = {
  items: [],
  total: 0,
  status: 'idle',
  error: null,
  mutating: false,
}

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  return ordersApi.getCart()
})

export const addToCart = createAsyncThunk(
  'cart/add',
  async (payload: { productId: number; quantity: number }) => {
    return ordersApi.addCartItem(payload.productId, payload.quantity)
  },
)

export const setCartItemQuantity = createAsyncThunk(
  'cart/setQuantity',
  async (payload: { itemId: number; quantity: number }) => {
    return ordersApi.updateCartItem(payload.itemId, payload.quantity)
  },
)

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (itemId: number) => {
    return ordersApi.removeCartItem(itemId)
  },
)

export const clearCart = createAsyncThunk('cart/clear', async () => {
  return ordersApi.clearCart()
})

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart(state) {
      state.items = []
      state.total = 0
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Не удалось загрузить корзину'
      })

    const mutations = [addToCart, setCartItemQuantity, removeFromCart, clearCart]
    for (const thunk of mutations) {
      builder
        .addCase(thunk.pending, (state) => {
          state.mutating = true
          state.error = null
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.mutating = false
          state.status = 'succeeded'
          state.items = action.payload.items
          state.total = action.payload.total
        })
        .addCase(thunk.rejected, (state, action) => {
          state.mutating = false
          state.error = action.error.message ?? 'Не удалось обновить корзину'
        })
    }
  },
})

export const { resetCart } = cartSlice.actions
export default cartSlice.reducer
