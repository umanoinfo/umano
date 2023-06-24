// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

export const fetchData = createAsyncThunk('appPayroll/fetchData', async params => {
  const response = await axios.get('/api/payroll/', {
    params
  })
  response.data.data.map((e, index) => {
    e.index = index + 1
    e.id = e._id
  })

  return response.data
})

export const appPayrollSlice = createSlice({
  name: 'appPayroll',
  initialState: {
    data: [],
    total: 0,
    params: {},
    selected: {}
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload.data
      state.params = action.payload.params
      state.selected = action.payload.selected
      state.total = action.payload.data.length
    })
  }
})

export default appPayrollSlice.reducer
