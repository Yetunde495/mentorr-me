// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import chatSlice from "@/features/chatSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatSlice,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
