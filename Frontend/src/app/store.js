import { configureStore } from '@reduxjs/toolkit';
import employeesReducer from '../features/employeesDetails/employeesSlice';
import authReducer from "../features/auth/authSlice";
import admminReducer from "../features/auth/adminSlice";
import employeeReducer from "../features/auth/employeeSlice";
import emailReducer from "../features/verify/emailVerify";

export const store = configureStore({
  reducer: {
    employeeDetails: employeesReducer,
    auth:authReducer,
    admin:admminReducer,
    employee:employeeReducer,
    verifcation:emailReducer,
  },
});
