import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    isSessionLoading: true,
  },
  reducers: {
    setUserdata: (state, action) => {
      state.userData = action.payload
    },
    setSessionLoading: (state, action) => {
      state.isSessionLoading = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setUserdata, setSessionLoading } = userSlice.actions

export default userSlice.reducer
