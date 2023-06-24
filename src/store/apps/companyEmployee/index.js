// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

export const fetchData = createAsyncThunk('appEmployee/fetchData', async params => {
  const response = await axios.get('/api/company-employee/', {
    params
  })
  response.data.data.map((e, index) => {
    e.index = index + 1
    e.id = e._id
  })

  return response.data
})

// export const getEmployee = createAsyncThunk('appEmployee/getEmployee', async (id, { getState, dispatch }) => {
//   const response = await axios.delete('/apps/invoice/delete', {
//     data: id
//   })
//   await dispatch(fetchData(getState().invoice.params))

//   return response.data
// })

export const deleteInvoice = createAsyncThunk('appInvoice/deleteData', async (id, { getState, dispatch }) => {
  const response = await axios.delete('/apps/invoice/delete', {
    data: id
  })
  await dispatch(fetchData(getState().invoice.params))

  return response.data
})

export const appEmployeeSlice = createSlice({
  name: 'appEmployee',
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

export default appEmployeeSlice.reducer
