// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

export const fetchData = createAsyncThunk('appEmployeeLeave/fetchData', async params => {
  const response = await axios.get('/api/employee-leave/', {
    params
  })
  response.data.data.map((e, index) => {
    e.id = e._id;
    e.index = index + 1;
    
    const [dateFrom, timeFrom, ...rFrom] = e.date_from.split('T');
    const [dateTo, timeTo, ...rTo] = e.date_to.split('T');
    if(e.type == 'hourly'){
      e.days =((new Date(dateTo) - new Date(dateFrom))/1000/60/60/24) ;
        
    }
    else
    {
      e.days =((new Date(dateTo) - new Date(dateFrom))/1000/60/60/24)+1;
    }
    const [HdateFrom, HtimeFrom, ...HrFrom] = e.date_from.split('T')
    const [HdateTo, HtimeTo, ...HrTo] = e.date_to.split('T')
    if(e.type == 'hourly'){
      e.hours = Math.round(( (((new Date(e.date_to) - new Date(e.date_from))/1000/60/60/24)+1) - (((new Date(HdateTo) - new Date(HdateFrom))/1000/60/60/24)+1))*24*60)/60
    }
    else{
      e.hours = 0 ; 
    }
    
  })

  return response.data
})

export const appEmployeeLeaveSlice = createSlice({
  name: 'appEmployeeLeave',
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

export default appEmployeeLeaveSlice.reducer
