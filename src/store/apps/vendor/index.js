import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Fetch Data
export const fetchData = createAsyncThunk('appVendors/fetchData', async params => {
  const response = await axios.get('/api/vendor-list/', {
    params
  })
  response.data.data.map((e, index) => {
    e.index = index + 1
    e.id = e._id
  })

  return response.data
})


export const appVendorsSlice = createSlice({
  name: 'appVendors',
  initialState: {
    data: [],
    params: {},
    total: 0
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

export default appVendorsSlice.reducer
