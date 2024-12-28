// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

export const fetchData = createAsyncThunk('appAttendance/fetchData', async params => {
  const response = await axios.get('/api/attendance/', {
    params
  })
  response.data.data.map((e, index) => {
    e.id = e._id
    e.index = index + 1
    let timeStart = new Date('01/01/2007 ' + e.timeIn)
    let timeEnd = new Date('01/01/2007 ' + e.timeOut)
    e.time  = ((timeEnd - timeStart) / 60 / 60 / 1000).toFixed(2) ;
    e.name = e.employee_info?.[0]?.firstName + ' ' + e.employee_info?.[0]?.lastName ;
  })

  return response.data
})

export const appAttendanceSlice = createSlice({
  name: 'appAttendance',
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

export default appAttendanceSlice.reducer
