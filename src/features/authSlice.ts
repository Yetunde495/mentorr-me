// features/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      return {
        ...state,
        user: action.payload, 
      };
    },

    clearUser: () => {
      return initialState; 
    },
  },
});


export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
