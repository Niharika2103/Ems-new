import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceSaveallApi,AttendanceFetchAllApi } from "../../api/authApi";

export const AttendanceSaveall = createAsyncThunk("attendance/saveall", async ({ employeeId, projectId, formData }, thunkAPI) => {
  try {
    const res = await AttendanceSaveallApi( employeeId, projectId, formData );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})

export const AttendanceFetchAll = createAsyncThunk("attendance/fetchall", async (_, thunkAPI) => {
  try {
    const res = await AttendanceFetchAllApi(  );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})


const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendance: null,  
    attedance:[],
      loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.attendance = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminRegister.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminRegister.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(adminRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = attendanceSlice.actions;
export default attendanceSlice.reducer;
