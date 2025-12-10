import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentChat: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearChat: () => {
      return initialState;
    },
  },
});

export const { setCurrentChat, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
