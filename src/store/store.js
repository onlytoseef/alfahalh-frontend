import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import classReducer from "./slices/classSlice";
import studentReducer from "./slices/studentSlice";
import staffReducer from "./slices/staffSlice";
import authReducer from "./slices/authSlice";

const store = configureStore({
  reducer: {
    users: userReducer,
    classes: classReducer,
    students: studentReducer,
    staff: staffReducer,
    auth: authReducer,
  },
});

export default store;
