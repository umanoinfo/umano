// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

export const fetchData = createAsyncThunk('appEmployeeCME/fetchData', async params => {
  const response = await axios.get('/api/cme/employee-cmes', {
    params
  })
  response.data.data.map((e, index) => {
    e.index = index + 1
    e.id = e._id
    e.amount = Number(e.amount) ; 
  });

  return response.data
})

export const appEmployeeCMESlice = createSlice({
  name: 'appEmployeeCME',
  initialState: {
    data: [],
    total: 0,
    params: {}
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload.data
      state.params = action.payload.params
      state.total = action.payload.data.length
    })
  }
})

export default appEmployeeCMESlice.reducer
