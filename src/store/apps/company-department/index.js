// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

export const fetchDepartmentData = createAsyncThunk('appRoles/fetchData', async params => {
  const response = await axios.get('/api/company-department/', {
    params
  })
  response.data.data.map((e, index) => {
    e.index = index + 1
    e.id = e._id
    if(e?.user_info && e?.user_info?.length > 0)
      e.manager = e.user_info[0].firstName + ' ' + e.user_info[0].middleName + ' ' + e.user_info[0].lastName ; 
  })

  return response.data
})

export const appDepartmentSlice = createSlice({
  name: 'appRoles',
  initialState: {
    data: [],
    total: 0,
    params: {}
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchDepartmentData.fulfilled, (state, action) => {
      state.data = action.payload.data
      state.params = action.payload.params
      state.total = action.payload.data.length
    })
  }
})

export default appDepartmentSlice.reducer
