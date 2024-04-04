import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Fetch Users
export const fetchData = createAsyncThunk('appUsers/fetchData', async params => {
  const response = await axios.get('/api/company-user/', {
    params
  })
  response.data.data.map((e, index) => {
    e.index = index + 1
    e.id = e._id
    if (!e.roles_info) {
      e.roles_info = []
    }
  })

  return response.data
})

// ** Add User
export const addUser = createAsyncThunk('appUsers/addUser', async (data, { getState, dispatch }) => {
  const response = await axios
    .post('/api/company-user/add-user', {
      data
    })
    .then(
      res => {
        dispatch(fetchData(getState().user.params))
      },
      err => {
        return 'errrrrrrr'
      }
    )
})

const updateUser = createAsyncThunk('users/update', async (userData, { rejectWithValue }) => {
  const { id, ...fields } = userData
  try {
    const response = await userAPI.updateById(id, fields)

    return response.data.user
  } catch (err) {
    if (!err.response) {
      throw err
    }

    return rejectWithValue(err.response.data)
  }
})

// ** Delete User
export const deleteUser = createAsyncThunk('appUsers/deleteUser', async (id, { getState, dispatch }) => {
  const response = await axios.delete('/api/company-user/delete-user', {
    data: id
  })
  dispatch(fetchData(getState().user.params))

  return response.data
})

export const appUsersSlice = createSlice({
  name: 'appUsers',
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

export default appUsersSlice.reducer
