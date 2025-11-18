import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  newChat: false, 
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setNewChat: (state, action) => {
        state.newChat = action.payload;
    },
   
  },
});

export const { setNewChat } = chatSlice.actions;
export default chatSlice.reducer;