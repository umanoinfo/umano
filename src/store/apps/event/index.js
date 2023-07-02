// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

export const fetchData = createAsyncThunk('appEvent/fetchData', async params => {
  const response = await axios.get('/api/event/', {
    params
  })
  response.data.data.map((e, index) => {
    e.id = e._id
    e.index = index + 1
  })

  return response.data
})

export const appEventSlice = createSlice({
  name: 'appEmployee',
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

export default appEventSlice.reducer
