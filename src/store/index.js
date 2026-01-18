import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
        auth: authReducer
    },
  })
}
