import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as adminApi from '../../shared/api/adminApi'
import type { AdminProfile } from './types'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

type AdminState = {
  token: string | null
  profile: AdminProfile | null
  status: Status
  error: string | null
}

const initialState: AdminState = {
  token: adminApi.getAdminToken(),
  profile: null,
  status: 'idle',
  error: null,
}

export const login = createAsyncThunk(
  'admin/login',
  async (credentials: { login: string; password: string }) => {
    const result = await adminApi.login(credentials.login, credentials.password)
    adminApi.setAdminToken(result.token)
    return result
  },
)

export const fetchMe = createAsyncThunk('admin/me', async () => {
  try {
    return await adminApi.me()
  } catch (error) {
    adminApi.clearAdminToken()
    throw error
  }
})

export const logout = createAsyncThunk('admin/logout', async () => {
  try {
    await adminApi.logout()
  } finally {
    adminApi.clearAdminToken()
  }
})

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.profile = action.payload.admin
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Не удалось войти'
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      .addCase(fetchMe.rejected, (state) => {
        state.token = null
        state.profile = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null
        state.profile = null
        state.status = 'idle'
      })
  },
})

export default adminSlice.reducer
