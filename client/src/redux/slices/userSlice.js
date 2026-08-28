import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData:null
  },
  reducers: {
    setUserdata: (state, action) => {
      state.userData = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setUserdata } = userSlice.actions

export default userSlice.reducer